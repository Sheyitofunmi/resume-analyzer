import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "../lib/utils";

interface FileUploaderProps {
  onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

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
      accept: { "application/pdf": [".pdf"] },
      maxSize: maxFileSize,
      onDragEnter: () => setIsDragOver(true),
      onDragLeave: () => setIsDragOver(false),
    });

  const file = acceptedFiles[0] || null;

  return (
    <div
      {...getRootProps()}
      style={{
        position: "relative",
        padding: "var(--space-8)",
        textAlign: "center",
        cursor: "pointer",
        background: isDragActive ? "rgba(168,230,163,0.05)" : "var(--surface)",
        border: `1px dashed ${isDragActive ? "var(--phos)" : "var(--border-hi)"}`,
        borderRadius: "var(--radius-md)",
        minHeight: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all var(--dur-base)",
        boxShadow: isDragActive ? "0 0 24px rgba(168,230,163,0.15)" : "none",
      }}
    >
      <input {...getInputProps()} />

      {file ? (
        <div
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
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span style={{ color: "var(--phos)", fontSize: 20, flexShrink: 0 }}>
            ✓
          </span>
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
              }}
            >
              {formatSize(file.size)} · pdf
            </p>
          </div>
          <button
            style={{
              background: "none",
              border: "1px solid var(--border)",
              color: "var(--fg-3)",
              cursor: "pointer",
              padding: "4px 8px",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              borderRadius: "var(--radius-sm)",
              transition: "all var(--dur-fast)",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--ember)";
              e.currentTarget.style.borderColor = "var(--ember-dim)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--fg-3)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
            onClick={() => onFileSelect?.(null)}
          >
            ✕ remove
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 32,
              color: isDragActive ? "var(--phos)" : "var(--fg-4)",
              lineHeight: 1,
              transition: "color var(--dur-base)",
            }}
          >
            ↓
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <p
              style={{
                margin: 0,
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "var(--fg-2)",
              }}
            >
              {isDragActive ? (
                <span style={{ color: "var(--phos)" }}>drop_resume_here</span>
              ) : (
                <>
                  <span style={{ color: "var(--fg-1)" }}>click_to_upload</span>{" "}
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
              // pdf · max {formatSize(maxFileSize)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
