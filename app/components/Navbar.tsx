import { Link, useLocation } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import { usePuterStore } from "~/lib/puter";
import { Logo } from "~/components/atoms";
import { springs } from "~/lib/motion";
import { useProductTour } from "~/hooks/useProductTour";

const NAV_LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/landing", label: "Landing", exact: true },
  { to: "/upload", label: "Upload", exact: false },
  { to: "/history", label: "History", exact: false },
  { to: "/settings", label: "Settings", exact: false },
];

const Navbar = () => {
  const { auth } = usePuterStore();
  const location = useLocation();
  const reduced = useReducedMotion();
  const { startTour } = useProductTour();

  const user = auth.user;
  const initials = user?.username
    ? user.username.slice(0, 1).toUpperCase()
    : "?";

  const isActive = (to: string, exact: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px var(--gutter)",
        borderBottom: "var(--bw) solid var(--ink)",
        background: "var(--surface)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        gap: 16,
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
          minWidth: 0,
        }}
      >
        <Link
          to="/"
          style={{ textDecoration: "none", flexShrink: 0 }}
          aria-label="ResumeLens home"
        >
          <Logo size={16} />
        </Link>

        {/* Nav links — desktop */}
        {auth.isAuthenticated && (
          <div
            id="nav-links"
            className="mobile-hide"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {NAV_LINKS.map(({ to, label, exact }) => {
              const active = isActive(to, exact);
              return (
                <Link
                  key={to}
                  to={to}
                  aria-current={active ? "page" : undefined}
                  style={{
                    position: "relative",
                    fontSize: 13,
                    fontWeight: 800,
                    color: "var(--ink)",
                    textDecoration: "none",
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: "var(--bw) solid transparent",
                    zIndex: 0,
                    transition: "background var(--dur-fast) ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!active)
                      e.currentTarget.style.background = "var(--fill-2)";
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = "";
                  }}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active-bg"
                      style={{
                        position: "absolute",
                        inset: -1.5,
                        background: "var(--cyan)",
                        border: "var(--bw) solid var(--ink)",
                        borderRadius: 8,
                        zIndex: -1,
                      }}
                      transition={reduced ? { duration: 0 } : springs.smooth}
                    />
                  )}
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: plan badge + tour + avatar / sign in */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexShrink: 0,
          minWidth: 0,
        }}
      >
        {auth.isAuthenticated && (
          <Link
            to="/pricing"
            className="badge-mono mobile-hide"
            id="nav-upload-btn"
          >
            Free plan · Upgrade
          </Link>
        )}

        {auth.isAuthenticated && (
          <button
            id="tour-btn"
            onClick={startTour}
            className="mobile-hide"
            title="Take a tour"
            aria-label="Take a tour"
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              border: "var(--bw) solid var(--ink)",
              background: "var(--surface)",
              fontWeight: 900,
              fontSize: 14,
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background var(--dur-fast) ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--fill-2)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--surface)")
            }
          >
            ?
          </button>
        )}

        {auth.isAuthenticated && user && (
          <span
            title={user.username}
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "var(--violet)",
              border: "var(--bw) solid var(--ink)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 900,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {initials}
          </span>
        )}

        {auth.isAuthenticated ? (
          <button
            onClick={auth.signOut}
            className="btn btn--outline btn--sm mobile-hide"
          >
            Sign out
          </button>
        ) : (
          <Link to="/auth" className="btn btn--primary btn--sm">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
