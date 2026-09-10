import React from "react";
import {
  CrownIcon,
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  XIcon,
  UsersRound,
} from "lucide-react";

const ParticipantList = ({
  isOpen,
  onClose,
  localUser,
  localAudio,
  localVideo,
  remoteUsers = [],
  meetingHostId,
}) => {
  if (!isOpen) return null;

  const allParticipants = [
    {
      socketId: "local",
      userId: localUser?.id,
      userName: localUser?.name || "You",
      audioEnabled: localAudio,
      videoEnabled: localVideo,
      isLocal: true,
    },
    ...remoteUsers,
  ];

  return (
    <aside className="absolute inset-y-0 left-0 w-full sm:w-80 h-full bg-slate-900 border-r border-white/10 flex flex-col z-40 shadow-2xl shadow-black/50">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/90 backdrop-blur">
        <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <UsersRound className="w-4.5 h-4.5" />
          </span>
          Participants
          <span className="text-xs font-medium text-slate-500">
            ({allParticipants.length})
          </span>
        </h3>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Close participants"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 min-h-0 p-3 space-y-2 overflow-y-auto">
        {allParticipants.map((p) => {
          const isHost = meetingHostId && p.userId === meetingHostId;

          return (
            <div
              key={p.socketId}
              className={`flex items-center justify-between p-3 rounded-2xl border transition-shadow shadow-md ${
                p.isLocal
                  ? "bg-white/5 border-primary/40"
                  : "bg-white/[0.03] border-white/10"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex-none w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 p-[2px]">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                    {p.userName?.charAt(0).toUpperCase() || "?"}
                  </div>
                </div>

                <span className="text-sm font-medium text-slate-100 flex items-center gap-1.5 truncate">
                  <span className="truncate">
                    {p.userName}
                    {p.isLocal ? " (You)" : ""}
                  </span>
                  {isHost && (
                    <CrownIcon
                      className="w-3.5 h-3.5 text-amber-400 flex-none"
                      title="Host"
                    />
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-400 flex-none">
                {p.audioEnabled ? (
                  <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                    <MicIcon className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400">
                    <MicOffIcon className="w-3.5 h-3.5" />
                  </span>
                )}

                {p.videoEnabled ? (
                  <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                    <VideoIcon className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="p-1.5 rounded-lg bg-white/5 text-slate-500">
                    <VideoOffIcon className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default ParticipantList;