import type { Variants } from "framer-motion";

// ── Spring presets ──────────────────────────────────────────────────────
export const springs = {
  // Snappy — buttons, micro-interactions
  snappy: { type: "spring", stiffness: 600, damping: 40, mass: 0.5 },
  // Smooth — cards, reveals
  smooth: { type: "spring", stiffness: 260, damping: 30, mass: 0.7 },
  // Gentle — page-level motion
  gentle: { type: "spring", stiffness: 140, damping: 26, mass: 0.9 },
  // Elastic — pop-ins (score chips, done cards)
  elastic: { type: "spring", stiffness: 420, damping: 22, mass: 0.6 },
} as const;

// ── Easing curves ──────────────────────────────────────────────────────
export const easings = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
  snap: [0.2, 0.9, 0.3, 1.15] as const,
} as const;

// ── Reusable variants ──────────────────────────────────────────────────
// Crisp and mechanical: translate + fade only, no blur or scale drift.

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easings.out },
  },
};

// Scroll reveal variants — matches the landing's translateY(36px) reveal
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easings.out },
  },
};

export const revealLeft: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: easings.out },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.35, ease: easings.out },
  },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: 32 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: easings.out },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...springs.smooth },
  },
};

// Pop-in — the signature scale(.5)→1 entrance for chips and result cards
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { ...springs.elastic },
  },
};

// ── Stagger container ──────────────────────────────────────────────────
export const staggerContainer = (
  staggerChildren = 0.08,
  delayChildren = 0,
): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren, delayChildren },
  },
});

// ── Hero entrance — staged sequence ───────────────────────────────────
export const heroSequence: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.09,
      duration: 0.55,
      ease: easings.out,
    },
  }),
};

// ── Card hover — hard offset lift (shadow handled in CSS) ─────────────
export const cardHover = {
  rest: { x: 0, y: 0 },
  hover: {
    x: -2,
    y: -2,
    transition: { duration: 0.15, ease: "easeOut" },
  },
};

// ── Button press ───────────────────────────────────────────────────────
export const buttonPress = {
  rest: { x: 0, y: 0 },
  hover: { x: -2, y: -2, transition: { duration: 0.15, ease: "easeOut" } },
  tap: { x: 0, y: 0, transition: { duration: 0.1, ease: "easeOut" } },
};
