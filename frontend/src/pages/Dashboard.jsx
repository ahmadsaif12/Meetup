import {
  Plus,
  ShieldCheck,
  Keyboard,
  ArrowRight,
  Video,
  Clock,
  CalendarDays,
  Sparkles,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth, useUser } from "@clerk/react";

import api, { setAuthTokenGetter } from "../../config/api.js";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useUser();

  const [isCreating, setIsCreating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [joinId, setJoinId] = useState("");

  const userName = user?.fullName || "User";
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAuthTokenGetter(getToken);
  }, [getToken]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      if (!isLoaded || !isSignedIn) return;
      try {
        const token = await getToken();
        const { data } = await api.get("/meetings/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(data);
      } catch (error) {
        toast.error(error.response?.data?.error || error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isLoaded, isSignedIn, getToken]);

  const handleCreateMeeting = async () => {
    setIsCreating(true);
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/meetings",
        { title: "Instant Meeting" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Meeting created successfully!");
      navigate(`/meeting/${data.meeting.meetingId}`);
    } catch (error) {
      const msg =
        error.response?.data?.error || "Failed to create meeting";
      toast.error(msg);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();

    if (!joinId.trim()) {
      toast.error("Please enter a valid meeting code.");
      return;
    }

    navigate(`/meeting/${joinId.trim()}`);
  };

  const isPremium = stats?.plan === "premium";
  const monthlyMeet = stats?.stats?.monthlyMeetings ?? 0;
  const monthlyLimit = stats?.stats?.limit ?? null;
  const totalMeetings = stats?.stats?.totalMeetings ?? 0;
  const totalParticipants = stats?.stats?.totalParticipants ?? 0;
  const usagePct =
    monthlyLimit > 0 && monthlyLimit
      ? Math.min(100, Math.round((monthlyMeet / monthlyLimit) * 100))
      : 0;
  const recentMeetings = stats?.recentMeetings ?? [];

  const timeGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const features = [
    { icon: Video, label: "HD video" },
    { icon: Zap, label: "<100ms latency" },
    { icon: ShieldCheck, label: "Encrypted" },
    { icon: Sparkles, label: isPremium ? "Unlimited meetings" : "Free plan" },
  ];

  return (
    <div className="flex-1 w-full max-w-[1220px] mx-auto px-6 py-10 md:py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* ── Hero ── */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
            <ShieldCheck size={16} />
            <span className="px-4 py-2 rounded-full bg-blue-50 border border-blue-100 font-semibold">
              Secure Peer-to-Peer Encryption
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold text-slate-900 leading-[1.08]">
            High quality
            <br />
            video calls.
            <br />
            <span className="bg-gradient-to-r from-primary via-indigo-500 to-primary bg-clip-text text-transparent">
              Built for everyone
            </span>
          </h1>

          <p className="text-slate-700 text-base sm:text-lg max-w-xl leading-relaxed">
            Connect, collaborate and communicate from anywhere with
            ultra-low latency video, screen sharing and real-time chat.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCreateMeeting}
              disabled={isCreating}
              className="bg-primary hover:bg-primary-hover text-white px-7 py-4 rounded-full font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
            >
              <Plus size={20} />
              {isCreating ? "Creating..." : "New Meeting"}
            </button>

            <form onSubmit={handleJoinMeeting} className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Keyboard
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                  size={20}
                />
                <input
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  placeholder="Enter meeting code"
                  className="w-full bg-white border border-slate-200 rounded-full pl-12 pr-4 py-4 outline-none text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                />
              </div>

              <button
                type="submit"
                disabled={!joinId.trim()}
                className="bg-black text-white px-6 py-4 rounded-full font-semibold flex items-center gap-1 disabled:opacity-50 hover:bg-slate-800 transition"
              >
                Join <ArrowRight size={17} />
              </button>
            </form>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {features.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
              >
                <Icon size={13} className="text-primary" />
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* ── Live clock / stats card ── */}
        <div className="lg:col-span-5">
          <div className="relative overflow-hidden rounded-4xl bg-white/75 backdrop-blur-xl border border-white/60 p-7 shadow-xl shadow-slate-200/70">
            <div className="pointer-events-none absolute -top-20 -right-20 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-indigo-200/40 blur-3xl" />

            <div className="flex items-center justify-between relative">
              <p className="text-slate-600">
                {timeGreeting()},{" "}
                <span className="font-semibold text-slate-900">{userName}</span>
              </p>

              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider ${
                  isPremium
                    ? "bg-gradient-to-r from-primary to-indigo-500 text-white shadow-md shadow-primary/25"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <Sparkles size={12} />
                {stats?.plan || "Free"}
              </span>
            </div>

            <h2 className="text-5xl xl:text-6xl font-bold text-slate-900 text-center my-6 tabular-nums tracking-tight">
              {currentTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </h2>

            <p className="text-center font-medium text-slate-500 flex items-center justify-center gap-1.5">
              <CalendarDays size={15} className="text-primary" />
              {currentTime.toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            <div className="mt-6 pt-6 border-t border-slate-200 space-y-4 relative">
              <p className="text-xs text-slate-500 truncate">
                Logged in as:{" "}
                <span className="text-slate-800 font-semibold">{userEmail}</span>
              </p>

              {loading ? (
                <div className="h-12 animate-pulse rounded-2xl bg-slate-100" />
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
                      <p className="text-slate-400 text-xs flex items-center gap-1">
                        <Video size={13} className="text-primary" /> Meetings
                      </p>
                      <p className="mt-1 font-bold text-slate-900 text-lg tabular-nums">
                        {totalMeetings}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
                      <p className="text-slate-400 text-xs flex items-center gap-1">
                        <Clock size={13} className="text-primary" /> Participants
                      </p>
                      <p className="mt-1 font-bold text-slate-900 text-lg tabular-nums">
                        {totalParticipants}
                      </p>
                    </div>
                  </div>

                  {monthlyLimit ? (
                    <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3 shadow-sm">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-medium">
                          Monthly usage
                        </span>
                        <span className="text-slate-700 tabular-nums">
                          {monthlyMeet} / {monthlyLimit}
                        </span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            usagePct >= 80
                              ? "bg-rose-500"
                              : "bg-gradient-to-r from-primary to-indigo-400"
                          }`}
                          style={{ width: `${usagePct}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl bg-blue-50 border border-blue-100 px-4 py-3 text-xs font-medium text-primary flex items-center gap-2">
                      <Sparkles size={14} />
                      {isPremium
                        ? "Premium — unlimited monthly meetings"
                        : "Free plan — 30 meetings / month"}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent meetings ── */}
      <div className="mt-14">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Recent meetings
          </h3>
          <Link
            to="/sessions"
            className="text-sm font-medium text-primary hover:text-primary-hover transition flex items-center gap-1"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {recentMeetings.length === 0 ? (
          <div className="bg-white/70 rounded-3xl border border-slate-200 px-6 py-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              No meetings yet. Start your first call with{" "}
              <span className="text-primary font-semibold">New Meeting</span>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentMeetings.map((m) => (
              <Link
                key={m.meetingId}
                to={`/meeting/${m.meetingId}`}
                className="group flex items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex size-11 flex-none items-center justify-center rounded-xl bg-blue-50 text-primary border border-blue-100">
                    <Video size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm truncate group-hover:text-primary transition">
                      {m.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 ${
                          m.status === "ended" ? "text-slate-400" : "text-emerald-600"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            m.status === "ended"
                              ? "bg-slate-400"
                              : "bg-emerald-500 animate-pulse"
                          }`}
                        />
                        {m.status === "ended" ? "Ended" : "Live"}
                      </span>
                      ·{" "}
                      {new Date(m.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <ArrowUpRight
                  size={18}
                  className="flex-none text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;