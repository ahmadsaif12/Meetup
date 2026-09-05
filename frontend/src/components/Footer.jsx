const Footer = () => {
  return (
    <footer className="w-full bg-blue-100/40 border-t border-blue-200/60 px-6 py-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-slate-700">
          &copy; {new Date().getFullYear()} All rights reserved.
        </p>

        <div className="flex items-center gap-5">
          <button className="text-xs font-medium text-slate-700 hover:text-blue-600 transition">
            Privacy
          </button>
          <button className="text-xs font-medium text-slate-700 hover:text-blue-600 transition">
            Terms
          </button>
          <button className="text-xs font-medium text-slate-700 hover:text-blue-600 transition">
            Support
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;