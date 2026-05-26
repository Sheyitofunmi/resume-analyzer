import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion, useInView } from "framer-motion";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import MobileBottomNav from "~/components/MobileBottomNav";
import { Eyebrow, ScoreBar, StatusPill } from "~/components/atoms";
import {
  DIMS,
  DimSparklineCard,
  LineChart,
  scoreTier,
  scoreTierColor,
} from "~/components/ScoreCharts";
import { usePuterStore } from "~/lib/puter";
import { useCountUp } from "~/hooks/useCountUp";
import { revealLeft, revealUp, staggerContainer } from "~/lib/motion";

function KPICard({
  kpi,
  index,
}: {
  kpi: { label: string; value: number; suffix: string; prefix?: string };
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const display = useCountUp(inView ? kpi.value : 0, 1200);

  return (
    <motion.div
      ref={ref}
      variants={revealUp}
      custom={index}
      className="rl-card"
      style={{ position: "relative" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 28,
            fontWeight: 700,
            color: scoreTierColor(kpi.label === "avg_lift" ? 70 : kpi.value),
            letterSpacing: "-1px",
            fontVariantNumeric: "tabular-nums",
            textShadow: "0 0 14px currentColor",
          }}
        >
          {kpi.prefix ?? ""}
          {Math.round(display)}
          {kpi.suffix}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--fg-3)",
            letterSpacing: "0.12em",
          }}
        >
          {kpi.label}
        </span>
      </div>
    </motion.div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────
export default function History() {
  const { auth, isLoading, kv } = usePuterStore();
  const navigate = useNavigate();
  const [runs, setRuns] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate("/auth?next=/history");
  }, [isLoading, auth.isAuthenticated]);

  useEffect(() => {
    if (isLoading || !auth.isAuthenticated) return;
    (async () => {
      setLoading(true);
      const items = (await kv.list("resume:*", true)) as KVItem[];
      const parsed =
        items?.map((item) => JSON.parse(item.value) as Resume) ?? [];
      setRuns(parsed.sort((a, b) => (a.id > b.id ? 1 : -1)));
      setLoading(false);
    })();
  }, [isLoading, auth.isAuthenticated]);

  const scores = runs.map((r) => r.feedback.overallScore);
  const firstScore = scores[0] ?? 0;
  const currentScore = scores[scores.length - 1] ?? 0;
  const avgLift =
    scores.length > 1
      ? Math.round(
          scores.slice(1).reduce((sum, s, i) => sum + (s - scores[i]), 0) /
            (scores.length - 1),
        )
      : 0;

  const KPIs = [
    { label: "first_score", value: firstScore, suffix: "" },
    { label: "current_score", value: currentScore, suffix: "" },
    { label: "total_runs", value: runs.length, suffix: "" },
    {
      label: "avg_lift",
      value: Math.abs(avgLift),
      suffix: "",
      prefix: avgLift >= 0 ? "▲ +" : "▼ -",
    },
  ];

  return (
    <main className="rl-page">
      <Navbar />

      <div
        className="rl-section"
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 32 }}
      >
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Eyebrow mode="prompt">score_history</Eyebrow>
          <h1>
            your_score
            <span style={{ color: "var(--phos)" }}>_timeline</span>
          </h1>
        </div>

        {loading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "48px 0",
            }}
          >
            <span className="rl-dot" />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "var(--fg-3)",
              }}
            >
              loading history…
            </span>
          </div>
        ) : runs.length === 0 ? (
          <div
            className="rl-card"
            style={{
              position: "relative",
              textAlign: "center",
              padding: "48px 32px",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "var(--fg-3)",
                margin: 0,
              }}
            >
              // no runs yet — upload a resume to start tracking
            </p>
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <motion.div
              variants={staggerContainer(0.08)}
              initial="hidden"
              animate="visible"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 16,
              }}
            >
              {KPIs.map((kpi, i) => (
                <KPICard key={kpi.label} kpi={kpi} index={i} />
              ))}
            </motion.div>

            {/* Line chart */}
            <motion.div
              className="rl-card"
              variants={revealLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              style={{ position: "relative" }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span className="rl-eyebrow-prompt">overall_score_trend</span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--fg-4)",
                    }}
                  >
                    {runs.length} run{runs.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <LineChart runs={runs} />
              </div>
            </motion.div>

            {/* Per-dimension sparklines */}
            <motion.div
              variants={staggerContainer(0.06)}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 16,
              }}
            >
              {DIMS.map(({ key, label }) => {
                const dimScores = runs.map(
                  (r) =>
                    (r.feedback[key as keyof Feedback] as { score: number })
                      .score,
                );
                return (
                  <motion.div key={key} variants={revealUp}>
                    <DimSparklineCard label={label} dimScores={dimScores} />
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Run log table */}
            <motion.div
              className="rl-card"
              variants={revealUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              style={{ position: "relative", padding: 0 }}
            >
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "1px dashed var(--border)",
                  background: "var(--bg-2)",
                }}
              >
                <span className="rl-eyebrow-prompt">run_log</span>
              </div>
              {[...runs].reverse().map((r, i) => {
                const s = r.feedback.overallScore;
                const tier = scoreTier(s);
                return (
                  <motion.div
                    key={r.id}
                    className="rl-row rl-history-row rl-row-clickable"
                    onClick={() => navigate(`/resume/${r.id}`)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.3 }}
                    style={{ cursor: "pointer", gap: 16, padding: "12px 20px" }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--fg-4)",
                        width: 24,
                        flexShrink: 0,
                      }}
                    >
                      {String(runs.length - i).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        color: "var(--fg-1)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.companyName || "resume"}
                      {r.jobTitle && (
                        <span style={{ color: "var(--fg-3)", marginLeft: 8 }}>
                          · {r.jobTitle}
                        </span>
                      )}
                    </span>
                    <span className="rl-run-score-bar">
                      <ScoreBar score={s} cells={16} />
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 13,
                        fontWeight: 700,
                        color: scoreTierColor(s),
                        fontVariantNumeric: "tabular-nums",
                        width: 28,
                        textAlign: "right",
                      }}
                    >
                      {s}
                    </span>
                    <span className="rl-mobile-hide">
                      <StatusPill tier={tier}>
                        {tier === "good"
                          ? "PASS"
                          : tier === "warn"
                            ? "WARN"
                            : "FAIL"}
                      </StatusPill>
                    </span>
                    <span
                      className="rl-row-arrow"
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--phos)",
                        flexShrink: 0,
                        display: "inline-block",
                      }}
                    >
                      →
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </>
        )}
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
