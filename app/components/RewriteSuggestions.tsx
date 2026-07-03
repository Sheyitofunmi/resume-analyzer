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
      className="card"
      style={{ position: "relative", padding: 0, overflow: "hidden" }}
    >
      {/* Header — lime bar per the design */}
      <div
        style={{
          padding: "16px 22px",
          borderBottom: "var(--bw) solid var(--ink)",
          background: "var(--lime)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontWeight: 900, fontSize: 16 }}>AI rewrites</span>
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>
            Turn weak resume lines into strong ones.
          </span>
        </div>

        {!suggestions && !loading && (
          <button
            onClick={handleGenerate}
            className="btn btn--primary btn--sm"
            style={{ flexShrink: 0 }}
          >
            Get rewrites →
          </button>
        )}
        {suggestions && (
          <button
            onClick={() => {
              setSuggestions(null);
              setError("");
            }}
            className="btn btn--surface btn--sm"
            style={{ flexShrink: 0 }}
          >
            ↺ Regenerate
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: suggestions ? 0 : "18px 22px" }}>
        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 13.5,
              fontWeight: 700,
              color: "var(--fg-2)",
            }}
          >
            <span
              className="pix-blink"
              style={{
                width: 10,
                height: 10,
                background: "var(--lime)",
                border: "var(--bw) solid var(--ink)",
                borderRadius: 3,
                display: "inline-block",
              }}
            />
            Writing stronger versions of your weakest bullets…
          </div>
        )}

        {error && (
          <p
            role="alert"
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 700,
              color: "var(--red)",
            }}
          >
            ✕ {error}
          </p>
        )}

        {!loading && !suggestions && !error && (
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--fg-2)",
              textAlign: "center",
              padding: "12px 0",
            }}
          >
            Get 3 before/after examples tuned to this job.
          </p>
        )}

        {suggestions && (
          <div>
            {suggestions.map((s, i) => (
              <div
                key={i}
                style={{
                  padding: "20px 22px",
                  borderBottom:
                    i < suggestions.length - 1
                      ? "1.5px solid var(--fill-3)"
                      : "none",
                }}
              >
                <div
                  style={{
                    fontSize: 13.5,
                    color: "var(--fg-3)",
                    textDecoration: "line-through",
                    marginBottom: 8,
                    lineHeight: 1.5,
                  }}
                >
                  {s.weak}
                </div>
                <div
                  style={{
                    fontSize: 14.5,
                    fontWeight: 700,
                    lineHeight: 1.55,
                    marginBottom: 12,
                  }}
                >
                  {s.strong}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10.5,
                    fontWeight: 600,
                    background: "var(--fill-3)",
                    borderRadius: 6,
                    padding: "6px 10px",
                    display: "inline-block",
                    color: "var(--fg-2)",
                    lineHeight: 1.5,
                  }}
                >
                  WHY: {s.why}
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
