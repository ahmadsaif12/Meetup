const Footer = () => {
  return (
    <footer className="w-full max-w-[1220px] mx-auto bg-white/10 backdrop-blur xl:rounded-t-xl px-6 py-4 text-center">
      <p className="text-xs font-medium text-white">
        &copy; {new Date().getFullYear()} Meetup. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;

