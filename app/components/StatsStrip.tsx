import { useEffect, useRef, useState } from "react";
import { useSpring, animated } from "@react-spring/web";

const STATS = [
  { value: 5, suffix: "", label: "ai_metrics" },
  { value: 100, suffix: "+", label: "keyword_signals" },
  { value: 3, suffix: "s", label: "avg_analysis" },
  { value: 98, suffix: "%", label: "ats_coverage" },
];

function StatItem({
  value,
  suffix,
  label,
  animate,
  delay,
  divider,
}: {
  value: number;
  suffix: string;
  label: string;
  animate: boolean;
  delay: number;
  divider: boolean;
}) {
  const [show, setShow] = useState(false);
  const [{ num }, api] = useSpring(() => ({ num: 0 }));

  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => {
      setShow(true);
      api.start({
        num: value,
        config: { mass: 1, tension: 52, friction: 16 },
      });
    }, delay);
    return () => clearTimeout(t);
  }, [animate, delay, value, api]);

  return (
    <div
      className="rl-stat-item"
      style={{
        padding: "20px 24px",
        borderLeft: divider ? "1px dashed var(--border)" : "none",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        opacity: show ? 1 : 0,
        transition: "opacity 400ms",
      }}
    >
      <animated.span
        className="rl-stat-value"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 32,
          fontWeight: 700,
          lineHeight: 1,
          color: "var(--phos)",
          letterSpacing: "-1.5px",
          fontVariantNumeric: "tabular-nums",
          textShadow: "0 0 14px var(--phos-glow)",
        }}
      >
        {num.to((n) => `${Math.round(n)}${suffix}`)}
      </animated.span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          color: "var(--fg-3)",
          letterSpacing: "0.12em",
        }}
      >
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
      className="rl-stats-grid"
      style={{
        width: "100%",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        position: "relative",
      }}
    >
      {STATS.map((s, i) => (
        <StatItem
          key={s.label}
          {...s}
          animate={animate}
          delay={i * 150}
          divider={i > 0}
        />
      ))}
    </div>
  );
};

export default StatsStrip;
