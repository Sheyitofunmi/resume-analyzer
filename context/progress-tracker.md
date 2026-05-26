# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- UI polish (2026-05-23)

## Current Goal

- Testing and iteration

## Recent Changes

### Feature: DOCX upload support (2026-05-26)

- **`app/lib/docx2img.ts`** _(new)_: Converts `.docx` files to PNG images for AI analysis — uses `mammoth` to render DOCX → HTML, then `html2canvas` to capture a 816px-wide canvas at 1.5x scale matching a standard letter page.
- **`app/components/FileUploader.tsx`**: Added `.docx` MIME type to dropzone `accept`. Format label in file chip is now dynamic. Hint text updated to `// pdf · docx · max 20 MB`.
- **`app/routes/upload.tsx`**: Detects `.docx` extension and routes through `convertDocxToImage`. Saved file uses correct extension. Label and validation message updated to mention both formats.
- **`package.json`**: Added `mammoth` and `html2canvas` dependencies.

### UI: Hover + layout improvements across 4 components (2026-05-26)

- **`app/components/PricingTiers.tsx`**: Cards now use `motion.div` with `whileHover` — scale 1.025 + colored top accent bar (copper/phos/copper-hi) slides in from left via `scaleX: 0 → 1` on hover. Tier name color transitions to accent color on hover. Added `accentColor` field to `Tier` type.
- **`app/components/Navbar.tsx`**: Nav link hover upgraded from raw `onMouseEnter`/`onMouseLeave` style manipulation to a magic sliding pill using `layoutId="nav-hover-bg"` framer-motion shared layout — pill slides smoothly between hovered links. `hoveredLink` state tracks which link is hovered.
- **`app/components/HowItWorks.tsx`**: Full upgrade from vanilla `IntersectionObserver` + CSS transitions to framer-motion `useInView` + `staggerContainer`/`revealUp` variants. Layout changed to **diagonal cascade** — each card has `--cascade-offset` CSS custom property (0 / 56px / 112px `margin-top`) creating a staircase on desktop. Connector `↘` arrows pulse between steps. Each card has a giant watermark step number (`opacity: 0.06`) and a bottom accent bar that slides in on hover. Mobile: cascade resets to flat column.
- **`app/app.css`**: Added `.rl-hiw-cascade`, `.rl-hiw-card-wrap`, `.rl-hiw-card`, `.rl-hiw-connector` — cascade layout classes with `@media (max-width: 768px)` reset to flat column.
- **`app/routes/landing.tsx`** (before/after section): BEFORE card wrapped in `motion.div` with `whileHover={{ rotate: -2, y: -6, borderColor: "var(--ember)" }}`. AFTER card wrapped in `motion.div` with `whileHover={{ rotate: 2, y: -6, boxShadow: intensified phos glow }}`. Rewrite button gains `whileHover={{ scale: 1.08 }}` + `whileTap={{ scale: 0.96 }}`.

### Full animation & motion system implementation (2026-05-26)

- **`app/lib/motion.ts`**: Added `revealUp` and `revealLeft` variants — lightweight scroll-reveal variants (no blur) for below-fold content.
- **`app/root.tsx`**: Added `PageTransition` component with `AnimatePresence` — 180ms fade+scale(0.99) on every route change. Removed `AOSProvider` and `aos/dist/aos.css` import (AOS fully replaced by framer-motion `whileInView`).
- **`app/components/CommandPalette.tsx`**: Replaced instant `if (!open) return null` unmount with `AnimatePresence` — backdrop fades in/out (150ms), panel scales+fades (0.97→1, springs.snappy). Both animate on close.
- **`app/components/Toast.tsx`**: Replaced CSS-only opacity fade with framer-motion `AnimatePresence` — toasts slide in from right (x: 40→0) and exit to right. Container uses `layout` for smooth reflow when toasts stack/dismiss.
- **`app/components/MobileBottomNav.tsx`**: Added `layoutId="mobile-nav-active"` sliding background pill — matches desktop Navbar's shared layout animation pattern across breakpoints.
- **`app/routes/history.tsx`**: Added `KPICard` component with `useInView` + `useCountUp` — KPI values count up from 0 on scroll. KPI grid uses `staggerContainer`, chart uses `revealLeft whileInView`, sparklines stagger with `revealUp`, run log rows fade in sequentially.
- **`app/routes/resume.tsx`**: Reanalyze submit button wraps label in `AnimatePresence mode="wait"` — text swaps between "$ analyze →" and "analyzing…" with y-offset. Modal open/close uses `AnimatePresence` with scale+fade (springs.smooth).
- **`app/routes/settings.tsx`**: Header uses `staggerContainer` on load. All 6 Section blocks individually wrapped in `motion.div variants={revealUp}` with stagger.
- **`app/routes/landing.tsx`**: Replaced all `data-aos` attributes with framer-motion `whileInView` — step cards use `revealUp viewport once`, testimonial bullets use `revealLeft viewport once`. Added `revealUp`/`revealLeft` to imports.
- **`app/components/ScoreCircle.tsx`**: Score number enters with elastic spring (stiffness 400, damping 20) at delay 1.1s — "lands" after the stroke ring finishes drawing.
- **`app/routes/home.tsx`**: Loading state replaced with 3 staggered skeleton shimmer placeholders (`.rl-shimmer` class, 88px height, 60ms stagger) instead of centered spinner.
- **`app/app.css`**: `rl-grain` animation now gated — `animation: none` by default, restored only under `@media (prefers-reduced-motion: no-preference)`.
- **`package.json`**: Removed unused `vivus` dependency.

### Remove edit resume (2026-05-26)

- **`app/routes/resume.tsx`**: Removed "✎ edit_resume" `Link` button from the resume action bar.
- **`app/routes.ts`**: Removed `/resume/:id/edit` route registration.

### Interactive element audit & hover/state polish (2026-05-26)

- **`app/app.css`**: Added `input[aria-invalid="true"]` and `textarea[aria-invalid="true"]` error border (ember) + focus glow states — inputs now visually distinguish invalid state from default.
- **`app/app.css`**: Added `.rl-pricing-toggle-btn:hover:not(.is-active)` — inactive Monthly/Annual toggle buttons now show subtle highlight on hover.
- **`app/app.css`**: Added `transition: background, box-shadow` to `.rl-row` — history run rows no longer instant-jump on hover; added `.rl-row-clickable:hover` inset left-border glow + `.rl-row-arrow` translate effect.
- **`app/app.css`**: Added `.rl-btn:disabled` with `cursor: not-allowed; pointer-events: none` — disabled buttons no longer animate on hover.
- **`app/app.css`**: Added `.rl-toggle` hover/active CSS — settings toggle switches now have opacity feedback.
- **`app/app.css`**: Added `.rl-btn-ghost-ember` — dedicated ember danger button class with correct hover (red glow) replacing `.rl-btn-ghost` + inline color overrides.
- **`app/app.css`**: Added `.rl-link-phos` — phos-colored inline link with underline + brighten hover effect.
- **`app/app.css`**: Added `.rl-bottom-nav-link` with `:hover:not(.is-active)` background highlight.
- **`app/routes/settings.tsx`**: Toggle button gains `className="rl-toggle"` for hover feedback; delete button switched to `rl-btn-ghost-ember`.
- **`app/routes/history.tsx`**: Run log rows gain `rl-row-clickable` class; arrow span gains `rl-row-arrow` class for translate-on-hover; removed unused `Cursor` import.
- **`app/routes/home.tsx`**: ComparePanel `view_report` links use `rl-link-phos` for underline hover. Pagination prev/next buttons guard `whileHover`/`whileTap` when disabled and set `cursor: not-allowed; pointer-events: none`.
- **`app/components/ResumeCard.tsx`**: Delete-confirm "✕ delete" and "cancel" buttons gain `whileHover` animations.
- **`app/components/MobileBottomNav.tsx`**: Nav links use `rl-bottom-nav-link` class (with `.is-active` modifier) for consistent hover.
- **`app/components/Navbar.tsx`**: Inactive nav links now fade in a background pill on hover (`background: var(--surface)`) with `transition: color, background`.
- **`app/components/Footer.tsx`**: Footer product links — arrow `→` now inherits hover color (copper-hi) and gap widens slightly on hover for tactile feel.

### Landing page content + UX review fixes (2026-05-26)

- **`app/routes/landing.tsx`**: Promoted hero H1 to functional copy ("score your resume against any job description"); old tagline demoted to monospace comment above it.
- **`app/routes/landing.tsx`**: Fixed factual error — features section header "five signals" → "six signals".
- **`app/routes/landing.tsx`**: Replaced "pdf never leaves your puter cloud" → "your PDF stays private — never our servers" in trust indicators.
- **`app/routes/landing.tsx`**: HeroBadge text changed from "v1.0 · now in public beta" → "✓ live · free to start".
- **`app/routes/landing.tsx`**: Added `// web interface — no install required` caption below the animated terminal demo.
- **`app/routes/landing.tsx`**: Added `<StatsStrip />` section between Hero and How It Works for credibility anchoring.
- **`app/routes/landing.tsx`**: Added "click cards or use ← → to explore" hint in the features deck.
- **`app/routes/landing.tsx`**: Added mid-page CTA after the Before/After demo at peak user intent.
- **`app/routes/landing.tsx`**: Added "avg +23 pts on the first revision cycle" sub-headline to testimonials section.
- **`app/routes/landing.tsx`**: Testimonial lift numbers now show "+X pts" with "score lift" label for clarity.
- **`app/routes/landing.tsx`**: Added "testimonials" to nav; reordered nav to match section order; moved FAQ before Pricing.
- **`app/routes/landing.tsx`**: Pricing H2 → "start free. upgrade when you're ready."; final CTA H2 → "your resume, scored in 3 seconds."
- **`app/routes/landing.tsx`**: Removed `ResumeLensWordmark`, `VivusTrendLine`, and unused dead code.
- **`app/components/PricingTiers.tsx`**: Free tier "24h" → "7-day" history; Recruiter tier tagline clarified + opacity de-emphasised.

### Design polish: 3 remaining fixes — pricing size, Pro border, onboarding glow (2026-05-26)

- **`app/app.css`**: `.rl-pricing-feature` font-size changed from hardcoded `13px` → `var(--text-sm)`.
- **`app/app.css`**: `.rl-card.is-phos` (Pro pricing card) changed from `border-color: var(--phos-dim)` with top-only `var(--phos)` → uniform `border-color: var(--phos)` all around.
- **`app/routes/onboarding.tsx`**: Added copper radial-gradient ambient glow (`rgba(196,123,74,0.07)`) centered behind the onboarding card on desktop via `background` on the main element.

### Design polish: parchment light surfaces (2026-05-26)

- **`app/app.css`**: Added `--parchment` token set (`--parchment`, `--parchment-2`, `--parchment-border`, `--parchment-fg-1/2/3`) — warm `#f0ebe0` palette that echoes `--fg-1` and harmonises with the copper/amber dark theme.
- **`app/routes/landing.tsx`** (features section): Replaced `#ffffff` → `var(--parchment)`, fixed all hardcoded `#aaa`, `#0d0d0d`, `#666`, `#e8e8e8`, `#fafafa` → parchment tokens.
- **`app/components/ScoreHistory.tsx`**: Full retheme from Tailwind `bg-white`/`text-gray-*` to parchment tokens. Chart line colors mapped to design tokens (phos, copper-hi, ember + kept accent colors for non-semantic lines).
- **`app/routes/wipe.tsx`**: Full retheme — dark `var(--bg)` page, parchment card, ember red danger section using `var(--ember)`/`var(--ember-dim)`.

### Design polish: 7 fixes across visual hierarchy, tokens, and breakpoints (2026-05-26)

- **Blob SVG** (`app/routes/landing.tsx`): Removed white background; recolored blobs to brand palette (copper/phos/ember) with `mix-blend-mode: screen` at 0.10–0.20 opacity so they read on the dark background.
- **Contrast** (`app/app.css`): Raised `--fg-3` from `#6b6354` → `#8a8272` and `--fg-4` from `#423d33` → `#5c5549` for WCAG AA compliance.
- **Inter font** (`app/app.css`): Added `.rl-body-text` and `.rl-lead` utility classes using `var(--font-body)`.
- **Feature card tokens** (`app/routes/landing.tsx`): Changed `FEATURES[].viz` from static JSX to render functions `(c: FeatureColor) => ReactNode`; replaced all hardcoded `rgba(255,255,255,...)` and `#052e16` values with `${c.text}` + hex opacity suffixes.
- **Cursor cleanup**: Removed `<span className="rl-cursor" />` from non-animated headings in `upload.tsx`, `pricing.tsx`, `settings.tsx`, `history.tsx`, and 3 section headings in `landing.tsx` (kept only hero headline cursor).
- **Corner crosshairs pruned**: Removed `<Corners />` from `ATS.tsx`, `ScoreCharts.tsx`, `RewriteSuggestions.tsx`, `Summary.tsx`, `ResumeChecklist.tsx`, `HowItWorks.tsx`, `PricingTiers.tsx`, `settings.tsx`, `history.tsx`, `onboarding.tsx`, and 5 locations in `landing.tsx` (terminal demo Corners at line 88 kept). Cleaned up dead imports.
- **Breakpoints consolidated** (`app/app.css`): Reduced from 5 breakpoint values (420/480/720/768/860px) to 3 — all 720px → 768px, 860px → 768px, 420px → 480px. Resume split-panel pair (767px/min-width 768px) preserved.

### Feature: Driver.js product tour + dependency cleanup (2026-05-26)

- **`package.json`**: Added `driver.js@^1.4.0`. Removed 5 unused packages: `scrollmagic`, `scrollreveal`, `lottie-web`, `lenis`, `typed.js` (+ their `@types/` entries).
- **`app/hooks/useProductTour.ts`**: New hook — wraps `driver.js` with a 6-step tour covering welcome, upload button, nav links, resume grid, compare button, and stats strip. Exposes `startTour` (manual trigger) and `startTourIfNew` (auto-start once via `localStorage`).
- **`app/components/Navbar.tsx`**: Imported `useProductTour`, added `? tour` button (ghost style, phos hover) visible to authenticated users. Added `id="nav-links"` to nav link container and `id="nav-upload-btn"` to upload link.
- **`app/routes/home.tsx`**: Added `id="stats-strip"` on `<StatsStrip>`, `id="compare-btn"` on compare button, `id="resume-grid"` on resume grid `motion.div`.
- **`app/components/StatsStrip.tsx`**: Accepts optional `id` prop and forwards it to the root div.
- **`app/hooks/useLenis.ts`**: Deleted (hook was never called anywhere).
- **`app/hooks/useTyped.ts`**: Deleted (hook was never called anywhere).

### UI: ResumeLens wordmark section (2026-05-23)

- **`app/routes/landing.tsx`**: Added `ResumeLensWordmark` component — a Streamtime-style footer wordmark that spells out "RESUMELENS". Each letter is a large bold span with a slight per-letter rotation; below each letter sits a unique SVG decorative shape (starburst, ring, triangle, diamond, hexagon, cross, teardrop, rotated square, pill, 5-point star) in the brand accent colors (copper, phos-green, ember-red). Rendered just before the footer.

### UI: Feature section — full responsive overhaul (2026-05-23)

- **`app/routes/landing.tsx`**: Rewrote `FeaturesSection` for all screen sizes. Card uses `flex-direction: column` + `flex: 1` on the viz area so height adapts rather than being fixed. All padding/font-size values use `clamp()`. Mobile-only `rl-features-mobile-arrows` shown below the card; desktop sidebar nav hidden on ≤860px.
- **`app/app.css`**: Replaced fixed-size layout classes with `.rl-features-section`, `.rl-features-container`, `.rl-features-row`, `.rl-features-deck` (uses `aspect-ratio: 3/4`), `.rl-features-nav`, `.rl-features-mobile-arrows`. Breakpoints at 860px and 420px.

### UI: Feature cards — vibrant palette, new copy, adaptive viz, responsive alignment (2026-05-23)

- **`app/routes/landing.tsx`**: Updated `FEATURE_COLORS` to vibrant editorial palette (orange, emerald, violet, amber, rose, sky). Rewrote all 6 `FEATURES` entries with punchier titles/descriptions and fully adaptive viz components (no CSS variables — inline rgba so they render correctly on any colored card background). Removed `VivusTrendLine` conditional in favor of `f.viz`.
- **`app/app.css`**: Replaced fixed `minWidth`/`width`/`height` with `clamp()`-based `.rl-features-deck` and `.rl-features-nav` classes; responsive breakpoint at 860px stacks column with `min(380px, 90vw)` card sizing.

### UI: Feature cards redesigned — Streamtime-style Z-stack (2026-05-23)

- **`app/routes/landing.tsx`**: Replaced dark-grid `FeaturesSection` with a Streamtime-inspired colorful Z-stack deck. Added `FEATURE_COLORS` palette (lime, yellow, violet, sage, coral, sand). Active card has GSAP 3D tilt on hover; back cards fan out with spring animation. Sidebar feature-list navigation + prev/next arrows + progress pill dots. Section background changed to `#ffffff`.
- **`app/app.css`**: Added `.rl-features-stack-layout` with responsive flex → column stacking at 860px breakpoint.

### Performance: remove animation sources causing jank (2026-05-23)

- **`app/hooks/useLenis.ts`**: Removed Lenis smooth scroll entirely. The `window.dispatchEvent(new Event("scroll"))` on every RAF tick was the primary jank source. Replaced with `scroll-behavior: smooth` in CSS.
- **`app/root.tsx`**: Removed `useLenis` import and call; renamed `LenisProvider` → `AOSProvider` (AOS still initialises on mount, now uses native scroll events).
- **`app/app.css`**: Added `scroll-behavior: smooth` to `html, body`. Converted `.rl-scroll-bar` from GSAP-driven (`gsap.set` on every scroll) to CSS scroll-driven animation (`animation-timeline: scroll()`).
- **`app/routes/landing.tsx`**: Removed GSAP cursor spotlight (global `mousemove` → `gsap.to` every frame), GSAP 3D card tilt (`mousemove` per card), `<Grain />` (SVG feTurbulence on a fixed full-screen overlay running a 10-step keyframe loop — very GPU heavy). Replaced `HeroBadge`/`TypedHeroLine` (typed.js cycling text) with a static pill. Removed `useTyped` import.
- **`package.json`**: Uninstalled `lenis` package.

### Fix page shaking from animations (2026-05-23)

- **`app/app.css`**: Removed the `rl-grain` animation that was constantly translating a 200%×200% fixed overlay (the biggest shake source). Simplified the grain element to `inset: 0` (no oversized translate hack needed). Changed `rl-pulse` keyframe to fade opacity only — removed the `scale(1.3)` that was causing the hero badge dot to physically shift content.
- **`app/routes/landing.tsx`**: Removed `scale: [1, 1.08, 1]` from the ambient glow `motion.div` in the final CTA section — scaling a full-section `position: absolute; inset: 0` element causes the whole section to visually jitter. Now only animates opacity.

### CTA illustration SVG fix (2026-05-23)

- **`app/routes/landing.tsx`**: Fixed the CTA illustration SVG that was invisible. Two root causes: (1) HTML `class` attribute used instead of JSX `className`, (2) `style="mix-blend-mode:multiply"` string attributes used instead of JSX `style={{ mixBlendMode: 'multiply' }}` objects — both are invalid JSX and cause silent render failure. Wrapped the SVG in a white (`#ffffff`) rounded pill (`borderRadius: 32`) container so `mix-blend-mode: multiply` renders correctly (multiply requires a light background). Added `data-aos="fade-up"` for scroll entrance.

### AOS (Animate On Scroll) integration (2026-05-23)

- **`package.json`**: Added `aos` (dependency) and `@types/aos` (devDependency).
- **`app/hooks/useLenis.ts`**: Wired `lenis.on('scroll', ...)` to dispatch a native `window` scroll event so AOS triggers correctly alongside Lenis smooth scroll.
- **`app/root.tsx`**: Imported `aos/dist/aos.css`. Dynamic-imported AOS and called `AOS.init({ duration: 650, easing: 'ease-out-cubic', once: true, offset: 80 })` inside `LenisProvider`.
- **`app/components/atoms.tsx`**: Rewrote `FadeInView` — removed Framer Motion `whileInView`. Now renders a plain `div` with `data-aos`, `data-aos-duration`, `data-aos-delay`, and `data-aos-easing` attributes. Added optional `animation` prop (default `"fade-up"`).
- **`app/routes/landing.tsx`**:
  - `FeaturesSection`: Removed ScrollReveal `useEffect`. Added `data-aos="fade-up"` + `data-aos-delay={i * 90}` to each feature card.
  - HOW IT WORKS section: Replaced `motion.div` stagger container (`staggerContainer`/`fadeUp` variants + `whileInView`) with a plain `div`. Each step card keeps `motion.div` for hover (`whileHover`) but gains `data-aos="fade-up"` with `data-aos-delay={i * 120}`.
  - Before/After bullets: Replaced `motion.div` with `whileInView` with a plain `div` using `data-aos="fade-left"` and staggered `data-aos-delay`.

### Button hover effects — Lift + Glow pass (2026-05-23)

- **`app/app.css`**: Enhanced all button hover states with `translateY` lift + colored glow box-shadow:
  - `.rl-btn-primary:hover` — `translateY(-3px) scale(1.02)` + strong phos green glow.
  - `.rl-btn-secondary:hover` — `translateY(-2px) scale(1.02)` + copper glow.
  - `.rl-btn-copper:hover` — `translateY(-2px) scale(1.02)` + stronger copper glow.
  - `.rl-btn-ghost:hover` — `translateY(-1px)` + border reveal + subtle shadow.
  - Added `:active` press-back states for all variants.
  - Added `.rl-btn-terminal` class (new) for the terminal demo pause/resume button with phos hover glow.
- **`app/routes/landing.tsx`**: Terminal pause/resume button updated to use `.rl-btn-terminal` class instead of full inline styles.

### Animation library integration — "wow" factor pass (2026-05-22)

- **`app/hooks/useTyped.ts`** (new): Dynamic-import wrapper around typed.js. Returns a `ref` that typed.js attaches to, cycling through multiple strings with configurable speeds and cursor.
- **`app/routes/landing.tsx`**: 5 new components + 2 new libraries wired in:
  - `TypedHeroLine` (typed.js) — hero headline second line now cycles through 4 taglines ("you wish you knew", "that actually lands jobs", "smarter than your recruiter", "your unfair advantage").
  - `Grain` — animated film grain overlay (`rl-grain` CSS class, SVG fractalNoise texture shifted via 10-keyframe CSS animation).
  - `VivusTrendLine` (Vivus) — SVG path for the "score history" feature card draws itself in via Vivus on IntersectionObserver trigger.
  - `FeaturesSection` (ScrollReveal) — new full features grid section (renders the existing `FEATURES` array that was previously unused) with staggered scroll-reveal entrance per card.
  - GSAP `useEffect` — spawns a `.rl-spotlight` div and animates it to follow the cursor (`power3.out`, 0.85s lag), creating a subtle phosphor glow that tracks the mouse. Also drives the `.rl-scroll-bar` reading-progress indicator at the top of the page.
  - LandingNavbar nav links updated to include `before_after` anchor.
- **`app/components/StatsStrip.tsx`**: Replaced manual `requestAnimationFrame` count-up with `@react-spring/web` `useSpring`. Numbers now animate with spring physics (`tension: 52, friction: 16`) for a more natural overshoot feel.
- **`app/app.css`**: Added `.rl-grain` keyframe + class, `.rl-scroll-bar` (scroll progress, `scaleX` driven by GSAP), `.rl-spotlight` (cursor glow, 640px radial gradient), `.typed-cursor` (overrides typed.js default cursor to use `var(--phos)` colour), `.rl-feature-card` hover transitions.
- **`package.json`** (devDependencies): Added `@types/vivus` and `@types/scrollreveal` for TypeScript coverage.

## Recent Changes

### Resume view page: fix scroll — viewport-locked split panel (2026-05-22)

- **`app/app.css`:** Viewport-locked split-panel layout (≥768px). `rl-resume-main` has `height: 100vh; overflow: hidden; display: flex; flex-direction: column`. Layout has `flex: 1; min-height: 0; overflow: hidden`. Both panels have `min-height: 0; overflow-y: auto` — `min-height: 0` is critical because flex children default to `min-height: auto`, which lets them grow past the parent height and prevents `overflow-y` from ever activating.

### Edit resume page: remove A4 min-height on screen (2026-05-22)

- **`app/app.css`:** Removed `min-height: 1123px` from `.resume-mdx-editor` and `min-height: 1050px` from `.resume-mdx-editor [contenteditable]` — these forced the editor to full A4 height on screen, creating a large blank space when resume content was shorter than a page. Moved both min-heights into `@media print` only so PDF/print exports still fill a full A4 page.
- **`routes/resume-edit.tsx`:** Removed `minHeight: 1123` from the paper div — same reason.

### Edit resume page: layout fix — overflow + sticky sidebar (2026-05-22)

- **`routes/resume-edit.tsx`:** Removed `overflow: "hidden"` from the body flex container (was cutting off MDXEditor toolbar and content). Added `minHeight: 0` instead. AI tips sidebar made `position: sticky; top: 44px; height: calc(100vh - 44px)` so it stays in view while the page scrolls naturally, with its own internal scroll for long tip lists.

### Edit resume page: MDXEditor integration (2026-05-22)

- **`routes/resume-edit.tsx`:** Full rewrite — replaced `contentEditable` div + manual `document.execCommand` toolbar with `@mdxeditor/editor`. Removed all custom `ToolBtn`/`Sep`/icon components. Uses `toolbarPlugin` with `UndoRedo`, `BoldItalicUnderlineToggles`, `BlockTypeSelect`, `CreateLink`, `ListsToggle`. Saves markdown to `resume-edit-md:<id>` KV key (new). `handleChange` wires `onChange` prop; `handleSave` uses `mdxRef.current?.getMarkdown()`. `textToMarkdown` replaces `textToResumeHtml` for PDF text → markdown conversion. `markdownToHtml` added for `.doc` download. All page chrome (nav, AI sidebar, footer) restyled to CIPHER dark theme.
- **`app/app.css`:** Removed old `.resume-doc` block. Added `.resume-mdx-editor` block — overrides MDXEditor's own CSS variables (`--baseBg`, `--baseBase`, `--baseBgActive`, `--baseBorder`, `--baseText`, `--baseTextContrast`) to map to CIPHER tokens, giving the toolbar a dark CIPHER look. Resume typography (Georgia serif, pt sizes, h1/h2 styles) applied to `[contenteditable]` and heading elements inside the wrapper.

### Resume page: viewport-locked split panel (2026-05-22)

- **`routes/resume.tsx`:** Added `className="rl-resume-main"` to `<main>`. Nav gets `className="rl-resume-page-nav"` and loses `position: sticky; top: 0` from inline style (CSS re-adds sticky on mobile, removes it on desktop since nothing scrolls past it). Two-column div switches from `className="max-lg:flex-col-reverse"` to `className="rl-resume-layout"`. Left panel loses `position: sticky; top: 52; height: calc(100vh - 52px); overflowY: auto` from inline styles (all handled by CSS).
- **`app/app.css`:** Replaced old `@media (max-width: 1024px)` resume block with two new blocks: `@media (min-width: 768px)` locks `.rl-resume-main` to `height: 100dvh; overflow: hidden`, sets `.rl-resume-layout` to `flex: 1; min-height: 0; overflow: hidden`, and gives `.rl-resume-left` / `.rl-resume-right` `height: 100%; overflow-y: auto` for independent panel scrolling. `@media (max-width: 767px)` restores natural flow, stacks panels as `column-reverse`, restores sticky nav.

### Responsiveness audit pass 2 (2026-05-22)

- **`app/app.css`:** Added `overflow-x: hidden` to `html, body` to prevent horizontal scroll on all screens. Made h2/h3 fluid with `clamp()` instead of fixed px. Added `.rl-rewrite-grid` CSS class (1fr 1fr desktop, 1fr on mobile). Added `@media (max-width: 768px)` tablet breakpoint — hero grid collapses, landing sections reduce padding, pricing grid goes single-column. Added `@media (max-width: 480px)` breakpoint for very small screens — tighter section padding, compare panel label column reduced to 48px, chip sizes reduced, pricing price clamped. In the 720px block: added `.rl-rewrite-grid` collapse, `.rl-score-big` class override, `.rl-stat-value` font reduction. Added `.rl-summary-grid` collapse rule in 480px block.
- **`components/Summary.tsx`:** Score number changed from fixed `fontSize: 88` to `fontSize: "clamp(52px, 12vw, 88px)"` + `className="rl-score-big"` for CSS override. Added `className="rl-summary-grid"` on the score+bars grid so it stacks vertically on very small screens (480px).
- **`components/RewriteSuggestions.tsx`:** Replaced inline `style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}` on the before/after grid with `className="rl-rewrite-grid"` — CSS now stacks columns vertically on ≤720px.
- **`components/StatsStrip.tsx`:** Added `className="rl-stat-value"` on the count number span so the 720px CSS can reduce its `font-size` from 32px to 26px on mobile.

### Full responsive pass (2026-05-22)

- **`app/app.css`:** Added `.rl-stats-grid` (4→2col), `.rl-stat-item` nth-child borders, `.rl-resume-left/right` 1024px breakpoint (unstick panel), `.rl-resume-nav-actions` wrapping, `.rl-density-btns` wrapping, `.rl-footer-bottom` mobile stack, `.rl-toast` max-width + wrapping, `.rl-history-row` compact gap, testimonials section padding, dashboard hero card padding, upload form full-width.
- **`components/StatsStrip.tsx`:** Added `rl-stats-grid` class on outer grid, `rl-stat-item` on each stat — enabling CSS 2×2 mobile layout.
- **`routes/resume.tsx`:** Added `rl-resume-left`, `rl-resume-right`, `rl-resume-nav-actions` classes; download button hidden on mobile; nav wraps on mobile.
- **`routes/settings.tsx`:** Density buttons use `rl-density-btns` (wraps on mobile); `SettingRow` uses `flexWrap: wrap`.
- **`routes/history.tsx`:** Run log rows use `rl-history-row`; status pill hidden on mobile; only arrow shown.
- **`routes/landing.tsx`:** Testimonials section gets `rl-testimonials-section` and `rl-testimonials-header` classes for mobile padding.
- **`routes/home.tsx`:** Dashboard empty-state hero card gets `rl-hero-card` for reduced mobile padding.
- **`components/Navbar.tsx`:** Tighter padding (`10px 16px`), `minWidth: 0` on container.
- **`components/Footer.tsx`:** Bottom bar uses `.rl-footer-bottom` class (stacks on mobile).
- **`routes/upload.tsx`:** Form uses `rl-upload-form` class (full-width on mobile).

## Completed

### History components on dashboard (2026-05-19)

- **`components/ScoreCharts.tsx`:** New shared file — exports `scoreTierColor`, `scoreTier`, `Sparkline`, `DimSparklineCard`, `DIMS`, and `LineChart`. Extracted from `history.tsx` to avoid duplication.
- **`routes/history.tsx`:** Now imports `DIMS`, `DimSparklineCard`, `LineChart`, `scoreTier`, `scoreTierColor` from `ScoreCharts`. Removed ~130 lines of duplicated component code.
- **`routes/home.tsx`:** Added `score_timeline` section at the bottom of the populated dashboard state — KPI cards (first_score, current_score, total_runs, avg_lift), overall score line chart (shown when ≥2 runs), and per-dimension sparklines. Uses chronologically sorted resumes for the chart. Links to `/history` for the full view.

### PricingTiers refactor (2026-05-19)

- **`components/PricingTiers.tsx`:** Added monthly/annual billing toggle (`useState`); annual shows ~25% discounted prices. Typed `FeatureItem` union — "all of X, plus:" items now render as dimmed section separators (`.rl-pricing-inherit`) instead of plain feature rows. Recruiter CTA now routes to `/contact` instead of `/auth`. Replaced all inline layout styles with CSS classes. Added `aria-label` on each card and `aria-hidden` on the RECOMMENDED badge. Removed `key={feature-text}` in favour of index keys.
- **`app.css`:** Added `.rl-pricing-wrap`, `.rl-pricing-grid`, `.rl-pricing-toggle`, `.rl-pricing-toggle-btn`, `.rl-pricing-save-badge`, `.rl-pricing-card`, `.rl-pricing-header`, `.rl-pricing-price-row`, `.rl-pricing-price`, `.rl-pricing-period`, `.rl-pricing-annual-note`, `.rl-pricing-tagline`, `.rl-pricing-features`, `.rl-pricing-feature`, `.rl-pricing-feature-icon`, `.rl-pricing-inherit`, `.rl-pricing-badge`. Updated `.rl-card.is-phos` to include `box-shadow: 0 0 32px var(--phos-glow)` (was hardcoded inline RGBA).

### Responsive fixes — ComparePanel, history run log, navbar (2026-05-19)

- **`app.css`:** Added `.rl-mobile-show` utility (hidden by default, `display: inline` on ≤720px). Added `.rl-compare-row` CSS class for the compare panel grid (`160px 1fr 1fr` desktop → `72px 1fr 1fr` on ≤720px). Added `.rl-run-score-bar` hide rule on mobile.
- **`components/Navbar.tsx`:** Upload button text now reads `$ upload →` on mobile and `$ upload_resume →` on desktop via `<span className="rl-mobile-hide">`.
- **`routes/home.tsx`:** All 4 hardcoded `gridTemplateColumns: "160px 1fr 1fr"` divs in `ComparePanel` replaced with `className="rl-compare-row"`. Section score `ScoreBar` wrapped in `<span className="rl-run-score-bar">` to hide on mobile.
- **`routes/history.tsx`:** Run log `ScoreBar` wrapped in `<span className="rl-run-score-bar">` to prevent overflow on narrow screens.

### Logo navigation + full responsiveness (2026-05-19)

- **`components/Navbar.tsx`:** Logo now links to `/landing` (was `/`) so clicking it from any app page returns to the landing/marketing page.
- **`app.css`:** Added `.rl-hero-grid`, `.rl-ba-grid`, `.rl-ba-mid`, `.rl-landing-section`, `.rl-landing-nav` utility classes with `@media (max-width: 720px)` overrides — hero collapses to single column, before/after stacks vertically, all landing sections reduce padding on mobile.
- **`routes/landing.tsx`:** Applied new responsive classes to `LandingNavbar`, hero section, all content sections, before/after grid and its middle button. Trust strip now uses `boxSizing: border-box` and reduced padding for narrow viewports.

### Landing ↔ Dashboard Navigation + Upload Button (2026-05-19)

- **`routes.ts`:** Added `/landing` route so the marketing page is accessible at a stable URL regardless of auth state.
- **`routes/landing.tsx`:** `LandingNavbar` now checks auth — authenticated users see `→ open_dashboard` button; unauthenticated users see `sign_in` + `$ try_free →`. Logo links to `/` (dashboard) when authenticated, `/landing` otherwise.
- **`components/Navbar.tsx`:** Added `about` link (`/landing`) to `NAV_LINKS` so dashboard users can navigate to the marketing page. Restored `$ upload_resume →` primary button in the right section for authenticated users.

### Navigation & Pricing Refactor (2026-05-19)

- **`Navbar.tsx`:** Replaced center terminal prompt with full nav links (Dashboard, Upload, History, Pricing, Settings). Active link shows `▶` prefix + highlighted background. Uses `Logo` atom. Sign-out button hidden on mobile; unauthenticated users see `$ sign_in →`. Dead mobile upload shortcut removed.
- **`components/PricingTiers.tsx`:** Extracted pricing cards (FREE / PRO / RECRUITER) from `pricing.tsx` into a standalone reusable component. Uses `Corners` atom.
- **`routes/pricing.tsx`:** Now uses `<PricingTiers />` component. Removed ~130 lines of duplicated markup.
- **`routes/landing.tsx`:** Pricing section now renders full `<PricingTiers />` instead of a placeholder teaser. Fixed unused `i` variable in How It Works map.
- **`Footer.tsx`:** Product link column expanded to include History, Pricing, Settings. Brand uses `Logo` atom instead of inline markup.

## Completed

### CIPHER Design System Overhaul (2026-05-19)

- **`app/app.css`:** Replaced light Mona Sans / Instrument Serif theme with full CIPHER dark token system. 70+ CSS vars (`--bg`, `--fg-1…4`, `--phos`, `--copper`, `--ember`, spacing, radii, shadows, glows, motion). JetBrains Mono as default UI font; Inter for body copy > 2 lines. Page grid background (40×40 px). Utility classes: `.rl-page`, `.rl-section`, `.rl-card`, `.rl-corner`, `.rl-btn-*`, `.rl-pill-*`, `.rl-chip`, `.rl-dot`, `.rl-cursor`, `.rl-fade-in`, `.rl-toast`, etc.
- **`Navbar.tsx`:** Warm-black sticky nav with `backdrop-filter: blur(8px)`. Phosphor "R" logo mark, live dot + terminal prompt label, copper user avatar, context-aware CTA (`$ upload_resume →` / `← my_resumes`). Mobile: center prompt and username hidden via `.rl-mobile-hide`.
- **`Footer.tsx`:** CIPHER footer with `[ATS][KW][RW][TS][IV]` feature chip strip, 4-column grid (brand / product links / powered_by / status), phosphor dot live indicator, `//` comment-style copyright.
- **`StatsStrip.tsx`:** Warm-oxide card with copper corner crosshairs. Phosphor count-up numbers with `text-shadow` glow. IntersectionObserver trigger, staggered fade in.
- **`HowItWorks.tsx`:** Three step cards with copper/phosphor STEP_0N accent borders, corner crosshairs, staggered slide-up on intersection.
- **`ScoreCircle.tsx`:** SVG ring colored by score tier (phos > 69, copper-hi 50–69, ember < 50) with drop-shadow glow. Tabular-num score + `/100` label.
- **`ResumeCard.tsx`:** Dark `.rl-card` with copper corner crosshairs. `//` comment eyebrow for company, filtered image preview (`saturate(0.5)`). CIPHER delete confirm popover.
- **`FileUploader.tsx`:** Terminal drop zone — `↓` glyph, `click_to_upload` / `drop_resume_here` copy, phosphor border + glow on drag-active. File selected state shows phosphor ✓ chip.
- **`InterviewQuestions.tsx`:** Terminal card with `rl-eyebrow-prompt`, `$ predict →` / `↺ regenerate` buttons, numbered `.rl-row` list, per-category color labels.
- **`RewriteSuggestions.tsx`:** BEFORE/AFTER grid — ember-tinted `−` panel vs phosphor-tinted `+` panel. `// comment` why-block below each pair.
- **`auth.tsx`:** Mac-window-chrome dots, `welcome_back_` headline with blinking cursor, Puter info box, `$ log_in_with_puter →` primary CTA.
- **`home.tsx`:** `rl-page` grid background. `track_your_applications` hero h1. Empty state hero card with feature chips + upload CTA. ComparePanel rewritten in CIPHER — ASCII score bars, `◆` winner marker, keyword overlap with `rl-chip-phos`. Pagination with secondary buttons.
- **`upload.tsx`:** `smart_feedback for_your dream_job_` hero. Form fields with `// label` prefixes. Progress pipeline as a `is-phos` card with `▶ running…` / `✓ done` step states. Feature chip row. `$ run analyze →` submit button.
- **`resume.tsx`:** Dark sticky top nav (`← back_to_dashboard`, `↺ re-analyze`, `✎ edit_resume`, `↓ download`). Left preview panel with desaturated image on `var(--bg-2)`. Re-analyze modal with backdrop blur, `! warning` amber strip, terminal form. CIPHER error boundary and toast.

### CIPHER Component Rewrites — Round 2 (2026-05-19)

- **`Summary.tsx`:** Full rewrite — ScoreNumber (88px phosphor digit) + ASCII ScoreBar grid for 5 categories. `is-accent` card with copper corner crosshairs. Overall tier pill (PASS/BORDERLINE/FAIL). Footer with date.
- **`ATS.tsx`:** Full rewrite — terminal report card. Score number (40px) + tier pill in header. Suggestions rendered as `+`/`!` lines with phos/copper-tinted bg cards. Keyword diff using `rl-chip-phos` for found, ember-tinted chip for missing. `rl-comment` section divider.
- **`Details.tsx`:** Full rewrite — custom accordion with `▼/▶` toggle triangles, StatusPill per-section score, TipCard items with `+`/`!` prefix and phos/copper borders. No external Accordion dependency.
- **`ResumeChecklist.tsx`:** Full rewrite — `rl-card` with copper corners. Items as `✓`/`!`/`✕` rows with tier-colored bg and border. Header summary pills for critical/warn/pass counts.
- **`ResumeCard.tsx`:** Moved resume preview image to **top** of card (full-width, 3:4 aspect). Company/job info + ScoreCircle moved to bottom info strip.
- **`home.tsx`:** Added `rl-h1` class to h1; "applications" highlighted in `var(--phos)`; added `rl-cursor` span.
- **`upload.tsx`:** Added `rl-h1` class to h1; "dream_job" highlighted in `var(--phos)`.

### Feature Additions (recent)

- **Rich text editor toolbar (`resume-edit.tsx`):** Added a full formatting toolbar: Undo/Redo, block-format selector, font-size selector (pt-based, uses font-tag marker trick), Bold/Italic/Underline/Strikethrough, text-color swatch picker (8 colors), clear formatting, Insert/Remove Link (dialog preserves selection range), Align Left/Centre/Right, Bullet list, Numbered list, Indent/Outdent. Auto-save debounced at 2.5s after typing. Unsaved-changes indicator (amber pulsing dot) + saved-ago label in nav bar. Live word count in footer. Active link URL detected via `selectionchange` and shown as tooltip. Download dropdown has PDF (print) and Word (.doc) options.

### Bug Fixes & Code Quality

- **Resume editor blank content fix (`resume-edit.tsx`):** The load function was setting `editorRef.current.innerHTML` while `extracting` was still `true`, so the editor div hadn't rendered yet and `editorRef.current` was `null`. Fixed by storing extracted HTML in `editorHtml` state and applying it to the editor via a `useEffect` that fires after `extracting` becomes `false` and the div is mounted.
- **Honest AI scoring (`constants/index.ts`):** Rewrote `prepareInstructions` prompt with strict rules: all scores set to 0 for non-resume images; all scores below 20 for random/nonsensical job title or description; AI explicitly forbidden from inflating scores out of politeness or fabricating keywords not present in the resume.
- **Form minimum-length validation (`upload.tsx`):** Added length guards to `validate()` — company name ≥ 2 chars, job title ≥ 3 chars, job description ≥ 50 chars. Prevents garbage one-word inputs from passing through to the AI.

- **Type fix:** Added `explanation` field to `ATS.tips` in `types/index.d.ts` and `AIResponseFormat` — closes the type/runtime mismatch between ATS and Details components.
- **Dead code removal:** Removed unused `resumes` sample array from `constants/index.ts`.
- **Form validation (`upload.tsx`):** All fields (company name, job title, job description, file) are validated before submit; inline error messages per field with `aria-describedby` linkage.
- **Delete confirmation (`ResumeCard.tsx`):** Inline two-step confirm/cancel popover — prevents accidental data loss. Dialog has `role="dialog"` and `aria-labelledby`.
- **Home page auth guard (`home.tsx`):** `loadResumes` effect is gated on `auth.isAuthenticated` so it won't fire before Puter auth resolves.
- **Race condition fix (`resume.tsx`):** Separated auth redirect and data-loading effects. Removed `isLoading` from data-load deps. Added stale-state clear on `id` change and a `cancelled` flag for stale async calls.
- **Puter polling (`puter.ts`):** Replaced nested `setInterval` + `setTimeout` pair with a single interval using an attempt counter.
- **Multi-page PDF note (`resume.tsx`):** `pdf2img.ts` returns `pageCount`; stored in KV at upload; displayed as "Showing page 1 of N — click to view full PDF" when N > 1.
- **Per-route error boundaries:** `ErrorBoundary` exported from `upload.tsx`, `home.tsx`, `resume.tsx`.

### Feature Additions

- **Pagination (`home.tsx`):** Resumes shown 6 per page with Previous/Next controls. Page auto-adjusts when a resume is deleted.
- **Export / Download Report (`resume.tsx`):** "Download Report" button calls `window.print()`. Print stylesheet in `app.css` hides nav and image pane, makes feedback full-width, preserves color-coded cards, and forces accordion sections open.
- **Re-analyze (`resume.tsx`):** "Re-analyze" button reveals an inline form pre-filled with the stored job title and description. On submit, re-runs AI analysis against the same resume image, updates KV store, and refreshes feedback in place — no re-upload needed.
- **ATS keyword visualization (`ATS.tsx`):** AI now returns `keywords.found` and `keywords.missing` as part of the ATS section. Green chips show matched keywords; red chips show gaps.

### UI/UX & Accessibility Polish (latest session)

- **ScoreGauge color fix (`ScoreGauge.tsx`):** Replaced the purple→pink gradient (which had no semantic meaning) with a score-tier solid color: green (>69), amber (>49), red (≤49). The gauge now correctly shows green for high scores and red for low — no more backwards visual.
- **Accordion ARIA (`Accordion.tsx`):** Added `aria-expanded`, `aria-controls`, `id` on headers; `role="region"`, `aria-labelledby`, `id` on content panels; `hidden` attribute on collapsed panels for correct screen reader behaviour. Replaced `focus:outline-none` with `focus-visible:ring-2 focus-visible:ring-indigo-500` for keyboard visibility.
- **ScoreBadge icons (`ScoreBadge.tsx`):** Added symbol prefix (✓ / ! / ✕) alongside the colour-coded label so colorblind users have a non-colour indicator of score tier.
- **Image alt text (`Details.tsx`, `ResumeCard.tsx`, `resume.tsx`, `upload.tsx`):** All icon images now carry descriptive alt text (`"Good"` / `"Needs improvement"`). Decorative GIFs and back-arrow icons marked `aria-hidden="true"` / `alt=""`. Resume preview image carries contextual alt with company name.
- **ResumeCard mobile delete (`ResumeCard.tsx`):** Delete button changed from `opacity-0 group-hover:opacity-100` (invisible on touch) to `opacity-100 sm:opacity-0 sm:group-hover:opacity-100` — always visible on mobile, hover-revealed on desktop.
- **ResumeCard loading skeleton (`ResumeCard.tsx`):** While the resume image blob is loading, shows an animated `bg-gray-100 animate-pulse` placeholder instead of a blank gap. Falls back to "Preview unavailable" if the image fails to load.
- **Auth page explanation (`auth.tsx`):** Added a blue info box explaining what Puter is and why the app uses it, so users aren't dropped cold into an unfamiliar third-party auth flow. Button label updated to "Log In with Puter".
- **Demo feedback transparency (`puter.ts`, `resume.tsx`):** `usePuterStore` now exposes `isUsingDemoFeedback: boolean`, set to `true` whenever `ai.feedback()` falls back to `demoFeedback` (empty response or error). `resume.tsx` displays a visible amber warning banner when this flag is set so users know the analysis is sample data, not real.
- **Re-analyze overwrite warning (`resume.tsx`):** A small amber notice ("⚠ This will replace your current analysis.") is shown inside the re-analyze form before the user submits.
- **Re-analyze success toast (`resume.tsx`):** On successful re-analysis, a green "✓ Re-analysis complete — feedback updated." banner appears for 4 seconds with `role="status" aria-live="polite"`.
- **Accessible form labels in re-analyze form (`resume.tsx`):** Added explicit `<label>` elements with `htmlFor` linkage to the Job Title and Job Description inputs (previously placeholder-only).
- **Upload step progress tracker (`upload.tsx`):** Replaced the single status-text line with a 4-step ordered list showing: Convert PDF → Upload → Analyze → Save. Each step renders done (green ✓), active (indigo pulse), or pending (gray). Screen readers get an `aria-live="polite"` status paragraph.
- **Form error `aria-describedby` (`upload.tsx`):** Error paragraphs now have `id` attributes linked via `aria-describedby` on their inputs, and carry `role="alert"` so screen readers announce them immediately.
- **Better empty state (`home.tsx`):** First-time users now see a short explanation of what Resumind does (ATS score, keyword gap, tone/structure feedback) plus a feature list before the upload CTA, instead of just a blank button.
- **Skip-to-main-content link (`root.tsx`, `app.css`):** A visually hidden `<a href="#main-content">` is inserted at the top of every page and becomes visible on focus, allowing keyboard users to bypass the navbar. Home and upload pages have `id="main-content"` on their main section; resume page uses `id="resume-feedback"` for direct jump to feedback.
- **Global focus-visible ring (`app.css`):** Added a global `:focus-visible` rule (`outline: 2px solid #6366f1`) so every interactive element has a visible keyboard focus indicator. Components that define their own `focus-visible:ring-*` utilities override this without conflict.

### Design & Component Overhaul (latest session)

- **Navbar upgrade (`Navbar.tsx`):** Now sticky with scroll-shadow, user avatar pill showing initials via `auth.user.username`, sign-out button, and context-aware nav link (shows "← My Resumes" on upload page, "Upload Resume" elsewhere).
- **StatsStrip component (`StatsStrip.tsx`):** New animated counter strip with 4 stats (AI Metrics, Keyword Signals, Analysis Time, ATS Coverage). Counters animate on IntersectionObserver entry with eased `requestAnimationFrame` countdown. Shown on dashboard (with resumes) and in empty state.
- **HowItWorks component (`HowItWorks.tsx`):** 3-step flow card (Upload → AI Analyzes → Get Feedback) with staggered fade-in animations, gradient backgrounds per step, connector line on desktop, and IntersectionObserver-triggered entrance. Supports `compact` prop.
- **Footer component (`Footer.tsx`):** Full branded footer with feature strip, 3-column layout (brand + links + powered-by), and privacy note. Added to Home and Upload pages.
- **Upload page hero (`upload.tsx`):** Added "AI-Powered Analysis" badge pill with pulse dot, 6 animated feature pills (ATS Score, Keyword Analysis, Rewrite Tips, Tone & Style, Interview Prep, Structure Check) with staggered entrance. Upload form wrapped in frosted-glass card (`bg-white/70 backdrop-blur-sm`). Analyze button upgraded with ✨ icon.
- **Home page empty state (`home.tsx`):** Replaced plain text with a frosted-glass intro card featuring feature checklist, pulsing badge, and prominent CTA. Followed by `HowItWorks` and `StatsStrip` sections. Stats strip also added above the resume grid when resumes exist.
- **`FormEvent` deprecation fix (`upload.tsx`):** Replaced deprecated `FormEvent<HTMLFormElement>` import with `React.SyntheticEvent<HTMLFormElement>`.

## In Progress

- None.

### New Components & Routes (2026-05-19)

- **`app/components/atoms.tsx`:** 18 primitive atoms — Logo, Corners, Cursor, Dot, Button, Input, Textarea, Label, Eyebrow, Comment, StatusPill, Tag, ScoreNumber, ScoreCircle, ScoreBar, ScoreBars, KeywordRow, FeatureChip. Full CIPHER styling with score-tier color logic.
- **`app/components/MobileBottomNav.tsx`:** Fixed bottom nav visible under 720 px. 5 slots (home / upload / history / pricing / settings). Active slot glows phosphor.
- **`app/components/Toast.tsx`:** `ToastProvider` + `useToast` hook. Slides up from bottom-center, 3.2 s auto-dismiss. Good / warn / bad tier border colors.
- **`app/components/CommandPalette.tsx`:** ⌘K global overlay. Fuzzy filter, arrow-key nav, Enter to run. 8 commands across nav / ai_actions / account categories. `openCommandPalette()` escape hatch for programmatic open.
- **`app/routes/pricing.tsx`:** Full 3-tier pricing page (FREE / PRO recommended / RECRUITER) with feature lists, RECOMMENDED ribbon, phos glow on pro card.
- **`app/routes/onboarding.tsx`:** 4-step wizard (role → seniority → industries → goal). Visual stepper, continue disabled until step valid, skip available. Saves to Puter KV.
- **`app/routes/history.tsx`:** Score history page with 4 KPI cards, interactive SVG line chart with hover tooltips, 5 per-dimension sparkline cards, full run log table with StatusPill and score bars.
- **`app/routes/settings.tsx`:** 6 settings blocks (profile, career, notifications, plan, appearance, data). Terminal toggles, plan card, data wipe confirmation.
- **`app/routes/landing.tsx`:** Full landing page for unauthenticated users — animated terminal demo, trust strip (7 companies), 6 feature cards with micro-vizzes, HowItWorks 3-step grid, before/after comparison, 3 testimonials, FAQ accordion, final CTA section.
- **`app/routes.ts`:** Registered `/pricing`, `/onboarding`, `/history`, `/settings`.
- **`app/root.tsx`:** Wrapped `<Outlet>` in `<ToastProvider>` and added `<CommandPalette>` globally.
- **`app/routes/home.tsx`:** Unauthenticated users now see the LandingScreen instead of being redirected to `/auth`. MobileBottomNav added.

---

## Session: Fixes + Resume Editor (2026-05-14)

### Bug Fixes & Code Quality

- **AI model upgrade (`puter.ts`):** Updated hardcoded model string from `claude-sonnet-4` to `claude-sonnet-4-6` for better reasoning quality.
- **Deduplicated `extractJSON` (`utils.ts`, `puter.ts`, `resume.tsx`):** Moved the JSON-extraction helper into `lib/utils.ts` as a single shared `extractJSON()`. Removed the duplicate local `extractJSONText` from `puter.ts` and the local `extractJSON` from `resume.tsx`; both now import from utils. The shared version also correctly handles JSON arrays (not just objects).
- **Meta title trailing space (`resume.tsx`):** Fixed `"ResumeLens | Review "` → `"ResumeLens | Review"`.
- **Puter loading screen (`root.tsx`):** Added a full-page spinner overlay (`PuterLoadingScreen`) that shows while `isLoading && !puterReady` — replaces the blank page users saw during the 10-second Puter.js init poll.
- **Wipe confirmation (`wipe.tsx`):** Full redesign — now requires typing `DELETE` before the wipe button becomes active. Styled consistently with the rest of the app. Shows a success state after wipe and a spinner/error state during loading.

### UX Improvements

- **Re-analyze modal (`resume.tsx`):** Converted the inline re-analyze form (which pushed page content down) to a proper overlay modal (`role="dialog"`, `aria-modal`, backdrop click to dismiss, `zoom-in-95` entrance animation). Cleaner on all screen sizes.
- **"Edit Resume" nav button (`resume.tsx`):** Added an "Edit Resume" button in the resume page nav bar that links to `/resume/:id/edit`.

### New Feature: Resume Editor + Download

- **`extractPdfText` (`pdf2img.ts`):** New export that uses the already-loaded pdfjs-dist to extract plain text from all pages of a PDF blob. Reuses `loadPdfJs()` — no extra setup.
- **`/resume/:id/edit` route (`resume-edit.tsx`):** New page with:
  - Loads the stored PDF from Puter, extracts text via `extractPdfText` on first visit.
  - Persists user edits to Puter KV under `resume-edit:<id>` — subsequent visits reload the saved edit.
  - **Left panel:** AI improvement tips filtered to `type === "improve"` across all feedback categories (ATS, content, tone, structure) — shown as amber tip cards for reference while editing.
  - **Right panel:** Full-height `<textarea>` (monospace, spellcheck enabled) with the extracted resume text.
  - **Save Edits** button writes the current text to KV with a 3-second "✓ Saved" toast.
  - **Download PDF** button: builds a print-optimized HTML document in memory — detects ALL-CAPS lines as section headers (`<h2>`), bullet chars as list items (`<li>`), and other lines as paragraphs (`<p>`). Opens in a new tab and auto-triggers `window.print()`. Zero extra dependencies.
- **Route registered (`routes.ts`):** `/resume/:id/edit` → `routes/resume-edit.tsx`.
- **Editor redesigned (session 2):** Replaced plain textarea with a full WYSIWYG experience — A4 white paper card on a gray desktop background. The paper div is `contentEditable` styled with `.resume-doc` (Georgia serif, proper resume typography). Better PDF text parser splits on known section headers (SUMMARY, WORK EXPERIENCE, SKILLS, etc.) injecting `<h1>`, `<h2>`, `<ul>/<li>`, and `<p>` tags. `Ctrl+B` / `Ctrl+I` work natively. Print CSS in `app.css` uses `.resume-editor-chrome` / `.resume-paper-wrap` / `.resume-paper` to hide all UI chrome and print only the A4 paper. KV key changed to `resume-edit-html:<id>` to store HTML (not plain text).

## Next Up

- End-to-end manual testing of all new accessibility features with keyboard-only navigation.
- Test with a screen reader (VoiceOver / NVDA) to verify accordion, form, and live-region behaviour.
- Consider replacing the re-analyze form with a modal dialog for cleaner UX on small screens.

## Open Questions

- Should pagination be replaced with infinite scroll once the list grows very large?
- Should exported PDFs include the resume thumbnail image (requires `html2canvas`) or is the text-only print report sufficient?
- Should the `/wipe` route require a typed confirmation (e.g. "DELETE") before proceeding?

## Architecture Decisions

- **SPA mode (SSR disabled):** All auth and data fetching happens client-side via Puter.js. No server component or loader auth checks.
- **Puter.js as backend:** Auth, file storage (PDF + image), AI calls, and KV store all go through Puter — no separate API server.
- **Zustand for Puter state:** `usePuterStore` wraps the Puter SDK and owns the `isLoading` / `auth` / `puterReady` / `isUsingDemoFeedback` lifecycle.
- **AI model:** Claude Sonnet 4 via Puter's `ai.chat` with streaming. Model name is hardcoded in `puter.ts:feedback()`.
- **Print export:** Uses `window.print()` + `@media print` CSS (zero dependencies). Tailwind `print:hidden` / `print:block` / `print:w-full` variants control visibility per section.
- **Re-analyze:** Reuses the stored `imagePath` from KV — no re-upload of the PDF needed. Updates KV in place with new feedback and job details.
- **Demo fallback:** When `ai.feedback()` returns empty or throws, `demoFeedback` from `constants/index.ts` is used and `isUsingDemoFeedback` is set to `true` in the store. The resume page renders a warning banner when this flag is active.

## Session Notes

- `constants/index.ts` no longer exports `resumes` — verify no import of it exists elsewhere before merging.
- `ATS.tsx` local `Suggestion` interface now includes `explanation` to stay consistent with the global type.
- The `keywords` field in `Feedback.ATS` is optional (`?`) — older resumes analyzed before this change won't have it, and the ATS component handles `undefined` gracefully.
- `storedJobDescription` was removed from `resume.tsx` state — `newJobDescription` serves as both the form value and the source of truth for the current job description shown in the form.
- `AccordionContent` now uses the `hidden` attribute for collapsed state; the `max-h-0 opacity-0` CSS classes are kept for the transition animation on supported browsers, but `hidden` ensures screen readers never read collapsed content.
