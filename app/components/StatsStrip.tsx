import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 5, suffix: "", label: "ai_metrics" },
  { value: 100, suffix: "+", label: "keyword_signals" },
  { value: 3, suffix: "s", label: "avg_analysis" },
  { value: 98, suffix: "%", label: "ats_coverage" },
];

function useCountUp(target: number, duration: number, active: boolean) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf: number;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, active]);
  return count;
}

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
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [animate, delay]);

  const count = useCountUp(value, 1200, show);

  return (
    <div
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
      <span
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
        {count}
        {suffix}
      </span>
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

const StatsStrip = () => {
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
      ref={ref}
      style={{
        width: "100%",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        position: "relative",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
      }}
    >
      {/* Corner crosshairs */}
      <span className="rl-corner tl" />
      <span className="rl-corner tr" />
      <span className="rl-corner bl" />
      <span className="rl-corner br" />

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
