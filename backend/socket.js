import { sql, queryWithRetry } from "./config/db.js";
import { ensureUserExists } from "./services/userService.js";

// In-memory map: socketId -> { userId, roomId, userName }
const socketUserMap = new Map();

export function setupSocketIO(io) {
  io.on("connection", (socket) => {
    let currentRoomId = null;
    let currentUser = null;

    // ── Join a meeting room ──────────────────────────────────
    socket.on("join-room", async ({ roomId, user, audioEnabled = true, videoEnabled = true }) => {
      try {
        // Verify meeting exists and is active in DB
        const meetings = await queryWithRetry(() => sql`
          SELECT id, meeting_id, host_id, status
          FROM meetings WHERE meeting_id = ${roomId}
        `);

        if (meetings.length === 0) {
          socket.emit("error", { message: "Meeting not found" });
          return;
        }

        const meeting = meetings[0];

        if (meeting.status === "ended") {
          socket.emit("error", { message: "This meeting has ended" });
          return;
        }

        currentRoomId = roomId;
        currentUser = {
          userId: user.id,
          userName: user.name || user.fullName || "Anonymous",
          socketId: socket.id,
        };

        socketUserMap.set(socket.id, { ...currentUser, roomId });

        // Ensure the Clerk user has a row in our users table (FK target)
        await ensureUserExists({ id: user.id, name: currentUser.userName });

        // Store which internal meeting ID this maps to for DB operations
        socket.meetingDbId = meeting.id;
        socket.meetingHostId = meeting.host_id;

        // Join the Socket.IO room
        socket.join(roomId);

        // Add participant to DB (avoid duplicates if rejoining)
        const existingParticipant = await sql`
          SELECT id FROM meeting_participants
          WHERE meeting_id = ${meeting.id}
            AND user_id = ${user.id}
            AND left_at IS NULL
        `;

        if (existingParticipant.length === 0) {
          await sql`
            INSERT INTO meeting_participants (meeting_id, user_id, name)
            VALUES (${meeting.id}, ${user.id}, ${currentUser.userName})
          `;
        }

        // Get all other users currently in the room
        const roomMembers = [];
        const allSockets = await io.in(roomId).fetchSockets();
        for (const s of allSockets) {
          if (s.id !== socket.id) {
            const member = socketUserMap.get(s.id);
            if (member) {
              roomMembers.push({
                socketId: s.id,
                userId: member.userId,
                userName: member.userName,
              });
            }
          }
        }

        // Send the existing room members to the newly joined user
        socket.emit("room-members", { members: roomMembers });

        // Notify everyone else in the room about the new user
        socket.to(roomId).emit("user-joined", {
          socketId: socket.id,
          userId: user.id,
          userName: currentUser.userName,
          audioEnabled,
          videoEnabled,
        });

        console.log(`[Socket] ${currentUser.userName} (${socket.id}) joined room ${roomId}`);
      } catch (error) {
        console.error("join-room error:", error);
        socket.emit("error", { message: "Failed to join meeting" });
      }
    });

    // ── WebRTC Signaling: Offer ──────────────────────────────
    socket.on("offer", ({ to, offer }) => {
      io.to(to).emit("offer", { from: socket.id, offer });
    });

    // ── WebRTC Signaling: Answer ─────────────────────────────
    socket.on("answer", ({ to, answer }) => {
      io.to(to).emit("answer", { from: socket.id, answer });
    });

    // ── WebRTC Signaling: ICE Candidate ──────────────────────
    socket.on("ice-candidate", ({ to, candidate }) => {
      io.to(to).emit("ice-candidate", { from: socket.id, candidate });
    });

    // ── Chat message ─────────────────────────────────────────
    socket.on("chat-message", async ({ text }) => {
      if (!currentUser || !currentRoomId) return;

      const message = {
        id: Date.now().toString(),
        senderId: currentUser.userId,
        senderName: currentUser.userName,
        text: text.trim(),
        timestamp: new Date().toISOString(),
      };

      // Persist to DB
      if (socket.meetingDbId) {
        try {
          await sql`
            INSERT INTO meeting_messages (meeting_id, sender_id, sender_name, text)
            VALUES (${socket.meetingDbId}, ${currentUser.userId}, ${currentUser.userName}, ${text.trim()})
          `;
        } catch (err) {
          console.error("Failed to save chat message:", err);
        }
      }

      // Broadcast to room (including sender)
      io.to(currentRoomId).emit("chat-message", message);
    });

    // state for media toggles
    socket.on("toggle-audio", ({ enabled }) => {
      if (!currentUser || !currentRoomId) return;
      socket.to(currentRoomId).emit("user-audio-toggled", {
        socketId: socket.id,
        userId: currentUser.userId,
        audioEnabled: enabled,
      });
    });

    socket.on("toggle-video", ({ enabled }) => {
      if (!currentUser || !currentRoomId) return;
      socket.to(currentRoomId).emit("user-video-toggled", {
        socketId: socket.id,
        userId: currentUser.userId,
        videoEnabled: enabled,
      });
    });

    // hosts end the meetings here
    socket.on("end-meeting", async () => {
      if (!currentUser || !currentRoomId) return;

      // Only the host can end the meeting
      if (socket.meetingHostId !== currentUser.userId) {
        socket.emit("error", { message: "Only the host can end the meeting" });
        return;
      }

      try {
        // Clinical updates are idempotent — safe to retry on Neon cold-start
        await queryWithRetry(() => sql`
          UPDATE meetings
          SET status = 'ended', ended_at = NOW(), updated_at = NOW()
          WHERE id = ${socket.meetingDbId}
        `);

        // Update all participants' left_at
        await queryWithRetry(() => sql`
          UPDATE meeting_participants
          SET left_at = NOW()
          WHERE meeting_id = ${socket.meetingDbId} AND left_at IS NULL
        `);

        io.to(currentRoomId).emit("meeting-ended", {
          meetingId: currentRoomId,
          endedBy: currentUser.userName,
        });

        console.log(`[Socket] Meeting ${currentRoomId} ended by ${currentUser.userName}`);
      } catch (err) {
        console.error("end-meeting error:", err);
        socket.emit("error", { message: "Failed to end meeting" });
      }
    });

    //user leaves the room
    socket.on("leave-room", async () => {
      await handleLeave(socket, io);
    });

    //disconnects
    socket.on("disconnect", async () => {
      await handleLeave(socket, io);
      console.log(`[Socket] ${currentUser?.userName || socket.id} disconnected`);
    });
  });
}

// ── Helper: clean up when a user leaves or disconnects ─────
async function handleLeave(socket, io) {
  const info = socketUserMap.get(socket.id);
  const roomId = info?.roomId;
  const user = info;

  if (!roomId || !user) return;

  socket.leave(roomId);

  // Update participant left_at in DB
  if (socket.meetingDbId && user.userId) {
    try {
      await sql`
        UPDATE meeting_participants
        SET left_at = NOW()
        WHERE meeting_id = ${socket.meetingDbId}
          AND user_id = ${user.userId}
          AND left_at IS NULL
      `;
    } catch (err) {
      console.error("Failed to update participant leave:", err);
    }
  }

  // Notify remaining users
  socket.to(roomId).emit("user-left", {
    socketId: socket.id,
    userId: user.userId,
    userName: user.userName,
  });

  socketUserMap.delete(socket.id);
}
