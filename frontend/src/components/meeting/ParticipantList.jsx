import React from "react";
import {
  CrownIcon,
  MicIcon,
  MicOffIcon,
  VideoIcon,
  VideoOffIcon,
  XIcon,
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
      userID: localUser?.id,
      userName: `${localUser?.name || "You"} (You)`,
      audioEnabled: localAudio,
      videoEnabled: localVideo,
      isLocal: true,
    },
    ...remoteUsers,
  ];

  return (
    <aside className="w-full sm:w-80 h-full bg-white border border-slate-200 flex flex-col z-20 shadow-2xl">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-medium text-slate-900 text-base">
          Participants ({allParticipants.length})
        </h3>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {allParticipants.map((p) => {
          const isHost = meetingHostId && p.userID === meetingHostId;

          return (
            <div
              key={p.socketId}
              className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-light border border-primary-border text-primary font-bold flex items-center justify-center text-sm shadow-xs">
                  {p.userName?.charAt(0).toUpperCase()}
                </div>

                <span className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                  {p.userName}
                  {isHost && (
                    <CrownIcon
                      className="w-3.5 h-3.5 text-amber-500"
                      title="Host"
                    />
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 text-slate-500">
                {p.audioEnabled ? (
                  <MicIcon className="w-4 h-4" />
                ) : (
                  <MicOffIcon className="w-4 h-4" />
                )}

                {p.videoEnabled ? (
                  <VideoIcon className="w-4 h-4" />
                ) : (
                  <VideoOffIcon className="w-4 h-4 text-rose-600" />
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