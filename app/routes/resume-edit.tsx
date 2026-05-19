import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { extractPdfText } from "~/lib/pdf2img";

export const meta = () => [
  { title: "ResumeLens | Edit Resume" },
  { name: "description", content: "Edit your resume with AI feedback" },
];

// ─── Text → resume HTML ──────────────────────────────────────────────────────

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

function textToResumeHtml(raw: string): string {
  let text = raw.replace(/[ \t]+/g, " ").trim();
  for (const h of SECTION_HEADERS) {
    const re = new RegExp(`(?<=[^\\n])\\b(${h})\\b`, "g");
    text = text.replace(re, "\n\n$1\n");
  }
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  let html = "";
  let inList = false;
  let firstLine = true;
  for (const line of lines) {
    const isHeader =
      line === line.toUpperCase() &&
      /[A-Z]{2}/.test(line) &&
      line.length > 2 &&
      line.length < 65;
    const isBullet = /^[•·–\-\*▪]/.test(line);
    if (firstLine) {
      html += `<h1>${line}</h1>`;
      firstLine = false;
    } else if (isHeader) {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<h2>${line}</h2>`;
    } else if (isBullet) {
      if (!inList) {
        html += "<ul>";
        inList = true;
      }
      html += `<li>${line.replace(/^[•·–\-\*▪]\s*/, "")}</li>`;
    } else {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
      html += `<p>${line}</p>`;
    }
  }
  if (inList) html += "</ul>";
  return html;
}

// ─── Icon set (stroke + fill variants) ───────────────────────────────────────

const IC = {
  Undo: () => (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M4 7h8a5 5 0 0 1 0 10H4" />
      <path d="M7 4L4 7l3 3" />
    </svg>
  ),
  Redo: () => (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
    >
      <path d="M16 7H8a5 5 0 0 0 0 10h8" />
      <path d="M13 4l3 3-3 3" />
    </svg>
  ),
  Bold: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M3 2h5.5a3.5 3.5 0 0 1 2.2 6.2A3.5 3.5 0 0 1 8.5 14H3V2zm2 5h3.5a1.5 1.5 0 0 0 0-3H5v3zm0 5h3.5a1.5 1.5 0 0 0 0-3H5v3z" />
    </svg>
  ),
  Italic: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M7 2h6v2H7V2zM3 12h6v2H3v-2zm3-8h2L6 12H4l2-8z" />
    </svg>
  ),
  Underline: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M3 14h10v1.5H3V14zM8 11.5A4 4 0 0 1 4 7.5V2h2v5.5a2 2 0 0 0 4 0V2h2v5.5a4 4 0 0 1-4 4z" />
    </svg>
  ),
  Strike: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M1 7.5h14V9H1V7.5zm3.5-5.5h7v2h-7V2zm1.5 11h4v1.5H6V13z" />
    </svg>
  ),
  TextColor: ({ color }: { color: string }) => (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M6 2l-4 10h2l1-2.5h5L11 12h2L9 2H6zm-.2 6L8 3.5 10.2 8H5.8z" />
      <rect x="2" y="13" width="12" height="2.5" rx="1" fill={color} />
    </svg>
  ),
  ClearFmt: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M5.5 2L2 10h1.8l.9-2.2h4.6l.9 2.2H12L8.5 2H5.5zm-.8 4.5L6.9 3.3l2.2 3.2H4.7zM11 10l3 3-3 3v-2H8v-2h3v-2z" />
    </svg>
  ),
  Link: () => (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3.5 h-3.5"
    >
      <path d="M6.5 9.5a3.535 3.535 0 0 0 5 0l2-2a3.535 3.535 0 0 0-5-5l-1 1" />
      <path d="M9.5 6.5a3.535 3.535 0 0 0-5 0l-2 2a3.535 3.535 0 0 0 5 5l1-1" />
    </svg>
  ),
  Unlink: () => (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="w-3.5 h-3.5"
    >
      <path d="M6.5 9.5a3.535 3.535 0 0 0 5 0l2-2a3.535 3.535 0 0 0-5-5l-1 1" />
      <path d="M9.5 6.5a3.535 3.535 0 0 0-5 0l-2 2a3.535 3.535 0 0 0 5 5l1-1" />
      <line x1="3" y1="13" x2="13" y2="3" />
    </svg>
  ),
  AlignLeft: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
      <rect x="1" y="2" width="14" height="1.5" rx=".5" />
      <rect x="1" y="5.5" width="9" height="1.5" rx=".5" />
      <rect x="1" y="9" width="14" height="1.5" rx=".5" />
      <rect x="1" y="12.5" width="9" height="1.5" rx=".5" />
    </svg>
  ),
  AlignCenter: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
      <rect x="1" y="2" width="14" height="1.5" rx=".5" />
      <rect x="3.5" y="5.5" width="9" height="1.5" rx=".5" />
      <rect x="1" y="9" width="14" height="1.5" rx=".5" />
      <rect x="3.5" y="12.5" width="9" height="1.5" rx=".5" />
    </svg>
  ),
  AlignRight: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
      <rect x="1" y="2" width="14" height="1.5" rx=".5" />
      <rect x="6" y="5.5" width="9" height="1.5" rx=".5" />
      <rect x="1" y="9" width="14" height="1.5" rx=".5" />
      <rect x="6" y="12.5" width="9" height="1.5" rx=".5" />
    </svg>
  ),
  BulletList: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
      <circle cx="2.5" cy="4" r="1.3" />
      <circle cx="2.5" cy="8" r="1.3" />
      <circle cx="2.5" cy="12" r="1.3" />
      <rect x="5" y="3" width="10" height="2" rx=".5" />
      <rect x="5" y="7" width="10" height="2" rx=".5" />
      <rect x="5" y="11" width="10" height="2" rx=".5" />
    </svg>
  ),
  OrderedList: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M1.5 2.5h1v3h-2V4.7h1V2.5zm-.5 5.5h2v.7H2l.9 1.1H1.1v.7H3v.7H1v-1H2l-.8-1H1V8zm0 4.5h1.7c.4 0 .8.2.8.7 0 .3-.2.5-.4.6.3.1.4.4.4.6 0 .5-.4.7-.8.7H1V13z" />
      <rect x="5" y="3" width="10" height="2" rx=".5" />
      <rect x="5" y="7" width="10" height="2" rx=".5" />
      <rect x="5" y="11" width="10" height="2" rx=".5" />
    </svg>
  ),
  Indent: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
      <rect x="1" y="2" width="14" height="1.5" rx=".5" />
      <rect x="5" y="5.5" width="10" height="1.5" rx=".5" />
      <rect x="1" y="9" width="14" height="1.5" rx=".5" />
      <rect x="5" y="12.5" width="10" height="1.5" rx=".5" />
      <path d="M1 6.5l3 2-3 2V6.5z" />
    </svg>
  ),
  Outdent: () => (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
      <rect x="1" y="2" width="14" height="1.5" rx=".5" />
      <rect x="5" y="5.5" width="10" height="1.5" rx=".5" />
      <rect x="1" y="9" width="14" height="1.5" rx=".5" />
      <rect x="5" y="12.5" width="10" height="1.5" rx=".5" />
      <path d="M4 6.5L1 8.5l3 2V6.5z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-3 h-3"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  ),
};

// ─── Toolbar primitives ───────────────────────────────────────────────────────

type BtnProps = {
  onCmd: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
};

const ToolBtn = ({ onCmd, active, title, children, disabled }: BtnProps) => (
  <button
    type="button"
    onMouseDown={(e) => {
      e.preventDefault();
      if (!disabled) onCmd();
    }}
    title={title}
    aria-label={title}
    aria-pressed={active}
    disabled={disabled}
    className={`inline-flex items-center justify-center w-7 h-7 rounded transition-colors disabled:opacity-30 ${
      active
        ? "bg-[#0a0a0a] text-white"
        : "text-[#525252] hover:bg-[#f8f7f4] hover:text-[#0a0a0a]"
    }`}
  >
    {children}
  </button>
);

const Sep = () => (
  <span className="w-px h-5 bg-gray-200 mx-1 self-center flex-shrink-0" />
);

// Color swatches for the text-color picker
const TEXT_COLORS = [
  { hex: "#111111", label: "Black" },
  { hex: "#374151", label: "Dark gray" },
  { hex: "#1e40af", label: "Navy blue" },
  { hex: "#065f46", label: "Dark green" },
  { hex: "#7f1d1d", label: "Dark red" },
  { hex: "#5b21b6", label: "Purple" },
  { hex: "#92400e", label: "Brown" },
  { hex: "#0e7490", label: "Teal" },
];

// Font sizes in pt
const FONT_SIZES = [
  "8",
  "9",
  "10",
  "10.5",
  "11",
  "12",
  "14",
  "16",
  "18",
  "20",
  "24",
  "28",
];

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
  const [editorHtml, setEditorHtml] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);

  // Toolbar state
  const [fmt, setFmt] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    insertUnorderedList: false,
    insertOrderedList: false,
  });
  const [blockFormat, setBlockFormat] = useState("p");
  const [fontSize, setFontSize] = useState("10.5");
  const [textColor, setTextColor] = useState("#111111");
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [currentLinkHref, setCurrentLinkHref] = useState<string | null>(null);

  // Link dialog
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const savedRange = useRef<Range | null>(null);

  // Download dropdown
  const [dlOpen, setDlOpen] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const colorBtnRef = useRef<HTMLButtonElement>(null);
  const dlRef = useRef<HTMLDivElement>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);

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
      initialized.current = false;

      const raw = await kv.get(`resume:${id}`);
      if (!raw || cancelled) return;
      const data = JSON.parse(raw);
      if (!cancelled) {
        setFeedback(data.feedback ?? null);
        setCompanyName(data.companyName ?? "");
        setJobTitle(data.jobTitle ?? "");
      }

      const savedHtml = await kv.get(`resume-edit-html:${id}`);
      if (savedHtml && !cancelled) {
        setEditorHtml(savedHtml);
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
        const html = textToResumeHtml(plainText);
        if (!cancelled) setEditorHtml(html);
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

  // ── Populate editor after it mounts ─────────────────────────────────────
  useEffect(() => {
    if (
      !extracting &&
      editorHtml !== null &&
      editorRef.current &&
      !initialized.current
    ) {
      editorRef.current.innerHTML = editorHtml;
      initialized.current = true;
      updateWordCount();
    }
  }, [extracting, editorHtml]);

  // ── Selection → toolbar active states + link detection ──────────────────
  useEffect(() => {
    const update = () => {
      try {
        setFmt({
          bold: document.queryCommandState("bold"),
          italic: document.queryCommandState("italic"),
          underline: document.queryCommandState("underline"),
          strikeThrough: document.queryCommandState("strikeThrough"),
          justifyLeft: document.queryCommandState("justifyLeft"),
          justifyCenter: document.queryCommandState("justifyCenter"),
          justifyRight: document.queryCommandState("justifyRight"),
          insertUnorderedList: document.queryCommandState(
            "insertUnorderedList",
          ),
          insertOrderedList: document.queryCommandState("insertOrderedList"),
        });
        const bf = document.queryCommandValue("formatBlock").toLowerCase();
        setBlockFormat(bf || "p");

        // Detect link under cursor
        const sel = window.getSelection();
        const anchor = sel?.anchorNode?.parentElement?.closest("a");
        setCurrentLinkHref(anchor ? (anchor as HTMLAnchorElement).href : null);
      } catch {
        /* ignore */
      }
    };
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, []);

  // ── Close dropdowns on outside click ────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dlRef.current && !dlRef.current.contains(e.target as Node))
        setDlOpen(false);
      if (
        colorPickerRef.current &&
        !colorPickerRef.current.contains(e.target as Node) &&
        colorBtnRef.current &&
        !colorBtnRef.current.contains(e.target as Node)
      ) {
        setColorPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Helpers ─────────────────────────────────────────────────────────────
  const exec = (cmd: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(cmd, false, value);
  };

  const updateWordCount = () => {
    const text = editorRef.current?.innerText?.trim() ?? "";
    setWordCount(text ? text.split(/\s+/).filter(Boolean).length : 0);
  };

  // ── Auto-save on input ───────────────────────────────────────────────────
  const handleEditorInput = () => {
    setIsDirty(true);
    updateWordCount();
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      if (!editorRef.current) return;
      setSaving(true);
      await kv.set(`resume-edit-html:${id}`, editorRef.current.innerHTML);
      setSaving(false);
      setIsDirty(false);
      setSavedMs(Date.now());
    }, 2500);
  };

  // ── Manual save ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editorRef.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setSaving(true);
    await kv.set(`resume-edit-html:${id}`, editorRef.current.innerHTML);
    setSaving(false);
    setIsDirty(false);
    setSavedMs(Date.now());
  };

  // ── Font size (uses font-tag marker trick) ───────────────────────────────
  const applyFontSize = (pt: string) => {
    editorRef.current?.focus();
    document.execCommand("styleWithCSS", false, "false");
    document.execCommand("fontSize", false, "7");
    editorRef.current?.querySelectorAll('font[size="7"]').forEach((el) => {
      const span = document.createElement("span");
      span.style.fontSize = `${pt}pt`;
      span.innerHTML = el.innerHTML;
      el.parentNode?.replaceChild(span, el);
    });
    setFontSize(pt);
    setIsDirty(true);
  };

  // ── Text color ───────────────────────────────────────────────────────────
  const applyTextColor = (hex: string) => {
    editorRef.current?.focus();
    document.execCommand("foreColor", false, hex);
    setTextColor(hex);
    setColorPickerOpen(false);
    setIsDirty(true);
  };

  // ── Link dialog ──────────────────────────────────────────────────────────
  const handleLinkClick = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0)
      savedRange.current = sel.getRangeAt(0).cloneRange();
    const anchor = sel?.anchorNode?.parentElement?.closest("a");
    setLinkUrl((anchor as HTMLAnchorElement | null)?.href ?? "https://");
    setLinkOpen(true);
  };

  const handleLinkApply = () => {
    const sel = window.getSelection();
    sel?.removeAllRanges();
    if (savedRange.current) sel?.addRange(savedRange.current);
    if (linkUrl && linkUrl !== "https://") {
      exec("createLink", linkUrl);
      editorRef.current?.querySelectorAll("a").forEach((a) => {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      });
    } else {
      exec("unlink");
    }
    setLinkOpen(false);
    setLinkUrl("");
    setIsDirty(true);
  };

  // ── Downloads ────────────────────────────────────────────────────────────
  const handleDownloadPdf = () => {
    setDlOpen(false);
    window.print();
  };

  const handleDownloadDoc = () => {
    setDlOpen(false);
    const html = editorRef.current?.innerHTML ?? "";
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
    if (saving) return "Saving…";
    if (isDirty) return null;
    if (savedMs) {
      const sec = Math.round((Date.now() - savedMs) / 1000);
      if (sec < 5) return "✓ Saved";
      if (sec < 60) return `✓ Saved ${sec}s ago`;
      return `✓ Saved ${Math.round(sec / 60)}m ago`;
    }
    return null;
  })();

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* ── Link dialog ─────────────────────────────────────────────────── */}
      {linkOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[2px]"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setLinkOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-96 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">
                Insert / edit link
              </p>
              <button
                onClick={() => setLinkOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none"
              >
                ×
              </button>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-500 font-medium">URL</label>
              <input
                autoFocus
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleLinkApply();
                  if (e.key === "Escape") setLinkOpen(false);
                }}
                placeholder="https://example.com"
                className="w-full border border-[#e5e5e5] px-3 py-2.5 text-sm focus:outline-none focus:border-[#0a0a0a]"
                style={{ boxShadow: "none" }}
              />
            </div>
            <div className="flex gap-2 justify-between items-center">
              <button
                type="button"
                onMouseDown={() => {
                  exec("unlink");
                  setLinkOpen(false);
                }}
                className="text-xs text-red-500 hover:text-red-700 hover:underline px-1 py-1"
              >
                Remove link
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setLinkOpen(false)}
                  className="text-sm px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLinkApply}
                  className="text-sm px-4 py-2 bg-[#0a0a0a] text-white hover:bg-[#2a2a2a] transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <nav className="resume-editor-chrome flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200 shadow-sm flex-shrink-0 z-10 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={`/resume/${id}`}
            className="back-button text-sm font-semibold text-gray-700 flex-shrink-0"
          >
            <img
              src="/icons/back.svg"
              alt=""
              aria-hidden="true"
              className="w-2.5 h-2.5"
            />
            Back to Review
          </Link>
          {(companyName || jobTitle) && (
            <span className="hidden sm:block text-sm text-gray-400 truncate">
              {[companyName, jobTitle].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Save status */}
          {(isDirty || saving || savedLabel) && (
            <span
              role="status"
              aria-live="polite"
              className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                isDirty && !saving
                  ? "text-amber-700 bg-amber-50 border border-amber-200"
                  : saving
                    ? "text-blue-600 bg-blue-50 border border-blue-200"
                    : "text-green-700 bg-green-50 border border-green-200"
              }`}
            >
              {isDirty && !saving && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              )}
              {isDirty && !saving ? "Unsaved" : savedLabel}
            </span>
          )}

          <button
            onClick={() => setTipsOpen((v) => !v)}
            className="back-button text-xs font-medium text-gray-500 hover:bg-gray-50 sm:hidden"
          >
            {tipsOpen ? "Hide Tips" : "Show Tips"}
          </button>

          <button
            onClick={handleSave}
            disabled={saving || extracting || !isDirty}
            className="back-button text-sm font-semibold text-[#0a0a0a] hover:bg-[#f8f7f4] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Saving…" : "Save"}
          </button>

          {/* Download dropdown */}
          <div className="relative" ref={dlRef}>
            <button
              onClick={() => setDlOpen((v) => !v)}
              disabled={!isEditorReady}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span aria-hidden="true">↓</span>
              <span>Download</span>
              <IC.ChevronDown />
            </button>
            {dlOpen && (
              <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-20 py-1.5 w-44 overflow-hidden">
                <button
                  onClick={handleDownloadPdf}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                >
                  <span className="text-base">🖨</span>
                  <span>
                    <span className="font-medium">PDF</span>
                    <span className="text-xs text-gray-400 ml-1">(print)</span>
                  </span>
                </button>
                <button
                  onClick={handleDownloadDoc}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2.5"
                >
                  <span className="text-base">📄</span>
                  <span>
                    <span className="font-medium">Word</span>
                    <span className="text-xs text-gray-400 ml-1">(.doc)</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── Formatting toolbar ───────────────────────────────────────────── */}
      {isEditorReady && (
        <div className="resume-editor-chrome flex-shrink-0 bg-gray-50 border-b border-gray-200 px-3 py-1 flex items-center gap-0.5 overflow-x-auto">
          {/* Undo / Redo */}
          <ToolBtn onCmd={() => exec("undo")} title="Undo (Ctrl+Z)">
            <IC.Undo />
          </ToolBtn>
          <ToolBtn onCmd={() => exec("redo")} title="Redo (Ctrl+Y)">
            <IC.Redo />
          </ToolBtn>

          <Sep />

          {/* Block format */}
          <select
            value={blockFormat}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => {
              exec("formatBlock", e.target.value);
              editorRef.current?.focus();
            }}
            className="text-xs border border-gray-200 rounded-md px-2 py-1 text-gray-700 bg-white focus:outline-none focus:border-[#0a0a0a] h-7"
            style={{ boxShadow: "none" }}
            aria-label="Block format"
          >
            <option value="p">Normal</option>
            <option value="h1">Name / Title</option>
            <option value="h2">Section</option>
            <option value="h3">Subheading</option>
          </select>

          {/* Font size */}
          <select
            value={fontSize}
            onMouseDown={(e) => e.stopPropagation()}
            onChange={(e) => applyFontSize(e.target.value)}
            className="text-xs border border-gray-200 rounded-md px-1.5 py-1 ml-1 text-gray-700 bg-white focus:outline-none focus:border-[#0a0a0a] h-7 w-16"
            style={{ boxShadow: "none" }}
            aria-label="Font size"
          >
            {FONT_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}pt
              </option>
            ))}
          </select>

          <Sep />

          {/* Text formatting */}
          <ToolBtn
            onCmd={() => exec("bold")}
            active={fmt.bold}
            title="Bold (Ctrl+B)"
          >
            <IC.Bold />
          </ToolBtn>
          <ToolBtn
            onCmd={() => exec("italic")}
            active={fmt.italic}
            title="Italic (Ctrl+I)"
          >
            <IC.Italic />
          </ToolBtn>
          <ToolBtn
            onCmd={() => exec("underline")}
            active={fmt.underline}
            title="Underline (Ctrl+U)"
          >
            <IC.Underline />
          </ToolBtn>
          <ToolBtn
            onCmd={() => exec("strikeThrough")}
            active={fmt.strikeThrough}
            title="Strikethrough"
          >
            <IC.Strike />
          </ToolBtn>

          {/* Text color */}
          <div className="relative ml-0.5">
            <button
              ref={colorBtnRef}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setColorPickerOpen((v) => !v);
              }}
              title="Text color"
              aria-label="Text color"
              className="inline-flex items-center justify-center w-7 h-7 rounded transition-colors text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            >
              <IC.TextColor color={textColor} />
            </button>
            {colorPickerOpen && (
              <div
                ref={colorPickerRef}
                className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 p-2.5"
                onMouseDown={(e) => e.preventDefault()}
              >
                <p className="text-xs text-gray-400 mb-2 font-medium">
                  Text color
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {TEXT_COLORS.map(({ hex, label }) => (
                    <button
                      key={hex}
                      type="button"
                      title={label}
                      aria-label={label}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyTextColor(hex);
                      }}
                      className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 ${
                        textColor === hex
                          ? "border-[#0a0a0a] scale-110"
                          : "border-[#e5e5e5]"
                      }`}
                      style={{ backgroundColor: hex }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear formatting */}
          <ToolBtn
            onCmd={() => {
              exec("removeFormat");
              exec("formatBlock", "p");
            }}
            title="Clear formatting"
          >
            <IC.ClearFmt />
          </ToolBtn>

          <Sep />

          {/* Link */}
          <ToolBtn
            onCmd={handleLinkClick}
            active={!!currentLinkHref}
            title={
              currentLinkHref ? `Edit link: ${currentLinkHref}` : "Insert link"
            }
          >
            <IC.Link />
          </ToolBtn>
          <ToolBtn onCmd={() => exec("unlink")} title="Remove link">
            <IC.Unlink />
          </ToolBtn>

          <Sep />

          {/* Alignment */}
          <ToolBtn
            onCmd={() => exec("justifyLeft")}
            active={fmt.justifyLeft}
            title="Align left"
          >
            <IC.AlignLeft />
          </ToolBtn>
          <ToolBtn
            onCmd={() => exec("justifyCenter")}
            active={fmt.justifyCenter}
            title="Centre"
          >
            <IC.AlignCenter />
          </ToolBtn>
          <ToolBtn
            onCmd={() => exec("justifyRight")}
            active={fmt.justifyRight}
            title="Align right"
          >
            <IC.AlignRight />
          </ToolBtn>

          <Sep />

          {/* Lists */}
          <ToolBtn
            onCmd={() => exec("insertUnorderedList")}
            active={fmt.insertUnorderedList}
            title="Bullet list"
          >
            <IC.BulletList />
          </ToolBtn>
          <ToolBtn
            onCmd={() => exec("insertOrderedList")}
            active={fmt.insertOrderedList}
            title="Numbered list"
          >
            <IC.OrderedList />
          </ToolBtn>

          <Sep />

          {/* Indent */}
          <ToolBtn onCmd={() => exec("indent")} title="Indent">
            <IC.Indent />
          </ToolBtn>
          <ToolBtn onCmd={() => exec("outdent")} title="Outdent">
            <IC.Outdent />
          </ToolBtn>
        </div>
      )}

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* AI Tips sidebar */}
        {tipsOpen && (
          <aside className="resume-editor-chrome w-64 xl:w-72 flex-shrink-0 bg-white border-r border-gray-100 overflow-y-auto hidden sm:flex flex-col">
            <div className="px-4 pt-4 pb-2 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                AI Suggestions
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Apply these to your resume
              </p>
            </div>
            <div className="p-3 flex flex-col gap-2 overflow-y-auto">
              {tips.length === 0 ? (
                <p className="text-xs text-gray-400 px-1 pt-2">
                  No improvement tips found.
                </p>
              ) : (
                tips.map((tip, i) => (
                  <div
                    key={i}
                    className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex flex-col gap-1"
                  >
                    <span className="text-xs font-semibold text-amber-800 leading-snug">
                      {tip.tip}
                    </span>
                    {"explanation" in tip && (
                      <span className="text-xs text-amber-700 leading-relaxed">
                        {(tip as { explanation?: string }).explanation}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Paper viewport */}
        <div className="resume-paper-wrap flex-1 overflow-y-auto bg-gray-100 flex flex-col items-center py-8 px-4">
          {extracting ? (
            <div className="flex flex-col items-center justify-center gap-3 mt-24">
              <div className="w-8 h-8 rounded-full border-4 border-[#e5e5e5] border-t-[#0a0a0a] animate-spin" />
              <p className="text-sm text-gray-500">Extracting resume text…</p>
            </div>
          ) : extractError ? (
            <div className="flex flex-col items-center gap-4 mt-24">
              <p className="text-red-600 text-sm font-medium">{extractError}</p>
              <Link to={`/resume/${id}`} className="primary-button w-fit px-6">
                Back to Review
              </Link>
            </div>
          ) : (
            <>
              {/* A4 paper */}
              <div
                className="resume-paper bg-white shadow-xl rounded-sm w-full"
                style={{ maxWidth: 794, minHeight: 1123 }}
              >
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleEditorInput}
                  className="resume-doc w-full h-full min-h-[1123px] outline-none"
                  style={{ padding: "0.85in 0.9in" }}
                  aria-label="Resume editor"
                  aria-multiline="true"
                  role="textbox"
                />
              </div>

              {/* Footer: word count + save hint */}
              <div
                className="resume-editor-chrome flex items-center justify-between w-full mt-3 px-1 text-xs text-gray-400"
                style={{ maxWidth: 794 }}
              >
                <span>
                  {wordCount} {wordCount === 1 ? "word" : "words"}
                </span>
                <span>
                  ResumeLens · edits auto-save ·{" "}
                  <button
                    onClick={handleSave}
                    className="underline hover:text-gray-600"
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
