import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  dummyMeetingDetails,
  dummyUser,
} from "../assets/asset";

import VideoGrid from "../components/meeting/VideoGrid";
import ChatPannel from "../components/meeting/ChatPannel";

import useWebRTC from "../hooks/useWebRTC";
import { useChat } from "../hooks/useChat";

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [isParticipateOpen, setIsParticipateOpen] = useState(false);

  // Meeting ended
  const handleMeetingEnded = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  // WebRTC
  const {
    localStream,
    remoteUsers,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    endMeeting,
  } = useWebRTC(
    meetingId,
    dummyUser,
    handleMeetingEnded
  );

  // Chat
  const {
    messages,
    sendMessage,
    unreadCount,
    isChatOpen,
    toggleChat,
  } = useChat(
    meetingId,
    dummyUser
  );

  const isHost = true;

  const handleLeave = () => {
    navigate("/dashboard");
  };

  const handleMeeting = () => {
    endMeeting();
  };

  return (
    <div className="h-screen w-screen bg-slate-100 text-slate-900 flex flex-col overflow-hidden relative font-sans">

      {/* Top Bar */}
      <header className="w-full bg-white/90 backdrop-blur-md px-6 py-3 border-b border-slate-200 flex items-center justify-between z-30 shadow-xs">

        <div className="flex items-center gap-3 ml-6">
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            {dummyMeetingDetails.title} (
            {meetingId || dummyMeetingDetails.meetingId})
          </h2>

          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        {/* Chat Button */}
        <button
          onClick={toggleChat}
          className="relative px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
        >
          Chat

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {unreadCount}
            </span>
          )}
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Video Grid */}
        <VideoGrid
          localStream={localStream}
          localUser={dummyUser}
          remoteUsers={remoteUsers}
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
        />

        {/* Chat */}
        {isChatOpen && (
          <ChatPannel
            isOpen={isChatOpen}
            onClose={toggleChat}
            messages={messages}
            onSendMessage={sendMessage}
            currentUser={dummyUser}
          />
        )}
      </div>
    </div>
  );
};

export default MeetingRoom;