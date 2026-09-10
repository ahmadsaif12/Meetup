import { useEffect, useRef } from "react";
import {
  UserIcon,
  VideoOffIcon,
  MicOffIcon,
  MicIcon,
} from "lucide-react";

const VideoTile = ({
  stream,
  name,
  isLocal = false,
  audioEnabled = true,
  videoEnabled = true,
  speaking = false,
}) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoEnabled]);

  const initial = (name || "?").charAt(0).toUpperCase();

  return (
    <div
      className={`relative w-full aspect-video rounded-2xl overflow-hidden flex items-center justify-center isolate transition-all duration-300`}
    >
      {/* Base background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950" />

      {/* Speaking ring */}
      {speaking && (
        <div className="absolute inset-0 -z-0 rounded-2xl ring-2 ring-emerald-400/90 shadow-[0_0_24px_rgba(52,211,153,0.35)]" />
      )}

      {/* Video */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover transition-all duration-300 ${
          videoEnabled
            ? "opacity-100"
            : "opacity-0 pointer-events-none absolute"
        } ${isLocal ? "-scale-x-100" : ""}`}
      />

      {/* Dark legibility gradient over video */}
      {videoEnabled && (
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
      )}

      {/* Camera Off / Connecting state */}
      {(!videoEnabled || (videoEnabled && !stream)) && (
        <div className="flex flex-col items-center justify-center space-y-3 z-10 relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 p-[3px] shadow-lg shadow-indigo-900/40">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-3xl font-bold text-white uppercase">
              {initial || <UserIcon className="w-8 h-8" />}
            </div>
          </div>

          <span className="text-xs font-medium px-3 py-1 rounded-full bg-black/40 text-slate-200 border border-white/10 backdrop-blur flex items-center gap-1.5">
            {videoEnabled ? (
              <>
                <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
                Starting camera...
              </>
            ) : (
              <>
                <VideoOffIcon className="w-3.5 h-3.5 text-rose-400" />
                Camera off
              </>
            )}
          </span>
        </div>
      )}

      {/* Name + Mic status */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-medium text-white shadow-md">
          <span className="max-w-[140px] truncate">
            {name || "Participant"}
            {isLocal ? " (You)" : ""}
          </span>
        </div>

        <span
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold backdrop-blur-md border transition-colors ${
            audioEnabled
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
              : "bg-rose-500/25 text-rose-300 border-rose-500/40"
          }`}
        >
          {audioEnabled ? (
            <MicIcon className="w-3 h-3" />
          ) : (
            <MicOffIcon className="w-3 h-3" />
          )}
          <span className="hidden sm:inline">
            {audioEnabled ? "On" : "Muted"}
          </span>
        </span>
      </div>
    </div>
  );
};

export default VideoTile;