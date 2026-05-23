import { useEffect, useRef } from "react";

interface TypedOptions {
  typeSpeed?: number;
  backSpeed?: number;
  backDelay?: number;
  startDelay?: number;
  loop?: boolean;
  showCursor?: boolean;
  cursorChar?: string;
}

export function useTyped(strings: string[], options: TypedOptions = {}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    let typed: { destroy(): void } | null = null;

    import("typed.js").then((m) => {
      const Typed = m.default;
      typed = new Typed(ref.current!, {
        strings,
        typeSpeed: options.typeSpeed ?? 50,
        backSpeed: options.backSpeed ?? 30,
        loop: options.loop ?? true,
        backDelay: options.backDelay ?? 2400,
        startDelay: options.startDelay ?? 700,
        showCursor: options.showCursor ?? true,
        cursorChar: options.cursorChar ?? "_",
      });
    });

    return () => {
      typed?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return ref;
}
