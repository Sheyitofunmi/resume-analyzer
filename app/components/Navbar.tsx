import { Link, useLocation } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import { usePuterStore } from "~/lib/puter";
import { Logo } from "~/components/atoms";
import { springs } from "~/lib/motion";
import { useProductTour } from "~/hooks/useProductTour";

const NAV_LINKS = [
  { to: "/", label: "dashboard", exact: true },
  { to: "/upload", label: "upload", exact: false },
  { to: "/history", label: "history", exact: false },
  { to: "/pricing", label: "pricing", exact: false },
  { to: "/settings", label: "settings", exact: false },
];

const Navbar = () => {
  const { auth } = usePuterStore();
  const location = useLocation();
  const reduced = useReducedMotion();
  const { startTour } = useProductTour();
  const user = auth.user;
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";

  const isActive = (to: string, exact: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 16px",
        borderBottom: "1px solid var(--border)",
        background: "rgba(11,11,10,0.9)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        gap: 12,
        minWidth: 0,
      }}
    >
      {/* Logo */}
      <Link to="/landing" style={{ textDecoration: "none", flexShrink: 0 }}>
        <motion.div
          whileHover={reduced ? {} : { scale: 1.04 }}
          whileTap={reduced ? {} : { scale: 0.97 }}
          transition={springs.snappy}
          style={{ display: "inline-flex" }}
        >
          <Logo size={15} />
        </motion.div>
      </Link>

      {/* Nav links — desktop */}
      <div
        id="nav-links"
        className="rl-mobile-hide"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flex: 1,
          justifyContent: "center",
        }}
      >
        {NAV_LINKS.map(({ to, label, exact }) => {
          const active = isActive(to, exact);
          return (
            <Link
              key={to}
              to={to}
              style={{
                position: "relative",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: active ? "var(--fg-1)" : "var(--fg-3)",
                textDecoration: "none",
                padding: "5px 12px",
                borderRadius: "var(--radius-sm)",
                letterSpacing: "0.04em",
                transition: "color var(--dur-fast), background var(--dur-fast)",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = "var(--fg-1)";
                  el.style.background = "var(--surface)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.color = "var(--fg-3)";
                  el.style.background = "transparent";
                }
              }}
            >
              {/* Sliding active background */}
              {active && (
                <motion.span
                  layoutId="nav-active-bg"
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "var(--surface)",
                    border: "1px solid var(--border-hi)",
                    borderRadius: "var(--radius-sm)",
                    zIndex: -1,
                  }}
                  transition={reduced ? { duration: 0 } : springs.smooth}
                />
              )}
              {active && (
                <motion.span
                  layoutId="nav-active-dot"
                  style={{ color: "var(--phos)", fontSize: 8, lineHeight: 1 }}
                  transition={reduced ? { duration: 0 } : springs.smooth}
                >
                  ◆
                </motion.span>
              )}
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right: user + actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexShrink: 0,
          minWidth: 0,
        }}
      >
        {auth.isAuthenticated && user && (
          <div
            className="rl-mobile-hide"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "4px 10px",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              fontSize: 12,
            }}
          >
            <motion.span
              whileHover={reduced ? {} : { scale: 1.1 }}
              transition={springs.snappy}
              style={{
                width: 20,
                height: 20,
                background: "var(--copper)",
                color: "var(--bg)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                borderRadius: "50%",
                flexShrink: 0,
                boxShadow: "0 0 8px var(--copper-glow)",
              }}
            >
              {initials}
            </motion.span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--fg-2)",
                maxWidth: 110,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.username}
            </span>
          </div>
        )}

        {auth.isAuthenticated && (
          <Link
            id="nav-upload-btn"
            to="/upload"
            style={{ textDecoration: "none" }}
          >
            <motion.span
              className="rl-btn rl-btn-primary"
              style={{
                fontSize: 12,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
              whileHover={reduced ? {} : { y: -2, scale: 1.02 }}
              whileTap={reduced ? {} : { y: 0, scale: 0.97 }}
              transition={springs.snappy}
            >
              $ upload<span className="rl-mobile-hide">_resume</span> →
            </motion.span>
          </Link>
        )}

        {auth.isAuthenticated && (
          <motion.button
            id="tour-btn"
            onClick={startTour}
            className="rl-btn rl-btn-ghost rl-mobile-hide"
            style={{ fontSize: 12 }}
            whileHover={reduced ? {} : { color: "var(--phos)" }}
            whileTap={reduced ? {} : { scale: 0.97 }}
            transition={springs.snappy}
            title="take a tour"
          >
            ? tour
          </motion.button>
        )}

        {auth.isAuthenticated ? (
          <motion.button
            onClick={auth.signOut}
            className="rl-btn rl-btn-ghost rl-mobile-hide"
            style={{ fontSize: 12 }}
            whileHover={reduced ? {} : { color: "var(--ember)" }}
            whileTap={reduced ? {} : { scale: 0.97 }}
            transition={springs.snappy}
          >
            sign_out
          </motion.button>
        ) : (
          <Link to="/auth" style={{ textDecoration: "none" }}>
            <motion.span
              className="rl-btn rl-btn-primary"
              style={{ fontSize: 12, display: "inline-flex" }}
              whileHover={reduced ? {} : { y: -2, scale: 1.02 }}
              whileTap={reduced ? {} : { scale: 0.97 }}
              transition={springs.snappy}
            >
              $ sign_in →
            </motion.span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
