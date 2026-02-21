"use client";

import { useEffect, useRef, useState } from "react";
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
      rationalePoints: [],
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

  const touchStartX = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || photos.length <= 1) return;
    const endX = e.changedTouches[0].clientX;
    const deltaX = endX - touchStartX.current;
    const threshold = 50;
    if (deltaX < -threshold) {
      setMainPhotoIndex((i) => (i + 1) % photos.length);
    } else if (deltaX > threshold) {
      setMainPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
    }
    touchStartX.current = null;
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

  return (
    <div className="flex min-h-screen flex-col bg-white text-stone-900">
      {/* Hero: full-width image first with home overlay — Figma: dark circular home button */}
      <section className="relative w-full">
        {mainPhoto ? (
          <>
            <div
              className="relative aspect-[4/3] w-full overflow-hidden touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              role="region"
              aria-label="Swipe to change photo"
            >
              <img
                src={mainPhoto}
                alt={`Item photo ${mainPhotoIndex + 1} of ${photos.length}`}
                className="h-full w-full object-cover"
                draggable={false}
              />
              {/* Dark gradient at bottom for text legibility */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
                aria-hidden
              />
              <Link
                href="/"
                className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-white shadow-md hover:bg-stone-900"
                aria-label="Home"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </Link>
              {/* Title and price in one tag with black dot between */}
              <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-medium text-stone-900 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  {item.title ? <span>{item.title}</span> : null}
                  {item.title && price && Number(price) > 0 ? (
                    <span className="h-1 w-1 shrink-0 rounded-full bg-stone-900" aria-hidden />
                  ) : null}
                  {price && Number(price) > 0 ? (
                    <span>${Number(price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  ) : null}
                </span>
              </div>
              {/* Figma: three horizontal white dashes, active one longer/opaque — above tags */}
              {photos.length > 0 && (
                <div className="absolute bottom-14 left-0 right-0 z-10 flex justify-center gap-2">
                  {photos.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setMainPhotoIndex(index)}
                      className={`rounded-full bg-white transition-all ${
                        index === mainPhotoIndex
                          ? "h-1.5 w-6 opacity-100"
                          : "h-1.5 w-1.5 opacity-50"
                      }`}
                      aria-label={`Image ${index + 1} of ${photos.length}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-stone-200 via-stone-100 to-stone-300">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.6),_transparent_45%)]" />
            <Link
              href="/"
              className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-stone-800 text-white shadow-md hover:bg-stone-900"
              aria-label="Home"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Link>
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-stone-500">Add photos to see your item here.</p>
            </div>
          </div>
        )}
      </section>

      <main className="flex min-h-0 flex-1 flex-col pb-28">
        {/* White band: Smart Verdict only — carved out to stand out */}
        <div className="w-full shrink-0 bg-white">
          <div className="mx-auto max-w-md px-5 pt-2 pb-4">
            <RecommendationCard
              headline={item.recommendation.headline}
              subhead={item.recommendation.subhead}
              chips={item.recommendation.chips || []}
              confidence={item.recommendation.confidence}
              rationalePoints={analysis?.recommendation?.rationalePoints}
            />
          </div>
        </div>

        {/* Full-width light grey: Check These In Person + More Details — extends to bottom */}
        <div className="min-h-0 flex-1 w-full bg-[#FAFAFA]">
          <div className="mx-auto flex max-w-md flex-col gap-8 px-5 py-6">
            {analysis?.questions && analysis.questions.length > 0 && (
              <GlobalQuestionsSection
                questions={analysis.questions}
                insightsForRecalc={allInsightsForRecalc}
                onConfidenceUpdates={handleConfidenceUpdates}
              />
            )}

            <section className="space-y-4">
          {/* Figma 1:57 — More Details: prominent dark serif title, cards on light grey */}
          <h2 className="font-title-serif text-xl font-bold text-stone-900">
            More Details
          </h2>
          <div className="space-y-3">
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

          <div className="space-y-3">
            {insightsWithIcons.map((insight: any) => (
              <InsightRow
                key={insight.label}
                insight={insight}
                isExpanded={expandedInsightId === insight.label}
                onToggle={() => {
                  if (expandedInsightId !== insight.label) {
                    setIsSavingsExpanded(false);
                  }
                  setExpandedInsightId(expandedInsightId === insight.label ? null : insight.label);
                }}
                onConfidenceUpdate={(newConfidence) => {
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
          </div>
          </div>
            </section>

            <p className="text-[11px] leading-relaxed text-stone-500">
              Estimates help you decide quickly, but they are guidance — not a
              guarantee or formal appraisal.
            </p>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
          <p className="text-sm text-stone-500">
            Ready for another find?
          </p>
          <Link
            href="/"
            className="rounded-full bg-stone-800 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-stone-900"
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
