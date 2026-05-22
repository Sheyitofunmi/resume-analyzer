import type { Route } from "./+types/home";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import ResumeCard from "~/components/ResumeCard";
import StatsStrip from "~/components/StatsStrip";
import HowItWorks from "~/components/HowItWorks";
import MobileBottomNav from "~/components/MobileBottomNav";
import Landing from "~/routes/landing";
import { usePuterStore } from "~/lib/puter";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";
import { useEffect, useRef, useState } from "react";
import { springs, staggerContainer, fadeUp } from "~/lib/motion";

const SECTIONS: { key: keyof Feedback; label: string }[] = [
  { key: "ATS", label: "ATS" },
  { key: "toneAndStyle", label: "tone_style" },
  { key: "content", label: "content" },
  { key: "structure", label: "structure" },
  { key: "skills", label: "skills" },
];

function scoreColor(s: number) {
  return s > 69 ? "var(--phos)" : s > 49 ? "var(--copper-hi)" : "var(--ember)";
}

function ScoreBar({ score }: { score: number }) {
  const filled = Math.round((score / 100) * 20);
  const color = scoreColor(score);
  return (
    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>
      <span style={{ color }}>{"█".repeat(filled)}</span>
      <span style={{ color: "var(--fg-4)" }}>{"░".repeat(20 - filled)}</span>
    </span>
  );
}

const ComparePanel = ({
  a,
  b,
  onClose,
}: {
  a: Resume;
  b: Resume;
  onClose: () => void;
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const kwA = a.feedback.ATS.keywords;
  const kwB = b.feedback.ATS.keywords;
  const foundA = new Set(kwA?.found ?? []);
  const foundB = new Set(kwB?.found ?? []);
  const allFound = new Set([...foundA, ...foundB]);
  const inBoth = [...allFound].filter((k) => foundA.has(k) && foundB.has(k));
  const onlyA = [...allFound].filter((k) => foundA.has(k) && !foundB.has(k));
  const onlyB = [...allFound].filter((k) => foundB.has(k) && !foundA.has(k));

  return (
    <div
      ref={panelRef}
      className="rl-card is-accent rl-fade-in"
      style={{ position: "relative", width: "100%", padding: 0 }}
    >
      <span className="rl-corner tl" />
      <span className="rl-corner tr" />
      <span className="rl-corner bl" />
      <span className="rl-corner br" />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px dashed var(--border)",
          background: "var(--bg-2)",
        }}
      >
        <span className="rl-eyebrow-prompt">compare_mode</span>
        <button
          onClick={onClose}
          className="rl-btn rl-btn-ghost"
          style={{ fontSize: 12, padding: "4px 10px" }}
        >
          ✕ close
        </button>
      </div>

      {/* Title row */}
      <div
        className="rl-compare-row"
        style={{
          padding: "14px 20px",
          borderBottom: "1px dashed var(--border)",
        }}
      >
        <div />
        {[a, b].map((r) => (
          <div key={r.id} style={{ textAlign: "center", padding: "0 8px" }}>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "var(--fg-1)",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {r.companyName || "resume"}
            </p>
            {r.jobTitle && (
              <p
                style={{
                  margin: "2px 0 0",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--fg-3)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {r.jobTitle}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Overall score */}
      <div
        className="rl-compare-row"
        style={{
          padding: "12px 20px",
          borderBottom: "1px dashed var(--border)",
          background: "var(--surface-2)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--fg-3)",
            letterSpacing: "0.12em",
            alignSelf: "center",
          }}
        >
          overall
        </p>
        {[a, b].map((r) => {
          const s = r.feedback.overallScore;
          const winner =
            r === a
              ? a.feedback.overallScore >= b.feedback.overallScore
              : b.feedback.overallScore > a.feedback.overallScore;
          return (
            <div
              key={r.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 28,
                  fontWeight: 700,
                  color: winner ? scoreColor(s) : "var(--fg-4)",
                  letterSpacing: "-1px",
                  fontVariantNumeric: "tabular-nums",
                  textShadow: winner ? `0 0 12px ${scoreColor(s)}88` : "none",
                }}
              >
                {s}
                {winner && (
                  <span
                    style={{
                      marginLeft: 6,
                      fontSize: 12,
                      color: "var(--phos)",
                    }}
                  >
                    ◆
                  </span>
                )}
              </span>
              <ScoreBar score={s} />
            </div>
          );
        })}
      </div>

      {/* Section scores */}
      {SECTIONS.map(({ key, label }) => {
        const sA = (a.feedback[key] as { score: number }).score;
        const sB = (b.feedback[key] as { score: number }).score;
        return (
          <div
            key={key}
            className="rl-compare-row"
            style={{
              padding: "10px 20px",
              borderBottom: "1px dashed var(--border)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--fg-3)",
                alignSelf: "center",
              }}
            >
              {label}
            </p>
            {[
              { score: sA, winner: sA >= sB },
              { score: sB, winner: sB > sA },
            ].map(({ score, winner }, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "0 8px",
                }}
              >
                <span className="rl-run-score-bar">
                  <ScoreBar score={score} />
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 700,
                    color: winner ? scoreColor(score) : "var(--fg-4)",
                    width: 28,
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {score}
                </span>
              </div>
            ))}
          </div>
        );
      })}

      {/* Keyword overlap */}
      {kwA && kwB && (
        <div style={{ padding: "16px 20px" }}>
          <span
            className="rl-comment"
            style={{ marginBottom: 12, display: "block" }}
          >
            keyword_overlap
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
              marginTop: 12,
            }}
          >
            {inBoth.length > 0 && (
              <div
                style={{
                  background: "rgba(168,230,163,0.06)",
                  border: "1px solid var(--phos-dim)",
                  borderRadius: "var(--radius-md)",
                  padding: 12,
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--phos)",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                  }}
                >
                  + in both ({inBoth.length})
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {inBoth.map((k) => (
                    <span
                      key={k}
                      className="rl-chip rl-chip-phos"
                      style={{ fontSize: 10 }}
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {onlyA.length > 0 && (
              <div
                style={{
                  background: "var(--surface-2)",
                  border: "1px dashed var(--border-hi)",
                  borderRadius: "var(--radius-md)",
                  padding: 12,
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--copper-hi)",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  only in {a.companyName || "A"} ({onlyA.length})
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {onlyA.map((k) => (
                    <span key={k} className="rl-chip" style={{ fontSize: 10 }}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {onlyB.length > 0 && (
              <div
                style={{
                  background: "var(--surface-2)",
                  border: "1px dashed var(--border-hi)",
                  borderRadius: "var(--radius-md)",
                  padding: 12,
                }}
              >
                <p
                  style={{
                    margin: "0 0 8px",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: "var(--copper)",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  only in {b.companyName || "B"} ({onlyB.length})
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {onlyB.map((k) => (
                    <span key={k} className="rl-chip" style={{ fontSize: 10 }}>
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA links */}
      <div
        className="rl-compare-row"
        style={{
          padding: "12px 20px",
          borderTop: "1px dashed var(--border)",
          background: "var(--bg-2)",
        }}
      >
        <div />
        {[a, b].map((r) => (
          <div key={r.id} style={{ display: "flex", justifyContent: "center" }}>
            <Link
              to={`/resume/${r.id}`}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--phos)",
                textDecoration: "none",
              }}
            >
              → view_report
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumeLens" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

const RESUMES_PER_PAGE = 6;

export default function Home() {
  const { auth, isLoading, kv, fs } = usePuterStore();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const reduced = useReducedMotion();

  const toggleCompareMode = () => {
    setCompareMode((v) => !v);
    setCompareIds([]);
  };

  const toggleSelect = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 2
          ? [...prev, id]
          : prev,
    );
  };

  const compareResumes =
    compareIds.length === 2
      ? ([
          resumes.find((r) => r.id === compareIds[0]),
          resumes.find((r) => r.id === compareIds[1]),
        ].filter(Boolean) as Resume[])
      : null;

  // Show landing page for unauthenticated users
  if (!isLoading && !auth.isAuthenticated) return <Landing />;

  useEffect(() => {
    if (isLoading || !auth.isAuthenticated) return;
    const loadResumes = async () => {
      setLoadingResumes(true);
      const items = (await kv.list("resume:*", true)) as KVItem[];
      const parsed =
        items?.map((item) => JSON.parse(item.value) as Resume) ?? [];
      setResumes(parsed.reverse());
      setLoadingResumes(false);
    };
    loadResumes();
  }, [isLoading, auth.isAuthenticated]);

  const handleDelete = (resume: Resume) => {
    setResumes((prev) => {
      const next = prev.filter((r) => r.id !== resume.id);
      const maxPage = Math.max(1, Math.ceil(next.length / RESUMES_PER_PAGE));
      if (currentPage > maxPage) setCurrentPage(maxPage);
      return next;
    });
    kv.delete(`resume:${resume.id}`).catch(() => {});
    if (resume.imagePath) fs.delete(resume.imagePath).catch(() => {});
    if (resume.resumePath) fs.delete(resume.resumePath).catch(() => {});
  };

  const totalPages = Math.max(1, Math.ceil(resumes.length / RESUMES_PER_PAGE));
  const paginatedResumes = resumes.slice(
    (currentPage - 1) * RESUMES_PER_PAGE,
    currentPage * RESUMES_PER_PAGE,
  );

  return (
    <main className="rl-page">
      <Navbar />

      <div
        id="main-content"
        className="rl-section"
        style={{ flex: 1, display: "flex", flexDirection: "column", gap: 32 }}
      >
        {/* Heading */}
        <motion.div
          variants={staggerContainer(0.1, 0)}
          initial={reduced ? false : "hidden"}
          animate="visible"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            paddingTop: 16,
          }}
        >
          <motion.span variants={fadeUp} className="rl-eyebrow-prompt">
            resumelens dashboard
          </motion.span>
          <motion.h1 variants={fadeUp} className="rl-h1">
            track_your_
            <span style={{ color: "var(--phos)" }}>applications</span>
            <span className="rl-cursor" />
          </motion.h1>
          <AnimatePresence>
            {!loadingResumes && (
              <motion.p
                key="subtitle"
                variants={fadeUp}
                initial={reduced ? false : "hidden"}
                animate="visible"
                exit={{ opacity: 0, y: -4 }}
                style={{
                  margin: 0,
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  color: "var(--fg-2)",
                  lineHeight: 1.7,
                }}
              >
                {resumes.length === 0
                  ? "No resumes yet — upload your first to get AI feedback."
                  : "Review your submissions, drill into AI feedback, compare versions side-by-side."}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Loading */}
        <AnimatePresence>
          {loadingResumes && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                padding: "48px 0",
              }}
            >
              <motion.span
                className="rl-dot"
                animate={
                  reduced ? {} : { scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }
                }
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{ width: 12, height: 12, display: "block" }}
              />
              <motion.p
                animate={reduced ? {} : { opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                style={{
                  margin: 0,
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--fg-3)",
                }}
              >
                loading resumes…
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Populated state */}
        {!loadingResumes && resumes.length > 0 && (
          <>
            <StatsStrip />

            {/* Toolbar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                {compareMode && (
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 12,
                      color: "var(--fg-3)",
                    }}
                  >
                    {compareIds.length === 0
                      ? "// select 2 resumes to compare"
                      : compareIds.length === 1
                        ? "// select one more"
                        : "// ready — scroll down"}
                  </span>
                )}
              </div>
              {resumes.length >= 2 && (
                <motion.button
                  onClick={toggleCompareMode}
                  whileHover={reduced ? {} : { scale: 1.03 }}
                  whileTap={reduced ? {} : { scale: 0.97 }}
                  transition={springs.snappy}
                  className={`rl-btn ${compareMode ? "rl-btn-copper" : "rl-btn-secondary"}`}
                  style={{ fontSize: 12 }}
                >
                  {compareMode ? "✕ cancel_compare" : "⇄ compare_resumes"}
                </motion.button>
              )}
            </div>

            {/* Resume grid */}
            <motion.div
              variants={staggerContainer(0.07, 0)}
              initial={reduced ? false : "hidden"}
              animate="visible"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 20,
                width: "100%",
              }}
            >
              <AnimatePresence mode="popLayout">
                {paginatedResumes.map((resume) => (
                  <motion.div key={resume.id} variants={fadeUp} layout>
                    <ResumeCard
                      resume={resume}
                      onDelete={
                        compareMode ? undefined : () => handleDelete(resume)
                      }
                      compareMode={compareMode}
                      isSelected={compareIds.includes(resume.id)}
                      onSelect={() => toggleSelect(resume.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Compare panel */}
            <AnimatePresence>
              {compareResumes && (
                <motion.div
                  key="compare-panel"
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={springs.smooth}
                >
                  <ComparePanel
                    a={compareResumes[0]}
                    b={compareResumes[1]}
                    onClose={() => {
                      setCompareIds([]);
                      setCompareMode(false);
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <motion.button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  whileHover={reduced ? {} : { scale: 1.04 }}
                  whileTap={reduced ? {} : { scale: 0.96 }}
                  transition={springs.snappy}
                  className="rl-btn rl-btn-secondary"
                  style={{ fontSize: 12, opacity: currentPage === 1 ? 0.4 : 1 }}
                >
                  ← prev
                </motion.button>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--fg-3)",
                  }}
                >
                  {currentPage} / {totalPages}
                </span>
                <motion.button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  whileHover={reduced ? {} : { scale: 1.04 }}
                  whileTap={reduced ? {} : { scale: 0.96 }}
                  transition={springs.snappy}
                  className="rl-btn rl-btn-secondary"
                  style={{
                    fontSize: 12,
                    opacity: currentPage === totalPages ? 0.4 : 1,
                  }}
                >
                  next →
                </motion.button>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loadingResumes && resumes.length === 0 && (
          <motion.div
            variants={staggerContainer(0.12, 0.1)}
            initial={reduced ? false : "hidden"}
            animate="visible"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 40,
              width: "100%",
              maxWidth: 720,
              alignSelf: "center",
            }}
          >
            {/* Hero card */}
            <div
              className="rl-card is-raised rl-hero-card"
              style={{
                position: "relative",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                textAlign: "center",
                padding: "48px 32px",
              }}
            >
              <span className="rl-corner tl" />
              <span className="rl-corner tr" />
              <span className="rl-corner bl" />
              <span className="rl-corner br" />

              <span className="rl-eyebrow">// resume_analysis</span>
              <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)" }}>
                Drop your first resume
                <span className="rl-cursor" />
              </h1>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  color: "var(--fg-2)",
                  lineHeight: 1.75,
                  maxWidth: 480,
                }}
              >
                Upload a PDF + paste a job description. ResumeLens diffs them,
                scores five dimensions, and tells you exactly what to rewrite.
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 8,
                  padding: "16px 0 8px",
                  borderTop: "1px dashed var(--border)",
                  width: "100%",
                }}
              >
                {[
                  ["ATS", "ats_compatibility"],
                  ["KW", "keyword_gaps"],
                  ["TS", "tone_structure"],
                  ["IV", "interview_prep"],
                  ["RW", "rewrite_tips"],
                ].map(([k, label]) => (
                  <span key={k} className="rl-chip">
                    <span style={{ color: "var(--copper)" }}>[{k}]</span>
                    <span>{label}</span>
                  </span>
                ))}
              </div>
              <Link
                to="/upload"
                className="rl-btn rl-btn-primary"
                style={{ fontSize: 14 }}
              >
                $ upload_resume →
              </Link>
            </div>

            <HowItWorks />
            <StatsStrip />
          </motion.div>
        )}
      </div>

      <Footer />
      <MobileBottomNav />
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : "Something went wrong.";

  return (
    <main
      className="rl-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        className="rl-card is-raised"
        style={{
          position: "relative",
          maxWidth: 440,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          textAlign: "center",
        }}
      >
        <span className="rl-corner tl" />
        <span className="rl-corner tr" />
        <span className="rl-corner bl" />
        <span className="rl-corner br" />
        <span className="rl-pill rl-pill-bad" style={{ alignSelf: "center" }}>
          ERROR
        </span>
        <h1
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 28,
            fontWeight: 500,
            color: "var(--fg-1)",
            margin: 0,
          }}
        >
          something_went_wrong
        </h1>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: 14,
            color: "var(--fg-2)",
            margin: 0,
          }}
        >
          {message}
        </p>
        <a
          href="/"
          className="rl-btn rl-btn-primary"
          style={{ alignSelf: "center" }}
        >
          ← go_home
        </a>
      </div>
    </main>
  );
}
