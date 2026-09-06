import { useCallback, useEffect, useRef, useState } from "react";
import { dummyRemoteParticipants } from "../assets/asset";
import { toast } from "react-hot-toast";

const useWebRTC = (_roomId, user, _onMeetingEnded, _enabled = true) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteUsers] = useState(dummyRemoteParticipants);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  const localStreamRef = useRef(null);

  const stopStream = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
  }, []);

  const initialLocalStream = useCallback(async () => {
    if (!navigator?.mediaDevices?.getUserMedia) return null;

    const acquire = (constraints) =>
      navigator.mediaDevices
        .getUserMedia(constraints)
        .catch((error) => {
          console.log(`Failed to acquire ${constraints.video ? "camera" : ""}${constraints.audio ? " microphone" : ""}:`, error);
          return null;
        });

    for (let attempt = 1; attempt <= 3; attempt++) {
      const videoStream = await acquire({ video: true });
      if (videoStream) {
        const stream = new MediaStream();
        videoStream.getVideoTracks().forEach((track) => {
          track.enabled = true;
          stream.addTrack(track);
        });

        const audioStream = await acquire({ audio: true });
        audioStream?.getAudioTracks().forEach((track) => {
          track.enabled = true;
          stream.addTrack(track);
        });

        localStreamRef.current = stream;
        setVideoEnabled(true);
        setAudioEnabled(Boolean(audioStream));
        setLocalStream(stream);
        return stream;
      }
    }

    const audioStream = await acquire({ audio: true });
    if (audioStream) {
      const stream = new MediaStream();
      audioStream.getAudioTracks().forEach((track) => {
        track.enabled = true;
        stream.addTrack(track);
      });

      localStreamRef.current = stream;
      setVideoEnabled(false);
      setAudioEnabled(true);
      setLocalStream(stream);
      return stream;
    }

    console.log("Camera preview fallback mode");
    return null;
  }, []);

  useEffect(() => {
    if (_enabled) initialLocalStream();

    return () => stopStream();
  }, [_enabled, initialLocalStream, stopStream]);

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