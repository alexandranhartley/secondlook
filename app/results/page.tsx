"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import InsightRow from "../components/InsightRow";
import RecommendationCard from "../components/RecommendationCard";
import SavingsCard from "../components/SavingsCard";
import GlobalQuestionsSection from "../components/GlobalQuestionsSection";
import { getStoredPhotos, getStoredPrice, getStoredNotes, getStoredAnalysis, setStoredAnalysis } from "../lib/capture";
import { AgeIcon, MaterialsIcon, ConditionIcon, RestorationIcon } from "../components/InsightIcons";

function ResultsContent() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [mainPhotoIndex, setMainPhotoIndex] = useState(0);
  const [analysis, setAnalysis] = useState<any>(null);
  const [expandedInsightId, setExpandedInsightId] = useState<string | null>(null);
  const [isSavingsExpanded, setIsSavingsExpanded] = useState(false);

  useEffect(() => {
    const storedPhotos = getStoredPhotos();
    const storedPrice = getStoredPrice();
    const storedNotes = getStoredNotes();
    const storedAnalysis = getStoredAnalysis();
    
    setPhotos(storedPhotos);
    setPrice(storedPrice);
    setNotes(storedNotes);
    setAnalysis(storedAnalysis);
  }, []);

  // Map insight labels to icons
  const getInsightIcon = (label: string) => {
    switch (label) {
      case "Age":
        return <AgeIcon />;
      case "Materials":
        return <MaterialsIcon />;
      case "Condition":
        return <ConditionIcon />;
      case "Restoration effort":
        return <RestorationIcon />;
      default:
        return null;
    }
  };

  // Use API analysis if available, otherwise fallback to mock
  const item = analysis || {
    title: "Furniture Item",
    notes: notes || "No notes provided",
    askingPrice: price ? parseFloat(price) : 0,
    fairValueRange: [0, 0] as [number, number],
    estSavingsRange: [0, 0] as [number, number],
    recommendation: {
      headline: "Analysis pending",
      subhead: "Please analyze an item first",
      confidence: "Low" as const,
      chips: [],
    },
    insights: [],
  };

  // Map API insights to include icons
  const insightsWithIcons = analysis?.insights?.map((insight: any) => ({
    ...insight,
    icon: getInsightIcon(insight.label),
  })) || [];

  // Get all insights for confidence recalculation
  const allInsightsForRecalc = [
    ...(analysis?.insights || []),
    ...(analysis?.recommendation?.confidence === "Low" ||
    analysis?.recommendation?.confidence === "Medium"
      ? [
          {
            label: "Est. Savings",
            value: `$${item.estSavingsRange[0]}-${item.estSavingsRange[1]}`,
            confidence: analysis?.recommendation?.confidence || "Medium",
          },
        ]
      : []),
  ];

  const handleThumbnailClick = (index: number) => {
    setMainPhotoIndex(index);
  };

  const handleConfidenceUpdates = (updates: Record<string, "High" | "Medium" | "Low">) => {
    setAnalysis((prev: any) => {
      if (!prev) return prev;
      const updated = { ...prev };
      
      // Update insights
      if (updated.insights) {
        updated.insights = updated.insights.map((i: any) =>
          updates[i.label] ? { ...i, confidence: updates[i.label] } : i
        );
      }
      
      // Update recommendation confidence if Est. Savings was updated
      if (updates["Est. Savings"]) {
        updated.recommendation = {
          ...updated.recommendation,
          confidence: updates["Est. Savings"],
        };
      }
      
      // Persist updated analysis to sessionStorage
      setStoredAnalysis(updated);
      
      return updated;
    });
  };

  const mainPhoto = photos[mainPhotoIndex];
  const thumbnailPhotos = photos.filter((_, i) => i !== mainPhotoIndex);

  return (
    <div className="min-h-screen bg-background text-stone-900">
      <header className="mx-auto flex max-w-md items-center justify-between px-5 pb-2 pt-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
            SecondLook
          </p>
          <p className="font-title-serif text-lg font-semibold text-stone-900">
            Your recommendation
          </p>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-col gap-6 px-5 pb-28">
        <RecommendationCard
          headline={item.recommendation.headline}
          subhead={item.recommendation.subhead}
          chips={item.recommendation.chips}
          confidence={item.recommendation.confidence}
          rationale={analysis?.recommendation?.rationale}
        />

        {analysis?.questions && analysis.questions.length > 0 && (
          <GlobalQuestionsSection
            questions={analysis.questions}
            insightsForRecalc={allInsightsForRecalc}
            onConfidenceUpdates={handleConfidenceUpdates}
          />
        )}

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          {mainPhoto ? (
            <>
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={mainPhoto}
                  alt="Item photo"
                  className="h-full w-full object-cover"
                />
              </div>
              {thumbnailPhotos.length > 0 && (
                <div className="flex gap-2 px-5 py-3">
                  {photos.map((photo, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleThumbnailClick(index)}
                      className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors transition-shadow ${
                        index === mainPhotoIndex
                          ? "border-emerald-500 ring-2 ring-emerald-200"
                          : "border-stone-200 hover:border-stone-300"
                      }`}
                      aria-label={`View photo ${index + 1}`}
                    >
                      <img
                        src={photo}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_45%)]" />
              <div className="flex h-full items-center justify-center">
                <p className="text-sm text-stone-500">Add photos to see your item here.</p>
              </div>
            </div>
          )}
          <div className="space-y-2 px-5 pb-5 pt-4">
            <h1 className="text-xl font-semibold text-stone-900">
              {item.title}
            </h1>
            <p className="text-sm text-stone-500">
              {[
                price && Number(price) > 0
                  ? `Asking $${Number(price).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  : null,
                item.fairValueRange[0] > 0
                  ? `Est. fair value $${item.fairValueRange[0]}–$${item.fairValueRange[1]}`
                  : null,
                notes || item.notes,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <SavingsCard
            estSavingsRange={item.estSavingsRange}
            askingPrice={price ? parseFloat(price) : 0}
            fairValueRange={item.fairValueRange}
            confidence={analysis?.recommendation?.confidence || "Medium"}
            reasoning={analysis?.savingsReasoning}
            isExpanded={isSavingsExpanded}
            onToggle={() => {
              // Accordion: close insights if opening savings
              if (!isSavingsExpanded) {
                setExpandedInsightId(null);
              }
              setIsSavingsExpanded(!isSavingsExpanded);
            }}
            onConfidenceUpdate={(newConfidence) => {
              // Update analysis if needed
              setAnalysis((prev: any) => {
                if (!prev) return prev;
                return { ...prev, savingsConfidence: newConfidence };
              });
            }}
          />

          {insightsWithIcons.map((insight: any) => (
            <InsightRow
              key={insight.label}
              insight={insight}
              isExpanded={expandedInsightId === insight.label}
              onToggle={() => {
                // Accordion: close savings if opening insight
                if (expandedInsightId !== insight.label) {
                  setIsSavingsExpanded(false);
                }
                setExpandedInsightId(expandedInsightId === insight.label ? null : insight.label);
              }}
              onConfidenceUpdate={(newConfidence) => {
                // Update analysis with new confidence
                setAnalysis((prev: any) => {
                  if (!prev) return prev;
                  const updated = { ...prev };
                  updated.insights = updated.insights.map((i: any) =>
                    i.label === insight.label ? { ...i, confidence: newConfidence } : i
                  );
                  return updated;
                });
              }}
            />
          ))}
        </section>

        <p className="text-xs text-stone-500">
          Estimates help you decide quickly, but they are guidance - not a
          guarantee or formal appraisal.
        </p>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
          <p className="text-sm text-stone-500">
            Ready for another find?
          </p>
          <Link
            href="/"
            className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            Scan Another
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  return <ResultsContent />;
}
