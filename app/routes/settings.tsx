import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import MobileBottomNav from "~/components/MobileBottomNav";
import { usePuterStore } from "~/lib/puter";
import { revealUp, staggerContainer } from "~/lib/motion";

export const meta = () => [{ title: "ResumeLens | Settings" }];

// ── Toggle (52×28 pill, lime when on) ──────────────────────────────────
function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`toggle${on ? " toggle--on" : ""}`}
    />
  );
}

// ── Setting row ────────────────────────────────────────────────────────
function SettingRow({
  label,
  desc,
  last = false,
  children,
}: {
  label: string;
  desc?: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "16px 0",
        borderBottom: last ? "none" : "1.5px solid var(--fill-3)",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ fontWeight: 800, fontSize: 14.5, color: "var(--ink)" }}>
          {label}
        </span>
        {desc && (
          <span
            style={{ fontSize: 12.5, color: "var(--fg-2)", fontWeight: 600 }}
          >
            {desc}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Section card with header bar ───────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        border: "var(--bw) solid var(--ink)",
        borderRadius: "var(--r-card)",
        background: "var(--surface)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 26px",
          borderBottom: "var(--bw) solid var(--ink)",
          background: "var(--fill-1)",
          fontWeight: 900,
          fontSize: 15,
        }}
      >
        {title}
      </div>
      <div style={{ padding: "10px 26px 16px" }}>{children}</div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────
export default function Settings() {
  const { auth, isLoading, kv } = usePuterStore();
  const navigate = useNavigate();

  // Notification toggles
  const [notifs, setNotifs] = useState({
    analysisComplete: true,
    scoreImproved: true,
    weeklyDigest: false,
    productUpdates: false,
  });

  // Career
  const [onboardingData, setOnboardingData] = useState<{
    role: string;
    seniority: string;
    goal: string;
  } | null>(null);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate("/auth?next=/settings");
  }, [isLoading, auth.isAuthenticated]);

  useEffect(() => {
    if (isLoading || !auth.isAuthenticated) return;
    kv.get("onboarding").then((raw) => {
      if (raw) setOnboardingData(JSON.parse(raw));
    });
  }, [isLoading, auth.isAuthenticated]);

  const handleWipeData = async () => {
    if (
      !confirm("Delete all resumes and analysis data? This cannot be undone.")
    )
      return;
    await kv.flush?.();
    navigate("/");
  };

  const user = auth.user;

  const NOTIF_DEFS: {
    key: keyof typeof notifs;
    name: string;
    desc: string;
  }[] = [
    {
      key: "analysisComplete",
      name: "Scan complete",
      desc: "Notify me when a scan finishes with the new score.",
    },
    {
      key: "scoreImproved",
      name: "Score improved",
      desc: "Alert me when a score beats the previous run.",
    },
    {
      key: "weeklyDigest",
      name: "Weekly digest",
      desc: "Score trend and new keyword opportunities, every Monday.",
    },
    {
      key: "productUpdates",
      name: "Product updates",
      desc: "New features and releases.",
    },
  ];

  return (
    <main className="rl-page has-bottom-nav">
      <Navbar />

      <div
        id="main-content"
        style={{
          flex: 1,
          maxWidth: 860,
          width: "100%",
          margin: "0 auto",
          padding: "44px 32px 80px",
          boxSizing: "border-box",
        }}
      >
        <motion.h1
          variants={revealUp}
          initial="hidden"
          animate="visible"
          style={{ fontSize: 40, letterSpacing: "-0.03em", margin: "0 0 36px" }}
        >
          Settings
        </motion.h1>

        <motion.div
          variants={staggerContainer(0.07, 0.05)}
          initial="hidden"
          animate="visible"
          style={{ display: "flex", flexDirection: "column", gap: 18 }}
        >
          {/* Account */}
          <motion.div variants={revealUp}>
            <Section title="Account">
              <SettingRow label="Username" desc="Your Puter account handle">
                <span className="chip chip--fill">{user?.username ?? "—"}</span>
              </SettingRow>
              <SettingRow label="Signed in with" desc="Authentication method">
                <span className="chip chip--cyan">Puter</span>
              </SettingRow>
              <SettingRow
                label="Session"
                desc="Sign out of ResumeLens on this device"
                last
              >
                <button
                  type="button"
                  onClick={auth.signOut}
                  className="btn btn--outline btn--sm"
                >
                  Sign out
                </button>
              </SettingRow>
            </Section>
          </motion.div>

          {/* Career profile */}
          <motion.div variants={revealUp}>
            <Section title="Career profile">
              {onboardingData ? (
                <>
                  <SettingRow label="Target role">
                    <span className="chip chip--fill">
                      {onboardingData.role || "—"}
                    </span>
                  </SettingRow>
                  <SettingRow label="Seniority">
                    <span className="chip chip--fill">
                      {onboardingData.seniority || "—"}
                    </span>
                  </SettingRow>
                  <SettingRow label="Goal">
                    <span className="chip chip--fill">
                      {onboardingData.goal || "—"}
                    </span>
                  </SettingRow>
                  <SettingRow
                    label="Update your target"
                    desc="Scores and rewrites are tuned to this"
                    last
                  >
                    <button
                      type="button"
                      onClick={() => navigate("/onboarding")}
                      className="btn btn--outline btn--sm"
                    >
                      ✎ Edit profile
                    </button>
                  </SettingRow>
                </>
              ) : (
                <SettingRow
                  label="No target set"
                  desc="Tell us the role you're chasing to tune your scores"
                  last
                >
                  <button
                    type="button"
                    onClick={() => navigate("/onboarding")}
                    className="btn btn--primary btn--sm"
                  >
                    Set up profile →
                  </button>
                </SettingRow>
              )}
            </Section>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={revealUp}>
            <Section title="Notifications">
              {NOTIF_DEFS.map((d, i) => (
                <SettingRow
                  key={d.key}
                  label={d.name}
                  desc={d.desc}
                  last={i === NOTIF_DEFS.length - 1}
                >
                  <Toggle
                    on={notifs[d.key]}
                    label={d.name}
                    onChange={(v) => setNotifs((n) => ({ ...n, [d.key]: v }))}
                  />
                </SettingRow>
              ))}
            </Section>
          </motion.div>

          {/* Plan — lime card */}
          <motion.div variants={revealUp}>
            <div
              className="card card--lime"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 20,
                flexWrap: "wrap",
                padding: 26,
              }}
            >
              <div>
                <div
                  className="eyebrow eyebrow--ink"
                  style={{ fontSize: 10, marginBottom: 8 }}
                >
                  CURRENT PLAN
                </div>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 24,
                    letterSpacing: "-0.02em",
                    marginBottom: 4,
                  }}
                >
                  Free
                </div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>
                  Full 5-dimension scores · your data stays in your Puter cloud
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/pricing")}
                style={{
                  background: "var(--ink)",
                  color: "var(--lime)",
                  padding: "14px 28px",
                  borderRadius: 10,
                  fontWeight: 900,
                  fontSize: 14,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                  transition: "box-shadow var(--dur-fast) ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "4px 4px 0 rgba(11,11,11,.3)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "")}
              >
                Upgrade to Pro ▸
              </button>
            </div>
          </motion.div>

          {/* Data */}
          <motion.div variants={revealUp}>
            <Section title="Your data">
              <SettingRow
                label="Storage"
                desc="Everything is stored in your own Puter cloud — never on our servers"
              >
                <span className="chip chip--lime">✓ Puter cloud</span>
              </SettingRow>
              <SettingRow
                label="Export data"
                desc="Download all your resumes and analyses"
                last
              >
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => alert("Export coming soon.")}
                >
                  ↓ Export all
                </button>
              </SettingRow>
            </Section>
          </motion.div>

          {/* Danger zone */}
          <motion.div variants={revealUp}>
            <div
              style={{
                border: "var(--bw) solid var(--red)",
                borderRadius: "var(--r-card)",
                background: "var(--surface)",
                padding: 26,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 15,
                    color: "var(--red)",
                    marginBottom: 4,
                  }}
                >
                  Delete account & data
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "var(--fg-2)",
                    fontWeight: 600,
                  }}
                >
                  Removes every resume, version, and score. Cannot be undone.
                </div>
              </div>
              <button
                type="button"
                onClick={handleWipeData}
                className="btn btn--danger btn--sm"
              >
                Delete everything
              </button>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
