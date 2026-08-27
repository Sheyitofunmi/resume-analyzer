import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { LogoMark } from "~/components/atoms";

export const meta = () => [
  { title: "ResumeLens | Sign In" },
  { name: "description", content: "Log into your account" },
];

const Auth = () => {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();
  const navigate = useNavigate();

  // Only same-origin paths are honoured, so a crafted ?next= can't bounce
  // a signed-in user off to another site.
  const requested = new URLSearchParams(location.search).get("next");
  const next =
    requested && requested.startsWith("/") && !requested.startsWith("//")
      ? requested
      : "/";

  // "Get started" sends people here with next=/upload; "Sign in" doesn't.
  const isNewUser = next === "/upload";

  useEffect(() => {
    if (auth.isAuthenticated) navigate(next, { replace: true });
  }, [auth.isAuthenticated, next]);

  return (
    <main
      id="main-content"
      className="g-halves"
      style={{
        minHeight: "100vh",
        gap: 0,
        background: "var(--page)",
      }}
    >
      {/* LEFT — brand panel */}
      <div
        className="rl-auth-panel"
        style={{
          position: "relative",
          background: "var(--cyan)",
          borderRight: "var(--bw) solid var(--ink)",
          padding: "36px 44px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: "40vh",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(rgba(11,11,11,.10) 1.5px,transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />
        <Link
          to="/"
          style={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            gap: 9,
            fontWeight: 900,
            fontSize: 17,
            letterSpacing: "-0.02em",
            color: "var(--ink)",
            textDecoration: "none",
            width: "fit-content",
          }}
        >
          <LogoMark size={20} />
          ResumeLens
        </Link>
        <div style={{ position: "relative", margin: "auto 0", maxWidth: 420 }}>
          <svg
            width="150"
            height="100"
            viewBox="0 0 150 100"
            aria-hidden="true"
            className="pix-float"
            style={{ marginBottom: 26 }}
          >
            <rect
              x="0"
              y="50"
              width="15"
              height="15"
              fill="var(--lime)"
              className="pix-blink"
            />
            <rect x="17" y="33" width="15" height="15" fill="var(--lime)" />
            <rect
              x="34"
              y="50"
              width="15"
              height="15"
              fill="var(--lime)"
              className="pix-blink"
              style={{ animationDelay: "0.4s" }}
            />
            <rect
              x="51"
              y="16"
              width="15"
              height="15"
              fill="var(--ink)"
              className="pix-blink"
              style={{ animationDelay: "0.2s" }}
            />
            <rect x="68" y="33" width="15" height="15" fill="var(--violet)" />
            <rect
              x="85"
              y="16"
              width="15"
              height="15"
              fill="var(--violet)"
              className="pix-blink"
              style={{ animationDelay: "0.7s" }}
            />
            <rect x="102" y="0" width="15" height="15" fill="var(--ink)" />
          </svg>
          <h1
            style={{
              fontWeight: 900,
              fontSize: 44,
              lineHeight: 1,
              letterSpacing: "-0.035em",
              margin: "0 0 16px",
            }}
          >
            The bots read fast. Read faster.
          </h1>
          <p
            style={{
              fontSize: 15.5,
              lineHeight: 1.6,
              fontWeight: 500,
            }}
          >
            Join 120,000+ job seekers who stopped guessing what the screeners
            want.
          </p>
        </div>
        <div
          style={{
            position: "relative",
            fontFamily: "var(--font-mono)",
            fontSize: 10.5,
            letterSpacing: "0.1em",
            opacity: 0.65,
          }}
        >
          FIRST SCAN FREE · NO CARD REQUIRED
        </div>
      </div>

      {/* RIGHT — sign in */}
      <div
        className="rl-auth-panel"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 44,
        }}
      >
        <div style={{ width: 400, maxWidth: "100%" }}>
          <h2
            style={{
              fontWeight: 900,
              fontSize: 32,
              letterSpacing: "-0.03em",
              margin: "0 0 6px",
            }}
          >
            {isNewUser ? "Create your account" : "Welcome back"}
          </h2>
          <p
            style={{
              fontSize: 14,
              color: "var(--fg-2)",
              fontWeight: 500,
              margin: "0 0 26px",
            }}
          >
            {isNewUser
              ? "One click and you're straight into your first scan."
              : "Your versions are waiting — sign in to continue."}
          </p>

          {/* Puter info box */}
          <div
            style={{
              background: "var(--fill-1)",
              border: "var(--bw) solid var(--ink)",
              borderRadius: 12,
              padding: "14px 16px",
              marginBottom: 18,
            }}
          >
            <div className="eyebrow" style={{ marginBottom: 6 }}>
              {"// WHAT IS PUTER?"}
            </div>
            <p
              style={{
                fontSize: 13,
                color: "var(--fg-2)",
                lineHeight: 1.65,
                fontWeight: 500,
              }}
            >
              ResumeLens uses{" "}
              <span style={{ color: "var(--ink)", fontWeight: 700 }}>
                Puter
              </span>{" "}
              — a free cloud platform — to securely store your resumes and AI
              analysis. No separate sign-up required.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <span style={{ flex: 1, height: 1.5, background: "var(--line)" }} />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                letterSpacing: "0.1em",
                color: "var(--fg-3)",
              }}
            >
              ONE CLICK
            </span>
            <span style={{ flex: 1, height: 1.5, background: "var(--line)" }} />
          </div>

          {isLoading ? (
            <button
              className="btn btn--primary"
              disabled
              style={{ width: "100%", padding: 15, fontSize: 14.5 }}
            >
              Signing in…
            </button>
          ) : auth.isAuthenticated ? (
            <button
              className="btn btn--outline"
              onClick={auth.signOut}
              style={{ width: "100%", padding: 15, fontSize: 14.5 }}
            >
              Sign out
            </button>
          ) : (
            <button
              className="btn btn--primary"
              onClick={auth.signIn}
              style={{ width: "100%", padding: 15, fontSize: 14.5 }}
            >
              Continue with Puter →
            </button>
          )}

          <p
            style={{
              fontSize: 12,
              color: "var(--fg-3)",
              fontWeight: 600,
              margin: "18px 0 0",
              textAlign: "center",
            }}
          >
            By continuing you agree to the{" "}
            <span style={{ textDecoration: "underline", cursor: "pointer" }}>
              Terms
            </span>{" "}
            and{" "}
            <span style={{ textDecoration: "underline", cursor: "pointer" }}>
              Privacy Policy
            </span>
            .
          </p>
        </div>
      </div>
    </main>
  );
};

export default Auth;
