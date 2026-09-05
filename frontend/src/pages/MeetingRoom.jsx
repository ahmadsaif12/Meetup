import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dummyMeetingDetails, dummyUser } from "../assets/asset";
import VideoGrid from "../components/meeting/VideoGrid";
import ChatPannel from "../components/meeting/ChatPannel";
import ParticipantList from "../components/meeting/ParticipantList";
import ControlBar from "../components/meeting/ControlBar";
import useWebRTC from "../hooks/useWebRTC";
import { useChat } from "../hooks/useChat";

const MeetingRoom = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();

  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);

  const handleMeetingEnded = useCallback(() => {
    navigate("/dashboard");
  }, [navigate]);

  const {
    localStream,
    remoteUsers,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    endMeeting,
  } = useWebRTC(meetingId, dummyUser, handleMeetingEnded);

  const {
    messages,
    sendMessage,
    unreadCount,
    isChatOpen,
    toggleChat,
  } = useChat(meetingId, dummyUser);

  const handleLeave = () => {
    navigate("/dashboard");
  };

  const handleEndMeeting = () => {
    endMeeting();
  };

  return (
    <div className="h-screen w-screen bg-slate-100 text-slate-900 flex flex-col overflow-hidden relative font-sans">
      {/* Header */}
      <header className="w-full bg-white/90 backdrop-blur-md px-6 py-3 border-b border-slate-200 flex items-center justify-between z-30 shadow-xs">
        <div className="flex items-center gap-3 ml-6">
          <h2 className="text-base font-semibold text-slate-900 tracking-tight">
            {dummyMeetingDetails.title} (
            {meetingId || dummyMeetingDetails.meetingId})
          </h2>

          <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </header>

      {/* Meeting Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <VideoGrid
          localStream={localStream}
          localUser={dummyUser}
          remoteUsers={remoteUsers}
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
        />

        {isChatOpen && (
          <ChatPannel
            isOpen={isChatOpen}
            onClose={toggleChat}
            messages={messages}
            onSendMessage={sendMessage}
            currentUser={dummyUser}
          />
        )}

        <ParticipantList
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
          localUser={dummyUser}
          localAudio={audioEnabled}
          localVideo={videoEnabled}
          remoteUsers={remoteUsers}
          meetingHostId={dummyUser.id}
        />
      </div>

      {/* Control Bar */}
      <ControlBar
        roomID={meetingId || dummyMeetingDetails.meetingId}
        audioEnabled={audioEnabled}
        videoEnabled={videoEnabled}
        onToggleAudio={toggleAudio}
        onToggleVideo={toggleVideo}
        onToggleChat={toggleChat}
        onToggleParticipants={() =>
          setIsParticipantsOpen((prev) => !prev)
        }
        isChatOpen={isChatOpen}
        isParticipantsOpen={isParticipantsOpen}
        unreadCount={unreadCount}
        ParticipantCount={remoteUsers?.length + 1 || 1}
        isHost={true}
        onLeave={handleLeave}
        onEndMeeting={handleEndMeeting}
      />
    </div>
  );
};

export default MeetingRoom;