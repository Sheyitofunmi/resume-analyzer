import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath },
  onDelete,
}: {
  resume: Resume;
  onDelete?: () => void;
}) => {
  const { fs } = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState("");
  const [imageLoading, setImageLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const loadResume = async () => {
      const blob = await fs.read(imagePath);
      if (!blob) {
        setImageLoading(false);
        return;
      }
      setResumeUrl(URL.createObjectURL(blob));
      setImageLoading(false);
    };

    loadResume();
  }, [imagePath]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete(true);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete(false);
  };

  return (
    <div className="resume-card animate-in fade-in duration-1000 group relative">
      {onDelete && !confirmDelete && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-2 right-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          aria-label="Delete resume"
        >
          <span
            className="text-red-500 text-sm font-bold leading-none"
            aria-hidden="true"
          >
            ✕
          </span>
        </button>
      )}

      {confirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={`confirm-delete-${id}`}
          className="absolute top-2 right-2 z-10 bg-white rounded-xl shadow-lg px-3 py-2 flex flex-col gap-2 min-w-[140px]"
        >
          <p
            id={`confirm-delete-${id}`}
            className="text-sm font-semibold text-gray-800"
          >
            Delete resume?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="flex-1 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Delete
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Link to={`/resume/${id}`} className="flex flex-col gap-5">
        <div className="resume-card-header">
          <div className="flex flex-col gap-1 min-w-0 flex-1 pr-2">
            {companyName && (
              <h2 className="!text-base sm:!text-lg !text-black font-bold break-words leading-snug">
                {companyName}
              </h2>
            )}
            {jobTitle && (
              <p className="text-sm break-words text-gray-500">{jobTitle}</p>
            )}
            {!companyName && !jobTitle && (
              <h2 className="!text-base !text-black font-bold">Resume</h2>
            )}
          </div>
          <div className="flex-shrink-0">
            <ScoreCircle score={feedback.overallScore} />
          </div>
        </div>

        <div className="gradient-border animate-in fade-in duration-1000">
          {imageLoading ? (
            <div
              className="w-full aspect-[3/4] rounded-2xl bg-gray-100 animate-pulse"
              aria-label="Loading resume preview"
            />
          ) : resumeUrl ? (
            <img
              src={resumeUrl}
              alt={`Resume preview for ${companyName || jobTitle || "this position"}`}
              className="w-full aspect-[3/4] object-cover object-top rounded-2xl"
            />
          ) : (
            <div className="w-full aspect-[3/4] rounded-2xl bg-gray-50 flex items-center justify-center">
              <p className="text-gray-400 text-sm">Preview unavailable</p>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};
export default ResumeCard;
