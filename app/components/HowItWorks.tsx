import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { springs, staggerContainer, revealUp } from "~/lib/motion";

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

/* Cascade offsets per card index (desktop staircase) */
const CASCADE_OFFSET = [0, 56, 112];

const HowItWorks = ({ compact = false }: { compact?: boolean }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduced = useReducedMotion();

  return (
    <div ref={ref} style={{ width: "100%" }}>
      {!compact && (
        <div style={{ marginBottom: 24 }}>
          <span className="rl-comment">how_it_works</span>
        </div>
      )}

      <motion.div
        className="rl-hiw-cascade"
        variants={staggerContainer(0.12, 0.05)}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
      >
        {STEPS.map((s, i) => (
          <motion.div
            key={s.step}
            className="rl-hiw-card-wrap"
            style={
              reduced
                ? {}
                : ({
                    "--cascade-offset": `${CASCADE_OFFSET[i]}px`,
                  } as React.CSSProperties)
            }
            variants={revealUp}
          >
            {/* Connector arrow between cards */}
            {i < STEPS.length - 1 && (
              <div className="rl-hiw-connector" aria-hidden="true">
                <motion.span
                  style={{ color: s.color, opacity: 0.5 }}
                  animate={
                    inView ? { opacity: [0.3, 0.7, 0.3] } : { opacity: 0.3 }
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.4,
                  }}
                >
                  ↘
                </motion.span>
              </div>
            )}

            <motion.div
              className="rl-card rl-hiw-card"
              initial="rest"
              whileHover={reduced ? "rest" : "hover"}
              animate="rest"
              variants={{
                rest: { y: 0, transition: springs.snappy },
                hover: { y: -6, transition: springs.snappy },
              }}
            >
              {/* Step tag */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: s.color,
                    letterSpacing: "0.12em",
                    borderLeft: `2px solid ${s.color}`,
                    paddingLeft: 8,
                  }}
                >
                  STEP_{s.step}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--fg-3)",
                  }}
                >
                  <span style={{ color: "var(--fg-4)" }}>$</span> {s.cmd}
                </span>
              </div>

              {/* Giant watermark number */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  bottom: -4,
                  right: 12,
                  fontFamily: "var(--font-mono)",
                  fontSize: 80,
                  fontWeight: 700,
                  color: s.color,
                  opacity: 0.06,
                  lineHeight: 1,
                  userSelect: "none",
                  letterSpacing: "-4px",
                  pointerEvents: "none",
                }}
              >
                {s.step}
              </div>

              <h3
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 18,
                  fontWeight: 500,
                  color: "var(--fg-1)",
                  margin: "0 0 10px",
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

              {/* Colored bottom accent line */}
              <motion.div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: s.color,
                  transformOrigin: "left",
                  borderRadius: "0 0 var(--radius-md) var(--radius-md)",
                  opacity: 0.6,
                }}
                variants={{
                  rest: { scaleX: 0 },
                  hover: {
                    scaleX: 1,
                    transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
              />
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default HowItWorks;
