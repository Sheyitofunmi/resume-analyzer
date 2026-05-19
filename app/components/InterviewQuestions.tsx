import { useState } from "react";
import { usePuterStore } from "~/lib/puter";

const CATEGORY_STYLES: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  behavioral: {
    label: "Behavioral",
    bg: "bg-[#f8f7f4]",
    text: "text-[#525252]",
  },
  technical: { label: "Technical", bg: "bg-[#f8f7f4]", text: "text-[#525252]" },
  situational: {
    label: "Situational",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  "role-specific": {
    label: "Role-Specific",
    bg: "bg-[#f8f7f4]",
    text: "text-[#525252]",
  },
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
    <div className="bg-white border border-[#e5e5e5] w-full overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-[#e5e5e5] flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#0a0a0a]">
            Interview Question Predictor
          </h3>
          <p className="text-xs text-[#525252] mt-0.5">
            Predicted questions based on this role and your resume gaps.
          </p>
        </div>
        {!questions && !loading && (
          <button
            onClick={handleGenerate}
            className="primary-button flex-shrink-0 text-xs px-4 py-1.5"
          >
            Predict Questions
          </button>
        )}
        {questions && (
          <button
            onClick={() => {
              setQuestions(null);
              setError("");
            }}
            className="flex-shrink-0 text-xs font-medium text-[#525252] hover:text-[#0a0a0a] border border-[#e5e5e5] px-3 py-1.5 transition-colors"
          >
            Regenerate
          </button>
        )}
      </div>

      <div className="px-5 py-4">
        {loading && (
          <div className="flex items-center gap-3 text-sm text-[#525252]">
            <span className="w-4 h-4 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin flex-shrink-0" />
            Predicting interview questions…
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-[#e11d48]">
            {error}
          </p>
        )}

        {!loading && !questions && !error && (
          <p className="text-sm text-[#525252] text-center py-4">
            Click "Predict Questions" to generate 5 likely interview questions
            for this role.
          </p>
        )}

        {questions && (
          <ol className="flex flex-col gap-4">
            {questions.map((q, i) => {
              const cat = q.category?.toLowerCase() ?? "";
              const style = CATEGORY_STYLES[cat] ?? {
                label: q.category,
                bg: "bg-[#f8f7f4]",
                text: "text-[#525252]",
              };
              return (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#0a0a0a] text-white text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#0a0a0a] leading-relaxed">
                      {q.question}
                    </p>
                    <span
                      className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 uppercase tracking-widest border border-[#e5e5e5] ${style.bg} ${style.text}`}
                    >
                      {style.label}
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
