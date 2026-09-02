import { Link, useLocation } from "react-router-dom";
import {
  HistoryIcon,
  LayoutDashboardIcon,
  SparklesIcon,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/react";

const Navbar = () => {
  const location = useLocation();
  const { isSignedIn, user } = useUser();

  const userName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "user";

  const getNavClass = (path) => {
    const isActive = location.pathname === path;

    return `px-3 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
      isActive
        ? "ring ring-blue-100 bg-blue-50 text-slate-800"
        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
    }`;
  };

  return (
    <header className="w-full max-w-[1220px] mx-auto bg-white/90 backdrop-blur xl:rounded-b-xl sticky top-0 z-40 px-6 py-4 flex items-center justify-between border border-slate-200">

      {/* Logo */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2"
      >
        <img
          src="/logo.svg"
          alt="Meetup logo"
          className="w-7 h-7"
        />

        <span className="text-2xl font-medium tracking-tight text-slate-900">
          Meetup<span className="text-blue-600">.</span>
        </span>
      </Link>

      {/* Navigation */}
      {isSignedIn && (
        <nav className="hidden md:flex items-center gap-1.5 ml-8">

          {/* Dashboard */}
          <Link
            to="/dashboard"
            className={getNavClass("/dashboard")}
          >
            <LayoutDashboardIcon className="w-4 h-4" />
            Dashboard
          </Link>

          {/* Sessions */}
          <Link
            to="/sessions"
            className={getNavClass("/sessions")}
          >
            <HistoryIcon className="w-4 h-4" />
            Sessions
          </Link>

          {/* Pricing */}
          <Link
            to="/pricing"
            className={getNavClass("/pricing")}
          >
            <SparklesIcon className="w-4 h-4" />
            Pricing
          </Link>

        </nav>
      )}

      {/* Right Side */}
      {isSignedIn && (
        <div className="flex items-center gap-4">

          {/* Mobile Sessions */}
          <Link
            to="/sessions"
            className="md:hidden text-xs font-medium text-slate-600 hover:text-primary flex items-center gap-1"
          >
            <HistoryIcon className="w-4 h-4" />
            Sessions
          </Link>

          {/* Welcome */}
          <span className="font-medium hidden sm:inline tracking-wide text-sm text-slate-700">
            Welcome, {userName}
          </span>

          {/* User Button */}
          <UserButton afterSignOutUrl="/login" />

        </div>
      )}

    </header>
  );
};

export default Navbar;

