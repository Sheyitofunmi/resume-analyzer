function ScoreBar({ score, width = 20 }: { score: number; width?: number }) {
  const filled = Math.round((score / 100) * width);
  const color =
    score > 69
      ? "var(--phos)"
      : score > 49
        ? "var(--copper-hi)"
        : "var(--ember)";
  return (
    <span
      style={{ fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: 0 }}
    >
      <span style={{ color }}>{"█".repeat(filled)}</span>
      <span style={{ color: "var(--fg-4)" }}>{"░".repeat(width - filled)}</span>
    </span>
  );
}

const ROWS: {
  label: string;
  key: keyof Pick<
    Feedback,
    "ATS" | "toneAndStyle" | "content" | "structure" | "skills"
  >;
}[] = [
  { label: "ats   ", key: "ATS" },
  { label: "tone  ", key: "toneAndStyle" },
  { label: "cont  ", key: "content" },
  { label: "struc ", key: "structure" },
  { label: "skill ", key: "skills" },
];

const Summary = ({ feedback }: { feedback: Feedback }) => {
  const overall = feedback.overallScore;
  const tier = overall > 69 ? "good" : overall > 49 ? "warn" : "bad";
  const tierLabel =
    tier === "good" ? "PASS" : tier === "warn" ? "BORDERLINE" : "FAIL";
  const tierColor =
    tier === "good"
      ? "var(--phos)"
      : tier === "warn"
        ? "var(--copper-hi)"
        : "var(--ember)";
  const pillClass =
    tier === "good"
      ? "rl-pill rl-pill-good"
      : tier === "warn"
        ? "rl-pill rl-pill-warn"
        : "rl-pill rl-pill-bad";

  return (
    <div className="rl-card is-accent" style={{ position: "relative" }}>
      <span className="rl-corner tl" />
      <span className="rl-corner tr" />
      <span className="rl-corner bl" />
      <span className="rl-corner br" />

      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <span className="rl-comment" style={{ fontSize: 11 }}>
          overall_score
        </span>
        <span className={pillClass}>{tierLabel}</span>
      </div>

      {/* Score + bars grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 28,
          alignItems: "center",
        }}
      >
        {/* Big score number */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 88,
              fontWeight: 500,
              lineHeight: 0.9,
              letterSpacing: "-3px",
              color: tierColor,
              textShadow: `0 0 22px ${tierColor}66`,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {overall}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--fg-3)",
            }}
          >
            /100
          </span>
        </div>

        {/* Category bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {ROWS.map(({ label, key }) => {
            const s = (feedback[key] as { score: number }).score;
            const c =
              s > 69
                ? "var(--phos)"
                : s > 49
                  ? "var(--copper-hi)"
                  : "var(--ember)";
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 12,
                }}
              >
                <span
                  style={{
                    color: "var(--fg-3)",
                    width: 52,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    letterSpacing: "0.04em",
                  }}
                >
                  {label}
                </span>
                <ScoreBar score={s} />
                <span
                  style={{
                    color: c,
                    marginLeft: "auto",
                    fontFamily: "var(--font-mono)",
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: 700,
                    fontSize: 12,
                    width: 28,
                    textAlign: "right",
                  }}
                >
                  {s}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 20,
          paddingTop: 14,
          borderTop: "1px dashed var(--border)",
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
          }}
        >
          // ai_analysis · resumelens
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--fg-4)",
          }}
        >
          {new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
};

export default Summary;
