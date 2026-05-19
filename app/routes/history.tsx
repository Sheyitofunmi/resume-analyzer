import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import MobileBottomNav from "~/components/MobileBottomNav";
import {
  Corners,
  Cursor,
  Eyebrow,
  ScoreBar,
  StatusPill,
} from "~/components/atoms";
import { usePuterStore } from "~/lib/puter";

export const meta = () => [
  { title: "ResumeLens | Score History" },
  { name: "description", content: "Track your resume score over time" },
];

function scoreTierColor(s: number) {
  return s > 69 ? "var(--phos)" : s > 49 ? "var(--copper-hi)" : "var(--ember)";
}

function scoreTier(s: number): "good" | "warn" | "bad" {
  return s > 69 ? "good" : s > 49 ? "warn" : "bad";
}

const DIMS = [
  { key: "ATS", label: "ats" },
  { key: "toneAndStyle", label: "tone_style" },
  { key: "content", label: "content" },
  { key: "structure", label: "structure" },
  { key: "skills", label: "skills" },
];

// ── Mini sparkline ─────────────────────────────────────────────────────
function Sparkline({ scores }: { scores: number[] }) {
  if (scores.length < 2) return null;
  const w = 120;
  const h = 32;
  const min = Math.min(...scores);
  const max = Math.max(...scores) || 1;
  const pts = scores.map((s, i) => {
    const x = (i / (scores.length - 1)) * w;
    const y = h - ((s - min) / (max - min + 1)) * h;
    return `${x},${y}`;
  });
  const last = scores[scores.length - 1];
  const color = scoreTierColor(last);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
      />
    </svg>
  );
}

// ── Line chart ─────────────────────────────────────────────────────────
function LineChart({ runs }: { runs: Resume[] }) {
  const [hover, setHover] = useState<number | null>(null);
  if (runs.length < 2)
    return (
      <div
        style={{
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--fg-4)",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
        }}
      >
        // need at least 2 runs to show chart
      </div>
    );

  const w = 600;
  const h = 180;
  const pad = { top: 16, right: 16, bottom: 32, left: 36 };
  const iw = w - pad.left - pad.right;
  const ih = h - pad.top - pad.bottom;

  const scores = runs.map((r) => r.feedback.overallScore);
  const minS = Math.max(0, Math.min(...scores) - 10);
  const maxS = Math.min(100, Math.max(...scores) + 10);

  const px = (i: number) => pad.left + (i / (runs.length - 1)) * iw;
  const py = (s: number) => pad.top + ih - ((s - minS) / (maxS - minS)) * ih;

  const pts = runs.map((r, i) => `${px(i)},${py(r.feedback.overallScore)}`);

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${w} ${h}`}
      style={{ display: "block", overflow: "visible" }}
      onMouseLeave={() => setHover(null)}
    >
      {/* Grid lines */}
      {[0, 25, 50, 75, 100].map((v) => {
        const y = py(v);
        if (y < pad.top || y > pad.top + ih) return null;
        return (
          <g key={v}>
            <line
              x1={pad.left}
              x2={pad.left + iw}
              y1={y}
              y2={y}
              stroke="var(--border)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <text
              x={pad.left - 6}
              y={y + 4}
              textAnchor="end"
              fill="var(--fg-4)"
              fontSize={9}
              fontFamily="var(--font-mono)"
            >
              {v}
            </text>
          </g>
        );
      })}

      {/* Line */}
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="var(--phos)"
        strokeWidth={2}
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 6px var(--phos-glow))" }}
      />

      {/* Dots + hover targets */}
      {runs.map((r, i) => {
        const cx = px(i);
        const cy = py(r.feedback.overallScore);
        const color = scoreTierColor(r.feedback.overallScore);
        const isHover = hover === i;
        return (
          <g key={r.id}>
            <circle
              cx={cx}
              cy={cy}
              r={isHover ? 6 : 4}
              fill={color}
              style={{
                filter: isHover ? `drop-shadow(0 0 8px ${color})` : "none",
              }}
            />
            {/* Invisible larger hit area */}
            <circle
              cx={cx}
              cy={cy}
              r={16}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
            {isHover && (
              <g>
                <rect
                  x={cx - 40}
                  y={cy - 36}
                  width={80}
                  height={28}
                  rx={3}
                  fill="var(--bg-3)"
                  stroke="var(--border-hi)"
                  strokeWidth={1}
                />
                <text
                  x={cx}
                  y={cy - 24}
                  textAnchor="middle"
                  fill={color}
                  fontSize={13}
                  fontFamily="var(--font-mono)"
                  fontWeight={700}
                >
                  {r.feedback.overallScore}
                </text>
                <text
                  x={cx}
                  y={cy - 13}
                  textAnchor="middle"
                  fill="var(--fg-3)"
                  fontSize={9}
                  fontFamily="var(--font-mono)"
                >
                  {r.companyName || "resume"}
                </text>
              </g>
            )}
            {/* X-axis label */}
            <text
              x={cx}
              y={pad.top + ih + 18}
              textAnchor="middle"
              fill="var(--fg-4)"
              fontSize={9}
              fontFamily="var(--font-mono)"
            >
              {String(i + 1).padStart(2, "0")}
            </text>
          </g>
        );
      })}
    </svg>
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
            <Cursor />
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
            <Corners />
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
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 16,
              }}
            >
              {KPIs.map((kpi) => (
                <div
                  key={kpi.label}
                  className="rl-card"
                  style={{ position: "relative" }}
                >
                  <Corners />
                  <div
                    style={{ display: "flex", flexDirection: "column", gap: 4 }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 28,
                        fontWeight: 700,
                        color: scoreTierColor(
                          kpi.label === "avg_lift" ? 70 : (kpi.value as number),
                        ),
                        letterSpacing: "-1px",
                        fontVariantNumeric: "tabular-nums",
                        textShadow: "0 0 14px currentColor",
                      }}
                    >
                      {kpi.prefix ?? ""}
                      {kpi.value}
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
                </div>
              ))}
            </div>

            {/* Line chart */}
            <div className="rl-card" style={{ position: "relative" }}>
              <Corners />
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
            </div>

            {/* Per-dimension sparklines */}
            <div
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
                const last = dimScores[dimScores.length - 1] ?? 0;
                return (
                  <div
                    key={key}
                    className="rl-card"
                    style={{ position: "relative" }}
                  >
                    <Corners />
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 11,
                            color: "var(--fg-3)",
                            letterSpacing: "0.08em",
                          }}
                        >
                          {label}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: 16,
                            fontWeight: 700,
                            color: scoreTierColor(last),
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          {last}
                        </span>
                      </div>
                      <Sparkline scores={dimScores} />
                      <ScoreBar score={last} cells={20} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Run log table */}
            <div
              className="rl-card"
              style={{ position: "relative", padding: 0 }}
            >
              <Corners />
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
                  <div
                    key={r.id}
                    className="rl-row"
                    onClick={() => navigate(`/resume/${r.id}`)}
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
                    <ScoreBar score={s} cells={16} />
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
                    <StatusPill tier={tier}>
                      {tier === "good"
                        ? "PASS"
                        : tier === "warn"
                          ? "WARN"
                          : "FAIL"}
                    </StatusPill>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--phos)",
                      }}
                    >
                      → view
                    </span>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
