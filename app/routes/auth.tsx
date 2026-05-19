import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export const meta = () => [
  { title: "ResumeLens | Sign In" },
  { name: "description", content: "Log into your account" },
];

const Auth = () => {
  const { isLoading, auth } = usePuterStore();
  const location = useLocation();
  const next = location.search.split("next=")[1];
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isAuthenticated) navigate(next);
  }, [auth.isAuthenticated, next]);

  return (
    <main className="bg-[#f8f7f4] min-h-screen flex items-center justify-center px-4">
      <section className="flex flex-col gap-6 bg-white border border-[#e5e5e5] p-8 sm:p-12 w-full max-w-lg">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-[#525252] uppercase tracking-widest">
            ResumeLens
          </p>
          <h1
            className="text-4xl font-normal text-[#0a0a0a]"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            Welcome back.
          </h1>
          <p className="text-[#525252] text-sm">
            Log in to continue your job search.
          </p>
        </div>

        <div className="border border-[#e5e5e5] px-5 py-4 text-sm text-[#525252] flex flex-col gap-1 bg-[#f8f7f4]">
          <p className="font-semibold text-[#0a0a0a]">What is Puter?</p>
          <p>
            ResumeLens uses <span className="font-medium">Puter</span> — a free
            cloud platform — to securely store your resumes and AI analysis. No
            separate sign-up required; your Puter account holds everything.
          </p>
        </div>

        <div>
          {isLoading ? (
            <button
              className="auth-button opacity-60"
              disabled
              aria-busy="true"
            >
              Signing you in…
            </button>
          ) : (
            <>
              {auth.isAuthenticated ? (
                <button className="auth-button" onClick={auth.signOut}>
                  Log Out
                </button>
              ) : (
                <button className="auth-button" onClick={auth.signIn}>
                  Log In with Puter
                </button>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default Auth;
