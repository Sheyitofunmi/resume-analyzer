import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import MobileBottomNav from "~/components/MobileBottomNav";
import { Corners, Cursor, Eyebrow, StatusPill } from "~/components/atoms";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [{ title: "ResumeLens | Settings" }];

// ── Toggle ─────────────────────────────────────────────────────────────
function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        background: on ? "var(--phos)" : "var(--surface-2)",
        border: `1px solid ${on ? "var(--phos-dim)" : "var(--border-hi)"}`,
        position: "relative",
        cursor: "pointer",
        transition: "all var(--dur-base)",
        flexShrink: 0,
        boxShadow: on ? "0 0 8px var(--phos-glow)" : "none",
      }}
      aria-pressed={on}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? 20 : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: on ? "var(--bg)" : "var(--fg-4)",
          transition: "left var(--dur-base) var(--ease-out)",
        }}
      />
    </button>
  );
}

// ── SettingRow ─────────────────────────────────────────────────────────
function SettingRow({
  label,
  desc,
  children,
}: {
  label: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "12px 0",
        borderBottom: "1px dashed var(--border)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--fg-1)",
          }}
        >
          {label}
        </span>
        {desc && (
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
              color: "var(--fg-3)",
            }}
          >
            {desc}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Section block ──────────────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rl-card" style={{ position: "relative" }}>
      <Corners />
      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
        <div
          style={{
            paddingBottom: 16,
            marginBottom: 4,
            borderBottom: "1px solid var(--border)",
          }}
        >
          <span className="rl-eyebrow-prompt">{title}</span>
        </div>
        {children}
      </div>
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

  // Appearance
  const [density, setDensity] = useState<"compact" | "default" | "relaxed">(
    "default",
  );

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

  return (
    <main className="rl-page">
      <Navbar />

      <div
        className="rl-section"
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Eyebrow mode="prompt">settings</Eyebrow>
          <h1>
            your_
            <span style={{ color: "var(--copper-hi)" }}>preferences</span>
            <Cursor />
          </h1>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            maxWidth: 720,
          }}
        >
          {/* 1. Profile */}
          <Section title="profile">
            <SettingRow label="username" desc="your Puter account handle">
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--fg-2)",
                  padding: "4px 10px",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                {user?.username ?? "—"}
              </span>
            </SettingRow>
            <SettingRow label="auth_provider" desc="authentication method">
              <span
                className="rl-chip"
                style={{ color: "var(--phos)", borderColor: "var(--phos-dim)" }}
              >
                puter
              </span>
            </SettingRow>
            <div style={{ paddingTop: 12 }}>
              <button
                type="button"
                onClick={auth.signOut}
                className="rl-btn rl-btn-secondary"
                style={{ fontSize: 12 }}
              >
                ✕ sign_out
              </button>
            </div>
          </Section>

          {/* 2. Career */}
          <Section title="career_profile">
            {onboardingData ? (
              <>
                <SettingRow label="role">
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--fg-2)",
                    }}
                  >
                    {onboardingData.role || "—"}
                  </span>
                </SettingRow>
                <SettingRow label="seniority">
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--fg-2)",
                    }}
                  >
                    {onboardingData.seniority || "—"}
                  </span>
                </SettingRow>
                <SettingRow label="goal">
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--fg-2)",
                    }}
                  >
                    {onboardingData.goal || "—"}
                  </span>
                </SettingRow>
                <div style={{ paddingTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => navigate("/onboarding")}
                    className="rl-btn rl-btn-secondary"
                    style={{ fontSize: 12 }}
                  >
                    ✎ edit_career_profile
                  </button>
                </div>
              </>
            ) : (
              <div style={{ paddingTop: 12 }}>
                <button
                  type="button"
                  onClick={() => navigate("/onboarding")}
                  className="rl-btn rl-btn-primary"
                  style={{ fontSize: 12 }}
                >
                  $ setup_career_profile →
                </button>
              </div>
            )}
          </Section>

          {/* 3. Notifications */}
          <Section title="notifications">
            <SettingRow
              label="analysis_complete"
              desc="notify when AI finishes scoring"
            >
              <Toggle
                on={notifs.analysisComplete}
                onChange={(v) =>
                  setNotifs((n) => ({ ...n, analysisComplete: v }))
                }
              />
            </SettingRow>
            <SettingRow
              label="score_improved"
              desc="alert when your score beats previous run"
            >
              <Toggle
                on={notifs.scoreImproved}
                onChange={(v) => setNotifs((n) => ({ ...n, scoreImproved: v }))}
              />
            </SettingRow>
            <SettingRow label="weekly_digest" desc="summary email every Monday">
              <Toggle
                on={notifs.weeklyDigest}
                onChange={(v) => setNotifs((n) => ({ ...n, weeklyDigest: v }))}
              />
            </SettingRow>
            <SettingRow
              label="product_updates"
              desc="new features and releases"
            >
              <Toggle
                on={notifs.productUpdates}
                onChange={(v) =>
                  setNotifs((n) => ({ ...n, productUpdates: v }))
                }
              />
            </SettingRow>
          </Section>

          {/* 4. Plan */}
          <Section title="plan">
            <SettingRow label="current_plan" desc="your active subscription">
              <StatusPill tier="good">FREE</StatusPill>
            </SettingRow>
            <SettingRow label="analyses_used" desc="this billing period">
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--fg-2)",
                }}
              >
                0 / 5
              </span>
            </SettingRow>
            <div style={{ paddingTop: 12 }}>
              <button
                type="button"
                onClick={() => navigate("/pricing")}
                className="rl-btn rl-btn-copper"
                style={{ fontSize: 12 }}
              >
                $ upgrade_to_pro →
              </button>
            </div>
          </Section>

          {/* 5. Appearance */}
          <Section title="appearance">
            <SettingRow label="theme" desc="always dark — by design">
              <span
                className="rl-chip"
                style={{ color: "var(--phos)", borderColor: "var(--phos-dim)" }}
              >
                CIPHER dark
              </span>
            </SettingRow>
            <SettingRow label="density" desc="ui element spacing">
              <div style={{ display: "flex", gap: 6 }}>
                {(["compact", "default", "relaxed"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDensity(d)}
                    className={`rl-btn ${density === d ? "rl-btn-copper" : "rl-btn-secondary"}`}
                    style={{ fontSize: 11, padding: "4px 10px" }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </SettingRow>
          </Section>

          {/* 6. Data */}
          <Section title="data">
            <SettingRow
              label="storage"
              desc="all data stored locally via Puter — never on our servers"
            >
              <span
                className="rl-chip"
                style={{ color: "var(--phos)", borderColor: "var(--phos-dim)" }}
              >
                ✓ puter cloud
              </span>
            </SettingRow>
            <SettingRow
              label="export_data"
              desc="download all your resumes and analyses"
            >
              <button
                type="button"
                className="rl-btn rl-btn-secondary"
                style={{ fontSize: 12 }}
                onClick={() => alert("Export coming soon.")}
              >
                ↓ export_all
              </button>
            </SettingRow>
            <div style={{ paddingTop: 16 }}>
              <button
                type="button"
                onClick={handleWipeData}
                className="rl-btn rl-btn-ghost"
                style={{
                  fontSize: 12,
                  color: "var(--ember)",
                  borderColor: "var(--ember-dim)",
                }}
              >
                ✕ delete_all_data
              </button>
            </div>
          </Section>
        </div>
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
