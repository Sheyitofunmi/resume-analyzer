import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";

export const meta = () => [
  { title: "Resumind | Auth" },
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
    <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center px-4">
      <div className="gradient-border shadow-lg w-full max-w-lg">
        <section className="flex flex-col gap-6 bg-white rounded-2xl p-6 sm:p-10 w-full">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1>Welcome</h1>
            <h2>Log In to Continue Your Job Journey</h2>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 text-sm text-blue-800 flex flex-col gap-1">
            <p className="font-semibold">What is Puter?</p>
            <p className="text-blue-700">
              Resumind uses <span className="font-medium">Puter</span> — a free
              cloud platform — to securely store your resumes and AI analysis.
              No separate sign-up required; your Puter account holds everything.
            </p>
          </div>

          <div>
            {isLoading ? (
              <button
                className="auth-button animate-pulse"
                disabled
                aria-busy="true"
              >
                <p>Signing you in…</p>
              </button>
            ) : (
              <>
                {auth.isAuthenticated ? (
                  <button className="auth-button" onClick={auth.signOut}>
                    <p>Log Out</p>
                  </button>
                ) : (
                  <button className="auth-button" onClick={auth.signIn}>
                    <p>Log In with Puter</p>
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Auth;
