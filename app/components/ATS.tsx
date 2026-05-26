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
  const tier = score > 69 ? "good" : score > 49 ? "warn" : "bad";
  const tierLabel =
    tier === "good" ? "PASS" : tier === "warn" ? "WARN" : "FAIL";
  const pillClass =
    tier === "good"
      ? "rl-pill rl-pill-good"
      : tier === "warn"
        ? "rl-pill rl-pill-warn"
        : "rl-pill rl-pill-bad";
  const scoreColor =
    tier === "good"
      ? "var(--phos)"
      : tier === "warn"
        ? "var(--copper-hi)"
        : "var(--ember)";

  const hasKeywords =
    keywords && (keywords.found.length > 0 || keywords.missing.length > 0);

  return (
    <div className="rl-card is-accent" style={{ position: "relative" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <span className="rl-comment" style={{ fontSize: 11 }}>
          ats_compatibility
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className={pillClass}>{tierLabel}</span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 40,
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: "-1.5px",
              color: scoreColor,
              textShadow: `0 0 16px ${scoreColor}55`,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {score}
            <span
              style={{ fontSize: 14, color: "var(--fg-3)", fontWeight: 400 }}
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
                padding: "10px 12px",
                background:
                  s.type === "good"
                    ? "rgba(168,230,163,0.05)"
                    : "rgba(230,153,104,0.06)",
                border: `1px solid ${s.type === "good" ? "var(--phos-dim)" : "var(--copper-deep)"}`,
                borderRadius: "var(--radius-md)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: s.type === "good" ? "var(--phos)" : "var(--copper-hi)",
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {s.type === "good" ? "+" : "!"}
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
                  {s.tip}
                </span>
                {s.explanation && (
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 12,
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
        <div>
          <div
            style={{
              paddingTop: 14,
              borderTop: "1px dashed var(--border)",
              marginBottom: 12,
            }}
          >
            <span className="rl-comment" style={{ fontSize: 11 }}>
              keyword_match
            </span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {keywords!.found.map((kw) => (
              <span
                key={kw}
                className="rl-chip rl-chip-phos"
                style={{ fontSize: 11 }}
              >
                + {kw}
              </span>
            ))}
            {keywords!.missing.map((kw) => (
              <span
                key={kw}
                className="rl-chip"
                style={{
                  fontSize: 11,
                  background: "rgba(227,83,74,0.08)",
                  borderColor: "var(--ember-dim)",
                  color: "var(--ember)",
                }}
              >
                − {kw}
              </span>
            ))}
          </div>
          {keywords!.missing.length > 0 && (
            <p
              style={{
                margin: "10px 0 0",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--fg-3)",
              }}
            >
              // {keywords!.missing.length} keyword
              {keywords!.missing.length !== 1 ? "s" : ""} missing from job
              description
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ATS;
