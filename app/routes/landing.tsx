import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import Footer from "~/components/Footer";
import MobileBottomNav from "~/components/MobileBottomNav";
import PricingTiers from "~/components/PricingTiers";
import {
  Corners,
  Cursor,
  FadeInView,
  FeatureChip,
  ScoreBar,
} from "~/components/atoms";
import { usePuterStore } from "~/lib/puter";
import { springs, staggerContainer, fadeUp } from "~/lib/motion";

// ── Animated terminal demo ─────────────────────────────────────────────
const TERMINAL_LINES = [
  {
    text: "$ resumelens analyze --pdf=resume.pdf --jd=frontend-eng",
    delay: 0,
    type: "cmd",
  },
  { text: "> parsing pdf…", delay: 800, type: "step" },
  { text: "done", delay: 1400, type: "done" },
  { text: "> diffing against jd…", delay: 1800, type: "step" },
  { text: "running", delay: 2400, type: "running" },
  { text: "> scoring 5 dimensions…", delay: 3200, type: "step" },
  { text: "done", delay: 3800, type: "done" },
  { text: "> overall_score: 87  status: PASS", delay: 4400, type: "result" },
];

const LOOP_PAUSE_MS = 2000;

function TerminalDemo() {
  const [visible, setVisible] = useState<number[]>([]);
  const [paused, setPaused] = useState(false);
  const [cycle, setCycle] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    setVisible([]);
    const timers: ReturnType<typeof setTimeout>[] = [];

    TERMINAL_LINES.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          if (!pausedRef.current) setVisible((v) => [...v, i]);
        }, line.delay),
      );
    });

    // Loop back after last line + pause
    const loopTimer = setTimeout(
      () => {
        if (!pausedRef.current) setCycle((c) => c + 1);
      },
      TERMINAL_LINES[TERMINAL_LINES.length - 1].delay + LOOP_PAUSE_MS,
    );
    timers.push(loopTimer);

    return () => timers.forEach(clearTimeout);
  }, [cycle]);

  const togglePause = () => {
    const next = !paused;
    pausedRef.current = next;
    setPaused(next);
    // resuming: restart the cycle from scratch
    if (!next) setCycle((c) => c + 1);
  };

  const running = visible.length < TERMINAL_LINES.length;

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border-hi)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        position: "relative",
      }}
    >
      <Corners />
      {/* Window chrome */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "var(--bg-3)",
        }}
      >
        {["var(--ember)", "var(--copper)", "var(--phos)"].map((c, i) => (
          <span
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: c,
              opacity: 0.7,
            }}
          />
        ))}
        <span
          style={{
            marginLeft: 10,
            fontSize: 11,
            color: "var(--fg-3)",
            flex: 1,
          }}
        >
          resumelens · live_demo
        </span>
        <button
          type="button"
          onClick={togglePause}
          className="rl-btn-terminal"
          style={{ color: paused ? "var(--copper)" : "var(--fg-3)" }}
        >
          {paused ? "▶ resume" : "⏸ pause"}
        </button>
      </div>

      {/* Lines */}
      <div
        style={{
          padding: "16px 18px",
          minHeight: 160,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {TERMINAL_LINES.map((line, i) => {
          if (!visible.includes(i)) return null;
          const color =
            line.type === "cmd"
              ? "var(--fg-1)"
              : line.type === "done"
                ? "var(--phos)"
                : line.type === "running"
                  ? "var(--copper)"
                  : line.type === "result"
                    ? "var(--phos)"
                    : "var(--fg-2)";
          return (
            <div key={i} style={{ color, display: "flex", gap: 8 }}>
              {line.type === "step" && (
                <span style={{ color: "var(--fg-4)" }}>{">"}</span>
              )}
              <span>{line.text}</span>
            </div>
          );
        })}
        {!paused && running && (
          <span className="rl-cursor" style={{ background: "var(--phos)" }} />
        )}
      </div>
    </div>
  );
}

// ── Feature cards ──────────────────────────────────────────────────────
const FEATURES = [
  {
    tag: "ATS",
    title: "Beat the bot, reach the human",
    desc: "We diff against the exact parser engines recruiters use. Know in seconds if your PDF even clears the first filter.",
    viz: (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        {[
          { label: "keyword density", val: 82 },
          { label: "format score", val: 71 },
          { label: "section match", val: 55 },
        ].map(({ label, val }) => (
          <div key={label}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.6)" }}>
              <span>{label}</span>
              <span style={{ color: "#fff", fontWeight: 600 }}>{val}%</span>
            </div>
            <div style={{ height: 7, borderRadius: 4, background: "rgba(255,255,255,0.18)" }}>
              <div style={{ width: `${val}%`, height: "100%", borderRadius: 4, background: "rgba(255,255,255,0.9)" }} />
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(255,255,255,0.2)", fontFamily: "var(--font-mono)", fontSize: 10, color: "#fff" }}>✓ passes ATS</span>
          <span style={{ padding: "3px 10px", borderRadius: 20, background: "rgba(0,0,0,0.12)", fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.55)" }}>87 / 100</span>
        </div>
      </div>
    ),
  },
  {
    tag: "KW",
    title: "Never miss a keyword again",
    desc: "Every signal in the JD ranked by frequency and placement. Copy-paste the missing ones directly into your draft.",
    viz: (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
        {[
          { label: "React", ok: true },
          { label: "TypeScript", ok: true },
          { label: "Docker", ok: true },
          { label: "GraphQL", ok: false },
          { label: "Postgres", ok: false },
          { label: "K8s", ok: false },
        ].map((k) => (
          <span
            key={k.label}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              padding: "4px 10px",
              borderRadius: 20,
              background: k.ok ? "rgba(5,46,22,0.18)" : "rgba(5,46,22,0.07)",
              border: `1px solid ${k.ok ? "rgba(5,46,22,0.35)" : "rgba(5,46,22,0.15)"}`,
              color: k.ok ? "#052e16" : "rgba(5,46,22,0.45)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span style={{ fontSize: 8 }}>{k.ok ? "✓" : "+"}</span>
            {k.label}
          </span>
        ))}
      </div>
    ),
  },
  {
    tag: "RW",
    title: "Rewrite every weak bullet instantly",
    desc: "Each vague line gets a stronger alternative — action verbs, numbers, impact. Approve or skip, one bullet at a time.",
    viz: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        <div style={{ padding: "9px 12px", background: "rgba(0,0,0,0.15)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ color: "rgba(255,130,130,0.9)", flexShrink: 0, fontSize: 11 }}>✕</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.45)", textDecoration: "line-through", lineHeight: 1.5 }}>Helped improve the website performance.</span>
        </div>
        <div style={{ padding: "9px 12px", background: "rgba(255,255,255,0.2)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.35)", display: "flex", gap: 8, alignItems: "flex-start" }}>
          <span style={{ color: "rgba(180,255,180,0.9)", flexShrink: 0, fontSize: 11 }}>✓</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "#fff", lineHeight: 1.5 }}>Cut page-load p95 by 200 ms, lifting conversion 8%.</span>
        </div>
      </div>
    ),
  },
  {
    tag: "IV",
    title: "Walk into interviews fully prepared",
    desc: "Behavioral + technical questions tailored to the JD and your seniority. Each with a structured confidence rubric.",
    viz: (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
        {[
          "Tell me about a high-stakes migration you led.",
          "Walk me through your system design approach.",
          "What was your most ambiguous project?",
        ].map((q, i) => (
          <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(28,20,0,0.3)", flexShrink: 0, marginTop: 1, fontWeight: 700, letterSpacing: "0.05em" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(28,20,0,0.72)", lineHeight: 1.5 }}>{q}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "TS",
    title: "Sound sharp, not safe",
    desc: "Action-verb density, hedging language, sentence variety — all scored and flagged with line-level fixes you can apply immediately.",
    viz: (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
        {[
          { label: "action verbs", pct: 72, good: true },
          { label: "hedging words", pct: 38, good: false },
          { label: "sent. variety", pct: 65, good: true },
        ].map(({ label, pct, good }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.6)", width: 90, flexShrink: 0 }}>{label}</span>
            <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.18)" }}>
              <div style={{ width: `${pct}%`, height: "100%", borderRadius: 3, background: good ? "rgba(255,255,255,0.85)" : "rgba(255,200,200,0.65)" }} />
            </div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: good ? "#fff" : "rgba(255,220,220,0.85)", width: 28, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
              {pct}%
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "HX",
    title: "Track your score climbing over time",
    desc: "Every analysis is versioned. Watch the graph rise with each revision and diff any two versions side-by-side.",
    viz: (
      <div style={{ marginTop: 8 }}>
        <svg width="100%" height={56} viewBox="0 0 220 56" style={{ overflow: "visible" }}>
          <defs>
            <linearGradient id="hxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(12,26,38,0.25)" />
              <stop offset="100%" stopColor="rgba(12,26,38,0)" />
            </linearGradient>
          </defs>
          <path d="M0,50 C30,48 50,42 80,34 C110,26 130,18 160,10 C185,4 200,2 220,1" fill="none" stroke="rgba(12,26,38,0.75)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M0,50 C30,48 50,42 80,34 C110,26 130,18 160,10 C185,4 200,2 220,1 L220,56 L0,56 Z" fill="url(#hxGrad)" />
          {[{ x: 0, y: 50, s: 48 }, { x: 80, y: 34, s: 67 }, { x: 160, y: 10, s: 84 }, { x: 220, y: 1, s: 91 }].map(({ x, y, s }) => (
            <g key={x}>
              <circle cx={x} cy={y} r={3.5} fill="rgba(12,26,38,0.85)" />
              <text x={x} y={y - 7} textAnchor="middle" fontFamily="var(--font-mono)" fontSize={8} fill="rgba(12,26,38,0.55)">{s}</text>
            </g>
          ))}
        </svg>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2, fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(12,26,38,0.38)" }}>
          <span>v1</span><span>v2</span><span>v3</span><span>v4 →</span>
        </div>
      </div>
    ),
  },
];

// ── Testimonials ───────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote:
      "I ran my resume through three ATS filters without a single rejection. Keyword diff is genuinely that good.",
    name: "J. Okafor",
    role: "Senior Frontend Engineer",
    target: "targeting FAANG roles",
    lift: "+19",
    avatar: "JO",
  },
  {
    quote:
      "Added two missing terms the keyword analysis flagged. Went from buried in the pile to first-round callback.",
    name: "A. Mehta",
    role: "Product Designer",
    target: "switching to fintech",
    lift: "+24",
    avatar: "AM",
  },
  {
    quote:
      "Three seconds. Five scores. Specific rewrites. Fastest signal I've found on whether a resume will actually land.",
    name: "D. Rivera",
    role: "Staff Engineer",
    target: "returning from career break",
    lift: "+31",
    avatar: "DR",
  },
  {
    quote:
      "The tone analysis caught hedging language I'd never noticed. My bullets went from passive to punchy in one pass.",
    name: "K. Nwosu",
    role: "Backend Engineer",
    target: "first job post-bootcamp",
    lift: "+22",
    avatar: "KN",
  },
  {
    quote:
      "Interview prep questions matched almost word-for-word what the panel actually asked. That is not a coincidence.",
    name: "S. Park",
    role: "Engineering Manager",
    target: "moving from IC to leadership",
    lift: "+17",
    avatar: "SP",
  },
  {
    quote:
      "Score history showing my resume going from 54 to 91 over four iterations is the most satisfying diff I've ever seen.",
    name: "T. Osei",
    role: "Full-Stack Developer",
    target: "relocating internationally",
    lift: "+37",
    avatar: "TO",
  },
];

// ── FAQ ────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "is my resume sent to a third party?",
    a: "No. Your PDF is processed locally via Puter — it never touches our servers or any third-party model provider directly. The AI analysis uses the Claude API through Puter's secure pipeline.",
  },
  {
    q: "what AI model do you use?",
    a: "Claude (Anthropic) for scoring and rewrites. We are model-agnostic at the architecture level; if a better model ships, we will use it.",
  },
  {
    q: "how is the ATS score calculated?",
    a: "We extract structured data from your resume and diff it against keyword signals in the job description, weighted by frequency and placement. The score reflects how well you'd parse in common ATS engines.",
  },
  {
    q: "can I compare two resumes?",
    a: "Yes — from the dashboard, enable compare mode and select any two resumes. You'll get a side-by-side diff of every dimension plus keyword overlap.",
  },
  {
    q: "do you store my data?",
    a: "All data is stored in your Puter account — encrypted, private, and only accessible to you. We have no database of user resumes.",
  },
];

function FAQItem({
  q,
  a,
  defaultOpen = false,
}: {
  q: string;
  a: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const reduced = useReducedMotion();

  return (
    <div style={{ borderBottom: "1px dashed var(--border)" }}>
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        whileHover={reduced ? {} : { x: 2 }}
        transition={springs.snappy}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 0",
          textAlign: "left",
        }}
      >
        <motion.span
          animate={{
            rotate: open ? 45 : 0,
            color: open ? "var(--phos)" : "var(--fg-3)",
          }}
          transition={reduced ? { duration: 0 } : springs.snappy}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 18,
            flexShrink: 0,
            width: 16,
            lineHeight: 1,
            display: "inline-block",
            transformOrigin: "center",
          }}
        >
          +
        </motion.span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: open ? "var(--fg-1)" : "var(--fg-2)",
            transition: "color 150ms",
          }}
        >
          {q}
        </span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={reduced ? {} : { height: 0, opacity: 0 }}
            animate={reduced ? {} : { height: "auto", opacity: 1 }}
            exit={reduced ? {} : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              style={{
                paddingBottom: 16,
                paddingLeft: 28,
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--fg-2)",
                lineHeight: 1.75,
              }}
            >
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── HeroBadge ─────────────────────────────────────────────────────────
function HeroBadge() {
  return (
    <span
      className="rl-pill rl-pill-good"
      style={{
        display: "inline-flex",
        gap: 8,
        whiteSpace: "nowrap",
        alignItems: "center",
      }}
    >
      <span className="rl-dot" style={{ width: 7, height: 7, flexShrink: 0 }} />
      <span>v1.0 · now in public beta</span>
    </span>
  );
}

// ── AnimatedStat — react-spring count-up on viewport entry ───────────
function AnimatedStat({ value }: { value: number }) {
  const elRef = useRef<HTMLSpanElement>(null);
  const [{ num }, api] = useSpring(() => ({ num: 0 }));

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          api.start({
            num: value,
            config: { mass: 1, tension: 35, friction: 18 },
          });
          obs.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, api]);

  return (
    <animated.span ref={elRef}>{num.to((n) => Math.round(n))}</animated.span>
  );
}

// ── VivusTrendLine — SVG path drawn in by Vivus ───────────────────────
function VivusTrendLine() {
  const svgRef = useRef<SVGSVGElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          obs.disconnect();
          import("vivus").then(({ default: Vivus }) => {
            new Vivus(el as unknown as HTMLElement, {
              type: "delayed",
              duration: 160,
              animTimingFunction: Vivus.EASE_OUT,
            });
          });
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <svg
      ref={svgRef}
      width="100%"
      height={52}
      viewBox="0 0 200 52"
      style={{ marginTop: 8, overflow: "visible" }}
    >
      <path
        d="M 0,46 L 40,40 L 80,32 L 120,22 L 160,12 L 200,5"
        fill="none"
        stroke="var(--phos)"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={200} cy={5} r={4} fill="var(--phos)" />
      <circle
        cx={200}
        cy={5}
        r={8}
        fill="none"
        stroke="var(--phos)"
        strokeWidth={1}
        opacity={0.35}
      />
    </svg>
  );
}

// ── Feature card palette — vibrant editorial ─────────────────────────
const FEATURE_COLORS: { bg: string; text: string }[] = [
  { bg: "#FF8C61", text: "#ffffff" }, // orange  – ATS
  { bg: "#34D399", text: "#052e16" }, // emerald – Keywords
  { bg: "#A78BFA", text: "#ffffff" }, // violet  – AI rewrite
  { bg: "#FBBF24", text: "#1c1400" }, // amber   – Interview
  { bg: "#F472B6", text: "#ffffff" }, // rose    – Tone
  { bg: "#38BDF8", text: "#0c1a26" }, // sky     – History
];

// ── FeaturesSection — Streamtime-style Z-stack, fully responsive ──────
function FeaturesSection() {
  const [active, setActive] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const reduced = useReducedMotion();
  const total = FEATURES.length;

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    import("gsap").then(({ gsap }) => {
      const card = cardRefs.current[active];
      if (!card) return;
      const onMove = (e: MouseEvent) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(card, {
          rotateX: -y * 10,
          rotateY: x * 10,
          scale: 1.02,
          duration: 0.25,
          ease: "power2.out",
          transformPerspective: 900,
          overwrite: "auto",
        });
      };
      const onLeave = () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          duration: 0.5,
          ease: "power3.out",
          overwrite: "auto",
        });
      };
      card.addEventListener("mousemove", onMove);
      card.addEventListener("mouseleave", onLeave);
      cleanup = () => {
        card.removeEventListener("mousemove", onMove);
        card.removeEventListener("mouseleave", onLeave);
        gsap.set(card, { rotateX: 0, rotateY: 0, scale: 1 });
      };
    });
    return () => cleanup?.();
  }, [active]);

  return (
    <section
      id="features"
      style={{ background: "#ffffff", width: "100%", boxSizing: "border-box" }}
      className="rl-features-section"
    >
      <div className="rl-features-container">
        {/* Header */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#aaa", letterSpacing: "0.18em", textTransform: "uppercase" }}>
            // features
          </span>
          <h2 style={{ fontSize: "clamp(26px, 5vw, 48px)", color: "#0d0d0d", fontWeight: 500, letterSpacing: "-1.5px", margin: 0 }}>
            five signals that matter
          </h2>
        </div>

        {/* Main row: card deck + desktop nav */}
        <div className="rl-features-row">

          {/* Z-stack card deck */}
          <div className="rl-features-deck">
            {FEATURES.map((f, i) => {
              const pos = ((i - active) % total + total) % total;
              if (pos >= 4) return null;
              const isActive = pos === 0;
              const color = FEATURE_COLORS[i];
              return (
                <motion.div
                  key={f.tag}
                  ref={(el) => { cardRefs.current[i] = el; }}
                  animate={{
                    scale: isActive ? 1 : 1 - pos * 0.05,
                    x: isActive ? 0 : pos * 14,
                    y: isActive ? 0 : pos * 8,
                    rotate: isActive ? 0 : pos * 2,
                    opacity: isActive ? 1 : Math.max(0, 1 - pos * 0.25),
                  }}
                  transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 280, damping: 28 }}
                  onClick={() => !isActive && setActive(i)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: color.bg,
                    borderRadius: 20,
                    cursor: isActive ? "default" : "pointer",
                    overflow: "hidden",
                    zIndex: total - pos,
                    boxShadow: isActive
                      ? "0 20px 56px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.08)"
                      : "0 4px 16px rgba(0,0,0,0.06)",
                    transformOrigin: "bottom center",
                    willChange: "transform",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Viz area — flex:1 so it takes remaining height */}
                  <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
                    <span
                      style={{
                        position: "absolute",
                        bottom: -16,
                        right: -4,
                        fontFamily: "var(--font-mono)",
                        fontSize: "clamp(64px, 14vw, 118px)",
                        fontWeight: 800,
                        color: color.text + "0e",
                        lineHeight: 1,
                        userSelect: "none",
                        pointerEvents: "none",
                        letterSpacing: "-4px",
                      }}
                    >
                      {f.tag}
                    </span>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        padding: "clamp(14px, 3vw, 24px)",
                        paddingBottom: 0,
                        opacity: isActive ? 1 : 0,
                        transition: "opacity 200ms",
                      }}
                    >
                      {f.viz}
                    </div>
                  </div>

                  {/* Text bottom */}
                  <div
                    style={{
                      padding: "clamp(10px, 2vw, 16px) clamp(14px, 3vw, 22px) clamp(14px, 3vw, 22px)",
                      borderTop: `1px solid ${color.text}12`,
                      color: color.text,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        letterSpacing: "0.14em",
                        opacity: 0.4,
                        display: "block",
                        marginBottom: 3,
                        textTransform: "uppercase",
                      }}
                    >
                      [{f.tag}]
                    </span>
                    <h3
                      style={{
                        margin: "0 0 4px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "clamp(13px, 2.2vw, 17px)",
                        fontWeight: 600,
                        lineHeight: 1.2,
                        color: color.text,
                      }}
                    >
                      {f.title}
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontFamily: "var(--font-body)",
                        fontSize: "clamp(11px, 1.6vw, 13px)",
                        lineHeight: 1.6,
                        color: color.text,
                        opacity: 0.65,
                      }}
                    >
                      {f.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Desktop-only nav sidebar */}
          <nav className="rl-features-nav" aria-label="Feature navigation">
            {FEATURES.map((f, i) => {
              const isNav = i === active;
              return (
                <button
                  key={f.tag}
                  type="button"
                  onClick={() => setActive(i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: isNav ? FEATURE_COLORS[i].bg + "22" : "transparent",
                    border: "none",
                    borderRadius: 10,
                    padding: "9px 12px",
                    cursor: "pointer",
                    transition: "background 220ms",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: FEATURE_COLORS[i].bg,
                      flexShrink: 0,
                      border: "2px solid rgba(0,0,0,0.07)",
                      boxShadow: isNav ? `0 0 12px ${FEATURE_COLORS[i].bg}` : "none",
                      transition: "box-shadow 220ms",
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#aaa", letterSpacing: "0.1em", display: "block" }}>
                      [{f.tag}]
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: isNav ? "#0d0d0d" : "#666",
                        fontWeight: isNav ? 600 : 400,
                        transition: "color 200ms",
                        display: "block",
                        marginTop: 1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {f.title}
                    </span>
                  </div>
                </button>
              );
            })}
            {/* Prev/Next — desktop */}
            <div style={{ display: "flex", gap: 8, marginTop: 14, paddingLeft: 12 }}>
              {[
                { lbl: "←", fn: () => setActive((v) => (v - 1 + total) % total) },
                { lbl: "→", fn: () => setActive((v) => (v + 1) % total) },
              ].map(({ lbl, fn }) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={fn}
                  style={{
                    width: 36, height: 36, borderRadius: 8,
                    border: "1.5px solid #e8e8e8", background: "#fafafa",
                    cursor: "pointer", fontSize: 16,
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    color: "#444",
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Bottom controls — progress dots + mobile prev/next */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          {/* Mobile prev/next (hidden on desktop via CSS) */}
          <div className="rl-features-mobile-arrows">
            {[
              { lbl: "←", fn: () => setActive((v) => (v - 1 + total) % total) },
              { lbl: "→", fn: () => setActive((v) => (v + 1) % total) },
            ].map(({ lbl, fn }) => (
              <button
                key={lbl}
                type="button"
                onClick={fn}
                style={{
                  width: 44, height: 44, borderRadius: 10,
                  border: "1.5px solid #e8e8e8", background: "#fafafa",
                  cursor: "pointer", fontSize: 18,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  color: "#444",
                }}
              >
                {lbl}
              </button>
            ))}
          </div>

          {/* Progress dots */}
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {FEATURES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                style={{
                  width: i === active ? 26 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: i === active ? FEATURE_COLORS[i].bg : "#e0e0e0",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 320ms ease",
                  padding: 0,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


// ── LandingNavbar ──────────────────────────────────────────────────────
function LandingNavbar() {
  const { auth } = usePuterStore();

  return (
    <nav
      className="rl-landing-nav"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid var(--border)",
        background: "rgba(11,11,10,0.88)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        gap: 16,
      }}
    >
      {/* Logo */}
      <Link
        to={auth.isAuthenticated ? "/" : "/landing"}
        style={{ textDecoration: "none" }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "var(--font-mono)",
            fontSize: 16,
            fontWeight: 500,
            color: "var(--fg-1)",
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              background: "var(--phos)",
              color: "var(--bg)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              boxShadow: "0 0 12px var(--phos-glow)",
            }}
          >
            R
          </span>
          resumelens<span style={{ color: "var(--phos)" }}>_</span>
        </span>
      </Link>

      {/* Nav links */}
      <div
        className="rl-mobile-hide"
        style={{ display: "flex", gap: 28, alignItems: "center" }}
      >
        {["features", "how_it_works", "before_after", "pricing", "faq"].map(
          (item) => (
            <a
              key={item}
              href={`#${item}`}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--fg-3)",
                textDecoration: "none",
                letterSpacing: "0.05em",
                transition: "color var(--dur-fast)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--fg-1)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--fg-3)")
              }
            >
              {item}
            </a>
          ),
        )}
      </div>

      {/* Right CTAs */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {auth.isAuthenticated ? (
          <Link
            to="/"
            className="rl-btn rl-btn-primary"
            style={{ fontSize: 12 }}
          >
            → open_dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/auth"
              className="rl-btn rl-btn-ghost rl-mobile-hide"
              style={{ fontSize: 12 }}
            >
              sign_in
            </Link>
            <Link
              to="/auth"
              className="rl-btn rl-btn-primary"
              style={{ fontSize: 12 }}
            >
              $ try_free →
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

// ── Landing page ───────────────────────────────────────────────────────
export default function Landing() {
  const trustRef = useRef<HTMLDivElement>(null);
  const [trustVisible, setTrustVisible] = useState(false);

  useEffect(() => {
    const el = trustRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTrustVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <main className="rl-page" style={{ paddingBottom: 0 }}>
      <div className="rl-scroll-bar" />
      <LandingNavbar />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section
        className="rl-hero-grid rl-hero-section"
        style={{
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "80px 32px 64px",
          boxSizing: "border-box",
        }}
      >
        {/* Left column — staggered entrance */}
        <motion.div
          variants={staggerContainer(0.09, 0.1)}
          initial="hidden"
          animate="visible"
          style={{ display: "flex", flexDirection: "column", gap: 24 }}
        >
          {/* Badge */}
          <motion.div variants={fadeUp} style={{ display: "inline-flex" }}>
            <HeroBadge />
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            style={{
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 500,
              lineHeight: 1.02,
              letterSpacing: "-2px",
              color: "var(--fg-1)",
              margin: 0,
            }}
          >
            the resume reviewer
            <br />
            you wish you knew
            <Cursor />
          </motion.h1>

          {/* Body */}
          <motion.p
            variants={fadeUp}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 16,
              color: "var(--fg-2)",
              lineHeight: 1.75,
              margin: 0,
              maxWidth: 480,
            }}
          >
            ResumeLens diffs your resume against any job description, scores
            five dimensions, and tells you exactly what to rewrite. Three
            seconds. No fluff. Built for engineers who'd rather read a
            structured report than a vibe check.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
          >
            <Link to="/auth">
              <motion.span
                className="rl-btn rl-btn-primary rl-btn-lg"
                style={{
                  display: "inline-flex",
                  position: "relative",
                  overflow: "hidden",
                }}
                whileHover={{ y: -3, scale: 1.03 }}
                whileTap={{ y: 0, scale: 0.97 }}
                transition={springs.snappy}
              >
                $ analyze_my_resume →{/* Shimmer on hover */}
                <motion.span
                  initial={{ x: "-100%", opacity: 0 }}
                  whileHover={{ x: "100%", opacity: 0.15 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(90deg, transparent, white, transparent)",
                    pointerEvents: "none",
                  }}
                />
              </motion.span>
            </Link>
            <motion.a
              href="#before_after"
              className="rl-btn rl-btn-secondary rl-btn-lg"
              whileHover={{
                y: -2,
                borderColor: "var(--copper)",
                color: "var(--copper-hi)",
              }}
              whileTap={{ y: 0, scale: 0.97 }}
              transition={springs.snappy}
            >
              see_sample_report
            </motion.a>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            variants={fadeUp}
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              paddingTop: 4,
            }}
          >
            {[
              "✓ no signup to try",
              "✓ pdf never leaves your puter cloud",
              "✓ 3 sec avg",
            ].map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.08, duration: 0.5 }}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--fg-3)",
                  letterSpacing: "0.06em",
                }}
              >
                {t}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* Terminal demo — slides in from right */}
        <motion.div
          initial={{ opacity: 0, x: 40, filter: "blur(8px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.19, 1, 0.22, 1], delay: 0.25 }}
        >
          <TerminalDemo />
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section
        id="how_it_works"
        className="rl-landing-section"
        style={{ width: "100%", borderTop: "1px dashed var(--border)" }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 48,
          }}
        >
          <FadeInView
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              textAlign: "center",
            }}
          >
            <span className="rl-eyebrow">// how_it_works</span>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                color: "var(--fg-1)",
                fontWeight: 500,
                letterSpacing: "-1.5px",
              }}
            >
              three commands. three seconds.
            </h2>
          </FadeInView>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                step: "STEP_01",
                cmd: "$ upload",
                title: "Drop your PDF",
                desc: "Upload your resume PDF and paste any job description. No account required — your file goes straight to your private Puter cloud, never our servers.",
              },
              {
                step: "STEP_02",
                cmd: "$ analyze",
                title: "AI scores 5 dimensions",
                desc: "Claude scores ATS compatibility, tone & style, content quality, structure, and skills gap — each with line-by-line reasoning, not just a number.",
              },
              {
                step: "STEP_03",
                cmd: "$ rewrite",
                title: "Apply tips & ship",
                desc: "Get specific bullet rewrites, a keyword diff you can copy-paste, and tailored interview questions. Approve or skip each suggestion individually.",
              },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                whileHover={{
                  y: -4,
                  boxShadow: "var(--depth-card-hover)",
                  borderColor: "var(--border-hi)",
                }}
                transition={springs.smooth}
                className="rl-card"
                style={{ position: "relative", willChange: "transform" }}
                data-aos="fade-up"
                data-aos-delay={i * 120}
                data-aos-duration="650"
              >
                <Corners />
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--copper)",
                        fontWeight: 700,
                      }}
                    >
                      {s.step}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--fg-4)",
                      }}
                    >
                      {s.cmd}
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
                      fontSize: 14,
                      color: "var(--fg-2)",
                      lineHeight: 1.65,
                    }}
                  >
                    {s.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <FeaturesSection />

      {/* ── BEFORE / AFTER ───────────────────────────────────────── */}
      <section
        id="before_after"
        className="rl-landing-section"
        style={{
          width: "100%",
          borderTop: "1px dashed var(--border)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 48,
          }}
        >
          <FadeInView
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              textAlign: "center",
            }}
          >
            <span className="rl-eyebrow">// before_after</span>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                color: "var(--fg-1)",
                fontWeight: 500,
                letterSpacing: "-1.5px",
              }}
            >
              watch a weak bullet
              <br />
              get an unfair edge
              <Cursor />
            </h2>
          </FadeInView>

          <div className="rl-ba-grid">
            {/* Before */}
            <FadeInView delay={0.05}>
              <div className="rl-card" style={{ position: "relative" }}>
                <Corners />
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--fg-3)",
                        letterSpacing: "0.15em",
                      }}
                    >
                      BEFORE
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 28,
                        fontWeight: 700,
                        color: "var(--ember)",
                        letterSpacing: "-1px",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      48
                      <span style={{ fontSize: 14, color: "var(--fg-4)" }}>
                        /100
                      </span>
                    </span>
                  </div>
                  {[
                    "Helped improve the website.",
                    "Worked with the team on new features.",
                    "Used React.",
                    "Was responsible for code reviews.",
                  ].map((b) => (
                    <div
                      key={b}
                      style={{
                        display: "flex",
                        gap: 8,
                        fontFamily: "var(--font-body)",
                        fontSize: 13,
                        color: "var(--fg-3)",
                      }}
                    >
                      <span style={{ color: "var(--fg-4)" }}>-</span> {b}
                    </div>
                  ))}
                </div>
              </div>
            </FadeInView>

            {/* Rewrite button */}
            <FadeInView
              delay={0.15}
              className="rl-ba-mid"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 48,
              }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "var(--glow-copper)",
                    "0 0 28px rgba(196,123,74,0.5)",
                    "var(--glow-copper)",
                  ],
                }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  background: "var(--copper)",
                  color: "var(--bg)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "10px 18px",
                  borderRadius: "var(--radius-md)",
                  whiteSpace: "nowrap",
                }}
              >
                $ rewrite
              </motion.div>
            </FadeInView>

            {/* After */}
            <FadeInView delay={0.25}>
              <div className="rl-card is-phos" style={{ position: "relative" }}>
                <Corners />
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--fg-3)",
                        letterSpacing: "0.15em",
                      }}
                    >
                      AFTER
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 28,
                        fontWeight: 700,
                        color: "var(--phos)",
                        letterSpacing: "-1px",
                        fontVariantNumeric: "tabular-nums",
                        textShadow: "0 0 14px var(--phos-glow)",
                      }}
                    >
                      89
                      <span style={{ fontSize: 14, color: "var(--fg-3)" }}>
                        /100
                      </span>
                    </span>
                  </div>
                  {[
                    "Cut page-load p95 by 200 ms, lifting conversion 8%.",
                    "Shipped 4 major features end-to-end with 3 engineers; 0 rollbacks.",
                    "Migrated app to React + TypeScript; reduced bundle 38%.",
                    "Reviewed 200+ PRs; mentored 3 juniors, 2 promoted in a year.",
                  ].map((b, i) => (
                    <div
                      key={b}
                      data-aos="fade-left"
                      data-aos-delay={400 + i * 70}
                      data-aos-duration="450"
                      style={{
                        display: "flex",
                        gap: 8,
                        fontFamily: "var(--font-body)",
                        fontSize: 13,
                        color: "var(--fg-1)",
                      }}
                    >
                      <span style={{ color: "var(--phos)", flexShrink: 0 }}>
                        +
                      </span>{" "}
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS MARQUEE ─────────────────────────────────── */}
      <section
        id="signal_from_users"
        className="rl-testimonials-section"
        style={{
          width: "100%",
          borderTop: "1px dashed var(--border)",
          paddingTop: 64,
          paddingBottom: 64,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <FadeInView
          className="rl-testimonials-header"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            textAlign: "center",
            marginBottom: 40,
            padding: "0 32px",
          }}
        >
          <span className="rl-eyebrow">// user_results</span>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              color: "var(--fg-1)",
              fontWeight: 500,
              letterSpacing: "-1.5px",
            }}
          >
            from job-seeker to job-shipper
            <Cursor />
          </h2>
        </FadeInView>

        {/* Marquee track — duplicated for seamless loop */}
        <div className="rl-marquee-wrap">
          <div className="rl-marquee-track">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, idx) => (
              <motion.div
                key={`${t.name}-${idx}`}
                className="rl-card rl-marquee-card"
                style={{ position: "relative", flexShrink: 0 }}
                whileHover={{
                  y: -4,
                  scale: 1.02,
                  boxShadow: "var(--depth-card-hover)",
                }}
                transition={springs.smooth}
              >
                <Corners />
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-body)",
                      fontSize: 14,
                      color: "var(--fg-1)",
                      lineHeight: 1.7,
                    }}
                  >
                    "{t.quote}"
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingTop: 8,
                      borderTop: "1px dashed var(--border)",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
                    >
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "var(--surface-2)",
                          border: "1px solid var(--border-hi)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--font-mono)",
                          fontSize: 10,
                          fontWeight: 700,
                          color: "var(--copper)",
                          flexShrink: 0,
                        }}
                      >
                        {t.avatar}
                      </span>
                      <div>
                        <p
                          style={{
                            margin: 0,
                            fontFamily: "var(--font-mono)",
                            fontSize: 12,
                            color: "var(--fg-1)",
                            fontWeight: 500,
                          }}
                        >
                          {t.name}
                        </p>
                        <p
                          style={{
                            margin: "2px 0 0",
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            color: "var(--fg-3)",
                          }}
                        >
                          {t.role}
                        </p>
                        <p
                          style={{
                            margin: "1px 0 0",
                            fontFamily: "var(--font-mono)",
                            fontSize: 10,
                            color: "var(--fg-4)",
                            fontStyle: "italic",
                          }}
                        >
                          {t.target}
                        </p>
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 16,
                        fontWeight: 700,
                        color: "var(--phos)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        flexShrink: 0,
                        textShadow: "0 0 10px var(--phos-glow)",
                      }}
                    >
                      <span style={{ fontSize: 9 }}>▲</span> {t.lift}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section
        id="pricing"
        className="rl-landing-section"
        style={{ width: "100%", borderTop: "1px dashed var(--border)" }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 48,
            alignItems: "center",
          }}
        >
          <FadeInView
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              textAlign: "center",
            }}
          >
            <span className="rl-eyebrow">// pricing</span>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                color: "var(--fg-1)",
                fontWeight: 500,
                letterSpacing: "-1.5px",
              }}
            >
              one tier away from your offer
            </h2>
          </FadeInView>
          <FadeInView delay={0.1} style={{ width: "100%" }}>
            <PricingTiers />
          </FadeInView>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section
        id="faq"
        className="rl-landing-section"
        style={{ width: "100%", borderTop: "1px dashed var(--border)" }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 48,
          }}
        >
          <FadeInView
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              textAlign: "center",
            }}
          >
            <span className="rl-eyebrow">// faq</span>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                color: "var(--fg-1)",
                fontWeight: 500,
                letterSpacing: "-1.5px",
              }}
            >
              answers, before you ask
            </h2>
          </FadeInView>

          <FadeInView delay={0.1}>
            <div
              className="rl-card"
              style={{ position: "relative", padding: "0 24px" }}
            >
              <Corners />
              {FAQS.map((f) => (
                <FAQItem
                  key={f.q}
                  q={f.q}
                  a={f.a}
                  defaultOpen={f === FAQS[0]}
                />
              ))}
            </div>
          </FadeInView>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section
        id="ship_it"
        className="rl-landing-section"
        style={{
          width: "100%",
          borderTop: "1px dashed var(--border)",
          position: "relative",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        {/* Ambient pulsing glow */}
        <motion.div
          animate={{ opacity: [0.04, 0.1, 0.04] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(800px 500px at 50% 100%, rgba(168,230,163,0.18), transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
            position: "relative",
          }}
        >
          {/* Animated big stat */}
          <FadeInView
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8, filter: "blur(12px)" }}
              whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: [0.19, 1, 0.22, 1] }}
              animate={{
                textShadow: [
                  "0 0 24px rgba(168,230,163,0.3)",
                  "0 0 56px rgba(168,230,163,0.6)",
                  "0 0 24px rgba(168,230,163,0.3)",
                ],
              }}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "clamp(64px, 10vw, 96px)",
                fontWeight: 700,
                color: "var(--phos)",
                letterSpacing: "-4px",
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
                display: "inline-block",
              }}
            >
              <AnimatedStat value={87} />
            </motion.span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--fg-3)",
                letterSpacing: "0.2em",
              }}
            >
              avg score after first revision
            </span>
          </FadeInView>

          <FadeInView delay={0.1}>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                color: "var(--fg-1)",
                fontWeight: 500,
                letterSpacing: "-1.5px",
                lineHeight: 1.1,
                margin: 0,
              }}
            >
              your next offer is one
              <br />
              analysis away
              <Cursor />
            </h2>
          </FadeInView>

          <FadeInView delay={0.2}>
            <Link to="/auth">
              <motion.span
                className="rl-btn rl-btn-primary rl-btn-lg"
                style={{
                  fontSize: 16,
                  padding: "16px 32px",
                  display: "inline-flex",
                  position: "relative",
                  overflow: "hidden",
                }}
                whileHover={{ y: -3, scale: 1.04 }}
                whileTap={{ y: 0, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                animate={{
                  boxShadow: [
                    "0 0 18px rgba(168,230,163,0.25), inset 0 -3px 0 rgba(95,165,92,1)",
                    "0 0 36px rgba(168,230,163,0.5), inset 0 -3px 0 rgba(95,165,92,1)",
                    "0 0 18px rgba(168,230,163,0.25), inset 0 -3px 0 rgba(95,165,92,1)",
                  ],
                }}
              >
                $ analyze_my_resume →
              </motion.span>
            </Link>
          </FadeInView>

          <FadeInView delay={0.3}>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--fg-4)",
                margin: 0,
                letterSpacing: "0.08em",
              }}
            >
              no signup · no credit card · pdf stays private
            </p>
          </FadeInView>
        </div>
      </section>

      <div
        style={{
          background: "#ffffff",
          overflow: "hidden",
          margin: "0 0 0px",
          width: "100%",
        }}
        data-aos="fade-up"
        data-aos-duration="700"
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1780 345"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g style={{ mixBlendMode: "multiply" }}>
            <rect
              width="224.495"
              height="220.02"
              rx="110.01"
              transform="matrix(-1 0 0 1 530.492 62.3984)"
              fill="#E261E5"
            />
          </g>
          <g style={{ mixBlendMode: "multiply" }}>
            <rect
              width="371.11"
              height="220.02"
              rx="110.01"
              transform="matrix(-1 0 0 1 1328.45 62.3984)"
              fill="#59E25D"
            />
          </g>
          <g style={{ mixBlendMode: "multiply" }}>
            <rect
              x="762.008"
              y="54.0938"
              width="235.199"
              height="236.908"
              rx="117.599"
              fill="#3A93FF"
            />
          </g>
          <g style={{ mixBlendMode: "multiply" }}>
            <rect
              x="1624.3"
              y="86.7773"
              width="154.917"
              height="171.543"
              rx="77.4584"
              fill="#59E25D"
            />
          </g>
          <g style={{ mixBlendMode: "multiply" }}>
            <rect
              x="1346.21"
              y="0.953125"
              width="327.882"
              height="343.195"
              rx="163.941"
              fill="#FFE228"
            />
          </g>
          <g style={{ mixBlendMode: "multiply" }}>
            <rect
              x="0.789062"
              y="0.953125"
              width="327.882"
              height="343.195"
              rx="163.941"
              fill="#FFE228"
            />
          </g>
          <g style={{ mixBlendMode: "multiply" }}>
            <rect
              width="450.288"
              height="236.907"
              rx="118.454"
              transform="matrix(-1 0 0 1 893.008 54.0938)"
              fill="#FFE228"
            />
          </g>
          <g style={{ mixBlendMode: "multiply" }}>
            <rect
              width="167.631"
              height="236.907"
              rx="83.8156"
              transform="matrix(-1 0 0 1 1425.18 54.0938)"
              fill="#E261E5"
            />
          </g>
        </svg>
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
