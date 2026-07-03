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
  good: { icon: "✓", bg: "var(--lime)", fg: "var(--ink)" },
  warn: { icon: "!", bg: "var(--amber)", fg: "var(--ink)" },
  critical: { icon: "✕", bg: "var(--red)", fg: "#fff" },
};

const ResumeChecklist = ({ feedback }: { feedback: Feedback }) => {
  const items = deriveChecklist(feedback);
  const criticalCount = items.filter((i) => i.status === "critical").length;
  const warnCount = items.filter((i) => i.status === "warn").length;
  const goodCount = items.filter((i) => i.status === "good").length;

  return (
    <div className="card" style={{ position: "relative" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span className="eyebrow">{"// RESUME CHECKLIST"}</span>
        <div style={{ display: "flex", gap: 6 }}>
          {criticalCount > 0 && (
            <span
              className="chip"
              style={{
                background: "var(--red)",
                color: "#fff",
                fontSize: 10.5,
              }}
            >
              {criticalCount} critical
            </span>
          )}
          {warnCount > 0 && (
            <span
              className="chip"
              style={{ background: "var(--amber)", fontSize: 10.5 }}
            >
              {warnCount} polish
            </span>
          )}
          {goodCount > 0 && (
            <span
              className="chip"
              style={{ background: "var(--lime)", fontSize: 10.5 }}
            >
              {goodCount} pass
            </span>
          )}
        </div>
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item, i) => {
          const cfg = STATUS[item.status];
          return (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 10,
                padding: "12px 14px",
                background: "var(--fill-1)",
                border: "1px solid var(--line)",
                borderRadius: 12,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  border: "var(--bw) solid var(--ink)",
                  background: cfg.bg,
                  color: cfg.fg,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 900,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                {cfg.icon}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span
                  style={{
                    fontSize: 13.5,
                    fontWeight: 800,
                    color: "var(--ink)",
                  }}
                >
                  {item.label}
                </span>
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: "var(--fg-2)",
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
