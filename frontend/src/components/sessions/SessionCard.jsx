import { Calendar, Users, MessageSquare } from "lucide-react";

const SessionCard = ({ session, onOpenDetails, onRejoin }) => {
  const isEnded = session.status === "ended";

  const participantCount = Array.isArray(session.participants)
    ? session.participants.length
    : session.participants ?? 0;

  const messageCount = Array.isArray(session.messages)
    ? session.messages.length
    : session.messages ?? 0;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-mono text-slate-500">
          ID: {session.meetingId}
        </span>

        <span
          className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs ${
            isEnded
              ? "bg-slate-100 text-slate-500"
              : "bg-emerald-50 text-emerald-600"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isEnded ? "bg-slate-400" : "bg-emerald-500"
            }`}
          />
          {isEnded ? "Ended" : "Active"}
        </span>
      </div>

      <h3 className="mt-3 text-base font-semibold text-slate-900">
        {session.title}
      </h3>

      <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-400">
        <Calendar size={14} />
        {new Date(session.createdAt).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="flex items-center justify-center gap-1 rounded-lg bg-slate-100 px-2 py-2 text-xs text-slate-500">
          <Users size={14} />
          {participantCount}
        </div>

        <div className="flex items-center justify-center gap-1 rounded-lg bg-slate-100 px-2 py-2 text-xs text-slate-500">
          <MessageSquare size={14} />
          {messageCount}
        </div>

        <button
          onClick={onOpenDetails}
          className="rounded-lg bg-slate-100 px-2 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200"
        >
          View details
        </button>
      </div>

      {!isEnded && (
        <button
          onClick={() => onRejoin(session.meetingId)}
          className="mt-2 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Re-join
        </button>
      )}
    </div>
  );
};

export default SessionCard;