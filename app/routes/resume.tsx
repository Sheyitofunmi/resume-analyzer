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
    <main className="!pt-0">
      {/* Skip link */}
      <a
        href="#resume-feedback"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:shadow focus:text-[#e11d48] focus:font-semibold"
      >
        Skip to feedback
      </a>

      {/* Nav */}
      <nav className="resume-nav print:hidden">
        <Link to="/" className="back-button">
          <img
            src="/icons/back.svg"
            alt=""
            aria-hidden="true"
            className="w-2.5 h-2.5"
          />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {feedback && !isReanalyzing && (
            <button
              onClick={() => setShowReanalyze(true)}
              className="back-button text-sm font-semibold text-[#0a0a0a] hover:bg-[#f8f7f4] transition-colors"
            >
              Re-analyze
            </button>
          )}
          {feedback && (
            <Link
              to={`/resume/${id}/edit`}
              className="back-button text-sm font-semibold text-[#0a0a0a] hover:bg-[#f8f7f4] transition-colors"
            >
              Edit Resume
            </Link>
          )}
          {feedback && (
            <button
              onClick={() => window.print()}
              className="back-button text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              Download Report
            </button>
          )}
        </div>
      </nav>

      {/* Demo feedback notice */}
      {isUsingDemoFeedback && (
        <div
          role="alert"
          className="print:hidden flex items-start gap-3 bg-amber-50 border-b border-amber-200 px-6 py-3"
        >
          <span
            className="text-amber-500 text-lg leading-none mt-0.5"
            aria-hidden="true"
          >
            ⚠
          </span>
          <p className="text-sm text-amber-800">
            <span className="font-semibold">AI unavailable.</span> The analysis
            below is sample data — the AI service could not be reached. Try
            re-analyzing when service is restored.
          </p>
        </div>
      )}

      {/* Success toast */}
      {successToast && (
        <div
          role="status"
          aria-live="polite"
          className="print:hidden flex items-center gap-2 bg-green-50 border-b border-green-200 px-6 py-3"
        >
          <span className="text-green-600" aria-hidden="true">
            ✓
          </span>
          <p className="text-sm text-green-800 font-medium">
            Re-analysis complete — feedback updated.
          </p>
        </div>
      )}

      {/* Re-analyze modal */}
      {showReanalyze && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reanalyze-title"
          className="print:hidden fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowReanalyze(false)}
            aria-hidden="true"
          />
          <div className="relative bg-white border border-[#e5e5e5] w-full max-w-lg p-6 animate-in fade-in duration-200">
            <h2
              id="reanalyze-title"
              className="!text-base !text-gray-900 font-semibold mb-1"
            >
              Re-analyze Resume
            </h2>
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 mb-4 w-fit">
              ⚠ This will replace your current analysis.
            </p>
            <form
              onSubmit={handleReanalyze}
              className="flex flex-col gap-3"
              noValidate
            >
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="reanalyze-job-title"
                  className="text-xs font-medium text-gray-600"
                >
                  Job Title
                </label>
                <input
                  id="reanalyze-job-title"
                  type="text"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  required
                  className="text-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="reanalyze-job-desc"
                  className="text-xs font-medium text-gray-600"
                >
                  Job Description
                </label>
                <textarea
                  id="reanalyze-job-desc"
                  rows={5}
                  value={newJobDescription}
                  onChange={(e) => setNewJobDescription(e.target.value)}
                  placeholder="Paste job description here…"
                  required
                  className="text-sm"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="primary-button w-fit px-6 text-sm"
                >
                  Analyze
                </button>
                <button
                  type="button"
                  onClick={() => setShowReanalyze(false)}
                  className="back-button text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Re-analyze loading */}
      {isReanalyzing && (
        <div
          className="print:hidden flex flex-col items-center gap-3 py-8"
          aria-live="polite"
          aria-busy="true"
        >
          <img
            src="/images/resume-scan.gif"
            alt=""
            aria-hidden="true"
            className="w-[160px]"
          />
          <p className="text-gray-600 text-sm">{reanalyzeStatus}</p>
        </div>
      )}

      {/* Re-analyze error */}
      {reanalyzeStatus && !isReanalyzing && (
        <p
          role="alert"
          className="print:hidden text-red-700 text-sm px-8 py-3 bg-red-50 border-b border-red-100"
        >
          {reanalyzeStatus}
        </p>
      )}

      {/* Print header */}
      {feedback && (
        <div className="hidden print:block px-8 pt-6 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-black">
            Resume Feedback Report
          </h1>
          {storedCompanyName && (
            <p className="text-gray-600 text-sm mt-1">
              {storedCompanyName}
              {storedJobTitle ? ` · ${storedJobTitle}` : ""}
            </p>
          )}
        </div>
      )}

      <div className="flex flex-row w-full max-lg:flex-col-reverse">
        {/* Left: resume image */}
        <section
          aria-label="Resume preview"
          className="feedback-section print:hidden bg-[#f8f7f4] lg:h-screen lg:sticky lg:top-0 flex items-center justify-center border-r border-[#e5e5e5]"
        >
          {imageUrl && resumeUrl ? (
            <div className="flex flex-col items-center gap-3 animate-in fade-in duration-1000 w-full">
              <div className="resume-image-card w-full max-w-sm mx-auto">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View full PDF resume"
                >
                  <img
                    src={imageUrl}
                    alt={`Resume preview${storedCompanyName ? ` for ${storedCompanyName}` : ""}`}
                    className="w-full object-contain max-h-[70vh]"
                  />
                </a>
              </div>
              {pageCount && pageCount > 1 && (
                <p className="text-xs text-gray-400 text-center">
                  Showing page 1 of {pageCount} — click to view full PDF
                </p>
              )}
            </div>
          ) : (
            !imageUrl && (
              <div className="resume-image-card w-full max-w-sm mx-auto">
                <div className="w-full h-[400px] bg-[#e5e5e5] animate-pulse" />
              </div>
            )
          )}
        </section>

        {/* Right: feedback */}
        <section
          id="resume-feedback"
          className="feedback-section print:w-full print:px-0"
        >
          <h2 className="!text-2xl sm:!text-3xl !text-black font-bold print:hidden">
            Resume Review
          </h2>
          {feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
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
            <div aria-live="polite" aria-busy="true">
              <img
                src="/images/resume-scan-2.gif"
                alt="Loading resume analysis…"
                className="w-full"
              />
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
    <main className="bg-[#f8f7f4] min-h-screen flex items-center justify-center">
      <div className="bg-white border border-[#e5e5e5] p-10 max-w-md text-center flex flex-col gap-4">
        <p className="text-xs font-semibold text-[#525252] uppercase tracking-widest">
          Error
        </p>
        <h1
          className="text-3xl font-normal text-[#0a0a0a]"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          Failed to load resume.
        </h1>
        <p className="text-[#525252]">{message}</p>
        <a href="/" className="primary-button w-fit mx-auto">
          Back to Dashboard
        </a>
      </div>
    </main>
  );
}
