import { useCallback, useState } from "react";
import {
  dummyInitialChatMessages,
  dummySessions,
} from "../assets/asset";

export const useChat = (roomId, user) => {
  // Find current meeting
  const currentSession = dummySessions.find(
    (session) => session.meetingId === roomId
  );

  // Get messages for current meeting
  const initialMessages =
    currentSession?.messages?.map((message) => ({
      ...message,

      time:
        message.time ||
        (message.timestamp
          ? new Date(message.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          : ""),
    })) || dummyInitialChatMessages;

  const [messages, setMessages] = useState(initialMessages);

  const [unreadCount, setUnreadCount] = useState(0);

  const [isChatOpen, setIsChatOpen] = useState(true);

  // Send message
  const sendMessage = useCallback(
    (text) => {
      if (!text.trim() || !user) return;

      const message = {
        id: Date.now().toString(),
        text: text.trim(),
        senderName: user.name || user.fullName || "You",
        senderId: user.id,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, message]);
    },
    [user]
  );

  // Open / close chat
  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => {
      if (!prev) {
        setUnreadCount(0);
      }

      return !prev;
    });
  }, []);

  return {
    messages,
    sendMessage,
    unreadCount,
    setUnreadCount,
    isChatOpen,
    setIsChatOpen,
    toggleChat,
  };
};