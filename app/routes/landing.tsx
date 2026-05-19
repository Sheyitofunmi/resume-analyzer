import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import Footer from "~/components/Footer";
import MobileBottomNav from "~/components/MobileBottomNav";
import PricingTiers from "~/components/PricingTiers";
import { Corners, Cursor, FeatureChip, ScoreBar } from "~/components/atoms";
import { usePuterStore } from "~/lib/puter";

// ── Animated terminal demo ─────────────────────────────────────────────
const TERMINAL_LINES = [
  {
    text: "$ resumelens analyze --pdf=resume.pdf --jd=frontend-eng",
    delay: 0,
    type: "cmd",
  },
  { text: "> parsing pdf…", delay: 800, type: "step" },
  { text: "done", delay: 1400, type: "done" },
  { text: "> diffing against jd…", delay: 1800, type: "step" },
  { text: "running", delay: 2400, type: "running" },
  { text: "> scoring 5 dimensions…", delay: 3200, type: "step" },
  { text: "done", delay: 3800, type: "done" },
  { text: "> overall_score: 87  status: PASS", delay: 4400, type: "result" },
];

function TerminalDemo() {
  const [visible, setVisible] = useState<number[]>([]);

  useEffect(() => {
    const timers = TERMINAL_LINES.map((line, i) =>
      setTimeout(() => setVisible((v) => [...v, i]), line.delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border-hi)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        fontFamily: "var(--font-mono)",
        fontSize: 13,
        position: "relative",
      }}
    >
      <Corners />
      {/* Window chrome */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "var(--bg-3)",
        }}
      >
        {["var(--ember)", "var(--copper)", "var(--phos)"].map((c, i) => (
          <span
            key={i}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: c,
              opacity: 0.7,
            }}
          />
        ))}
        <span
          style={{
            marginLeft: 10,
            fontSize: 11,
            color: "var(--fg-3)",
            flex: 1,
          }}
        >
          resumelens · live_demo
        </span>
        <span style={{ fontSize: 10, color: "var(--fg-4)" }}>v1.0.0</span>
      </div>

      {/* Lines */}
      <div
        style={{
          padding: "16px 18px",
          minHeight: 160,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {TERMINAL_LINES.map((line, i) => {
          if (!visible.includes(i)) return null;
          const color =
            line.type === "cmd"
              ? "var(--fg-1)"
              : line.type === "done"
                ? "var(--phos)"
                : line.type === "running"
                  ? "var(--copper)"
                  : line.type === "result"
                    ? "var(--phos)"
                    : "var(--fg-2)";
          return (
            <div key={i} style={{ color, display: "flex", gap: 8 }}>
              {line.type === "step" && (
                <span style={{ color: "var(--fg-4)" }}>{">"}</span>
              )}
              <span>{line.text}</span>
            </div>
          );
        })}
        {visible.length > 0 && visible.length < TERMINAL_LINES.length && (
          <span className="rl-cursor" style={{ background: "var(--phos)" }} />
        )}
      </div>
    </div>
  );
}

// ── Feature cards ──────────────────────────────────────────────────────
const FEATURES = [
  {
    tag: "ATS",
    title: "ATS compatibility score",
    desc: "Diff against the parser engines actual recruiters use. We tell you whether your resume even makes it past the bouncers.",
    viz: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
          marginTop: 8,
        }}
      >
        {[82, 71, 55].map((s, i) => (
          <ScoreBar key={i} score={s} cells={22} />
        ))}
      </div>
    ),
  },
  {
    tag: "KW",
    title: "keyword gap analysis",
    desc: "Compare every signal in the JD to your resume. Get a list of missing terms with relevance scores. Copy-paste ready.",
    viz: (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
        {[
          { label: "+ React", found: true },
          { label: "+ TypeScript", found: true },
          { label: "- GraphQL", found: false },
          { label: "- Postgres", found: false },
        ].map((k) => (
          <span
            key={k.label}
            className={`rl-chip ${k.found ? "rl-chip-phos" : "rl-chip-ember"}`}
          >
            {k.label}
          </span>
        ))}
      </div>
    ),
  },
  {
    tag: "RW",
    title: "AI rewrite suggestions",
    desc: "Each weak bullet gets a rewrite with stronger verbs, quantified impact, and tighter language. Approve or skip per line.",
    viz: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          marginTop: 8,
        }}
      >
        <div
          style={{
            padding: "8px 10px",
            background: "rgba(227,83,74,0.08)",
            border: "1px solid var(--ember-dim)",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--ember)",
          }}
        >
          - "Helped improve the website."
        </div>
        <div
          style={{
            padding: "8px 10px",
            background: "rgba(168,230,163,0.08)",
            border: "1px solid var(--phos-dim)",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--phos)",
          }}
        >
          + "Cut page-load p95 by 200 ms, lifting conversion 8%."
        </div>
      </div>
    ),
  },
  {
    tag: "IV",
    title: "interview question prep",
    desc: "Behavioral + technical questions tailored to the JD and your seniority. Each comes with a confidence rubric.",
    viz: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
          marginTop: 8,
        }}
      >
        {[
          "tell me about a time you led a high-stakes migration",
          "walk me through your architecture for…",
          "what was your most ambiguous project?",
        ].map((q, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 8,
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--fg-2)",
            }}
          >
            <span style={{ color: "var(--fg-4)", flexShrink: 0 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span>{q}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    tag: "TS",
    title: "tone & style analysis",
    desc: "Action-verb density, sentence variety, hedging language. ResumeLens flags weak phrasing and shows you the fix.",
    viz: null,
  },
  {
    tag: "HX",
    title: "score history & trends",
    desc: "Every analysis is versioned. Watch your overall score climb after each iteration. Diff any two side-by-side.",
    viz: (
      <svg
        width="100%"
        height={48}
        viewBox="0 0 200 48"
        style={{ marginTop: 8 }}
      >
        <polyline
          points="0,42 40,36 80,28 120,18 160,10 200,4"
          fill="none"
          stroke="var(--phos)"
          strokeWidth={2}
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px var(--phos-glow))" }}
        />
        <circle cx={200} cy={4} r={4} fill="var(--phos)" />
      </svg>
    ),
  },
];

// ── Testimonials ───────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote:
      "I shipped my resume through three rounds without a single ATS rejection. Got the offer on the fourth interview.",
    name: "Sam K.",
    role: "Senior Frontend Engineer",
    company: "Linear",
    lift: "+19",
  },
  {
    quote:
      "The keyword diff alone made the difference. I added two words and went from page 3 of applicant search to first round.",
    name: "Priya M.",
    role: "Product Designer",
    company: "Stripe",
    lift: "+24",
  },
  {
    quote:
      "Best ROI of any career tool I have used. Three seconds per resume, hundreds of applications, actually unfair.",
    name: "Devon R.",
    role: "Staff Engineer",
    company: "Vercel",
    lift: "+31",
  },
];

// ── FAQ ────────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "is my resume sent to a third party?",
    a: "No. Your PDF is processed locally via Puter — it never touches our servers or any third-party model provider directly. The AI analysis uses the Claude API through Puter's secure pipeline.",
  },
  {
    q: "what AI model do you use?",
    a: "Claude (Anthropic) for scoring and rewrites. We are model-agnostic at the architecture level; if a better model ships, we will use it.",
  },
  {
    q: "how is the ATS score calculated?",
    a: "We extract structured data from your resume and diff it against keyword signals in the job description, weighted by frequency and placement. The score reflects how well you'd parse in common ATS engines.",
  },
  {
    q: "can I compare two resumes?",
    a: "Yes — from the dashboard, enable compare mode and select any two resumes. You'll get a side-by-side diff of every dimension plus keyword overlap.",
  },
  {
    q: "do you store my data?",
    a: "All data is stored in your Puter account — encrypted, private, and only accessible to you. We have no database of user resumes.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        borderBottom: "1px dashed var(--border)",
        padding: "0",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 0",
          textAlign: "left",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "var(--fg-4)",
            flexShrink: 0,
          }}
        >
          {open ? "▼" : "▶"}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 14,
            color: "var(--fg-1)",
          }}
        >
          {q}
        </span>
      </button>
      {open && (
        <div
          style={{
            paddingBottom: 16,
            paddingLeft: 24,
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--fg-2)",
            lineHeight: 1.7,
          }}
        >
          {a}
        </div>
      )}
    </div>
  );
}

// ── LandingNavbar ──────────────────────────────────────────────────────
function LandingNavbar() {
  const { auth } = usePuterStore();

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 32px",
        borderBottom: "1px solid var(--border)",
        background: "rgba(11,11,10,0.88)",
        backdropFilter: "blur(8px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        gap: 16,
      }}
    >
      {/* Logo */}
      <Link
        to={auth.isAuthenticated ? "/" : "/landing"}
        style={{ textDecoration: "none" }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "var(--font-mono)",
            fontSize: 16,
            fontWeight: 500,
            color: "var(--fg-1)",
          }}
        >
          <span
            style={{
              width: 22,
              height: 22,
              background: "var(--phos)",
              color: "var(--bg)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              fontWeight: 700,
              boxShadow: "0 0 12px var(--phos-glow)",
            }}
          >
            R
          </span>
          resumelens<span style={{ color: "var(--phos)" }}>_</span>
        </span>
      </Link>

      {/* Nav links */}
      <div
        className="rl-mobile-hide"
        style={{ display: "flex", gap: 28, alignItems: "center" }}
      >
        {["features", "how_it_works", "pricing", "faq"].map((item) => (
          <a
            key={item}
            href={`#${item}`}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--fg-3)",
              textDecoration: "none",
              letterSpacing: "0.05em",
              transition: "color var(--dur-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg-1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-3)")}
          >
            {item}
          </a>
        ))}
      </div>

      {/* Right CTAs */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {auth.isAuthenticated ? (
          <Link
            to="/"
            className="rl-btn rl-btn-primary"
            style={{ fontSize: 12 }}
          >
            → open_dashboard
          </Link>
        ) : (
          <>
            <Link
              to="/auth"
              className="rl-btn rl-btn-ghost rl-mobile-hide"
              style={{ fontSize: 12 }}
            >
              sign_in
            </Link>
            <Link
              to="/auth"
              className="rl-btn rl-btn-primary"
              style={{ fontSize: 12 }}
            >
              $ try_free →
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

// ── Landing page ───────────────────────────────────────────────────────
export default function Landing() {
  const trustRef = useRef<HTMLDivElement>(null);
  const [trustVisible, setTrustVisible] = useState(false);

  useEffect(() => {
    const el = trustRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setTrustVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <main className="rl-page" style={{ paddingBottom: 0 }}>
      <LandingNavbar />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section
        style={{
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "80px 32px 64px",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 48,
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {/* Badge */}
          <div style={{ display: "inline-flex" }}>
            <span
              className="rl-pill rl-pill-good"
              style={{ display: "inline-flex", gap: 8 }}
            >
              <span className="rl-dot" style={{ width: 7, height: 7 }} />
              v1.0 · now in public beta
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontSize: "clamp(40px, 6vw, 72px)",
              fontWeight: 500,
              lineHeight: 1.02,
              letterSpacing: "-2px",
              color: "var(--fg-1)",
              margin: 0,
            }}
          >
            the resume reviewer
            <br />
            you wish you knew
            <Cursor />
          </h1>

          {/* Body */}
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 16,
              color: "var(--fg-2)",
              lineHeight: 1.75,
              margin: 0,
              maxWidth: 480,
            }}
          >
            ResumeLens diffs your resume against any job description, scores
            five dimensions, and tells you exactly what to rewrite. Three
            seconds. No fluff. Built for engineers who'd rather read a
            structured report than a vibe check.
          </p>

          {/* CTAs */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link to="/auth" className="rl-btn rl-btn-primary rl-btn-lg">
              $ analyze_my_resume →
            </Link>
            <a
              href="#before_after"
              className="rl-btn rl-btn-secondary rl-btn-lg"
            >
              see_sample_report
            </a>
          </div>

          {/* Trust indicators */}
          <div
            style={{
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              paddingTop: 4,
            }}
          >
            {[
              "✓ no signup to try",
              "✓ pdf never leaves your puter cloud",
              "✓ 3 sec avg",
            ].map((t) => (
              <span
                key={t}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--fg-3)",
                  letterSpacing: "0.06em",
                }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Terminal demo */}
        <div>
          <TerminalDemo />
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────── */}
      <section
        ref={trustRef}
        style={{
          width: "100%",
          borderTop: "1px dashed var(--border)",
          borderBottom: "1px dashed var(--border)",
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          gap: 32,
          overflow: "hidden",
          flexWrap: "wrap",
        }}
      >
        <span className="rl-eyebrow" style={{ flexShrink: 0 }}>
          trusted by job seekers at
        </span>
        <div style={{ display: "flex", gap: 32, flex: 1, flexWrap: "wrap" }}>
          {[
            "Linear",
            "Stripe",
            "Vercel",
            "Anthropic",
            "Figma",
            "Notion",
            "Cloudflare",
          ].map((co, i) => (
            <span
              key={co}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                fontWeight: 500,
                color: trustVisible ? "var(--fg-3)" : "transparent",
                transition: `color 400ms ${i * 80}ms`,
                letterSpacing: "0.02em",
              }}
            >
              {co}
            </span>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────── */}
      <section
        id="features"
        style={{
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "80px 32px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            textAlign: "center",
            marginBottom: 48,
          }}
        >
          <span className="rl-eyebrow">// features</span>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              color: "var(--fg-1)",
              fontWeight: 500,
              letterSpacing: "-1.5px",
            }}
          >
            every signal that matters,
            <br />
            in one place
            <Cursor />
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {FEATURES.map((f) => (
            <div
              key={f.tag}
              className="rl-card rl-glow-hover"
              style={{ position: "relative" }}
            >
              <Corners />
              <div
                style={{ display: "flex", flexDirection: "column", gap: 10 }}
              >
                <FeatureChip tag={f.tag} label={f.title} />
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    color: "var(--fg-2)",
                    lineHeight: 1.65,
                  }}
                >
                  {f.desc}
                </p>
                {f.viz}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section
        id="how_it_works"
        style={{
          width: "100%",
          borderTop: "1px dashed var(--border)",
          padding: "80px 32px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              textAlign: "center",
            }}
          >
            <span className="rl-eyebrow">// how_it_works</span>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                color: "var(--fg-1)",
                fontWeight: 500,
                letterSpacing: "-1.5px",
              }}
            >
              three commands. three seconds.
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 20,
            }}
          >
            {[
              {
                step: "STEP_01",
                cmd: "$ upload",
                title: "Drop your PDF",
                desc: "A PDF resume and the job description you're targeting. That's it.",
              },
              {
                step: "STEP_02",
                cmd: "$ analyze",
                title: "AI scores 5 dimensions",
                desc: "ATS, tone, content, structure, skills. With reasoning attached.",
              },
              {
                step: "STEP_03",
                cmd: "$ rewrite",
                title: "Apply tips & ship",
                desc: "Specific rewrites, keyword diff, interview prep — copy/paste-ready.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rl-card"
                style={{ position: "relative" }}
              >
                <Corners />
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--copper)",
                        fontWeight: 700,
                      }}
                    >
                      {s.step}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--fg-4)",
                      }}
                    >
                      {s.cmd}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 18,
                      fontWeight: 500,
                      color: "var(--fg-1)",
                      margin: 0,
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-body)",
                      fontSize: 14,
                      color: "var(--fg-2)",
                      lineHeight: 1.65,
                    }}
                  >
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ───────────────────────────────────────── */}
      <section
        id="before_after"
        style={{
          width: "100%",
          borderTop: "1px dashed var(--border)",
          padding: "80px 32px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              textAlign: "center",
            }}
          >
            <span className="rl-eyebrow">// before_after</span>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                color: "var(--fg-1)",
                fontWeight: 500,
                letterSpacing: "-1.5px",
              }}
            >
              watch a weak bullet
              <br />
              get an unfair edge
              <Cursor />
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto 1fr",
              gap: 20,
              alignItems: "start",
            }}
          >
            {/* Before */}
            <div className="rl-card" style={{ position: "relative" }}>
              <Corners />
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--fg-3)",
                      letterSpacing: "0.15em",
                    }}
                  >
                    BEFORE
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 28,
                      fontWeight: 700,
                      color: "var(--ember)",
                      letterSpacing: "-1px",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    48
                    <span style={{ fontSize: 14, color: "var(--fg-4)" }}>
                      /100
                    </span>
                  </span>
                </div>
                {[
                  "Helped improve the website.",
                  "Worked with the team on new features.",
                  "Used React.",
                  "Was responsible for code reviews.",
                ].map((b) => (
                  <div
                    key={b}
                    style={{
                      display: "flex",
                      gap: 8,
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      color: "var(--fg-3)",
                    }}
                  >
                    <span style={{ color: "var(--fg-4)" }}>-</span> {b}
                  </div>
                ))}
              </div>
            </div>

            {/* Rewrite button */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: 48,
              }}
            >
              <div
                style={{
                  background: "var(--copper)",
                  color: "var(--bg)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  fontWeight: 700,
                  padding: "10px 18px",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--glow-copper)",
                  whiteSpace: "nowrap",
                }}
              >
                $ rewrite
              </div>
            </div>

            {/* After */}
            <div className="rl-card is-phos" style={{ position: "relative" }}>
              <Corners />
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: "var(--fg-3)",
                      letterSpacing: "0.15em",
                    }}
                  >
                    AFTER
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 28,
                      fontWeight: 700,
                      color: "var(--phos)",
                      letterSpacing: "-1px",
                      fontVariantNumeric: "tabular-nums",
                      textShadow: "0 0 14px var(--phos-glow)",
                    }}
                  >
                    89
                    <span style={{ fontSize: 14, color: "var(--fg-3)" }}>
                      /100
                    </span>
                  </span>
                </div>
                {[
                  "Cut page-load p95 by 200 ms, lifting conversion 8%.",
                  "Shipped 4 major features end-to-end with 3 engineers; 0 rollbacks.",
                  "Migrated app to React + TypeScript; reduced bundle 38%.",
                  "Reviewed 200+ PRs; mentored 3 juniors, 2 promoted in a year.",
                ].map((b) => (
                  <div
                    key={b}
                    style={{
                      display: "flex",
                      gap: 8,
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      color: "var(--fg-1)",
                    }}
                  >
                    <span style={{ color: "var(--phos)", flexShrink: 0 }}>
                      +
                    </span>{" "}
                    {b}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section
        id="signal_from_users"
        style={{
          width: "100%",
          borderTop: "1px dashed var(--border)",
          padding: "80px 32px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              textAlign: "center",
            }}
          >
            <span className="rl-eyebrow">// signal_from_users</span>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                color: "var(--fg-1)",
                fontWeight: 500,
                letterSpacing: "-1.5px",
              }}
            >
              from job-seeker to job-shipper
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="rl-card"
                style={{ position: "relative" }}
              >
                <Corners />
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  <p
                    style={{
                      margin: 0,
                      fontFamily: "var(--font-body)",
                      fontSize: 14,
                      color: "var(--fg-1)",
                      lineHeight: 1.7,
                      flex: 1,
                    }}
                  >
                    "{t.quote}"
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      paddingTop: 8,
                      borderTop: "1px dashed var(--border)",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          fontFamily: "var(--font-mono)",
                          fontSize: 13,
                          color: "var(--fg-1)",
                          fontWeight: 500,
                        }}
                      >
                        {t.name}
                      </p>
                      <p
                        style={{
                          margin: "2px 0 0",
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--fg-3)",
                        }}
                      >
                        {t.role} · shipped at {t.company}
                      </p>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--phos)",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <span style={{ fontSize: 10 }}>▲</span> {t.lift}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────── */}
      <section
        id="pricing"
        style={{
          width: "100%",
          borderTop: "1px dashed var(--border)",
          padding: "80px 32px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 48,
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              textAlign: "center",
            }}
          >
            <span className="rl-eyebrow">// pricing</span>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                color: "var(--fg-1)",
                fontWeight: 500,
                letterSpacing: "-1.5px",
              }}
            >
              one tier away from your offer
            </h2>
          </div>
          <PricingTiers />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section
        id="faq"
        style={{
          width: "100%",
          borderTop: "1px dashed var(--border)",
          padding: "80px 32px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 48,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              textAlign: "center",
            }}
          >
            <span className="rl-eyebrow">// frequently_asked</span>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                color: "var(--fg-1)",
                fontWeight: 500,
                letterSpacing: "-1.5px",
              }}
            >
              answers, before you ask
            </h2>
          </div>

          <div
            className="rl-card"
            style={{ position: "relative", padding: "0 24px" }}
          >
            <Corners />
            {FAQS.map((f) => (
              <FAQItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section
        id="ship_it"
        style={{
          width: "100%",
          borderTop: "1px dashed var(--border)",
          padding: "100px 32px",
          boxSizing: "border-box",
          textAlign: "center",
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 24,
          }}
        >
          <h2
            style={{
              fontSize: "clamp(32px, 5vw, 56px)",
              color: "var(--fg-1)",
              fontWeight: 500,
              letterSpacing: "-2px",
              lineHeight: 1.1,
            }}
          >
            your next offer is one
            <br />
            analysis away
            <Cursor />
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              color: "var(--fg-2)",
              margin: 0,
              lineHeight: 1.7,
              maxWidth: 480,
            }}
          >
            No signup to try. No credit card. Drop a PDF, paste a JD, read the
            report in three seconds.
          </p>
          <Link to="/auth" className="rl-btn rl-btn-primary rl-btn-lg">
            $ analyze_my_resume →
          </Link>

          {/* Feature strip */}
          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              justifyContent: "center",
              paddingTop: 8,
            }}
          >
            {[
              ["ATS", "ats_score"],
              ["KW", "keyword_analysis"],
              ["RW", "rewrite_tips"],
              ["TS", "tone_style"],
              ["IV", "interview_prep"],
            ].map(([tag, label]) => (
              <FeatureChip key={tag} tag={tag} label={label} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}
