import { useState } from "react";
import { ScoreBar } from "~/components/atoms";

export function scoreTierColor(s: number) {
  return s > 69 ? "var(--phos)" : s > 49 ? "var(--copper-hi)" : "var(--ember)";
}

export function scoreTier(s: number): "good" | "warn" | "bad" {
  return s > 69 ? "good" : s > 49 ? "warn" : "bad";
}

// ── Mini sparkline ─────────────────────────────────────────────────────
export function Sparkline({ scores }: { scores: number[] }) {
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

// ── Dimension sparkline card ───────────────────────────────────────────
export const DIMS: { key: keyof Feedback; label: string }[] = [
  { key: "ATS", label: "ats" },
  { key: "toneAndStyle", label: "tone_style" },
  { key: "content", label: "content" },
  { key: "structure", label: "structure" },
  { key: "skills", label: "skills" },
];

export function DimSparklineCard({
  label,
  dimScores,
}: {
  label: string;
  dimScores: number[];
}) {
  const last = dimScores[dimScores.length - 1] ?? 0;
  return (
    <div className="rl-card" style={{ position: "relative" }}>
      <span className="rl-corner tl" />
      <span className="rl-corner tr" />
      <span className="rl-corner bl" />
      <span className="rl-corner br" />
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
}

// ── Overall score line chart ───────────────────────────────────────────
export function LineChart({ runs }: { runs: Resume[] }) {
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
