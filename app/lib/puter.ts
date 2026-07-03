import { create } from "zustand";
import { demoFeedback } from "../../constants";
import { extractJSON } from "~/lib/utils";

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

interface PuterStore {
  isLoading: boolean;
  error: string | null;
  puterReady: boolean;
  isUsingDemoFeedback: boolean;
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
      message: string,
      onChunk?: (accumulated: string) => void,
    ) => Promise<AIResponse | undefined>;
    feedbackFromText: (
      resumeText: string,
      message: string,
      onChunk?: (accumulated: string) => void,
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

  const streamFeedback = async (
    content: ChatMessageContent[],
    onChunk?: (accumulated: string) => void,
  ): Promise<AIResponse> => {
    const puter = getPuter();
    if (!puter) {
      set({ isUsingDemoFeedback: true });
      return demoResponse();
    }
    try {
      const stream = await (puter.ai.chat([{ role: "user", content }], {
        model: "claude-sonnet-4-6",
        stream: true,
      }) as unknown as Promise<AsyncIterable<{ text?: string }>>);

      let text = "";
      for await (const part of stream) {
        if (part?.text) {
          text += part.text;
          onChunk?.(text);
        }
      }

      if (!text) {
        set({ isUsingDemoFeedback: true });
        return demoResponse();
      }

      set({ isUsingDemoFeedback: false });
      return { message: { content: text } } as unknown as AIResponse;
    } catch {
      set({ isUsingDemoFeedback: true });
      return demoResponse();
    }
  };

  const feedback = async (
    imagePath: string,
    message: string,
    onChunk?: (accumulated: string) => void,
  ) => {
    if (!getPuter()) {
      setError("Puter.js not available");
      return;
    }
    return streamFeedback(
      [
        { type: "file", puter_path: imagePath },
        { type: "text", text: message },
      ],
      onChunk,
    );
  };

  const feedbackFromText = async (
    resumeText: string,
    message: string,
    onChunk?: (accumulated: string) => void,
  ) => {
    if (!getPuter()) {
      setError("Puter.js not available");
      return;
    }
    return streamFeedback(
      [{ type: "text", text: `RESUME TEXT:\n${resumeText}\n\n${message}` }],
      onChunk,
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
        message: string,
        onChunk?: (accumulated: string) => void,
      ) => feedback(path, message, onChunk),
      feedbackFromText: (
        resumeText: string,
        message: string,
        onChunk?: (accumulated: string) => void,
      ) => feedbackFromText(resumeText, message, onChunk),
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
