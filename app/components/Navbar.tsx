import { Link, useLocation } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { Logo } from "~/components/atoms";

const NAV_LINKS = [
  { to: "/", label: "dashboard", exact: true },
  { to: "/upload", label: "upload", exact: false },
  { to: "/history", label: "history", exact: false },
  { to: "/pricing", label: "pricing", exact: false },
  { to: "/settings", label: "settings", exact: false },
  { to: "/landing", label: "home", exact: false },
];

const Navbar = () => {
  const { auth } = usePuterStore();
  const location = useLocation();
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
        background: "rgba(11,11,10,0.88)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        gap: 12,
        minWidth: 0,
      }}
    >
      {/* Logo */}
      <Link to="/landing" style={{ textDecoration: "none", flexShrink: 0 }}>
        <Logo size={15} />
      </Link>

      {/* Nav links — desktop */}
      <div
        className="rl-mobile-hide"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
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
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: active ? "var(--fg-1)" : "var(--fg-3)",
                textDecoration: "none",
                padding: "5px 10px",
                borderRadius: "var(--radius-sm)",
                background: active ? "var(--surface)" : "transparent",
                border: active
                  ? "1px solid var(--border-hi)"
                  : "1px solid transparent",
                letterSpacing: "0.04em",
                transition: "all var(--dur-fast)",
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.color = "var(--fg-1)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.color = "var(--fg-3)";
              }}
            >
              {active && (
                <span style={{ color: "var(--phos)", marginRight: 4 }}>▶</span>
              )}
              {label}
            </Link>
          );
        })}
      </div>

      {/* Right: user + sign out */}
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
            <span
              style={{
                width: 18,
                height: 18,
                background: "var(--copper)",
                color: "var(--bg)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {initials}
            </span>
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
            to="/upload"
            className="rl-btn rl-btn-primary"
            style={{ fontSize: 12 }}
          >
            $ upload<span className="rl-mobile-hide">_resume</span> →
          </Link>
        )}

        {auth.isAuthenticated ? (
          <button
            onClick={auth.signOut}
            className="rl-btn rl-btn-ghost rl-mobile-hide"
            style={{ fontSize: 12 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ember)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
          >
            sign_out
          </button>
        ) : (
          <Link
            to="/auth"
            className="rl-btn rl-btn-primary"
            style={{ fontSize: 12 }}
          >
            $ sign_in →
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
