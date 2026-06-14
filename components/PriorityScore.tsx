type PriorityScoreProps = {
  score: number;
  size?: "sm" | "lg";
};

export function PriorityScore({ score, size = "sm" }: PriorityScoreProps) {
  const colorClasses =
    score >= 90
      ? "text-red-600 bg-red-50 border-red-200"
      : score >= 70
        ? "text-orange-600 bg-orange-50 border-orange-200"
        : score >= 50
          ? "text-amber-600 bg-amber-50 border-amber-200"
          : "text-emerald-600 bg-emerald-50 border-emerald-200";
  const sizeClasses = size === "sm" ? "h-9 w-9 text-xs" : "h-12 w-12 text-sm";

  return (
    <div
      className={`${sizeClasses} flex items-center justify-center rounded-lg border font-bold ${colorClasses}`}
    >
      {score}
    </div>
  );
}
