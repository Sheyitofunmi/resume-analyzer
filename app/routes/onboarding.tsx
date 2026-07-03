import { useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { LogoMark } from "~/components/atoms";

export const meta = () => [{ title: "ResumeLens | Onboarding" }];

// ── Step data ──────────────────────────────────────────────────────────
const ROLES = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "Designer",
  "DevOps / SRE",
  "Other",
];

const SENIORITY = [
  { name: "Intern", desc: "Internships and first steps" },
  { name: "Junior", desc: "0–2 years, first roles" },
  { name: "Mid", desc: "2–5 years, owning projects" },
  { name: "Senior", desc: "5–10 years, leading work" },
  { name: "Staff / Principal", desc: "10+ years, running orgs" },
];

const INDUSTRIES = [
  "Fintech",
  "Healthtech",
  "E-commerce",
  "Enterprise SaaS",
  "Gaming",
  "Media",
  "Gov / Nonprofit",
  "Consulting",
];

const GOALS = [
  {
    id: "land_first",
    label: "Land my first offer",
    desc: "I'm actively applying and need a strong baseline.",
  },
  {
    id: "level_up",
    label: "Level up my role",
    desc: "Targeting a promotion or senior title.",
  },
  {
    id: "switch",
    label: "Switch industries",
    desc: "Moving across domains and need keyword parity.",
  },
  {
    id: "passive",
    label: "Passive exploration",
    desc: "Just keeping my resume sharp.",
  },
];

type State = {
  role: string;
  seniority: string;
  industries: string[];
  goal: string;
};

// ── Selectable chip (role, industries) ─────────────────────────────────
function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        border: "var(--bw) solid var(--ink)",
        borderRadius: 999,
        padding: "11px 20px",
        fontSize: 14,
        fontWeight: 800,
        cursor: "pointer",
        userSelect: "none",
        background: selected ? "var(--ink)" : "var(--surface)",
        color: selected ? "#fff" : "var(--ink)",
        fontFamily: "var(--font-sans)",
        transition:
          "box-shadow var(--dur-fast) ease, transform var(--dur-fast) ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "3px 3px 0 var(--ink)";
        e.currentTarget.style.transform = "translate(-1px,-1px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      {label}
    </button>
  );
}

// ── Selectable card (seniority, goal) ──────────────────────────────────
function OptionCard({
  title,
  desc,
  selected,
  onClick,
}: {
  title: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      style={{
        border: "var(--bw) solid var(--ink)",
        borderRadius: 12,
        padding: 20,
        cursor: "pointer",
        userSelect: "none",
        background: selected ? "var(--lime)" : "var(--surface)",
        textAlign: "left",
        fontFamily: "var(--font-sans)",
        transition:
          "box-shadow var(--dur-fast) ease, transform var(--dur-fast) ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "4px 4px 0 var(--ink)";
        e.currentTarget.style.transform = "translate(-2px,-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "none";
      }}
    >
      <div style={{ fontWeight: 900, fontSize: 16, marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 12.5, color: "var(--fg-2)", fontWeight: 600 }}>
        {desc}
      </div>
    </button>
  );
}

const STEPS = [
  {
    label: "role",
    title: "What role are you chasing?",
    sub: "Every score and rewrite gets tuned to this target. You can change it anytime.",
    valid: (s: State) => !!s.role,
  },
  {
    label: "seniority",
    title: "How senior?",
    sub: "Sets the bar for impact — a senior resume gets judged harder on outcomes.",
    valid: (s: State) => !!s.seniority,
  },
  {
    label: "industries",
    title: "Where do you want to work?",
    sub: "Pick every industry you're targeting — keywords differ between them.",
    valid: (s: State) => s.industries.length > 0,
  },
  {
    label: "goal",
    title: "What's the mission?",
    sub: "This shapes the advice you get alongside your scores.",
    valid: (s: State) => !!s.goal,
  },
];

// ── Main screen ────────────────────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();
  const { kv } = usePuterStore();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<State>({
    role: "",
    seniority: "",
    industries: [],
    goal: "",
  });

  const current = STEPS[step];
  const isValid = current.valid(state);
  const isLast = step === STEPS.length - 1;

  const advance = async () => {
    if (!isValid) return;
    if (isLast) {
      await kv.set("onboarding", JSON.stringify(state));
      navigate("/");
    } else {
      setStep((s) => s + 1);
    }
  };

  const toggleIndustry = (ind: string) => {
    const next = state.industries.includes(ind)
      ? state.industries.filter((i) => i !== ind)
      : [...state.industries, ind];
    setState({ ...state, industries: next });
  };

  return (
    <main
      id="main-content"
      style={{ minHeight: "100vh", background: "var(--page)" }}
    >
      {/* Top bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px var(--gutter)",
          borderBottom: "var(--bw) solid var(--ink)",
          background: "var(--surface)",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            fontWeight: 900,
            fontSize: 16,
          }}
        >
          <LogoMark size={19} />
          ResumeLens
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.1em",
            color: "var(--fg-2)",
          }}
        >
          SETUP · STEP {step + 1} OF {STEPS.length}
        </span>
      </div>

      <div
        style={{ maxWidth: 660, margin: "0 auto", padding: "56px 32px 80px" }}
      >
        {/* Segmented progress */}
        <div style={{ display: "flex", gap: 8, marginBottom: 44 }}>
          {STEPS.map((s, i) => (
            <span
              key={s.label}
              style={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                border: "var(--bw) solid var(--ink)",
                background: i <= step ? "var(--lime)" : "var(--surface)",
                transition: "background var(--dur-base) ease",
              }}
            />
          ))}
        </div>

        <h1
          style={{
            fontWeight: 900,
            fontSize: 38,
            letterSpacing: "-0.03em",
            margin: "0 0 10px",
          }}
        >
          {current.title}
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "var(--fg-2)",
            fontWeight: 500,
            margin: "0 0 30px",
          }}
        >
          {current.sub}
        </p>

        {step === 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 34,
            }}
          >
            {ROLES.map((r) => (
              <Chip
                key={r}
                label={r}
                selected={state.role === r}
                onClick={() => setState({ ...state, role: r })}
              />
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="g-halves" style={{ gap: 12, marginBottom: 34 }}>
            {SENIORITY.map((l) => (
              <OptionCard
                key={l.name}
                title={l.name}
                desc={l.desc}
                selected={state.seniority === l.name}
                onClick={() => setState({ ...state, seniority: l.name })}
              />
            ))}
          </div>
        )}

        {step === 2 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 34,
            }}
          >
            {INDUSTRIES.map((ind) => (
              <Chip
                key={ind}
                label={ind}
                selected={state.industries.includes(ind)}
                onClick={() => toggleIndustry(ind)}
              />
            ))}
          </div>
        )}

        {step === 3 && (
          <>
            <div className="g-halves" style={{ gap: 12, marginBottom: 24 }}>
              {GOALS.map((g) => (
                <OptionCard
                  key={g.id}
                  title={g.label}
                  desc={g.desc}
                  selected={state.goal === g.id}
                  onClick={() => setState({ ...state, goal: g.id })}
                />
              ))}
            </div>
            {isValid && (
              <div
                className="pop-in"
                style={{
                  border: "var(--bw) solid var(--ink)",
                  borderRadius: 14,
                  background: "var(--cyan)",
                  padding: 26,
                  marginBottom: 34,
                }}
              >
                <div
                  className="eyebrow eyebrow--ink"
                  style={{ fontSize: 10, marginBottom: 10 }}
                >
                  YOUR TARGET
                </div>
                <div
                  style={{
                    fontWeight: 900,
                    fontSize: 26,
                    letterSpacing: "-0.02em",
                    marginBottom: 4,
                  }}
                >
                  {state.role}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>
                  {state.seniority} · scored on 5 dimensions
                </div>
              </div>
            )}
          </>
        )}

        {/* Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              style={{
                fontSize: 14,
                fontWeight: 800,
                cursor: step === 0 ? "default" : "pointer",
                userSelect: "none",
                color: step === 0 ? "#D8DDD8" : "var(--ink)",
                background: "none",
                border: "none",
                fontFamily: "var(--font-sans)",
                padding: 0,
              }}
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              style={{
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                color: "var(--fg-3)",
                background: "none",
                border: "none",
                fontFamily: "var(--font-sans)",
                padding: 0,
              }}
            >
              Skip for now
            </button>
          </div>

          {isLast ? (
            <button
              type="button"
              onClick={advance}
              disabled={!isValid}
              className="btn btn--lime"
              style={{ fontWeight: 900, padding: "14px 30px" }}
            >
              Finish setup ▸
            </button>
          ) : (
            <button
              type="button"
              onClick={advance}
              disabled={!isValid}
              className="btn btn--primary"
              style={{ padding: "14px 30px" }}
            >
              Continue →
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
