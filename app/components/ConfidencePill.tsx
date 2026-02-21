type ConfidenceLevel = "High" | "Medium" | "Low";

/* Certainty level: neutral grays, with a single muted accent for High (not pass/fail) */
const stylesByLevel: Record<ConfidenceLevel, string> = {
  High: "bg-stone-100 text-stone-800",
  Medium: "bg-stone-100 text-stone-600",
  Low: "bg-stone-100 text-stone-500",
};

type ConfidencePillProps = {
  level: ConfidenceLevel;
  label?: string;
};

export default function ConfidencePill({
  level,
  label,
}: ConfidencePillProps) {
  const text = label ?? `${level} confidence`;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${stylesByLevel[level]}`}
    >
      {text}
    </span>
  );
}
