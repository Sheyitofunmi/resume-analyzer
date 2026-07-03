import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion, useInView } from "framer-motion";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import MobileBottomNav from "~/components/MobileBottomNav";
import { StatusPill } from "~/components/atoms";
import { DIMS, DimSparklineCard, scoreTier } from "~/components/ScoreCharts";
import { usePuterStore } from "~/lib/puter";
import { useCountUp } from "~/hooks/useCountUp";
import { revealUp, staggerContainer } from "~/lib/motion";

export const meta = () => [{ title: "ResumeLens | Score History" }];

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
      className="card"
      style={{ position: "relative" }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span
          style={{
            fontSize: 30,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {kpi.prefix ?? ""}
          {Math.round(display)}
          {kpi.suffix}
        </span>
        <span className="eyebrow" style={{ fontSize: 10 }}>
          {kpi.label}
        </span>
      </div>
    </motion.div>
  );
}

// ── Clickable run bar chart + detail card (per the design) ────────────
const BAR_COLORS = [
  "var(--fill-3)",
  "var(--cyan)",
  "var(--violet)",
  "var(--lime)",
];

function RunBars({ runs }: { runs: Resume[] }) {
  const [sel, setSel] = useState(runs.length - 1);
  const selected = runs[Math.min(sel, runs.length - 1)];
  const maxShown = 8;
  const shown = runs.slice(-maxShown);
  const offset = runs.length - shown.length;

  const dims: { key: keyof Feedback; label: string }[] = [
    { key: "ATS", label: "ATS" },
    { key: "toneAndStyle", label: "Tone & style" },
    { key: "content", label: "Content" },
    { key: "structure", label: "Structure" },
    { key: "skills", label: "Skills" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Bars */}
      <div className="card" style={{ padding: 26 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 20,
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span className="eyebrow">{"// SCORE BY RUN — CLICK A BAR"}</span>
          <span className="mono-stamp">
            {runs.length} RUN{runs.length !== 1 ? "S" : ""}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 12,
            height: 150,
          }}
        >
          {shown.map((r, i) => {
            const idx = offset + i;
            const score = r.feedback.overallScore;
            const isSel = idx === sel;
            return (
              <button
                key={r.id}
                onClick={() => setSel(idx)}
                aria-pressed={isSel}
                aria-label={`Run ${idx + 1} — score ${score}`}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  height: "100%",
                  justifyContent: "flex-end",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: `${Math.max(8, score)}%`,
                    background: isSel
                      ? "var(--lime)"
                      : BAR_COLORS[i % BAR_COLORS.length],
                    border: "var(--bw) solid var(--ink)",
                    borderRadius: "6px 6px 0 0",
                    boxShadow: isSel ? "4px 4px 0 var(--ink)" : "none",
                    transform: isSel ? "translate(-1px,-1px)" : "none",
                    transition:
                      "box-shadow var(--dur-fast) ease, transform var(--dur-fast) ease, background var(--dur-fast) ease",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 9.5,
                    color: isSel ? "var(--ink)" : "var(--fg-3)",
                    fontWeight: isSel ? 600 : 400,
                    whiteSpace: "nowrap",
                  }}
                >
                  #{idx + 1} · {score}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected run detail — cyan card */}
      {selected && (
        <div
          key={selected.id}
          className="card card--cyan pop-in"
          style={{ padding: 26 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            <div>
              <div
                className="eyebrow eyebrow--ink"
                style={{ fontSize: 10, marginBottom: 6 }}
              >
                RUN #{sel + 1}
              </div>
              <div style={{ fontWeight: 900, fontSize: 20 }}>
                {selected.companyName || "Resume"}
                {selected.jobTitle && (
                  <span style={{ fontWeight: 700, fontSize: 14 }}>
                    {" "}
                    · {selected.jobTitle}
                  </span>
                )}
              </div>
            </div>
            <span
              style={{
                fontSize: 34,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              {selected.feedback.overallScore}
              <span style={{ fontSize: 14, fontWeight: 700 }}>/100</span>
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              marginBottom: 18,
            }}
          >
            {dims.map(({ key, label }, i) => {
              const s = (selected.feedback[key] as { score: number }).score;
              return (
                <div
                  key={key}
                  style={{ display: "flex", alignItems: "center", gap: 12 }}
                >
                  <span
                    style={{
                      width: 92,
                      fontSize: 13,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {label}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 9,
                      background: "rgba(255,255,255,.5)",
                      border: "var(--bw) solid var(--ink)",
                      borderRadius: 5,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${s}%`,
                        height: "100%",
                        background: "var(--ink)",
                        animation: `rl-grow .8s ${i * 0.12}s both`,
                      }}
                    />
                  </div>
                  <span
                    style={{
                      width: 32,
                      fontWeight: 900,
                      fontSize: 14,
                      textAlign: "right",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
          <Link
            to={`/resume/${selected.id}`}
            className="btn btn--primary btn--sm"
          >
            Open report ▸
          </Link>
        </div>
      )}
    </div>
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
  const totalLift = currentScore - firstScore;
  const avgLift =
    scores.length > 1
      ? Math.round(
          scores.slice(1).reduce((sum, s, i) => sum + (s - scores[i]), 0) /
            (scores.length - 1),
        )
      : 0;

  const KPIs = [
    { label: "FIRST SCORE", value: firstScore, suffix: "" },
    { label: "CURRENT SCORE", value: currentScore, suffix: "" },
    { label: "TOTAL RUNS", value: runs.length, suffix: "" },
    {
      label: "AVG LIFT PER RUN",
      value: Math.abs(avgLift),
      suffix: "",
      prefix: avgLift >= 0 ? "▲ +" : "▼ −",
    },
  ];

  return (
    <main className="rl-page has-bottom-nav">
      <Navbar />

      <div
        id="main-content"
        className="rl-container"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 28,
          padding: "44px var(--gutter-inner) 80px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ fontSize: 38, letterSpacing: "-0.03em" }}>
            Score history
          </h1>
          {runs.length > 1 && (
            <span className="badge-mono">
              {totalLift >= 0 ? "▲ +" : "▼ −"}
              {Math.abs(totalLift)} since first run
            </span>
          )}
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
            <span
              className="pix-blink"
              style={{
                width: 12,
                height: 12,
                background: "var(--cyan)",
                border: "var(--bw) solid var(--ink)",
                borderRadius: 3,
                display: "inline-block",
              }}
            />
            <span
              style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fg-2)" }}
            >
              Loading your history…
            </span>
          </div>
        ) : runs.length === 0 ? (
          <div
            className="card card--pop"
            style={{
              position: "relative",
              textAlign: "center",
              padding: "48px 32px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            <p
              style={{
                fontSize: 14.5,
                fontWeight: 600,
                color: "var(--fg-2)",
                margin: 0,
              }}
            >
              No runs yet — upload a resume to start tracking your scores.
            </p>
            <Link to="/upload" className="btn btn--primary">
              Upload a resume →
            </Link>
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

            {/* Clickable bar chart + selected run detail */}
            <RunBars runs={runs} />

            {/* Per-dimension sparklines */}
            {runs.length > 1 && (
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
            )}

            {/* Run log */}
            <motion.div
              className="card"
              variants={revealUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              style={{ position: "relative", padding: 0, overflow: "hidden" }}
            >
              <div
                style={{
                  padding: "14px 20px",
                  borderBottom: "var(--bw) solid var(--ink)",
                  background: "var(--fill-1)",
                }}
              >
                <span className="eyebrow">{"// RUN LOG"}</span>
              </div>
              {[...runs].reverse().map((r, i) => {
                const s = r.feedback.overallScore;
                const tier = scoreTier(s);
                return (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/resume/${r.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") navigate(`/resume/${r.id}`);
                    }}
                    role="link"
                    tabIndex={0}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      cursor: "pointer",
                      gap: 16,
                      padding: "13px 20px",
                      borderBottom:
                        i < runs.length - 1 ? "1px solid var(--line)" : "none",
                      transition: "background var(--dur-fast) ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--fill-1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "")
                    }
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--fg-3)",
                        width: 24,
                        flexShrink: 0,
                      }}
                    >
                      {String(runs.length - i).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontSize: 14,
                        fontWeight: 800,
                        color: "var(--ink)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.companyName || "Resume"}
                      {r.jobTitle && (
                        <span
                          style={{
                            color: "var(--fg-2)",
                            marginLeft: 8,
                            fontWeight: 600,
                          }}
                        >
                          · {r.jobTitle}
                        </span>
                      )}
                    </span>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 900,
                        fontVariantNumeric: "tabular-nums",
                        width: 28,
                        textAlign: "right",
                      }}
                    >
                      {s}
                    </span>
                    <span className="mobile-hide">
                      <StatusPill tier={tier}>
                        {tier === "good"
                          ? "Strong"
                          : tier === "warn"
                            ? "Fair"
                            : "Weak"}
                      </StatusPill>
                    </span>
                    <span
                      aria-hidden="true"
                      style={{
                        fontSize: 13,
                        fontWeight: 900,
                        flexShrink: 0,
                      }}
                    >
                      →
                    </span>
                  </div>
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
