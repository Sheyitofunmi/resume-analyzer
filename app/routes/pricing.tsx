import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import MobileBottomNav from "~/components/MobileBottomNav";
import PricingTiers from "~/components/PricingTiers";
import { Cursor, Eyebrow } from "~/components/atoms";

export const meta = () => [
  { title: "ResumeLens | Pricing" },
  { name: "description", content: "One tier away from your offer" },
];

export default function Pricing() {
  return (
    <main className="rl-page">
      <Navbar />

      <div className="rl-section" style={{ flex: 1 }}>
        {/* Hero */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            textAlign: "center",
            paddingBottom: 48,
          }}
        >
          <Eyebrow mode="comment">pricing</Eyebrow>
          <h1 style={{ maxWidth: 640 }}>
            one tier away from your offer
            <Cursor />
          </h1>
        </div>

        <PricingTiers />

        {/* FAQ teaser */}
        <div
          style={{
            marginTop: 64,
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <span className="rl-eyebrow">// questions?</span>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 14,
              color: "var(--fg-2)",
              margin: 0,
            }}
          >
            All plans include a 7-day free trial. Cancel any time. No credit
            card required to start.
          </p>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
