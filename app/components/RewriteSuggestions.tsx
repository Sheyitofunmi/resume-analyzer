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
    <div className="bg-white rounded-2xl shadow-md w-full overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-gray-100 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            Rewrite Suggestions
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            See exactly how to turn weak resume lines into strong ones.
          </p>
        </div>
        {!suggestions && !loading && (
          <button
            onClick={handleGenerate}
            className="flex-shrink-0 text-xs font-semibold text-white primary-gradient rounded-full px-4 py-1.5 cursor-pointer"
          >
            Get Rewrites
          </button>
        )}
        {suggestions && (
          <button
            onClick={() => {
              setSuggestions(null);
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
            Generating rewrite examples…
          </div>
        )}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        {!loading && !suggestions && !error && (
          <p className="text-sm text-gray-400 text-center py-4">
            Click "Get Rewrites" to see 3 before/after examples tailored to your
            resume gaps.
          </p>
        )}

        {suggestions && (
          <div className="flex flex-col gap-5">
            {suggestions.map((s, i) => (
              <div key={i} className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Example {i + 1}
                </p>
                <div className="grid sm:grid-cols-2 gap-2">
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-red-500 mb-1 uppercase tracking-wide">
                      Before
                    </p>
                    <p className="text-sm text-red-800 leading-relaxed">
                      {s.weak}
                    </p>
                  </div>
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-green-600 mb-1 uppercase tracking-wide">
                      After
                    </p>
                    <p className="text-sm text-green-800 leading-relaxed">
                      {s.strong}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="font-semibold text-gray-600">Why: </span>
                  {s.why}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RewriteSuggestions;
