import { useState } from "react";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import MobileBottomNav from "~/components/MobileBottomNav";
import PricingTiers from "~/components/PricingTiers";
import { PublicNav } from "~/routes/landing";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "ResumeLens | Pricing" },
  { name: "description", content: "Start free. Upgrade when it works." },
];

const FAQS = [
  {
    q: "Which ATS systems do you simulate?",
    a: "Our parser replicates the extraction behavior of the major applicant tracking systems used by most large employers — including how they handle columns, tables, images, and non-standard fonts.",
  },
  {
    q: "Will rewrites still sound like me?",
    a: "Yes. The engine rewrites only the structure and evidence of each bullet — your vocabulary and tone are preserved, and nothing is applied until you accept it.",
  },
  {
    q: "What happens to my data?",
    a: "Resumes are encrypted, never shared, and never used to train models. Delete your account and everything is gone within 24 hours.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Anytime, in one click from Settings. Annual plans are refunded pro-rata for unused months.",
  },
];

function FAQ() {
  const [open, setOpen] = useState<number>(0);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}>
      <h2
        style={{
          fontWeight: 900,
          fontSize: 30,
          letterSpacing: "-0.025em",
          margin: "0 0 24px",
        }}
      >
        Questions
      </h2>
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.q}
            style={{
              border: "var(--bw) solid var(--ink)",
              borderRadius: 12,
              background: "var(--surface)",
              marginBottom: 10,
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 22px",
                cursor: "pointer",
                userSelect: "none",
                fontWeight: 800,
                fontSize: 15,
                background: "transparent",
                border: "none",
                fontFamily: "var(--font-sans)",
                textAlign: "left",
                gap: 12,
                color: "var(--ink)",
                transition: "background var(--dur-fast) ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--fill-1)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "")}
            >
              <span>{f.q}</span>
              <span style={{ fontWeight: 900, flexShrink: 0 }}>
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <div
                style={{
                  padding: "0 22px 18px",
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: "var(--fg-2)",
                  fontWeight: 500,
                }}
              >
                {f.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Pricing() {
  const { auth } = usePuterStore();

  return (
    <main className="rl-page has-bottom-nav">
      {auth.isAuthenticated ? <Navbar /> : <PublicNav active="pricing" />}

      <div
        id="main-content"
        style={{
          flex: 1,
          maxWidth: 1060,
          width: "100%",
          margin: "0 auto",
          padding: "64px 32px 88px",
          boxSizing: "border-box",
        }}
      >
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <h1
            style={{
              fontWeight: 900,
              fontSize: "clamp(36px, 5vw, 52px)",
              letterSpacing: "-0.035em",
              margin: "0 0 14px",
            }}
          >
            Start free. Upgrade when it works.
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "var(--fg-2)",
              fontWeight: 600,
              margin: 0,
            }}
          >
            Cancel anytime. No card for the free plan.
          </p>
        </div>

        <div style={{ marginBottom: 64 }}>
          <PricingTiers />
        </div>

        <FAQ />
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
