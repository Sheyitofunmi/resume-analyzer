import { Link, useLocation } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { useEffect, useState } from "react";

const Navbar = () => {
  const { auth } = usePuterStore();
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const user = auth.user;
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";
  const isUpload = location.pathname === "/upload";

  return (
    <nav
      className={`sticky top-3 z-50 transition-all duration-300 navbar ${
        scrolled ? "shadow-lg shadow-indigo-100/60 scale-[0.99]" : ""
      }`}
    >
      <Link to="/" className="group flex items-center gap-2">
        <p className="text-2xl font-bold text-gradient transition-opacity group-hover:opacity-80">
          RESUMIND
        </p>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        {auth.isAuthenticated && user && (
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-gray-50 border border-gray-100 hover:border-indigo-100 transition-colors">
            <div className="w-7 h-7 rounded-full primary-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <span className="text-sm text-gray-600 hidden sm:block max-w-[110px] truncate font-medium">
              {user.username}
            </span>
          </div>
        )}

        <Link
          to={isUpload ? "/" : "/upload"}
          className="primary-button w-fit text-sm sm:text-base"
        >
          {isUpload ? "← My Resumes" : "Upload Resume"}
        </Link>

        {auth.isAuthenticated && (
          <button
            onClick={auth.signOut}
            className="hidden sm:block text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
            aria-label="Sign out"
          >
            Sign out
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
