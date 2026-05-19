import { useState } from "react";
import { usePuterStore } from "~/lib/puter";

const CATEGORY_COLORS: Record<string, string> = {
  behavioral: "var(--copper-hi)",
  technical: "var(--phos)",
  situational: "var(--copper)",
  "role-specific": "var(--fg-2)",
};

const InterviewQuestions = ({
  jobTitle,
  jobDescription,
  feedback,
}: {
  jobTitle: string;
  jobDescription: string;
  feedback: Feedback;
}) => {
  const { ai } = usePuterStore();
  const [questions, setQuestions] = useState<InterviewQuestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const improveTips = [
    ...feedback.ATS.tips,
    ...feedback.content.tips,
    ...feedback.skills.tips,
  ]
    .filter((t) => t.type === "improve")
    .slice(0, 3)
    .map((t) => t.tip);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    const result = await ai.interviewQuestions(
      jobTitle,
      jobDescription,
      improveTips,
    );
    setLoading(false);
    if (!result || result.length === 0) {
      setError("Could not generate questions — please try again.");
      return;
    }
    setQuestions(result);
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
          <span className="rl-eyebrow-prompt">interview_prep</span>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--fg-3)",
            }}
          >
            Predicted questions based on this role and your resume gaps.
          </p>
        </div>

        {!questions && !loading && (
          <button
            onClick={handleGenerate}
            className="rl-btn rl-btn-primary"
            style={{ fontSize: 11, padding: "8px 14px", flexShrink: 0 }}
          >
            $ predict →
          </button>
        )}
        {questions && (
          <button
            onClick={() => {
              setQuestions(null);
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
            generating questions…
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

        {!loading && !questions && !error && (
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
            // click predict to generate 5 likely interview questions
          </p>
        )}

        {questions && (
          <ol
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 0,
              margin: 0,
              padding: 0,
              listStyle: "none",
            }}
          >
            {questions.map((q, i) => {
              const cat = q.category?.toLowerCase() ?? "";
              const color = CATEGORY_COLORS[cat] ?? "var(--fg-2)";
              return (
                <li
                  key={i}
                  className="rl-row"
                  style={{ alignItems: "flex-start", gap: 14 }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--fg-3)",
                      width: 24,
                      paddingTop: 2,
                      textAlign: "right",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-body)",
                        fontSize: 13,
                        color: "var(--fg-1)",
                        lineHeight: 1.65,
                      }}
                    >
                      {q.question}
                    </p>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        color,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                      }}
                    >
                      [{cat || "general"}]
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
};

export default InterviewQuestions;
