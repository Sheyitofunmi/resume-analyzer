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
    q: "What does the ATS score actually measure?",
    a: "It's a heuristic, not a simulation of any specific ATS. We extract your resume in the browser the way a plain-text parser would — so columns, tables, images and unusual fonts show up as extraction problems — then have the model judge what survived. Treat it as a signal about how machine-readable your resume is, not a guaranteed pass or fail at any one employer.",
  },
  {
    q: "Will rewrites still sound like me?",
    a: "The engine rewrites the structure and evidence of a bullet rather than your vocabulary, and nothing is applied automatically — every suggestion sits next to your original so you can take it or leave it.",
  },
  {
    q: "What happens to my data?",
    a: "Your resume is parsed in your browser and stored in your own Puter cloud account, not on a server we run. We can't read it, and it isn't used to train anything. You can delete everything yourself at any time from Settings.",
  },
  {
    q: "Is it really free?",
    a: "Yes, and there's nothing to cancel — ResumeLens is in early access with no billing set up. AI calls run through Puter, which bills usage to your own Puter account rather than ours. If paid plans arrive later, anything you can do today will stay available.",
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
