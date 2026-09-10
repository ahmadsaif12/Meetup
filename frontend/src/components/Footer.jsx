import { HeartIcon } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-white/60 backdrop-blur border-t border-slate-200/80 mt-auto">
      <div className="max-w-[900px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-indigo-500 flex-none">
              <img src="/logo.svg" alt="Meetup logo" className="w-4 h-4 brightness-0 invert" />
            </span>
            <p className="text-xs text-slate-500 truncate">
              &copy; {new Date().getFullYear()} Meetup. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-5 flex-none">
            <button className="text-xs font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer">
              Privacy
            </button>
            <button className="text-xs font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer">
              Terms
            </button>
            <button className="text-xs font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer">
              Support
            </button>
          </div>
        </div>

        <p className="mt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1">
          Built with <HeartIcon className="w-3 h-3 text-rose-500 fill-rose-500" /> for better calls
        </p>
      </div>
    </footer>
  );
};

export default Footer;