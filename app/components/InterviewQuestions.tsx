import { useState } from "react";
import { usePuterStore } from "~/lib/puter";

const CATEGORY_BG: Record<string, string> = {
  behavioral: "var(--cyan)",
  technical: "var(--lime)",
  situational: "var(--amber)",
  "role-specific": "var(--violet)",
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
      className="card"
      style={{ position: "relative", padding: 0, overflow: "hidden" }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 22px",
          borderBottom: "var(--bw) solid var(--ink)",
          background: "var(--violet)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <span style={{ fontWeight: 900, fontSize: 16 }}>Interview prep</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#E4D9FF" }}>
            Predicted questions based on this role and your resume gaps.
          </span>
        </div>

        {!questions && !loading && (
          <button
            onClick={handleGenerate}
            className="btn btn--surface btn--sm"
            style={{ flexShrink: 0 }}
          >
            Predict questions →
          </button>
        )}
        {questions && (
          <button
            onClick={() => {
              setQuestions(null);
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
      <div style={{ padding: "18px 22px" }}>
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
                background: "var(--violet)",
                border: "var(--bw) solid var(--ink)",
                borderRadius: 3,
                display: "inline-block",
              }}
            />
            Predicting likely interview questions…
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

        {!loading && !questions && !error && (
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
            Generate 5 questions an interviewer is likely to ask for this role.
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
              const bg = CATEGORY_BG[cat] ?? "var(--fill-2)";
              return (
                <li
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "14px 0",
                    borderBottom:
                      i < questions.length - 1
                        ? "1px solid var(--line)"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--fg-3)",
                      width: 24,
                      paddingTop: 3,
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
                      gap: 8,
                    }}
                  >
                    <p
                      style={{
                        margin: 0,
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--ink)",
                        lineHeight: 1.6,
                      }}
                    >
                      {q.question}
                    </p>
                    <span
                      className="chip"
                      style={{
                        background: bg,
                        color: cat === "role-specific" ? "#fff" : "var(--ink)",
                        fontSize: 10.5,
                        alignSelf: "flex-start",
                        textTransform: "capitalize",
                      }}
                    >
                      {cat || "general"}
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
