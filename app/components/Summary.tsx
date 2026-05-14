import ScoreGauge from "~/components/ScoreGauge";
import ScoreBadge from "~/components/ScoreBadge";

const Category = ({ title, score }: { title: string; score: number }) => {
  const textColor =
    score > 70
      ? "text-green-600"
      : score > 49
        ? "text-yellow-600"
        : "text-red-600";

  return (
    <div className="px-4 pb-3">
      <div className="flex flex-row gap-2 items-center justify-between bg-gray-50 rounded-2xl p-3 sm:p-4 w-full">
        <div className="flex flex-row gap-2 items-center min-w-0">
          <p className="text-base sm:text-lg font-medium truncate">{title}</p>
          <ScoreBadge score={score} />
        </div>
        <p className="text-lg sm:text-xl font-semibold flex-shrink-0">
          <span className={textColor}>{score}</span>
          <span className="text-gray-400 text-sm">/100</span>
        </p>
      </div>
    </div>
  );
};

const Summary = ({ feedback }: { feedback: Feedback }) => {
  return (
    <div className="bg-white rounded-2xl shadow-md w-full overflow-hidden">
      <div className="flex flex-row items-center p-4 gap-4 sm:gap-6 border-b border-gray-100">
        <ScoreGauge score={feedback.overallScore} />

        <div className="flex flex-col gap-1 min-w-0">
          <h2 className="!text-xl sm:!text-2xl font-bold !text-black">
            Your Resume Score
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Calculated based on the categories below.
          </p>
        </div>
      </div>

      <div className="pt-3">
        <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
        <Category title="Content" score={feedback.content.score} />
        <Category title="Structure" score={feedback.structure.score} />
        <Category title="Skills" score={feedback.skills.score} />
      </div>
    </div>
  );
};
export default Summary;
