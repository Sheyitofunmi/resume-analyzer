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
import { PixelSprite, ScoreCircle } from "~/components/atoms";

const SECTIONS: { key: keyof Feedback; label: string }[] = [
  { key: "ATS", label: "ATS" },
  { key: "toneAndStyle", label: "Tone & style" },
  { key: "content", label: "Content" },
  { key: "structure", label: "Structure" },
  { key: "skills", label: "Skills" },
];

function MiniBar({ score, muted }: { score: number; muted?: boolean }) {
  return (
    <span
      className="score-bar"
      style={{ display: "block", flex: 1, opacity: muted ? 0.45 : 1 }}
    >
      <span
        className="score-bar__fill"
        style={{ display: "block", width: `${score}%` }}
      />
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
      className="card card--pop"
      style={{
        position: "relative",
        width: "100%",
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "var(--bw) solid var(--ink)",
          background: "var(--cyan)",
        }}
      >
        <span className="eyebrow eyebrow--ink">{"// COMPARE"}</span>
        <button
          onClick={onClose}
          className="btn btn--surface btn--sm"
          style={{ padding: "6px 12px", fontSize: 12 }}
        >
          ✕ Close
        </button>
      </div>

      {/* Title row */}
      <div
        className="rl-compare-row"
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div />
        {[a, b].map((r) => (
          <div key={r.id} style={{ textAlign: "center", padding: "0 8px" }}>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 900,
                color: "var(--ink)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {r.companyName || "Resume"}
            </p>
            {r.jobTitle && (
              <p
                style={{
                  margin: "2px 0 0",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--fg-2)",
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
          padding: "14px 20px",
          borderBottom: "1px solid var(--line)",
          background: "var(--fill-1)",
        }}
      >
        <p
          className="eyebrow"
          style={{ margin: 0, alignSelf: "center", fontSize: 10 }}
        >
          OVERALL
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
                  fontSize: 30,
                  fontWeight: 900,
                  color: winner ? "var(--ink)" : "var(--fg-3)",
                  letterSpacing: "-0.03em",
                  fontVariantNumeric: "tabular-nums",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {s}
                {winner && (
                  <span
                    aria-label="Winner"
                    style={{
                      width: 12,
                      height: 12,
                      background: "var(--lime)",
                      border: "var(--bw) solid var(--ink)",
                      borderRadius: 3,
                      display: "inline-block",
                    }}
                  />
                )}
              </span>
              <div style={{ width: "80%", display: "flex" }}>
                <MiniBar score={s} muted={!winner} />
              </div>
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
              borderBottom: "1px solid var(--line)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 700,
                color: "var(--fg-2)",
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
                <MiniBar score={score} muted={!winner} />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    fontWeight: 600,
                    color: winner ? "var(--ink)" : "var(--fg-3)",
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
            className="eyebrow"
            style={{ display: "block", marginBottom: 12 }}
          >
            {"// KEYWORD OVERLAP"}
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {inBoth.length > 0 && (
              <div
                style={{
                  background: "var(--surface)",
                  border: "var(--bw) solid var(--ink)",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <p
                  className="eyebrow eyebrow--ink"
                  style={{ margin: "0 0 8px", fontSize: 10 }}
                >
                  ✓ IN BOTH ({inBoth.length})
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {inBoth.map((k) => (
                    <span
                      key={k}
                      className="chip chip--lime"
                      style={{ fontSize: 10.5 }}
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {[
              { list: onlyA, owner: a },
              { list: onlyB, owner: b },
            ].map(
              ({ list, owner }, i) =>
                list.length > 0 && (
                  <div
                    key={i}
                    style={{
                      background: "var(--fill-1)",
                      border: "1.5px dashed var(--ink)",
                      borderRadius: 12,
                      padding: 12,
                    }}
                  >
                    <p
                      className="eyebrow"
                      style={{
                        margin: "0 0 8px",
                        fontSize: 10,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ONLY IN{" "}
                      {(
                        owner.companyName || (i === 0 ? "A" : "B")
                      ).toUpperCase()}{" "}
                      ({list.length})
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {list.map((k) => (
                        <span
                          key={k}
                          className="chip"
                          style={{ fontSize: 10.5 }}
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                ),
            )}
          </div>
        </div>
      )}

      {/* CTA links */}
      <div
        className="rl-compare-row"
        style={{
          padding: "12px 20px",
          borderTop: "1px solid var(--line)",
          background: "var(--fill-1)",
        }}
      >
        <div />
        {[a, b].map((r) => (
          <div key={r.id} style={{ display: "flex", justifyContent: "center" }}>
            <Link
              to={`/resume/${r.id}`}
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "var(--ink)",
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Open report →
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

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Morning" : h < 18 ? "Afternoon" : "Evening";
}

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

  // Show landing page for unauthenticated users
  if (!isLoading && !auth.isAuthenticated) return <Landing />;

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

  const latest = resumes[0];
  const bestScore = resumes.length
    ? Math.max(...resumes.map((r) => r.feedback.overallScore))
    : 0;

  const dateEyebrow = new Date()
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();

  return (
    <main className="rl-page has-bottom-nav">
      <Navbar />

      <div
        id="main-content"
        className="rl-container"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 24,
          padding: "44px var(--gutter-inner) 80px",
        }}
      >
        {/* Heading */}
        <motion.div
          variants={staggerContainer(0.1, 0)}
          initial={reduced ? false : "hidden"}
          animate="visible"
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 8,
          }}
        >
          <div>
            <motion.div
              variants={fadeUp}
              className="eyebrow"
              style={{ marginBottom: 10 }}
            >
              {dateEyebrow}
            </motion.div>
            <motion.h1
              variants={fadeUp}
              style={{ fontSize: 40, letterSpacing: "-0.03em" }}
            >
              {greeting()}, {auth.user?.username || "there"}.
            </motion.h1>
          </div>
          <motion.div variants={fadeUp}>
            <Link to="/upload" className="btn btn--primary">
              + New scan
            </Link>
          </motion.div>
        </motion.div>

        {/* Loading — skeleton placeholders */}
        <AnimatePresence>
          {loadingResumes && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25 }}
                  style={{
                    height: 88,
                    borderRadius: "var(--r-card)",
                    background: "var(--fill-2)",
                    border: "1px solid var(--line)",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Populated state */}
        {!loadingResumes && resumes.length > 0 && (
          <>
            {/* Summary cards */}
            {latest && (
              <div className="g-split-wide">
                <Link
                  to={`/resume/${latest.id}`}
                  className="card card--cyan card--hover"
                  style={{
                    textDecoration: "none",
                    color: "var(--ink)",
                    padding: 28,
                    display: "flex",
                    gap: 26,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <ScoreCircle
                    score={latest.feedback.overallScore}
                    size={118}
                    trackColor="rgba(255,255,255,0.5)"
                  />
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <div
                      className="eyebrow eyebrow--ink"
                      style={{ fontSize: 10, marginBottom: 8 }}
                    >
                      LATEST SCAN
                    </div>
                    <div
                      style={{
                        fontWeight: 900,
                        fontSize: 22,
                        letterSpacing: "-0.02em",
                        marginBottom: 6,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {latest.companyName || "Your resume"}
                    </div>
                    {latest.jobTitle && (
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          marginBottom: 14,
                        }}
                      >
                        Target: {latest.jobTitle}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {SECTIONS.slice(0, 3).map(({ key, label }) => (
                        <span key={key} className="chip">
                          {label}{" "}
                          {(latest.feedback[key] as { score: number }).score}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>

                <div
                  className="card card--lime"
                  style={{
                    padding: 28,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 10,
                  }}
                >
                  <div
                    className="eyebrow eyebrow--ink"
                    style={{ fontSize: 10 }}
                  >
                    BEST SCORE
                  </div>
                  <div
                    style={{
                      fontSize: 64,
                      fontWeight: 900,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                    }}
                  >
                    {bestScore}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800 }}>
                    across {resumes.length}{" "}
                    {resumes.length === 1 ? "resume" : "resumes"} → keep
                    climbing
                  </div>
                </div>
              </div>
            )}

            <StatsStrip id="stats-strip" />

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
                  <span className="eyebrow" style={{ fontSize: 11 }}>
                    {compareIds.length === 0
                      ? "SELECT 2 RESUMES TO COMPARE"
                      : compareIds.length === 1
                        ? "SELECT ONE MORE"
                        : "READY — SCROLL DOWN"}
                  </span>
                )}
              </div>
              {resumes.length >= 2 && (
                <button
                  id="compare-btn"
                  onClick={toggleCompareMode}
                  className={`btn btn--sm ${compareMode ? "btn--lime" : "btn--outline"}`}
                >
                  {compareMode ? "✕ Cancel compare" : "⇄ Compare resumes"}
                </button>
              )}
            </div>

            {/* Resume grid */}
            <motion.div
              id="resume-grid"
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
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn btn--outline btn--sm"
                >
                  ← Prev
                </button>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--fg-2)",
                    fontWeight: 600,
                  }}
                >
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="btn btn--outline btn--sm"
                >
                  Next →
                </button>
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
              maxWidth: 760,
              alignSelf: "center",
            }}
          >
            {/* Hero card */}
            <div
              className="card card--pop"
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
              <PixelSprite size={56} />
              <span className="eyebrow">{"// FIRST SCAN"}</span>
              <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)" }}>
                Drop your first resume
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: 14.5,
                  fontWeight: 500,
                  color: "var(--fg-2)",
                  lineHeight: 1.75,
                  maxWidth: 480,
                }}
              >
                Upload a PDF or DOCX and paste a job description. ResumeLens
                scores five dimensions and tells you exactly what to rewrite.
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 8,
                  padding: "16px 0 8px",
                  borderTop: "1px solid var(--line)",
                  width: "100%",
                }}
              >
                {[
                  "ATS compatibility",
                  "Keyword gaps",
                  "Tone & structure",
                  "Interview prep",
                  "Rewrite tips",
                ].map((label) => (
                  <span key={label} className="chip chip--fill">
                    {label}
                  </span>
                ))}
              </div>
              <Link to="/upload" className="btn btn--primary">
                Upload my resume →
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
        padding: 24,
      }}
    >
      <div
        className="card card--pop"
        style={{
          position: "relative",
          maxWidth: 440,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          textAlign: "center",
          alignItems: "center",
        }}
      >
        <span
          className="chip"
          style={{ background: "var(--red)", color: "#fff" }}
        >
          ERROR
        </span>
        <h1 style={{ fontSize: 28 }}>Something went wrong</h1>
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--fg-2)",
            margin: 0,
          }}
        >
          {message}
        </p>
        <a href="/" className="btn btn--primary">
          ← Go home
        </a>
      </div>
    </main>
  );
}
