import { type CSSProperties, type ReactNode } from "react";

// ── Logo ─────────────────────────────────────────────────────────────
export const Logo = ({ size = 16 }: { size?: number }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      fontFamily: "var(--font-mono)",
      fontSize: size,
      fontWeight: 500,
      color: "var(--fg-1)",
      letterSpacing: "0.04em",
      textDecoration: "none",
    }}
  >
    <span
      style={{
        width: size + 6,
        height: size + 6,
        background: "var(--phos)",
        color: "var(--bg)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.75,
        fontWeight: 700,
        boxShadow: "0 0 12px var(--phos-glow)",
        flexShrink: 0,
      }}
    >
      R
    </span>
    <span>
      resumelens<span style={{ color: "var(--phos)" }}>_</span>
    </span>
  </span>
);

// ── Corners ───────────────────────────────────────────────────────────
export const Corners = () => (
  <>
    <span className="rl-corner tl" />
    <span className="rl-corner tr" />
    <span className="rl-corner bl" />
    <span className="rl-corner br" />
  </>
);

// ── Cursor ────────────────────────────────────────────────────────────
export const Cursor = () => <span className="rl-cursor" />;

// ── Dot ──────────────────────────────────────────────────────────────
export const Dot = ({ style }: { style?: CSSProperties }) => (
  <span className="rl-dot" style={style} />
);

// ── Button ────────────────────────────────────────────────────────────
type BtnVariant = "primary" | "secondary" | "copper" | "ghost";
type BtnSize = "md" | "lg";

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
  const cls = [
    "rl-btn",
    `rl-btn-${variant}`,
    size === "lg" ? "rl-btn-lg" : "",
    block ? "rl-btn-block" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={cls}
      disabled={disabled}
      onClick={onClick}
      style={{
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
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
    {label && <label style={{ display: "block" }}>// {label}</label>}
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
    {label && <label style={{ display: "block" }}>// {label}</label>}
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
  <label>// {children}</label>
);

// ── Eyebrow ───────────────────────────────────────────────────────────
export const Eyebrow = ({
  mode = "comment",
  children,
}: {
  mode?: "prompt" | "comment";
  children: ReactNode;
}) =>
  mode === "prompt" ? (
    <span className="rl-eyebrow-prompt">{children}</span>
  ) : (
    <span className="rl-eyebrow">// {children}</span>
  );

// ── Comment ───────────────────────────────────────────────────────────
export const Comment = ({ children }: { children: ReactNode }) => (
  <span className="rl-comment">{children}</span>
);

// ── StatusPill ────────────────────────────────────────────────────────
type PillTier = "good" | "warn" | "bad" | "neutral";

export const StatusPill = ({
  tier = "neutral",
  children,
  style,
}: {
  tier?: PillTier;
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <span className={`rl-pill rl-pill-${tier}`} style={style}>
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

// ── ScoreNumber ───────────────────────────────────────────────────────
function scoreTierColor(s: number) {
  return s > 69 ? "var(--phos)" : s > 49 ? "var(--copper-hi)" : "var(--ember)";
}

export const ScoreNumber = ({ score }: { score: number }) => {
  const color = scoreTierColor(score);
  return (
    <span
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: 88,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: "-4px",
        color,
        fontVariantNumeric: "tabular-nums",
        textShadow: `0 0 22px ${color}55`,
      }}
    >
      {score}
      <span style={{ fontSize: 22, color: "var(--fg-3)", letterSpacing: 0 }}>
        /100
      </span>
    </span>
  );
};

// ── ScoreCircle (SVG animated ring) ──────────────────────────────────
export const ScoreCircle = ({
  score,
  size = 80,
}: {
  score: number;
  size?: number;
}) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreTierColor(score);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "block", flexShrink: 0 }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--border)"
        strokeWidth={4}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={4}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{
          filter: `drop-shadow(0 0 6px ${color}88)`,
          transition: "stroke-dashoffset 1200ms cubic-bezier(0.16,1,0.3,1)",
        }}
      />
      <text
        x={size / 2}
        y={size / 2 - 4}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={color}
        fontFamily="var(--font-mono)"
        fontWeight={700}
        fontSize={size * 0.22}
        fontVariantNumeric="tabular-nums"
      >
        {score}
      </text>
      <text
        x={size / 2}
        y={size / 2 + size * 0.18}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--fg-3)"
        fontFamily="var(--font-mono)"
        fontSize={size * 0.11}
        letterSpacing="0.1em"
      >
        OF 100
      </text>
    </svg>
  );
};

// ── ScoreBar ──────────────────────────────────────────────────────────
export const ScoreBar = ({
  score,
  cells = 28,
}: {
  score: number;
  cells?: number;
}) => {
  const filled = Math.round((score / 100) * cells);
  const color = scoreTierColor(score);
  return (
    <span className="rl-bar">
      <span style={{ color }}>{"█".repeat(filled)}</span>
      <span style={{ color: "var(--fg-4)" }}>{"░".repeat(cells - filled)}</span>
    </span>
  );
};

// ── ScoreBars ─────────────────────────────────────────────────────────
const DIMS: { key: string; label: string }[] = [
  { key: "ATS", label: "ats" },
  { key: "toneAndStyle", label: "tone_style" },
  { key: "content", label: "content" },
  { key: "structure", label: "structure" },
  { key: "skills", label: "skills" },
];

export const ScoreBars = ({
  feedback,
}: {
  feedback: Record<string, { score: number }>;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    {DIMS.map(({ key, label }) => {
      const score = feedback[key]?.score ?? 0;
      return (
        <div
          key={key}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 11,
            fontFamily: "var(--font-mono)",
          }}
        >
          <span
            style={{
              width: 72,
              color: "var(--fg-3)",
              letterSpacing: "0.05em",
              flexShrink: 0,
            }}
          >
            {label}
          </span>
          <ScoreBar score={score} cells={20} />
          <span
            style={{
              width: 24,
              textAlign: "right",
              color: scoreTierColor(score),
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
      padding: "6px 0",
      borderBottom: "1px dashed var(--border)",
      fontFamily: "var(--font-mono)",
      fontSize: 12,
    }}
  >
    <span style={{ color: "var(--fg-4)", width: 20, flexShrink: 0 }}>
      {String(index + 1).padStart(2, "0")}
    </span>
    <span style={{ color: found ? "var(--phos)" : "var(--ember)", width: 12 }}>
      {found ? "+" : "−"}
    </span>
    <span style={{ color: "var(--fg-1)", flex: 1 }}>{keyword}</span>
    {note && (
      <span style={{ color: "var(--fg-3)", fontSize: 11 }}>// {note}</span>
    )}
  </div>
);

// ── FeatureChip ───────────────────────────────────────────────────────
export const FeatureChip = ({ tag, label }: { tag: string; label: string }) => (
  <span className="rl-chip">
    <span style={{ color: "var(--copper)" }}>[{tag}]</span>
    <span>{label}</span>
  </span>
);
