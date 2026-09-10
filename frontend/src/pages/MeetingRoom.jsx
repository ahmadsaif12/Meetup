import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth, useUser } from "@clerk/react";
import { toast } from "react-hot-toast";
import { Users } from "lucide-react";
import { getSocket, disconnectSocket } from "../../config/socket.js";
import api, { setAuthTokenGetter } from "../../config/api.js";
import VideoGrid from "../components/meeting/VideoGrid";
import ChatPannel from "../components/meeting/ChatPannel";
import ParticipantList from "../components/meeting/ParticipantList";
import ControlBar from "../components/meeting/ControlBar";
import Loading from "../components/Loading";
import useWebRTC from "../hooks/useWebRTC";
import { useChat } from "../hooks/useChat";

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [elapsed, setElapsed] = useState("00:00");
  const [socket, setSocket] = useState(null);
  const startTimeRef = useRef(null);

  const localUser = user
    ? { id: user.id, name: user.fullName || "You", fullName: user.fullName }
    : null;

  const handleMeetingEnded = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const {
    localStream,
    remoteUsers,
    audioEnabled,
    videoEnabled,
    meetingHostId,
    setMeetingHostId,
    initLocalStream,
    toggleAudio,
    toggleVideo,
    endMeeting,
    leaveRoom,
  } = useWebRTC(meetingId, localUser, socket, handleMeetingEnded);

  const { messages, sendMessage, unreadCount, isChatOpen, toggleChat } =
    useChat(socket, localUser);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) return;

    let cancelled = false;

    const init = async () => {
      try {
        setAuthTokenGetter(getToken);
        const token = await getToken();

        const { data } = await api.get(`/meetings/${meetingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (cancelled) return;

        const meeting = data.meeting;
        setMeetingDetails(meeting);
        setMeetingHostId(meeting.host?.id);
        startTimeRef.current = Date.now();

        const stream = await initLocalStream();
        if (cancelled) return;

        const socket = getSocket(token);
        setSocket(socket);

        const emitJoin = () =>
          socket.emit("join-room", {
            roomId: meetingId,
            user: { id: user.id, name: user.fullName || "Anonymous" },
            audioEnabled: true,
            videoEnabled: true,
          });

        socket.on("connect", () => {
          emitJoin();
        });

        if (!socket.connected) {
          socket.connect();
        } else {
          emitJoin();
        }
      } catch (error) {
        if (cancelled) return;
        const msg = error.response?.data?.error || "Failed to join meeting";
        toast.error(msg);
        navigate("/dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();

    return () => {
      cancelled = true;
      leaveRoom();
      disconnectSocket();
      setSocket(null);
    };
  }, [
    isLoaded,
    isSignedIn,
    user,
    meetingId,
    getToken,
    navigate,
    initLocalStream,
    leaveRoom,
    setMeetingHostId,
  ]);

  // Live elapsed timer
  useEffect(() => {
    if (!startTimeRef.current) return;
    const timer = setInterval(() => {
      const diff = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      setElapsed(
        h > 0
          ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
          : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [loading]);

  if (loading) {
    return <Loading text="Joining meeting..." />;
  }

  const isHost = meetingHostId === user?.id;
  const participantCount = remoteUsers.length + 1;

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col overflow-hidden relative font-sans bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-[120px]" />

      {/* Header */}
      <header className="relative z-30 flex items-center justify-between px-6 py-3 border-b border-white/5 bg-slate-950/60 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <span className="size-2 rounded-full bg-emerald-400 animate-pulse flex-none" />
          <h2 className="text-sm md:text-base font-semibold text-white tracking-tight truncate">
            {meetingDetails?.title || "Meeting"}
          </h2>
          <span className="hidden md:inline-flex items-center px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
            {meetingId}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-slate-300 tabular-nums">
            <span className="size-1.5 rounded-full bg-rose-400 animate-pulse" />
            <span className="hidden sm:inline">Live ·</span>
            <span className="font-semibold text-white">{elapsed}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsParticipantsOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 transition-colors"
            title="Participants"
          >
            <Users className="w-3.5 h-3.5" />
            {participantCount}
          </button>
        </div>
      </header>

      {/* Meeting Area */}
      <div className="relative flex-1 flex overflow-hidden">
        <VideoGrid
          localStream={localStream}
          localUser={localUser}
          remoteUsers={remoteUsers}
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
        />
      </div>

      {/* Control Bar */}
      <ControlBar
        roomID={meetingId}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleChat={toggleChat}
        onToggleParticipants={() => setIsParticipantsOpen((prev) => !prev)}
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        unreadCount={unreadCount}
        ParticipantCount={participantCount}
        isHost={isHost}
        onLeave={() => {
          leaveRoom();
          navigate("/dashboard");
        }}
        onEndMeeting={endMeeting}
      />

      {/* Full-height overlays (span the whole viewport above header + control bar) */}
      {isChatOpen && (
        <ChatPannel
          isOpen={isChatOpen}
          onClose={toggleChat}
          messages={messages}
          onSendMessage={sendMessage}
          currentUser={localUser}
        />
      )}

      {isParticipantsOpen && (
        <ParticipantList
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          localUser={localUser}
          localAudio={audioEnabled}
          localVideo={videoEnabled}
          remoteUsers={remoteUsers}
          meetingHostId={meetingHostId}
        />
      )}
    </div>
  );
};

export default MeetingRoom;