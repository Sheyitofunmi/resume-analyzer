# Handoff: ResumeLens — Full App UI (Landing + 8 Product Screens)

## Overview
ResumeLens is an AI resume-optimization app. A user lands on **/landing** to learn how it beats ATS bots, signs up via **/auth**, completes **/onboarding** to set a target role, lands on the authenticated **/** home, uploads a resume at **/upload**, gets it scored across 5 dimensions with AI-rewritten bullets and keywords on **/resume/:id**, tracks score improvements in **/history**, with **/settings** and **/pricing** handling account and plan management.

This bundle contains the complete hi-fi design for all 9 screens.

## About the Design Files
The files in this bundle are **design references created in HTML** — prototypes showing the intended look and behavior. They are NOT production code to copy directly. The task is to **recreate these designs in the target codebase's environment** (React/Next.js, Vue, etc.) using its established patterns and libraries — or, if no environment exists yet, choose an appropriate framework (React + Tailwind or CSS-in-JS is a natural fit) and implement the designs there.

Each `.dc.html` file opens directly in a browser (they share `support.js`, included in this bundle). View them to see exact layout, motion, and interactive behavior. Inside each file: the markup lives between `<x-dc>…</x-dc>` (all styles inline), and the interactive logic is a small class at the bottom of the file — read it for exact state behavior.

## Fidelity
**High-fidelity (hifi).** Colors, typography, spacing, borders, shadows, copy, and interactions are final. Recreate pixel-perfectly.

## Design Tokens

### Colors
- `#6FD6E3` — brand cyan (hero fields, primary panels, active nav pill)
- `#C6F24E` — lime (success/score accents, plan badge, rewrite section bg, CTA on dark)
- `#8B5CF6` — violet (tertiary accent, avatar, projected-score card, CTA panel)
- `#0B0B0B` — ink (all text, borders, dark sections, primary buttons)
- `#FDFDFB` — page background (off-white)
- `#FFFFFF` — cards/surfaces
- `#5F6368` — secondary text; `#9AA0A6` — muted text; `#EDEFEC` / `#F0F2F0` / `#F5F7F5` — light fills; `#E0E4E0` — light borders
- `#D93025` — destructive (settings danger zone only)
- Dark-section palette: bg `#0B0B0B`, surface `#161613`, text `#F5F5F0`, muted `#A8ADA0`, borders `rgba(255,255,255,.12)`

### Typography
- **Schibsted Grotesk** (Google Fonts, 400–900) — everything; headlines weight 900 with letter-spacing −0.03/−0.04em, line-height ~0.97–1.0
- **JetBrains Mono** (400–600) — microlabels/eyebrows (10–11px, letter-spacing 0.08–0.14em, uppercase, often `// PREFIXED`), scores, timestamps
- **Newsreader italic** — only decorative logo-marquee wordmarks on landing
- Scale: h1 34–66px / h2 30–44px / h3 20px / body 14–17.5px / labels 10–13px

### Borders, radius, shadows
- Signature border: `1.5px solid #0B0B0B` on nearly every card, button, input, chip
- Radius: cards 14–18px, buttons/inputs 8–10px, chips/pills 999px
- Signature shadow: hard offset, no blur — e.g. `6px 6px 0 #0B0B0B` (hover-lift: `box-shadow: 5px 5px 0 #0B0B0B` + `translate(-2px,-2px)`); hero card `7px 7px 0 rgba(11,11,11,.85)`; focus: `3px 3px 0 #6FD6E3`
- Pixel-sprite decoration: clusters of 13–17px squares (lime/violet/black SVG rects), some blinking via steps(2) opacity animation, cluster floats ±10px over 5–7s

### Spacing
- Page gutter 48px (32px inner content); max content width 1160px (forms 400–860px)
- Section padding 80–88px vertical; card padding 24–32px; grid gaps 18px (cards) / 8–12px (chips)

## Screens / Views

### 1. Landing — `Landing 4a v2.dc.html` (primary) and `Landing 4a.dc.html` (simpler v1)
- **Nav (sticky)**: `rgba(111,214,227,.9)` + backdrop-blur, 1.5px black bottom border. Pixel logo + wordmark left; Product/Pricing/Samples links, outlined "Sign in", black "Get started" right.
- **Hero**: cyan field with dot-grid overlay (`radial-gradient` dots, 28px grid), two floating pixel-sprite SVGs. Left: live-counter badge pill, 66px headline, subcopy, black CTA + translucent white secondary. Right: white resume card (7px offset shadow) with skeleton lines; three bullets highlight sequentially (background-size animation); a **pixel magnifying-lens SVG sweeps over the card** (9s keyframe path); score chips pop in staggered (keywords 91 / impact +9 / role_fit 88); header score counts up 0→82 (~1.4s, cubic ease-out).
- **Logo marquee**: white band, "Trusted by 120,000+ job seekers", infinite left-scroll of 6 fictional wordmarks (duplicate row, translateX(−50%) loop, 20s).
- **X-ray section**: draggable before/after. Left = styled human resume (Maya Chen sample); right = black terminal panel showing parse failures (lime/red mono text). Divider driven by an invisible full-size range input (18–82%); handle pill + HUMAN/MACHINE tags.
- **How it works**: 3 bordered cards (numbered squares cyan/lime/violet), hover offset-shadow lift.
- **Rewrite Lab (lime bg)**: interactive — "Run AI rewrite" types the improved bullet char-by-char (28ms tick) into a black card, then shows gain badge and animates an impact-score bar (34→86/91/84); "Try another bullet" cycles 3 samples.
- **Dark section**: version-history pitch + bar chart v1 48 → v4 82 (lime final bar).
- **Pricing teaser**: Monthly/Annual segmented toggle (Pro $12 → $9); Free + Pro cards.
- **CTA panel**: violet rounded panel, lime button with blinking cursor. **Footer**: white, logo + links + mono copyright.

### 2. Auth — `Auth.dc.html`
Split screen. Left (cyan, dot grid, 1.5px black right border): logo (links back to landing), floating pixel sprite, 44px headline "The bots read fast. Read faster.", mono footer note. Right (400px column, centered): Sign up/Sign in segmented pill toggle (swaps title/subtitle/CTA copy), Google button, "OR WITH EMAIL" divider, Email + Password inputs (focus: cyan offset shadow), black CTA → Onboarding. Terms line below.

### 3. Onboarding — `Onboarding.dc.html`
Top bar with logo + "SETUP · STEP n OF 3". 660px centered column. 3-segment progress bar (filled segments lime). Step 1: role chip grid (8 roles, selected = black bg/white text) + free-text input. Step 2: 2×2 seniority cards (Entry/Mid/Senior/Lead; selected = lime bg). Step 3: summary card (cyan, pop-in) "Your target: {role} · {level}" + lime CTA → Upload. Back/Continue controls (Back disabled-grey on step 1).

### 4. Home — `Home.dc.html`
**App nav (all authenticated pages share it)**: white, sticky, 1.5px black bottom border. Logo + pill links Home/Upload/History/Settings (active = cyan pill with black border); right: lime mono badge "FREE PLAN · 1 SCAN LEFT" (→ Pricing) + violet avatar circle "M".
Content (1160px): date eyebrow + "Morning, Maya." + black "+ New scan" button. Grid 1.5fr/1fr: cyan current-resume card (conic-gradient score ring 82, filename, target, 3 white chips) → Report; lime "REWRITES WAITING / 7" card → Report. Row 2: white score-trend bar chart (v1–v4, each bar bordered; → History) and white activity feed (colored square bullets, mono timestamps).

### 5. Upload — `Upload.dc.html`
App nav (Upload active). 760px column. Title + "Scored against: Product Manager · Senior — change". Three states:
- **Idle**: large dashed dropzone (2.5px dashed, 18px radius) with floating document+pixel SVG, "Drop your resume here", black Choose-file button; hover tints cyan. Trust row in mono below.
- **Scanning** (click dropzone): black terminal card, lime scan-beam sweeps, 5 pipeline lines progress ✓/▸/· (850ms per step), lime progress bar.
- **Done**: lime card pops in with score ring 82, "Scan complete — v5 saved", stats, black CTA → Report.

### 6. Resume Report — `Resume Report.dc.html`
App nav. Breadcrumb + filename h1; "Compare versions" (outlined → History) + "Re-scan" (black → Upload).
- **Score panel** (cyan): 132px conic score ring 82/100·V4 + five labeled bars (Keywords 91 ▲4, Impact 78 ▲9, Formatting 85 ▲2, Clarity 74 ▲6, Role fit 88 ▲3), bars animate width on load.
- **Left column — AI rewrites**: bordered list, lime header "AI rewrites · N waiting". Each row: struck-through before, bold after, **Accept rewrite** button (black; toggles to lime "✓ Accepted"), gain chip (+3 IMPACT etc.), dimension tag. Accepting updates remaining count and projected score.
- **Right column**: matched keywords card (lime bordered chips with ✓); missing-keywords card (black bg, dashed chips: OKRs, go-to-market, B2B SaaS + explanation); violet **Projected** card = 82 + 2×accepted + 3 (live).

### 7. History — `History.dc.html`
App nav (History active). Title + "▲ +34 SINCE V1" lime badge. **Clickable bar chart** (v1 Jun 12 · 48, v2 Jun 18 · 61, v3 Jun 25 · 74, v4 Jul 2 · 82); selected bar = lime with offset shadow. Below, driven by selection: cyan detail card with the 5 dimension bars for that version + "Open report ▸"; white "What changed in vN" card with 3 violet-diamond bullets per version.

### 8. Settings — `Settings.dc.html`
App nav (Settings active). 860px column. Cards: **Account** (Name/Email/Target-role inputs + Save); **Notifications** (3 rows with working toggle switches — 52×28px pill, lime when on, knob slides); **Plan** (lime card, "Free · 1 scan/month…" + black "Upgrade to Pro" → Pricing); **Danger zone** (red-bordered, "Delete everything" outlined red button, fills red on hover).

### 9. Pricing — `Pricing.dc.html`
Public nav (cyan; Pricing underlined). Centered 52px headline + Monthly/Annual toggle (−25%: Pro $12→$9, Career+ $28→$21). Three tier cards: **Free** (white, ✓/✗ list), **Pro** (cyan, 7px offset shadow, violet MOST POPULAR badge), **Career+** (black bg, lime price). All CTAs → Auth. Below: FAQ accordion (4 items, one open at a time, +/− markers).

## Interactions & Behavior (summary)
- Buttons/cards hover: hard offset shadow + slight up-left translate (0.15s ease). Inputs focus: cyan offset shadow.
- Navigation is plain `<a>` links between pages (see per-screen notes for the graph).
- Animations: marquees (20–30s linear infinite, duplicated content, translateX(−50%)); pixel-blink `steps(2)` opacity; float ±8–10px 5–7s; bar-width grow on load (staggered 0.15s delays); pop-in scale(.5)→1; scroll-reveal on landing sections (translateY 36px + fade via `animation-timeline: view()` — progressive enhancement, fine to implement with IntersectionObserver).
- All interactive state is client-side only; see the logic class in each file for exact transitions.

## State Management
- Auth: `mode: 'up' | 'in'`
- Onboarding: `step 1–3`, `role`, `level`
- Upload: `phase: idle → scanning (step 0–5, 850ms) → done`
- Report: `accepted: {id: bool}` → derives remaining count + projected score
- History: `sel: 0–3` (selected version)
- Settings: 3 notification booleans
- Pricing/Landing: `annual: bool`, FAQ `open: index`, rewrite-lab typing state
- Real app additionally needs: current user, resume versions + scores per dimension, rewrite suggestions per version, keyword match/missing lists, plan/quota.

## Assets
- No external images. All decoration is inline SVG (pixel-square sprites, document icon, magnifying lens, Google "G").
- Fonts from Google Fonts: Schibsted Grotesk, JetBrains Mono, Newsreader (landing marquee only), Space Grotesk (landing v1 marquee only).
- Company wordmarks in the marquee are fictional placeholders — replace with real logos or remove.

## Files
- `Landing 4a v2.dc.html` — landing (primary, interactive)
- `Landing 4a.dc.html` — landing v1 (simpler, static reference)
- `Auth.dc.html`, `Onboarding.dc.html`, `Home.dc.html`, `Upload.dc.html`, `Resume Report.dc.html`, `History.dc.html`, `Settings.dc.html`, `Pricing.dc.html`
- `support.js` — runtime that makes the `.dc.html` files render; reference only, do not ship
