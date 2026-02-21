"use client";

type RecommendationCardProps = {
  headline: string;
  subhead: string;
  chips: string[];
  confidence: "High" | "Medium" | "Low";
  /** Exactly 3 concise reasons from API; fallback to first 3 chips or placeholders if absent. */
  rationalePoints?: string[];
};

const FALLBACK_RATIONALE = [
  "Based on condition, materials, and price.",
  "Assessment from photos and asking price.",
  "See more details below for full reasoning.",
];

const CONFIDENCE_LABEL: Record<"High" | "Medium" | "Low", string> = {
  High: "High Confidence",
  Medium: "Medium Confidence",
  Low: "Low Confidence",
};

/** Figma node 1:5 — green dot #4ADE80 for High, amber for Medium, grey for Low */
const CONFIDENCE_DOT_COLOR: Record<"High" | "Medium" | "Low", string> = {
  High: "bg-[#4ADE80]",
  Medium: "bg-amber-500",
  Low: "bg-[#9CA3AF]",
};

export default function RecommendationCard({
  headline,
  subhead,
  chips,
  confidence,
  rationalePoints,
}: RecommendationCardProps) {
  const points =
    Array.isArray(rationalePoints) && rationalePoints.length >= 3
      ? rationalePoints.slice(0, 3)
      : chips.length >= 3
        ? chips.slice(0, 3)
        : FALLBACK_RATIONALE;

  return (
    <section className="py-2">
      {/* Figma node 1:5 — no card; SMART VERDICT label: uppercase, light grey #C4C4C4 */}
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
        Smart verdict
      </p>
      {/* Main verdict: very large bold serif, dark #1E1E1E */}
      <h1 className="mt-3 font-title-serif text-3xl font-bold text-[#1E1E1E]">
        {headline}
      </h1>
      {/* Confidence: directly below — green dot #4ADE80 + label in grey #6B7280, no pill */}
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${CONFIDENCE_DOT_COLOR[confidence]}`}
          aria-hidden
        />
        <span className="text-sm font-normal text-[#6B7280]">
          {CONFIDENCE_LABEL[confidence]}
        </span>
      </div>
      {/* 3 reasons: number in light grey circle #E5E7EB, number #6B7280; text #374151 */}
      <ol className="mt-4 space-y-2.5 text-sm text-[#374151]">
        {points.map((point, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E5E7EB] text-xs font-medium text-[#6B7280]"
              aria-hidden
            >
              {i + 1}
            </span>
            <span className="pt-0.5 leading-snug">{point}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
