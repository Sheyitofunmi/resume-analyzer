import { useState } from "react";
import { usePuterStore } from "~/lib/puter";

const RewriteSuggestions = ({
  jobTitle,
  feedback,
}: {
  jobTitle: string;
  feedback: Feedback;
}) => {
  const { ai } = usePuterStore();
  const [suggestions, setSuggestions] = useState<RewriteSuggestion[] | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const improveTips = [
    ...feedback.content.tips,
    ...feedback.toneAndStyle.tips,
    ...feedback.skills.tips,
    ...feedback.structure.tips,
  ].filter((t) => t.type === "improve");

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    const result = await ai.rewriteSuggestions(jobTitle, improveTips);
    setLoading(false);
    if (!result || result.length === 0) {
      setError("Could not generate suggestions — please try again.");
      return;
    }
    setSuggestions(result);
  };

  return (
    <div
      className="rl-card"
      style={{ position: "relative", padding: 0, overflow: "hidden" }}
    >
      <span className="rl-corner tl" />
      <span className="rl-corner tr" />
      <span className="rl-corner bl" />
      <span className="rl-corner br" />

      {/* Header */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px dashed var(--border)",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="rl-eyebrow-prompt">rewrite_suggestions</span>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--fg-3)",
            }}
          >
            Turn weak resume lines into strong ones.
          </p>
        </div>

        {!suggestions && !loading && (
          <button
            onClick={handleGenerate}
            className="rl-btn rl-btn-primary"
            style={{ fontSize: 11, padding: "8px 14px", flexShrink: 0 }}
          >
            $ get_rewrites →
          </button>
        )}
        {suggestions && (
          <button
            onClick={() => {
              setSuggestions(null);
              setError("");
            }}
            className="rl-btn rl-btn-secondary"
            style={{ fontSize: 11, padding: "6px 12px", flexShrink: 0 }}
          >
            ↺ regenerate
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "16px 20px" }}>
        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--fg-3)",
            }}
          >
            <span className="rl-dot" />
            generating rewrite examples…
          </div>
        )}

        {error && (
          <p
            role="alert"
            style={{
              margin: 0,
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--ember)",
            }}
          >
            ✕ {error}
          </p>
        )}

        {!loading && !suggestions && !error && (
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--fg-3)",
              textAlign: "center",
              padding: "16px 0",
            }}
          >
            // click get_rewrites for 3 before/after examples
          </p>
        )}

        {suggestions && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {suggestions.map((s, i) => (
              <div
                key={i}
                style={{ display: "flex", flexDirection: "column", gap: 8 }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--fg-3)",
                    letterSpacing: "0.12em",
                  }}
                >
                  // example_{String(i + 1).padStart(2, "0")}
                </span>

                <div className="rl-rewrite-grid">
                  {/* Before */}
                  <div
                    style={{
                      background: "rgba(227,83,74,0.06)",
                      border: "1px solid var(--ember-dim)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 8px",
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--ember)",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                      }}
                    >
                      − before
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-body)",
                        fontSize: 13,
                        color: "var(--fg-2)",
                        lineHeight: 1.65,
                      }}
                    >
                      {s.weak}
                    </p>
                  </div>

                  {/* After */}
                  <div
                    style={{
                      background: "rgba(168,230,163,0.06)",
                      border: "1px solid var(--phos-dim)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px",
                    }}
                  >
                    <p
                      style={{
                        margin: "0 0 8px",
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color: "var(--phos)",
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                      }}
                    >
                      + after
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-body)",
                        fontSize: 13,
                        color: "var(--fg-1)",
                        lineHeight: 1.65,
                      }}
                    >
                      {s.strong}
                    </p>
                  </div>
                </div>

                {/* Why */}
                <div
                  style={{
                    background: "var(--surface-2)",
                    border: "1px dashed var(--border)",
                    borderRadius: "var(--radius-sm)",
                    padding: "10px 14px",
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-body)",
                      fontSize: 12,
                      color: "var(--fg-2)",
                      lineHeight: 1.6,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        color: "var(--copper)",
                        marginRight: 6,
                      }}
                    >
                      //
                    </span>
                    {s.why}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RewriteSuggestions;
