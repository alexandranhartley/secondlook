type ConfidenceLevel = "High" | "Medium" | "Low";

/* Certainty level: neutral grays, with a single muted accent for High (not pass/fail) */
const stylesByLevel: Record<ConfidenceLevel, string> = {
  High: "bg-stone-100 text-stone-800",
  Medium: "bg-stone-100 text-stone-600",
  Low: "bg-stone-100 text-stone-500",
};

/* Status dot colors: green = positive/trust, orange = contextual, gray = neutral */
const dotColorsByLevel: Record<ConfidenceLevel, string> = {
  High: "bg-emerald-500",
  Medium: "bg-amber-500",
  Low: "bg-stone-400",
};

type ConfidencePillProps = {
  level: ConfidenceLevel;
  label?: string;
  /** Show a small status dot before the text (green/orange/neutral by level). Default true. */
  showDot?: boolean;
};

export default function ConfidencePill({
  level,
  label,
  showDot = true,
}: ConfidencePillProps) {
  const text = label ?? `${level} confidence`;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${stylesByLevel[level]}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColorsByLevel[level]}`}
          aria-hidden
        />
      )}
      {text}
    </span>
  );
}
