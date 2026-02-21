import ConfidencePill from "./ConfidencePill";

type RecommendationCardProps = {
  headline: string;
  subhead: string;
  chips: string[];
  confidence: "High" | "Medium" | "Low";
  /** Short "why" line for trust; if absent, first chip or placeholder is used */
  rationale?: string;
};

export default function RecommendationCard({
  headline,
  subhead,
  chips,
  confidence,
  rationale,
}: RecommendationCardProps) {
  const whyLine =
    rationale ||
    (chips.length > 0 ? chips[0] : "Based on condition, materials, and price.");

  return (
    <section className="rounded-3xl bg-emerald-50/70 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M5 12l5 5L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Recommendation for you
            </p>
            <h1 className="font-title-serif text-2xl font-semibold text-emerald-900">
              {headline}
            </h1>
            <p className="text-sm text-emerald-800">{subhead}</p>
            <p className="mt-1 text-xs text-emerald-700">{whyLine}</p>
          </div>
        </div>
        <ConfidencePill level={confidence} />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-emerald-700 shadow-sm"
          >
            {chip}
          </span>
        ))}
      </div>
    </section>
  );
}
