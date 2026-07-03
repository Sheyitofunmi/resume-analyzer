import { type CSSProperties, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";
import { easings } from "~/lib/motion";

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
