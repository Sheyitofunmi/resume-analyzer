import { useState } from "react";
import { useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
import { Corners, Cursor, Eyebrow } from "~/components/atoms";

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

const SENIORITY = ["intern", "junior", "mid", "senior", "staff / principal"];

const INDUSTRIES = [
  "fintech",
  "healthtech",
  "e-commerce",
  "enterprise SaaS",
  "gaming",
  "media",
  "gov / nonprofit",
  "consulting",
];

const GOALS = [
  {
    id: "land_first",
    label: "land my first offer",
    desc: "I'm actively applying and need a strong baseline.",
  },
  {
    id: "level_up",
    label: "level up my role",
    desc: "Targeting a promotion or senior title.",
  },
  {
    id: "switch",
    label: "switch industries",
    desc: "Moving across domains and need keyword parity.",
  },
  {
    id: "passive",
    label: "passive exploration",
    desc: "Just keeping my resume sharp.",
  },
];

type State = {
  role: string;
  seniority: string;
  industries: string[];
  goal: string;
};

// ── Sub-components ─────────────────────────────────────────────────────
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
      className={`rl-btn ${selected ? "rl-btn-copper" : "rl-btn-secondary"}`}
      style={{ fontSize: 12, padding: "6px 14px" }}
    >
      {selected ? "◆ " : ""}
      {label}
    </button>
  );
}

function GoalCard({
  goal,
  selected,
  onClick,
}: {
  goal: (typeof GOALS)[0];
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: selected ? "rgba(196,123,74,0.08)" : "var(--surface)",
        border: `1px solid ${selected ? "var(--copper)" : "var(--border)"}`,
        borderRadius: "var(--radius-md)",
        padding: "14px 16px",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        transition: "all var(--dur-fast)",
        position: "relative",
      }}
    >
      {selected && (
        <span
          style={{
            position: "absolute",
            top: 10,
            right: 12,
            color: "var(--copper)",
            fontSize: 14,
          }}
        >
          ◆
        </span>
      )}
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 13,
          color: selected ? "var(--copper-hi)" : "var(--fg-1)",
          fontWeight: 500,
        }}
      >
        {goal.label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 12,
          color: "var(--fg-3)",
          lineHeight: 1.5,
        }}
      >
        {goal.desc}
      </span>
    </button>
  );
}

// ── Step components ────────────────────────────────────────────────────
function StepRole({
  state,
  setState,
}: {
  state: State;
  setState: (s: State) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--fg-2)",
          margin: 0,
        }}
      >
        What's your primary role?
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {ROLES.map((r) => (
          <Chip
            key={r}
            label={r}
            selected={state.role === r}
            onClick={() => setState({ ...state, role: r })}
          />
        ))}
      </div>
    </div>
  );
}

function StepSeniority({
  state,
  setState,
}: {
  state: State;
  setState: (s: State) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--fg-2)",
          margin: 0,
        }}
      >
        What's your seniority level?
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {SENIORITY.map((s) => (
          <Chip
            key={s}
            label={s}
            selected={state.seniority === s}
            onClick={() => setState({ ...state, seniority: s })}
          />
        ))}
      </div>
    </div>
  );
}

function StepIndustries({
  state,
  setState,
}: {
  state: State;
  setState: (s: State) => void;
}) {
  const toggle = (ind: string) => {
    const next = state.industries.includes(ind)
      ? state.industries.filter((i) => i !== ind)
      : [...state.industries, ind];
    setState({ ...state, industries: next });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--fg-2)",
          margin: 0,
        }}
      >
        Which industries are you targeting? (select all that apply)
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {INDUSTRIES.map((ind) => (
          <Chip
            key={ind}
            label={ind}
            selected={state.industries.includes(ind)}
            onClick={() => toggle(ind)}
          />
        ))}
      </div>
    </div>
  );
}

function StepGoal({
  state,
  setState,
}: {
  state: State;
  setState: (s: State) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--fg-2)",
          margin: 0,
        }}
      >
        What's your primary goal right now?
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {GOALS.map((g) => (
          <GoalCard
            key={g.id}
            goal={g}
            selected={state.goal === g.id}
            onClick={() => setState({ ...state, goal: g.id })}
          />
        ))}
      </div>
    </div>
  );
}

const STEPS = [
  { label: "role", title: "what do you do_", valid: (s: State) => !!s.role },
  {
    label: "seniority",
    title: "how senior are you_",
    valid: (s: State) => !!s.seniority,
  },
  {
    label: "industries",
    title: "where do you want to work_",
    valid: (s: State) => s.industries.length > 0,
  },
  {
    label: "goal",
    title: "what's the mission_",
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

  return (
    <main
      className="rl-page"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-8)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 640,
          display: "flex",
          flexDirection: "column",
          gap: 32,
        }}
      >
        {/* Stepper */}
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {STEPS.map((s, i) => (
            <div
              key={s.label}
              style={{ display: "flex", alignItems: "center", flex: 1 }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background:
                      i < step
                        ? "var(--phos)"
                        : i === step
                          ? "var(--surface-2)"
                          : "var(--surface)",
                    border: `1px solid ${i <= step ? "var(--phos)" : "var(--border)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    fontWeight: 700,
                    color:
                      i < step
                        ? "var(--bg)"
                        : i === step
                          ? "var(--phos)"
                          : "var(--fg-4)",
                  }}
                >
                  {i < step ? "✓" : `0${i + 1}`}
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    color: i === step ? "var(--fg-2)" : "var(--fg-4)",
                    letterSpacing: "0.08em",
                  }}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    background: i < step ? "var(--phos-dim)" : "var(--border)",
                    margin: "0 4px",
                    marginBottom: 20,
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div
          className="rl-card is-raised rl-fade-in"
          style={{ position: "relative" }}
          key={step}
        >
          <Corners />
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div>
              <Eyebrow mode="prompt">step_0{step + 1} / 04</Eyebrow>
              <h2
                style={{
                  marginTop: 8,
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(22px, 4vw, 32px)",
                  color: "var(--fg-1)",
                  fontWeight: 500,
                }}
              >
                {current.title}
                <Cursor />
              </h2>
            </div>

            {step === 0 && <StepRole state={state} setState={setState} />}
            {step === 1 && <StepSeniority state={state} setState={setState} />}
            {step === 2 && <StepIndustries state={state} setState={setState} />}
            {step === 3 && <StepGoal state={state} setState={setState} />}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 8,
                borderTop: "1px dashed var(--border)",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("/")}
                className="rl-btn rl-btn-ghost"
                style={{ fontSize: 12 }}
              >
                skip →
              </button>

              <div style={{ display: "flex", gap: 10 }}>
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="rl-btn rl-btn-secondary"
                    style={{ fontSize: 12 }}
                  >
                    ← back
                  </button>
                )}
                <button
                  type="button"
                  onClick={advance}
                  className="rl-btn rl-btn-primary"
                  disabled={!isValid}
                  style={{
                    fontSize: 13,
                    opacity: isValid ? 1 : 0.4,
                    cursor: isValid ? "pointer" : "not-allowed",
                  }}
                >
                  {isLast ? "$ finish →" : "continue →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
