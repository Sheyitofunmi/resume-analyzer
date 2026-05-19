import { Link, useLocation } from "react-router";
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
  const { auth } = usePuterStore();
  const location = useLocation();

  const user = auth.user;
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "?";
  const isUpload = location.pathname === "/upload";

  return (
    <nav className="sticky top-0 z-50 bg-[#f8f7f4] border-b border-[#e5e5e5]">
      <div className="navbar">
        <Link to="/" className="group">
          <span
            className="text-2xl font-bold tracking-tight text-[#0a0a0a] group-hover:text-[#e11d48] transition-colors"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            ResumeLens
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {auth.isAuthenticated && user && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#0a0a0a] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <span className="text-sm text-[#525252] hidden sm:block max-w-[110px] truncate">
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
              className="hidden sm:block text-xs text-[#525252] hover:text-[#0a0a0a] px-2 py-1 transition-colors"
              aria-label="Sign out"
            >
              Sign out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
