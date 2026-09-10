import { useEffect, useRef, useState } from "react";
import { SendIcon, XIcon, MessageSquareText } from "lucide-react";

const ChatPannel = ({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  currentUser,
}) => {
  const [text, setText] = useState("");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text);
    setText("");
  };

  return (
    <aside className="absolute inset-y-0 right-0 w-full sm:w-[26rem] h-full bg-slate-900 border-l border-white/10 flex flex-col z-40 shadow-2xl shadow-black/50">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-slate-900/90 backdrop-blur flex-none">
        <h3 className="font-semibold text-slate-100 text-base flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <MessageSquareText className="w-4.5 h-4.5" />
          </span>
          In-Meeting Chat
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            ({messages.length})
          </span>
        </h3>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Close chat"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 p-4 space-y-5 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-sm px-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <SendIcon className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-slate-300 font-medium">No messages yet.</p>
            <p className="text-xs mt-1 text-slate-500 max-w-[220px]">
              Send a message to start chatting with everyone in the call.
            </p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUser?.id;

            return (
              <div
                key={msg.id || index}
                className={`flex gap-2.5 ${isMe ? "justify-end" : "justify-start"}`}
              >
                {!isMe && (
                  <span className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-[11px] font-bold text-white flex-none mt-0.5 shadow-md shadow-indigo-900/40">
                    {(msg.senderName || "?").charAt(0).toUpperCase()}
                  </span>
                )}

                <div
                  className={`flex flex-col max-w-[78%] ${
                    isMe ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[11px] font-semibold text-slate-400">
                      {isMe ? "You" : msg.senderName}
                    </span>
                    <span className="text-[10px] text-slate-600">{msg.time}</span>
                  </div>

                  <div
                    className={`px-3.5 py-2.5 text-sm leading-relaxed shadow-md ${
                      isMe
                        ? "bg-gradient-to-r from-primary to-indigo-500 text-white rounded-2xl rounded-tr-md"
                        : "bg-slate-800 text-slate-100 border border-white/10 rounded-2xl rounded-tl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Send Form */}
      <form
        onSubmit={handleSubmit}
        className="px-4 py-3.5 border-t border-white/10 bg-slate-950/70 flex-none"
      >
        <div className="flex items-center gap-2 rounded-2xl bg-slate-800 border border-white/10 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20 transition-all p-1.5 pl-4 shadow-inner">
          <input
            type="text"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-100 placeholder-slate-500 py-1.5"
          />

          <button
            type="submit"
            disabled={!text.trim()}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              text.trim()
                ? "bg-gradient-to-r from-primary to-indigo-500 text-white shadow-md shadow-primary/30 hover:brightness-110"
                : "bg-white/5 text-slate-600"
            }`}
            title="Send"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </div>
      </form>
    </aside>
  );
};

export default ChatPannel;