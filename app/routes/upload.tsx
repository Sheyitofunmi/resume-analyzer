import { useState } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import MobileBottomNav from "~/components/MobileBottomNav";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage, extractPdfText } from "~/lib/pdf2img";
import { convertDocxToImage, extractDocxText } from "~/lib/docx2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";

const STEPS = [
  "Parsing document structure…",
  "Uploading your resume…",
  "Scoring 5 dimensions against the job post…",
  "Saving your analysis…",
];

// ── Scanning terminal panel ─────────────────────────────────────────────
function ProcessingPanel({
  currentStep,
  statusText,
  fileName,
}: {
  currentStep: number;
  statusText: string;
  fileName?: string;
}) {
  const progressPct = Math.min(
    100,
    Math.max(8, (Math.max(0, currentStep) / STEPS.length) * 100),
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      style={{
        border: "var(--bw) solid var(--ink)",
        borderRadius: 18,
        background: "var(--dark-bg)",
        color: "var(--dark-fg)",
        padding: 40,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Lime scan beam */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 40,
          top: "4%",
          background:
            "linear-gradient(180deg,transparent,rgba(198,242,78,.14) 45%,rgba(198,242,78,.4) 50%,rgba(198,242,78,.14) 55%,transparent)",
          animation: "rl-scan 2.4s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.1em",
          color: "var(--lime)",
          marginBottom: 22,
        }}
      >
        SCANNING {(fileName || "YOUR RESUME").toUpperCase()}
        <span className="pix-blink">▌</span>
      </div>

      <ol
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 13,
          fontFamily: "var(--font-mono)",
          fontSize: 12.5,
          margin: 0,
          padding: 0,
          listStyle: "none",
        }}
      >
        {STEPS.map((line, i) => {
          const done = currentStep > i;
          const active = currentStep === i;
          return (
            <li
              key={line}
              style={{
                color: done
                  ? "var(--lime)"
                  : active
                    ? "var(--dark-fg)"
                    : "#5A5F55",
                transition: "color var(--dur-base) ease",
              }}
            >
              {done ? "✓ " : active ? "▸ " : "· "}
              {line}
            </li>
          );
        })}
      </ol>

      <div
        style={{
          marginTop: 26,
          height: 10,
          borderRadius: 5,
          background: "rgba(255,255,255,.12)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progressPct}%`,
            height: 10,
            background: "var(--lime)",
            borderRadius: 5,
            transition: "width .5s ease",
          }}
        />
      </div>

      <p
        aria-live="polite"
        style={{
          margin: "18px 0 0",
          fontFamily: "var(--font-mono)",
          fontSize: 11.5,
          color: "var(--dark-muted)",
        }}
      >
        {statusText}
      </p>
    </motion.div>
  );
}

const Upload = () => {
  const { fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFileSelect = (f: File | null) => {
    setFile(f);
    if (f) setErrors((prev) => ({ ...prev, file: "" }));
  };

  const validate = (
    companyName: string,
    jobTitle: string,
    jobDescription: string,
  ): boolean => {
    const next: Record<string, string> = {};
    if (!companyName.trim()) next.companyName = "Company name is required";
    else if (companyName.trim().length < 2)
      next.companyName = "Must be at least 2 characters";
    if (!jobTitle.trim()) next.jobTitle = "Job title is required";
    else if (jobTitle.trim().length < 3)
      next.jobTitle = "Must be at least 3 characters";
    if (!jobDescription.trim())
      next.jobDescription = "Job description is required";
    else if (jobDescription.trim().length < 50)
      next.jobDescription = "Paste the full job posting (min 50 characters)";
    if (!file) next.file = "Upload a resume (PDF or DOCX)";
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
      const isDocx = file.name.toLowerCase().endsWith(".docx");
      const instructions = prepareInstructions({ jobTitle, jobDescription });

      const onChunk = (acc: string) => {
        if (acc.includes('"skills"')) setStatusText("Scoring skills…");
        else if (acc.includes('"structure"'))
          setStatusText("Scoring document structure…");
        else if (acc.includes('"content"')) setStatusText("Scoring content…");
        else if (acc.includes('"toneAndStyle"'))
          setStatusText("Scoring tone & style…");
        else if (acc.includes('"ATS"'))
          setStatusText("Scoring ATS compatibility…");
      };

      // Try text extraction to skip the image-based vision call
      let resumeText: string | null = null;
      try {
        const extracted = isDocx
          ? await extractDocxText(file)
          : await extractPdfText(file);
        if (extracted.trim().length >= 100) resumeText = extracted;
      } catch {
        /* fall through to image path */
      }

      setCurrentStep(0);
      setStatusText("Converting resume to image…");
      const imageResult = isDocx
        ? await convertDocxToImage(file)
        : await convertPdfToImage(file);
      if (!imageResult.file) {
        setStatusText("Failed to convert resume. Please try again.");
        setIsProcessing(false);
        setCurrentStep(-1);
        return;
      }

      setCurrentStep(1);

      let imagePath: string;
      let feedback: Awaited<ReturnType<typeof ai.feedback>>;
      let uploadedFile: Awaited<ReturnType<typeof fs.write>>;

      if (resumeText) {
        // Text path: image upload + AI analysis + file upload all run in parallel
        setStatusText("Uploading & analyzing…");
        const [uploadedImage, fb, uf] = await Promise.all([
          fs.write(`resume-${uuid}.jpg`, imageResult.file),
          ai.feedbackFromText(resumeText, instructions, onChunk),
          fs.write(`resume-${uuid}.${isDocx ? "docx" : "pdf"}`, file),
        ]);
        if (!uploadedImage) {
          setStatusText("Upload failed. Please try again.");
          setIsProcessing(false);
          setCurrentStep(-1);
          return;
        }
        imagePath = uploadedImage.path;
        feedback = fb;
        uploadedFile = uf;
      } else {
        // Image path: upload first, then analyze
        setStatusText("Uploading resume…");
        const uploadedImage = await fs.write(
          `resume-${uuid}.jpg`,
          imageResult.file,
        );
        if (!uploadedImage) {
          setStatusText("Upload failed. Please try again.");
          setIsProcessing(false);
          setCurrentStep(-1);
          return;
        }
        imagePath = uploadedImage.path;
        setCurrentStep(2);
        setStatusText("Analyzing resume…");
        const [fb, uf] = await Promise.all([
          ai.feedback(imagePath, instructions, onChunk),
          fs.write(`resume-${uuid}.${isDocx ? "docx" : "pdf"}`, file),
        ]);
        feedback = fb;
        uploadedFile = uf;
      }

      setCurrentStep(2);

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
        imagePath,
        resumeText: resumeText ?? undefined,
        companyName,
        jobTitle,
        jobDescription,
        pageCount: imageResult.pageCount,
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

  const fieldError = (msg?: string) =>
    msg ? (
      <p
        role="alert"
        style={{
          margin: 0,
          fontSize: 12,
          fontWeight: 700,
          color: "var(--red)",
        }}
      >
        ✕ {msg}
      </p>
    ) : null;

  return (
    <main className="rl-page has-bottom-nav">
      <Navbar />

      <div
        id="main-content"
        style={{
          flex: 1,
          maxWidth: 760,
          width: "100%",
          margin: "0 auto",
          padding: "56px 32px 80px",
          boxSizing: "border-box",
        }}
      >
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 32 }}
        >
          <h1
            style={{
              fontWeight: 900,
              fontSize: 38,
              letterSpacing: "-0.03em",
              margin: "0 0 8px",
            }}
          >
            Upload a resume
          </h1>
          <AnimatePresence>
            {!isProcessing && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  margin: 0,
                  fontSize: 15,
                  color: "var(--fg-2)",
                  fontWeight: 500,
                }}
              >
                Tell us the job you're targeting and we'll score your resume
                against it — five dimensions, keyword gaps, and rewrites.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {isProcessing ? (
          <ProcessingPanel
            currentStep={currentStep}
            statusText={statusText}
            fileName={file?.name}
          />
        ) : (
          /* Upload form */
          <form
            id="upload-form"
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
            noValidate
          >
            <div className="g-halves" style={{ gap: 14 }}>
              {/* Company name */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  htmlFor="company-name"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 12,
                    fontWeight: 800,
                    textTransform: "none",
                    letterSpacing: 0,
                    color: "var(--ink)",
                  }}
                >
                  Company
                </label>
                <input
                  type="text"
                  name="company-name"
                  id="company-name"
                  placeholder="e.g. Acme Corp"
                  aria-invalid={!!errors.companyName}
                  onChange={() =>
                    setErrors((prev) => ({ ...prev, companyName: "" }))
                  }
                />
                {fieldError(errors.companyName)}
              </div>

              {/* Job title */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label
                  htmlFor="job-title"
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
                  type="text"
                  name="job-title"
                  id="job-title"
                  placeholder="e.g. Senior Frontend Engineer"
                  aria-invalid={!!errors.jobTitle}
                  onChange={() =>
                    setErrors((prev) => ({ ...prev, jobTitle: "" }))
                  }
                />
                {fieldError(errors.jobTitle)}
              </div>
            </div>

            {/* Job description */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label
                htmlFor="job-description"
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
                rows={6}
                name="job-description"
                id="job-description"
                placeholder="Paste the full job description here…"
                aria-invalid={!!errors.jobDescription}
                onChange={() =>
                  setErrors((prev) => ({ ...prev, jobDescription: "" }))
                }
              />
              {fieldError(errors.jobDescription)}
            </div>

            {/* File uploader */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <FileUploader onFileSelect={handleFileSelect} />
              {fieldError(errors.file)}
            </div>

            {/* Trust row */}
            <div
              style={{
                display: "flex",
                gap: 20,
                flexWrap: "wrap",
                fontFamily: "var(--font-mono)",
                fontSize: 10.5,
                letterSpacing: "0.06em",
                color: "var(--fg-2)",
              }}
            >
              <span>✓ NEVER SHARED</span>
              <span>✓ DELETED ON REQUEST</span>
              <span>✓ 30-SECOND SCAN</span>
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--lg"
              style={{ alignSelf: "flex-start" }}
            >
              Run analysis →
            </button>
          </form>
        )}
      </div>

      <Footer />
      <MobileBottomNav />
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
        <h1 style={{ fontSize: 28 }}>Upload failed</h1>
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
        <a href="/upload" className="btn btn--primary">
          ↺ Try again
        </a>
      </div>
    </main>
  );
}
