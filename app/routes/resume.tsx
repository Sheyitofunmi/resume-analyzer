import {
  isRouteErrorResponse,
  Link,
  useNavigate,
  useParams,
  useRouteError,
} from "react-router";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import Summary from "~/components/Summary";
import ATS from "~/components/ATS";
import Details from "~/components/Details";
import ScoreHistory from "~/components/ScoreHistory";
import ResumeChecklist from "~/components/ResumeChecklist";
import InterviewQuestions from "~/components/InterviewQuestions";
import RewriteSuggestions from "~/components/RewriteSuggestions";
import { prepareInstructions } from "../../constants";
import { extractJSON } from "~/lib/utils";

export const meta = () => [
  { title: "ResumeLens | Review" },
  { name: "description", content: "Detailed overview of your resume" },
];

const MAX_JOB_DESC_CHARS = 3000;

const Resume = () => {
  const { auth, isLoading, fs, kv, ai, isUsingDemoFeedback } = usePuterStore();
  const { id } = useParams();
  const navigate = useNavigate();

  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [storedJobTitle, setStoredJobTitle] = useState("");
  const [storedCompanyName, setStoredCompanyName] = useState("");
  const [storedImagePath, setStoredImagePath] = useState("");
  const [scoreHistory, setScoreHistory] = useState<ScoreHistoryEntry[]>([]);

  const [showReanalyze, setShowReanalyze] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDescription, setNewJobDescription] = useState("");
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [reanalyzeStatus, setReanalyzeStatus] = useState("");
  const [successToast, setSuccessToast] = useState(false);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate(`/auth?next=/resume/${id}`);
    }
  }, [isLoading, auth.isAuthenticated]);

  useEffect(() => {
    setImageUrl("");
    setResumeUrl("");
    setFeedback(null);
    setPageCount(null);
    setStoredJobTitle("");
    setStoredCompanyName("");
    setStoredImagePath("");
    setShowReanalyze(false);
    setReanalyzeStatus("");
    setSuccessToast(false);
  }, [id]);

  useEffect(() => {
    if (isLoading || !auth.isAuthenticated) return;
    let cancelled = false;
    const loadResume = async () => {
      const resume = await kv.get(`resume:${id}`);
      if (!resume || cancelled) return;
      const data = JSON.parse(resume);
      if (!cancelled) {
        setFeedback(data.feedback);
        if (data.pageCount) setPageCount(data.pageCount);
        setStoredJobTitle(data.jobTitle ?? "");
        setStoredCompanyName(data.companyName ?? "");
        setStoredImagePath(data.imagePath ?? "");
        setNewJobTitle(data.jobTitle ?? "");
        setNewJobDescription(data.jobDescription ?? "");
      }
      const historyRaw = await kv.get(`resume-history:${id}`);
      if (historyRaw && !cancelled) {
        setScoreHistory(JSON.parse(historyRaw) as ScoreHistoryEntry[]);
      }
      const [resumeBlob, imageBlob] = await Promise.all([
        fs.read(data.resumePath),
        fs.read(data.imagePath),
      ]);
      if (cancelled) return;
      if (resumeBlob) {
        const pdfBlob = new Blob([resumeBlob], { type: "application/pdf" });
        setResumeUrl(URL.createObjectURL(pdfBlob));
      }
      if (imageBlob) {
        setImageUrl(URL.createObjectURL(imageBlob));
      }
    };
    loadResume();
    return () => {
      cancelled = true;
    };
  }, [id, auth.isAuthenticated]);

  const handleReanalyze = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim() || !newJobDescription.trim()) return;
    setIsReanalyzing(true);
    setReanalyzeStatus("Analyzing resume against new job description…");
    setShowReanalyze(false);
    setSuccessToast(false);
    const trimmedDescription = newJobDescription.slice(0, MAX_JOB_DESC_CHARS);
    const runAnalysis = async () => {
      const result = await ai.feedback(
        storedImagePath,
        prepareInstructions({
          jobTitle: newJobTitle,
          jobDescription: trimmedDescription,
        }),
      );
      if (!result) throw new Error("No response from AI");
      const raw =
        typeof result.message.content === "string"
          ? result.message.content
          : result.message.content[0].text;
      return JSON.parse(extractJSON(raw)) as Feedback;
    };
    try {
      let newFeedback: Feedback;
      try {
        newFeedback = await runAnalysis();
      } catch {
        setReanalyzeStatus("Retrying analysis…");
        newFeedback = await runAnalysis();
      }
      const raw = await kv.get(`resume:${id}`);
      if (raw) {
        const data = JSON.parse(raw);
        data.feedback = newFeedback;
        data.jobTitle = newJobTitle;
        data.jobDescription = newJobDescription;
        await kv.set(`resume:${id}`, JSON.stringify(data));
      }
      setFeedback(newFeedback);
      setStoredJobTitle(newJobTitle);
      const newEntry: ScoreHistoryEntry = {
        date: new Date().toISOString(),
        overall: newFeedback.overallScore,
        ats: newFeedback.ATS.score,
        tone: newFeedback.toneAndStyle.score,
        content: newFeedback.content.score,
        structure: newFeedback.structure.score,
        skills: newFeedback.skills.score,
      };
      const historyRaw = await kv.get(`resume-history:${id}`);
      const existing: ScoreHistoryEntry[] = historyRaw
        ? JSON.parse(historyRaw)
        : [];
      const updatedHistory = [...existing, newEntry];
      await kv.set(`resume-history:${id}`, JSON.stringify(updatedHistory));
      setScoreHistory(updatedHistory);
      setReanalyzeStatus("");
      setSuccessToast(true);
      setTimeout(() => setSuccessToast(false), 4000);
    } catch (err) {
      setReanalyzeStatus(
        `Error: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setIsReanalyzing(false);
    }
  };

  return (
    <main
      className="rl-resume-main"
      style={{
        background: "var(--bg)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        paddingTop: 0,
      }}
    >
      {/* Skip link */}
      <a
        href="#resume-feedback"
        style={{
          position: "absolute",
          top: -9999,
          left: 8,
          zIndex: 50,
          background: "var(--phos)",
          color: "var(--bg)",
          padding: "8px 16px",
          fontFamily: "var(--font-mono)",
          fontSize: 12,
          fontWeight: 700,
        }}
        onFocus={(e) => (e.currentTarget.style.top = "8px")}
        onBlur={(e) => (e.currentTarget.style.top = "-9999px")}
      >
        skip to feedback
      </a>

      {/* Top nav bar */}
      <nav
        className="rl-resume-page-nav print:hidden"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid var(--border)",
          background: "rgba(11,11,10,0.88)",
          backdropFilter: "blur(8px)",
          zIndex: 50,
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--fg-2)",
            textDecoration: "none",
            transition: "color var(--dur-fast)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg-1)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-2)")}
        >
          ← back_to_dashboard
        </Link>

        {storedCompanyName && (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--fg-3)",
            }}
            className="rl-mobile-hide"
          >
            // {storedCompanyName}
            {storedJobTitle ? ` · ${storedJobTitle}` : ""}
          </span>
        )}

        <div className="rl-resume-nav-actions">
          {feedback && !isReanalyzing && (
            <button
              onClick={() => setShowReanalyze(true)}
              className="rl-btn rl-btn-secondary"
              style={{ fontSize: 11, padding: "6px 12px" }}
            >
              ↺ re-analyze
            </button>
          )}
          {feedback && (
            <Link
              to={`/resume/${id}/edit`}
              className="rl-btn rl-btn-secondary"
              style={{ fontSize: 11, padding: "6px 12px" }}
            >
              ✎ edit_resume
            </Link>
          )}
          {feedback && (
            <button
              onClick={() => window.print()}
              className="rl-btn rl-btn-ghost rl-mobile-hide"
              style={{ fontSize: 11, padding: "6px 12px" }}
            >
              ↓ download
            </button>
          )}
        </div>
      </nav>

      {/* Demo feedback notice */}
      {isUsingDemoFeedback && (
        <div
          role="alert"
          className="print:hidden"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "rgba(230,153,104,0.08)",
            borderBottom: "1px solid var(--copper-deep)",
            padding: "10px 24px",
          }}
        >
          <span style={{ color: "var(--copper-hi)", fontSize: 14 }}>!</span>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--copper-hi)",
            }}
          >
            <span style={{ fontWeight: 600 }}>AI unavailable.</span> Analysis
            below is sample data — the AI service could not be reached.
          </p>
        </div>
      )}

      {/* Success toast */}
      {successToast && (
        <div className="rl-toast">
          <span style={{ color: "var(--phos)" }}>✓</span>
          re-analysis complete — feedback updated
        </div>
      )}

      {/* Re-analyze modal */}
      {showReanalyze && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reanalyze-title"
          className="print:hidden"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
            }}
            onClick={() => setShowReanalyze(false)}
            aria-hidden="true"
          />
          <div
            className="rl-card is-raised rl-fade-in"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 520,
              zIndex: 1,
            }}
          >
            <span className="rl-corner tl" />
            <span className="rl-corner tr" />
            <span className="rl-corner bl" />
            <span className="rl-corner br" />

            <span
              id="reanalyze-title"
              className="rl-eyebrow-prompt"
              style={{ marginBottom: 16, display: "block" }}
            >
              re-analyze resume
            </span>

            <div
              style={{
                background: "rgba(230,153,104,0.06)",
                border: "1px dashed var(--copper-deep)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 12px",
                marginBottom: 16,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--copper-hi)",
              }}
            >
              ! this will replace your current analysis
            </div>

            <form
              onSubmit={handleReanalyze}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
              noValidate
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="reanalyze-job-title">// job_title</label>
                <input
                  id="reanalyze-job-title"
                  type="text"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  required
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label htmlFor="reanalyze-job-desc">// job_description</label>
                <textarea
                  id="reanalyze-job-desc"
                  rows={5}
                  value={newJobDescription}
                  onChange={(e) => setNewJobDescription(e.target.value)}
                  placeholder="Paste job description here…"
                  required
                />
              </div>
              <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
                <button
                  type="submit"
                  className="rl-btn rl-btn-primary"
                  style={{ fontSize: 12 }}
                >
                  $ analyze →
                </button>
                <button
                  type="button"
                  onClick={() => setShowReanalyze(false)}
                  className="rl-btn rl-btn-ghost"
                  style={{ fontSize: 12 }}
                >
                  cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Re-analyzing status */}
      {isReanalyzing && (
        <div
          className="print:hidden"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "16px 24px",
            borderBottom: "1px dashed var(--border)",
            background: "var(--surface)",
          }}
          aria-live="polite"
          aria-busy="true"
        >
          <span className="rl-dot" />
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--fg-2)",
            }}
          >
            {reanalyzeStatus}
          </p>
        </div>
      )}

      {/* Re-analyze error */}
      {reanalyzeStatus && !isReanalyzing && (
        <p
          role="alert"
          className="print:hidden"
          style={{
            margin: 0,
            padding: "10px 24px",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            color: "var(--ember)",
            background: "rgba(227,83,74,0.06)",
            borderBottom: "1px solid var(--ember-dim)",
          }}
        >
          ✕ {reanalyzeStatus}
        </p>
      )}

      {/* Print header */}
      {feedback && (
        <div
          className="hidden print:block"
          style={{ padding: "24px 32px 16px", borderBottom: "1px solid #ccc" }}
        >
          <h1
            style={{ fontSize: 22, fontWeight: 700, color: "#000", margin: 0 }}
          >
            Resume Feedback Report
          </h1>
          {storedCompanyName && (
            <p style={{ color: "#555", fontSize: 13, marginTop: 4 }}>
              {storedCompanyName}
              {storedJobTitle ? ` · ${storedJobTitle}` : ""}
            </p>
          )}
        </div>
      )}

      {/* Main two-column layout */}
      <div
        className="rl-resume-layout"
        style={{
          display: "flex",
          width: "100%",
          flex: 1,
        }}
      >
        {/* Left: fixed resume preview (sticky via CSS on ≥768px) */}
        <section
          aria-label="Resume preview"
          className="rl-resume-left print:hidden"
          style={{
            padding: "24px 20px",
            background: "var(--bg-2)",
            borderRight: "1px solid var(--border)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          {imageUrl && resumeUrl ? (
            <div
              className="rl-fade-in"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                width: "100%",
              }}
            >
              <div
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View full PDF resume"
                >
                  <img
                    src={imageUrl}
                    alt={`Resume preview${storedCompanyName ? ` for ${storedCompanyName}` : ""}`}
                    style={{
                      width: "100%",
                      objectFit: "contain",
                      maxHeight: "72vh",
                      filter: "saturate(0.4) brightness(0.85)",
                    }}
                  />
                </a>
              </div>
              {pageCount && pageCount > 1 && (
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--fg-3)",
                    textAlign: "center",
                  }}
                >
                  // page 1 of {pageCount} — click to view full PDF
                </p>
              )}
            </div>
          ) : (
            !imageUrl && (
              <div
                style={{
                  width: "100%",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: 480,
                    background: "var(--surface-2)",
                  }}
                  className="rl-shimmer"
                  aria-label="Loading resume preview"
                />
              </div>
            )
          )}
        </section>

        {/* Right: feedback panels */}
        <section
          id="resume-feedback"
          className="rl-resume-right print:w-full print:px-0"
          style={{
            flex: 1,
            padding: "32px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 24,
            minWidth: 0,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span className="rl-eyebrow-prompt">resume_report</span>
            {storedCompanyName && (
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--fg-3)",
                }}
              >
                // {storedCompanyName}
                {storedJobTitle ? ` · ${storedJobTitle}` : ""}
              </p>
            )}
          </div>

          {feedback ? (
            <div
              className="rl-fade-in"
              style={{ display: "flex", flexDirection: "column", gap: 20 }}
            >
              <Summary feedback={feedback} />
              {scoreHistory.length > 0 && (
                <ScoreHistory history={scoreHistory} />
              )}
              <ResumeChecklist feedback={feedback} />
              <ATS
                score={feedback.ATS.score || 0}
                suggestions={feedback.ATS.tips || []}
                keywords={feedback.ATS.keywords}
              />
              <Details feedback={feedback} />
              <InterviewQuestions
                jobTitle={storedJobTitle}
                jobDescription={newJobDescription}
                feedback={feedback}
              />
              <RewriteSuggestions
                jobTitle={storedJobTitle}
                feedback={feedback}
              />
            </div>
          ) : !isReanalyzing ? (
            <div
              aria-live="polite"
              aria-busy="true"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                padding: "48px 0",
              }}
            >
              <span className="rl-dot" style={{ width: 12, height: 12 }} />
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--fg-3)",
                  margin: 0,
                }}
              >
                loading analysis…
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
};

export default Resume;

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
          failed_to_load
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
          ← back_to_dashboard
        </a>
      </div>
    </main>
  );
}
