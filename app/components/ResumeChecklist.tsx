interface CheckItem {
  label: string;
  detail: string;
  status: "good" | "warn" | "critical";
}

function deriveChecklist(feedback: Feedback): CheckItem[] {
  const items: CheckItem[] = [];

  const sections: { name: string; key: keyof Feedback }[] = [
    { name: "ATS Compatibility", key: "ATS" },
    { name: "Tone & Style", key: "toneAndStyle" },
    { name: "Content", key: "content" },
    { name: "Structure", key: "structure" },
    { name: "Skills", key: "skills" },
  ];

  for (const { name, key } of sections) {
    const section = feedback[key] as {
      score: number;
      tips: { type: string }[];
    };
    const improveCount = section.tips.filter(
      (t) => t.type === "improve",
    ).length;
    const score = section.score;

    if (score >= 75 && improveCount <= 1) {
      items.push({
        label: `${name} is strong`,
        detail: `Score ${score}/100 — well optimised.`,
        status: "good",
      });
    } else if (score >= 50) {
      items.push({
        label: `${name} needs polish`,
        detail: `Score ${score}/100 — ${improveCount} improvement${improveCount !== 1 ? "s" : ""} suggested.`,
        status: "warn",
      });
    } else {
      items.push({
        label: `${name} needs urgent work`,
        detail: `Score ${score}/100 — significantly below average.`,
        status: "critical",
      });
    }
  }

  // Keyword gap check
  const kw = feedback.ATS.keywords;
  if (kw) {
    const missingCount = kw.missing.length;
    if (missingCount === 0) {
      items.push({
        label: "All key keywords present",
        detail: "No missing keywords detected from the job description.",
        status: "good",
      });
    } else if (missingCount <= 3) {
      items.push({
        label: `${missingCount} keyword${missingCount !== 1 ? "s" : ""} missing`,
        detail: `Missing: ${kw.missing.join(", ")}.`,
        status: "warn",
      });
    } else {
      items.push({
        label: `${missingCount} keywords missing — critical gap`,
        detail: `Missing: ${kw.missing.slice(0, 5).join(", ")}${missingCount > 5 ? ` and ${missingCount - 5} more` : ""}.`,
        status: "critical",
      });
    }
  }

  // Overall score summary
  const overall = feedback.overallScore;
  if (overall >= 75) {
    items.push({
      label: "Overall score is competitive",
      detail: `${overall}/100 — above the typical hiring threshold.`,
      status: "good",
    });
  } else if (overall >= 50) {
    items.push({
      label: "Overall score is borderline",
      detail: `${overall}/100 — may not pass initial ATS filter.`,
      status: "warn",
    });
  } else {
    items.push({
      label: "Overall score is too low",
      detail: `${overall}/100 — very likely to be filtered out by ATS.`,
      status: "critical",
    });
  }

  // Sort: critical first, then warn, then good
  const order = { critical: 0, warn: 1, good: 2 };
  return items.sort((a, b) => order[a.status] - order[b.status]);
}

const statusConfig = {
  good: {
    icon: "✓",
    bg: "bg-green-50",
    border: "border-green-200",
    iconColor: "text-green-600",
    labelColor: "text-green-800",
    detailColor: "text-green-700",
  },
  warn: {
    icon: "!",
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "text-amber-600",
    labelColor: "text-amber-800",
    detailColor: "text-amber-700",
  },
  critical: {
    icon: "✕",
    bg: "bg-red-50",
    border: "border-red-200",
    iconColor: "text-red-600",
    labelColor: "text-red-800",
    detailColor: "text-red-700",
  },
};

const ResumeChecklist = ({ feedback }: { feedback: Feedback }) => {
  const items = deriveChecklist(feedback);
  const criticalCount = items.filter((i) => i.status === "critical").length;
  const warnCount = items.filter((i) => i.status === "warn").length;
  const goodCount = items.filter((i) => i.status === "good").length;

  return (
    <div className="bg-white rounded-2xl shadow-md w-full overflow-hidden">
      <div className="px-5 pt-4 pb-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-800">
          Resume Checklist
        </h3>
        <div className="flex gap-3 mt-1.5">
          {criticalCount > 0 && (
            <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
              {criticalCount} critical
            </span>
          )}
          {warnCount > 0 && (
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {warnCount} to improve
            </span>
          )}
          {goodCount > 0 && (
            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              {goodCount} strong
            </span>
          )}
        </div>
      </div>

      <ul className="divide-y divide-gray-50 px-2 py-2">
        {items.map((item, i) => {
          const cfg = statusConfig[item.status];
          return (
            <li
              key={i}
              className={`flex items-start gap-3 px-3 py-3 rounded-xl mx-1 my-0.5 ${cfg.bg} border ${cfg.border}`}
            >
              <span
                className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${cfg.iconColor} border ${cfg.border}`}
                aria-hidden="true"
              >
                {cfg.icon}
              </span>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${cfg.labelColor}`}>
                  {item.label}
                </p>
                <p className={`text-xs mt-0.5 ${cfg.detailColor}`}>
                  {item.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ResumeChecklist;
