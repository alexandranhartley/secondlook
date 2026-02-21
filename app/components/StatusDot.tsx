type StatusDotVariant = "positive" | "contextual" | "neutral";

const dotClassByVariant: Record<StatusDotVariant, string> = {
  positive: "bg-emerald-500",
  contextual: "bg-amber-500",
  neutral: "bg-stone-400",
};

type StatusDotProps = {
  variant: StatusDotVariant;
  className?: string;
};

/** Small status dot for trust/status (green = positive, orange = contextual, gray = neutral). */
export default function StatusDot({ variant, className = "" }: StatusDotProps) {
  return (
    <span
      className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClassByVariant[variant]} ${className}`}
      aria-hidden
    />
  );
}

/** Map confidence level to StatusDot variant for use in More Details rows. */
export function confidenceToVariant(
  confidence: "High" | "Medium" | "Low"
): StatusDotVariant {
  return confidence === "High" ? "positive" : confidence === "Medium" ? "contextual" : "neutral";
}
