import { Link, useLocation } from "react-router";
import { usePuterStore } from "~/lib/puter";

const Navbar = () => {
  const { auth } = usePuterStore();
  const location = useLocation();
  const user = auth.user;
  const initials = user?.username
    ? user.username.slice(0, 2).toUpperCase()
    : "??";
  const isUpload = location.pathname === "/upload";

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 24px",
        borderBottom: "1px solid var(--border)",
        background: "rgba(11,11,10,0.88)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        gap: 16,
      }}
    >
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Link to="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontFamily: "var(--font-mono)",
              fontSize: 16,
              fontWeight: 500,
              color: "var(--fg-1)",
              letterSpacing: "0.04em",
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                background: "var(--phos)",
                color: "var(--bg)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                boxShadow: "0 0 12px var(--phos-glow)",
                flexShrink: 0,
              }}
            >
              R
            </span>
            <span>
              resumelens
              <span style={{ color: "var(--phos)" }}>_</span>
            </span>
          </span>
        </Link>
        <span
          style={{
            color: "var(--fg-4)",
            fontSize: 11,
            letterSpacing: "0.15em",
          }}
          className="rl-mobile-hide"
        >
          v1.0.0
        </span>
      </div>

      {/* Center prompt */}
      <div
        className="rl-mobile-hide"
        style={{
          flex: 1,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          color: "var(--fg-3)",
          textAlign: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        <span className="rl-dot" />
        <span>
          <span style={{ color: "var(--fg-3)" }}>$</span>{" "}
          {isUpload ? "resumelens analyze" : "resumelens dashboard"}
        </span>
      </div>

      {/* Right: user + CTA */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {auth.isAuthenticated && user && (
          <div
            className="rl-mobile-hide"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 10px",
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

        <Link
          to={isUpload ? "/" : "/upload"}
          className={`rl-btn ${isUpload ? "rl-btn-secondary" : "rl-btn-primary"}`}
          style={{ fontSize: 12 }}
        >
          {isUpload ? "← my_resumes" : "$ upload_resume →"}
        </Link>

        {auth.isAuthenticated && (
          <button
            onClick={auth.signOut}
            className="rl-mobile-hide"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              color: "var(--fg-3)",
              fontFamily: "var(--font-mono)",
              padding: "4px 8px",
              transition: "color var(--dur-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ember)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-3)")}
          >
            sign_out
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
