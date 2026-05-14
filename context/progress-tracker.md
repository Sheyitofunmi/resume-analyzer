# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

- Rich text resume editor implemented

## Current Goal

- End-to-end testing of the new editor features, then deployment.

## Completed

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
