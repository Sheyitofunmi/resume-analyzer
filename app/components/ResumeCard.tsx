import { Link } from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";

const ResumeCard = ({
  resume: { id, companyName, jobTitle, feedback, imagePath },
  onDelete,
  compareMode = false,
  isSelected = false,
  onSelect,
}: {
  resume: Resume;
  onDelete?: () => void;
  compareMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
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
    <div
      className={`resume-card animate-in fade-in duration-500 group relative transition-all ${
        compareMode
          ? isSelected
            ? "ring-2 ring-[#e11d48] cursor-pointer"
            : "cursor-pointer opacity-70 hover:opacity-100 hover:ring-2 hover:ring-[#e5e5e5]"
          : ""
      }`}
      onClick={compareMode ? onSelect : undefined}
      role={compareMode ? "checkbox" : undefined}
      aria-checked={compareMode ? isSelected : undefined}
      tabIndex={compareMode ? 0 : undefined}
      onKeyDown={
        compareMode
          ? (e) => {
              if (e.key === " " || e.key === "Enter") onSelect?.();
            }
          : undefined
      }
    >
      {/* Compare selection indicator */}
      {compareMode && (
        <div
          className={`absolute top-2 left-2 z-10 w-5 h-5 border flex items-center justify-center transition-colors ${
            isSelected
              ? "bg-[#e11d48] border-[#e11d48]"
              : "bg-white border-[#e5e5e5]"
          }`}
          aria-hidden="true"
        >
          {isSelected && (
            <span className="text-white text-xs font-bold leading-none">✓</span>
          )}
        </div>
      )}

      {onDelete && !confirmDelete && !compareMode && (
        <button
          onClick={handleDeleteClick}
          className="absolute top-2 right-2 z-10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-white w-7 h-7 flex items-center justify-center border border-[#e5e5e5] hover:border-red-300 hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
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
          className="absolute top-2 right-2 z-10 bg-white px-3 py-2 flex flex-col gap-2 min-w-[140px] border border-[#e5e5e5]"
        >
          <p
            id={`confirm-delete-${id}`}
            className="text-sm font-semibold text-[#0a0a0a]"
          >
            Delete resume?
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="flex-1 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Delete
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 text-xs font-semibold bg-[#f8f7f4] hover:bg-[#e5e5e5] text-[#0a0a0a] py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
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
              <h2 className="!text-base sm:!text-lg !text-[#0a0a0a] font-bold break-words leading-snug">
                {companyName}
              </h2>
            )}
            {jobTitle && (
              <p className="text-sm break-words text-[#525252]">{jobTitle}</p>
            )}
            {!companyName && !jobTitle && (
              <h2 className="!text-base !text-[#0a0a0a] font-bold">Resume</h2>
            )}
          </div>
          <div className="flex-shrink-0">
            <ScoreCircle score={feedback.overallScore} />
          </div>
        </div>

        <div className="resume-image-card animate-in fade-in duration-500">
          {imageLoading ? (
            <div
              className="w-full aspect-[3/4] bg-[#e5e5e5] animate-pulse"
              aria-label="Loading resume preview"
            />
          ) : resumeUrl ? (
            <img
              src={resumeUrl}
              alt={`Resume preview for ${companyName || jobTitle || "this position"}`}
              className="w-full aspect-[3/4] object-cover object-top"
            />
          ) : (
            <div className="w-full aspect-[3/4] bg-[#f8f7f4] flex items-center justify-center border border-[#e5e5e5]">
              <p className="text-[#525252] text-sm">Preview unavailable</p>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ResumeCard;
