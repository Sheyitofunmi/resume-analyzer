import { useState } from "react";
import { Link } from "react-router";
import { usePuterStore } from "~/lib/puter";

type Feature = { label: string; included: boolean };

interface Tier {
  id: string;
  name: string;
  tagline: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: Feature[];
  cta: string;
  ctaTo: string;
  /**
   * Whether the tier can actually be used today. Billing isn't wired up, so
   * only Free is real — the other two are roadmap, and their cards must not
   * look purchasable.
   */
  available: boolean;
}

export const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Everything, right now",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    features: [
      { label: "Unlimited resume scans", included: true },
      { label: "Full 5-dimension score", included: true },
      { label: "AI bullet rewrites", included: true },
      { label: "Keyword gap vs. the job post", included: true },
      { label: "Score history & interview questions", included: true },
    ],
    cta: "Start free",
    ctaTo: "/auth",
    available: true,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For an active search",
    monthlyPrice: "$12",
    yearlyPrice: "$9",
    features: [
      { label: "Version history & side-by-side compare", included: true },
      { label: "ATS-safe export templates", included: true },
      { label: "Track multiple roles at once", included: true },
      { label: "Keyword gap alerts on saved roles", included: true },
    ],
    cta: "Planned",
    ctaTo: "",
    available: false,
  },
  {
    id: "career",
    name: "Career+",
    tagline: "Land it faster",
    monthlyPrice: "$28",
    yearlyPrice: "$21",
    features: [
      { label: "Everything in Pro", included: true },
      { label: "Cover letter engine", included: true },
      { label: "LinkedIn profile scoring", included: true },
      { label: "1:1 expert review / quarter", included: true },
    ],
    cta: "Planned",
    ctaTo: "",
    available: false,
  },
];

export default function PricingTiers() {
  const [annual, setAnnual] = useState(false);
  const { auth } = usePuterStore();

  // Every tier used to point at /auth, which bounces an already-signed-in
  // visitor straight back to the dashboard — the CTAs looked broken. Send
  // them into a scan instead, and route new visitors through sign-up first.
  const ctaTo = auth.isAuthenticated ? "/upload" : "/auth?next=/upload";

  // Paid tiers aren't buyable yet, so they get a flat label instead of a
  // button. Anything that looks clickable here is a promise the app can't keep.
  const plannedStyle = {
    marginTop: "auto",
    display: "block",
    textAlign: "center",
    padding: 14,
    borderRadius: 10,
    fontWeight: 900,
    fontSize: 13,
    letterSpacing: "0.06em",
    border: "2px dashed currentColor",
    opacity: 0.62,
    cursor: "default",
    userSelect: "none",
  } as const;

  const segStyle = (active: boolean) =>
    ({
      padding: "11px 22px",
      fontSize: 13,
      fontWeight: 800,
      background: active ? "var(--ink)" : "var(--surface)",
      color: active ? "#fff" : "var(--ink)",
      border: "none",
      cursor: "pointer",
      fontFamily: "var(--font-sans)",
    }) as const;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 44,
        width: "100%",
      }}
    >
      {/* Billing isn't live. Say so before anyone reads the prices. */}
      <div
        role="note"
        style={{
          maxWidth: 640,
          textAlign: "center",
          border: "var(--bw) solid var(--ink)",
          borderRadius: 12,
          background: "var(--lime)",
          color: "var(--ink)",
          padding: "14px 20px",
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1.5,
        }}
      >
        ResumeLens is free while it's in early access. Everything the app does
        today is on the Free plan — Pro and Career+ are what's planned next, and
        neither is purchasable yet.
      </div>

      {/* Billing toggle */}
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

      {/* Cards */}
      <div
        className="g-thirds"
        style={{ width: "100%", alignItems: "stretch" }}
      >
        {/* Free */}
        <div
          className="card"
          style={{
            padding: 32,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 4 }}>
            Free
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--fg-2)",
              fontWeight: 600,
              marginBottom: 18,
            }}
          >
            {TIERS[0].tagline}
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              marginBottom: 22,
            }}
          >
            $0
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 11,
              fontSize: 14,
              fontWeight: 600,
              color: "#3C4043",
              marginBottom: 28,
            }}
          >
            {TIERS[0].features.map((f) => (
              <span
                key={f.label}
                style={{ color: f.included ? undefined : "var(--fg-3)" }}
              >
                {f.included ? "✓" : "✗"} {f.label}
              </span>
            ))}
          </div>
          <Link
            to={ctaTo}
            className="btn btn--outline"
            style={{ marginTop: "auto", justifyContent: "center" }}
          >
            Start free
          </Link>
        </div>

        {/* Pro */}
        <div
          className="card card--cyan"
          style={{
            padding: 32,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            boxShadow: "7px 7px 0 var(--ink)",
          }}
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
          <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 4 }}>
            Pro
          </div>
          <div
            style={{
              fontSize: 13,
              color: "#1F1F1F",
              fontWeight: 700,
              marginBottom: 18,
            }}
          >
            For an active search
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              marginBottom: 22,
            }}
          >
            {annual ? TIERS[1].yearlyPrice : TIERS[1].monthlyPrice}
            <span style={{ fontSize: 16, fontWeight: 700 }}>/mo</span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 11,
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 28,
            }}
          >
            {TIERS[1].features.map((f) => (
              <span key={f.label}>✓ {f.label}</span>
            ))}
          </div>
          <div style={{ ...plannedStyle, color: "var(--ink)" }}>
            PLANNED — NOT YET AVAILABLE
          </div>
        </div>

        {/* Career+ */}
        <div
          className="card card--dark"
          style={{
            padding: 32,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ fontWeight: 900, fontSize: 20, marginBottom: 4 }}>
            Career+
          </div>
          <div
            style={{
              fontSize: 13,
              color: "var(--dark-muted)",
              fontWeight: 600,
              marginBottom: 18,
            }}
          >
            Land it faster
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              marginBottom: 22,
              color: "var(--lime)",
            }}
          >
            {annual ? TIERS[2].yearlyPrice : TIERS[2].monthlyPrice}
            <span
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: "var(--dark-fg)",
              }}
            >
              /mo
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 11,
              fontSize: 14,
              fontWeight: 600,
              marginBottom: 28,
            }}
          >
            {TIERS[2].features.map((f) => (
              <span key={f.label}>✓ {f.label}</span>
            ))}
          </div>
          <div style={{ ...plannedStyle, color: "var(--lime)" }}>
            PLANNED — NOT YET AVAILABLE
          </div>
        </div>
      </div>
    </div>
  );
}
