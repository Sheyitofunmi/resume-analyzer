import { useState } from "react";
import { ScoreBar } from "~/components/atoms";

export function scoreTierColor(s: number) {
  return s > 69 ? "var(--lime)" : s > 49 ? "var(--amber)" : "var(--red)";
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
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="var(--ink)"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── Dimension sparkline card ───────────────────────────────────────────
export const DIMS: { key: keyof Feedback; label: string }[] = [
  { key: "ATS", label: "ATS" },
  { key: "toneAndStyle", label: "Tone & style" },
  { key: "content", label: "Content" },
  { key: "structure", label: "Structure" },
  { key: "skills", label: "Skills" },
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
    <div className="card" style={{ position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span className="eyebrow" style={{ fontSize: 10 }}>
            {label.toUpperCase()}
          </span>
          <span
            style={{
              fontSize: 18,
              fontWeight: 900,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {last}
          </span>
        </div>
        <Sparkline scores={dimScores} />
        <ScoreBar score={last} />
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
          color: "var(--fg-3)",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        Run at least 2 scans to see your trend.
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
              stroke="var(--line)"
              strokeWidth={1}
            />
            <text
              x={pad.left - 6}
              y={y + 4}
              textAnchor="end"
              fill="var(--fg-3)"
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
        stroke="var(--ink)"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
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
              r={isHover ? 6.5 : 5}
              fill={color}
              stroke="var(--ink)"
              strokeWidth={1.5}
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
                  x={cx - 44}
                  y={cy - 40}
                  width={88}
                  height={30}
                  rx={6}
                  fill="var(--surface)"
                  stroke="var(--ink)"
                  strokeWidth={1.5}
                />
                <text
                  x={cx}
                  y={cy - 26}
                  textAnchor="middle"
                  fill="var(--ink)"
                  fontSize={13}
                  fontFamily="var(--font-sans)"
                  fontWeight={900}
                >
                  {r.feedback.overallScore}
                </text>
                <text
                  x={cx}
                  y={cy - 15}
                  textAnchor="middle"
                  fill="var(--fg-2)"
                  fontSize={8.5}
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
              fill="var(--fg-3)"
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
