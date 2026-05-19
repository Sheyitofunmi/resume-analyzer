import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    step: "01",
    cmd: "upload",
    title: "Drop your PDF",
    desc: "A PDF resume and the job description you're targeting. That's it.",
    color: "var(--copper)",
  },
  {
    step: "02",
    cmd: "analyze",
    title: "AI scores 5 dimensions",
    desc: "ATS, tone, content, structure, skills. With reasoning attached.",
    color: "var(--phos)",
  },
  {
    step: "03",
    cmd: "rewrite",
    title: "Apply tips & ship",
    desc: "Specific rewrites, keyword diff, interview prep — copy/paste-ready.",
    color: "var(--copper-hi)",
  },
];

const HowItWorks = ({ compact = false }: { compact?: boolean }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ width: "100%" }}>
      {!compact && (
        <div style={{ marginBottom: 16 }}>
          <span className="rl-comment">how_it_works</span>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16,
        }}
      >
        {STEPS.map((s, i) => (
          <div
            key={s.step}
            className="rl-card rl-glow-hover"
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: 12,
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transition: `opacity 400ms ${i * 100}ms, transform 400ms ${i * 100}ms`,
            }}
          >
            <span className="rl-corner tl" />
            <span className="rl-corner tr" />
            <span className="rl-corner bl" />
            <span className="rl-corner br" />

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: s.color,
                  letterSpacing: "0.1em",
                  borderLeft: `2px solid ${s.color}`,
                  paddingLeft: 8,
                }}
              >
                STEP_{s.step}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--fg-3)",
                }}
              >
                <span style={{ color: "var(--fg-3)" }}>$</span> {s.cmd}
              </span>
            </div>

            <h3
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 18,
                fontWeight: 500,
                color: "var(--fg-1)",
                margin: 0,
              }}
            >
              {s.title}
            </h3>

            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-body)",
                fontSize: 13,
                color: "var(--fg-2)",
                lineHeight: 1.7,
              }}
            >
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
