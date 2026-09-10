import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const useWebRTC = (roomId, user, socket, onMeetingEnded) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [meetingHostId, setMeetingHostId] = useState(null);

  const localStreamRef = useRef(null);
  const peerConnections = useRef({});
  const remoteUsersRef = useRef([]);
  const socketRef = useRef(socket);

  socketRef.current = socket;

  const syncRemoteUsers = useCallback((updater) => {
    remoteUsersRef.current = updater(remoteUsersRef.current);
    setRemoteUsers([...remoteUsersRef.current]);
  }, []);

  const stopStream = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    Object.values(peerConnections.current).forEach((pc) => pc.close());
    peerConnections.current = {};
  }, []);

  const getOrCreatePeer = useCallback(
    (targetSocketId, targetUser) => {
      if (peerConnections.current[targetSocketId]) {
        return peerConnections.current[targetSocketId];
      }

      const pc = new RTCPeerConnection(ICE_SERVERS);
      peerConnections.current[targetSocketId] = pc;

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current);
        });
      }

      pc.ontrack = (event) => {
        const [stream] = event.streams;
        syncRemoteUsers((prev) => {
          const exists = prev.find((u) => u.socketId === targetSocketId);
          if (exists) {
            return prev.map((u) =>
              u.socketId === targetSocketId ? { ...u, stream } : u
            );
          }
          return [
            ...prev,
            {
              socketId: targetSocketId,
              userId: targetUser.userId,
              userName: targetUser.userName,
              stream,
              audioEnabled: true,
              videoEnabled: true,
            },
          ];
        });
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          socketRef.current.emit("ice-candidate", {
            to: targetSocketId,
            candidate: event.candidate,
          });
        }
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          syncRemoteUsers((prev) =>
            prev.filter((u) => u.socketId !== targetSocketId)
          );
          pc.close();
          delete peerConnections.current[targetSocketId];
        }
      };

      return pc;
    },
    [syncRemoteUsers]
  );

  const createOffer = useCallback(
    async (targetSocketId, targetUser) => {
      const pc = getOrCreatePeer(targetSocketId, targetUser);
      if (pc.signalingState !== "stable") return;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current?.emit("offer", {
        to: targetSocketId,
        offer,
      });
    },
    [getOrCreatePeer]
  );

  const initLocalStream = useCallback(async () => {
    if (!navigator?.mediaDevices?.getUserMedia) return null;

    const acquire = (constraints) =>
      navigator.mediaDevices.getUserMedia(constraints).catch(() => null);

    const VIDEO_CONSTRAINTS = {
      facingMode: "user",
      width: { ideal: 1280, min: 640, max: 1920 },
      height: { ideal: 720, min: 480, max: 1080 },
      frameRate: { ideal: 30, max: 60 },
    };
    const AUDIO_CONSTRAINTS = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };

    // Try HD first, then fall back to device default, then low-res.
    const videoAttempts = [{ video: VIDEO_CONSTRAINTS }, { video: true }];

    for (const attempt of videoAttempts) {
      const videoStream = await acquire(attempt);
      if (videoStream) {
        const stream = new MediaStream();
        videoStream.getVideoTracks().forEach((track) => stream.addTrack(track));
        const audioStream = await acquire({ audio: AUDIO_CONSTRAINTS });
        audioStream?.getAudioTracks().forEach((track) => stream.addTrack(track));
        localStreamRef.current = stream;
        setVideoEnabled(true);
        setAudioEnabled(!!audioStream);
        setLocalStream(stream);
        return stream;
      }
    }

    const audioStream = await acquire({ audio: AUDIO_CONSTRAINTS });
    if (audioStream) {
      const stream = new MediaStream();
      audioStream.getAudioTracks().forEach((track) => stream.addTrack(track));
      localStreamRef.current = stream;
      setVideoEnabled(false);
      setAudioEnabled(true);
      setLocalStream(stream);
      return stream;
    }

    return null;
  }, []);

  useEffect(() => {
    const s = socketRef.current;
    if (!s || !roomId || !user) return;

    const handleRoomMembers = ({ members }) => {
      // Track members already in the room (existing hosts initiate the offers).
      syncRemoteUsers((prev) => {
        const known = new Set(prev.map((u) => u.socketId));
        const additions = members
          .filter((m) => !known.has(m.socketId))
          .map((m) => ({
            socketId: m.socketId,
            userId: m.userId,
            userName: m.userName,
            stream: null,
            audioEnabled: true,
            videoEnabled: true,
          }));
        return additions.length ? [...prev, ...additions] : prev;
      });
    };

    const handleUserJoined = ({ socketId, userId, userName }) => {
      syncRemoteUsers((prev) => {
        if (prev.find((u) => u.socketId === socketId)) return prev;
        return [
          ...prev,
          {
            socketId,
            userId,
            userName,
            stream: null,
            audioEnabled: true,
            videoEnabled: true,
          },
        ];
      });
      createOffer(socketId, { userId, userName });
    };

    const handleOffer = async ({ from, offer }) => {
      const targetUser = { userId: "", userName: "" };
      const existing = remoteUsersRef.current.find(
        (u) => u.socketId === from
      );
      if (existing) {
        targetUser.userId = existing.userId;
        targetUser.userName = existing.userName;
      }

      const pc = getOrCreatePeer(from, targetUser);
      if (pc.signalingState !== "stable") return;
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      s.emit("answer", { to: from, answer });
    };

    const handleAnswer = async ({ from, answer }) => {
      const pc = peerConnections.current[from];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    };

    const handleIceCandidate = async ({ from, candidate }) => {
      const pc = peerConnections.current[from];
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    };

    const handleUserAudioToggled = ({ socketId, audioEnabled: enabled }) => {
      syncRemoteUsers((prev) =>
        prev.map((u) =>
          u.socketId === socketId ? { ...u, audioEnabled: enabled } : u
        )
      );
    };

    const handleUserVideoToggled = ({ socketId, videoEnabled: enabled }) => {
      syncRemoteUsers((prev) =>
        prev.map((u) =>
          u.socketId === socketId ? { ...u, videoEnabled: enabled } : u
        )
      );
    };

    const handleUserLeft = ({ socketId }) => {
      if (peerConnections.current[socketId]) {
        peerConnections.current[socketId].close();
        delete peerConnections.current[socketId];
      }
      syncRemoteUsers((prev) =>
        prev.filter((u) => u.socketId !== socketId)
      );
    };

    const handleMeetingEnded = () => {
      toast.error("Meeting ended by host");
      stopStream();
      onMeetingEnded?.();
    };

    const handleError = ({ message }) => {
      toast.error(message);
      if (
        message === "Meeting not found" ||
        message === "This meeting has ended"
      ) {
        onMeetingEnded?.();
      }
    };

    s.on("room-members", handleRoomMembers);
    s.on("user-joined", handleUserJoined);
    s.on("offer", handleOffer);
    s.on("answer", handleAnswer);
    s.on("ice-candidate", handleIceCandidate);
    s.on("user-audio-toggled", handleUserAudioToggled);
    s.on("user-video-toggled", handleUserVideoToggled);
    s.on("user-left", handleUserLeft);
    s.on("meeting-ended", handleMeetingEnded);
    s.on("error", handleError);

    return () => {
      s.off("room-members", handleRoomMembers);
      s.off("user-joined", handleUserJoined);
      s.off("offer", handleOffer);
      s.off("answer", handleAnswer);
      s.off("ice-candidate", handleIceCandidate);
      s.off("user-audio-toggled", handleUserAudioToggled);
      s.off("user-video-toggled", handleUserVideoToggled);
      s.off("user-left", handleUserLeft);
      s.off("meeting-ended", handleMeetingEnded);
      s.off("error", handleError);
    };
  }, [
    roomId,
    user,
    socket,
    createOffer,
    getOrCreatePeer,
    syncRemoteUsers,
    onMeetingEnded,
    stopStream,
  ]);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  const toggleAudio = useCallback(() => {
    const newState = !audioEnabled;
    setAudioEnabled(newState);
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) track.enabled = newState;
    socketRef.current?.emit("toggle-audio", { enabled: newState });
  }, [audioEnabled]);

  const toggleVideo = useCallback(() => {
    const newState = !videoEnabled;
    setVideoEnabled(newState);
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) track.enabled = newState;
    socketRef.current?.emit("toggle-video", { enabled: newState });
  }, [videoEnabled]);

  const endMeeting = useCallback(() => {
    socketRef.current?.emit("end-meeting");
  }, []);

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit("leave-room");
    stopStream();
  }, [stopStream]);

  return {
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
    setRemoteUsers,
    syncRemoteUsers,
  };
};

export default useWebRTC;
