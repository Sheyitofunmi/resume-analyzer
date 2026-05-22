import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { usePuterStore } from "~/lib/puter";
import { useEffect } from "react";
import { ToastProvider } from "~/components/Toast";
import CommandPalette from "~/components/CommandPalette";
import { useLenis } from "~/hooks/useLenis";

function PuterLoadingScreen() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        background: "var(--bg)",
        fontFamily: "var(--font-mono)",
      }}
    >
      {/* Animated scan line */}
      <div
        style={{
          position: "relative",
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 48 48"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="var(--border-hi)"
            strokeWidth="2"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="var(--phos)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="125.6"
            strokeDashoffset="94"
            style={{
              filter: "drop-shadow(0 0 6px var(--phos-glow))",
              animation: "rl-spin 1.2s linear infinite",
            }}
          />
        </svg>
        <span
          style={{
            position: "absolute",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 700,
            color: "var(--phos)",
          }}
        >
          R
        </span>
      </div>
      <p
        style={{
          fontSize: "var(--text-xs)",
          color: "var(--fg-3)",
          letterSpacing: "0.2em",
          margin: 0,
        }}
      >
        connecting…
      </p>
      <style>{`@keyframes rl-spin { to { stroke-dashoffset: 0; } }`}</style>
    </div>
  );
}

function LenisProvider({ children }: { children: React.ReactNode }) {
  useLenis();
  return <>{children}</>;
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { init, isLoading, puterReady } = usePuterStore();

  useEffect(() => {
    init();
  }, [init]);

  const showLoader = isLoading && !puterReady;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <script src="https://js.puter.com/v2/"></script>
        {showLoader ? (
          <PuterLoadingScreen />
        ) : (
          <LenisProvider>{children}</LenisProvider>
        )}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Outlet />
      <CommandPalette />
    </ToastProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
