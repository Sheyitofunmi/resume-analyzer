import React from "react";

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

const ATS: React.FC<ATSProps> = ({ score, suggestions, keywords }) => {
  const gradientClass =
    score > 69
      ? "from-green-100"
      : score > 49
        ? "from-yellow-100"
        : "from-red-100";

  const iconSrc =
    score > 69
      ? "/icons/ats-good.svg"
      : score > 49
        ? "/icons/ats-warning.svg"
        : "/icons/ats-bad.svg";

  const subtitle =
    score > 69 ? "Great Job!" : score > 49 ? "Good Start" : "Needs Improvement";

  const hasKeywords =
    keywords && (keywords.found.length > 0 || keywords.missing.length > 0);

  return (
    <div
      className={`bg-gradient-to-b ${gradientClass} to-white rounded-2xl shadow-md w-full p-6`}
    >
      <div className="flex items-center gap-4 mb-6">
        <img src={iconSrc} alt="ATS Score Icon" className="w-12 h-12" />
        <div>
          <h2 className="text-2xl font-bold">ATS Score - {score}/100</h2>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">{subtitle}</h3>
        <p className="text-gray-600 mb-4">
          This score represents how well your resume is likely to perform in
          Applicant Tracking Systems used by employers.
        </p>

        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3">
              <img
                src={
                  suggestion.type === "good"
                    ? "/icons/check.svg"
                    : "/icons/warning.svg"
                }
                alt={suggestion.type === "good" ? "Check" : "Warning"}
                className="w-5 h-5 mt-1"
              />
              <p
                className={
                  suggestion.type === "good"
                    ? "text-green-700"
                    : "text-amber-700"
                }
              >
                {suggestion.tip}
              </p>
            </div>
          ))}
        </div>
      </div>

      {hasKeywords && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Keyword Match</h3>
          <div className="flex flex-wrap gap-2">
            {keywords!.found.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                <span>✓</span> {kw}
              </span>
            ))}
            {keywords!.missing.map((kw) => (
              <span
                key={kw}
                className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs font-medium px-2.5 py-1 rounded-full"
              >
                <span>✗</span> {kw}
              </span>
            ))}
          </div>
          {keywords!.missing.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              Red keywords are in the job description but not found in your
              resume — consider adding them where relevant.
            </p>
          )}
        </div>
      )}

      <p className="text-gray-700 italic">
        Keep refining your resume to improve your chances of getting past ATS
        filters and into the hands of recruiters.
      </p>
    </div>
  );
};

export default ATS;
