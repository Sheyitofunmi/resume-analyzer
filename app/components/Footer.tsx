import { Link } from "react-router";
import { Logo } from "~/components/atoms";

const FEATURES = [
  { k: "ATS", label: "ats_score" },
  { k: "KW", label: "keyword_analysis" },
  { k: "RW", label: "rewrite_tips" },
  { k: "TS", label: "tone_style" },
  { k: "IV", label: "interview_prep" },
];

const Footer = () => {
  return (
    <footer
      className="rl-footer"
      style={{
        width: "100%",
        borderTop: "1px solid var(--border)",
        background: "var(--bg-2)",
        marginTop: 64,
        position: "relative",
        zIndex: 2,
      }}
    >
      {/* Feature chip strip */}
      <div
        style={{
          borderBottom: "1px dashed var(--border)",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "center",
          gap: 16,
          flexWrap: "wrap",
          maxWidth: 1280,
          margin: "0 auto",
        }}
      >
        {FEATURES.map((f) => (
          <span key={f.k} className="rl-chip">
            <span style={{ color: "var(--copper)" }}>[{f.k}]</span>
            <span>{f.label}</span>
          </span>
        ))}
      </div>

      {/* Main footer grid */}
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "40px 24px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 32,
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Logo size={15} />
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--fg-3)",
              lineHeight: 1.7,
              maxWidth: 280,
            }}
          >
            AI feedback for your resume. Five-dimension scoring. Keyword diff.
            Rewrite tips. Built for engineers who'd rather read a structured
            report than a vibe-check.
          </p>
        </div>

        {/* Product links */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span className="rl-comment">product</span>
          {[
            { to: "/", label: "my_resumes" },
            { to: "/upload", label: "upload_resume" },
            { to: "/history", label: "score_history" },
            { to: "/pricing", label: "pricing" },
            { to: "/settings", label: "settings" },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "var(--fg-2)",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                transition: "color var(--dur-fast)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--copper-hi)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--fg-2)")
              }
            >
              <span style={{ color: "var(--fg-3)" }}>→</span> {item.label}
            </Link>
          ))}
        </div>

        {/* Powered by */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span className="rl-comment">powered_by</span>
          {["claude (anthropic)", "puter cloud", "react router v7"].map(
            (item) => (
              <span
                key={item}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--fg-2)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ color: "var(--phos)" }}>✓</span> {item}
              </span>
            ),
          )}
        </div>

        {/* Status */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span className="rl-comment">status</span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--fg-2)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span className="rl-dot" /> all systems operational
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--fg-2)",
            }}
          >
            · 3s avg analysis time
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--fg-2)",
            }}
          >
            · 100+ keyword signals
          </span>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="rl-footer-bottom">
        <span>
          // © {new Date().getFullYear()} resumelens — your data, your machine.
        </span>
        <span>// stored via puter — no third-party access.</span>
      </div>
    </footer>
  );
};

export default Footer;
