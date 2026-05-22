import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { extractPdfText } from "~/lib/pdf2img";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  ListsToggle,
  Separator,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

export const meta = () => [
  { title: "ResumeLens | Edit Resume" },
  { name: "description", content: "Edit your resume with AI feedback" },
];

// ─── Section headers for PDF text parsing ───────────────────────────────────

const SECTION_HEADERS = [
  "SUMMARY",
  "PROFESSIONAL SUMMARY",
  "CAREER OBJECTIVE",
  "OBJECTIVE",
  "PROFILE",
  "WORK EXPERIENCE",
  "PROFESSIONAL EXPERIENCE",
  "EXPERIENCE",
  "EMPLOYMENT HISTORY",
  "EDUCATION",
  "ACADEMIC BACKGROUND",
  "TECHNICAL SKILLS",
  "KEY SKILLS",
  "CORE COMPETENCIES",
  "SKILLS",
  "PROJECTS",
  "KEY PROJECTS",
  "PERSONAL PROJECTS",
  "CERTIFICATIONS",
  "CERTIFICATES",
  "ACHIEVEMENTS",
  "ACCOMPLISHMENTS",
  "AWARDS",
  "VOLUNTEER",
  "VOLUNTEER EXPERIENCE",
  "LANGUAGES",
  "INTERESTS",
  "HOBBIES",
  "REFERENCES",
];

function textToMarkdown(raw: string): string {
  let text = raw.replace(/[ \t]+/g, " ").trim();
  for (const h of SECTION_HEADERS) {
    const re = new RegExp(`(?<=[^\\n])\\b(${h})\\b`, "g");
    text = text.replace(re, "\n\n$1\n");
  }
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  let md = "";
  let firstLine = true;
  for (const line of lines) {
    const isHeader =
      line === line.toUpperCase() &&
      /[A-Z]{2}/.test(line) &&
      line.length > 2 &&
      line.length < 65;
    const isBullet = /^[•·–\-\*▪]/.test(line);
    if (firstLine) {
      md += `# ${line}\n\n`;
      firstLine = false;
    } else if (isHeader) {
      md += `\n## ${line}\n\n`;
    } else if (isBullet) {
      md += `- ${line.replace(/^[•·–\-\*▪]\s*/, "")}\n`;
    } else {
      md += `\n${line}\n`;
    }
  }
  return md.trim();
}

function markdownToHtml(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  let inList = false;
  const fmt = (s: string) =>
    s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  for (const line of lines) {
    const t = line.trim();
    if (!t) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      continue;
    }
    if (/^# /.test(t)) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h1>${fmt(t.slice(2))}</h1>`);
    } else if (/^## /.test(t)) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h2>${fmt(t.slice(3))}</h2>`);
    } else if (/^### /.test(t)) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h3>${fmt(t.slice(4))}</h3>`);
    } else if (/^[-*] /.test(t)) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${fmt(t.slice(2))}</li>`);
    } else {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<p>${fmt(t)}</p>`);
    }
  }
  if (inList) out.push("</ul>");
  return out.join("");
}

// ─── Component ───────────────────────────────────────────────────────────────

const ResumeEdit = () => {
  const { auth, isLoading, fs, kv } = usePuterStore();
  const { id } = useParams();
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [extracting, setExtracting] = useState(true);
  const [extractError, setExtractError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [savedMs, setSavedMs] = useState<number | null>(null);
  const [tipsOpen, setTipsOpen] = useState(true);
  const [editorMarkdown, setEditorMarkdown] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [dlOpen, setDlOpen] = useState(false);

  const mdxRef = useRef<MDXEditorMethods>(null);
  const dlRef = useRef<HTMLDivElement>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Auth guard ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate(`/auth?next=/resume/${id}/edit`);
    }
  }, [isLoading, auth.isAuthenticated]);

  // ── Load content ────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoading || !auth.isAuthenticated) return;
    let cancelled = false;

    const load = async () => {
      setExtracting(true);
      setExtractError("");

      const raw = await kv.get(`resume:${id}`);
      if (!raw || cancelled) return;
      const data = JSON.parse(raw);
      if (!cancelled) {
        setFeedback(data.feedback ?? null);
        setCompanyName(data.companyName ?? "");
        setJobTitle(data.jobTitle ?? "");
      }

      const savedMd = await kv.get(`resume-edit-md:${id}`);
      if (savedMd && !cancelled) {
        setEditorMarkdown(savedMd);
        setExtracting(false);
        return;
      }

      const pdfBlob = await fs.read(data.resumePath);
      if (!pdfBlob || cancelled) {
        setExtractError("Could not load the resume PDF.");
        setExtracting(false);
        return;
      }

      try {
        const plainText = await extractPdfText(pdfBlob);
        const md = textToMarkdown(plainText);
        if (!cancelled) setEditorMarkdown(md);
      } catch {
        if (!cancelled) setExtractError("Could not extract text from the PDF.");
      } finally {
        if (!cancelled) setExtracting(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [id, auth.isAuthenticated, isLoading]);

  // ── Push content into editor after it mounts ────────────────────────────
  useEffect(() => {
    if (!extracting && editorMarkdown !== null && mdxRef.current) {
      mdxRef.current.setMarkdown(editorMarkdown);
      const words = editorMarkdown.trim()
        ? editorMarkdown.trim().split(/\s+/).filter(Boolean).length
        : 0;
      setWordCount(words);
    }
  }, [extracting, editorMarkdown]);

  // ── Close dropdown on outside click ─────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dlRef.current && !dlRef.current.contains(e.target as Node))
        setDlOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────
  const handleChange = (md: string) => {
    setIsDirty(true);
    const words = md.trim() ? md.trim().split(/\s+/).filter(Boolean).length : 0;
    setWordCount(words);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      setSaving(true);
      await kv.set(`resume-edit-md:${id}`, md);
      setSaving(false);
      setIsDirty(false);
      setSavedMs(Date.now());
    }, 2500);
  };

  const handleSave = async () => {
    const md = mdxRef.current?.getMarkdown() ?? editorMarkdown ?? "";
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaving(true);
    await kv.set(`resume-edit-md:${id}`, md);
    setSaving(false);
    setIsDirty(false);
    setSavedMs(Date.now());
  };

  const handleDownloadPdf = () => {
    setDlOpen(false);
    window.print();
  };

  const handleDownloadDoc = () => {
    setDlOpen(false);
    const md = mdxRef.current?.getMarkdown() ?? editorMarkdown ?? "";
    const html = markdownToHtml(md);
    const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Resume</title>
<style>
  body{font-family:Calibri,sans-serif;font-size:11pt;margin:1in}
  h1{font-size:18pt;margin-bottom:4pt}
  h2{font-size:11pt;font-weight:bold;text-transform:uppercase;letter-spacing:1pt;
     border-bottom:1pt solid #333;margin:12pt 0 4pt;padding-bottom:2pt}
  p{margin:3pt 0;font-size:10.5pt}ul{margin:3pt 0 6pt 14pt}
  li{margin-bottom:2pt;font-size:10.5pt}a{color:#1155cc}
</style></head><body>${html}</body></html>`;
    const blob = new Blob(["﻿", docHtml], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(companyName || "resume").replace(/\s+/g, "-").toLowerCase()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Derived ──────────────────────────────────────────────────────────────
  const tips = feedback
    ? [
        ...(feedback.ATS?.tips ?? []),
        ...(feedback.content?.tips ?? []),
        ...(feedback.toneAndStyle?.tips ?? []),
        ...(feedback.structure?.tips ?? []),
      ].filter((t) => t.type === "improve")
    : [];

  const isEditorReady = !extracting && !extractError;

  const savedLabel = (() => {
    if (saving) return "saving…";
    if (isDirty) return null;
    if (savedMs) {
      const sec = Math.round((Date.now() - savedMs) / 1000);
      if (sec < 5) return "✓ saved";
      if (sec < 60) return `✓ saved ${sec}s ago`;
      return `✓ saved ${Math.round(sec / 60)}m ago`;
    }
    return null;
  })();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#e8e6e0",
      }}
    >
      {/* ── Top nav ─────────────────────────────────────────────────────── */}
      <nav
        className="resume-editor-chrome"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          borderBottom: "1px solid var(--border)",
          background: "rgba(11,11,10,0.96)",
          backdropFilter: "blur(8px)",
          position: "sticky",
          top: 0,
          zIndex: 50,
          gap: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
          }}
        >
          <Link
            to={`/resume/${id}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--fg-2)",
              textDecoration: "none",
              flexShrink: 0,
              transition: "color var(--dur-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--fg-1)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--fg-2)")}
          >
            ← back_to_review
          </Link>
          {(companyName || jobTitle) && (
            <span
              className="rl-mobile-hide"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                color: "var(--fg-3)",
              }}
            >
              // {[companyName, jobTitle].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {(isDirty || saving || savedLabel) && (
            <span
              role="status"
              aria-live="polite"
              className="rl-mobile-hide"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color:
                  isDirty && !saving
                    ? "var(--copper-hi)"
                    : saving
                      ? "var(--fg-2)"
                      : "var(--phos)",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {isDirty && !saving && (
                <span className="rl-dot" style={{ width: 6, height: 6 }} />
              )}
              {isDirty && !saving
                ? "// unsaved"
                : saving
                  ? "// saving…"
                  : `// ${savedLabel}`}
            </span>
          )}

          <button
            onClick={() => setTipsOpen((v) => !v)}
            className="rl-btn rl-btn-ghost"
            style={{ fontSize: 11, padding: "4px 10px" }}
          >
            {tipsOpen ? "hide_tips" : "show_tips"}
          </button>

          <button
            onClick={handleSave}
            disabled={saving || extracting || !isDirty}
            className="rl-btn rl-btn-secondary"
            style={{ fontSize: 11, padding: "6px 12px" }}
          >
            {saving ? "saving…" : "save"}
          </button>

          {/* Download dropdown */}
          <div style={{ position: "relative" }} ref={dlRef}>
            <button
              onClick={() => setDlOpen((v) => !v)}
              disabled={!isEditorReady}
              className="rl-btn rl-btn-primary"
              style={{
                fontSize: 11,
                padding: "6px 12px",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <span aria-hidden="true">↓</span>
              <span>download</span>
            </button>
            {dlOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  marginTop: 6,
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  zIndex: 20,
                  padding: "6px 0",
                  width: 150,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}
              >
                <button
                  onClick={handleDownloadPdf}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 14px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--fg-2)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-2)";
                    e.currentTarget.style.color = "var(--fg-1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.color = "var(--fg-2)";
                  }}
                >
                  ↓{" "}
                  <span>
                    PDF{" "}
                    <span style={{ color: "var(--fg-4)", fontSize: 10 }}>
                      (print)
                    </span>
                  </span>
                </button>
                <button
                  onClick={handleDownloadDoc}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 14px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--fg-2)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-2)";
                    e.currentTarget.style.color = "var(--fg-1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.color = "var(--fg-2)";
                  }}
                >
                  ↓{" "}
                  <span>
                    Word{" "}
                    <span style={{ color: "var(--fg-4)", fontSize: 10 }}>
                      (.doc)
                    </span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* AI Tips sidebar */}
        {tipsOpen && (
          <aside
            className="resume-editor-chrome rl-mobile-hide"
            style={{
              width: 256,
              flexShrink: 0,
              background: "#f5f3ee",
              borderRight: "1px solid #d4cfc6",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              position: "sticky",
              top: 44,
              height: "calc(100vh - 44px)",
              alignSelf: "flex-start",
            }}
          >
            <div
              style={{
                padding: "14px 16px 10px",
                borderBottom: "1px solid #d4cfc6",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "#6b6354",
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  margin: 0,
                }}
              >
                AI Suggestions
              </p>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 12,
                  color: "#9a9080",
                  margin: "2px 0 0",
                }}
              >
                Apply these to your resume
              </p>
            </div>
            <div
              style={{
                padding: 10,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                overflowY: "auto",
              }}
            >
              {tips.length === 0 ? (
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "#9a9080",
                    padding: "8px 4px",
                  }}
                >
                  No improvement tips found.
                </p>
              ) : (
                tips.map((tip, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#fffbf5",
                      border: "1px solid #e8c99a",
                      borderRadius: 8,
                      padding: "10px 12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "sans-serif",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#92400e",
                        lineHeight: 1.4,
                      }}
                    >
                      {tip.tip}
                    </span>
                    {tip.explanation && (
                      <span
                        style={{
                          fontFamily: "sans-serif",
                          fontSize: 11,
                          color: "#78350f",
                          lineHeight: 1.5,
                        }}
                      >
                        {tip.explanation}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Editor viewport */}
        <div
          className="resume-paper-wrap"
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#e8e6e0",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "32px 16px",
          }}
        >
          {extracting ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                marginTop: 96,
              }}
            >
              <span className="rl-dot" style={{ width: 12, height: 12 }} />
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--fg-3)",
                }}
              >
                // extracting resume text…
              </p>
            </div>
          ) : extractError ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
                marginTop: 96,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--ember)",
                }}
              >
                ✕ {extractError}
              </p>
              <Link
                to={`/resume/${id}`}
                className="rl-btn rl-btn-primary"
                style={{ fontSize: 12 }}
              >
                ← back_to_review
              </Link>
            </div>
          ) : (
            <>
              {/* A4 paper */}
              <div
                className="resume-paper"
                style={{
                  width: "100%",
                  maxWidth: 794,
                  background: "white",
                  boxShadow: "0 4px 32px rgba(0,0,0,0.5)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <MDXEditor
                  ref={mdxRef}
                  markdown=""
                  onChange={handleChange}
                  className="resume-mdx-editor"
                  plugins={[
                    toolbarPlugin({
                      toolbarContents: () => (
                        <>
                          <UndoRedo />
                          <Separator />
                          <BoldItalicUnderlineToggles />
                          <Separator />
                          <BlockTypeSelect />
                          <Separator />
                          <CreateLink />
                          <Separator />
                          <ListsToggle />
                        </>
                      ),
                    }),
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    thematicBreakPlugin(),
                    markdownShortcutPlugin(),
                    linkPlugin(),
                    linkDialogPlugin(),
                  ]}
                />
              </div>

              {/* Footer */}
              <div
                className="resume-editor-chrome"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  maxWidth: 794,
                  marginTop: 10,
                  padding: "0 4px",
                  fontFamily: "sans-serif",
                  fontSize: 11,
                  color: "#9a9080",
                }}
              >
                <span>
                  {wordCount} {wordCount === 1 ? "word" : "words"}
                </span>
                <span>
                  ResumeLens · edits auto-save ·{" "}
                  <button
                    onClick={handleSave}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#6b6354",
                      fontFamily: "sans-serif",
                      fontSize: 11,
                      textDecoration: "underline",
                      padding: 0,
                    }}
                  >
                    Save now
                  </button>
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeEdit;
