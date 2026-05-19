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
  { key: "toneAndStyle", label: "tone_&_style", id: "tone-style" },
  { key: "content", label: "content", id: "content" },
  { key: "structure", label: "structure", id: "structure" },
  { key: "skills", label: "skills", id: "skills" },
];

function TipCard({ tip }: { tip: Tip }) {
  const isGood = tip.type === "good";
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        padding: "10px 12px",
        background: isGood
          ? "rgba(168,230,163,0.05)"
          : "rgba(230,153,104,0.06)",
        border: `1px solid ${isGood ? "var(--phos-dim)" : "var(--copper-deep)"}`,
        borderRadius: "var(--radius-md)",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: isGood ? "var(--phos)" : "var(--copper-hi)",
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {isGood ? "+" : "!"}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--fg-1)",
            fontWeight: 500,
          }}
        >
          {tip.tip}
        </span>
        {tip.explanation && (
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 12,
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

const Details = ({ feedback }: { feedback: Feedback }) => {
  const [open, setOpen] = useState<string>("tone-style");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {SECTIONS.map(({ key, label, id }) => {
        const section = feedback[key] as { score: number; tips: Tip[] };
        const score = section.score;
        const isOpen = open === id;
        const tier = score > 69 ? "good" : score > 49 ? "warn" : "bad";
        const pillClass =
          tier === "good"
            ? "rl-pill rl-pill-good"
            : tier === "warn"
              ? "rl-pill rl-pill-warn"
              : "rl-pill rl-pill-bad";

        return (
          <div
            key={id}
            className="rl-card"
            style={{ position: "relative", padding: 0, overflow: "hidden" }}
          >
            {/* Accordion header */}
            <button
              onClick={() => setOpen(isOpen ? "" : id)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "14px 16px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "var(--font-mono)",
                textAlign: "left",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--fg-3)",
                    width: 12,
                    transition: "transform var(--dur-fast)",
                    transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
                    display: "inline-block",
                  }}
                >
                  ▼
                </span>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "var(--fg-1)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {label}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className={pillClass} style={{ fontSize: 10 }}>
                  {score}
                </span>
              </div>
            </button>

            {/* Accordion content */}
            {isOpen && (
              <div
                style={{
                  padding: "0 16px 16px",
                  borderTop: "1px dashed var(--border)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ height: 12 }} />
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
