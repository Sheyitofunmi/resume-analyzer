import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { formatSize } from "../lib/utils";
import { springs } from "~/lib/motion";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
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
    <motion.div
      {...(getRootProps() as object)}
      animate={
        reduced
          ? {}
          : {
              borderColor: active ? "var(--phos)" : "var(--border-hi)",
              background: active ? "rgba(168,230,163,0.06)" : "var(--surface)",
              scale: active ? 1.015 : 1,
              boxShadow: active
                ? "0 0 0 1px var(--phos-dim), 0 0 32px rgba(168,230,163,0.15)"
                : "none",
            }
      }
      whileHover={
        reduced || file
          ? {}
          : { borderColor: "var(--border-acc)", scale: 1.005 }
      }
      transition={springs.smooth}
      style={{
        position: "relative",
        padding: "var(--space-8)",
        textAlign: "center",
        cursor: "pointer",
        border: "1px dashed var(--border-hi)",
        borderRadius: "var(--radius-md)",
        minHeight: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <input {...getInputProps()} />

      {/* Animated corner crosshairs that glow when active */}
      {(["tl", "tr", "bl", "br"] as const).map((pos) => (
        <motion.span
          key={pos}
          className={`rl-corner ${pos}`}
          animate={
            reduced
              ? {}
              : { borderColor: active ? "var(--phos)" : "var(--copper)" }
          }
          transition={{ duration: 0.2 }}
        />
      ))}

      {/* Scanning line on drag-over */}
      {active && !reduced && (
        <motion.div
          initial={{ y: "-100%", opacity: 0 }}
          animate={{ y: "150%", opacity: [0, 0.7, 0.7, 0] }}
          transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity }}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, transparent 0%, var(--phos-dim) 20%, var(--phos) 50%, var(--phos-dim) 80%, transparent 100%)",
            boxShadow: "0 0 12px var(--phos-glow)",
            pointerEvents: "none",
          }}
        />
      )}

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
              background: "var(--bg-3)",
              border: "1px solid var(--phos-dim)",
              borderRadius: "var(--radius-md)",
              padding: "12px 16px",
              width: "100%",
              gap: 12,
              boxShadow: "0 0 16px rgba(168,230,163,0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.span
              initial={reduced ? {} : { scale: 0, rotate: -90 }}
              animate={reduced ? {} : { scale: 1, rotate: 0 }}
              transition={{ ...springs.elastic, delay: 0.1 }}
              style={{
                color: "var(--phos)",
                fontSize: 20,
                flexShrink: 0,
                display: "inline-block",
              }}
            >
              ✓
            </motion.span>
            <div style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--fg-1)",
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
                  fontSize: 11,
                  color: "var(--fg-3)",
                  marginTop: 2,
                }}
              >
                {formatSize(file.size)} ·{" "}
                {file.name.endsWith(".docx") ? "docx" : "pdf"}
              </p>
            </div>
            <motion.button
              whileHover={
                reduced
                  ? {}
                  : { color: "var(--ember)", borderColor: "var(--ember-dim)" }
              }
              whileTap={reduced ? {} : { scale: 0.95 }}
              transition={springs.snappy}
              style={{
                background: "none",
                border: "1px solid var(--border)",
                color: "var(--fg-3)",
                cursor: "pointer",
                padding: "4px 8px",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                borderRadius: "var(--radius-sm)",
                flexShrink: 0,
              }}
              onClick={() => onFileSelect?.(null)}
            >
              ✕ remove
            </motion.button>
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
              gap: 12,
            }}
          >
            <motion.span
              animate={
                reduced
                  ? {}
                  : {
                      color: active ? "var(--phos)" : "var(--fg-4)",
                      y: active ? [0, -6, 0] : 0,
                    }
              }
              transition={
                active
                  ? { duration: 0.6, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.2 }
              }
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 32,
                lineHeight: 1,
                display: "inline-block",
              }}
            >
              ↓
            </motion.span>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--fg-2)",
                }}
              >
                {active ? (
                  <motion.span
                    initial={reduced ? {} : { opacity: 0, scale: 0.9 }}
                    animate={reduced ? {} : { opacity: 1, scale: 1 }}
                    style={{ color: "var(--phos)" }}
                  >
                    drop_resume_here
                  </motion.span>
                ) : (
                  <>
                    <span style={{ color: "var(--fg-1)" }}>
                      click_to_upload
                    </span>{" "}
                    or drag and drop
                  </>
                )}
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "var(--fg-3)",
                }}
              >
                // pdf · docx · max {formatSize(maxFileSize)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FileUploader;
