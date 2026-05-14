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
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const loadResume = async () => {
      const blob = await fs.read(imagePath);
      if (!blob) return;
      setResumeUrl(URL.createObjectURL(blob));
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
          className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-md hover:bg-red-50"
          aria-label="Delete resume"
        >
          <span className="text-red-500 text-sm font-bold leading-none">✕</span>
        </button>
      )}

      {confirmDelete && (
        <div className="absolute top-2 right-2 z-10 bg-white rounded-xl shadow-lg px-3 py-2 flex flex-col gap-2 min-w-[140px]">
          <p className="text-sm font-semibold text-gray-800">Delete resume?</p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              className="flex-1 text-xs font-semibold bg-red-500 hover:bg-red-600 text-white rounded-lg py-1"
            >
              Delete
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Link to={`/resume/${id}`} className="flex flex-col gap-8 h-full">
        <div className="resume-card-header">
          <div className="flex flex-col gap-2">
            {companyName && (
              <h2 className="!text-black font-bold break-words">
                {companyName}
              </h2>
            )}
            {jobTitle && (
              <h3 className="text-lg break-words text-gray-500">{jobTitle}</h3>
            )}
            {!companyName && !jobTitle && (
              <h2 className="!text-black font-bold">Resume</h2>
            )}
          </div>
          <div className="flex-shrink-0">
            <ScoreCircle score={feedback.overallScore} />
          </div>
        </div>
        {resumeUrl && (
          <div className="gradient-border animate-in fade-in duration-1000">
            <div className="w-full h-full">
              <img
                src={resumeUrl}
                alt="resume"
                className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"
              />
            </div>
          </div>
        )}
      </Link>
    </div>
  );
};
export default ResumeCard;
