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
      className="rl-card rl-fade-in"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        cursor: compareMode ? "pointer" : "default",
        outline: compareMode && isSelected ? `2px solid var(--phos)` : "none",
        outlineOffset: 2,
        transition: "border-color var(--dur-base), box-shadow var(--dur-base)",
      }}
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
      onMouseEnter={(e) => {
        if (!compareMode)
          (e.currentTarget as HTMLDivElement).style.borderColor =
            "var(--border-hi)";
      }}
      onMouseLeave={(e) => {
        if (!compareMode)
          (e.currentTarget as HTMLDivElement).style.borderColor =
            "var(--border)";
      }}
    >
      {/* Corner crosshairs */}
      <span className="rl-corner tl" />
      <span className="rl-corner tr" />
      <span className="rl-corner bl" />
      <span className="rl-corner br" />

      {/* Compare indicator */}
      {compareMode && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            zIndex: 10,
            width: 18,
            height: 18,
            border: `1px solid ${isSelected ? "var(--phos)" : "var(--border-hi)"}`,
            background: isSelected ? "var(--phos)" : "var(--surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            color: "var(--bg)",
            fontWeight: 700,
            transition: "all var(--dur-fast)",
          }}
          aria-hidden="true"
        >
          {isSelected && "✓"}
        </div>
      )}

      {/* Delete controls */}
      {onDelete && !confirmDelete && !compareMode && (
        <button
          onClick={handleDeleteClick}
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
            opacity: 0,
            transition: "opacity var(--dur-fast), color var(--dur-fast)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--ember)";
            e.currentTarget.style.borderColor = "var(--ember-dim)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--fg-3)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
          className="group-hover:opacity-100"
          aria-label="Delete resume"
          onFocus={(e) => (e.currentTarget.style.opacity = "1")}
          onBlur={(e) => (e.currentTarget.style.opacity = "0")}
        >
          ✕
        </button>
      )}

      {confirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
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
            <button
              onClick={handleConfirm}
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
            </button>
            <button
              onClick={handleCancel}
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
            </button>
          </div>
        </div>
      )}

      <Link
        to={`/resume/${id}`}
        style={{
          textDecoration: "none",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
        onMouseEnter={(e) => {
          const card = e.currentTarget.closest(".rl-card") as HTMLElement;
          if (card) {
            const del = card.querySelector<HTMLElement>(
              'button[aria-label="Delete resume"]',
            );
            if (del) del.style.opacity = "1";
          }
        }}
        onMouseLeave={(e) => {
          const card = e.currentTarget.closest(".rl-card") as HTMLElement;
          if (card) {
            const del = card.querySelector<HTMLElement>(
              'button[aria-label="Delete resume"]',
            );
            if (del) del.style.opacity = "0";
          }
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 12,
            justifyContent: "space-between",
            alignItems: "flex-start",
            minHeight: 80,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
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

        {/* Resume preview image */}
        <div
          style={{
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            overflow: "hidden",
          }}
        >
          {imageLoading ? (
            <div
              style={{
                width: "100%",
                aspectRatio: "3/4",
                background: "var(--surface-2)",
                animation: "rl-pulse 1.5s ease-in-out infinite",
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
                filter: "saturate(0.5) brightness(0.85)",
              }}
            />
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
      </Link>
    </div>
  );
};

export default ResumeCard;
