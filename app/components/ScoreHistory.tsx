const LINES: { key: keyof ScoreHistoryEntry; label: string; color: string }[] =
  [
    { key: "overall", label: "Overall", color: "var(--phos)" },
    { key: "ats", label: "ATS", color: "var(--copper-hi)" },
    { key: "tone", label: "Tone", color: "#a78bfa" },
    { key: "content", label: "Content", color: "#60a5fa" },
    { key: "structure", label: "Structure", color: "#f472b6" },
    { key: "skills", label: "Skills", color: "var(--ember)" },
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
  if (score > 69) return "var(--phos)";
  if (score > 49) return "var(--copper-hi)";
  return "var(--ember)";
}

const ScoreHistory = ({ history }: { history: ScoreHistoryEntry[] }) => {
  if (history.length === 0) return null;

  const n = history.length;

  return (
    <div
      style={{
        background: "var(--parchment)",
        border: "1px solid var(--parchment-border)",
        borderRadius: 12,
        width: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 20px 10px",
          borderBottom: "1px solid var(--parchment-border)",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            fontWeight: 600,
            color: "var(--parchment-fg-1)",
            margin: "0 0 2px",
          }}
        >
          score_history
        </h3>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--parchment-fg-3)",
            margin: 0,
          }}
        >
          {n === 1
            ? "Re-analyze to track score improvements over time."
            : `${n} analyses — showing improvement over time.`}
        </p>
      </div>

      <div style={{ padding: "12px 16px 16px" }}>
        {n === 1 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
              padding: "16px 0",
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                color: "var(--parchment)",
                background: dotColor(history[0].overall),
              }}
            >
              {history[0].overall}
            </div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--parchment-fg-3)",
                margin: 0,
              }}
            >
              First analysis on {formatDate(history[0].date)}
            </p>
          </div>
        ) : (
          <>
            <svg
              viewBox={`0 0 ${W} ${H}`}
              style={{ width: "100%" }}
              aria-label="Score history chart"
              role="img"
            >
              {[0, 25, 50, 75, 100].map((v) => (
                <g key={v}>
                  <line
                    x1={PAD.left}
                    x2={W - PAD.right}
                    y1={yOf(v)}
                    y2={yOf(v)}
                    stroke="var(--parchment-border)"
                    strokeWidth={1}
                  />
                  <text
                    x={PAD.left - 4}
                    y={yOf(v) + 4}
                    textAnchor="end"
                    fontSize={9}
                    fill="var(--parchment-fg-3)"
                  >
                    {v}
                  </text>
                </g>
              ))}

              {history.map((entry, i) => (
                <text
                  key={i}
                  x={xOf(i, n)}
                  y={H - 4}
                  textAnchor="middle"
                  fontSize={9}
                  fill="var(--parchment-fg-3)"
                >
                  {formatDate(entry.date)}
                </text>
              ))}

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
                    strokeOpacity={key === "overall" ? 1 : 0.6}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                );
              })}

              {history.map((entry, i) => (
                <circle
                  key={i}
                  cx={xOf(i, n)}
                  cy={yOf(entry.overall)}
                  r={4}
                  fill={dotColor(entry.overall)}
                  stroke="var(--parchment)"
                  strokeWidth={1.5}
                />
              ))}
            </svg>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px 16px",
                marginTop: 4,
                paddingLeft: 4,
              }}
            >
              {LINES.map(({ key, label, color }) => (
                <div
                  key={key}
                  style={{ display: "flex", alignItems: "center", gap: 5 }}
                >
                  <span
                    style={{
                      display: "inline-block",
                      width: 12,
                      height: 2,
                      borderRadius: 9999,
                      background: color,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      color: "var(--parchment-fg-3)",
                    }}
                  >
                    {label}
                  </span>
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
