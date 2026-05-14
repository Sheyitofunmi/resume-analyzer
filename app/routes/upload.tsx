import { useState } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";

const STEPS = [
  "Convert PDF to image",
  "Upload resume",
  "Analyze against job description",
  "Save analysis",
];

const FEATURE_PILLS = [
  { icon: "🎯", label: "ATS Score" },
  { icon: "🔑", label: "Keyword Analysis" },
  { icon: "✍️", label: "Rewrite Tips" },
  { icon: "💬", label: "Tone & Style" },
  { icon: "🧠", label: "Interview Prep" },
  { icon: "📊", label: "Structure Check" },
];

const Upload = () => {
  const { fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileSelect = (file: File | null) => {
    setFile(file);
    if (file) setErrors((prev) => ({ ...prev, file: "" }));
  };

  const validate = (
    companyName: string,
    jobTitle: string,
    jobDescription: string,
  ): boolean => {
    const next: Record<string, string> = {};
    if (!companyName.trim()) next.companyName = "Company name is required.";
    else if (companyName.trim().length < 2)
      next.companyName = "Company name must be at least 2 characters.";

    if (!jobTitle.trim()) next.jobTitle = "Job title is required.";
    else if (jobTitle.trim().length < 3)
      next.jobTitle = "Job title must be at least 3 characters.";

    if (!jobDescription.trim())
      next.jobDescription = "Job description is required.";
    else if (jobDescription.trim().length < 50)
      next.jobDescription =
        "Job description must be at least 50 characters. Please paste the full job posting.";

    if (!file) next.file = "Please upload a resume PDF.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);

    try {
      const uuid = generateUUID();

      setCurrentStep(0);
      setStatusText("Converting resume to image…");
      const imageFile = await convertPdfToImage(file);
      if (!imageFile.file) {
        setStatusText("Failed to convert PDF to image. Please try again.");
        setIsProcessing(false);
        setCurrentStep(-1);
        return;
      }

      setCurrentStep(1);
      setStatusText("Uploading resume…");
      const uploadedImage = await fs.write(
        `resume-${uuid}.png`,
        imageFile.file,
      );
      if (!uploadedImage) {
        setStatusText("Failed to upload image. Please try again.");
        setIsProcessing(false);
        setCurrentStep(-1);
        return;
      }

      setCurrentStep(2);
      setStatusText("Analyzing resume against job description…");
      const [feedback, uploadedFile] = await Promise.all([
        ai.feedback(
          uploadedImage.path,
          prepareInstructions({ jobTitle, jobDescription }),
        ),
        fs.write(`resume-${uuid}.pdf`, file),
      ]);

      if (!feedback) {
        setStatusText("Analysis failed — please try again.");
        setIsProcessing(false);
        setCurrentStep(-1);
        return;
      }

      setCurrentStep(3);
      setStatusText("Saving analysis…");
      const feedbackText =
        typeof feedback.message.content === "string"
          ? feedback.message.content
          : feedback.message.content[0].text;

      const data = {
        id: uuid,
        resumePath: uploadedFile?.path ?? "",
        imagePath: uploadedImage.path,
        companyName,
        jobTitle,
        jobDescription,
        pageCount: imageFile.pageCount,
        feedback: JSON.parse(feedbackText),
      };
      await kv.set(`resume:${uuid}`, JSON.stringify(data));

      const historyEntry: ScoreHistoryEntry = {
        date: new Date().toISOString(),
        overall: data.feedback.overallScore,
        ats: data.feedback.ATS.score,
        tone: data.feedback.toneAndStyle.score,
        content: data.feedback.content.score,
        structure: data.feedback.structure.score,
        skills: data.feedback.skills.score,
      };
      await kv.set(`resume-history:${uuid}`, JSON.stringify([historyEntry]));

      setStatusText("Done! Redirecting…");
      navigate(`/resume/${uuid}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatusText(`Error: ${message}. Please try again.`);
      setIsProcessing(false);
      setCurrentStep(-1);
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    if (!validate(companyName, jobTitle, jobDescription)) return;

    await handleAnalyze({ companyName, jobTitle, jobDescription, file: file! });
  };

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex flex-col">
      <Navbar />

      <section id="main-content" className="main-section flex-1">
        {/* Hero heading */}
        <div className="page-heading pt-8 sm:pt-12 pb-2">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-2 animate-in fade-in duration-500">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
              AI-Powered Analysis
            </span>
          </div>
          <h1>Smart feedback for your dream job</h1>
          {!isProcessing && (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}
        </div>

        {/* Feature pills — hidden during processing */}
        {!isProcessing && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {FEATURE_PILLS.map((pill, i) => (
              <span
                key={pill.label}
                className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1.5 text-xs sm:text-sm text-gray-600 shadow-sm hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md transition-all duration-200 cursor-default animate-in fade-in duration-500"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span>{pill.icon}</span>
                <span className="font-medium">{pill.label}</span>
              </span>
            ))}
          </div>
        )}

        {isProcessing ? (
          <div className="w-full max-w-lg flex flex-col items-center gap-6 animate-in fade-in duration-300">
            <ol
              aria-label="Upload progress"
              className="w-full flex flex-col gap-2"
            >
              {STEPS.map((label, i) => {
                const done = i < currentStep;
                const active = i === currentStep;
                return (
                  <li
                    key={label}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      done
                        ? "bg-green-50 text-green-700"
                        : active
                          ? "bg-indigo-50 text-indigo-700 shadow-sm"
                          : "bg-gray-50 text-gray-400"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all duration-300 ${
                        done
                          ? "bg-green-500 text-white"
                          : active
                            ? "bg-indigo-500 text-white animate-pulse"
                            : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    {label}
                    {active && (
                      <span className="ml-auto text-xs text-indigo-400 animate-pulse">
                        In progress…
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>

            <p aria-live="polite" aria-atomic="true" className="sr-only">
              {statusText}
            </p>

            <img
              src="/images/resume-scan.gif"
              alt=""
              aria-hidden="true"
              className="w-40 rounded-2xl"
            />
            <p className="text-gray-500 text-sm text-center">{statusText}</p>
          </div>
        ) : (
          <form
            id="upload-form"
            onSubmit={handleSubmit}
            className="w-full max-w-2xl flex flex-col gap-5 text-left bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500"
            noValidate
          >
            <div className="form-div">
              <label htmlFor="company-name">Company Name</label>
              <input
                type="text"
                name="company-name"
                placeholder="e.g. Acme Corp"
                id="company-name"
                aria-invalid={!!errors.companyName}
                aria-describedby={
                  errors.companyName ? "company-name-error" : undefined
                }
                onChange={() =>
                  setErrors((prev) => ({ ...prev, companyName: "" }))
                }
              />
              {errors.companyName && (
                <p
                  id="company-name-error"
                  role="alert"
                  className="text-red-500 text-sm"
                >
                  {errors.companyName}
                </p>
              )}
            </div>

            <div className="form-div">
              <label htmlFor="job-title">Job Title</label>
              <input
                type="text"
                name="job-title"
                placeholder="e.g. Senior Frontend Engineer"
                id="job-title"
                aria-invalid={!!errors.jobTitle}
                aria-describedby={
                  errors.jobTitle ? "job-title-error" : undefined
                }
                onChange={() =>
                  setErrors((prev) => ({ ...prev, jobTitle: "" }))
                }
              />
              {errors.jobTitle && (
                <p
                  id="job-title-error"
                  role="alert"
                  className="text-red-500 text-sm"
                >
                  {errors.jobTitle}
                </p>
              )}
            </div>

            <div className="form-div">
              <label htmlFor="job-description">Job Description</label>
              <textarea
                rows={5}
                name="job-description"
                placeholder="Paste the full job description here…"
                id="job-description"
                aria-invalid={!!errors.jobDescription}
                aria-describedby={
                  errors.jobDescription ? "job-description-error" : undefined
                }
                onChange={() =>
                  setErrors((prev) => ({ ...prev, jobDescription: "" }))
                }
              />
              {errors.jobDescription && (
                <p
                  id="job-description-error"
                  role="alert"
                  className="text-red-500 text-sm"
                >
                  {errors.jobDescription}
                </p>
              )}
            </div>

            <div className="form-div">
              <label htmlFor="uploader">Upload Resume (PDF, max 20 MB)</label>
              <FileUploader onFileSelect={handleFileSelect} />
              {errors.file && (
                <p
                  id="file-error"
                  role="alert"
                  className="text-red-500 text-sm"
                >
                  {errors.file}
                </p>
              )}
            </div>

            <button
              className="primary-button text-lg font-semibold py-3"
              type="submit"
            >
              ✨ Analyze Resume
            </button>
          </form>
        )}
      </section>

      <Footer />
    </main>
  );
};

export default Upload;

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : "Something went wrong.";

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md text-center flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-red-500">Upload Failed</h1>
        <p className="text-gray-600">{message}</p>
        <a href="/upload" className="primary-button w-fit mx-auto">
          Try Again
        </a>
      </div>
    </main>
  );
}
