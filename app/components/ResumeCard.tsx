import { Link } from "react-router";
import { motion } from "framer-motion";
import ScoreCircle from "~/components/ScoreCircle";
import { useEffect, useState } from "react";
import { usePuterStore } from "~/lib/puter";
import { springs } from "~/lib/motion";

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
  const [isHovered, setIsHovered] = useState(false);

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

  const lifted = isHovered && !compareMode;

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        background:
          compareMode && isSelected ? "var(--cyan)" : "var(--surface)",
        border: "var(--bw) solid var(--ink)",
        borderRadius: "var(--r-card)",
        overflow: "hidden",
        cursor: compareMode ? "pointer" : "default",
        boxShadow:
          lifted || (compareMode && isSelected) ? "var(--pop)" : "none",
        transform:
          lifted || (compareMode && isSelected)
            ? "translate(-2px,-2px)"
            : "none",
        transition:
          "box-shadow var(--dur-fast) ease, transform var(--dur-fast) ease, background var(--dur-fast) ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
      {/* Compare checkbox */}
      {compareMode && (
        <motion.div
          animate={{
            background: isSelected ? "var(--lime)" : "var(--surface)",
          }}
          transition={springs.snappy}
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 10,
            width: 22,
            height: 22,
            border: "var(--bw) solid var(--ink)",
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            color: "var(--ink)",
            fontWeight: 900,
          }}
          aria-hidden="true"
        >
          {isSelected && "✓"}
        </motion.div>
      )}

      {/* Delete button — visible on hover */}
      {onDelete && !confirmDelete && !compareMode && (
        <button
          onClick={handleDeleteClick}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 10,
            background: "var(--surface)",
            border: "var(--bw) solid var(--ink)",
            color: "var(--ink)",
            width: 26,
            height: 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 900,
            borderRadius: 8,
            opacity: isHovered ? 1 : 0,
            transition:
              "opacity var(--dur-fast) ease, background var(--dur-fast) ease, color var(--dur-fast) ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--red)";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = "var(--red)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--surface)";
            e.currentTarget.style.color = "var(--ink)";
            e.currentTarget.style.borderColor = "var(--ink)";
          }}
          onFocus={(e) => (e.currentTarget.style.opacity = "1")}
          onBlur={(e) => (e.currentTarget.style.opacity = "0")}
          aria-label="Delete resume"
        >
          ✕
        </button>
      )}

      {/* Confirm delete dialog */}
      {confirmDelete && (
        <motion.div
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={springs.snappy}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            zIndex: 10,
            background: "var(--surface)",
            border: "var(--bw) solid var(--ink)",
            padding: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 170,
            borderRadius: 12,
            boxShadow: "var(--pop-sm)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 800,
              color: "var(--ink)",
            }}
          >
            Delete this resume?
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={handleConfirm}
              style={{
                flex: 1,
                fontSize: 12,
                fontWeight: 800,
                fontFamily: "var(--font-sans)",
                background: "var(--red)",
                color: "#fff",
                border: "var(--bw) solid var(--ink)",
                padding: "6px 8px",
                cursor: "pointer",
                borderRadius: 8,
              }}
            >
              Delete
            </button>
            <button
              onClick={handleCancel}
              style={{
                flex: 1,
                fontSize: 12,
                fontWeight: 800,
                fontFamily: "var(--font-sans)",
                background: "var(--surface)",
                color: "var(--ink)",
                border: "var(--bw) solid var(--ink)",
                padding: "6px 8px",
                cursor: "pointer",
                borderRadius: 8,
              }}
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <Link
        to={`/resume/${id}`}
        style={{
          textDecoration: "none",
          display: "flex",
          flexDirection: "column",
          gap: 0,
          pointerEvents: compareMode ? "none" : "auto",
        }}
        tabIndex={compareMode ? -1 : undefined}
      >
        {/* Resume preview image */}
        <div
          style={{
            background: "var(--fill-2)",
            borderBottom: "var(--bw) solid var(--ink)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {imageLoading ? (
            <div
              style={{
                width: "100%",
                aspectRatio: "3/4",
                background: "var(--fill-3)",
              }}
              aria-label="Loading resume preview"
            />
          ) : resumeUrl ? (
            <img
              src={resumeUrl}
              alt={`Resume preview for ${companyName || jobTitle || "this position"}`}
              style={{
                width: "100%",
                aspectRatio: "3/4",
                objectFit: "cover",
                objectPosition: "top",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                width: "100%",
                aspectRatio: "3/4",
                background: "var(--fill-1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "var(--fg-3)",
                  fontWeight: 600,
                }}
              >
                Preview unavailable
              </span>
            </div>
          )}
        </div>

        {/* Info bar */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 12,
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              flex: 1,
              minWidth: 0,
            }}
          >
            <span
              className="eyebrow"
              style={{
                fontSize: 10,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {companyName || "Resume"}
            </span>
            {jobTitle && (
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  fontWeight: 800,
                  color: "var(--ink)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {jobTitle}
              </p>
            )}
          </div>
          <ScoreCircle score={feedback.overallScore} />
        </div>
      </Link>
    </div>
  );
};

export default ResumeCard;
