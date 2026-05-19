# ResumeLens — Claude Code handoff prompt

> Copy the **PROMPT** block below into Claude Code (or any agent IDE) to rebuild **ResumeLens · CIPHER** as a production codebase. Everything below the prompt is reference material the agent can read.

---

## PROMPT (copy this verbatim)

````
You are building a production-ready web app called **ResumeLens** — an AI-powered resume analyzer.

The full visual + interaction design is already specified in this design system. Your job is to translate it into a real, deployable codebase. Treat the design system as ground truth — do not invent new visuals; match what's specified.

### Stack

- **Language**: TypeScript (strict)
- **Styling**: TailwindCSS v4 with CSS variables from `colors_and_type.css`
- **State**: Zustand for client state, React Router loaders for server data
- **AI**: Anthropic Claude (claude-sonnet-4-5 for analysis, claude-haiku-4-5 for rewrites)
- **Storage / Auth**: Puter.js (auth + KV + filesystem) — exactly as the original codebase uses it
- **PDF parsing**: pdfjs-dist
- **Build**: Vite

### Aesthetic — CIPHER
This is a **dark, terminal-luxury** system. Not a generic dark mode.

- Background: warm oxide black `#0b0b0a` with a **40×40px terminal grid** overlay
- Text: cream `#ebe6d6`, never pure white
- Brand colors: phosphor green `#a8e6a3` (positive/CTA), copper `#c47b4a` (warmth/accents), ember `#e3534a` (error)
- Font: **JetBrains Mono** for everything (weights 400/500/700), Inter only for paragraphs > 2 lines
- Headlines: lowercase identifiers (`track_your_applications`) with blinking phosphor `_` cursor at the end
- Buttons: terminal-flavored (`$ run analyze →`, `← back_to_dashboard`, `↓ download_report`)
- No emoji — use Unicode glyphs: `+ − ✓ ✕ ▲ ▼ ◆ ● $ //`
- Every card: 1px hairline border + **4 copper corner crosshair** marks at the corners (10px each)
- Radii: 4px default. Pills (9999px) reserved for status pills only.
- Score tiers: `> 69` phos (PASS), `50–69` copper-hi (WARN), `< 50` ember (FAIL)

### Build order
1. **Scaffold**: Vite + React Router v7 + TailwindCSS v4 + TypeScript. Set up Puter SDK + Anthropic API key in env.
2. **Tokens**: copy `colors_and_type.css` and `tokens.css` into `src/styles/`. Wire Tailwind theme to read these CSS vars.
3. **Atoms**: build the 18 primitive components listed in COMPONENT REFERENCE below.
4. **Chrome**: Navbar (sticky terminal status line), Footer, StatsStrip (with `useCountUp` + `IntersectionObserver`), HowItWorks 3-step grid.
5. **Routes** (this is the full sitemap):
   - `/` → Landing (hero + animated terminal demo + features + before/after + testimonials + FAQ + CTA)
   - `/pricing` → 3 tiers (free / pro recommended / recruiter)
   - `/auth` → Puter sign-in
   - `/onboarding` → 4-step wizard (role → seniority → industries → goal)
   - `/dashboard` (Home) → Resume card grid + stats strip + compare mode + empty state
   - `/upload` → Form (company / JD / PDF dropzone) + 4-step processing pipeline
   - `/resume/:id` → Full feedback report (Summary + Checklist + ATS + Accordion + Interview Prep + Rewrites)
   - `/editor/:id` → Split view: doc + AI sidebar with inline rewrite suggestions
   - `/history` → Score timeline (line chart + KPI cards + per-dimension sparklines + run log)
   - `/settings` → Profile / Career / Notifications / Plan / Theme / Data
6. **AI integration**: 5-dimension scorer (ATS, Tone & Style, Content, Structure, Skills), keyword diff, rewrite generator, interview-question generator. Use structured JSON output.
7. **Keyboard**: Wire ⌘K command palette globally. In editor: ⌘↵ to apply suggestion, ⌘Z undo, Esc dismiss.
8. **Responsive**: Mobile bottom nav under 720px (5 slots: home / upload / editor / report / pricing).
9. **Mobile-specific**: split-view editor stacks vertically; resume report stacks (preview below feedback); stats strip becomes 2×2.

### Hard rules
- Use the **exact** CSS variables from `colors_and_type.css`. Don't redefine colors.
- Headlines always end in `<span class="rl-cursor"></span>`.
- Every card needs `position: relative` + 4 `<Corner />` children.
- Score numbers always use `font-variant-numeric: tabular-nums` and have a phosphor `text-shadow` glow.
- ASCII bars use `█` (filled) and `░` (empty) characters, never images. The fill char is `--phos`; empty is `--fg-4`. 28 chars = 100%.
- Status pills are always UPPERCASE (PASS / WARN / FAIL / 87/100 / BORDERLINE).
- Comments / eyebrows always start with `//` (comment) or `$` (prompt).
- The Puter SDK script must load before the app: `<script src="https://js.puter.com/v2/"></script>`.

### Out of scope (do NOT add)
- Light theme — system is dark-only by design.
- Emoji icons.
- Bluish-purple gradients.
- Glassmorphism beyond a single backdrop-blur on the sticky navbar.
- Marketing-style rounded pill buttons (use 4px radius for buttons).
- Stock illustrations or marketing imagery — product is data-first.
````

---

## COMPONENT REFERENCE (every component named, with feature list)

### Atoms (`components.jsx`)
| Component | Features |
|---|---|
| **Logo** | Phosphor R-square mark + lowercase `resumelens_` wordmark with trailing phosphor cursor. Configurable size. |
| **Corners** | 4 copper crosshair corners (tl/tr/bl/br), 10px each. Drop into any `.rl-card`. |
| **Cursor** | Blinking phosphor `_` (1s steps). Sits at the end of every hero headline. |
| **Dot** | Pulsing phosphor live-status indicator (1.5s ease-in-out scale 1→1.3). |
| **Button** | 4 variants: `primary` (phos + glow), `secondary` (border-hi), `copper`, `ghost`. Sizes: md / lg. `block` prop for full-width. No scale-on-press — color shift only. |
| **Input** | Surface bg + 1px border. Focus = phos border + 1px box-shadow ring + phos glow. Label uses `//` prefix. |
| **Textarea** | Same as Input but uses Inter (long-form). Min-height 120px, vertical resize. |
| **Label** | `//` prefix, lowercase, copper letter-spacing. |
| **Eyebrow** | Two modes: `prompt` (`$ command…`) or plain (`// comment`). |
| **Comment** | Auto-prepends `// ` to any text. |
| **StatusPill** | UPPERCASE pill with 1px border + tier-tinted bg. Tiers: good / warn / bad / neutral. |
| **Tag** | Sugar for StatusPill (used in count badges like `3 critical`). |
| **ScoreNumber** | 88px phosphor digit with 22px text-shadow glow + `/100` suffix. Auto-tiers color (phos/copper-hi/ember). |
| **ScoreCircle** | Animated SVG ring (1200ms stroke-dashoffset), tier-colored, with score + `OF 100` label centered. Sizes 56–100. |
| **ScoreBar** | 28-cell ASCII bar (`█`/`░`). Auto-tiers. Inline element. |
| **ScoreBars** | 5-row block — one ScoreBar per dimension (ats / tone / cont / struc / skill). |
| **KeywordRow** | `01 + React` style row with phos `+` (found) or ember `−` (missing). Optional inline `// note`. |
| **FeatureChip** | `[KEY] label` chip with copper bracketed key. |

### Chrome (`chrome.jsx`)
| Component | Features |
|---|---|
| **Navbar** | Sticky terminal status line at top. Logo left, `$ resumelens dashboard` prompt center, avatar + primary CTA right. Hides center prompt on mobile. |
| **Footer** | 4-column grid: brand / product links / powered_by / status. Feature-chip strip on top. Copyright + privacy line bottom. |
| **StatsStrip** | 4-up data grid. Each cell counts up from 0 over 1.2s when entering viewport. Phos digits with glow. Collapses to 2×2 on mobile. |
| **HowItWorks** | 3-step grid: 01 upload → 02 analyze → 03 rewrite. Each step is a card with color-coded step indicator. |
| **MobileBottomNav** | 5 slots (home / upload / editor / report / pricing). Active slot gets phos glow. Visible under 720px. |
| **Toast** | Slides up bottom-center, 3.2s auto-dismiss. Phos / copper / ember left-border by tier. Glow shadow. |

### Cards (`cards.jsx`)
| Component | Features |
|---|---|
| **ResumeCard** | Thumb image (filter: saturate 0.7 brightness 0.85 for dark integration) + company / role / ScoreCircle. ID badge top-left. Compare mode (phos outline). Delete confirmation popover (rm -f). |
| **FileUploader** | Dashed-border drop zone. Phos hover state. PDF chip when file selected. Click clears or hovers to remove. |
| **Summary** | `is-accent` (copper top-stripe) card. ScoreNumber + ScoreBars side-by-side. Pass/Warn/Fail pill. Footer with `▲ above 75th percentile` + last-run date. |
| **ResumeChecklist** | Tag counts header (critical / warn / strong). Each row: tier glyph + label + detail (` //` comment style). |
| **ATS** | `is-accent` card. Score + status pill header. Tips list (`+` / `!`). Keyword diff chips (phos found, ember missing). |
| **Details** | Accordion. Each section header: `▶`/`▼` chevron + lowercase title + inline score pill. Open section shows tier-tinted tip cards with explanation. |
| **InterviewQuestions** | Tabbed: behavioral / technical. Each Q is `Q01` copper badge + question + `// hint · …` body. |
| **RewriteSuggestions** | BEFORE (ember) / AFTER (phos) cards per bullet. Apply / Revert / Regenerate actions. Pending counter. |
| **ComparePanel** | Side-by-side resume diff grid. Section-by-section bars + winner indicator (`◆`). |

### Screens
| Screen | Features |
|---|---|
| **LandingScreen** | Sticky transparent top bar. Hero (eyebrow pill + huge headline + dual CTA + trust indicators + animated terminal demo). Trust strip (7 companies). 6 feature cards (each with micro-viz: ASCII bars / chips / before-after / numbered questions / sparkline). HowItWorks. Before/After. Testimonials (with `▲ +N` score lifts). Pricing preview. FAQ accordion. Final CTA. Footer. |
| **AuthScreen** | Mac-style window chrome (3 traffic-light dots). Logo + `welcome_back_`. Puter info callout. Primary phos CTA with loading state. Encrypted-status footer. |
| **OnboardingScreen** | 4-step wizard with stepper at top. Steps: role (6 options) → seniority (5 chips) → industries (multi-select chips) → goal (4 radio cards). Continue button disabled until valid. Skip available. |
| **HomeScreen** | Hero heading + sub. Empty state (intro card + HowItWorks + StatsStrip + first-upload CTA) or populated (StatsStrip + toolbar + grid + ComparePanel modal). |
| **UploadScreen** | Hero with eyebrow + headline + feature chip row. Form: Company / JD / FileUploader + Analyze CTA. Processing pipeline (4 steps, animated). |
| **ResumeReportScreen** | Sub-header with file path + Edit + Re-analyze + Download. Split view: sticky preview left, scrolling feedback right (Summary + Checklist + ATS + Details + Interview + Rewrite). Mobile stacks. |
| **EditorScreen** | Sub-bar with save indicator (saved / saving / unsaved) + Undo + Export. Split: left = document (ContentEditable bullets), right = AI sidebar (live score + copilot + smart actions + keyboard hints). Hover bullet shows inline rewrite. ⌘↵ applies first pending. |
| **HistoryScreen** | 4 KPI cards (first / current / analyses / avg-lift). Big line chart with hover crosshair + tooltip card. 5 per-dimension cards with sparklines. Full run log table. |
| **SettingsScreen** | 6 blocks: profile / career / notifications / plan / appearance / data. Each is corner-framed. Segmented controls, terminal toggles, plan card with PRO pill, theme picker. |
| **PricingScreen** | 3 tiers (free / pro recommended with phos glow + RECOMMENDED ribbon / recruiter). Each: tier label + price + tagline + feature list (`+` prefix) + CTA. |
| **CommandPalette** | `⌘K` overlay. Backdrop blur. `$` prompt input. Fuzzy filter. Arrow nav + Enter. 12 commands (navigation + AI actions + sign-out). Active row gets phos left-border. Keyboard hints in footer. |

---

## INTERACTION MODEL

Single-user web app. Linear flow with branches.

```
[anonymous]
     │
     ├─→ Landing (/) ──→ Pricing (/pricing) ──┐
     │                                          │
     │←─────────────────────────────────────────┘
     │
     └─→ Auth (/auth) ──→ [first time?]
                           │
                           ├─→ yes: Onboarding (/onboarding)
                           │    └─→ Dashboard (/dashboard)
                           │
                           └─→ no:  Dashboard (/dashboard)

[authed]
     │
     ▼
Dashboard (/dashboard) ──┬─→ Upload (/upload)
                          │     └─→ [analyze 3s] ──→ Resume Report (/resume/:id)
                          │
                          ├─→ Resume Report (/resume/:id)
                          │     ├─→ Editor (/editor/:id)
                          │     ├─→ Re-analyze (modal/inline form)
                          │     └─→ Download PDF
                          │
                          ├─→ Compare mode → ComparePanel
                          ├─→ Score History (/history)
                          ├─→ Settings (/settings)
                          └─→ Pricing (/pricing)

[everywhere when authed]
     │
     ├─→ ⌘K Command Palette (navigate + AI actions)
     ├─→ Floating ⌘K hint (bottom-right)
     ├─→ Mobile bottom nav (under 720px: home/upload/editor/report/pricing)
     └─→ Toast notifications (bottom-center, 3.2s auto-dismiss)
```

### Core user flow (happy path)
1. Land on `/`. See animated terminal demo. Click `$ analyze_my_resume →`.
2. Sign in via Puter (one tap).
3. Complete onboarding (or skip): role, seniority, industries, goal.
4. Land on Dashboard. Empty state — click `$ upload_first_resume →`.
5. Upload screen: pick company (Linear), role (Senior FE), paste JD, drop PDF.
6. Click `$ run analyze →`. Watch 4-step pipeline animate (convert → upload → analyze → save).
7. Land on Resume Report. See overall 87/100 PASS. Drill into checklist, ATS, accordion details.
8. Hit **`✎ edit_resume`** to enter Editor. Hover a bullet → see AI rewrite. **⌘↵** to apply. Live score climbs.
9. Hit **⌘K** to jump to **Score History**. Watch your overall trend over 7 runs.
10. Done. Toast: `▲ +12 vs last run`.

### Mobile (under 720px)
- Sticky bottom nav appears with 5 slots
- Center prompt in navbar hides
- Stats strip → 2×2
- Split-view screens (editor, report) → stacked
- Floating ⌘K hint hidden (palette still openable via UI)

---

## INDEX of design system files

| File | Purpose |
|---|---|
| `colors_and_type.css` | All CSS variables: tokens, type scale, spacing, radii, shadows, glow, motion |
| `ui_kits/web-app/tokens.css` | Utility classes: buttons, cards, pills, inputs, animations, mobile nav, toast |
| `ui_kits/web-app/components.jsx` | 18 atoms |
| `ui_kits/web-app/chrome.jsx` | Navbar, Footer, StatsStrip, HowItWorks |
| `ui_kits/web-app/cards.jsx` | ResumeCard, FileUploader, Summary, ResumeChecklist, ATS, Details |
| `ui_kits/web-app/screens.jsx` | Auth, Home, Upload, Report, ComparePanel |
| `ui_kits/web-app/screens-extra.jsx` | Landing, Pricing, InterviewQuestions, RewriteSuggestions |
| `ui_kits/web-app/screens-extended.jsx` | Onboarding, Editor, Toast, MobileBottomNav |
| `ui_kits/web-app/screens-final.jsx` | CommandPalette, History, Settings, Reveal |
| `assets/favicon.svg` + `favicon-{16,32,48,64,192}.png` | CIPHER mark |
| `USAGE.md` | Adoption recipe (3 paths) |

---

## VERBATIM COPY REFERENCE

Use these strings exactly. Don't paraphrase.

**Landing**
- Hero h1: *the resume reviewer you wish you knew_*
- Hero body: *ResumeLens diffs your resume against any job description, scores five dimensions, and tells you exactly what to rewrite. Three seconds. No fluff. Built for engineers who'd rather read a structured report than a vibe check.*
- Hero CTA: *`$ analyze_my_resume →`*
- Trust strip eyebrow: *`// trusted by job seekers at`*
- Features h2: *every signal that matters, in one place_*
- HowItWorks h2: *three commands. three seconds.*
- Before/After h2: *watch a weak bullet get an unfair edge_*
- Testimonials h2: *from job-seeker to job-shipper*
- FAQ h2: *answers, before you ask*
- Final CTA h2: *your next offer is one analysis away_*

**Auth**
- h1: *welcome_back_*
- Sub: *Log in to continue your job journey.*
- Callout title: *`// what is puter?`*
- CTA: *`$ log_in_with_puter →`*
- Loading: *`$ authenticating…`*

**Home (dashboard)**
- h1: *track_your_applications_*
- Empty h2: *Drop your first resume_*
- Empty CTA: *`$ upload_first_resume →`*

**Upload**
- h1: *smart_feedback for_your_dream_job_*
- Sub: *Drop your PDF. Paste the JD. We score five dimensions and surface every missing keyword in three seconds.*
- CTA: *`$ run analyze →`*
- Pipeline steps: *convert_pdf_to_image · upload_resume · analyze_against_jd · save_analysis*

**Report**
- ATS subtitle: *How well your resume will parse in Applicant Tracking Systems used by employers.*
- Summary footer: *`▲ above 75th percentile`*

**Editor**
- Save states: *all changes saved · saving… · unsaved*
- Apply: *`+ apply`*  · Skip: *`Esc · skip`*  · Regen: *`↺ regenerate`*

**Toast samples**
- *rewrite applied · +N overall* · good
- *welcome aboard · profile saved* · good
- *analysis complete · ▲ +12 vs last run* · good
- *resume deleted* · warn

---

## ENV / CONFIG

```bash
# .env
ANTHROPIC_API_KEY=sk-ant-...
PUTER_APP_NAME=resumelens
```

```html
<!-- index.html — load Puter before app -->
<script src="https://js.puter.com/v2/"></script>
```

```ts
// AI prompt schema (5-dim scoring)
interface Feedback {
  overallScore: number;  // 0-100
  ATS:           { score: number; tips: Tip[]; keywords: { found: string[]; missing: string[] }; };
  toneAndStyle:  { score: number; tips: Tip[]; };
  content:       { score: number; tips: Tip[]; };
  structure:     { score: number; tips: Tip[]; };
  skills:        { score: number; tips: Tip[]; };
}
interface Tip { type: 'good' | 'improve'; tip: string; explanation: string; }
```
