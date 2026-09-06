import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

const EmptySession = () => {
  return (
    <div className="w-full min-h-[400px] mt-10 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center px-6 py-12">
      <h3 className="text-2xl font-semibold text-slate-900">
        No meeting history yet
      </h3>

      <p className="mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
        Once you create or join meeting calls, your meeting sessions,
        participants and chat logs will appear here.
      </p>

      <Link
        to="/dashboard"
        className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary-hover transition"
      >
        Start a meeting
        <ArrowRightIcon size={18} />
      </Link>
    </div>
  );
};

export default EmptySession;

