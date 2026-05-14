const LINES: { key: keyof ScoreHistoryEntry; label: string; color: string }[] =
  [
    { key: "overall", label: "Overall", color: "#6366f1" },
    { key: "ats", label: "ATS", color: "#10b981" },
    { key: "tone", label: "Tone", color: "#f59e0b" },
    { key: "content", label: "Content", color: "#3b82f6" },
    { key: "structure", label: "Structure", color: "#8b5cf6" },
    { key: "skills", label: "Skills", color: "#ec4899" },
  ];

const W = 500;
const H = 140;
const PAD = { top: 12, right: 16, bottom: 32, left: 32 };
const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;

function xOf(i: number, total: number) {
  return PAD.left + (total <= 1 ? plotW / 2 : (i / (total - 1)) * plotW);
}
function yOf(v: number) {
  return PAD.top + plotH - (v / 100) * plotH;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function dotColor(score: number) {
  if (score > 69) return "#10b981";
  if (score > 49) return "#f59e0b";
  return "#ef4444";
}

const ScoreHistory = ({ history }: { history: ScoreHistoryEntry[] }) => {
  if (history.length === 0) return null;

  const n = history.length;

  return (
    <div className="bg-white rounded-2xl shadow-md w-full overflow-hidden">
      <div className="px-5 pt-4 pb-1 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">Score History</h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {n === 1
            ? "Re-analyze to track score improvements over time."
            : `${n} analyses — showing improvement over time.`}
        </p>
      </div>

      <div className="px-4 pt-3 pb-4">
        {n === 1 ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white"
              style={{ background: dotColor(history[0].overall) }}
            >
              {history[0].overall}
            </div>
            <p className="text-xs text-gray-400">
              First analysis on {formatDate(history[0].date)}
            </p>
          </div>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="w-full"
              aria-label="Score history chart"
              role="img"
            >
              {/* Y-axis gridlines */}
              {[0, 25, 50, 75, 100].map((v) => (
                <g key={v}>
                  <line
                    x1={PAD.left}
                    x2={W - PAD.right}
                    y1={yOf(v)}
                    y2={yOf(v)}
                    stroke="#f3f4f6"
                    strokeWidth={1}
                  />
                  <text
                    x={PAD.left - 4}
                    y={yOf(v) + 4}
                    textAnchor="end"
                    fontSize={9}
                    fill="#9ca3af"
                  >
                    {v}
                  </text>
                </g>
              ))}

              {/* X-axis date labels */}
              {history.map((entry, i) => (
                <text
                  key={i}
                  x={xOf(i, n)}
                  y={H - 4}
                  textAnchor="middle"
                  fontSize={9}
                  fill="#9ca3af"
                >
                  {formatDate(entry.date)}
                </text>
              ))}

              {/* Score lines */}
              {LINES.map(({ key, color }) => {
                const pts = history
                  .map((e, i) => `${xOf(i, n)},${yOf(e[key] as number)}`)
                  .join(" ");
                return (
                  <polyline
                    key={key}
                    points={pts}
                    fill="none"
                    stroke={color}
                    strokeWidth={key === "overall" ? 2.5 : 1.2}
                    strokeOpacity={key === "overall" ? 1 : 0.55}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Dots for overall score */}
              {history.map((entry, i) => (
                <circle
                  key={i}
                  cx={xOf(i, n)}
                  cy={yOf(entry.overall)}
                  r={4}
                  fill={dotColor(entry.overall)}
                  stroke="white"
                  strokeWidth={1.5}
                />
              ))}
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 px-1">
              {LINES.map(({ key, label, color }) => (
                <div key={key} className="flex items-center gap-1">
                  <span
                    className="inline-block w-3 h-0.5 rounded-full"
                    style={{ background: color }}
                  />
                  <span className="text-[10px] text-gray-400">{label}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ScoreHistory;
