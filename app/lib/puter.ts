import { create } from "zustand";
import {
  demoFeedback,
  prepareAtsInstructions,
  prepareWritingInstructions,
} from "../../constants";
import type { JobContext } from "../../constants";
import { extractJSON, mergeFeedbackHalves } from "~/lib/utils";

declare global {
  interface Window {
    puter: {
      auth: {
        getUser: () => Promise<PuterUser>;
        isSignedIn: () => Promise<boolean>;
        signIn: () => Promise<void>;
        signOut: () => Promise<void>;
      };
      fs: {
        write: (
          path: string,
          data: string | File | Blob,
        ) => Promise<FSItem | undefined>;
        read: (path: string) => Promise<Blob>;
        upload: (file: File[] | Blob[]) => Promise<FSItem>;
        delete: (path: string) => Promise<void>;
        readdir: (path: string) => Promise<FSItem[] | undefined>;
      };
      ai: {
        chat: (
          prompt: string | ChatMessage[],
          imageURL?: string | PuterChatOptions,
          testMode?: boolean,
          options?: PuterChatOptions,
        ) => Promise<Object>;
        img2txt: (
          image: string | File | Blob,
          testMode?: boolean,
        ) => Promise<string>;
      };
      kv: {
        get: (key: string) => Promise<string | null>;
        set: (key: string, value: string) => Promise<boolean>;
        del: (key: string) => Promise<boolean>;
        list: (pattern: string, returnValues?: boolean) => Promise<string[]>;
        flush: () => Promise<boolean>;
      };
    };
  }
}

/**
 * Why the last analysis fell back to `demoFeedback`. `null` means the scores
 * came from the model. Lets the UI say "the service timed out" instead of
 * silently presenting canned numbers as a real result.
 */
export type FeedbackFallbackReason =
  | "unavailable" // Puter.js never loaded
  | "timeout" // queued or stalled past the deadline
  | "error" // the call threw
  | "empty" // the stream closed without producing text
  | null;

interface PuterStore {
  isLoading: boolean;
  error: string | null;
  puterReady: boolean;
  isUsingDemoFeedback: boolean;
  feedbackFallbackReason: FeedbackFallbackReason;
  auth: {
    user: PuterUser | null;
    isAuthenticated: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    checkAuthStatus: () => Promise<boolean>;
    getUser: () => PuterUser | null;
  };
  fs: {
    write: (
      path: string,
      data: string | File | Blob,
    ) => Promise<FSItem | undefined>;
    read: (path: string) => Promise<Blob | undefined>;
    upload: (file: File[] | Blob[]) => Promise<FSItem | undefined>;
    delete: (path: string) => Promise<void>;
    readDir: (path: string) => Promise<FSItem[] | undefined>;
  };
  ai: {
    chat: (
      prompt: string | ChatMessage[],
      imageURL?: string | PuterChatOptions,
      testMode?: boolean,
      options?: PuterChatOptions,
    ) => Promise<AIResponse | undefined>;
    feedback: (
      path: string,
      job: JobContext,
      onProgress?: (fraction: number) => void,
    ) => Promise<AIResponse | undefined>;
    feedbackFromText: (
      resumeText: string,
      job: JobContext,
      onProgress?: (fraction: number) => void,
    ) => Promise<AIResponse | undefined>;
    img2txt: (
      image: string | File | Blob,
      testMode?: boolean,
    ) => Promise<string | undefined>;
    interviewQuestions: (
      jobTitle: string,
      jobDescription: string,
      improveTips: string[],
    ) => Promise<InterviewQuestion[] | undefined>;
    rewriteSuggestions: (
      jobTitle: string,
      improveTips: { tip: string; explanation: string }[],
    ) => Promise<RewriteSuggestion[] | undefined>;
  };
  kv: {
    get: (key: string) => Promise<string | null | undefined>;
    set: (key: string, value: string) => Promise<boolean | undefined>;
    delete: (key: string) => Promise<boolean | undefined>;
    list: (
      pattern: string,
      returnValues?: boolean,
    ) => Promise<string[] | KVItem[] | undefined>;
    flush: () => Promise<boolean | undefined>;
  };

  init: () => void;
  clearError: () => void;
}

const getPuter = (): typeof window.puter | null =>
  typeof window !== "undefined" && window.puter ? window.puter : null;

// A synchronous hint about whether this browser has ever completed a sign-in.
// Puter.js takes a network round trip to answer that, so `/` uses this to
// decide what to paint first instead of stalling on a loading screen.
const RETURNING_KEY = "rl:returning";

export const hasSignedInBefore = (): boolean => {
  try {
    return localStorage.getItem(RETURNING_KEY) === "1";
  } catch {
    return false;
  }
};

const rememberSignedIn = (value: boolean) => {
  try {
    if (value) localStorage.setItem(RETURNING_KEY, "1");
    else localStorage.removeItem(RETURNING_KEY);
  } catch {
    /* private mode / storage disabled — the hint is optional */
  }
};

export const usePuterStore = create<PuterStore>((set, get) => {
  // Merge a partial auth patch, preserving the stable action references.
  const patchAuth = (patch: Partial<PuterStore["auth"]>) =>
    set((s) => ({ auth: { ...s.auth, ...patch } }));

  const setError = (msg: string) => {
    set({ error: msg, isLoading: false });
    patchAuth({ user: null, isAuthenticated: false, getUser: () => null });
  };

  const checkAuthStatus = async (): Promise<boolean> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      const isSignedIn = await puter.auth.isSignedIn();
      rememberSignedIn(isSignedIn);
      if (isSignedIn) {
        const user = await puter.auth.getUser();
        patchAuth({ user, isAuthenticated: true, getUser: () => user });
        set({ isLoading: false });
        return true;
      } else {
        patchAuth({ user: null, isAuthenticated: false, getUser: () => null });
        set({ isLoading: false });
        return false;
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to check auth status";
      setError(msg);
      return false;
    }
  };

  const signIn = async (): Promise<void> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await puter.auth.signIn();
      await checkAuthStatus();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      setError(msg);
    }
  };

  const signOut = async (): Promise<void> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      await puter.auth.signOut();
      rememberSignedIn(false);
      patchAuth({ user: null, isAuthenticated: false, getUser: () => null });
      set({ isLoading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign out failed";
      setError(msg);
    }
  };

  const refreshUser = async (): Promise<void> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const user = await puter.auth.getUser();
      patchAuth({ user, isAuthenticated: true, getUser: () => user });
      set({ isLoading: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to refresh user";
      setError(msg);
    }
  };

  const init = (): void => {
    if (getPuter()) {
      set({ puterReady: true });
      checkAuthStatus();
      return;
    }

    let attempts = 0;
    const maxAttempts = 100; // 10 s at 100 ms

    const interval = setInterval(() => {
      attempts++;
      if (getPuter()) {
        clearInterval(interval);
        set({ puterReady: true });
        checkAuthStatus();
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
        setError("Puter.js failed to load. Please refresh the page.");
      }
    }, 100);
  };

  // Run `fn` with the loaded Puter instance, or set an error and return
  // undefined if it isn't available. Collapses the repeated guard clause.
  const withPuter = <T>(
    fn: (puter: NonNullable<ReturnType<typeof getPuter>>) => T,
  ): T | undefined => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return undefined;
    }
    return fn(puter);
  };

  const write = async (path: string, data: string | File | Blob) =>
    withPuter((p) => p.fs.write(path, data));

  const readDir = async (path: string) => withPuter((p) => p.fs.readdir(path));

  const readFile = async (path: string) => withPuter((p) => p.fs.read(path));

  const upload = async (files: File[] | Blob[]) =>
    withPuter((p) => p.fs.upload(files));

  const deleteFile = async (path: string) =>
    withPuter((p) => p.fs.delete(path));

  const chat = async (
    prompt: string | ChatMessage[],
    imageURL?: string | PuterChatOptions,
    testMode?: boolean,
    options?: PuterChatOptions,
  ) =>
    withPuter(
      (p) =>
        p.ai.chat(prompt, imageURL, testMode, options) as Promise<
          AIResponse | undefined
        >,
    );

  // Shared streaming analysis: takes the message `content` payload (image+text
  // or text-only), streams the AI response, and falls back to demo feedback if
  // the model returns nothing or errors.
  const demoResponse = () =>
    ({
      message: { content: JSON.stringify(demoFeedback) },
    }) as unknown as AIResponse;

  const useDemo = (reason: FeedbackFallbackReason) => {
    set({ isUsingDemoFeedback: true, feedbackFallbackReason: reason });
    return demoResponse();
  };

  // Puter can queue a request indefinitely on a busy tier. Bound both the wait
  // for the first token and the whole response so a stalled call surfaces as a
  // timeout instead of an unbounded spinner.
  const FIRST_CHUNK_TIMEOUT_MS = 45_000;
  const OVERALL_TIMEOUT_MS = 150_000;

  const withDeadline = <T>(promise: Promise<T>, ms: number): Promise<T> => {
    let timer: ReturnType<typeof setTimeout>;
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("__timeout__")), ms);
      }),
    ]).finally(() => clearTimeout(timer)) as Promise<T>;
  };

  /**
   * Streams one analysis call to completion. Resolves to the raw text, or to
   * `null` if it failed — in which case `feedbackFallbackReason` says why.
   * `onDelta` reports characters received so callers can show real progress.
   */
  const streamOnce = async (
    content: ChatMessageContent[],
    instructions: string,
    onDelta?: (chars: number) => void,
  ): Promise<string | null> => {
    const puter = getPuter();
    if (!puter) {
      set({ feedbackFallbackReason: "unavailable" });
      return null;
    }

    let text = "";
    try {
      const startedAt = Date.now();
      const stream = await withDeadline(
        puter.ai.chat(
          [
            {
              role: "user",
              content: [...content, { type: "text", text: instructions }],
            },
          ],
          { model: "claude-sonnet-4-6", stream: true },
        ) as unknown as Promise<AsyncIterable<{ text?: string }>>,
        FIRST_CHUNK_TIMEOUT_MS,
      );

      // Iterate manually so each `next()` can carry its own deadline: a tight
      // one until the model starts talking, then the remaining overall budget.
      const iterator = stream[Symbol.asyncIterator]();
      for (;;) {
        const remaining = OVERALL_TIMEOUT_MS - (Date.now() - startedAt);
        if (remaining <= 0) throw new Error("__timeout__");
        const budget = text
          ? remaining
          : Math.min(FIRST_CHUNK_TIMEOUT_MS, remaining);

        const { value, done } = await withDeadline(iterator.next(), budget);
        if (done) break;
        if (value?.text) {
          text += value.text;
          onDelta?.(value.text.length);
        }
      }

      if (!text) {
        set({ feedbackFallbackReason: "empty" });
        return null;
      }
      return text;
    } catch (err) {
      const timedOut = err instanceof Error && err.message === "__timeout__";
      // A timeout after partial output still leaves truncated, unparseable
      // JSON, so both cases fail — but the caller can tell them apart.
      set({ feedbackFallbackReason: timedOut ? "timeout" : "error" });
      return null;
    }
  };

  // Rough size of a complete two-part response, used only to turn characters
  // received into a progress fraction. Being off just makes the bar move a
  // little fast or slow; it is clamped either way.
  const EXPECTED_RESPONSE_CHARS = 2800;

  /**
   * Runs the two halves of the analysis concurrently and stitches them into
   * one `Feedback` object. Two smaller responses stream in parallel, so the
   * user waits on the slower half rather than on the sum of both.
   */
  const streamSplitFeedback = async (
    content: ChatMessageContent[],
    job: JobContext,
    onProgress?: (fraction: number) => void,
  ): Promise<AIResponse> => {
    if (!getPuter()) return useDemo("unavailable");

    let charsSoFar = 0;
    const report = onProgress
      ? (chars: number) => {
          charsSoFar += chars;
          // Hold just short of full until both halves have actually landed.
          onProgress(Math.min(0.95, charsSoFar / EXPECTED_RESPONSE_CHARS));
        }
      : undefined;

    set({ feedbackFallbackReason: null });
    const [atsText, writingText] = await Promise.all([
      streamOnce(content, prepareAtsInstructions(job), report),
      streamOnce(content, prepareWritingInstructions(job), report),
    ]);

    // Either half missing leaves an incomplete report, so fall back wholesale.
    if (!atsText || !writingText) {
      return useDemo(get().feedbackFallbackReason ?? "error");
    }

    const merged = mergeFeedbackHalves(atsText, writingText);
    // Both halves streamed fine but the shape is unusable.
    if (!merged) return useDemo("error");

    onProgress?.(1);
    set({ isUsingDemoFeedback: false, feedbackFallbackReason: null });
    return {
      message: { content: JSON.stringify(merged) },
    } as unknown as AIResponse;
  };

  const feedback = async (
    imagePath: string,
    job: JobContext,
    onProgress?: (fraction: number) => void,
  ) => {
    if (!getPuter()) {
      setError("Puter.js not available");
      return;
    }
    return streamSplitFeedback(
      [{ type: "file", puter_path: imagePath }],
      job,
      onProgress,
    );
  };

  const feedbackFromText = async (
    resumeText: string,
    job: JobContext,
    onProgress?: (fraction: number) => void,
  ) => {
    if (!getPuter()) {
      setError("Puter.js not available");
      return;
    }
    return streamSplitFeedback(
      [{ type: "text", text: `RESUME TEXT:\n${resumeText}` }],
      job,
      onProgress,
    );
  };

  const interviewQuestions = async (
    jobTitle: string,
    jobDescription: string,
    improveTips: string[],
  ): Promise<InterviewQuestion[] | undefined> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    try {
      const prompt = `You are a hiring expert preparing a candidate for a job interview.
Job title: ${jobTitle}
Job description (summary): ${jobDescription.slice(0, 400)}
Resume weaknesses to focus on: ${improveTips.slice(0, 3).join("; ")}

Generate exactly 5 likely interview questions the candidate should prepare for.
For each question provide: category (one of "behavioral", "technical", "situational", "role-specific") and question.
Return as a JSON array only, no other text, no backticks. Example: [{"category":"behavioral","question":"..."}]`;

      const response = (await puter.ai.chat(prompt)) as AIResponse;
      const text =
        typeof response.message.content === "string"
          ? response.message.content
          : response.message.content[0].text;
      return JSON.parse(extractJSON(text)) as InterviewQuestion[];
    } catch {
      return undefined;
    }
  };

  const rewriteSuggestions = async (
    jobTitle: string,
    improveTips: { tip: string; explanation: string }[],
  ): Promise<RewriteSuggestion[] | undefined> => {
    const puter = getPuter();
    if (!puter) {
      setError("Puter.js not available");
      return;
    }
    try {
      const weaknesses = improveTips
        .slice(0, 4)
        .map((t) => `• ${t.tip}: ${t.explanation}`)
        .join("\n");
      const prompt = `You are a professional resume writer.
Role being applied for: ${jobTitle}
Resume weaknesses identified:
${weaknesses}

Provide exactly 3 concrete rewrite examples showing how to fix these weaknesses.
For each example: weak (the poor version), strong (the improved version), why (one sentence explaining the improvement).
Return as a JSON array only, no other text, no backticks. Example: [{"weak":"...","strong":"...","why":"..."}]`;

      const response = (await puter.ai.chat(prompt)) as AIResponse;
      const text =
        typeof response.message.content === "string"
          ? response.message.content
          : response.message.content[0].text;
      return JSON.parse(extractJSON(text)) as RewriteSuggestion[];
    } catch {
      return undefined;
    }
  };

  const img2txt = async (image: string | File | Blob, testMode?: boolean) =>
    withPuter((p) => p.ai.img2txt(image, testMode));

  const getKV = async (key: string) => withPuter((p) => p.kv.get(key));

  const setKV = async (key: string, value: string) =>
    withPuter((p) => p.kv.set(key, value));

  const deleteKV = async (key: string) => withPuter((p) => p.kv.del(key));

  const listKV = async (pattern: string, returnValues = false) =>
    withPuter((p) => p.kv.list(pattern, returnValues));

  const flushKV = async () => withPuter((p) => p.kv.flush());

  return {
    isLoading: true,
    error: null,
    puterReady: false,
    isUsingDemoFeedback: false,
    feedbackFallbackReason: null,
    auth: {
      user: null,
      isAuthenticated: false,
      signIn,
      signOut,
      refreshUser,
      checkAuthStatus,
      getUser: () => get().auth.user,
    },
    fs: {
      write: (path: string, data: string | File | Blob) => write(path, data),
      read: (path: string) => readFile(path),
      readDir: (path: string) => readDir(path),
      upload: (files: File[] | Blob[]) => upload(files),
      delete: (path: string) => deleteFile(path),
    },
    ai: {
      chat: (
        prompt: string | ChatMessage[],
        imageURL?: string | PuterChatOptions,
        testMode?: boolean,
        options?: PuterChatOptions,
      ) => chat(prompt, imageURL, testMode, options),
      feedback: (
        path: string,
        job: JobContext,
        onProgress?: (fraction: number) => void,
      ) => feedback(path, job, onProgress),
      feedbackFromText: (
        resumeText: string,
        job: JobContext,
        onProgress?: (fraction: number) => void,
      ) => feedbackFromText(resumeText, job, onProgress),
      img2txt: (image: string | File | Blob, testMode?: boolean) =>
        img2txt(image, testMode),
      interviewQuestions: (
        jobTitle: string,
        jobDescription: string,
        improveTips: string[],
      ) => interviewQuestions(jobTitle, jobDescription, improveTips),
      rewriteSuggestions: (
        jobTitle: string,
        improveTips: { tip: string; explanation: string }[],
      ) => rewriteSuggestions(jobTitle, improveTips),
    },
    kv: {
      get: (key: string) => getKV(key),
      set: (key: string, value: string) => setKV(key, value),
      delete: (key: string) => deleteKV(key),
      list: (pattern: string, returnValues?: boolean) =>
        listKV(pattern, returnValues),
      flush: () => flushKV(),
    },
    init,
    clearError: () => set({ error: null }),
  };
});
