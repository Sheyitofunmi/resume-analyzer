import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    step: "01",
    icon: "📄",
    title: "Upload Your Resume",
    description:
      "Drop your PDF resume and paste the job description you're targeting.",
    gradient: "from-indigo-50 to-blue-50",
    accent: "text-indigo-600",
    border: "border-indigo-100",
    dot: "bg-indigo-500",
  },
  {
    step: "02",
    icon: "🤖",
    title: "AI Analyzes Everything",
    description:
      "Our AI scores your resume across 5 key dimensions: ATS, tone, content, structure, and skills.",
    gradient: "from-purple-50 to-indigo-50",
    accent: "text-purple-600",
    border: "border-purple-100",
    dot: "bg-purple-500",
  },
  {
    step: "03",
    icon: "✨",
    title: "Get Actionable Feedback",
    description:
      "Receive specific tips, keyword gaps, rewrite suggestions, and interview prep questions.",
    gradient: "from-rose-50 to-purple-50",
    accent: "text-rose-500",
    border: "border-rose-100",
    dot: "bg-rose-500",
  },
];

const HowItWorks = ({ compact = false }: { compact?: boolean }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="w-full flex flex-col gap-6">
      {!compact && (
        <div className="text-center flex flex-col gap-1">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-widest">
            How It Works
          </p>
          <h2 className="!text-2xl sm:!text-3xl font-bold !text-gray-800">
            Three steps to a better resume
          </h2>
        </div>
      )}

      <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
        {/* connector line desktop */}
        <div className="hidden sm:block absolute top-8 left-[calc(16.67%+12px)] right-[calc(16.67%+12px)] h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-rose-200 z-0" />

        {STEPS.map((s, i) => (
          <div
            key={s.step}
            className={`relative z-10 flex flex-col gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-br ${s.gradient} border ${s.border} transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-xl flex-shrink-0`}
              >
                {s.icon}
              </div>
              <span
                className={`text-xs font-bold ${s.accent} bg-white/80 px-2.5 py-1 rounded-full border ${s.border}`}
              >
                STEP {s.step}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="font-bold text-gray-800 text-sm sm:text-base">
                {s.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                {s.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
