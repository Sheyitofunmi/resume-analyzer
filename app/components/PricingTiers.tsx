import { Link } from "react-router";
import { Corners } from "~/components/atoms";

export const TIERS = [
  {
    id: "free",
    tier: "FREE",
    price: "$0",
    period: "/month",
    tagline: "enough to land your first offer",
    recommended: false,
    features: [
      "up to 5 analyses / month",
      "5-dimension scoring",
      "keyword diff",
      "basic rewrite suggestions",
      "24h analysis history",
    ],
    cta: "$ start_free →",
    ctaTo: "/auth",
    variant: "secondary" as const,
  },
  {
    id: "pro",
    tier: "PRO",
    price: "$12",
    period: "/month",
    tagline: "for active job searches",
    recommended: true,
    features: [
      "unlimited analyses",
      "all of free, plus:",
      "interview question prep",
      "AI rewrite — every bullet",
      "unlimited score history + trends",
      "side-by-side compare",
      "priority response (~2s avg)",
    ],
    cta: "$ try_pro_free →",
    ctaTo: "/auth",
    variant: "primary" as const,
  },
  {
    id: "recruiter",
    tier: "RECRUITER",
    price: "$49",
    period: "/month",
    tagline: "evaluate candidates in seconds",
    recommended: false,
    features: [
      "all of pro, plus:",
      "bulk analyze (50+ resumes)",
      "team workspaces",
      "JD-to-candidate matching",
      "export to ATS-friendly CSV",
      "sso · audit log · sla",
    ],
    cta: "$ contact_us →",
    ctaTo: "/auth",
    variant: "secondary" as const,
  },
];

export default function PricingTiers() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 20,
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
      }}
    >
      {TIERS.map((t) => (
        <div
          key={t.id}
          className={`rl-card${t.recommended ? " is-phos" : ""}`}
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            boxShadow: t.recommended
              ? "0 0 32px rgba(168,230,163,0.12)"
              : undefined,
          }}
        >
          <Corners />

          {t.recommended && (
            <div
              style={{
                position: "absolute",
                top: -1,
                left: "50%",
                transform: "translateX(-50%)",
                background: "var(--phos)",
                color: "var(--bg)",
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.2em",
                padding: "3px 14px",
                borderRadius: "0 0 var(--radius-md) var(--radius-md)",
              }}
            >
              RECOMMENDED
            </div>
          )}

          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: t.recommended ? "var(--phos)" : "var(--fg-3)",
                letterSpacing: "0.2em",
              }}
            >
              {t.tier}
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 4,
                fontFamily: "var(--font-mono)",
              }}
            >
              <span
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  color: "var(--fg-1)",
                  letterSpacing: "-2px",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {t.price}
              </span>
              <span style={{ fontSize: 13, color: "var(--fg-3)" }}>
                {t.period}
              </span>
            </div>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--fg-2)",
              }}
            >
              {t.tagline}
            </span>
          </div>

          <hr className="rl-divider" style={{ margin: 0 }} />

          {/* Features */}
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              flex: 1,
            }}
          >
            {t.features.map((f) => (
              <li
                key={f}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--fg-2)",
                  display: "flex",
                  gap: 8,
                }}
              >
                <span style={{ color: "var(--phos)", flexShrink: 0 }}>+</span>
                {f}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            to={t.ctaTo}
            className={`rl-btn rl-btn-${t.variant} rl-btn-block`}
            style={{ fontSize: 13 }}
          >
            {t.cta}
          </Link>
        </div>
      ))}
    </div>
  );
}
