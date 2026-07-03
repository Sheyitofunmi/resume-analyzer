import { motion, useReducedMotion } from "framer-motion";
import { useCountUp } from "~/hooks/useCountUp";

const ScoreCircle = ({ score = 75 }: { score: number }) => {
  const reduced = useReducedMotion();
  const stroke = 11;
  const r = 50 - stroke / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);

  const display = useCountUp(score, 1100, !reduced);

  return (
    <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        style={{ transform: "rotate(-90deg)" }}
        role="img"
        aria-label={`Score ${score} of 100`}
      >
        {/* Track */}
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke="rgba(11,11,11,0.12)"
          strokeWidth={stroke}
          fill="transparent"
        />
        {/* Animated fill ring */}
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          stroke="var(--ink)"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: reduced ? offset : circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: reduced ? 0 : 1.2,
            ease: [0.16, 1, 0.3, 1],
            delay: reduced ? 0 : 0.1,
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontSize: 21,
            fontWeight: 900,
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {reduced ? score : display}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            color: "var(--fg-2)",
            letterSpacing: "0.12em",
            marginTop: 2,
          }}
        >
          SCORE
        </span>
      </div>
    </div>
  );
};

export default ScoreCircle;
