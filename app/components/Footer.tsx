import { Link } from "react-router";
import { Logo } from "~/components/atoms";

const PRODUCT_LINKS = [
  { to: "/", label: "My resumes" },
  { to: "/upload", label: "Upload a resume" },
  { to: "/history", label: "Score history" },
  { to: "/pricing", label: "Pricing" },
  { to: "/settings", label: "Settings" },
];

const Footer = () => {
  return (
    <footer
      style={{
        width: "100%",
        borderTop: "var(--bw) solid var(--ink)",
        background: "var(--surface)",
        position: "relative",
        zIndex: 2,
      }}
    >
      {/* Main footer grid */}
      <div
        className="rl-container"
        style={{
          padding: "48px var(--gutter-inner)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 32,
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Logo size={16} />
          <p
            style={{
              fontSize: 13.5,
              fontWeight: 500,
              color: "var(--fg-2)",
              lineHeight: 1.7,
              maxWidth: 280,
            }}
          >
            AI feedback for your resume — clear scores, keyword gaps, and
            stronger bullet rewrites, so you walk into every application with
            confidence.
          </p>
        </div>

        {/* Product links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span className="eyebrow">Product</span>
          {PRODUCT_LINKS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                fontSize: 13.5,
                fontWeight: 700,
                color: "var(--fg-2)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "color var(--dur-fast) ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--ink)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--fg-2)";
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* What you get */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span className="eyebrow">What you get</span>
          {[
            "ATS score across 5 dimensions",
            "Keyword match vs the job post",
            "AI bullet rewrites",
            "Interview question prep",
          ].map((item) => (
            <span
              key={item}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "var(--fg-2)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  background: "var(--lime)",
                  border: "var(--bw) solid var(--ink)",
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
              {item}
            </span>
          ))}
        </div>

        {/* Privacy */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span className="eyebrow">Your data</span>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--fg-2)",
              lineHeight: 1.7,
              maxWidth: 260,
            }}
          >
            Your resume is stored in your own Puter cloud — no third-party
            access, delete it anytime.
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          borderTop: "1px solid var(--line)",
          padding: "16px var(--gutter-inner)",
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          maxWidth: "var(--content-max)",
          margin: "0 auto",
        }}
      >
        <span className="mono-stamp">
          © {new Date().getFullYear()} RESUMELENS
        </span>
        <span className="mono-stamp">MADE FOR JOB SEEKERS, NOT BOTS</span>
      </div>
    </footer>
  );
};

export default Footer;
