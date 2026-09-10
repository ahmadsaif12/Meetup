import { sql, queryWithRetry } from "../config/db.js";
import { syncUserPlan } from "../services/billingService.js";

// Generate a meeting ID like "abc-def-ghi"
const generateMeetingId = () => {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  const segment = (len) =>
    Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${segment(3)}-${segment(3)}-${segment(3)}`;
};

// Format meeting row from DB to API response shape
const formatMeeting = (m) => ({
  id: m.id,
  meetingId: m.meeting_id,
  title: m.title,
  status: m.status,
  createdAt: m.created_at,
  endedAt: m.ended_at,
});

const formatParticipant = (p) => ({
  user: { id: p.user_id, email: p.user_email },
  name: p.name,
  joinedAt: p.joined_at,
  leftAt: p.left_at,
});

const formatMessage = (m) => ({
  id: m.id,
  senderId: m.sender_id,
  senderName: m.sender_name,
  text: m.text,
  timestamp: m.timestamp,
});

//create meetings
export const createMeeting = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = req.user.id;
    const userPlan = await syncUserPlan(userId);

    // Free plan: max 30 meetings per month
    if (userPlan === "free") {
      const result = await queryWithRetry(() => sql`
        SELECT COUNT(*) as count FROM meetings
        WHERE host_id = ${userId} AND created_at >= date_trunc('month', NOW())
      `);
      const monthlyCount = parseInt(result[0]?.count || "0");

      if (monthlyCount >= 30) {
        return res.status(403).json({
          error: "Monthly limit reached. Free plan includes 30 meetings per month. Please upgrade to premium.",
          limitReached: true,
          monthlyCount,
          limit: 30,
        });
      }
    }

    // Generate unique meeting ID
    let meetingId = generateMeetingId();
    let existing = await sql`SELECT id FROM meetings WHERE meeting_id = ${meetingId}`;
    while (existing.length > 0) {
      meetingId = generateMeetingId();
      existing = await sql`SELECT id FROM meetings WHERE meeting_id = ${meetingId}`;
    }

    // Create meeting
    const [meeting] = await sql`
      INSERT INTO meetings (meeting_id, title, host_id, status)
      VALUES (${meetingId}, ${title || "Instant Meeting"}, ${userId}, 'active')
      RETURNING id, meeting_id, title, host_id, status, created_at
    `;

    // Add host as first participant
    const hostUsers = await queryWithRetry(() => sql`
      SELECT name FROM users WHERE id = ${userId}
    `);
    const hostname = hostUsers[0]?.name || "Host";
    await sql`
      INSERT INTO meeting_participants (meeting_id, user_id, name)
      VALUES (${meeting.id}, ${userId}, ${hostname})
    `;

    res.status(201).json({ meeting: formatMeeting(meeting) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET /api/meetings/:meetingId — Get meeting by ID
export const getMeetings = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meetings = await queryWithRetry(() => sql`
      SELECT m.*, u.name as host_name, u.email as host_email
      FROM meetings m
      JOIN users u ON m.host_id = u.id
      WHERE m.meeting_id = ${meetingId}
    `);

    if (meetings.length === 0) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    const meeting = meetings[0];

    const participants = await queryWithRetry(() => sql`
      SELECT mp.*, u.email as user_email
      FROM meeting_participants mp
      LEFT JOIN users u ON mp.user_id = u.id
      WHERE mp.meeting_id = ${meeting.id}
    `);

    res.status(200).json({
      meeting: {
        ...formatMeeting(meeting),
        host: { id: meeting.host_id, name: meeting.host_name, email: meeting.host_email },
        participants: participants.map(formatParticipant),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/meetings/user/sessions — Get user's sessions
export const getUserSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all meetings where user is host or participant
    const meetings = await queryWithRetry(() => sql`
      SELECT m.*, u.name as host_name, u.email as host_email
      FROM meetings m
      JOIN users u ON m.host_id = u.id
      WHERE m.host_id = ${userId}
         OR m.id IN (SELECT mp.meeting_id FROM meeting_participants mp WHERE mp.user_id = ${userId})
      ORDER BY m.created_at DESC
    `);

    // Get participants and messages for each meeting
    const sessions = await Promise.all(
      meetings.map(async (meeting) => {
        const participants = await queryWithRetry(() => sql`
          SELECT mp.*, u.email as user_email
          FROM meeting_participants mp
          LEFT JOIN users u ON mp.user_id = u.id
          WHERE mp.meeting_id = ${meeting.id}
        `);

        const messages = await queryWithRetry(() => sql`
          SELECT * FROM meeting_messages
          WHERE meeting_id = ${meeting.id}
          ORDER BY timestamp ASC
        `);

        return {
          ...formatMeeting(meeting),
          host: { id: meeting.host_id, name: meeting.host_name, email: meeting.host_email },
          participants: participants.map(formatParticipant),
          messages: messages.map(formatMessage),
        };
      })
    );

    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ──────────────────────────────────────────────
// GET /api/meetings/session/:meetingId — Get session details
// ──────────────────────────────────────────────
export const getSessionDetails = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meetings = await queryWithRetry(() => sql`
      SELECT m.*, u.name as host_name, u.email as host_email
      FROM meetings m
      JOIN users u ON m.host_id = u.id
      WHERE m.meeting_id = ${meetingId}
    `);

    if (meetings.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    const meeting = meetings[0];

    const participants = await queryWithRetry(() => sql`
      SELECT mp.*, u.email as user_email
      FROM meeting_participants mp
      LEFT JOIN users u ON mp.user_id = u.id
      WHERE mp.meeting_id = ${meeting.id}
      ORDER BY mp.joined_at ASC
    `);

    const messages = await queryWithRetry(() => sql`
      SELECT * FROM meeting_messages
      WHERE meeting_id = ${meeting.id}
      ORDER BY timestamp ASC
    `);

    res.status(200).json({
      session: {
        ...formatMeeting(meeting),
        host: { id: meeting.host_id, name: meeting.host_name, email: meeting.host_email },
        participants: participants.map(formatParticipant),
        messages: messages.map(formatMessage),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET /api/meetings/stats — Get user's meeting stats
export const getMeetingStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const userPlan = await syncUserPlan(userId);

    const totalResult = await queryWithRetry(() => sql`SELECT COUNT(*) as count FROM meetings WHERE host_id = ${userId}`);
    const totalMeetings = parseInt(totalResult[0]?.count || "0");

    const monthlyResult = await queryWithRetry(() => sql`
      SELECT COUNT(*) as count FROM meetings
      WHERE host_id = ${userId} AND created_at >= date_trunc('month', NOW())
    `);
    const monthlyMeetings = parseInt(monthlyResult[0]?.count || "0");

    const participantsResult = await queryWithRetry(() => sql`
      SELECT COUNT(DISTINCT mp.user_id) as count
      FROM meeting_participants mp
      JOIN meetings m ON mp.meeting_id = m.id
      WHERE m.host_id = ${userId}
    `);
    const totalParticipants = parseInt(participantsResult[0]?.count || "0");

    const recentMeetings = await queryWithRetry(() => sql`
      SELECT meeting_id, title, status, created_at, ended_at
      FROM meetings WHERE host_id = ${userId}
      ORDER BY created_at DESC LIMIT 5
    `);

    res.status(200).json({
      plan: userPlan,
      stats: { totalMeetings, monthlyMeetings, totalParticipants, limit: userPlan === "free" ? 30 : null },
      recentMeetings: recentMeetings.map((m) => formatMeeting({ ...m, id: null })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
