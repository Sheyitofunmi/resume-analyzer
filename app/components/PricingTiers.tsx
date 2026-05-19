import { useState } from "react";
import { Link } from "react-router";
import { Corners } from "~/components/atoms";

type FeatureItem = string | { type: "inherit"; label: string };

interface Tier {
  id: string;
  tier: string;
  monthlyPrice: string;
  yearlyPrice: string;
  period: string;
  tagline: string;
  recommended: boolean;
  features: FeatureItem[];
  cta: string;
  ctaTo: string;
  variant: "primary" | "secondary";
}

export const TIERS: Tier[] = [
  {
    id: "free",
    tier: "FREE",
    monthlyPrice: "$0",
    yearlyPrice: "$0",
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
    variant: "secondary",
  },
  {
    id: "pro",
    tier: "PRO",
    monthlyPrice: "$12",
    yearlyPrice: "$9",
    period: "/month",
    tagline: "for active job searches",
    recommended: true,
    features: [
      { type: "inherit", label: "all of free, plus:" },
      "unlimited analyses",
      "interview question prep",
      "AI rewrite — every bullet",
      "unlimited score history + trends",
      "side-by-side compare",
      "priority response (~2s avg)",
    ],
    cta: "$ try_pro_free →",
    ctaTo: "/auth",
    variant: "primary",
  },
  {
    id: "recruiter",
    tier: "RECRUITER",
    monthlyPrice: "$49",
    yearlyPrice: "$39",
    period: "/month",
    tagline: "evaluate candidates in seconds",
    recommended: false,
    features: [
      { type: "inherit", label: "all of pro, plus:" },
      "bulk analyze (50+ resumes)",
      "team workspaces",
      "JD-to-candidate matching",
      "export to ATS-friendly CSV",
      "sso · audit log · sla",
    ],
    cta: "$ contact_us →",
    ctaTo: "/contact",
    variant: "secondary",
  },
];

export default function PricingTiers() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="rl-pricing-wrap">
      {/* Billing toggle */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}
      >
        <div className="rl-pricing-toggle">
          <button
            className={`rl-pricing-toggle-btn${!annual ? " is-active" : ""}`}
            onClick={() => setAnnual(false)}
          >
            monthly
          </button>
          <button
            className={`rl-pricing-toggle-btn${annual ? " is-active" : ""}`}
            onClick={() => setAnnual(true)}
          >
            annual
          </button>
        </div>
        {annual && <span className="rl-pricing-save-badge">save ~25%</span>}
      </div>

      {/* Cards */}
      <div className="rl-pricing-grid">
        {TIERS.map((t) => {
          const price = annual ? t.yearlyPrice : t.monthlyPrice;
          return (
            <div
              key={t.id}
              className={`rl-card rl-pricing-card${t.recommended ? " is-phos" : ""}`}
              aria-label={`${t.tier} plan${t.recommended ? " — recommended" : ""}`}
            >
              <Corners />

              {t.recommended && (
                <div className="rl-pricing-badge" aria-hidden="true">
                  RECOMMENDED
                </div>
              )}

              {/* Header */}
              <div className="rl-pricing-header">
                <span
                  className="rl-pricing-tier-name"
                  style={{
                    color: t.recommended ? "var(--phos)" : "var(--fg-3)",
                  }}
                >
                  {t.tier}
                </span>
                <div className="rl-pricing-price-row">
                  <span className="rl-pricing-price">{price}</span>
                  <span className="rl-pricing-period">{t.period}</span>
                </div>
                <div className="rl-pricing-annual-note">
                  {annual && price !== "$0" ? "billed annually" : ""}
                </div>
                <span className="rl-pricing-tagline">{t.tagline}</span>
              </div>

              <hr className="rl-divider" style={{ margin: 0 }} />

              {/* Features */}
              <ul className="rl-pricing-features">
                {t.features.map((f, i) =>
                  typeof f === "object" ? (
                    <li key={i} className="rl-pricing-inherit">
                      {f.label}
                    </li>
                  ) : (
                    <li key={i} className="rl-pricing-feature">
                      <span
                        className="rl-pricing-feature-icon"
                        aria-hidden="true"
                      >
                        +
                      </span>
                      {f}
                    </li>
                  ),
                )}
              </ul>

              {/* CTA */}
              <Link
                to={t.ctaTo}
                className={`rl-btn rl-btn-${t.variant} rl-btn-block`}
              >
                {t.cta}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
