import { useEffect, useRef, useState } from "react";

const ScoreGauge = ({ score = 75 }: { score: number }) => {
  const [pathLength, setPathLength] = useState(0);
  const pathRef = useRef<SVGPathElement>(null);

  const percentage = score / 100;

  const strokeColor =
    score > 69 ? "var(--lime)" : score > 49 ? "var(--amber)" : "var(--red)";

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-20">
        <svg viewBox="0 0 100 50" className="w-full h-full">
          {/* Background arc */}
          <path
            d="M10,50 A40,40 0 0,1 90,50"
            fill="none"
            stroke="rgba(11,11,11,0.12)"
            strokeWidth="10"
          />

          {/* Foreground arc — color reflects score tier */}
          <path
            ref={pathRef}
            d="M10,50 A40,40 0 0,1 90,50"
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength * (1 - percentage)}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <div
            className="pt-4"
            style={{
              fontWeight: 900,
              fontSize: 20,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {score}/100
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreGauge;
