import { useState } from "react";
import { usePuterStore } from "~/lib/puter";

const CATEGORY_STYLES: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  behavioral: {
    label: "Behavioral",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
  },
  technical: { label: "Technical", bg: "bg-blue-50", text: "text-blue-700" },
  situational: {
    label: "Situational",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  "role-specific": {
    label: "Role-Specific",
    bg: "bg-purple-50",
    text: "text-purple-700",
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
    <div className="bg-white rounded-2xl shadow-md w-full overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            Interview Question Predictor
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            AI-predicted questions based on this role and your resume gaps.
          </p>
        </div>
        {!questions && !loading && (
          <button
            onClick={handleGenerate}
            className="flex-shrink-0 text-xs font-semibold text-white primary-gradient rounded-full px-4 py-1.5 cursor-pointer"
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
            className="flex-shrink-0 text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 rounded-full px-3 py-1.5"
          >
            Regenerate
          </button>
        )}
      </div>

      <div className="px-5 py-4">
        {loading && (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
            Predicting interview questions…
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {!loading && !questions && !error && (
          <p className="text-sm text-gray-400 text-center py-4">
            Click "Predict Questions" to generate 5 likely interview questions
            for this role.
          </p>
        )}

        {questions && (
          <ol className="flex flex-col gap-3">
            {questions.map((q, i) => {
              const cat = q.category?.toLowerCase() ?? "";
              const style = CATEGORY_STYLES[cat] ?? {
                label: q.category,
                bg: "bg-gray-50",
                text: "text-gray-600",
              };
              return (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 leading-relaxed">
                      {q.question}
                    </p>
                    <span
                      className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}
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
