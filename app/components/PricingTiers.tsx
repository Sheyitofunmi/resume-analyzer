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
}

export const TIERS: Tier[] = [
  {
    id: "free",
    name: "Free",
    tagline: "Test the waters",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
    features: [
      { label: "1 resume scan / month", included: true },
      { label: "Full 5-dimension score", included: true },
      { label: "3 AI rewrites per scan", included: true },
      { label: "Version history", included: false },
      { label: "Keyword gap alerts", included: false },
    ],
    cta: "Start free",
    ctaTo: "/auth",
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For an active search",
    monthlyPrice: "$12",
    yearlyPrice: "$9",
    features: [
      { label: "Unlimited scans & roles", included: true },
      { label: "Unlimited AI rewrites", included: true },
      { label: "Version history & compare", included: true },
      { label: "Keyword gap alerts", included: true },
      { label: "ATS-safe export templates", included: true },
    ],
    cta: "Go Pro ▸",
    ctaTo: "/auth",
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
    cta: "Get Career+",
    ctaTo: "/auth",
  },
];

export default function PricingTiers() {
  const [annual, setAnnual] = useState(false);
  const { auth } = usePuterStore();

  // Every tier used to point at /auth, which bounces an already-signed-in
  // visitor straight back to the dashboard — the CTAs looked broken. Send
  // them into a scan instead, and route new visitors through sign-up first.
  const ctaTo = auth.isAuthenticated ? "/upload" : "/auth?next=/upload";

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
            Test the waters
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
          <Link
            to={ctaTo}
            style={{
              marginTop: "auto",
              display: "block",
              textAlign: "center",
              background: "var(--ink)",
              color: "var(--cyan)",
              padding: 14,
              borderRadius: 10,
              fontWeight: 900,
              fontSize: 14,
              textDecoration: "none",
              transition: "box-shadow var(--dur-fast) ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow = "4px 4px 0 rgba(11,11,11,.3)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "")}
          >
            Go Pro ▸
          </Link>
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
          <Link
            to={ctaTo}
            style={{
              marginTop: "auto",
              display: "block",
              textAlign: "center",
              background: "var(--lime)",
              color: "var(--ink)",
              padding: 14,
              borderRadius: 10,
              fontWeight: 900,
              fontSize: 14,
              textDecoration: "none",
              transition: "box-shadow var(--dur-fast) ease",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.boxShadow =
                "4px 4px 0 rgba(198,242,78,.35)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "")}
          >
            Get Career+
          </Link>
        </div>
      </div>
    </div>
  );
}
