import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { springs } from "~/lib/motion";

type ToastTier = "good" | "warn" | "bad";

interface ToastItem {
  id: string;
  message: string;
  tier: ToastTier;
}

interface ToastCtx {
  show: (message: string, tier?: ToastTier) => void;
}

const ToastContext = createContext<ToastCtx>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const TIER_COLOR: Record<ToastTier, string> = {
  good: "var(--phos-dim)",
  warn: "var(--copper-deep)",
  bad: "var(--ember-dim)",
};

function ToastEntry({
  item,
  onDone,
}: {
  item: ToastItem;
  onDone: (id: string) => void;
}) {
  const [alive, setAlive] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setAlive(false), 2800);
    const t2 = setTimeout(() => onDone(item.id), 3200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [item.id, onDone]);

  return (
    <AnimatePresence>
      {alive && (
        <motion.div
          className="rl-toast"
          initial={{ opacity: 0, x: 40, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.96 }}
          transition={{ ...springs.snappy }}
          style={{ borderLeftColor: TIER_COLOR[item.tier] }}
          layout
        >
          <span
            style={{
              color:
                item.tier === "good"
                  ? "var(--phos)"
                  : item.tier === "warn"
                    ? "var(--copper-hi)"
                    : "var(--ember)",
              fontWeight: 700,
            }}
          >
            {item.tier === "good" ? "✓" : item.tier === "warn" ? "!" : "✕"}
          </span>
          <span>{item.message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);

  const show = useCallback((message: string, tier: ToastTier = "good") => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev.slice(-2), { id, message, tier }]);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <motion.div layout style={{ display: "contents" }}>
        {toasts.map((t) => (
          <ToastEntry key={t.id} item={t} onDone={remove} />
        ))}
      </motion.div>
    </ToastContext.Provider>
  );
}
