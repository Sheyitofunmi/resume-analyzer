import { useState } from "react";

type Tip = { type: "good" | "improve"; tip: string; explanation: string };

const SECTIONS: {
  key: keyof Pick<
    Feedback,
    "toneAndStyle" | "content" | "structure" | "skills"
  >;
  label: string;
  id: string;
}[] = [
  { key: "toneAndStyle", label: "Tone & style", id: "tone-style" },
  { key: "content", label: "Content", id: "content" },
  { key: "structure", label: "Structure", id: "structure" },
  { key: "skills", label: "Skills", id: "skills" },
];

function TipCard({ tip }: { tip: Tip }) {
  const isGood = tip.type === "good";
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "12px 14px",
        background: "var(--fill-1)",
        border: "1px solid var(--line)",
        borderRadius: 12,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          border: "var(--bw) solid var(--ink)",
          background: isGood ? "var(--lime)" : "var(--amber)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 900,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {isGood ? "✓" : "!"}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 800 }}>
          {tip.tip}
        </span>
        {tip.explanation && (
          <span
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              color: "var(--fg-2)",
              lineHeight: 1.6,
            }}
          >
            {tip.explanation}
          </span>
        )}
      </div>
    </div>
  );
}

function scoreChipBg(score: number) {
  return score > 69
    ? "var(--lime)"
    : score > 49
      ? "var(--amber)"
      : "var(--red)";
}

const Details = ({ feedback }: { feedback: Feedback }) => {
  const [open, setOpen] = useState<string>("tone-style");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {SECTIONS.map(({ key, label, id }) => {
        const section = feedback[key] as { score: number; tips: Tip[] };
        const score = section.score;
        const isOpen = open === id;

        return (
          <div
            key={id}
            className="card"
            style={{ position: "relative", padding: 0, overflow: "hidden" }}
          >
            {/* Accordion header */}
            <button
              onClick={() => setOpen(isOpen ? "" : id)}
              aria-expanded={isOpen}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "16px 20px",
                background: isOpen ? "var(--fill-1)" : "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-sans)",
                textAlign: "left",
                transition: "background var(--dur-fast) ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: 11,
                    color: "var(--ink)",
                    width: 12,
                    transition: "transform var(--dur-fast) ease",
                    transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                    display: "inline-block",
                  }}
                >
                  ▼
                </span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: "var(--ink)",
                  }}
                >
                  {label}
                </span>
              </div>
              <span
                className="chip"
                style={{
                  background: scoreChipBg(score),
                  color: score <= 49 ? "#fff" : "var(--ink)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {score}
              </span>
            </button>

            {/* Accordion content */}
            {isOpen && (
              <div
                style={{
                  padding: "16px 20px",
                  borderTop: "1px solid var(--line)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {section.tips.map((tip, i) => (
                  <TipCard key={i} tip={tip} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Details;
