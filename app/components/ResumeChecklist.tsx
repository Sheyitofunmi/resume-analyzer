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

  const order = { critical: 0, warn: 1, good: 2 };
  return items.sort((a, b) => order[a.status] - order[b.status]);
}

const STATUS = {
  good: {
    icon: "✓",
    color: "var(--phos)",
    bg: "rgba(168,230,163,0.05)",
    border: "var(--phos-dim)",
    pillClass: "rl-pill rl-pill-good",
  },
  warn: {
    icon: "!",
    color: "var(--copper-hi)",
    bg: "rgba(230,153,104,0.06)",
    border: "var(--copper-deep)",
    pillClass: "rl-pill rl-pill-warn",
  },
  critical: {
    icon: "✕",
    color: "var(--ember)",
    bg: "rgba(227,83,74,0.06)",
    border: "var(--ember-dim)",
    pillClass: "rl-pill rl-pill-bad",
  },
};

const ResumeChecklist = ({ feedback }: { feedback: Feedback }) => {
  const items = deriveChecklist(feedback);
  const criticalCount = items.filter((i) => i.status === "critical").length;
  const warnCount = items.filter((i) => i.status === "warn").length;
  const goodCount = items.filter((i) => i.status === "good").length;

  return (
    <div className="rl-card" style={{ position: "relative" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <span className="rl-comment" style={{ fontSize: 11 }}>
          resume_checklist
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          {criticalCount > 0 && (
            <span className="rl-pill rl-pill-bad" style={{ fontSize: 10 }}>
              {criticalCount} critical
            </span>
          )}
          {warnCount > 0 && (
            <span className="rl-pill rl-pill-warn" style={{ fontSize: 10 }}>
              {warnCount} warn
            </span>
          )}
          {goodCount > 0 && (
            <span className="rl-pill rl-pill-good" style={{ fontSize: 10 }}>
              {goodCount} pass
            </span>
          )}
        </div>
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map((item, i) => {
          const cfg = STATUS[item.status];
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                padding: "10px 12px",
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderRadius: "var(--radius-md)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: cfg.color,
                  flexShrink: 0,
                  width: 14,
                  marginTop: 1,
                }}
              >
                {cfg.icon}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--fg-1)",
                    fontWeight: 500,
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--fg-3)",
                  }}
                >
                  {item.detail}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResumeChecklist;
