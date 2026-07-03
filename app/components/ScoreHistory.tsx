const LINES: { key: keyof ScoreHistoryEntry; label: string; color: string }[] =
  [
    { key: "overall", label: "Overall", color: "var(--ink)" },
    { key: "ats", label: "ATS", color: "var(--cyan)" },
    { key: "tone", label: "Tone", color: "var(--violet)" },
    { key: "content", label: "Content", color: "#7BB662" },
    { key: "structure", label: "Structure", color: "var(--amber)" },
    { key: "skills", label: "Skills", color: "var(--red)" },
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
  if (score > 69) return "var(--lime)";
  if (score > 49) return "var(--amber)";
  return "var(--red)";
}

const ScoreHistory = ({ history }: { history: ScoreHistoryEntry[] }) => {
  if (history.length === 0) return null;

  const n = history.length;

  return (
    <div
      className="card"
      style={{ width: "100%", overflow: "hidden", padding: 0 }}
    >
      <div
        style={{
          padding: "16px 22px 12px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 900, margin: "0 0 2px" }}>
          Score history
        </h3>
        <p
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--fg-2)",
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
                fontWeight: 900,
                color: "var(--ink)",
                background: dotColor(history[0].overall),
                border: "var(--bw) solid var(--ink)",
              }}
            >
              {history[0].overall}
            </div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.06em",
                color: "var(--fg-2)",
                margin: 0,
              }}
            >
              FIRST ANALYSIS ON {formatDate(history[0].date).toUpperCase()}
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
                    stroke="var(--line)"
                    strokeWidth={1}
                  />
                  <text
                    x={PAD.left - 4}
                    y={yOf(v) + 4}
                    textAnchor="end"
                    fontSize={9}
                    fill="var(--fg-3)"
                    fontFamily="var(--font-mono)"
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
                  fill="var(--fg-3)"
                  fontFamily="var(--font-mono)"
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
                    strokeWidth={key === "overall" ? 2.5 : 1.4}
                    strokeOpacity={key === "overall" ? 1 : 0.65}
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
                  r={4.5}
                  fill={dotColor(entry.overall)}
                  stroke="var(--ink)"
                  strokeWidth={1.5}
                />
              ))}
            </svg>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "4px 16px",
                marginTop: 6,
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
                      height: 3,
                      borderRadius: 9999,
                      background: color,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--fg-2)",
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
