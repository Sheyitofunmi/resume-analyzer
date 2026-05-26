import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";

const CONFIRM_WORD = "DELETE";

const WipeApp = () => {
  const { auth, isLoading, error, clearError, fs, kv } = usePuterStore();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FSItem[]>([]);
  const [confirmText, setConfirmText] = useState("");
  const [wiping, setWiping] = useState(false);
  const [done, setDone] = useState(false);

  const loadFiles = async () => {
    const result = (await fs.readDir("./")) as FSItem[];
    setFiles(result ?? []);
  };

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (!isLoading && !auth.isAuthenticated) {
      navigate("/auth?next=/wipe");
    }
  }, [isLoading]);

  const handleDelete = async () => {
    if (confirmText !== CONFIRM_WORD) return;
    setWiping(true);
    for (const file of files) {
      await fs.delete(file.path);
    }
    await kv.flush();
    setDone(true);
    setWiping(false);
    setFiles([]);
  };

  if (isLoading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "3px solid var(--border)",
            borderTopColor: "var(--phos)",
            animation: "spin 0.7s linear infinite",
          }}
        />
      </main>
    );
  }

  if (error) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--bg)",
          padding: 16,
        }}
      >
        <div
          style={{
            background: "var(--parchment)",
            border: "1px solid var(--parchment-border)",
            borderRadius: 12,
            padding: 32,
            maxWidth: 420,
            width: "100%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              color: "var(--ember)",
              margin: 0,
            }}
          >
            {error}
          </p>
          <button
            onClick={clearError}
            style={{
              alignSelf: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              padding: "8px 20px",
              border: "1px solid var(--parchment-border)",
              borderRadius: 6,
              background: "var(--parchment-2)",
              color: "var(--parchment-fg-1)",
              cursor: "pointer",
            }}
          >
            Dismiss
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "var(--parchment)",
          border: "1px solid var(--parchment-border)",
          borderRadius: 12,
          padding: 32,
          width: "100%",
          maxWidth: 440,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--ember)",
              margin: "0 0 4px",
              letterSpacing: "-0.5px",
            }}
          >
            wipe_all_data
          </h1>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--parchment-fg-3)",
              margin: 0,
            }}
          >
            signed in as{" "}
            <span style={{ color: "var(--parchment-fg-1)", fontWeight: 600 }}>
              {auth.user?.username}
            </span>
          </p>
        </div>

        {done ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                color: "var(--phos-dim)",
                margin: 0,
              }}
            >
              // all data wiped successfully
            </p>
            <a
              href="/"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                padding: "9px 20px",
                border: "1px solid var(--parchment-border)",
                borderRadius: 6,
                background: "var(--parchment-2)",
                color: "var(--parchment-fg-1)",
                textDecoration: "none",
              }}
            >
              → go to dashboard
            </a>
          </div>
        ) : (
          <>
            <div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--parchment-fg-2)",
                  margin: "0 0 8px",
                  letterSpacing: "0.06em",
                }}
              >
                FILES ({files.length})
              </p>
              {files.length === 0 ? (
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                    color: "var(--parchment-fg-3)",
                    margin: 0,
                  }}
                >
                  // no files found
                </p>
              ) : (
                <ul
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    maxHeight: 160,
                    overflowY: "auto",
                    margin: 0,
                    padding: 0,
                    listStyle: "none",
                  }}
                >
                  {files.map((f) => (
                    <li
                      key={f.id}
                      style={{
                        padding: "6px 10px",
                        background: "var(--parchment-2)",
                        border: "1px solid var(--parchment-border)",
                        borderRadius: 4,
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--parchment-fg-2)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div
              style={{
                background: "rgba(227,83,74,0.06)",
                border: "1px solid var(--ember-dim)",
                borderRadius: 8,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  color: "var(--parchment-fg-2)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                This will permanently delete all uploaded resumes and analysis
                data. Type{" "}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    color: "var(--ember)",
                  }}
                >
                  {CONFIRM_WORD}
                </span>{" "}
                to confirm.
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder={CONFIRM_WORD}
                aria-label="Type DELETE to confirm"
                style={{
                  background: "var(--parchment)",
                  border: "1px solid var(--ember-dim)",
                  borderRadius: 4,
                  padding: "8px 12px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  color: "var(--ember)",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              <button
                onClick={handleDelete}
                disabled={confirmText !== CONFIRM_WORD || wiping}
                style={{
                  background:
                    confirmText === CONFIRM_WORD && !wiping
                      ? "var(--ember)"
                      : "transparent",
                  border: "1px solid var(--ember-dim)",
                  borderRadius: 6,
                  padding: "9px 20px",
                  fontFamily: "var(--font-mono)",
                  fontSize: 13,
                  fontWeight: 600,
                  color:
                    confirmText === CONFIRM_WORD && !wiping
                      ? "var(--parchment)"
                      : "var(--ember-dim)",
                  cursor:
                    confirmText !== CONFIRM_WORD || wiping
                      ? "not-allowed"
                      : "pointer",
                  opacity: confirmText !== CONFIRM_WORD || wiping ? 0.5 : 1,
                  transition: "all 150ms",
                }}
              >
                {wiping ? "wiping…" : "wipe_all_data"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default WipeApp;
