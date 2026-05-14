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

export const meta = () => [
  { title: "ResumeLens | Review " },
  { name: "description", content: "Detailed overview of your resume" },
];

const MAX_JOB_DESC_CHARS = 3000;

function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first !== -1 && last !== -1) return text.slice(first, last + 1);
  return text.trim();
}

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
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:px-4 focus:py-2 focus:rounded focus:shadow focus:text-indigo-700 focus:font-semibold"
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
              onClick={() => setShowReanalyze((v) => !v)}
              aria-expanded={showReanalyze}
              aria-controls="reanalyze-form"
              className="back-button text-sm font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Re-analyze
            </button>
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

      {/* Re-analyze form */}
      {showReanalyze && (
        <div
          id="reanalyze-form"
          className="print:hidden border-b border-gray-100 bg-indigo-50/50 px-8 py-5 animate-in fade-in duration-300"
        >
          <p className="text-sm font-semibold text-gray-700 mb-1">
            Re-analyze against a different job description
          </p>
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3 w-fit">
            ⚠ This will replace your current analysis.
          </p>
          <form
            onSubmit={handleReanalyze}
            className="flex flex-col gap-3 max-w-2xl"
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
                rows={4}
                value={newJobDescription}
                onChange={(e) => setNewJobDescription(e.target.value)}
                placeholder="Paste job description here…"
                required
                className="text-sm"
              />
            </div>
            <div className="flex gap-2">
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
          className="feedback-section print:hidden bg-[url('/images/bg-small.svg')] bg-cover lg:h-screen lg:sticky lg:top-0 flex items-center justify-center"
        >
          {imageUrl && resumeUrl ? (
            <div className="flex flex-col items-center gap-3 animate-in fade-in duration-1000 w-full">
              <div className="gradient-border w-full max-w-sm mx-auto">
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View full PDF resume"
                >
                  <img
                    src={imageUrl}
                    alt={`Resume preview${storedCompanyName ? ` for ${storedCompanyName}` : ""}`}
                    className="w-full object-contain rounded-2xl max-h-[70vh]"
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
              <div className="w-full max-w-sm mx-auto gradient-border">
                <div className="w-full h-[400px] bg-gray-100 rounded-2xl animate-pulse" />
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
    <main className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md text-center flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-red-500">
          Failed to Load Resume
        </h1>
        <p className="text-gray-600">{message}</p>
        <a href="/" className="primary-button w-fit mx-auto">
          Back to Dashboard
        </a>
      </div>
    </main>
  );
}
