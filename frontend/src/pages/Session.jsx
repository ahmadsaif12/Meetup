import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { useState } from "react";
import { dummySessions } from "../assets/asset";
import EmptySession from "../components/sessions/EmptySession";
import SessionCard from "../components/sessions/SessionCard";
import SessionDetailModal from "../components/sessions/SessionDetailModal";

const Session = () => {
  const [sessions] = useState(dummySessions);
  const [selectedSession, setSelectedSession] = useState(null);
  const navigate = useNavigate();

  return (
    <main className="flex-1 max-w-6xl mx-auto w-full p-6 md:p-12">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary transition"
      >
        <ArrowLeftIcon size={14} />
        Go to Dashboard
      </Link>

      <div className="mt-8">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900">
          Meeting Sessions
        </h1>

        <p className="mt-2 text-sm md:text-base text-slate-500">
          Review your past and active meeting history, participants, logs, and
          chat transcripts.
        </p>
      </div>

      {sessions.length === 0 ? (
        <EmptySession />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onOpenDetails={() => setSelectedSession(session)}
              onRejoin={(meetingId) => navigate(`/meeting/${meetingId}`)}
            />
          ))}
        </div>
      )}

      <SessionDetailModal
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </main>
  );
};

export default Session;