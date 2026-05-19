import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export const meta = () => [
  { title: "ResumeLens | Sign In" },
  { name: "description", content: "Log into your account" },
];

const Auth = () => {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();
  const next = location.search.split("next=")[1];
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) navigate(next || "/");
  }, [auth.isAuthenticated, next]);

  return (
    <main
      className="rl-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-8)",
      }}
    >
      <div
        className="rl-card is-raised rl-fade-in"
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 480,
          display: "flex",
          flexDirection: "column",
          gap: 0,
          padding: 0,
          overflow: "hidden",
        }}
      >
        <span className="rl-corner tl" />
        <span className="rl-corner tr" />
        <span className="rl-corner bl" />
        <span className="rl-corner br" />

        {/* Window chrome dots */}
        <div
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "var(--bg-2)",
          }}
        >
          {["var(--ember)", "var(--copper)", "var(--phos)"].map((c, i) => (
            <span
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: c,
                opacity: 0.7,
              }}
            />
          ))}
          <span
            style={{
              marginLeft: 12,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--fg-3)",
              letterSpacing: "0.1em",
            }}
          >
            resumelens — auth
          </span>
        </div>

        {/* Body */}
        <div
          style={{
            padding: "var(--space-8)",
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span className="rl-eyebrow-prompt">resumelens auth</span>
            <h1
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(28px, 5vw, 40px)",
                fontWeight: 500,
                lineHeight: 1.05,
                letterSpacing: "-1.5px",
                color: "var(--fg-1)",
                margin: 0,
              }}
            >
              welcome_back
              <span className="rl-cursor" />
            </h1>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--fg-2)",
                lineHeight: 1.7,
              }}
            >
              Log in to continue your job journey.
            </p>
          </div>

          {/* Puter info box */}
          <div
            style={{
              background: "var(--surface-2)",
              border: "1px dashed var(--border-hi)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--copper)",
              }}
            >
              // what is puter?
            </span>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--fg-2)",
                lineHeight: 1.65,
              }}
            >
              ResumeLens uses{" "}
              <span style={{ color: "var(--fg-1)", fontWeight: 500 }}>
                Puter
              </span>{" "}
              — a free cloud platform — to securely store your resumes and AI
              analysis. No separate sign-up required.
            </p>
          </div>

          {/* CTA */}
          {isLoading ? (
            <button
              className="rl-btn rl-btn-primary rl-btn-block"
              disabled
              style={{ opacity: 0.6, cursor: "not-allowed", fontSize: 14 }}
            >
              <span className="rl-dot" /> signing in…
            </button>
          ) : auth.isAuthenticated ? (
            <button
              className="rl-btn rl-btn-secondary rl-btn-block"
              onClick={auth.signOut}
              style={{ fontSize: 14 }}
            >
              sign_out
            </button>
          ) : (
            <button
              className="rl-btn rl-btn-primary rl-btn-block"
              onClick={auth.signIn}
              style={{ fontSize: 14 }}
            >
              $ log_in_with_puter →
            </button>
          )}
        </div>
      </div>
    </main>
  );
};

export default Auth;
