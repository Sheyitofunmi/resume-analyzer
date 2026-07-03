import ScoreBadge from "~/components/ScoreBadge";

interface Suggestion {
  type: "good" | "improve";
  tip: string;
  explanation: string;
}

interface ATSProps {
  score: number;
  suggestions: Suggestion[];
  keywords?: { found: string[]; missing: string[] };
}

const ATS = ({ score, suggestions, keywords }: ATSProps) => {
  const hasKeywords =
    keywords && (keywords.found.length > 0 || keywords.missing.length > 0);

  return (
    <div className="card" style={{ position: "relative" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <span className="eyebrow">{"// ATS COMPATIBILITY"}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ScoreBadge score={score} />
          <span
            style={{
              fontSize: 34,
              fontWeight: 900,
              lineHeight: 1,
              letterSpacing: "-0.03em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {score}
            <span
              style={{
                fontSize: 14,
                color: "var(--fg-2)",
                fontWeight: 700,
              }}
            >
              /100
            </span>
          </span>
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: hasKeywords ? 20 : 0,
          }}
        >
          {suggestions.map((s, i) => (
            <div
              key={i}
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
                  background:
                    s.type === "good" ? "var(--lime)" : "var(--amber)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 900,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {s.type === "good" ? "✓" : "!"}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span
                  style={{
                    fontSize: 13.5,
                    color: "var(--ink)",
                    fontWeight: 800,
                  }}
                >
                  {s.tip}
                </span>
                {s.explanation && (
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 500,
                      color: "var(--fg-2)",
                      lineHeight: 1.6,
                    }}
                  >
                    {s.explanation}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Keyword diff */}
      {hasKeywords && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {keywords!.found.length > 0 && (
            <div>
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                MATCHED KEYWORDS · {keywords!.found.length}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {keywords!.found.map((kw) => (
                  <span key={kw} className="chip chip--lime">
                    {kw} ✓
                  </span>
                ))}
              </div>
            </div>
          )}
          {keywords!.missing.length > 0 && (
            <div
              style={{
                border: "var(--bw) solid var(--ink)",
                borderRadius: "var(--r-card)",
                background: "var(--dark-bg)",
                color: "var(--dark-fg)",
                padding: 20,
              }}
            >
              <div
                className="eyebrow"
                style={{ color: "var(--lime)", marginBottom: 12 }}
              >
                MISSING · ADD THESE {keywords!.missing.length}
              </div>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                {keywords!.missing.map((kw) => (
                  <span
                    key={kw}
                    style={{
                      border: "1.5px dashed rgba(255,255,255,.4)",
                      borderRadius: 999,
                      padding: "6px 13px",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.6,
                  color: "var(--dark-muted)",
                }}
              >
                These appear in the job description but not in your resume —
                weave them into real accomplishments.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ATS;
