import { FadeInView } from "~/components/atoms";

const STEPS = [
  {
    n: "1",
    bg: "var(--cyan)",
    fg: "var(--ink)",
    title: "Upload & set your target",
    desc: "PDF or DOCX. Tell us the role you're chasing and the analysis tunes itself to it.",
  },
  {
    n: "2",
    bg: "var(--lime)",
    fg: "var(--ink)",
    title: "Get scored on 5 dimensions",
    desc: "ATS, tone, content, structure, skills — with the reasoning behind every number.",
  },
  {
    n: "3",
    bg: "var(--violet)",
    fg: "#fff",
    title: "Accept rewrites, re-score",
    desc: "Specific rewrites, keyword gaps, interview prep — then watch your score climb.",
  },
];

const HowItWorks = ({ compact = false }: { compact?: boolean }) => {
  return (
    <div style={{ width: "100%" }}>
      {!compact && (
        <div className="eyebrow" style={{ marginBottom: 20 }}>
          {"// HOW IT WORKS"}
        </div>
      )}

      <div className="g-thirds">
        {STEPS.map((s, i) => (
          <FadeInView key={s.n} delay={i * 0.08}>
            <div
              className="card card--hover"
              style={{ borderRadius: 14, padding: 28, height: "100%" }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: s.bg,
                  color: s.fg,
                  border: "var(--bw) solid var(--ink)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 900,
                  fontSize: 17,
                  marginBottom: 18,
                }}
              >
                {s.n}
              </div>
              <h3 style={{ margin: "0 0 10px" }}>{s.title}</h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  color: "var(--fg-2)",
                }}
              >
                {s.desc}
              </p>
            </div>
          </FadeInView>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
