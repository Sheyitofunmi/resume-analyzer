interface ScoreBadgeProps {
  score: number;
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score }) => {
  let badgeColor = "";
  let badgeText = "";
  let symbol = "";

  if (score > 70) {
    badgeColor = "bg-badge-green text-green-600";
    badgeText = "Strong";
    symbol = "✓";
  } else if (score > 49) {
    badgeColor = "bg-badge-yellow text-yellow-600";
    badgeText = "Good Start";
    symbol = "!";
  } else {
    badgeColor = "bg-badge-red text-red-600";
    badgeText = "Needs Work";
    symbol = "✕";
  }

  return (
    <div
      className={`flex items-center gap-1 px-3 py-1 rounded-full ${badgeColor}`}
    >
      <span aria-hidden="true" className="text-xs font-bold leading-none">
        {symbol}
      </span>
      <p className="text-sm font-medium">{badgeText}</p>
    </div>
  );
};

export default ScoreBadge;
