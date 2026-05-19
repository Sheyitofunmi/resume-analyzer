const ScoreCircle = ({ score = 75 }: { score: number }) => {
  const radius = 40;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const strokeDashoffset = circumference * (1 - score / 100);

  const trackColor = "#e5e5e5";
  const fillColor =
    score >= 70 ? "#16a34a" : score >= 50 ? "#d97706" : "#e11d48";

  return (
    <div className="relative w-[88px] h-[88px]">
      <svg
        height="100%"
        width="100%"
        viewBox="0 0 100 100"
        className="transform -rotate-90"
      >
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          stroke={trackColor}
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx="50"
          cy="50"
          r={normalizedRadius}
          stroke={fillColor}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="butt"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold text-sm text-[#0a0a0a] tabular-nums">
          {score}
        </span>
        <span className="text-[9px] text-[#525252] uppercase tracking-widest">
          /100
        </span>
      </div>
    </div>
  );
};

export default ScoreCircle;
