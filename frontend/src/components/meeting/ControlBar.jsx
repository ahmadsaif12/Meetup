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
  CircleStop,
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

  const tooltipBase = "absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-800 text-white text-[10px] font-medium px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none";

  return (
    <footer className="relative w-full px-4 py-4 z-30">
      <div className="mx-auto max-w-3xl flex items-center justify-between gap-3 bg-slate-900/85 backdrop-blur-xl rounded-2xl border border-white/10 px-4 py-3 shadow-2xl shadow-black/40">

        {/* Left: meeting ID + copy */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden sm:block min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-slate-400">Meeting ID</p>
            <p className="text-sm font-semibold text-white font-mono truncate">{roomID}</p>
          </div>
          <button
            type="button"
            onClick={copyMeetingID}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition group relative"
            title="Copy meeting link"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className={tooltipBase}>Copy link</span>
          </button>
        </div>

        {/* Center: mic / cam / leave */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onToggleAudio}
            className={`p-3 rounded-full transition-all group relative ${
              audioEnabled
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-rose-500/90 hover:bg-rose-500 text-white"
            }`}
            title={audioEnabled ? "Mute" : "Unmute"}
          >
            {audioEnabled ? (
              <Mic className="w-5 h-5" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
            <span className={tooltipBase}>{audioEnabled ? "Mute" : "Unmute"}</span>
          </button>

          <button
            type="button"
            onClick={onToggleVideo}
            className={`p-3 rounded-full transition-all group relative ${
              videoEnabled
                ? "bg-white/10 hover:bg-white/20 text-white"
                : "bg-rose-500/90 hover:bg-rose-500 text-white"
            }`}
            title={videoEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {videoEnabled ? (
              <Video className="w-5 h-5" />
            ) : (
              <VideoOff className="w-5 h-5" />
            )}
            <span className={tooltipBase}>{videoEnabled ? "Camera off" : "Camera on"}</span>
          </button>

          <button
            type="button"
            onClick={onLeave}
            className="px-4 sm:px-6 py-3 rounded-full bg-rose-500 text-white hover:bg-rose-600 active:scale-95 transition-all group relative shadow-lg shadow-rose-500/30"
            title="Leave meeting"
          >
            <span className="flex items-center gap-2">
              <PhoneOff className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium">Leave</span>
            </span>
          </button>
        </div>

        {/* Right: participants / chat / end */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleParticipants}
            className={`relative p-3 rounded-xl transition-all group ${
              isParticipantsOpen
                ? "bg-primary text-white"
                : "bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
            }`}
            title="Participants"
          >
            <Users className="w-5 h-5" />
            {ParticipantCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-slate-800 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 border border-white/20">
                {ParticipantCount}
              </span>
            )}
            <span className={tooltipBase}>Participants</span>
          </button>

          <button
            type="button"
            onClick={onToggleChat}
            className={`relative p-3 rounded-xl transition-all group ${
              isChatOpen
                ? "bg-primary text-white"
                : "bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white"
            }`}
            title="Chat"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
            <span className={tooltipBase}>Chat</span>
          </button>

          {isHost && (
            <button
              type="button"
              onClick={onEndMeeting}
              className="px-3.5 py-2.5 rounded-xl bg-rose-500/15 text-rose-400 hover:bg-rose-500 hover:text-white transition-all text-sm font-medium group relative border border-rose-500/20"
            >
              <span className="flex items-center gap-1.5">
                <CircleStop className="w-4 h-4" />
                <span className="hidden md:inline">End</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

export default ControlBar;