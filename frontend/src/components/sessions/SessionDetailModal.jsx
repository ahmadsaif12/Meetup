import { useState } from "react";
import { X } from "lucide-react";

export default function SessionDetailModal({ session, onClose }) {
  const [activeTab, setActiveTab] = useState("chat");

  if (!session) return null;

  const isEnded = session.status === "ended";

  const participants = Array.isArray(session.participants)
    ? session.participants
    : [];
  const messages = Array.isArray(session.messages) ? session.messages : [];

  const createdAt = session.createdAt ?? session.date;

  const getDisplayName = (value) => {
    if (!value) return "Unknown";
    if (typeof value === "string") return value;
    return value.name ?? value.email ?? "Unknown";
  };

  const formatDate = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-mono text-slate-500">
                ID: {session.meetingId}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  isEnded
                    ? "bg-slate-100 text-slate-500"
                    : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {isEnded ? "Ended" : "Active"}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <X size={20} />
            </button>
          </div>

          <h2 className="mt-3 text-2xl font-semibold text-slate-900">
            {session.title}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Host: {getDisplayName(session.host)} · Created {formatDate(createdAt)}
          </p>
        </div>

        <div className="flex border-b border-slate-100 px-6">
          <button
            type="button"
            onClick={() => setActiveTab("chat")}
            className={`px-1 py-3 mr-6 text-sm font-medium border-b-2 transition ${
              activeTab === "chat"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Chat Transcript ({messages.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("participants")}
            className={`px-1 py-3 text-sm font-medium border-b-2 transition ${
              activeTab === "participants"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            Participants Log ({participants.length})
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "chat" ? (
            messages.length === 0 ? (
              <p className="text-sm text-slate-400">No messages recorded.</p>
            ) : (
              <ul className="space-y-4">
                {messages.map((msg) => {
                  const senderName = msg.senderName ?? getDisplayName(msg.sender ?? msg.user);
                  return (
                    <li key={msg.id} className="flex gap-3">
                      <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-500">
                        {senderName.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-sm font-medium text-slate-800">
                            {senderName}
                          </span>
                          {msg.timestamp && (
                            <span className="text-xs text-slate-400">
                              {formatDate(msg.timestamp)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">{msg.text}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )
          ) : participants.length === 0 ? (
            <p className="text-sm text-slate-400">No participants recorded.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {participants.map((p, i) => (
                <li
                  key={p.user?.id ?? i}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm font-medium text-slate-800">
                    {p.name ?? getDisplayName(p.user)}
                  </span>
                  <span className="text-xs text-slate-400">
                    Joined {formatDate(p.joinedAt)}
                    {p.leftAt ? ` · Left ${formatDate(p.leftAt)}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}