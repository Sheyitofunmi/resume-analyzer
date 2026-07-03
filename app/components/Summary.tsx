import { ScoreCircle } from "~/components/atoms";

const ROWS: {
  label: string;
  key: keyof Pick<
    Feedback,
    "ATS" | "toneAndStyle" | "content" | "structure" | "skills"
  >;
}[] = [
  { label: "ATS", key: "ATS" },
  { label: "Tone & style", key: "toneAndStyle" },
  { label: "Content", key: "content" },
  { label: "Structure", key: "structure" },
  { label: "Skills", key: "skills" },
];

const Summary = ({ feedback }: { feedback: Feedback }) => {
  const overall = feedback.overallScore;
  const tier = overall > 69 ? "good" : overall > 49 ? "warn" : "bad";
  const tierLabel =
    tier === "good" ? "Strong" : tier === "warn" ? "Borderline" : "Needs work";
  const tierBg =
    tier === "good"
      ? "var(--lime)"
      : tier === "warn"
        ? "var(--amber)"
        : "var(--red)";

  return (
    <div
      style={{
        border: "var(--bw) solid var(--ink)",
        borderRadius: "var(--r-card)",
        background: "var(--cyan)",
        padding: 30,
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: 32,
        alignItems: "center",
      }}
      className="rl-summary-grid"
    >
      {/* Score ring */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <ScoreCircle
          score={overall}
          size={132}
          trackColor="rgba(255,255,255,0.5)"
        />
        <span
          className="chip"
          style={{
            background: tierBg,
            color: tier === "bad" ? "#fff" : "var(--ink)",
          }}
        >
          {tierLabel}
        </span>
      </div>

      {/* Category bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {ROWS.map(({ label, key }, i) => {
          const s = (feedback[key] as { score: number }).score;
          return (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
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
                    animation: `rl-grow 1s ${0.2 + i * 0.15}s both`,
                  }}
                />
              </div>
              <span
                style={{
                  width: 36,
                  fontWeight: 900,
                  fontSize: 15,
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {s}
              </span>
            </div>
          );
        })}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 4,
          }}
        >
          <span className="eyebrow eyebrow--ink" style={{ fontSize: 10 }}>
            AI ANALYSIS · RESUMELENS
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              letterSpacing: "0.08em",
            }}
          >
            {new Date()
              .toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
              .toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Summary;
