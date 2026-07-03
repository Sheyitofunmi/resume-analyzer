interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  let bg = "";
  let color = "var(--ink)";
  let badgeText = "";
  let symbol = "";

  if (score > 70) {
    bg = "var(--lime)";
    badgeText = "Strong";
    symbol = "✓";
  } else if (score > 49) {
    bg = "var(--amber)";
    badgeText = "Good start";
    symbol = "!";
  } else {
    bg = "var(--red)";
    color = "#fff";
    badgeText = "Needs work";
    symbol = "✕";
  }

  return (
    <div className="chip" style={{ background: bg, color }}>
      <span aria-hidden="true" style={{ fontWeight: 900, fontSize: 11 }}>
        {symbol}
      </span>
      <span>{badgeText}</span>
    </div>
  );
};

export default ScoreBadge;
