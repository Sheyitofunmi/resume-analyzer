import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useNavigate } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import { springs } from "~/lib/motion";
import { usePuterStore } from "~/lib/puter";

interface Command {
  id: string;
  label: string;
  hint: string;
  action: () => void;
  category: "nav" | "ai" | "account";
}

const CategoryLabel: Record<string, string> = {
  nav: "// NAVIGATE",
  ai: "// ACTIONS",
  account: "// ACCOUNT",
};

function buildCommands(
  navigate: ReturnType<typeof useNavigate>,
  signOut: () => void,
): Command[] {
  return [
    {
      id: "home",
      label: "Go to dashboard",
      hint: "View all resumes",
      action: () => navigate("/"),
      category: "nav",
    },
    {
      id: "upload",
      label: "Upload a resume",
      hint: "Analyze a new resume",
      action: () => navigate("/upload"),
      category: "nav",
    },
    {
      id: "history",
      label: "Score history",
      hint: "View your score trends",
      action: () => navigate("/history"),
      category: "nav",
    },
    {
      id: "pricing",
      label: "Pricing",
      hint: "Plans and features",
      action: () => navigate("/pricing"),
      category: "nav",
    },
    {
      id: "settings",
      label: "Settings",
      hint: "Profile and preferences",
      action: () => navigate("/settings"),
      category: "nav",
    },
    {
      id: "analyze",
      label: "Run a new analysis",
      hint: "Go to upload to start",
      action: () => navigate("/upload"),
      category: "ai",
    },
    {
      id: "compare",
      label: "Compare resumes",
      hint: "Select two resumes on the dashboard",
      action: () => navigate("/"),
      category: "ai",
    },
    {
      id: "signout",
      label: "Sign out",
      hint: "End your session",
      action: signOut,
      category: "account",
    },
  ];
}

let _open: (() => void) | null = null;
export const openCommandPalette = () => _open?.();

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { auth } = usePuterStore();

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActiveIdx(0);
  }, []);

  const commands = buildCommands(navigate, auth.signOut);

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.hint.toLowerCase().includes(query.toLowerCase()),
      )
    : commands;

  useEffect(() => {
    _open = () => setOpen(true);
    return () => {
      _open = null;
    };
  }, []);

  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  const runCommand = useCallback(
    (cmd: Command) => {
      cmd.action();
      close();
    },
    [close],
  );

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[activeIdx]) {
      runCommand(filtered[activeIdx]);
    }
  };

  // Group filtered by category
  const grouped: Record<string, Command[]> = {};
  for (const cmd of filtered) {
    if (!grouped[cmd.category]) grouped[cmd.category] = [];
    grouped[cmd.category].push(cmd);
  }

  let globalIdx = 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cp-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={close}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(11,11,11,0.45)",
              zIndex: 200,
            }}
          />

          {/* Panel */}
          <motion.div
            key="cp-panel"
            role="dialog"
            aria-label="Command palette"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ ...springs.snappy, duration: 0.18 }}
            style={{
              position: "fixed",
              top: "20%",
              left: "50%",
              x: "-50%",
              width: "min(560px, calc(100vw - 32px))",
              background: "var(--surface)",
              border: "var(--bw) solid var(--ink)",
              borderRadius: "var(--r-card)",
              boxShadow: "var(--pop)",
              zIndex: 201,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Input row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 16px",
                borderBottom: "var(--bw) solid var(--ink)",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 10,
                  height: 10,
                  background: "var(--cyan)",
                  border: "var(--bw) solid var(--ink)",
                  borderRadius: 2,
                  flexShrink: 0,
                }}
              />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type a command…"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  outline: "none",
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: 15,
                  color: "var(--fg-1)",
                  boxShadow: "none",
                  padding: 0,
                  transform: "none",
                }}
              />
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "var(--fg-2)",
                  padding: "2px 6px",
                  border: "1px solid var(--line)",
                  borderRadius: 5,
                }}
              >
                ESC
              </span>
            </div>

            {/* Results */}
            <div style={{ maxHeight: 360, overflowY: "auto" }}>
              {Object.entries(grouped).map(([cat, cmds]) => (
                <div key={cat}>
                  <div
                    className="eyebrow"
                    style={{
                      padding: "10px 16px 4px",
                      fontSize: 10,
                      color: "var(--fg-3)",
                    }}
                  >
                    {CategoryLabel[cat] ?? cat}
                  </div>
                  {cmds.map((cmd) => {
                    const idx = globalIdx++;
                    const isActive = idx === activeIdx;
                    return (
                      <div
                        key={cmd.id}
                        onClick={() => runCommand(cmd)}
                        onMouseEnter={() => setActiveIdx(idx)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 16px",
                          cursor: "pointer",
                          background: isActive ? "var(--cyan)" : "transparent",
                          borderLeft: isActive
                            ? "3px solid var(--ink)"
                            : "3px solid transparent",
                          transition: "background var(--dur-fast) ease",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 800,
                            color: "var(--ink)",
                            flex: 1,
                          }}
                        >
                          {cmd.label}
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: isActive ? "var(--ink)" : "var(--fg-3)",
                          }}
                        >
                          {cmd.hint}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
              {filtered.length === 0 && (
                <div
                  style={{
                    padding: "24px 16px",
                    textAlign: "center",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--fg-3)",
                  }}
                >
                  No commands match
                </div>
              )}
            </div>

            {/* Footer hints */}
            <div
              style={{
                padding: "8px 16px",
                borderTop: "1px solid var(--line)",
                display: "flex",
                gap: 16,
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--fg-3)",
              }}
            >
              {[
                ["↑↓", "navigate"],
                ["↵", "select"],
                ["Esc", "close"],
              ].map(([key, desc]) => (
                <span key={key}>
                  <span
                    style={{
                      padding: "1px 5px",
                      border: "1px solid var(--line)",
                      borderRadius: 5,
                      marginRight: 4,
                    }}
                  >
                    {key}
                  </span>
                  {desc}
                </span>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
