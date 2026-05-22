import { motion, useReducedMotion } from "framer-motion";
import { useCountUp } from "~/hooks/useCountUp";

const ScoreCircle = ({ score = 75 }: { score: number }) => {
  const reduced = useReducedMotion();
  const stroke = 4;
  const r = 50 - stroke / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);

  const color =
    score > 69
      ? "var(--phos)"
      : score > 49
        ? "var(--copper-hi)"
        : "var(--ember)";

  const glow =
    score > 69
      ? "rgba(168,230,163,0.5)"
      : score > 49
        ? "rgba(230,153,104,0.5)"
        : "rgba(227,83,74,0.5)";

  // Count up from 0 to score
  const display = useCountUp(score, 1100, !reduced);

  return (
    <div style={{ position: "relative", width: 80, height: 80, flexShrink: 0 }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        style={{ transform: "rotate(-90deg)" }}
      >
        {/* Track */}
        <circle
          cx="50"
          cy="50"
          r={r}
          stroke="var(--border-hi)"
          strokeWidth={stroke}
          fill="transparent"
        />
        {/* Animated fill ring */}
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: reduced ? 0 : 1.2,
            ease: [0.16, 1, 0.3, 1],
            delay: reduced ? 0 : 0.1,
          }}
          style={{ filter: `drop-shadow(0 0 6px ${glow})` }}
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
          fontFamily: "var(--font-mono)",
        }}
      >
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: reduced ? 0 : 0.2 }}
          style={{
            fontSize: 22,
            fontWeight: 500,
            color: "var(--fg-1)",
            letterSpacing: "-0.5px",
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {reduced ? score : display}
        </motion.span>
        <span
          style={{
            fontSize: 9,
            color: "var(--fg-3)",
            letterSpacing: "0.18em",
            marginTop: 2,
          }}
        >
          /100
        </span>
      </div>
    </div>
  );
};

export default ScoreCircle;
