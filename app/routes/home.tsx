import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import Footer from "~/components/Footer";
import ResumeCard from "~/components/ResumeCard";
import StatsStrip from "~/components/StatsStrip";
import HowItWorks from "~/components/HowItWorks";
import { usePuterStore } from "~/lib/puter";
import {
  isRouteErrorResponse,
  Link,
  useNavigate,
  useRouteError,
} from "react-router";
import { useEffect, useRef, useState } from "react";

// ── Comparison panel ────────────────────────────────────────────────────────

const SECTIONS: { key: keyof Feedback; label: string }[] = [
  { key: "ATS", label: "ATS" },
  { key: "toneAndStyle", label: "Tone & Style" },
  { key: "content", label: "Content" },
  { key: "structure", label: "Structure" },
  { key: "skills", label: "Skills" },
];

function scoreColor(s: number) {
  if (s > 69) return "bg-green-500";
  if (s > 49) return "bg-amber-400";
  return "bg-red-500";
}

const ComparePanel = ({
  a,
  b,
  onClose,
}: {
  a: Resume;
  b: Resume;
  onClose: () => void;
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const kwA = a.feedback.ATS.keywords;
  const kwB = b.feedback.ATS.keywords;
  const foundA = new Set(kwA?.found ?? []);
  const foundB = new Set(kwB?.found ?? []);
  const allFound = new Set([...foundA, ...foundB]);
  const inBoth = [...allFound].filter((k) => foundA.has(k) && foundB.has(k));
  const onlyA = [...allFound].filter((k) => foundA.has(k) && !foundB.has(k));
  const onlyB = [...allFound].filter((k) => foundB.has(k) && !foundA.has(k));

  return (
    <div
      ref={panelRef}
      className="w-full bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-indigo-50/60">
        <h2 className="!text-base !text-gray-800 font-semibold">
          Resume Comparison
        </h2>
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-full px-3 py-1"
        >
          Close
        </button>
      </div>

      {/* Title row */}
      <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-gray-100">
        <div />
        {[a, b].map((r) => (
          <div key={r.id} className="text-center">
            <p className="font-semibold text-gray-800 text-sm truncate">
              {r.companyName || "Resume"}
            </p>
            {r.jobTitle && (
              <p className="text-xs text-gray-400 truncate">{r.jobTitle}</p>
            )}
          </div>
        ))}
      </div>

      {/* Overall score */}
      <div className="grid grid-cols-3 gap-4 px-6 py-3 bg-gray-50/50 border-b border-gray-100">
        <p className="text-xs font-semibold text-gray-500 self-center">
          Overall Score
        </p>
        {[a, b].map((r) => {
          const s = r.feedback.overallScore;
          const better =
            r === a
              ? a.feedback.overallScore >= b.feedback.overallScore
              : b.feedback.overallScore > a.feedback.overallScore;
          return (
            <div key={r.id} className="flex flex-col items-center gap-1">
              <span
                className={`text-2xl font-bold ${better ? "text-indigo-600" : "text-gray-400"}`}
              >
                {s}
              </span>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full ${scoreColor(s)}`}
                  style={{ width: `${s}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Section scores */}
      {SECTIONS.map(({ key, label }) => {
        const sA = (a.feedback[key] as { score: number }).score;
        const sB = (b.feedback[key] as { score: number }).score;
        return (
          <div
            key={key}
            className="grid grid-cols-3 gap-4 px-6 py-2.5 border-b border-gray-50"
          >
            <p className="text-xs text-gray-500 self-center">{label}</p>
            {[
              { score: sA, winner: sA >= sB },
              { score: sB, winner: sB > sA },
            ].map(({ score, winner }, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${scoreColor(score)}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span
                  className={`text-xs font-semibold w-8 text-right ${winner ? "text-gray-800" : "text-gray-400"}`}
                >
                  {score}
                </span>
              </div>
            ))}
          </div>
        );
      })}

      {/* Keyword overlap */}
      {kwA && kwB && (
        <div className="px-6 py-4 border-t border-gray-100">
          <p className="text-xs font-semibold text-gray-500 mb-3">
            Keyword Overlap
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {inBoth.length > 0 && (
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-green-700 mb-1.5">
                  In both ({inBoth.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {inBoth.map((k) => (
                    <span
                      key={k}
                      className="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {onlyA.length > 0 && (
              <div className="bg-indigo-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-indigo-700 mb-1.5 truncate">
                  Only in {a.companyName || "Resume A"} ({onlyA.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {onlyA.map((k) => (
                    <span
                      key={k}
                      className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-full"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {onlyB.length > 0 && (
              <div className="bg-purple-50 rounded-xl p-3">
                <p className="text-[10px] font-semibold text-purple-700 mb-1.5 truncate">
                  Only in {b.companyName || "Resume B"} ({onlyB.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {onlyB.map((k) => (
                    <span
                      key={k}
                      className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CTA links */}
      <div className="grid grid-cols-3 gap-4 px-6 py-3 bg-gray-50/50 border-t border-gray-100">
        <div />
        {[a, b].map((r) => (
          <div key={r.id} className="flex justify-center">
            <Link
              to={`/resume/${r.id}`}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View full report →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export function meta({}: Route.MetaArgs) {
  return [
    { title: "ResumeLens" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

const RESUMES_PER_PAGE = 6;

export default function Home() {
  const { auth, isLoading, kv, fs } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState<string[]>([]);

  const toggleCompareMode = () => {
    setCompareMode((v) => !v);
    setCompareIds([]);
  };

  const toggleSelect = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length < 2
          ? [...prev, id]
          : prev,
    );
  };

  const compareResumes =
    compareIds.length === 2
      ? ([
          resumes.find((r) => r.id === compareIds[0]),
          resumes.find((r) => r.id === compareIds[1]),
        ].filter(Boolean) as Resume[])
      : null;

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) navigate("/auth?next=/");
  }, [isLoading, auth.isAuthenticated]);

  useEffect(() => {
    if (isLoading || !auth.isAuthenticated) return;

    const loadResumes = async () => {
      setLoadingResumes(true);
      const items = (await kv.list("resume:*", true)) as KVItem[];
      const parsed =
        items?.map((item) => JSON.parse(item.value) as Resume) ?? [];
      setResumes(parsed.reverse());
      setLoadingResumes(false);
    };

    loadResumes();
  }, [isLoading, auth.isAuthenticated]);

  const handleDelete = (resume: Resume) => {
    setResumes((prev) => {
      const next = prev.filter((r) => r.id !== resume.id);
      const maxPage = Math.max(1, Math.ceil(next.length / RESUMES_PER_PAGE));
      if (currentPage > maxPage) setCurrentPage(maxPage);
      return next;
    });
    kv.delete(`resume:${resume.id}`).catch(() => {});
    if (resume.imagePath) fs.delete(resume.imagePath).catch(() => {});
    if (resume.resumePath) fs.delete(resume.resumePath).catch(() => {});
  };

  const totalPages = Math.max(1, Math.ceil(resumes.length / RESUMES_PER_PAGE));
  const paginatedResumes = resumes.slice(
    (currentPage - 1) * RESUMES_PER_PAGE,
    currentPage * RESUMES_PER_PAGE,
  );

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex flex-col">
      <Navbar />

      <section id="main-content" className="main-section flex-1">
        <div className="page-heading pt-8 sm:pt-12 pb-4">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!loadingResumes && resumes?.length === 0 ? (
            <h2>No resumes yet — upload your first to get AI feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        </div>

        {loadingResumes && (
          <div className="flex flex-col items-center justify-center gap-4">
            <img
              src="/images/resume-scan-2.gif"
              className="w-[200px]"
              alt="Loading"
            />
            <p className="text-sm text-gray-400 animate-pulse">
              Loading your resumes…
            </p>
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <>
            {/* Stats strip */}
            <StatsStrip />

            {/* Toolbar */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {compareMode && compareIds.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {compareIds.length === 1
                      ? "Select one more to compare"
                      : "Ready to compare ✓"}
                  </span>
                )}
                {compareMode && compareIds.length === 0 && (
                  <span className="text-sm text-gray-400">
                    Select 2 resumes to compare
                  </span>
                )}
              </div>
              {resumes.length >= 2 && (
                <button
                  onClick={toggleCompareMode}
                  className={`text-sm font-semibold px-4 py-1.5 rounded-full border transition-all duration-200 ${
                    compareMode
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                      : "text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                  }`}
                >
                  {compareMode ? "✕ Cancel Compare" : "Compare Resumes"}
                </button>
              )}
            </div>

            <div className="resumes-section">
              {paginatedResumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onDelete={
                    compareMode ? undefined : () => handleDelete(resume)
                  }
                  compareMode={compareMode}
                  isSelected={compareIds.includes(resume.id)}
                  onSelect={() => toggleSelect(resume.id)}
                />
              ))}
            </div>

            {compareResumes && (
              <ComparePanel
                a={compareResumes[0]}
                b={compareResumes[1]}
                onClose={() => {
                  setCompareIds([]);
                  setCompareMode(false);
                }}
              />
            )}

            {totalPages > 1 && (
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  ← Previous
                </button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty state */}
        {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center gap-10 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Intro card */}
            <div className="flex flex-col items-center gap-5 text-center bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-sm border border-gray-100 w-full">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                  Get Started
                </span>
              </div>

              <div className="flex flex-col gap-3">
                <p className="text-gray-700 text-base leading-relaxed">
                  Upload your resume and paste a job description — ResumeLens
                  will score it against ATS systems and give you actionable tips
                  to improve your chances.
                </p>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-gray-500">
                  <span>✓ ATS compatibility score</span>
                  <span>✓ Keyword gap analysis</span>
                  <span>✓ Tone, structure &amp; content feedback</span>
                  <span>✓ Interview prep questions</span>
                  <span>✓ Rewrite suggestions</span>
                </div>
              </div>

              <Link
                to="/upload"
                className="primary-button w-fit text-lg font-semibold px-8 py-3"
              >
                ✨ Upload Your First Resume
              </Link>
            </div>

            {/* How it works */}
            <HowItWorks />

            {/* Stats strip */}
            <StatsStrip />
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? error.statusText
    : error instanceof Error
      ? error.message
      : "Something went wrong.";

  return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md text-center flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-red-500">Oops!</h1>
        <p className="text-gray-600">{message}</p>
        <a href="/" className="primary-button w-fit mx-auto">
          Go Home
        </a>
      </div>
    </main>
  );
}
