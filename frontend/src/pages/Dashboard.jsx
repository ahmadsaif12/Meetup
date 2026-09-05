import { Plus, ShieldCheck, Keyboard, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

import { dummyStats, dummyUser } from '../assets/asset';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [joinId, setJoinId] = useState('');
  const userName = dummyUser?.fullName || 'User';
  const userEmail = dummyUser?.primaryEmailAddress?.emailAddress || '';
  const stats = dummyStats;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const generateMeetingId = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz';

    const segment = () =>
      Array.from({ length: 3 }, () =>
        chars[Math.floor(Math.random() * chars.length)]
      ).join('');

    return `${segment()}-${segment()}-${segment()}`;
  };

  const handleCreateMeeting = () => {
    setIsCreating(true);
    const meetingId = generateMeetingId();
    setTimeout(() => {
      setIsCreating(false);
      toast.success('Meeting created successfully!');
      navigate(`/meeting/${meetingId}`);
    }, 400);
  };

  const handleJoinMeeting = (e) => {
    e.preventDefault();
    const meetingId = joinId.trim();
    if (!meetingId) {
      toast.error('Please enter a valid meeting code.');
      return;
    }

    navigate(`/meeting/${meetingId}`);
  };

  return (
    <div className="flex-1 w-full mx-auto p-6 md:p-12 flex flex-col justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        {/* Left */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <ShieldCheck size={19} />
            <span className='inline-flex items-center px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-slate-800 text-sm font-semibold shadow-sm'>Secure Peer-to-Peer Encryption</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight">
            High quality video calls.
            <br />
            <span className="text-primary">Built for everyone</span>
          </h1>

          <p className="text-slate-700 text-base sm:text-lg max-w-xl leading-relaxed">
            Connect, collaborate and communicate from anywhere with
            ultra-low latency video, screen sharing and real-time chat.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleCreateMeeting}
              disabled={isCreating}
              className="bg-primary hover:bg-primary-hover text-white px-6 py-3.5 rounded-full font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Plus size={20} />
              {isCreating ? 'Creating...' : 'New Meeting'}
            </button>

            <form onSubmit={handleJoinMeeting} className="flex flex-1 gap-2">
              <div className="relative flex-1">
                <Keyboard
                  size={20}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/90"
                />

                <input
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  placeholder="Enter meeting code (eg. abc-def-ghi)"
                  className="w-full bg-white/75 border border-primary-border/80 focus:border-primary/60 focus:ring-1 focus:ring-primary/60 rounded-full pl-12 pr-4 py-3.5 text-sm outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!joinId.trim()}
                className="bg-black text-white hover:bg-black hover:text-white px-6 py-3.5 rounded-full font-medium flex items-center gap-1 transition disabled:bg-black disabled:text-white disabled:opacity-100 disabled:cursor-not-allowed"
              >
                Join
                <ArrowRight size={17} />
              </button>
            </form>
          </div>
        </div>

        {/* Right */}
        <div className="lg:col-span-5">
          <div className="w-full bg-white/25 backdrop-blur rounded-4xl p-8 border border-slate-200 space-y-6">
            <div>
              <p className="text-xl text-slate-900">
                Hi, <span className="font-semibold">{userName}</span>
              </p>
              <h2 className="text-4xl xl:text-6xl text-center text-slate-900 my-5">
                {currentTime.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </h2>
              <p className="text-center font-medium text-primary">
                {currentTime.toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="pt-5 border-t border-white/30">
              <div className="flex items-center justify-between gap-4 py-4">
                <p className="text-sm text-slate-600 truncate">
                  Logged in as:{' '}
                  <span className="text-slate-900">{userEmail}</span>
                </p>
                <span
                  className={`px-4 py-1 rounded-full text-xs font-semibold uppercase ${
                    stats?.plan === 'premium'
                      ? 'bg-blue-700 text-white'
                      : 'bg-white/70 text-slate-800'
                  }`}
                >
                  {stats?.plan || 'Free'}
                </span>
              </div>
              {stats && (
                <div className="bg-white/50 rounded-2xl px-5 py-4 border border-slate-100 text-sm flex justify-between">
                  <span>Monthly Meetings</span>
                  <span className="text-xs font-mono text-slate-600">
                    {stats.monthlyLimit
                      ? `${stats.monthlyCount} / ${stats.monthlyLimit} Used`
                      : `${stats.monthlyCount} Created (Unlimited)`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

