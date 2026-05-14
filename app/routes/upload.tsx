import { type FormEvent, useState } from "react";
import { isRouteErrorResponse, useRouteError } from "react-router";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";

const Upload = () => {
  const { fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
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
    if (!jobTitle.trim()) next.jobTitle = "Job title is required.";
    if (!jobDescription.trim())
      next.jobDescription = "Job description is required.";
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

      setStatusText("Converting resume to image...");
      const imageFile = await convertPdfToImage(file);
      if (!imageFile.file) {
        setStatusText("Error: Failed to convert PDF to image");
        setIsProcessing(false);
        return;
      }

      setStatusText("Uploading image...");
      const uploadedImage = await fs.write(
        `resume-${uuid}.png`,
        imageFile.file,
      );
      if (!uploadedImage) {
        setStatusText("Error: Failed to upload image");
        setIsProcessing(false);
        return;
      }

      setStatusText("Analyzing resume against job description...");

      const [feedback, uploadedFile] = await Promise.all([
        ai.feedback(
          uploadedImage.path,
          prepareInstructions({ jobTitle, jobDescription }),
        ),
        fs.write(`resume-${uuid}.pdf`, file),
      ]);

      if (!feedback) {
        setStatusText("Error: Failed to analyze resume. Please try again.");
        setIsProcessing(false);
        return;
      }

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
      setStatusText("Analysis complete, redirecting...");
      navigate(`/resume/${uuid}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatusText(`Error: ${message}. Please try again.`);
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Smart feedback for your dream job</h1>
          {isProcessing ? (
            <>
              <h2>{statusText}</h2>
              <img src="/images/resume-scan.gif" className="w-full" />
            </>
          ) : (
            <h2>Drop your resume for an ATS score and improvement tips</h2>
          )}
          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 mt-8"
              noValidate
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  id="company-name"
                  aria-invalid={!!errors.companyName}
                  onChange={() =>
                    setErrors((prev) => ({ ...prev, companyName: "" }))
                  }
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.companyName}
                  </p>
                )}
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  id="job-title"
                  aria-invalid={!!errors.jobTitle}
                  onChange={() =>
                    setErrors((prev) => ({ ...prev, jobTitle: "" }))
                  }
                />
                {errors.jobTitle && (
                  <p className="text-red-500 text-sm mt-1">{errors.jobTitle}</p>
                )}
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Job Description"
                  id="job-description"
                  aria-invalid={!!errors.jobDescription}
                  onChange={() =>
                    setErrors((prev) => ({ ...prev, jobDescription: "" }))
                  }
                />
                {errors.jobDescription && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.jobDescription}
                  </p>
                )}
              </div>

              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
                {errors.file && (
                  <p className="text-red-500 text-sm mt-1">{errors.file}</p>
                )}
              </div>

              <button className="primary-button" type="submit">
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
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
