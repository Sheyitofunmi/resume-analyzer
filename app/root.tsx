import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { hasSignedInBefore, usePuterStore } from "~/lib/puter";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ToastProvider } from "~/components/Toast";
import CommandPalette from "~/components/CommandPalette";

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
        gap: 22,
        background: "var(--page)",
      }}
    >
      <svg width="40" height="40" viewBox="0 0 20 20" aria-hidden="true">
        <rect x="0" y="0" width="6" height="6" fill="var(--ink)" />
        <rect x="7" y="0" width="6" height="6" fill="var(--cyan)">
          <animate
            attributeName="opacity"
            values="1;0.2;1"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="0" y="7" width="6" height="6" fill="var(--ink)" />
        <rect x="14" y="7" width="6" height="6" fill="var(--lime)">
          <animate
            attributeName="opacity"
            values="0.2;1;0.2"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </rect>
        <rect x="7" y="14" width="6" height="6" fill="var(--ink)" />
        <rect x="14" y="14" width="6" height="6" fill="var(--violet)">
          <animate
            attributeName="opacity"
            values="1;0.2;1"
            dur="1.6s"
            repeatCount="indefinite"
          />
        </rect>
      </svg>
      <p
        className="eyebrow"
        style={{
          margin: 0,
        }}
      >
        Getting things ready…
      </p>
    </div>
  );
}

function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  // No `AnimatePresence` here on purpose. Under `mode="popLayout"` the outgoing
  // route's exit never completed, so its `position: absolute` clone stayed in
  // the DOM at `opacity: 0` covering the viewport — invisible, but still eating
  // every click, which killed all subsequent client-side navigation until a
  // hard reload. Only the incoming route animates now: React swaps it on the
  // key change and the fade-in runs on the element that is actually there.
  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      {children}
    </motion.div>
  );
}

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://js.puter.com" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:ital,wght@0,400..900;1,400..900&family=JetBrains+Mono:wght@400;500;600&family=Newsreader:ital,opsz,wght@1,6..72,400..600&display=swap",
  },
];

// Routes that render fine without an auth answer. Blocking these on the
// third-party Puter script just made the first paint wait on a network round
// trip they never needed.
const PUTER_OPTIONAL_ROUTES = new Set(["/landing", "/pricing", "/auth"]);

export function Layout({ children }: { children: React.ReactNode }) {
  const { init, isLoading, puterReady } = usePuterStore();
  const { pathname } = useLocation();
  // The prerendered shell paints the splash, so the first client render has to
  // agree with it; after mount we can consult localStorage.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    init();
  }, [init]);

  // "/" only needs an auth answer for someone who has signed in here before —
  // everyone else is getting the landing page either way.
  const needsAuthAnswer =
    !PUTER_OPTIONAL_ROUTES.has(pathname) &&
    (pathname !== "/" || !hydrated || hasSignedInBefore());

  const showLoader = isLoading && !puterReady && needsAuthAnswer;

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
        {/* async so it never blocks parsing or the route chunks — the store
            polls for window.puter, so it tolerates arriving late. */}
        <script async src="https://js.puter.com/v2/"></script>
        {showLoader ? (
          <PuterLoadingScreen />
        ) : (
          <PageTransition>{children}</PageTransition>
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
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        background: "var(--page)",
        textAlign: "center",
      }}
    >
      <span className="eyebrow">Something went wrong</span>
      <h1 style={{ fontSize: "var(--text-5xl)" }}>{message}</h1>
      <p style={{ color: "var(--fg-2)", fontWeight: 600, maxWidth: 480 }}>
        {details}
      </p>
      <a href="/" className="btn btn--primary" style={{ marginTop: 8 }}>
        Back to home
      </a>
      {stack && (
        <pre
          style={{
            width: "100%",
            maxWidth: 720,
            textAlign: "left",
            overflowX: "auto",
            background: "var(--dark-bg)",
            color: "var(--dark-fg)",
            border: "var(--bw) solid var(--ink)",
            borderRadius: "var(--r-card)",
            padding: 20,
            fontSize: 12,
          }}
        >
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
