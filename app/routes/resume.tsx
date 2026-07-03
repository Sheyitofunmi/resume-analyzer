import {
  isRouteErrorResponse,
  Link,
  useNavigate,
  useParams,
  useRouteError,
} from "react-router";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { springs } from "~/lib/motion";
import { usePuterStore } from "~/lib/puter";
import Navbar from "~/components/Navbar";
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
  const [storedResumeText, setStoredResumeText] = useState<string | null>(null);
  const [storedIsDemo, setStoredIsDemo] = useState(false);
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
    setStoredResumeText(null);
    setStoredIsDemo(false);
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
        setStoredResumeText(data.resumeText ?? null);
        setStoredIsDemo(Boolean(data.isDemo));
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
    const instructions = prepareInstructions({
      jobTitle: newJobTitle,
      jobDescription: trimmedDescription,
    });
    const onChunk = (acc: string) => {
      if (acc.includes('"skills"')) setReanalyzeStatus("Scoring skills…");
      else if (acc.includes('"structure"'))
        setReanalyzeStatus("Scoring document structure…");
      else if (acc.includes('"content"'))
        setReanalyzeStatus("Scoring content…");
      else if (acc.includes('"toneAndStyle"'))
        setReanalyzeStatus("Scoring tone & style…");
      else if (acc.includes('"ATS"'))
        setReanalyzeStatus("Scoring ATS compatibility…");
    };
    const runAnalysis = async () => {
      const result = storedResumeText
        ? await ai.feedbackFromText(storedResumeText, instructions, onChunk)
        : await ai.feedback(storedImagePath, instructions, onChunk);
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
        data.isDemo = usePuterStore.getState().isUsingDemoFeedback;
        await kv.set(`resume:${id}`, JSON.stringify(data));
      }
      const reDemo = usePuterStore.getState().isUsingDemoFeedback;
      setStoredIsDemo(reDemo);
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
      style={{
        background: "var(--page)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Demo feedback notice */}
      {(isUsingDemoFeedback || storedIsDemo) && (
        <div
          role="alert"
          className="print:hidden"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--amber)",
            borderBottom: "var(--bw) solid var(--ink)",
            padding: "10px 24px",
          }}
        >
          <span style={{ fontWeight: 900, fontSize: 14 }}>!</span>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700 }}>
            AI unavailable. The analysis below is sample data — the AI service
            could not be reached.
          </p>
        </div>
      )}

      {/* Success toast */}
      {successToast && (
        <div
          role="status"
          style={{
            position: "fixed",
            right: 20,
            bottom: 20,
            zIndex: 90,
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "var(--surface)",
            border: "var(--bw) solid var(--ink)",
            borderRadius: "var(--r-btn)",
            boxShadow: "var(--pop-sm)",
            padding: "12px 16px",
            fontSize: 13.5,
            fontWeight: 700,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              background: "var(--lime)",
              border: "var(--bw) solid var(--ink)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 900,
            }}
          >
            ✓
          </span>
          Re-analysis complete — feedback updated
        </div>
      )}

      {/* Re-analyze modal */}
      <AnimatePresence>
        {showReanalyze && (
          <motion.div
            key="reanalyze-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reanalyze-title"
            className="print:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
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
                background: "rgba(11,11,11,0.45)",
              }}
              onClick={() => setShowReanalyze(false)}
              aria-hidden="true"
            />
            <motion.div
              className="card card--pop"
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 12 }}
              transition={{ ...springs.smooth }}
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 520,
                zIndex: 1,
              }}
            >
              <h2
                id="reanalyze-title"
                style={{ fontSize: 22, margin: "0 0 14px" }}
              >
                Re-analyze this resume
              </h2>

              <div
                style={{
                  background: "var(--amber)",
                  border: "var(--bw) solid var(--ink)",
                  borderRadius: 10,
                  padding: "8px 12px",
                  marginBottom: 16,
                  fontSize: 12.5,
                  fontWeight: 800,
                }}
              >
                ! This will replace your current analysis
              </div>

              <form
                onSubmit={handleReanalyze}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
                noValidate
              >
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <label
                    htmlFor="reanalyze-job-title"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 12,
                      fontWeight: 800,
                      textTransform: "none",
                      letterSpacing: 0,
                      color: "var(--ink)",
                    }}
                  >
                    Job title
                  </label>
                  <input
                    id="reanalyze-job-title"
                    type="text"
                    value={newJobTitle}
                    onChange={(e) => setNewJobTitle(e.target.value)}
                    placeholder="e.g. Senior Frontend Engineer"
                    required
                  />
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <label
                    htmlFor="reanalyze-job-desc"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: 12,
                      fontWeight: 800,
                      textTransform: "none",
                      letterSpacing: 0,
                      color: "var(--ink)",
                    }}
                  >
                    Job description
                  </label>
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
                    className="btn btn--primary"
                    disabled={isReanalyzing}
                    style={{ minWidth: 130 }}
                  >
                    {isReanalyzing ? "Analyzing…" : "Analyze →"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReanalyze(false)}
                    className="btn btn--outline"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Re-analyzing status */}
      {isReanalyzing && (
        <div
          className="print:hidden"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 24px",
            borderBottom: "var(--bw) solid var(--ink)",
            background: "var(--lime)",
          }}
          aria-live="polite"
          aria-busy="true"
        >
          <span
            className="pix-blink"
            style={{
              width: 10,
              height: 10,
              background: "var(--ink)",
              borderRadius: 3,
              display: "inline-block",
            }}
          />
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 800 }}>
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
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            background: "var(--red)",
            borderBottom: "var(--bw) solid var(--ink)",
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

      {/* Header */}
      <div
        className="rl-container print:hidden"
        style={{ padding: "36px var(--gutter-inner) 0" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 26,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.12em",
                color: "var(--fg-2)",
                marginBottom: 8,
              }}
            >
              <Link
                to="/"
                style={{ color: "var(--fg-2)", textDecoration: "none" }}
              >
                HOME
              </Link>{" "}
              / REPORT
            </div>
            <h1
              style={{
                fontSize: 34,
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              {storedCompanyName || "Resume report"}
              {storedJobTitle && (
                <span
                  style={{
                    display: "block",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--fg-2)",
                    letterSpacing: 0,
                    marginTop: 6,
                  }}
                >
                  Target: {storedJobTitle}
                </span>
              )}
            </h1>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {feedback && (
              <button
                onClick={() => window.print()}
                className="btn btn--outline btn--sm mobile-hide"
              >
                ↓ Download
              </button>
            )}
            {feedback && !isReanalyzing && (
              <button
                onClick={() => setShowReanalyze(true)}
                className="btn btn--outline btn--sm"
              >
                ↺ Re-analyze
              </button>
            )}
            <Link to="/upload" className="btn btn--primary btn--sm">
              New scan
            </Link>
          </div>
        </div>
      </div>

      {/* Main two-column layout */}
      <div
        className="rl-resume-layout rl-container"
        style={{ gap: 24, paddingBottom: 80 }}
      >
        {/* Left: sticky resume preview */}
        <section
          aria-label="Resume preview"
          className="rl-resume-left print:hidden"
        >
          {imageUrl && resumeUrl ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                width: "100%",
              }}
            >
              <div
                style={{
                  background: "var(--surface)",
                  border: "var(--bw) solid var(--ink)",
                  borderRadius: "var(--r-card)",
                  overflow: "hidden",
                  width: "100%",
                  boxShadow: "var(--pop)",
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
                      display: "block",
                    }}
                  />
                </a>
              </div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  letterSpacing: "0.08em",
                  color: "var(--fg-2)",
                  textAlign: "center",
                }}
              >
                {pageCount && pageCount > 1
                  ? `PAGE 1 OF ${pageCount} — CLICK TO VIEW FULL PDF`
                  : "CLICK TO VIEW FULL PDF"}
              </p>
            </div>
          ) : (
            !imageUrl && (
              <div
                style={{
                  width: "100%",
                  height: 480,
                  background: "var(--fill-2)",
                  border: "var(--bw) solid var(--ink)",
                  borderRadius: "var(--r-card)",
                }}
                aria-label="Loading resume preview"
              />
            )
          )}
        </section>

        {/* Right: feedback panels */}
        <section
          id="resume-feedback"
          className="rl-resume-right print:w-full print:px-0"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {feedback ? (
            <>
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
            </>
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
              <span
                className="pix-blink"
                style={{
                  width: 14,
                  height: 14,
                  background: "var(--cyan)",
                  border: "var(--bw) solid var(--ink)",
                  borderRadius: 4,
                  display: "inline-block",
                }}
              />
              <p
                style={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: "var(--fg-2)",
                  margin: 0,
                }}
              >
                Loading your analysis…
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
        <h1 style={{ fontSize: 28 }}>Couldn't load this report</h1>
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
          ← Back to dashboard
        </a>
      </div>
    </main>
  );
}
