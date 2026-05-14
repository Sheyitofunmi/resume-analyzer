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
import { prepareInstructions } from "../../constants";

export const meta = () => [
  { title: "Resumind | Review " },
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
  const { auth, isLoading, fs, kv, ai } = usePuterStore();
  const { id } = useParams();
  const navigate = useNavigate();

  const [imageUrl, setImageUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);

  // stored job details (used to pre-fill re-analyze form)
  const [storedJobTitle, setStoredJobTitle] = useState("");
  const [storedCompanyName, setStoredCompanyName] = useState("");
  const [storedImagePath, setStoredImagePath] = useState("");

  // re-analyze form state
  const [showReanalyze, setShowReanalyze] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobDescription, setNewJobDescription] = useState("");
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [reanalyzeStatus, setReanalyzeStatus] = useState("");

  // Auth guard — only fires once Puter finishes loading
  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate(`/auth?next=/resume/${id}`);
    }
  }, [isLoading, auth.isAuthenticated]);

  // Clear stale state whenever the resume id changes
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
  }, [id]);

  // Load resume data — only runs when auth is ready
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
        // pre-fill form fields
        setNewJobTitle(data.jobTitle ?? "");
        setNewJobDescription(data.jobDescription ?? "");
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
        // retry once on parse failure (model occasionally truncates)
        setReanalyzeStatus("Retrying analysis…");
        newFeedback = await runAnalysis();
      }

      // Persist updated feedback + job details to KV
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
      setReanalyzeStatus("");
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
      {/* Nav — hidden on print */}
      <nav className="resume-nav print:hidden">
        <Link to="/" className="back-button">
          <img src="/icons/back.svg" alt="back" className="w-2.5 h-2.5" />
          <span className="text-gray-800 text-sm font-semibold">
            Back to Homepage
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {feedback && !isReanalyzing && (
            <button
              onClick={() => setShowReanalyze((v) => !v)}
              className="back-button text-sm font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50 transition-colors"
            >
              Re-analyze
            </button>
          )}
          {feedback && (
            <button
              onClick={() => window.print()}
              className="back-button text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
            >
              Download Report
            </button>
          )}
        </div>
      </nav>

      {/* Re-analyze form — hidden on print */}
      {showReanalyze && (
        <div className="print:hidden border-b border-gray-100 bg-indigo-50/50 px-8 py-5 animate-in fade-in duration-300">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            Re-analyze against a different job description
          </p>
          <form
            onSubmit={handleReanalyze}
            className="flex flex-col gap-3 max-w-2xl !gap-3"
          >
            <input
              type="text"
              value={newJobTitle}
              onChange={(e) => setNewJobTitle(e.target.value)}
              placeholder="Job Title"
              required
              className="text-sm"
            />
            <textarea
              rows={4}
              value={newJobDescription}
              onChange={(e) => setNewJobDescription(e.target.value)}
              placeholder="Paste job description here…"
              required
              className="text-sm"
            />
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

      {/* Re-analyze loading state — hidden on print */}
      {isReanalyzing && (
        <div className="print:hidden flex flex-col items-center gap-3 py-8">
          <img src="/images/resume-scan.gif" className="w-[160px]" />
          <p className="text-gray-600 text-sm">{reanalyzeStatus}</p>
        </div>
      )}

      {/* Re-analyze error */}
      {reanalyzeStatus && !isReanalyzing && (
        <p className="print:hidden text-red-500 text-sm px-8 py-3 bg-red-50">
          {reanalyzeStatus}
        </p>
      )}

      {/* Print header — only visible when printing */}
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
        {/* Left: resume image — hidden on print */}
        <section className="feedback-section print:hidden bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
          {imageUrl && resumeUrl && (
            <div className="flex flex-col items-center gap-2 animate-in fade-in duration-1000">
              <div className="gradient-border max-sm:m-0 h-[90%] max-wxl:h-fit w-fit">
                <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                  <img
                    src={imageUrl}
                    className="w-full h-full object-contain rounded-2xl"
                    title="resume"
                  />
                </a>
              </div>
              {pageCount && pageCount > 1 && (
                <p className="text-xs text-gray-400">
                  Showing page 1 of {pageCount} — click to view full PDF
                </p>
              )}
            </div>
          )}
        </section>

        {/* Right: feedback — full width on print */}
        <section className="feedback-section print:w-full print:px-0">
          <h2 className="text-4xl !text-black font-bold print:hidden">
            Resume Review
          </h2>
          {feedback ? (
            <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
              <Summary feedback={feedback} />
              <ATS
                score={feedback.ATS.score || 0}
                suggestions={feedback.ATS.tips || []}
                keywords={feedback.ATS.keywords}
              />
              <Details feedback={feedback} />
            </div>
          ) : !isReanalyzing ? (
            <img src="/images/resume-scan-2.gif" className="w-full" />
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
