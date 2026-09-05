import React, { useState } from "react";
import { toast } from "react-hot-toast";
import {
  Copy,
  Check,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MessageSquare,
  Users,
  PhoneOff,
} from "lucide-react";

const ControlBar = ({
  roomID,
  audioEnabled,
  videoEnabled,
  onToggleAudio,
  onToggleVideo,
  onToggleChat,
  onToggleParticipants,
  isChatOpen,
  isParticipantsOpen,
  unreadCount,
  ParticipantCount,
  isHost,
  onLeave,
  onEndMeeting,
}) => {
  const [copied, setCopied] = useState(false);

  const copyMeetingID = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success("Meeting link copied");

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="w-full bg-white/90 backdrop-blur-md border-t border-slate-200/80 px-6 py-4 flex items-center justify-between shadow-lg shadow-slate-200/50">
      {/* Left info */}
      <div className="flex items-center gap-3">
        <div>
          <p className="text-xs text-slate-500">Meeting ID</p>
          <p className="text-sm font-medium text-slate-800">{roomID}</p>
        </div>

        <button
          type="button"
          onClick={copyMeetingID}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
          title="Copy meeting link"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <Copy className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      {/* Center controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleAudio}
          className={`p-3 rounded-full transition ${
            audioEnabled
              ? "bg-slate-100 hover:bg-slate-200"
              : "bg-red-100 text-red-600 hover:bg-red-200"
          }`}
          title={audioEnabled ? "Mute" : "Unmute"}
        >
          {audioEnabled ? (
            <Mic className="w-5 h-5" />
          ) : (
            <MicOff className="w-5 h-5" />
          )}
        </button>

        <button
          type="button"
          onClick={onToggleVideo}
          className={`p-3 rounded-full transition ${
            videoEnabled
              ? "bg-slate-100 hover:bg-slate-200"
              : "bg-red-100 text-red-600 hover:bg-red-200"
          }`}
          title={videoEnabled ? "Turn off camera" : "Turn on camera"}
        >
          {videoEnabled ? (
            <Video className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </button>

        <button
          type="button"
          onClick={onLeave}
          className="px-5 py-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleParticipants}
          className={`relative p-3 rounded-xl transition ${
            isParticipantsOpen
              ? "bg-slate-200"
              : "bg-slate-100 hover:bg-slate-200"
          }`}
          title="Participants"
        >
          <Users className="w-5 h-5" />

          {ParticipantCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-slate-800 text-white text-xs rounded-full px-1.5 py-0.5">
              {ParticipantCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onToggleChat}
          className={`relative p-3 rounded-xl transition ${
            isChatOpen
              ? "bg-slate-200"
              : "bg-slate-100 hover:bg-slate-200"
          }`}
          title="Chat"
        >
          <MessageSquare className="w-5 h-5" />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
              {unreadCount}
            </span>
          )}
        </button>

        {isHost && (
          <button
            type="button"
            onClick={onEndMeeting}
            className="px-4 py-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition text-sm font-medium"
          >
            End Meeting
          </button>
        )}
      </div>
    </footer>
  );
};

export default ControlBar;