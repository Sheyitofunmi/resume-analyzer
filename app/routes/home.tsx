import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import {
  isRouteErrorResponse,
  Link,
  useNavigate,
  useRouteError,
} from "react-router";
import { useEffect, useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
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
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1>Track Your Applications & Resume Ratings</h1>
          {!loadingResumes && resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
          ) : (
            <h2>Review your submissions and check AI-powered feedback.</h2>
          )}
        </div>

        {loadingResumes && (
          <div className="flex flex-col items-center justify-center">
            <img src="/images/resume-scan-2.gif" className="w-[200px]" />
          </div>
        )}

        {!loadingResumes && resumes.length > 0 && (
          <>
            <div className="resumes-section">
              {paginatedResumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onDelete={() => handleDelete(resume)}
                />
              ))}
            </div>

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

        {!loadingResumes && resumes?.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-10 gap-4">
            <Link
              to="/upload"
              className="primary-button w-fit text-xl font-semibold"
            >
              Upload Resume
            </Link>
          </div>
        )}
      </section>
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
