import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { LogoMark } from "~/components/atoms";

export const meta = () => [{ title: "ResumeLens | Wipe Data" }];

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
          background: "var(--page)",
        }}
      >
        <span
          className="pix-blink"
          style={{
            width: 16,
            height: 16,
            background: "var(--cyan)",
            border: "var(--bw) solid var(--ink)",
            borderRadius: 4,
            display: "inline-block",
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
          background: "var(--page)",
          padding: 16,
        }}
      >
        <div
          className="card card--pop"
          style={{
            maxWidth: 420,
            width: "100%",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
          }}
        >
          <p
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              color: "var(--red)",
              margin: 0,
            }}
          >
            {error}
          </p>
          <button onClick={clearError} className="btn btn--outline btn--sm">
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
        background: "var(--page)",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "var(--bw) solid var(--red)",
          borderRadius: "var(--r-card)",
          padding: 32,
          width: "100%",
          maxWidth: 460,
          display: "flex",
          flexDirection: "column",
          gap: 24,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 12,
            }}
          >
            <LogoMark size={18} />
            <span
              className="chip"
              style={{ background: "var(--red)", color: "#fff" }}
            >
              Danger zone
            </span>
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 900,
              letterSpacing: "-0.02em",
              color: "var(--red)",
              margin: "0 0 4px",
            }}
          >
            Wipe all data
          </h1>
          <p
            style={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--fg-2)",
              margin: 0,
            }}
          >
            Signed in as{" "}
            <span style={{ color: "var(--ink)", fontWeight: 800 }}>
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
            <span
              aria-hidden="true"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--lime)",
                border: "var(--bw) solid var(--ink)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 16,
              }}
            >
              ✓
            </span>
            <p style={{ fontSize: 14, fontWeight: 800, margin: 0 }}>
              All data wiped successfully.
            </p>
            <Link to="/" className="btn btn--primary btn--sm">
              Go to dashboard →
            </Link>
          </div>
        ) : (
          <>
            <div>
              <p className="eyebrow" style={{ margin: "0 0 8px" }}>
                FILES ({files.length})
              </p>
              {files.length === 0 ? (
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--fg-3)",
                    margin: 0,
                  }}
                >
                  No files found.
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
                        background: "var(--fill-1)",
                        border: "1px solid var(--line)",
                        borderRadius: 6,
                        fontFamily: "var(--font-mono)",
                        fontSize: 11,
                        color: "var(--fg-2)",
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
                background: "var(--fill-1)",
                border: "1.5px dashed var(--red)",
                borderRadius: 12,
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "var(--fg-2)",
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                This permanently deletes every uploaded resume and analysis.
                Type{" "}
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    color: "var(--red)",
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
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.1em",
                }}
              />
              <button
                onClick={handleDelete}
                disabled={confirmText !== CONFIRM_WORD || wiping}
                className="btn btn--danger"
                style={{
                  background:
                    confirmText === CONFIRM_WORD && !wiping
                      ? "var(--red)"
                      : undefined,
                  color:
                    confirmText === CONFIRM_WORD && !wiping
                      ? "#fff"
                      : undefined,
                }}
              >
                {wiping ? "Wiping…" : "Wipe all data"}
              </button>
            </div>

            <Link
              to="/settings"
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "var(--fg-2)",
                textDecoration: "none",
                alignSelf: "center",
              }}
            >
              ← Back to settings
            </Link>
          </>
        )}
      </div>
    </main>
  );
};

export default WipeApp;
