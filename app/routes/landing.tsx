import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { useReducedMotion } from "framer-motion";
import { usePuterStore } from "~/lib/puter";
import { LogoMark, FadeInView } from "~/components/atoms";
import { useCountUp } from "~/hooks/useCountUp";

// ═══ Rewrite Lab samples ═══
const RW_SAMPLES = [
  {
    before: "Responsible for managing social media accounts.",
    after:
      "Grew 4 social channels to 120K followers, driving 30% of inbound leads.",
    gain: "+9 IMPACT",
    score: 86,
  },
  {
    before: "Managed a team and helped with projects.",
    after:
      "Led 6 engineers to ship 3 releases, cutting churn 14% year over year.",
    gain: "+11 IMPACT",
    score: 91,
  },
  {
    before: "Handled customer support tickets daily.",
    after:
      "Resolved 40+ tickets/day at 96% CSAT, cutting avg response time 38%.",
    gain: "+8 IMPACT",
    score: 84,
  },
];

const MARQUEE_LOGOS = (
  <>
    <span style={{ fontWeight: 900, fontSize: 18 }}>NORTHWIND</span>
    <span
      style={{
        fontFamily: "var(--font-serif)",
        fontSize: 20,
        fontStyle: "italic",
      }}
    >
      Globex
    </span>
    <span
      style={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 16 }}
    >
      initech_
    </span>
    <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "0.14em" }}>
      HOOLI
    </span>
    <span style={{ fontWeight: 800, fontSize: 18 }}>◆ Vandelay</span>
    <span style={{ fontWeight: 700, fontSize: 18 }}>wonka.co</span>
  </>
);

// ═══ Public nav (landing + pricing) ═══
export function PublicNav({ active }: { active?: "pricing" }) {
  const { auth } = usePuterStore();
  const authed = auth.isAuthenticated;

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(111,214,227,.9)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px var(--gutter)",
        borderBottom: "var(--bw) solid var(--ink)",
        gap: 16,
      }}
    >
      <Link
        to="/"
        className="rl-landing-logo"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          fontWeight: 900,
          fontSize: 17,
          letterSpacing: "-0.02em",
          color: "var(--ink)",
          textDecoration: "none",
        }}
      >
        <LogoMark size={20} />
        ResumeLens
      </Link>
      <div
        className="rl-landing-nav-actions"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          fontSize: 13.5,
          fontWeight: 700,
        }}
      >
        <Link
          to="/landing#xray"
          className="mobile-hide"
          style={{ color: "var(--ink)", textDecoration: "none" }}
        >
          Product
        </Link>
        <Link
          to="/pricing"
          className="mobile-hide"
          style={{
            color: "var(--ink)",
            textDecoration: active === "pricing" ? "underline" : "none",
            textUnderlineOffset: 4,
          }}
        >
          Pricing
        </Link>
        <Link
          to="/auth"
          style={{
            border: "var(--bw) solid var(--ink)",
            padding: "9px 18px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 800,
            color: "var(--ink)",
            textDecoration: "none",
          }}
        >
          Sign in
        </Link>
        <Link
          to={authed ? "/upload" : "/auth"}
          style={{
            background: "var(--ink)",
            color: "var(--cyan)",
            padding: "10px 20px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 800,
            textDecoration: "none",
          }}
        >
          Get started
        </Link>
      </div>
    </nav>
  );
}

// ═══ Hero pixel sprites ═══
function HeroSpriteRight() {
  return (
    <svg
      width="180"
      height="120"
      viewBox="0 0 180 120"
      aria-hidden="true"
      className="pix-float mobile-hide"
      style={{ position: "absolute", top: 22, right: 52 }}
    >
      <rect
        x="0"
        y="40"
        width="16"
        height="16"
        fill="var(--lime)"
        className="pix-blink"
      />
      <rect x="18" y="22" width="16" height="16" fill="var(--lime)" />
      <rect
        x="36"
        y="40"
        width="16"
        height="16"
        fill="var(--lime)"
        className="pix-blink"
        style={{ animationDelay: "0.4s" }}
      />
      <rect x="18" y="58" width="16" height="16" fill="var(--lime)" />
      <rect
        x="54"
        y="22"
        width="16"
        height="16"
        fill="var(--ink)"
        className="pix-blink"
        style={{ animationDelay: "0.2s" }}
      />
      <rect x="72" y="4" width="16" height="16" fill="var(--lime)" />
      <rect
        x="90"
        y="22"
        width="16"
        height="16"
        fill="var(--lime)"
        className="pix-blink"
        style={{ animationDelay: "0.7s" }}
      />
      <rect x="108" y="40" width="16" height="16" fill="var(--violet)" />
      <rect
        x="126"
        y="58"
        width="16"
        height="16"
        fill="var(--violet)"
        className="pix-blink"
        style={{ animationDelay: "0.3s" }}
      />
      <rect x="144" y="40" width="16" height="16" fill="var(--violet)" />
      <rect
        x="126"
        y="22"
        width="16"
        height="16"
        fill="var(--ink)"
        className="pix-blink"
      />
      <rect x="90" y="76" width="16" height="16" fill="var(--ink)" />
    </svg>
  );
}

function HeroSpriteLeft() {
  return (
    <svg
      width="150"
      height="110"
      viewBox="0 0 150 110"
      aria-hidden="true"
      className="pix-float mobile-hide"
      style={{
        position: "absolute",
        bottom: 26,
        left: 34,
        animationDelay: "1s",
        animationDuration: "7s",
      }}
    >
      <rect
        x="0"
        y="60"
        width="14"
        height="14"
        fill="var(--violet)"
        className="pix-blink"
      />
      <rect x="16" y="44" width="14" height="14" fill="var(--violet)" />
      <rect
        x="32"
        y="60"
        width="14"
        height="14"
        fill="var(--violet)"
        className="pix-blink"
        style={{ animationDelay: "0.5s" }}
      />
      <rect x="16" y="76" width="14" height="14" fill="var(--violet)" />
      <rect
        x="48"
        y="28"
        width="14"
        height="14"
        fill="var(--ink)"
        className="pix-blink"
        style={{ animationDelay: "0.2s" }}
      />
      <rect x="64" y="44" width="14" height="14" fill="var(--lime)" />
      <rect
        x="80"
        y="28"
        width="14"
        height="14"
        fill="var(--lime)"
        className="pix-blink"
        style={{ animationDelay: "0.8s" }}
      />
      <rect x="96" y="12" width="14" height="14" fill="var(--lime)" />
      <rect
        x="112"
        y="28"
        width="14"
        height="14"
        fill="var(--ink)"
        className="pix-blink"
        style={{ animationDelay: "0.4s" }}
      />
    </svg>
  );
}

// ═══ Hero resume card with sweeping lens ═══
function HeroResumeCard() {
  const reduced = useReducedMotion();
  const heroScore = useCountUp(82, 1400, !reduced);

  const skeleton = (width: string) => (
    <span
      style={{
        width,
        height: 8,
        borderRadius: 5,
        background: "var(--fill-3)",
        display: "block",
      }}
    />
  );

  const highlight = (text: string, color: string, delay: string) => (
    <span
      style={{
        display: "block",
        fontSize: 12.5,
        fontWeight: 600,
        lineHeight: 1.5,
        padding: "2px 4px",
        borderRadius: 5,
        backgroundImage: `linear-gradient(${color},${color})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "0% 100%",
        animation: `rl-hl .8s ${delay} ease forwards`,
      }}
    >
      {text}
    </span>
  );

  const chipStyle = (delayPop: string, delayFloat: string, durFloat: string) =>
    ({
      position: "absolute",
      borderRadius: 10,
      padding: "10px 14px",
      fontFamily: "var(--font-mono)",
      fontSize: 11.5,
      fontWeight: 600,
      animation: `rl-pop .5s ${delayPop} both, rl-float ${durFloat} ${delayFloat} ease-in-out infinite`,
      zIndex: 4,
    }) as const;

  return (
    <div style={{ position: "relative", height: 430 }}>
      <div
        style={{
          position: "absolute",
          inset: "14px 8px",
          background: "var(--surface)",
          border: "var(--bw) solid var(--ink)",
          borderRadius: "var(--r-card)",
          boxShadow: "var(--pop-hero)",
          padding: 26,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <span
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "var(--fill-3)",
              border: "var(--bw) solid var(--line)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span
              style={{
                width: 120,
                height: 11,
                borderRadius: 6,
                background: "#D8DDD8",
                display: "block",
              }}
            />
            <span
              style={{
                width: 80,
                height: 8,
                borderRadius: 5,
                background: "#EAEDEA",
                display: "block",
              }}
            />
          </div>
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-mono)",
              fontSize: 22,
              fontWeight: 600,
            }}
          >
            {heroScore}
            <span style={{ fontSize: 11, color: "var(--fg-3)" }}>/100</span>
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {skeleton("100%")}
          {highlight(
            "Led 6 engineers to ship 3 releases, cutting churn 14%",
            "#D9F7B1",
            "0.8s",
          )}
          {skeleton("92%")}
          {skeleton("97%")}
          {highlight(
            "Grew 4 channels to 120K followers — 30% of inbound leads",
            "#C9EEF4",
            "2.1s",
          )}
          {skeleton("88%")}
          {skeleton("95%")}
          {skeleton("70%")}
          {highlight(
            "Drove A/B program to 120 experiments per quarter",
            "#E4D9FF",
            "3.3s",
          )}
          {skeleton("84%")}
        </div>
      </div>

      {/* the Lens: pixel magnifying glass sweeping the resume */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 36,
          right: 30,
          zIndex: 3,
          animation: "rl-lens 9s ease-in-out infinite",
          pointerEvents: "none",
        }}
      >
        <svg width="150" height="150" viewBox="0 0 150 150">
          <circle
            cx="62"
            cy="62"
            r="44"
            fill="rgba(111,214,227,.35)"
            stroke="var(--ink)"
            strokeWidth="7"
          />
          <circle
            cx="62"
            cy="62"
            r="44"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeDasharray="10 14"
            opacity=".8"
          />
          <rect
            x="99"
            y="92"
            width="14"
            height="14"
            fill="var(--ink)"
            transform="rotate(45 106 99)"
          />
          <rect
            x="110"
            y="103"
            width="15"
            height="15"
            fill="var(--ink)"
            transform="rotate(45 117.5 110.5)"
          />
          <rect
            x="121"
            y="114"
            width="16"
            height="16"
            fill="var(--ink)"
            transform="rotate(45 129 122)"
          />
          <circle cx="48" cy="48" r="10" fill="rgba(255,255,255,.75)" />
        </svg>
      </div>

      <div
        style={{
          ...chipStyle("1.1s", "1.6s", "4s"),
          top: 30,
          left: -4,
          background: "var(--ink)",
          color: "#fff",
          boxShadow: "4px 4px 0 rgba(11,11,11,.25)",
        }}
      >
        keywords <span style={{ color: "var(--lime)" }}>91</span>
      </div>
      <div
        style={{
          ...chipStyle("2.4s", "2.9s", "5s"),
          bottom: 92,
          right: 2,
          background: "var(--lime)",
          border: "var(--bw) solid var(--ink)",
        }}
      >
        impact +9
      </div>
      <div
        style={{
          ...chipStyle("3.4s", "0s", "4.4s"),
          bottom: 26,
          left: -2,
          background: "var(--violet)",
          color: "#fff",
          border: "var(--bw) solid var(--ink)",
        }}
      >
        role_fit <span style={{ color: "var(--lime)" }}>88</span>
      </div>
    </div>
  );
}

// ═══ X-ray — draggable before/after ═══
function XRaySection() {
  const [split, setSplit] = useState(50);
  const machinePct = Math.round(100 - split);
  const eyeLX = Math.round(24 + (split - 50) * 0.12);
  const eyeRX = Math.round(40 + (split - 50) * 0.12);

  const failRed = "#FF7B6B";
  const dimOlive = "#6B7050";

  return (
    <FadeInView>
      <div
        id="xray"
        className="rl-container"
        style={{ padding: "88px var(--gutter-inner) 80px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 24,
            marginBottom: 26,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div className="eyebrow" style={{ marginBottom: 12 }}>
              {"// THE X-RAY"}
            </div>
            <h2 style={{ maxWidth: "18ch" }}>
              What you send is not what they see.
            </h2>
          </div>
          <p
            style={{
              fontSize: 14.5,
              lineHeight: 1.6,
              color: "var(--fg-2)",
              maxWidth: "34ch",
              fontWeight: 600,
            }}
          >
            <span className="rl-xray-drag-hint">
              ← Drag the divider. Left is your resume. Right is what the
              screening bot parsed.
            </span>
            <span className="rl-xray-stack-hint">
              Top is your resume. Below is what the screening bot actually
              parsed.
            </span>
          </p>
        </div>

        <div
          className="rl-xray-stage"
          style={{
            position: "relative",
            height: 380,
            border: "var(--bw) solid var(--ink)",
            borderRadius: 14,
            overflow: "hidden",
            cursor: "ew-resize",
            boxShadow: "6px 6px 0 rgba(11,11,11,.85)",
          }}
        >
          {/* Human side */}
          <div
            className="rl-xray-pane"
            style={{
              position: "absolute",
              inset: 0,
              background: "var(--surface)",
              padding: "32px 36px",
            }}
          >
            <div className="rl-xray-tag rl-xray-tag--human">
              HUMAN — WHAT YOU SENT
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                marginBottom: 20,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: "var(--violet)",
                  border: "var(--bw) solid var(--line)",
                  color: "#fff",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                M
              </span>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: 26,
                    fontStyle: "italic",
                    marginBottom: 2,
                  }}
                >
                  Maya Chen
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-3)" }}>
                  Product Manager · Oakland, CA · maya@chen.co
                </div>
              </div>
            </div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.12em",
                color: "var(--fg-3)",
                marginBottom: 8,
              }}
            >
              EXPERIENCE
            </div>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>
              Senior Product Manager — Meridian Labs
            </div>
            <div
              style={{ fontSize: 11.5, color: "var(--fg-3)", marginBottom: 8 }}
            >
              2022 — Present
            </div>
            <ul
              style={{
                margin: "0 0 16px",
                paddingLeft: 18,
                fontSize: 13,
                lineHeight: 1.65,
                color: "#3C4043",
              }}
            >
              <li>Led cross-functional team of 8 through platform migration</li>
              <li>Shipped 3 major releases; churn down 14% YoY</li>
              <li>Drove A/B program to 120 experiments per quarter</li>
            </ul>
            <div
              style={{
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: "0.12em",
                color: "var(--fg-3)",
                marginBottom: 8,
              }}
            >
              SKILLS
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Roadmapping", "SQL", "Experimentation", "Figma"].map((s) => (
                <span
                  key={s}
                  style={{
                    border: "var(--bw) solid var(--line)",
                    padding: "5px 12px",
                    borderRadius: 999,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Machine side */}
          <div
            className="rl-xray-machine"
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              overflow: "hidden",
              width: `${100 - split}%`,
            }}
          >
            <div
              className="rl-xray-pane rl-xray-machine-inner"
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: 1062,
                background: "var(--dark-bg)",
                color: "var(--lime)",
                padding: "32px 36px",
                fontFamily: "var(--font-mono)",
                textAlign: "right",
              }}
            >
              <div className="rl-xray-tag rl-xray-tag--machine">
                MACHINE — WHAT THE BOT SAW
              </div>
              <svg
                width="72"
                height="72"
                viewBox="0 0 72 72"
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 18,
                  right: 26,
                  opacity: 0.9,
                }}
              >
                <rect x="18" y="8" width="36" height="8" fill="var(--lime)" />
                <rect x="10" y="16" width="8" height="8" fill="var(--lime)" />
                <rect x="54" y="16" width="8" height="8" fill="var(--lime)" />
                <rect
                  x="18"
                  y="16"
                  width="36"
                  height="32"
                  fill="var(--dark-surface)"
                  stroke="var(--lime)"
                  strokeWidth="2"
                />
                <rect
                  x={eyeLX}
                  y="24"
                  width="8"
                  height="8"
                  fill="var(--lime)"
                  style={{
                    animation: "rl-blink 1.3s step-end infinite",
                    transition: "x .15s ease",
                  }}
                />
                <rect
                  x={eyeRX}
                  y="24"
                  width="8"
                  height="8"
                  fill="var(--lime)"
                  style={{
                    animation: "rl-blink 1.3s .3s step-end infinite",
                    transition: "x .15s ease",
                  }}
                />
                <rect x="26" y="40" width="20" height="4" fill="var(--lime)" />
                <rect x="10" y="48" width="8" height="16" fill="var(--lime)" />
                <rect x="54" y="48" width="8" height="16" fill="var(--lime)" />
                <rect x="22" y="48" width="10" height="16" fill={dimOlive} />
                <rect x="40" y="48" width="10" height="16" fill={dimOlive} />
              </svg>
              <div style={{ fontSize: 11, color: dimOlive, marginBottom: 16 }}>
                ATS PARSER v2.31 — resume_final_v2.pdf
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  lineHeight: 2.05,
                  display: "inline-block",
                  textAlign: "left",
                }}
              >
                <div>
                  name:{" "}
                  <span style={{ color: "var(--dark-fg)" }}>MAYA CH▯N</span>{" "}
                  <span style={{ color: dimOlive }}>
                    {"// header image skipped"}
                  </span>
                </div>
                <div>
                  title: <span style={{ color: failRed }}>[NOT FOUND]</span>{" "}
                  <span style={{ color: dimOlive }}>
                    {"// stored in text box"}
                  </span>
                </div>
                <div>
                  experience: Senior Product Ma—{" "}
                  <span style={{ color: failRed }}>[TRUNCATED]</span>
                </div>
                <div>
                  dates: 2022 —{" "}
                  <span style={{ color: failRed }}>[PARSE ERROR: en-dash]</span>
                </div>
                <div>
                  bullets: 1 of 3 recovered{" "}
                  <span style={{ color: failRed }}>⚠ two-column layout</span>
                </div>
                <div>
                  skills_matched: <span style={{ color: failRed }}>4 / 12</span>{" "}
                  <span style={{ color: dimOlive }}>
                    {'// "Roadmapping" ≠ "roadmap"'}
                  </span>
                </div>
                <div style={{ marginTop: 14, color: "var(--dark-fg)" }}>
                  verdict: RANK{" "}
                  <span style={{ color: failRed, fontWeight: 700 }}>
                    118 / 212
                  </span>{" "}
                  → auto-declined
                  <span style={{ animation: "rl-blink 1s step-end infinite" }}>
                    ▌
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div
            className="rl-xray-divider"
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: `${split}%`,
              width: 0,
              /* The line renders just onto the dark machine side, so keep it
                 light — a black line here would be invisible against it. */
              borderLeft: "2.5px solid var(--surface)",
              zIndex: 3,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: -31,
                transform: "translateY(-50%)",
                width: 62,
                height: 34,
                /* Straddles the white/dark boundary, so use cyan + an ink
                   border to stay visible on both sides (a black pill vanished
                   into the machine panel). */
                background: "var(--cyan)",
                color: "var(--ink)",
                border: "var(--bw) solid var(--ink)",
                boxSizing: "border-box",
                borderRadius: 999,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              ◂ ▸
            </div>
            <div
              style={{
                position: "absolute",
                top: 14,
                left: -86,
                background: "var(--surface)",
                border: "var(--bw) solid var(--ink)",
                padding: "4px 9px",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.1em",
                borderRadius: 6,
              }}
            >
              HUMAN
            </div>
            <div
              style={{
                position: "absolute",
                top: 14,
                left: 10,
                background: "var(--lime)",
                border: "var(--bw) solid var(--ink)",
                padding: "4px 9px",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.1em",
                borderRadius: 6,
                fontFamily: "var(--font-mono)",
              }}
            >
              MACHINE
            </div>
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: "50%",
                transform: "translateX(-50%)",
                background: "var(--ink)",
                color: "var(--lime)",
                padding: "5px 11px",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: "0.06em",
                borderRadius: 6,
                fontFamily: "var(--font-mono)",
                whiteSpace: "nowrap",
              }}
            >
              {machinePct}% MACHINE VIEW
            </div>
          </div>

          <input
            type="range"
            className="rl-xray-range"
            min={18}
            max={82}
            value={split}
            aria-label="Drag to compare your resume with the machine-parsed view"
            onChange={(e) => setSplit(Number(e.target.value))}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: "ew-resize",
              margin: 0,
              zIndex: 4,
            }}
          />
        </div>
        <div
          style={{
            marginTop: 16,
            fontSize: 13,
            color: "var(--fg-2)",
            fontWeight: 600,
          }}
        >
          73% of resumes are filtered before a human ever opens them.{" "}
          <strong style={{ color: "var(--ink)" }}>
            ResumeLens fixes what the parser sees.
          </strong>
        </div>
      </div>
    </FadeInView>
  );
}

// ═══ How it works ═══
const STEPS = [
  {
    n: "1",
    bg: "var(--cyan)",
    fg: "var(--ink)",
    title: "Upload & set your target",
    body: "PDF or DOCX. Tell us the role you're chasing and the analysis tunes itself to it.",
  },
  {
    n: "2",
    bg: "var(--lime)",
    fg: "var(--ink)",
    title: "Get scored on 5 dimensions",
    body: "Keywords, impact, formatting, clarity, role fit — with the reasoning behind every number.",
  },
  {
    n: "3",
    bg: "var(--violet)",
    fg: "#fff",
    title: "Accept rewrites, re-score",
    body: "Approve AI-rewritten bullets one by one, then watch your score climb version over version.",
  },
];

function HowItWorksSection() {
  return (
    <div
      id="how-it-works"
      style={{
        background: "var(--surface)",
        borderTop: "var(--bw) solid var(--ink)",
        borderBottom: "var(--bw) solid var(--ink)",
        padding: "80px var(--gutter)",
      }}
    >
      <FadeInView className="rl-container" style={{ padding: 0 }}>
        <div className="eyebrow" style={{ marginBottom: 14 }}>
          {"// HOW IT WORKS"}
        </div>
        <h2 style={{ margin: "0 0 40px", maxWidth: "20ch" }}>
          Three steps between you and the interview.
        </h2>
        <div className="g-thirds">
          {STEPS.map((s) => (
            <div
              key={s.n}
              className="card card--hover"
              style={{
                borderRadius: 14,
                padding: 28,
                background: "var(--page)",
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: s.bg,
                  color: s.fg,
                  border: "var(--bw) solid var(--ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 17,
                  marginBottom: 18,
                }}
              >
                {s.n}
              </div>
              <h3 style={{ margin: "0 0 10px" }}>{s.title}</h3>
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: "var(--fg-2)",
                }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </FadeInView>
    </div>
  );
}

// ═══ Rewrite Lab — interactive ═══
function RewriteLab() {
  const [idx, setIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [typing, setTyping] = useState(false);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(34);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const sample = RW_SAMPLES[idx];

  const runRewrite = () => {
    if (typing) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (reduced) {
      setTyped(sample.after);
      setDone(true);
      setScore(sample.score);
      return;
    }
    setTyped("");
    setDone(false);
    setTyping(true);
    setScore(34);
    let i = 0;
    intervalRef.current = setInterval(() => {
      i += 2;
      if (i >= sample.after.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setTyped(sample.after);
        setDone(true);
        setTyping(false);
        setScore(sample.score);
      } else {
        setTyped(sample.after.slice(0, i));
      }
    }, 28);
  };

  const nextSample = () => {
    if (typing) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIdx((v) => (v + 1) % RW_SAMPLES.length);
    setTyped("");
    setDone(false);
    setScore(34);
  };

  return (
    <div
      style={{
        background: "var(--lime)",
        borderBottom: "var(--bw) solid var(--ink)",
        padding: "80px var(--gutter)",
      }}
    >
      <FadeInView className="rl-container g-feature" style={{ padding: 0 }}>
        <div>
          <div className="eyebrow eyebrow--ink" style={{ marginBottom: 14 }}>
            {"// REWRITE LAB — TRY IT"}
          </div>
          <h2
            style={{
              fontSize: 42,
              lineHeight: 1.02,
              margin: "0 0 16px",
            }}
          >
            "Managed a team" isn't a story.
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.65,
              fontWeight: 500,
              margin: "0 0 26px",
              maxWidth: "42ch",
            }}
          >
            Press the button. Watch a weak bullet become an interview magnet —
            the same engine that rewrites yours.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={runRewrite}
              style={{
                background: "var(--ink)",
                color: "var(--lime)",
                padding: "14px 28px",
                borderRadius: 8,
                border: "none",
                fontWeight: 800,
                fontSize: 14.5,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
              }}
            >
              ▸ Run AI rewrite
            </button>
            <button
              onClick={nextSample}
              style={{
                background: "transparent",
                border: "var(--bw) solid var(--ink)",
                padding: "14px 22px",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 14.5,
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                color: "var(--ink)",
              }}
            >
              Try another bullet
            </button>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div
            style={{
              background: "var(--surface)",
              border: "var(--bw) solid var(--ink)",
              borderRadius: 12,
              padding: "20px 22px",
            }}
          >
            <div
              className="eyebrow"
              style={{ fontSize: 10, color: "var(--fg-3)", marginBottom: 8 }}
            >
              BEFORE
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--fg-2)" }}>
              {sample.before}
            </p>
          </div>
          <div
            style={{
              background: "var(--ink)",
              color: "#fff",
              borderRadius: 12,
              padding: "20px 22px",
              boxShadow: "5px 5px 0 rgba(11,11,11,.25)",
              minHeight: 74,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span
                className="eyebrow"
                style={{ fontSize: 10, color: "var(--lime)" }}
              >
                AFTER
              </span>
              {done && (
                <span
                  style={{
                    background: "var(--lime)",
                    color: "var(--ink)",
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "3px 9px",
                    borderRadius: 6,
                    animation: "rl-pop .4s both",
                  }}
                >
                  {sample.gain}
                </span>
              )}
            </div>
            <p
              style={{
                lineHeight: 1.55,
                fontFamily: "var(--font-mono)",
                fontSize: 13.5,
              }}
            >
              {typed === "" && !typing ? "…press Run AI rewrite" : typed}
              {typing && (
                <span
                  style={{
                    animation: "rl-blink .8s step-end infinite",
                    color: "var(--lime)",
                  }}
                >
                  ▌
                </span>
              )}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              background: "rgba(255,255,255,.5)",
              border: "var(--bw) solid var(--ink)",
              borderRadius: 12,
              padding: "14px 18px",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.1em",
                fontWeight: 600,
              }}
            >
              IMPACT SCORE
            </span>
            <div
              style={{
                flex: 1,
                height: 8,
                background: "rgba(11,11,11,.12)",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${score}%`,
                  height: 8,
                  background: "var(--ink)",
                  borderRadius: 4,
                  transition: "width .6s ease",
                }}
              />
            </div>
            <span style={{ fontWeight: 900, fontSize: 19 }}>{score}</span>
          </div>
        </div>
      </FadeInView>
    </div>
  );
}

// ═══ Dark version-history section ═══
const DARK_BARS = [
  {
    h: "38%",
    bg: "rgba(255,255,255,.14)",
    label: "v1 · 48",
    labelColor: "var(--dark-muted)",
  },
  {
    h: "52%",
    bg: "rgba(111,214,227,.5)",
    label: "v2 · 61",
    labelColor: "var(--dark-muted)",
  },
  {
    h: "68%",
    bg: "rgba(139,92,246,.65)",
    label: "v3 · 74",
    labelColor: "var(--dark-muted)",
  },
  {
    h: "86%",
    bg: "var(--lime)",
    label: "v4 · 82 ✓",
    labelColor: "var(--lime)",
  },
];

function DarkTrackSection() {
  return (
    <div
      style={{
        background: "var(--dark-bg)",
        color: "var(--dark-fg)",
        padding: "88px var(--gutter)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <svg
        width="130"
        height="96"
        viewBox="0 0 130 96"
        aria-hidden="true"
        className="pix-float mobile-hide"
        style={{ position: "absolute", top: 34, right: 56 }}
      >
        <rect
          x="0"
          y="48"
          width="14"
          height="14"
          fill="var(--lime)"
          className="pix-blink"
        />
        <rect x="16" y="32" width="14" height="14" fill="var(--lime)" />
        <rect
          x="32"
          y="48"
          width="14"
          height="14"
          fill="var(--lime)"
          className="pix-blink"
          style={{ animationDelay: "0.4s" }}
        />
        <rect
          x="48"
          y="16"
          width="14"
          height="14"
          fill="var(--cyan)"
          className="pix-blink"
          style={{ animationDelay: "0.2s" }}
        />
        <rect x="64" y="32" width="14" height="14" fill="var(--violet)" />
        <rect
          x="80"
          y="16"
          width="14"
          height="14"
          fill="var(--violet)"
          className="pix-blink"
          style={{ animationDelay: "0.8s" }}
        />
        <rect x="96" y="0" width="14" height="14" fill="var(--cyan)" />
      </svg>
      <FadeInView className="rl-container g-feature" style={{ padding: 0 }}>
        <div>
          <div
            className="eyebrow"
            style={{ color: "var(--lime)", marginBottom: 14 }}
          >
            {"// VERSION HISTORY"}
          </div>
          <h2
            style={{
              color: "var(--dark-fg)",
              fontSize: 42,
              lineHeight: 1.02,
              margin: "0 0 16px",
            }}
          >
            Watch your score climb, version by version.
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.65,
              color: "var(--dark-muted)",
              maxWidth: "42ch",
            }}
          >
            Every scan is saved. Compare any two versions, see which rewrites
            moved the needle, and never lose a good draft again.
          </p>
        </div>
        <div
          style={{
            background: "var(--dark-surface)",
            border: "1px solid var(--dark-line)",
            borderRadius: 14,
            padding: 26,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontFamily: "var(--font-mono)",
              fontSize: 10.5,
              letterSpacing: "0.1em",
              color: "var(--dark-muted)",
              marginBottom: 20,
            }}
          >
            <span>SCORE_HISTORY</span>
            <span style={{ color: "var(--lime)" }}>▲ +34 TOTAL</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 14,
              height: 150,
            }}
          >
            {DARK_BARS.map((b) => (
              <div
                key={b.label}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  height: "100%",
                  justifyContent: "flex-end",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: b.h,
                    background: b.bg,
                    borderRadius: "6px 6px 0 0",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: b.labelColor,
                  }}
                >
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </FadeInView>
    </div>
  );
}

// ═══ Pricing teaser ═══
function PricingTeaser({ ctaTo }: { ctaTo: string }) {
  const [annual, setAnnual] = useState(false);

  const segStyle = (active: boolean) =>
    ({
      padding: "10px 18px",
      fontSize: 12.5,
      fontWeight: 800,
      background: active ? "var(--ink)" : "var(--surface)",
      color: active ? "#fff" : "var(--ink)",
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
    }) as const;

  return (
    <FadeInView
      className="rl-container"
      style={{ padding: "88px var(--gutter-inner)" }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 40,
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: 14 }}>
            {"// PRICING"}
          </div>
          <h2>Start free. Upgrade when it works.</h2>
        </div>
        <div
          style={{
            display: "inline-flex",
            border: "var(--bw) solid var(--ink)",
            borderRadius: 999,
            overflow: "hidden",
            userSelect: "none",
          }}
        >
          <button style={segStyle(!annual)} onClick={() => setAnnual(false)}>
            Monthly
          </button>
          <button style={segStyle(annual)} onClick={() => setAnnual(true)}>
            Annual −25%
          </button>
        </div>
      </div>
      <div className="g-halves" style={{ maxWidth: 860 }}>
        <div className="card" style={{ borderRadius: 14, padding: 30 }}>
          <div style={{ fontWeight: 900, fontSize: 19, marginBottom: 6 }}>
            Free
          </div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              marginBottom: 18,
            }}
          >
            $0
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              fontSize: 14,
              fontWeight: 600,
              color: "#3C4043",
              marginBottom: 24,
            }}
          >
            <span>✓ 1 resume scan / month</span>
            <span>✓ Full 5-dimension score</span>
            <span>✓ 3 AI rewrites per scan</span>
          </div>
          <Link to={ctaTo} className="btn btn--outline">
            Start free
          </Link>
        </div>
        <div
          className="card card--cyan"
          style={{ borderRadius: 14, padding: 30, position: "relative" }}
        >
          <div
            style={{
              position: "absolute",
              top: -13,
              right: 22,
              background: "var(--violet)",
              color: "#fff",
              border: "var(--bw) solid var(--ink)",
              borderRadius: 999,
              padding: "5px 13px",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: "0.06em",
            }}
          >
            MOST POPULAR
          </div>
          <div style={{ fontWeight: 900, fontSize: 19, marginBottom: 6 }}>
            Pro
          </div>
          <div
            style={{
              fontSize: 38,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              marginBottom: 18,
            }}
          >
            {annual ? "$9" : "$12"}
            <span style={{ fontSize: 15, fontWeight: 700 }}>/mo</span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 24,
            }}
          >
            <span>✓ Unlimited scans & roles</span>
            <span>✓ Unlimited AI rewrites</span>
            <span>✓ Version history & compare</span>
          </div>
          <Link
            to={ctaTo}
            style={{
              display: "inline-block",
              background: "var(--ink)",
              color: "var(--cyan)",
              padding: "13px 26px",
              borderRadius: 8,
              fontWeight: 800,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Go Pro
          </Link>
        </div>
      </div>
    </FadeInView>
  );
}

// ═══ Landing page ═══
export default function Landing() {
  const { auth } = usePuterStore();
  const ctaTo = auth.isAuthenticated ? "/upload" : "/auth";

  return (
    <main id="main-content" style={{ background: "var(--page)" }}>
      <PublicNav />

      {/* ═══ HERO ═══ */}
      <div
        style={{
          position: "relative",
          background: "var(--cyan)",
          padding: "64px var(--gutter) 72px",
          overflow: "hidden",
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
        <HeroSpriteRight />
        <HeroSpriteLeft />

        <div
          className="g-hero"
          style={{
            position: "relative",
            maxWidth: 1240,
            margin: "0 auto",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,.55)",
                border: "var(--bw) solid var(--ink)",
                borderRadius: 999,
                padding: "8px 16px",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.08em",
                fontWeight: 600,
                marginBottom: 24,
              }}
            >
              <span
                className="pix-blink"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--ink)",
                }}
              />
              12,408 RESUMES SCANNED TODAY
            </div>
            <h1
              style={{
                fontSize: "clamp(42px, 4.6vw, 66px)",
                lineHeight: 0.97,
                letterSpacing: "-0.04em",
                margin: "0 0 22px",
              }}
            >
              Resume optimization that beats the bots.
            </h1>
            <p
              style={{
                fontSize: 17.5,
                lineHeight: 1.6,
                fontWeight: 500,
                margin: "0 0 28px",
                maxWidth: "44ch",
              }}
            >
              The same scan recruiters' software runs — turned to your
              advantage. Five dimensions, AI-rewritten bullets, version
              tracking.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                to={ctaTo}
                style={{
                  background: "var(--ink)",
                  color: "#fff",
                  padding: "16px 32px",
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: 15,
                  textDecoration: "none",
                }}
              >
                Score my resume — free
              </Link>
              <a
                href="#xray"
                style={{
                  background: "rgba(255,255,255,.55)",
                  padding: "16px 26px",
                  borderRadius: 8,
                  fontWeight: 800,
                  fontSize: 15,
                  textDecoration: "none",
                  color: "var(--ink)",
                }}
              >
                See a sample
              </a>
            </div>
            <div
              style={{
                marginTop: 20,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                opacity: 0.65,
              }}
            >
              NO CARD REQUIRED · FIRST SCAN FREE
            </div>
          </div>

          <HeroResumeCard />
        </div>
      </div>

      {/* ═══ LOGO MARQUEE ═══ */}
      <div
        style={{
          background: "var(--surface)",
          borderTop: "var(--bw) solid var(--ink)",
          borderBottom: "var(--bw) solid var(--ink)",
          padding: "26px 0 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 var(--gutter) 12px",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--fg-2)",
          }}
        >
          <span>Trusted by 120,000+ job seekers</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5 }}>
            HIRED AT ↓
          </span>
        </div>
        <div className="marquee">
          <div className="marquee__track">
            <div
              style={{
                display: "flex",
                gap: 56,
                paddingRight: 56,
                alignItems: "center",
                whiteSpace: "nowrap",
              }}
            >
              {MARQUEE_LOGOS}
            </div>
            <div
              aria-hidden="true"
              style={{
                display: "flex",
                gap: 56,
                paddingRight: 56,
                alignItems: "center",
                whiteSpace: "nowrap",
              }}
            >
              {MARQUEE_LOGOS}
            </div>
          </div>
        </div>
      </div>

      <XRaySection />
      <HowItWorksSection />
      <RewriteLab />
      <DarkTrackSection />
      <PricingTeaser ctaTo={ctaTo} />

      {/* ═══ FINAL CTA ═══ */}
      <div
        className="rl-container"
        style={{ margin: "0 auto 88px", padding: "0 var(--gutter-inner)" }}
      >
        <div
          style={{
            background: "var(--violet)",
            border: "var(--bw) solid var(--ink)",
            borderRadius: 20,
            padding: "64px 48px",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <svg
            width="110"
            height="80"
            viewBox="0 0 110 80"
            aria-hidden="true"
            className="pix-float mobile-hide"
            style={{ position: "absolute", top: 18, left: 26 }}
          >
            <rect
              x="0"
              y="40"
              width="13"
              height="13"
              fill="var(--lime)"
              className="pix-blink"
            />
            <rect x="15" y="25" width="13" height="13" fill="var(--lime)" />
            <rect
              x="30"
              y="40"
              width="13"
              height="13"
              fill="var(--cyan)"
              className="pix-blink"
              style={{ animationDelay: "0.5s" }}
            />
            <rect x="45" y="10" width="13" height="13" fill="var(--cyan)" />
            <rect
              x="60"
              y="25"
              width="13"
              height="13"
              fill="var(--lime)"
              className="pix-blink"
              style={{ animationDelay: "0.3s" }}
            />
          </svg>
          <h2 style={{ color: "#fff", margin: "0 0 14px" }}>
            Stop guessing what the bots want.
          </h2>
          <p style={{ color: "#E4D9FF", fontSize: 16, margin: "0 0 28px" }}>
            Your first scan is free — see your score in under a minute.
          </p>
          <Link
            to={ctaTo}
            style={{
              display: "inline-block",
              background: "var(--lime)",
              color: "var(--ink)",
              padding: "16px 34px",
              borderRadius: 8,
              fontWeight: 900,
              fontSize: 15.5,
              textDecoration: "none",
            }}
          >
            Score my resume
            <span style={{ animation: "rl-blink 1.1s step-end infinite" }}>
              {" "}
              ▌
            </span>
          </Link>
        </div>
      </div>

      {/* ═══ FOOTER ═══ */}
      <div
        style={{
          borderTop: "var(--bw) solid var(--ink)",
          background: "var(--surface)",
          padding: "44px var(--gutter)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 18,
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 900,
            fontSize: 15,
          }}
        >
          <LogoMark size={17} />
          ResumeLens
        </span>
        <div
          style={{
            display: "flex",
            gap: 26,
            fontSize: 13,
            fontWeight: 700,
            color: "var(--fg-2)",
          }}
        >
          <Link
            to="/pricing"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            Pricing
          </Link>
          <a href="#xray" style={{ color: "inherit", textDecoration: "none" }}>
            Samples
          </a>
          <span>Privacy</span>
          <span>Terms</span>
        </div>
        <span className="mono-stamp">
          © {new Date().getFullYear()} RESUMELENS
        </span>
      </div>
    </main>
  );
}
