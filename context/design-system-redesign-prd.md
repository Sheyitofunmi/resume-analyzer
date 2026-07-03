# PROMPT: Design a brand-new light design system for ResumeLens

You are an expert product designer + senior front-end engineer. I want you to **replace the entire existing design system** of my app with a brand-new one, and then reskin every screen to match. Before writing any code, propose the design direction and get my sign-off. Treat this as a from-scratch visual redesign — the product logic stays, the look completely changes.

---

## 1. Product context (what the app is)

**ResumeLens** (internally "Resumind") is a web app that scores a user's resume against a specific job description using AI, then gives actionable feedback to improve it.

Core user flow:

1. User signs in (via Puter).
2. User uploads a resume (PDF or DOCX) + pastes a target company, job title, and job description.
3. The app runs AI analysis and returns a scored report: overall ATS score, per-dimension scores, keyword match (found vs missing), rewrite suggestions, a resume checklist, and predicted interview questions.
4. User can track score history across multiple resumes/jobs, re-analyze, compare runs, and manage settings.

Target users: job seekers (and a "recruiter" pricing tier). The tone should feel **trustworthy, encouraging, and modern** — this is a career tool people use when they're anxious about a job hunt, so clarity and confidence matter more than novelty.

---

## 2. Tech stack (do not change)

- **React 19** + **React Router v7** (framework mode; file-based routes in `app/routes.ts`).
- **Tailwind CSS v4** (`@tailwindcss/vite`) — the entire design token layer currently lives in `app/app.css` as CSS custom properties on `:root` plus utility classes.
- **framer-motion** for animation (keep — but simplify/retune to match the new system).
- **lucide-react** for icons.
- Auth/storage/AI via **Puter** (`app/lib/puter.ts`) — do NOT touch any Puter, data, or AI logic.
- Other libs present: `@react-spring/web`, `gsap`, `aos`, `driver.js` (product tour), `@mdxeditor/editor`, `react-dropzone`, `zustand`. Prefer to CONSOLIDATE on framer-motion and remove redundant animation libs where reasonable, but flag before deleting.

**Constraint:** This is a purely visual/design-system change. Preserve all existing functionality, routes, data flow, state, and component APIs. If you must change a component's props, call it out first.

---

## 3. What to remove (the current design — "CIPHER")

The app currently uses a **dark "terminal / hacker" aesthetic** I want _completely gone_:

- Dark warm-black backgrounds (`#0b0b0a` etc.), cream text.
- Monospace-everything (JetBrains Mono as the default UI font).
- "Phosphor green / copper / ember" accent palette with glow shadows.
- Terminal affectations: `$ command_style` labels, `snake_case` copy, blinking cursors (`rl-cursor`), ASCII score bars, corner crosshair decorations (`Corners`/`rl-corner`), film grain overlays, Mac-window-chrome dots, `//` code-comment eyebrows, 40px grid background.

Remove **all** of the above — tokens, utility classes, decorative components, and the terminal copy style. The word "CIPHER" and the terminal metaphor should not survive anywhere.

---

## 4. The new design system — direction & constraints

**Constraints (fixed):**

- **Light mode only.** One polished, cohesive light theme. No dark mode, no dark sections, no light/dark zebra mixing.
- **Cover the entire app** — every route and component listed in §6, not just the landing page.
- **Accessible:** WCAG AA contrast minimum, visible focus states, respects `prefers-reduced-motion`, keyboard-navigable.
- **Fully responsive:** mobile-first, works cleanly from ~360px to wide desktop.

**Creative freedom (yours to decide, then propose to me):**

- The overall **aesthetic/personality** is up to you — pick what best fits a modern, trustworthy career tool.
- The **brand palette and typography** are up to you. Propose options with rationale (see §5). Do not assume the old warm/copper identity must carry over.
- Copy tone: replace terminal/`snake_case` copy with clear, human, encouraging microcopy.

---

## 5. Process — propose BEFORE you build

**Step 1 — Design proposal (do this first, in writing, no code yet):**
Present **2–3 distinct design directions**. For each, give:

- A name + one-line personality statement.
- Color palette (with hex values): background/surface scale, text scale, primary accent, semantic colors for the score tiers (good / needs-work / poor — currently green/amber/red), plus success/warning/error.
- Typography: display font + body font (Google Fonts or system), and a type scale.
- Shape language: border radius, shadow/elevation approach, use of borders vs shadows.
- How the resume **score visualization** (the hero metric of this app) would look in this direction.
- A short note on motion personality.

Recommend one. **Wait for my choice** before building.

**Step 2 — Token layer:** Once I pick, rebuild the `:root` token system in `app/app.css` (colors, type scale, spacing, radii, shadows, motion) for the chosen direction, and set up light-only globals. Provide a small "design tokens" reference at the top.

**Step 3 — Component & route reskin:** Reskin everything in §6 to the new system. Keep it systematic — build shared primitives (button, card, input, badge, pill, etc.) first, then apply across screens. Ensure visual consistency (one button system, one card system, one spacing rhythm).

**Step 4 — Cleanup:** Remove dead terminal-era CSS, decorative components, and unused animation libraries. Verify `npm run typecheck` and `npm run build` pass.

---

## 6. Full surface inventory (everything must be redesigned)

**Routes** (`app/routes/`):

- `landing.tsx` — marketing page: hero, how-it-works, features, testimonials, FAQ, pricing, footer.
- `home.tsx` — dashboard: resume grid, empty state, compare panel, score timeline/KPIs, pagination.
- `upload.tsx` — upload form (file dropzone + company/title/JD fields) + multi-step analysis progress.
- `resume.tsx` — the analysis report: split-panel (resume preview + feedback), re-analyze modal.
- `history.tsx` — score history: KPI cards, line chart, per-dimension sparklines, run log.
- `settings.tsx` — settings sections + toggles.
- `pricing.tsx` — pricing tiers.
- `auth.tsx` — sign-in (Puter).
- `onboarding.tsx` — onboarding card.
- `wipe.tsx` — danger-zone data wipe.
- `resume-edit.tsx` — MDX resume editor (note: check if still routed; reskin if used).

**Components** (`app/components/`):
Navbar, Footer, MobileBottomNav, CommandPalette, Toast, atoms.tsx, HowItWorks, StatsStrip, PricingTiers, FileUploader, ResumeCard, Summary, ATS, Details, Accordion, ResumeChecklist, RewriteSuggestions, InterviewQuestions, ScoreCircle, ScoreGauge, ScoreBadge, ScoreCharts, ScoreHistory.

**Global:** `app/app.css` (all tokens + utility classes), `app/root.tsx` (fonts, page transitions), `app/lib/motion.ts` (framer-motion variants).

---

## 7. Deliverables

1. The written design proposal (§5 Step 1).
2. After my pick: the rebuilt token system + reskinned routes/components covering the full inventory in §6.
3. A short migration note listing what was removed, what shared primitives were introduced, and any component API changes.
4. Passing `typecheck` and `build`.

Start with **Step 1 only** — show me the 2–3 directions and your recommendation, and ask me anything you're unsure about before proceeding.
