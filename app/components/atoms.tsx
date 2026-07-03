import { type CSSProperties, type ReactNode, useRef } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useCountUp } from "~/hooks/useCountUp";
import { springs, easings } from "~/lib/motion";

// ── Pixel logo mark ──────────────────────────────────────────────────
export const LogoMark = ({
  size = 19,
  color = "var(--ink)",
}: {
  size?: number;
  color?: string;
}) => (
  <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true">
    <rect x="0" y="0" width="6" height="6" fill={color} />
    <rect x="7" y="0" width="6" height="6" fill={color} />
    <rect x="0" y="7" width="6" height="6" fill={color} />
    <rect x="14" y="7" width="6" height="6" fill={color} />
    <rect x="7" y="14" width="6" height="6" fill={color} />
    <rect x="14" y="14" width="6" height="6" fill={color} />
  </svg>
);

// ── Logo ─────────────────────────────────────────────────────────────
export const Logo = ({
  size = 16,
  color = "var(--ink)",
}: {
  size?: number;
  color?: string;
}) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 9,
      fontFamily: "var(--font-sans)",
      fontSize: size,
      fontWeight: 900,
      color,
      letterSpacing: "-0.01em",
      textDecoration: "none",
    }}
  >
    <LogoMark size={size + 3} color={color} />
    <span>ResumeLens</span>
  </span>
);

// ── PixelSprite — floating decorative cluster ────────────────────────
export const PixelSprite = ({
  style,
  size = 44,
  float = true,
}: {
  style?: CSSProperties;
  size?: number;
  float?: boolean;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 44 44"
    aria-hidden="true"
    className={float ? "pix-float" : undefined}
    style={style}
  >
    <rect x="0" y="14" width="14" height="14" fill="var(--lime)" />
    <rect x="15" y="0" width="13" height="13" fill="var(--violet)" />
    <rect
      x="30"
      y="14"
      width="14"
      height="14"
      fill="var(--ink)"
      className="pix-blink"
    />
    <rect x="15" y="29" width="13" height="13" fill="var(--ink)" />
  </svg>
);

// ── Dot — small bordered square accent ───────────────────────────────
export const Dot = ({ style }: { style?: CSSProperties }) => (
  <span
    style={{
      display: "inline-block",
      width: 9,
      height: 9,
      background: "var(--cyan)",
      border: "var(--bw) solid var(--ink)",
      borderRadius: 2,
      flexShrink: 0,
      ...style,
    }}
  />
);

// ── Button ────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "copper" | "ghost";
type BtnSize = "md" | "lg";

const BTN_CLASS: Record<BtnVariant, string> = {
  primary: "btn--primary",
  secondary: "btn--outline",
  copper: "btn--lime",
  ghost: "btn--surface",
};

export const Button = ({
  variant = "primary",
  size = "md",
  block = false,
  disabled = false,
  onClick,
  children,
  style,
  type = "button",
}: {
  variant?: BtnVariant;
  size?: BtnSize;
  block?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
  style?: CSSProperties;
  type?: "button" | "submit" | "reset";
}) => {
  const cls = ["btn", BTN_CLASS[variant], size === "lg" ? "btn--lg" : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: block ? "100%" : undefined,
        ...style,
      }}
    >
      {children}
    </button>
  );
};

// ── Input ─────────────────────────────────────────────────────────────
export const Input = ({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  style,
}: {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  type?: string;
  style?: CSSProperties;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <label style={{ display: "block" }}>{label}</label>}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      style={style}
    />
  </div>
);

// ── Textarea ──────────────────────────────────────────────────────────
export const Textarea = ({
  label,
  placeholder,
  value,
  onChange,
  style,
}: {
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (v: string) => void;
  style?: CSSProperties;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {label && <label style={{ display: "block" }}>{label}</label>}
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      style={style}
    />
  </div>
);

// ── Label ─────────────────────────────────────────────────────────────
export const Label = ({ children }: { children: ReactNode }) => (
  <label>{children}</label>
);

// ── Eyebrow — mono microlabel, optional // prefix ─────────────────────
export const Eyebrow = ({
  mode = "comment",
  children,
}: {
  mode?: "prompt" | "comment";
  children: ReactNode;
}) => (
  <span className="eyebrow">
    {mode === "comment" ? <>{"// "}</> : null}
    {children}
  </span>
);

// ── Comment — muted supporting mono text ─────────────────────────────
export const Comment = ({ children }: { children: ReactNode }) => (
  <span className="mono-stamp">{children}</span>
);

// ── StatusPill ────────────────────────────────────────────────────────
type PillTier = "good" | "warn" | "bad" | "neutral";

const PILL_BG: Record<PillTier, string> = {
  good: "var(--lime)",
  warn: "var(--amber)",
  bad: "var(--red)",
  neutral: "var(--fill-2)",
};

export const StatusPill = ({
  tier = "neutral",
  children,
  style,
}: {
  tier?: PillTier;
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <span
    className="chip"
    style={{
      background: PILL_BG[tier],
      color: tier === "bad" ? "#fff" : "var(--ink)",
      ...style,
    }}
  >
    {children}
  </span>
);

// ── Tag ───────────────────────────────────────────────────────────────
export const Tag = ({
  tier = "neutral",
  children,
}: {
  tier?: PillTier;
  children: ReactNode;
}) => <StatusPill tier={tier}>{children}</StatusPill>;

// ── Score helpers ─────────────────────────────────────────────────────
export function scoreTier(s: number): PillTier {
  return s > 69 ? "good" : s > 49 ? "warn" : "bad";
}

// ── ScoreNumber ───────────────────────────────────────────────────────
export const ScoreNumber = ({ score }: { score: number }) => (
  <span
    style={{
      fontFamily: "var(--font-sans)",
      fontSize: 88,
      fontWeight: 900,
      lineHeight: 1,
      letterSpacing: "-0.04em",
      color: "var(--ink)",
      fontVariantNumeric: "tabular-nums",
    }}
  >
    {score}
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 20,
        fontWeight: 600,
        color: "var(--fg-2)",
        letterSpacing: 0,
      }}
    >
      /100
    </span>
  </span>
);

// ── ScoreCircle — flat conic-style ring, ink on translucent track ────
export const ScoreCircle = ({
  score,
  size = 80,
  ringColor = "var(--ink)",
  trackColor = "rgba(11,11,11,0.14)",
  textColor = "var(--ink)",
}: {
  score: number;
  size?: number;
  ringColor?: string;
  trackColor?: string;
  textColor?: string;
}) => {
  const stroke = Math.max(6, Math.round(size * 0.11));
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", flexShrink: 0 }}
      role="img"
      aria-label={`Score ${score} of 100`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={trackColor}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={ringColor}
        strokeWidth={stroke}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          transition: "stroke-dashoffset 1200ms cubic-bezier(0.16,1,0.3,1)",
        }}
      />
      <text
        x={size / 2}
        y={size / 2 - size * 0.02}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textColor}
        fontFamily="var(--font-sans)"
        fontWeight={900}
        fontSize={size * 0.3}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {score}
      </text>
      <text
        x={size / 2}
        y={size / 2 + size * 0.2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textColor}
        opacity={0.7}
        fontFamily="var(--font-mono)"
        fontSize={Math.max(8, size * 0.09)}
        letterSpacing="0.1em"
      >
        SCORE
      </text>
    </svg>
  );
};

// ── ScoreBar — bordered fill bar ──────────────────────────────────────
export const ScoreBar = ({
  score,
  style,
}: {
  score: number;
  cells?: number;
  style?: CSSProperties;
}) => (
  <span
    className="score-bar"
    style={{ display: "block", width: "100%", ...style }}
  >
    <span
      className="score-bar__fill"
      style={{ display: "block", width: `${score}%` }}
    />
  </span>
);

// ── ScoreBars ─────────────────────────────────────────────────────────
const DIMS: { key: string; label: string }[] = [
  { key: "ATS", label: "ATS" },
  { key: "toneAndStyle", label: "Tone & style" },
  { key: "content", label: "Content" },
  { key: "structure", label: "Structure" },
  { key: "skills", label: "Skills" },
];

export const ScoreBars = ({
  feedback,
}: {
  feedback: Record<string, { score: number }>;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    {DIMS.map(({ key, label }) => {
      const score = feedback[key]?.score ?? 0;
      return (
        <div
          key={key}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 12,
          }}
        >
          <span
            style={{
              width: 84,
              fontWeight: 700,
              color: "var(--fg-2)",
              flexShrink: 0,
            }}
          >
            {label}
          </span>
          <ScoreBar score={score} style={{ flex: 1 }} />
          <span
            style={{
              width: 26,
              textAlign: "right",
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {score}
          </span>
        </div>
      );
    })}
  </div>
);

// ── KeywordRow ────────────────────────────────────────────────────────
export const KeywordRow = ({
  index,
  keyword,
  found,
  note,
}: {
  index: number;
  keyword: string;
  found: boolean;
  note?: string;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 0",
      borderBottom: "1px dashed var(--line)",
      fontSize: 13,
    }}
  >
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        color: "var(--fg-3)",
        width: 20,
        flexShrink: 0,
      }}
    >
      {String(index + 1).padStart(2, "0")}
    </span>
    <span
      aria-hidden="true"
      style={{
        width: 16,
        height: 16,
        borderRadius: 4,
        border: "var(--bw) solid var(--ink)",
        background: found ? "var(--lime)" : "#fff",
        color: found ? "var(--ink)" : "var(--red)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      {found ? "✓" : "✗"}
    </span>
    <span style={{ fontWeight: 700, flex: 1 }}>{keyword}</span>
    {note && (
      <span style={{ color: "var(--fg-2)", fontSize: 12, fontWeight: 500 }}>
        {note}
      </span>
    )}
  </div>
);

// ── FeatureChip ───────────────────────────────────────────────────────
export const FeatureChip = ({ tag, label }: { tag: string; label: string }) => (
  <span className="chip">
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        color: "var(--fg-2)",
      }}
    >
      {tag.toUpperCase()}
    </span>
    <span>{label}</span>
  </span>
);

// ── AnimatedScoreNumber — counts up from 0 on mount ───────────────────
export const AnimatedScoreNumber = ({
  score,
  enabled = true,
}: {
  score: number;
  enabled?: boolean;
}) => {
  const reduced = useReducedMotion();
  const display = useCountUp(score, 1200, enabled && !reduced);

  return (
    <span
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: 88,
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: "-0.04em",
        color: "var(--ink)",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {reduced ? score : display}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 20,
          fontWeight: 600,
          color: "var(--fg-2)",
          letterSpacing: 0,
        }}
      >
        /100
      </span>
    </span>
  );
};

// ── AnimatedScoreCircle — ring draws in + number counts up ───────────
export const AnimatedScoreCircle = ({
  score,
  size = 80,
  animate = true,
  ringColor = "var(--ink)",
  trackColor = "rgba(11,11,11,0.14)",
  textColor = "var(--ink)",
}: {
  score: number;
  size?: number;
  animate?: boolean;
  ringColor?: string;
  trackColor?: string;
  textColor?: string;
}) => {
  const reduced = useReducedMotion();
  const stroke = Math.max(6, Math.round(size * 0.11));
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const display = useCountUp(score, 1100, animate && !reduced);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", flexShrink: 0 }}
      role="img"
      aria-label={`Score ${score} of 100`}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={trackColor}
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={ringColor}
        strokeWidth={stroke}
        strokeDasharray={circ}
        initial={{ strokeDashoffset: reduced ? offset : circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: easings.out, delay: 0.2 }}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x={size / 2}
        y={size / 2 - size * 0.02}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textColor}
        fontFamily="var(--font-sans)"
        fontWeight={900}
        fontSize={size * 0.3}
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {reduced ? score : display}
      </text>
      <text
        x={size / 2}
        y={size / 2 + size * 0.2}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={textColor}
        opacity={0.7}
        fontFamily="var(--font-mono)"
        fontSize={Math.max(8, size * 0.09)}
        letterSpacing="0.1em"
      >
        SCORE
      </text>
    </svg>
  );
};

// ── FadeInView — scroll-triggered reveal (framer-motion) ──────────────
const VIEW_VARIANTS: Record<string, Variants> = {
  "fade-up": { hidden: { opacity: 0, y: 36 }, visible: { opacity: 1, y: 0 } },
  "fade-down": {
    hidden: { opacity: 0, y: -24 },
    visible: { opacity: 1, y: 0 },
  },
  "fade-left": {
    hidden: { opacity: 0, x: 28 },
    visible: { opacity: 1, x: 0 },
  },
  "fade-right": {
    hidden: { opacity: 0, x: -28 },
    visible: { opacity: 1, x: 0 },
  },
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  "zoom-in": {
    hidden: { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1 },
  },
};

export const FadeInView = ({
  children,
  delay = 0,
  className,
  style,
  animation = "fade-up",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  animation?: string;
}) => {
  const variants = VIEW_VARIANTS[animation] ?? VIEW_VARIANTS["fade-up"];
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-60px" }}
      variants={variants}
      transition={{ duration: 0.5, ease: easings.out, delay }}
    >
      {children}
    </motion.div>
  );
};

// ── MagneticButton — primary CTA with magnetic hover pull ────────────
export const MagneticButton = ({
  children,
  className,
  style,
  onClick,
  href,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
  href?: string;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const handleMouseMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.18;
    const dy = (e.clientY - cy) * 0.18;
    ref.current.style.transform = `translate(${dx}px, ${dy}px)`;
  };

  const handleMouseLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform = "translate(0px, 0px)";
  };

  const Tag = href ? "a" : "div";

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        display: "inline-block",
        transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <motion.div
        whileTap={reduced ? {} : { scale: 0.97 }}
        transition={springs.snappy}
      >
        <Tag className={className} style={style} onClick={onClick} href={href}>
          {children}
        </Tag>
      </motion.div>
    </div>
  );
};
