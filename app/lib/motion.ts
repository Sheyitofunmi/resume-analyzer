import type { Variants } from "framer-motion";

// ── Spring presets ──────────────────────────────────────────────────────
export const springs = {
  // Snappy — buttons, micro-interactions
  snappy: { type: "spring", stiffness: 600, damping: 40, mass: 0.5 },
  // Smooth — cards, reveals
  smooth: { type: "spring", stiffness: 200, damping: 30, mass: 0.8 },
  // Gentle — page-level motion
  gentle: { type: "spring", stiffness: 100, damping: 24, mass: 1 },
  // Elastic — playful
  elastic: { type: "spring", stiffness: 400, damping: 20, mass: 0.6 },
} as const;

// ── Easing curves ──────────────────────────────────────────────────────
export const easings = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.4, 0, 0.2, 1] as const,
  expo: [0.19, 1, 0.22, 1] as const,
} as const;

// ── Reusable variants ──────────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: easings.expo },
  },
};

// Scroll reveal variants — no blur, lighter than fadeUp, for below-fold content
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easings.expo },
  },
};

export const revealLeft: Variants = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: easings.expo },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: easings.out },
  },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: 32, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: easings.expo },
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
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: i * 0.1,
      duration: 0.8,
      ease: easings.expo,
    },
  }),
};

// ── Card hover ─────────────────────────────────────────────────────────
export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.015,
    y: -3,
    transition: springs.snappy,
  },
};

// ── Button press ───────────────────────────────────────────────────────
export const buttonPress = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -2, transition: springs.snappy },
  tap: { scale: 0.96, y: 0, transition: springs.snappy },
};
