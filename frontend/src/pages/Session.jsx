import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@clerk/react";
import { toast } from "react-hot-toast";
import EmptySession from "../components/sessions/EmptySession";
import SessionCard from "../components/sessions/SessionCard";
import SessionDetailModal from "../components/sessions/SessionDetailModal";
import api, { setAuthTokenGetter } from "../../config/api.js";

const Session = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const navigate = useNavigate();
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(getToken);
  }, [getToken]);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!isLoaded || !isSignedIn) return;
      try {
        const token = await getToken();
        const { data } = await api.get("/meetings/user/sessions", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSessions(data.sessions ?? []);
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to load sessions");
      }
    };
    fetchSessions();
  }, [isLoaded, isSignedIn, getToken]);

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
              key={session.id ?? session.meetingId}
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