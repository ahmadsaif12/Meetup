import { useCallback, useEffect, useRef, useState } from "react";

export const useChat = (socket, user) => {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isChatOpenRef = useRef(false);
  const socketRef = useRef(socket);

  socketRef.current = socket;

  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    const handleChatMessage = (msg) => {
      const formatted = {
        id: msg.id,
        senderId: msg.senderId,
        senderName: msg.senderName,
        text: msg.text,
        time: new Date(msg.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setMessages((prev) => [...prev, formatted]);

      if (!isChatOpenRef.current && msg.senderId !== user?.id) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    s.on("chat-message", handleChatMessage);
    return () => s.off("chat-message", handleChatMessage);
  }, [socket, user?.id]);

  const sendMessage = useCallback((text) => {
    if (!text.trim() || !socketRef.current) return;
    socketRef.current.emit("chat-message", { text: text.trim() });
  }, []);

  const toggleChat = useCallback(() => {
    setIsChatOpen((prev) => {
      const next = !prev;
      isChatOpenRef.current = next;
      if (next) setUnreadCount(0);
      return next;
    });
  }, []);

  return {
    messages,
    setMessages,
    sendMessage,
    unreadCount,
    isChatOpen,
    setIsChatOpen,
    toggleChat,
  };
};
