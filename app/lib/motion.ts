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
