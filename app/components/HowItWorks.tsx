import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    step: "01",
    title: "Upload Your Resume",
    description:
      "Drop your PDF resume and paste the job description you're targeting.",
  },
  {
    step: "02",
    title: "AI Analyzes Everything",
    description:
      "Scored across 5 dimensions: ATS compatibility, tone, content, structure, and skills.",
  },
  {
    step: "03",
    title: "Get Actionable Feedback",
    description:
      "Keyword gaps, rewrite suggestions, and interview prep questions — specific to the role.",
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
    <div ref={ref} className="w-full flex flex-col gap-8">
      {!compact && (
        <div className="flex flex-col gap-1 border-b border-[#e5e5e5] pb-6">
          <p className="text-xs font-semibold text-[#525252] uppercase tracking-widest">
            How It Works
          </p>
          <h2
            className="!text-3xl sm:!text-4xl font-normal !text-[#0a0a0a] mt-1"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            Three steps to a better resume
          </h2>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 w-full border border-[#e5e5e5]">
        {STEPS.map((s, i) => (
          <div
            key={s.step}
            className={`flex flex-col gap-4 p-6 sm:p-8 bg-white transition-all duration-700 ${
              i < STEPS.length - 1
                ? "border-b sm:border-b-0 sm:border-r border-[#e5e5e5]"
                : ""
            } ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ transitionDelay: `${i * 120}ms` }}
          >
            <span
              className="text-5xl font-normal text-[#e5e5e5] leading-none"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              {s.step}
            </span>
            <div className="flex flex-col gap-2">
              <h3 className="font-semibold text-[#0a0a0a] text-base">
                {s.title}
              </h3>
              <p className="text-sm text-[#525252] leading-relaxed">
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
