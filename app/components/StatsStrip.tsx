import { useEffect, useRef, useState } from "react";

const STATS = [
  { value: 5, suffix: "", label: "AI Metrics Scored" },
  { value: 100, suffix: "+", label: "Keyword Signals" },
  { value: 3, suffix: "s", label: "Avg Analysis Time" },
  { value: 98, suffix: "%", label: "ATS Check Coverage" },
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
}: {
  value: number;
  suffix: string;
  label: string;
  animate: boolean;
  delay: number;
}) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [animate, delay]);

  const count = useCountUp(value, 1400, show);

  return (
    <div
      className={`flex flex-col items-center gap-2 px-4 py-6 transition-all duration-500 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <span
        className="text-4xl sm:text-5xl font-bold text-[#0a0a0a] tabular-nums"
        style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
      >
        {count}
        {suffix}
      </span>
      <span className="text-xs font-semibold text-[#525252] uppercase tracking-widest text-center">
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
    <div ref={ref} className="w-full border border-[#e5e5e5] bg-white">
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-[#e5e5e5]">
        {STATS.map((s, i) => (
          <StatItem key={s.label} {...s} animate={animate} delay={i * 120} />
        ))}
      </div>
    </div>
  );
};

export default StatsStrip;
