import { useState } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";
import { springs } from "~/lib/motion";

const STEPS = [
  { label: "convert PDF to image", cmd: "pdf2img" },
  { label: "upload resume", cmd: "fs.write" },
  { label: "analyze against job description", cmd: "ai.feedback" },
  { label: "save analysis", cmd: "kv.set" },
];

// ── Cinematic AI processing panel ──────────────────────────────────────
function ProcessingPanel({
  currentStep,
  statusText,
}: {
  currentStep: number;
  statusText: string;
}) {
  const reduced = useReducedMotion();
  const totalDone = Math.max(0, currentStep);
  const progressPct = (totalDone / STEPS.length) * 100;

  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={reduced ? {} : { opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
      style={{
        width: "100%",
        maxWidth: 560,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      {/* Main card */}
      <div
        className="rl-card is-phos"
        style={{ position: "relative", padding: 0, overflow: "hidden" }}
      >
        {/* Ambient scan line */}
        {!reduced && (
          <motion.div
            animate={{ y: ["-100%", "400%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              height: 1,
              background:
                "linear-gradient(90deg, transparent 0%, var(--phos-dim) 30%, var(--phos) 50%, var(--phos-dim) 70%, transparent 100%)",
              opacity: 0.5,
              pointerEvents: "none",
              zIndex: 1,
            }}
          />
        )}

        <span className="rl-corner tl" />
        <span className="rl-corner tr" />
        <span className="rl-corner bl" />
        <span className="rl-corner br" />

        {/* Progress bar at top */}
        <div
          style={{
            height: 2,
            background: "var(--border)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              background:
                "linear-gradient(90deg, var(--phos-dim), var(--phos))",
              boxShadow: "0 0 12px var(--phos-glow)",
            }}
          />
        </div>

        {/* Steps */}
        <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {STEPS.map(({ label, cmd }, i) => {
            const done = i < currentStep;
            const active = i === currentStep;

            return (
              <motion.li
                key={label}
                animate={{
                  background: active ? "rgba(168,230,163,0.05)" : "transparent",
                }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 20px",
                  borderBottom:
                    i < STEPS.length - 1 ? "1px dashed var(--border)" : "none",
                  position: "relative",
                }}
              >
                {/* Step indicator */}
                <div
                  style={{
                    flexShrink: 0,
                    width: 20,
                    height: 20,
                    position: "relative",
                  }}
                >
                  <AnimatePresence mode="wait">
                    {done ? (
                      <motion.span
                        key="done"
                        initial={reduced ? {} : { scale: 0, rotate: -90 }}
                        animate={reduced ? {} : { scale: 1, rotate: 0 }}
                        transition={springs.elastic}
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--font-mono)",
                          fontSize: 13,
                          color: "var(--phos)",
                        }}
                      >
                        ✓
                      </motion.span>
                    ) : active ? (
                      <motion.span
                        key="active"
                        animate={reduced ? {} : { rotate: [0, 360] }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 14,
                          color: "var(--copper)",
                        }}
                      >
                        ◈
                      </motion.span>
                    ) : (
                      <motion.span
                        key="waiting"
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--font-mono)",
                          fontSize: 11,
                          color: "var(--fg-4)",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Label */}
                <motion.span
                  animate={{
                    color: done
                      ? "var(--phos)"
                      : active
                        ? "var(--fg-1)"
                        : "var(--fg-4)",
                  }}
                  transition={{ duration: 0.25 }}
                  style={{
                    flex: 1,
                    fontFamily: "var(--font-mono)",
                    fontSize: 13,
                  }}
                >
                  {label}
                </motion.span>

                {/* Status tag */}
                <AnimatePresence mode="wait">
                  <motion.span
                    key={done ? "done" : active ? "running" : "pending"}
                    initial={reduced ? {} : { opacity: 0, x: 6 }}
                    animate={reduced ? {} : { opacity: 1, x: 0 }}
                    exit={reduced ? {} : { opacity: 0, x: -6 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      color: done
                        ? "var(--phos-dim)"
                        : active
                          ? "var(--copper)"
                          : "var(--fg-4)",
                    }}
                  >
                    {done ? "done" : active ? "running…" : cmd}
                  </motion.span>
                </AnimatePresence>

                {/* Active row: AI thinking bar */}
                {active && !reduced && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 20,
                      right: 20,
                      height: 1,
                    }}
                  >
                    <div className="rl-thinking-bar" />
                  </motion.div>
                )}
              </motion.li>
            );
          })}
        </ol>
      </div>

      {/* Status text */}
      <motion.div
        layout
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 16px",
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-md)",
        }}
      >
        <motion.span
          animate={
            reduced
              ? {}
              : {
                  boxShadow: [
                    "0 0 6px var(--phos), 0 0 12px var(--phos-glow)",
                    "0 0 14px var(--phos), 0 0 24px var(--phos-glow)",
                    "0 0 6px var(--phos), 0 0 12px var(--phos-glow)",
                  ],
                  scale: [1, 1.3, 1],
                }
          }
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--phos)",
            flexShrink: 0,
            display: "inline-block",
          }}
        />
        <AnimatePresence mode="wait">
          <motion.span
            key={statusText}
            initial={reduced ? {} : { opacity: 0, y: 4 }}
            animate={reduced ? {} : { opacity: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, y: -4 }}
            transition={{ duration: 0.22 }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--fg-2)",
            }}
            aria-live="polite"
          >
            {statusText}
          </motion.span>
        </AnimatePresence>
      </motion.div>
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
    if (!companyName.trim()) next.companyName = "company_name is required";
    else if (companyName.trim().length < 2)
      next.companyName = "must be at least 2 characters";
    if (!jobTitle.trim()) next.jobTitle = "job_title is required";
    else if (jobTitle.trim().length < 3)
      next.jobTitle = "must be at least 3 characters";
    if (!jobDescription.trim())
      next.jobDescription = "job_description is required";
    else if (jobDescription.trim().length < 50)
      next.jobDescription = "paste the full job posting (min 50 chars)";
    if (!file) next.file = "upload a resume PDF";
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
        setStatusText("Failed to convert PDF. Please try again.");
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
        setStatusText("Upload failed. Please try again.");
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
    <main className="rl-page">
      <Navbar />

      <div className="rl-section" style={{ flex: 1 }}>
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65, ease: [0.19, 1, 0.22, 1] }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 32,
          }}
        >
          <span className="rl-eyebrow-prompt">resumelens analyze</span>
          <h1 className="rl-h1">
            smart_feedback
            <br />
            for_your_
            <span style={{ color: "var(--phos)" }}>dream_job</span>
          </h1>
          <AnimatePresence>
            {!isProcessing && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                style={{
                  margin: 0,
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                  color: "var(--fg-2)",
                  lineHeight: 1.7,
                  maxWidth: 560,
                  overflow: "hidden",
                }}
              >
                Drop your PDF. Paste the JD. We score five dimensions and
                surface every missing keyword in three seconds.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {isProcessing ? (
          /* ── Cinematic AI analysis pipeline ── */
          <ProcessingPanel currentStep={currentStep} statusText={statusText} />
        ) : (
          /* Upload form */
          <form
            id="upload-form"
            onSubmit={handleSubmit}
            className="rl-card is-raised rl-fade-in rl-upload-form"
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 640,
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
            noValidate
          >
            <span className="rl-corner tl" />
            <span className="rl-corner tr" />
            <span className="rl-corner bl" />
            <span className="rl-corner br" />

            {/* Company name */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="company-name">// company_name</label>
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
              {errors.companyName && (
                <p
                  role="alert"
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--ember)",
                  }}
                >
                  ✕ {errors.companyName}
                </p>
              )}
            </div>

            {/* Job title */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="job-title">// job_title</label>
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
              {errors.jobTitle && (
                <p
                  role="alert"
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--ember)",
                  }}
                >
                  ✕ {errors.jobTitle}
                </p>
              )}
            </div>

            {/* Job description */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="job-description">// job_description</label>
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
              {errors.jobDescription && (
                <p
                  role="alert"
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--ember)",
                  }}
                >
                  ✕ {errors.jobDescription}
                </p>
              )}
            </div>

            {/* File uploader */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label htmlFor="uploader">// resume_pdf (max 20 MB)</label>
              <FileUploader onFileSelect={handleFileSelect} />
              {errors.file && (
                <p
                  role="alert"
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--ember)",
                  }}
                >
                  ✕ {errors.file}
                </p>
              )}
            </div>

            {/* Feature chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                ["ATS", "ats_check"],
                ["KW", "keyword_diff"],
                ["RW", "rewrite_tips"],
                ["TS", "tone_style"],
                ["IV", "interview_prep"],
              ].map(([k, label]) => (
                <span key={k} className="rl-chip">
                  <span style={{ color: "var(--copper)" }}>[{k}]</span>
                  <span>{label}</span>
                </span>
              ))}
            </div>

            <motion.button
              type="submit"
              className="rl-btn rl-btn-primary"
              style={{
                alignSelf: "flex-start",
                fontSize: 14,
                position: "relative",
                overflow: "hidden",
              }}
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ y: 0, scale: 0.97 }}
              transition={springs.snappy}
            >
              $ run analyze →
            </motion.button>
          </form>
        )}
      </div>

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
          upload_failed
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
          href="/upload"
          className="rl-btn rl-btn-primary"
          style={{ alignSelf: "center" }}
        >
          ↺ try_again
        </a>
      </div>
    </main>
  );
}
