import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HistoryIcon,
  LayoutDashboardIcon,
  SparklesIcon,
  Menu,
  X,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/react";

const Navbar = () => {
  const location = useLocation();
  const { isSignedIn, user } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  const userName =
    user?.fullName ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "user";

  const getNavClass = (path) => {
    const isActive = location.pathname === path;

    return `px-3.5 py-2 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
      isActive
        ? "bg-primary text-white shadow-md shadow-primary/25"
        : "text-slate-500 hover:text-primary hover:bg-primary-light/60"
    }`;
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
    { to: "/sessions", label: "Sessions", icon: HistoryIcon },
    { to: "/pricing", label: "Pricing", icon: SparklesIcon },
  ];

  return (
    <header className="w-full sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-sm shadow-slate-200/50">
      <div className="w-full max-w-[1220px] mx-auto px-6 py-3 flex items-center justify-between gap-4">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 flex-none group">
          <span className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-indigo-500 shadow-md shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
            <img src="/logo.svg" alt="Meetup logo" className="w-5 h-5 brightness-0 invert" />
          </span>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Meetup<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop nav */}
        {isSignedIn && (
          <nav className="hidden md:flex items-center gap-1.5">
            {links.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} className={getNavClass(to)}>
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
        )}

        {/* Right side */}
        {isSignedIn && (
          <div className="flex items-center gap-3">
            <span className="hidden lg:flex items-center gap-2 pl-3 pr-1 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Welcome, <span className="font-semibold text-slate-900">{userName}</span>
            </span>

            <UserButton
              afterSignOutUrl="/login"
              appearance={{
                elements: {
                  avatarBox: "size-9 border-2 border-white shadow-md shadow-slate-200",
                },
              }}
            />

            <button
              type="button"
              onClick={() => setMobileOpen((p) => !p)}
              className="md:hidden flex size-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-primary transition-colors"
              title="Menu"
            >
              {mobileOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {isSignedIn && mobileOpen && (
        <div ref={menuRef} className="md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur">
          <div className="px-4 py-3 flex flex-col gap-1">
            {links.map(({ to, label, icon: Icon }) => {
              const isActive = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary text-white"
                      : "text-slate-600 hover:bg-primary-light/60 hover:text-primary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;