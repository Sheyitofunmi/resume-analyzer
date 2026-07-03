import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import {
  ChevronDown,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useSpring, animated } from "@react-spring/web";
import Footer from "~/components/Footer";
import MobileBottomNav from "~/components/MobileBottomNav";
import PricingTiers from "~/components/PricingTiers";
import { Corners, Cursor, FadeInView } from "~/components/atoms";
import { usePuterStore } from "~/lib/puter";
import {
  springs,
  staggerContainer,
  fadeUp,
  revealUp,
  revealLeft,
} from "~/lib/motion";

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

type FeatureColor = { bg: string; text: string };

// ── Feature cards ──────────────────────────────────────────────────────
const FEATURES: {
  tag: string;
  title: string;
  desc: string;
  viz: (c: FeatureColor) => React.ReactNode;
}[] = [
  {
    tag: "ATS",
    title: "Beat the bot, reach the human",
    desc: "We diff against the exact parser engines recruiters use. Know in seconds if your PDF even clears the first filter.",
    viz: (c) => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 8,
        }}
      >
        {[
          { label: "keyword density", val: 82 },
          { label: "format score", val: 71 },
          { label: "section match", val: 55 },
        ].map(({ label, val }) => (
          <div key={label}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: `${c.text}99`,
              }}
            >
              <span>{label}</span>
              <span style={{ color: c.text, fontWeight: 600 }}>{val}%</span>
            </div>
            <div
              style={{
                height: 7,
                borderRadius: 4,
                background: `${c.text}2e`,
              }}
            >
              <div
                style={{
                  width: `${val}%`,
                  height: "100%",
                  borderRadius: 4,
                  background: `${c.text}e6`,
                }}
              />
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 20,
              background: `${c.text}33`,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: c.text,
            }}
          >
            ✓ passes ATS
          </span>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 20,
              background: `${c.text}1a`,
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: `${c.text}8c`,
            }}
          >
            87 / 100
          </span>
        </div>
      </div>
    ),
  },
  {
    tag: "KW",
    title: "Never miss a keyword again",
    desc: "Every signal in the JD ranked by frequency and placement. Copy-paste the missing ones directly into your draft.",
    viz: (c) => (
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
              background: k.ok ? `${c.text}2e` : `${c.text}12`,
              border: `1px solid ${k.ok ? `${c.text}59` : `${c.text}26`}`,
              color: k.ok ? c.text : `${c.text}73`,
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
    viz: (c) => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginTop: 8,
        }}
      >
        <div
          style={{
            padding: "9px 12px",
            background: `${c.text}26`,
            borderRadius: 8,
            border: `1px solid ${c.text}1f`,
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          <span style={{ color: `${c.text}cc`, flexShrink: 0, fontSize: 11 }}>
            ✕
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: `${c.text}73`,
              textDecoration: "line-through",
              lineHeight: 1.5,
            }}
          >
            Helped improve the website performance.
          </span>
        </div>
        <div
          style={{
            padding: "9px 12px",
            background: `${c.text}33`,
            borderRadius: 8,
            border: `1px solid ${c.text}59`,
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          <span style={{ color: c.text, flexShrink: 0, fontSize: 11 }}>✓</span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: c.text,
              lineHeight: 1.5,
            }}
          >
            Cut page-load p95 by 200 ms, lifting conversion 8%.
          </span>
        </div>
      </div>
    ),
  },
  {
    tag: "IV",
    title: "Walk into interviews fully prepared",
    desc: "Behavioral + technical questions tailored to the JD and your seniority. Each with a structured confidence rubric.",
    viz: (c) => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginTop: 8,
        }}
      >
        {[
          "Tell me about a high-stakes migration you led.",
          "Walk me through your system design approach.",
          "What was your most ambiguous project?",
        ].map((q, i) => (
          <div
            key={i}
            style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: `${c.text}4d`,
                flexShrink: 0,
                marginTop: 1,
                fontWeight: 700,
                letterSpacing: "0.05em",
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: `${c.text}b8`,
                lineHeight: 1.5,
              }}
            >
              {q}
            </span>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "TS",
    title: "Sound sharp, not safe",
    desc: "Action-verb density, hedging language, sentence variety — all scored and flagged with line-level fixes you can apply immediately.",
    viz: (c) => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginTop: 8,
        }}
      >
        {[
          { label: "action verbs", pct: 72, good: true },
          { label: "hedging words", pct: 38, good: false },
          { label: "sent. variety", pct: 65, good: true },
        ].map(({ label, pct, good }) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "center", gap: 8 }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: `${c.text}99`,
                width: 90,
                flexShrink: 0,
              }}
            >
              {label}
            </span>
            <div
              style={{
                flex: 1,
                height: 6,
                borderRadius: 3,
                background: `${c.text}2e`,
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: "100%",
                  borderRadius: 3,
                  background: good ? `${c.text}d9` : `${c.text}59`,
                }}
              />
            </div>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: good ? c.text : `${c.text}99`,
                width: 28,
                textAlign: "right",
                fontVariantNumeric: "tabular-nums",
                fontWeight: 600,
              }}
            >
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
    viz: (c) => (
      <div style={{ marginTop: 8 }}>
        <svg
          width="100%"
          height={56}
          viewBox="0 0 220 56"
          style={{ overflow: "visible" }}
        >
          <defs>
            <linearGradient id="hxGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={`${c.text}40`} />
              <stop offset="100%" stopColor={`${c.text}00`} />
            </linearGradient>
          </defs>
          <path
            d="M0,50 C30,48 50,42 80,34 C110,26 130,18 160,10 C185,4 200,2 220,1"
            fill="none"
            stroke={`${c.text}bf`}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M0,50 C30,48 50,42 80,34 C110,26 130,18 160,10 C185,4 200,2 220,1 L220,56 L0,56 Z"
            fill="url(#hxGrad)"
          />
          {[
            { x: 0, y: 50, s: 48 },
            { x: 80, y: 34, s: 67 },
            { x: 160, y: 10, s: 84 },
            { x: 220, y: 1, s: 91 },
          ].map(({ x, y, s }) => (
            <g key={x}>
              <circle cx={x} cy={y} r={3.5} fill={`${c.text}d9`} />
              <text
                x={x}
                y={y - 7}
                textAnchor="middle"
                fontFamily="var(--font-mono)"
                fontSize={8}
                fill={`${c.text}8c`}
              >
                {s}
              </text>
            </g>
          ))}
        </svg>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 2,
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: `${c.text}61`,
          }}
        >
          <span>v1</span>
          <span>v2</span>
          <span>v3</span>
          <span>v4 →</span>
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
      <span>✓ live · free to start</span>
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

  return (
    <section
      id="features"
      style={{
        background: "var(--parchment)",
        width: "100%",
        boxSizing: "border-box",
      }}
      className="rl-features-section"
    >
      <div className="rl-features-container">
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--parchment-fg-3)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            // features
          </span>
          <h2
            style={{
              fontSize: "clamp(26px, 5vw, 48px)",
              color: "var(--parchment-fg-1)",
              fontWeight: 500,
              letterSpacing: "-1.5px",
              margin: 0,
            }}
          >
            six signals that matter
          </h2>
        </div>

        {/* Main row: card deck + desktop nav */}
        <div className="rl-features-row">
          {/* Z-stack card deck */}
          <div className="rl-features-deck">
            {FEATURES.map((f, i) => {
              const pos = (((i - active) % total) + total) % total;
              if (pos >= 4) return null;
              const isActive = pos === 0;
              const color = FEATURE_COLORS[i];
              return (
                <motion.div
                  key={f.tag}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  animate={{
                    scale: isActive ? 1 : 1 - pos * 0.05,
                    x: isActive ? 0 : pos * 14,
                    y: isActive ? 0 : pos * 8,
                    rotate: isActive ? 0 : pos * 2,
                    opacity: isActive ? 1 : Math.max(0, 1 - pos * 0.25),
                  }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 280, damping: 28 }
                  }
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
                  <div
                    style={{
                      flex: 1,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
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
                      {f.viz(color)}
                    </div>
                  </div>

                  {/* Text bottom */}
                  <div
                    style={{
                      padding:
                        "clamp(10px, 2vw, 16px) clamp(14px, 3vw, 22px) clamp(14px, 3vw, 22px)",
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
                    background: isNav
                      ? FEATURE_COLORS[i].bg + "22"
                      : "transparent",
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
                      boxShadow: isNav
                        ? `0 0 12px ${FEATURE_COLORS[i].bg}`
                        : "none",
                      transition: "box-shadow 220ms",
                    }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 9,
                        color: "var(--parchment-fg-3)",
                        letterSpacing: "0.1em",
                        display: "block",
                      }}
                    >
                      [{f.tag}]
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 12,
                        color: isNav
                          ? "var(--parchment-fg-1)"
                          : "var(--parchment-fg-2)",
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
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 14,
                paddingLeft: 12,
              }}
            >
              {[
                {
                  lbl: "←",
                  fn: () => setActive((v) => (v - 1 + total) % total),
                },
                { lbl: "→", fn: () => setActive((v) => (v + 1) % total) },
              ].map(({ lbl, fn }) => (
                <button
                  key={lbl}
                  type="button"
                  onClick={fn}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: "1.5px solid var(--parchment-border)",
                    background: "var(--parchment-2)",
                    cursor: "pointer",
                    fontSize: 16,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--parchment-fg-2)",
                  }}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </nav>
        </div>

        {/* Bottom controls — progress dots + mobile prev/next */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}
        >
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
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  border: "1.5px solid var(--parchment-border)",
                  background: "var(--parchment-2)",
                  cursor: "pointer",
                  fontSize: 18,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--parchment-fg-2)",
                }}
              >
                {lbl}
              </button>
            ))}
          </div>

          {/* Interaction hint */}
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              color: "var(--parchment-fg-3)",
              letterSpacing: "0.1em",
              opacity: 0.6,
            }}
          >
            click cards or use ← → to explore
          </span>

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
        {["features", "how_it_works", "testimonials", "faq", "pricing"].map(
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
              $ analyze_resume →
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

// ── Gauge (reusable semicircular tick gauge) ─────────────────────────
function Gauge({
  value,
  color = "#ef4d23",
  showLabels = false,
  min,
  max,
}: {
  value: number;
  color?: string;
  showLabels?: boolean;
  min?: string;
  max?: string;
}) {
  const TICKS = 40;
  const active = Math.round((value / 100) * TICKS);
  const cx = 100;
  const cy = 100;
  const rOuter = 80;
  const rInner = rOuter - 10;

  return (
    <div className="w-full max-w-[260px] mx-auto">
      <svg viewBox="0 0 200 120" className="w-full">
        {Array.from({ length: TICKS }).map((_, i) => {
          // sweep across a 180° arc from π → 2π (left → right, over the top)
          const angle = Math.PI + (i / (TICKS - 1)) * Math.PI;
          const x1 = cx + rInner * Math.cos(angle);
          const y1 = cy + rInner * Math.sin(angle);
          const x2 = cx + rOuter * Math.cos(angle);
          const y2 = cy + rOuter * Math.sin(angle);
          const isActive = i < active;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isActive ? color : "#d4d4d8"}
              strokeWidth={2.5}
              strokeLinecap="round"
            />
          );
        })}
        <text
          x={cx}
          y={105}
          textAnchor="middle"
          fontSize={22}
          fontWeight={600}
          fill="#0b0f1a"
        >
          {value}%
        </text>
      </svg>
      {showLabels && (
        <div className="flex justify-between text-[11px] text-neutral-500 px-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

// ── ConvixHero — full-viewport video hero (adapted for resumelens) ────
function ConvixHero() {
  const { auth } = usePuterStore();
  const ctaTo = auth.isAuthenticated ? "/" : "/auth";

  return (
    <section
      className="min-h-screen w-full bg-[#ededed] p-3 sm:p-4"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <div className="relative w-full h-[calc(100vh-24px)] sm:h-[calc(100vh-32px)] overflow-hidden bg-[#d9d9d9] rounded-2xl sm:rounded-3xl">
        {/* Background video */}
        <video
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disableRemotePlayback
          webkit-playsinline="true"
          x5-playsinline="true"
          poster="https://images.unsplash.com/photo-1557683316-973673baf926?w=1600&q=60"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260424_064411_9e9d7f84-9277-41f4-ab10-59172d89e6be.mp4"
            type="video/mp4"
          />
        </video>
        {/* Lighten overlay */}
        <div className="absolute inset-0 bg-white/10" />

        {/* Foreground */}
        <div className="relative z-10 flex flex-col items-center px-4 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center">
          {/* Badge */}
          <span className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-1.5 shadow-sm text-[13px] text-neutral-800">
            <span className="w-2 h-2 rounded-full bg-[#ef4d23]" />
            ResumeLens
          </span>

          {/* Headline */}
          <h1
            className="mt-5 sm:mt-6 max-w-4xl text-[#0b0f1a]"
            style={{
              fontSize: "clamp(36px, 8vw, 72px)",
              lineHeight: 1.05,
              fontWeight: 500,
              letterSpacing: "-0.02em",
            }}
          >
            Scoring{" "}
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                fontWeight: 400,
              }}
            >
              Resumes
            </span>
            <br />
            that get hired
          </h1>

          {/* Subtitle */}
          <p
            className="mt-4 sm:mt-6 text-neutral-700 px-2 max-w-xl"
            style={{ fontSize: "clamp(13px, 3.5vw, 16px)" }}
          >
            The AI-powered resume reviewer that scores you against any job
            description — in seconds.
          </p>

          {/* CTA */}
          <Link
            to={ctaTo}
            className="mt-6 sm:mt-8 inline-flex items-center gap-3 bg-[#0b0f1a] text-white rounded-full pl-6 sm:pl-7 pr-2 py-2 sm:py-2.5 text-[14px] hover:bg-black transition-colors"
          >
            Analyze my resume
            <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/15 inline-flex items-center justify-center">
              <ChevronRight className="w-4 h-4" />
            </span>
          </Link>

          {/* Dashboard preview */}
          <div className="px-3 sm:px-4 w-full mt-10 sm:mt-14">
            <div className="bg-[#f5f2ee] rounded-3xl p-4 sm:p-6 w-full max-w-[880px] mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-left">
                {/* Card 1 — ATS Score */}
                <div className="bg-white rounded-2xl p-5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#ef4d23] font-medium">
                      ATS Score
                    </span>
                    <span className="text-neutral-500">This resume</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[28px] font-semibold text-[#0b0f1a] leading-none">
                      87
                    </span>
                    <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 rounded-full px-2 py-0.5 text-[11px]">
                      <TrendingUp className="w-3 h-3" />
                      +12 (16%)
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Compared to last version
                  </p>
                  <p className="text-center text-[12px] text-neutral-600 mt-4 mb-1">
                    Target score reached
                  </p>
                  <Gauge value={92} showLabels min="48" max="100" />
                  <div className="bg-neutral-100 rounded-full p-1 flex mt-4 text-[12px]">
                    <span className="flex-1 text-center bg-white rounded-full shadow-sm py-1.5">
                      ATS
                    </span>
                    <span className="flex-1 text-center text-neutral-500 py-1.5">
                      Keywords
                    </span>
                  </div>
                </div>

                {/* Card 2 — Analysis settings */}
                <div className="bg-white rounded-2xl p-5 flex flex-col gap-3">
                  <div>
                    <label className="text-[12px] text-neutral-700">
                      Score against
                    </label>
                    <button className="mt-1 w-full flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-2 text-[13px] text-neutral-800">
                      Latest version
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    </button>
                  </div>
                  <div>
                    <label className="text-[12px] text-neutral-700">
                      Compare role by
                    </label>
                    <button className="mt-1 w-full flex items-center justify-between border border-neutral-200 rounded-lg px-3 py-2 text-[13px] text-neutral-800">
                      Job description (JD)
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    </button>
                  </div>
                  <div>
                    <label className="text-[12px] text-neutral-700">
                      Target score
                    </label>
                    <div className="mt-1 flex items-center border border-neutral-200 rounded-lg px-3 py-2 text-[13px] text-neutral-800">
                      <span className="text-neutral-400 mr-1">#</span>90
                    </div>
                  </div>
                  <div>
                    <label className="text-[12px] text-neutral-700">
                      Keywords to match
                    </label>
                    <div className="mt-1 flex items-center border border-neutral-200 rounded-lg px-3 py-2 text-[13px] text-neutral-800">
                      <span className="text-neutral-400 mr-1">#</span>24
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-1">
                    <button className="bg-[#ef4d23] text-white rounded-lg px-5 py-2 text-[13px]">
                      Save
                    </button>
                    <button className="text-[13px] text-neutral-600 underline">
                      Cancel
                    </button>
                    <button
                      className="ml-auto text-neutral-400"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Card 3 — Keyword Match */}
                <div className="bg-white rounded-2xl p-5">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#ef4d23] font-medium">
                      Keyword Match
                    </span>
                    <span className="text-neutral-500">today</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[28px] font-semibold text-[#0b0f1a] leading-none">
                      18
                    </span>
                    <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 rounded-full px-2 py-0.5 text-[11px]">
                      <TrendingDown className="w-3 h-3" />6
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Compared to last version
                  </p>
                  <p className="text-center text-[12px] text-neutral-600 mt-4 mb-1">
                    Matched vs. job description
                  </p>
                  <Gauge value={68} color="#9ca3af" />
                  <div className="bg-neutral-100 rounded-full p-1 flex mt-4 text-[12px]">
                    <span className="flex-1 text-center bg-white rounded-full shadow-sm py-1.5">
                      Matched
                    </span>
                    <span className="flex-1 text-center text-neutral-500 py-1.5">
                      Missing
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Landing page ───────────────────────────────────────────────────────
export default function Landing() {
  return (
    <main className="rl-page rl-landing" style={{ paddingBottom: 0 }}>
      <div className="rl-scroll-bar" />
      <LandingNavbar />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <ConvixHero />

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
                variants={revealUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                whileHover={{
                  y: -4,
                  boxShadow: "var(--depth-card-hover)",
                  borderColor: "var(--border-hi)",
                }}
                transition={springs.smooth}
                className="rl-card"
                style={{
                  position: "relative",
                  willChange: "transform",
                  background: "var(--bg-3)",
                  borderColor: "var(--border-hi)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
                  transitionDelay: `${i * 120}ms`,
                }}
              >
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

      {/* ── TESTIMONIALS MARQUEE ─────────────────────────────────── */}
      <section
        id="testimonials"
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
          <span className="rl-eyebrow">// early_access</span>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              color: "var(--fg-1)",
              fontWeight: 500,
              letterSpacing: "-1.5px",
            }}
          >
            from job-seeker to job-shipper
          </h2>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--fg-3)",
              margin: 0,
              letterSpacing: "0.04em",
            }}
          >
            illustrative feedback from early testers
          </p>
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
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
              start free. upgrade when you're ready.
            </h2>
          </FadeInView>
          <FadeInView delay={0.1} style={{ width: "100%" }}>
            <PricingTiers />
          </FadeInView>
        </div>
      </section>
      <Footer />
      <MobileBottomNav />
    </main>
  );
}
