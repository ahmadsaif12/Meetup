import { useCallback, useEffect, useRef, useState } from "react";
import { dummyRemoteParticipants } from "../assets/asset";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { toast } from "react-hot-toast";

const useWebRTC = (_roomId, user, _onMeetingEnded, _enabled = true) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteUsers] = useState(dummyRemoteParticipants);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const localStreamRef = useRef(null);

  const initialLocalStream = useCallback(async () => {
    try {
      if (navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStreamRef.current = stream;
        setLocalStream(stream);
        return stream;
      }
    } catch (error) {
      console.log("Camera preview fallback mode");
    }

    return null;
  }, []);

  useEffect(() => {
    if (_enabled) initialLocalStream();

    return () =>
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
  }, [_enabled, initialLocalStream]);

  const toggleAudio = () => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);

    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) track.enabled = newState;

    toast(newState ? "🎙️ Microphone turned on" : "🔇 Microphone muted");
  };

  const toggleVideo = () => {
    const newState = !videoEnabled;
    setVideoEnabled(newState);

    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) track.enabled = newState;

    toast(newState ? "📹 Camera turned on" : "📹 Camera turned off");
  };

  const endMeeting = useCallback(() => {
    _onMeetingEnded?.("Meeting Ended");
  }, [_onMeetingEnded]);

  return {
    localStream,
    remoteUsers,
    audioEnabled,
    videoEnabled,
    toggleAudio,
    toggleVideo,
    endMeeting,
  };
};

export default useWebRTC;