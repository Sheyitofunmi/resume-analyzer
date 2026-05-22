import { Link } from "react-router";
import { motion, useReducedMotion } from "framer-motion";
import ScoreCircle from "~/components/ScoreCircle";
import { useEffect, useRef, useState } from "react";
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
  const reduced = useReducedMotion();

  // 3D tilt tracking
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !cardRef.current || compareMode) return;
    const rect = cardRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = ((e.clientX - cx) / (rect.width / 2)) * 4;
    const dy = ((e.clientY - cy) / (rect.height / 2)) * -4;
    setTilt({ x: dy, y: dx });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

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
    <motion.div
      ref={cardRef}
      className="rl-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{
        opacity: 1,
        y: isHovered && !compareMode ? -4 : 0,
        scale: compareMode && isSelected ? 1.02 : 1,
        rotateX: reduced ? 0 : tilt.x,
        rotateY: reduced ? 0 : tilt.y,
        boxShadow:
          isHovered && !compareMode
            ? "0 12px 40px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.35)"
            : "0 2px 8px rgba(0,0,0,0.3)",
      }}
      transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        cursor: compareMode ? "pointer" : "default",
        outline: compareMode && isSelected ? `2px solid var(--phos)` : "none",
        outlineOffset: 2,
        willChange: "transform",
        transformStyle: "preserve-3d",
        borderColor: isHovered && !compareMode ? "var(--border-hi)" : undefined,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
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
      {/* Corner crosshairs */}
      <span className="rl-corner tl" />
      <span className="rl-corner tr" />
      <span className="rl-corner bl" />
      <span className="rl-corner br" />

      {/* Compare checkbox */}
      {compareMode && (
        <motion.div
          animate={{
            background: isSelected ? "var(--phos)" : "var(--surface)",
            borderColor: isSelected ? "var(--phos)" : "var(--border-hi)",
          }}
          transition={springs.snappy}
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 10,
            width: 18,
            height: 18,
            border: "1px solid",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            color: "var(--bg)",
            fontWeight: 700,
          }}
          aria-hidden="true"
        >
          {isSelected && "✓"}
        </motion.div>
      )}

      {/* Delete button — visible on hover */}
      {onDelete && !confirmDelete && !compareMode && (
        <motion.button
          onClick={handleDeleteClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          whileHover={{
            color: "var(--ember)",
            borderColor: "var(--ember-dim)",
          }}
          transition={springs.snappy}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--fg-3)",
            width: 24,
            height: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            borderRadius: "var(--radius-sm)",
          }}
          onFocus={(e) => (e.currentTarget.style.opacity = "1")}
          onBlur={(e) => (e.currentTarget.style.opacity = "0")}
          aria-label="Delete resume"
        >
          ✕
        </motion.button>
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
            top: 8,
            right: 8,
            zIndex: 10,
            background: "var(--bg-3)",
            border: "1px solid var(--border-hi)",
            padding: "12px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minWidth: 160,
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontFamily: "var(--font-mono)",
              color: "var(--fg-1)",
            }}
          >
            delete this resume?
          </p>
          <div style={{ display: "flex", gap: 6 }}>
            <motion.button
              onClick={handleConfirm}
              whileTap={{ scale: 0.96 }}
              transition={springs.snappy}
              style={{
                flex: 1,
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                fontWeight: 700,
                background: "var(--ember)",
                color: "var(--bg)",
                border: "none",
                padding: "5px 8px",
                cursor: "pointer",
                borderRadius: "var(--radius-sm)",
              }}
            >
              ✕ delete
            </motion.button>
            <motion.button
              onClick={handleCancel}
              whileTap={{ scale: 0.96 }}
              transition={springs.snappy}
              style={{
                flex: 1,
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                background: "var(--surface-2)",
                color: "var(--fg-2)",
                border: "1px solid var(--border)",
                padding: "5px 8px",
                cursor: "pointer",
                borderRadius: "var(--radius-sm)",
              }}
            >
              cancel
            </motion.button>
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
        }}
      >
        {/* Resume preview image */}
        <div
          style={{
            background: "var(--bg-2)",
            borderBottom: "1px solid var(--border)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          {imageLoading ? (
            <div
              className="rl-shimmer"
              style={{ width: "100%", aspectRatio: "3/4" }}
              aria-label="Loading resume preview"
            />
          ) : resumeUrl ? (
            <>
              <motion.img
                src={resumeUrl}
                alt={`Resume preview for ${companyName || jobTitle || "this position"}`}
                initial={{ filter: "saturate(0.3) brightness(0.7)" }}
                animate={{
                  filter: isHovered
                    ? "saturate(0.7) brightness(0.95)"
                    : "saturate(0.4) brightness(0.8)",
                }}
                transition={{ duration: 0.4 }}
                style={{
                  width: "100%",
                  aspectRatio: "3/4",
                  objectFit: "cover",
                  objectPosition: "top",
                  display: "block",
                }}
              />
              {/* Hover scan line effect */}
              {isHovered && !reduced && (
                <motion.div
                  initial={{ y: "-100%", opacity: 0 }}
                  animate={{ y: "200%", opacity: [0, 0.5, 0] }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    height: 3,
                    background:
                      "linear-gradient(90deg, transparent, var(--phos), transparent)",
                    pointerEvents: "none",
                  }}
                />
              )}
            </>
          ) : (
            <div
              style={{
                width: "100%",
                aspectRatio: "3/4",
                background: "var(--surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "var(--fg-3)",
                  fontFamily: "var(--font-mono)",
                }}
              >
                // preview unavailable
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
            padding: "12px 16px",
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
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                color: "var(--fg-3)",
                letterSpacing: "0.12em",
              }}
            >
              // {companyName || "resume"}
            </span>
            {jobTitle && (
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: "var(--fg-2)",
                  fontFamily: "var(--font-mono)",
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
    </motion.div>
  );
};

export default ResumeCard;
