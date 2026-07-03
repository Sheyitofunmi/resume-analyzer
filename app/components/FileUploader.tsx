import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { formatSize } from "../lib/utils";
import { springs } from "~/lib/motion";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

function DocSprite() {
  return (
    <svg
      width="120"
      height="90"
      viewBox="0 0 120 90"
      aria-hidden="true"
      className="pix-float"
      style={{ marginBottom: 16 }}
    >
      <rect
        x="34"
        y="6"
        width="52"
        height="68"
        rx="5"
        fill="#fff"
        stroke="var(--ink)"
        strokeWidth="2.5"
      />
      <rect x="42" y="18" width="26" height="5" rx="2.5" fill="var(--ink)" />
      <rect x="42" y="30" width="36" height="4" rx="2" fill="#D8DDD8" />
      <rect x="42" y="39" width="32" height="4" rx="2" fill="#D8DDD8" />
      <rect x="42" y="48" width="36" height="4" rx="2" fill="#D8DDD8" />
      <rect
        x="0"
        y="58"
        width="13"
        height="13"
        fill="var(--lime)"
        className="pix-blink"
      />
      <rect x="15" y="43" width="13" height="13" fill="var(--lime)" />
      <rect
        x="104"
        y="43"
        width="13"
        height="13"
        fill="var(--violet)"
        className="pix-blink"
        style={{ animationDelay: "0.5s" }}
      />
      <rect x="92" y="58" width="13" height="13" fill="var(--cyan)" />
      <path
        d="M60 88 L60 76 M54 82 L60 76 L66 82"
        stroke="var(--ink)"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const reduced = useReducedMotion();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFileSelect?.(acceptedFiles[0] || null);
      setIsDragOver(false);
    },
    [onFileSelect],
  );

  const maxFileSize = 20 * 1024 * 1024;

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      onDrop,
      multiple: false,
      accept: {
        "application/pdf": [".pdf"],
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          [".docx"],
      },
      maxSize: maxFileSize,
      onDragEnter: () => setIsDragOver(true),
      onDragLeave: () => setIsDragOver(false),
    });

  const file = acceptedFiles[0] || null;
  const active = isDragActive || isDragOver;

  return (
    <div
      {...(getRootProps() as object)}
      style={{
        position: "relative",
        padding: file ? 20 : "48px 32px",
        textAlign: "center",
        cursor: "pointer",
        border: "2.5px dashed var(--ink)",
        borderRadius: 18,
        background: active ? "#F2FBFD" : "var(--surface)",
        boxShadow: active ? "6px 6px 0 var(--cyan)" : "none",
        transform: active ? "translate(-2px,-2px)" : "none",
        minHeight: file ? undefined : 220,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        transition:
          "background var(--dur-fast) ease, box-shadow var(--dur-fast) ease, transform var(--dur-fast) ease",
      }}
    >
      <input {...getInputProps()} />

      <AnimatePresence mode="wait">
        {file ? (
          <motion.div
            key="file"
            initial={reduced ? {} : { opacity: 0, scale: 0.95, y: 8 }}
            animate={reduced ? {} : { opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? {} : { opacity: 0, scale: 0.95, y: -8 }}
            transition={springs.smooth}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "var(--surface)",
              border: "var(--bw) solid var(--ink)",
              borderRadius: 12,
              padding: "12px 16px",
              width: "100%",
              gap: 12,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span
              aria-hidden="true"
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: "var(--lime)",
                border: "var(--bw) solid var(--ink)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              ✓
            </span>
            <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
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
                {file.name}
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-mono)",
                  fontSize: 10.5,
                  color: "var(--fg-2)",
                  marginTop: 2,
                  letterSpacing: "0.06em",
                }}
              >
                {formatSize(file.size).toUpperCase()} ·{" "}
                {file.name.endsWith(".docx") ? "DOCX" : "PDF"}
              </p>
            </div>
            <button
              type="button"
              style={{
                background: "var(--surface)",
                border: "var(--bw) solid var(--ink)",
                color: "var(--ink)",
                cursor: "pointer",
                padding: "6px 12px",
                fontFamily: "var(--font-sans)",
                fontWeight: 800,
                fontSize: 12,
                borderRadius: 8,
                flexShrink: 0,
                transition:
                  "background var(--dur-fast) ease, color var(--dur-fast) ease",
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
              onClick={() => onFileSelect?.(null)}
            >
              ✕ Remove
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={reduced ? {} : { opacity: 0 }}
            animate={reduced ? {} : { opacity: 1 }}
            exit={reduced ? {} : { opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <DocSprite />
            <div
              style={{
                fontWeight: 900,
                fontSize: 20,
                letterSpacing: "-0.01em",
                marginBottom: 6,
              }}
            >
              {active ? "Drop it right here" : "Drop your resume here"}
            </div>
            <div
              style={{
                fontSize: 13.5,
                color: "var(--fg-2)",
                fontWeight: 600,
                marginBottom: 18,
              }}
            >
              PDF or DOCX, up to {formatSize(maxFileSize)} — or click to browse
            </div>
            <span
              style={{
                display: "inline-block",
                background: "var(--ink)",
                color: "#fff",
                padding: "12px 26px",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: 13.5,
              }}
            >
              Choose file
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FileUploader;
