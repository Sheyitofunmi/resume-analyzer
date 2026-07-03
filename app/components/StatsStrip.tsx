import { useEffect, useRef, useState } from "react";
import { useCountUp } from "~/hooks/useCountUp";

const STATS = [
  { value: 5, suffix: "", label: "SCORE DIMENSIONS" },
  { value: 100, suffix: "+", label: "KEYWORD SIGNALS" },
  { value: 3, suffix: "s", label: "AVG ANALYSIS" },
  { value: 98, suffix: "%", label: "ATS COVERAGE" },
];

function StatItem({
  value,
  suffix,
  label,
  animate,
  divider,
}: {
  value: number;
  suffix: string;
  label: string;
  animate: boolean;
  divider: boolean;
}) {
  const num = useCountUp(value, 900, animate);

  return (
    <div
      style={{
        padding: "20px 24px",
        borderLeft: divider ? "1px solid var(--line)" : "none",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: 32,
          fontWeight: 900,
          lineHeight: 1,
          color: "var(--ink)",
          letterSpacing: "-0.03em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {animate ? num : value}
        {suffix}
      </span>
      <span className="eyebrow" style={{ fontSize: 10 }}>
        {label}
      </span>
    </div>
  );
}

const StatsStrip = ({ id }: { id?: string } = {}) => {
  const [animate, setAnimate] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimate(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      id={id}
      ref={ref}
      style={{
        width: "100%",
        background: "var(--surface)",
        border: "var(--bw) solid var(--ink)",
        borderRadius: "var(--r-card)",
        position: "relative",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      }}
    >
      {STATS.map((s, i) => (
        <StatItem key={s.label} {...s} animate={animate} divider={i > 0} />
      ))}
    </div>
  );
};

export default StatsStrip;
