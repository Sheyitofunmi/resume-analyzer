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
      <main className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-[#e5e5e5] border-t-[#0a0a0a] animate-spin" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-md text-center flex flex-col gap-4">
          <p className="text-red-600 font-medium">{error}</p>
          <button onClick={clearError} className="primary-button w-fit mx-auto">
            Dismiss
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md flex flex-col gap-6">
        <div>
          <h1 className="!text-2xl !font-bold text-red-600 mb-1">
            Wipe All Data
          </h1>
          <p className="text-sm text-gray-500">
            Signed in as{" "}
            <span className="font-semibold text-gray-700">
              {auth.user?.username}
            </span>
          </p>
        </div>

        {done ? (
          <div className="flex flex-col gap-4 items-center text-center">
            <p className="text-green-700 font-semibold">
              All data wiped successfully.
            </p>
            <a href="/" className="primary-button w-fit px-6">
              Go to Dashboard
            </a>
          </div>
        ) : (
          <>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">
                Files ({files.length})
              </p>
              {files.length === 0 ? (
                <p className="text-sm text-gray-400">No files found.</p>
              ) : (
                <ul className="flex flex-col gap-1 max-h-48 overflow-y-auto text-sm text-gray-600">
                  {files.map((f) => (
                    <li
                      key={f.id}
                      className="px-3 py-1.5 bg-gray-50 rounded-lg truncate"
                    >
                      {f.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-sm text-red-700">
                This will permanently delete all uploaded resumes and analysis
                data. Type{" "}
                <strong className="font-mono tracking-wider">
                  {CONFIRM_WORD}
                </strong>{" "}
                to confirm.
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                placeholder={CONFIRM_WORD}
                className="font-mono text-sm text-red-800 border border-red-200 bg-white rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-400"
                aria-label="Type DELETE to confirm"
              />
              <button
                onClick={handleDelete}
                disabled={confirmText !== CONFIRM_WORD || wiping}
                className="bg-red-600 text-white rounded-full px-6 py-2 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-red-700 transition-colors"
              >
                {wiping ? "Wiping…" : "Wipe All Data"}
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default WipeApp;
