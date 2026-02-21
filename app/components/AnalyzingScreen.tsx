"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getStoredPhotos,
  getStoredPrice,
  getStoredNotes,
  getStoredAnalysis,
  setStoredAnalysis,
} from "../lib/capture";
import { resizeDataUrlForAnalysis } from "../lib/resizeForAnalysis";
import {
  getColorValue,
  getRecommendationColor,
  getYellowColor,
  type RecommendationColor,
} from "../lib/analyzing";

const TEXT_SEQUENCE = [
  "Analyzing your find...",
  "Evaluating materials...",
  "Evaluating condition...",
  "Preparing your verdict…",
] as const;

const PULSE_DURATION = 2000; // 2 seconds per cycle
const ANALYSIS_DURATION = 8000; // 8 seconds total — feels more deliberate
const REVEAL_DURATION = 2000; // 2 seconds to show recommendation, then go to results
const SPARK_DURATION = 1500; // 1.5 seconds for spark

export default function AnalyzingScreen() {
  const router = useRouter();
  const [photos, setPhotos] = useState<string[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [borderColor, setBorderColor] = useState<RecommendationColor>("green");
  const [colorPhase, setColorPhase] = useState<"yellow" | "final">("yellow");
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [recommendationHeadline, setRecommendationHeadline] = useState("");
  const [glowIntensity, setGlowIntensity] = useState(0.68); // Pulse range 0.45–0.9 for clearer breathing
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const borderGlowRef = useRef<HTMLDivElement>(null);
  const hasRevealTimeElapsedRef = useRef(false);
  const analysisReadyRef = useRef(false);
  const setRecommendationFromAnalysisRef = useRef<((headline: string, color: RecommendationColor) => void) | null>(null);

  // Apply analysis result and reveal if the 8s has already elapsed. Only switch glow to final color when we know the verdict (so it never flashes green for "Worth a closer look").
  const applyAnalysisAndMaybeReveal = useCallback(
    (headline: string, color: RecommendationColor) => {
      setBorderColor(color);
      setRecommendationHeadline(headline);
      setColorPhase("final");
      analysisReadyRef.current = true;
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
      if (hasRevealTimeElapsedRef.current) {
        setShowRecommendation(true);
      }
    },
    []
  );

  useEffect(() => {
    setRecommendationFromAnalysisRef.current = applyAnalysisAndMaybeReveal;
  }, [applyAnalysisAndMaybeReveal]);

  // Load photos and either use stored analysis or run the API
  useEffect(() => {
    const storedPhotos = getStoredPhotos();
    if (storedPhotos.length === 0) {
      setTimeout(() => router.push("/"), 1000);
      return;
    }
    setPhotos(storedPhotos);

    const existing = getStoredAnalysis();
    if (existing && existing.recommendation) {
      const color = getRecommendationColor(existing.recommendation.headline);
      setBorderColor(color);
      setRecommendationHeadline(existing.recommendation.headline);
      setColorPhase("final");
      analysisReadyRef.current = true;
      return;
    }

    // No analysis yet: run the API here so the user waits on this screen
    (async () => {
      try {
        const price = getStoredPrice();
        const notes = getStoredNotes();
        const photosToSend = await Promise.all(
          storedPhotos.map((url) => resizeDataUrlForAnalysis(url))
        );
        const response = await fetch("/api/analyze-item", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ photos: photosToSend, price, notes }),
        });
        if (!response.ok) {
          const err = await response.json().catch(() => ({ error: "Failed" }));
          console.error("Analysis error:", err);
          setTimeout(() => router.push("/"), 2000);
          return;
        }
        const analysis = await response.json();
        setStoredAnalysis(analysis);
        const headline = analysis?.recommendation?.headline;
        if (headline) {
          const color = getRecommendationColor(headline);
          setRecommendationFromAnalysisRef.current?.(headline, color);
        } else {
          setTimeout(() => router.push("/"), 2000);
        }
      } catch (err) {
        console.error("Analyze API error:", err);
        setTimeout(() => router.push("/"), 2000);
      }
    })();
  }, [router]);

  // Photo cycling
  useEffect(() => {
    if (photos.length === 0 || photos.length === 1) return;

    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }, ANALYSIS_DURATION / photos.length);

    timersRef.current.push(interval);
    return () => clearInterval(interval);
  }, [photos.length]);

  // Text updates — "Preparing your verdict" only for ~1s; earlier steps get a bit more time
  useEffect(() => {
    if (photos.length === 0) return;

    const t1 = setTimeout(() => setCurrentTextIndex(1), 2000);
    const t2 = setTimeout(() => setCurrentTextIndex(2), 4500);
    const t3 = setTimeout(() => setCurrentTextIndex(3), 7000); // verdict line ~1s before reveal at 8s
    timersRef.current.push(t1, t2, t3);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [photos.length]);

  // Recommendation reveal — after ANALYSIS_DURATION, show result when we have it
  useEffect(() => {
    if (photos.length === 0) return;

    const revealTimer = setTimeout(() => {
      hasRevealTimeElapsedRef.current = true;
      if (analysisReadyRef.current) {
        setShowRecommendation(true);
      }
    }, ANALYSIS_DURATION);

    timersRef.current.push(revealTimer);
    return () => clearTimeout(revealTimer);
  }, [photos.length]);

  // Navigation after reveal
  useEffect(() => {
    if (!showRecommendation || photos.length === 0) return;

    const navTimer = setTimeout(() => {
      router.push("/results");
    }, REVEAL_DURATION);

    timersRef.current.push(navTimer);
    return () => clearTimeout(navTimer);
  }, [showRecommendation, router, photos.length]);

  // Pulsing animation for glow intensity — clear, smooth breathing so user sees activity
  useEffect(() => {
    if (showRecommendation || photos.length === 0) return;

    let startTime: number | null = null;
    const duration = 2200; // 2.2s cycle so each pulse is easy to see

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % duration) / duration;

      // Sine wave: range 0.45–0.9 so the pulse is clearly visible
      const intensity = 0.45 + (0.45 * (Math.sin(progress * Math.PI * 2) + 1) / 2);
      setGlowIntensity(intensity);

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [showRecommendation, photos.length]);

  // Update border glow via ref — softer in final phase
  useEffect(() => {
    if (!borderGlowRef.current || photos.length === 0) return;
    const isYellow = colorPhase === "yellow";
    const colorValue = isYellow ? getYellowColor() : getColorValue(borderColor);
    const baseAlpha = isYellow ? 0.6 : 0.32;
    const pulseMultiplier = glowIntensity;
    const innerAlpha = Math.min(isYellow ? 0.65 : 0.45, baseAlpha * pulseMultiplier * 0.9);
    const middleAlpha = Math.min(isYellow ? 0.5 : 0.35, baseAlpha * pulseMultiplier * 0.7);
    const outerAlpha = Math.min(isYellow ? 0.35 : 0.22, baseAlpha * pulseMultiplier * 0.4);

    borderGlowRef.current.style.boxShadow = `
      inset 0 0 60px 25px rgba(${colorValue.rgb}, ${innerAlpha}),
      inset 0 0 100px 45px rgba(${colorValue.rgb}, ${middleAlpha}),
      inset 0 0 140px 65px rgba(${colorValue.rgb}, ${outerAlpha})
    `;
  }, [colorPhase, borderColor, glowIntensity, photos.length]);

  // Force initial yellow glow on mount
  useEffect(() => {
    if (photos.length === 0) return;
    const timer = setTimeout(() => {
      if (borderGlowRef.current && colorPhase === "yellow") {
        const yellowColor = getYellowColor();
        const baseAlpha = 0.6;
        const pulseMultiplier = glowIntensity;
        const innerAlpha = Math.min(0.65, baseAlpha * pulseMultiplier * 0.9);
        const middleAlpha = Math.min(0.5, baseAlpha * pulseMultiplier * 0.7);
        const outerAlpha = Math.min(0.35, baseAlpha * pulseMultiplier * 0.4);

        borderGlowRef.current.style.boxShadow = `
          inset 0 0 60px 25px rgba(${yellowColor.rgb}, ${innerAlpha}),
          inset 0 0 100px 45px rgba(${yellowColor.rgb}, ${middleAlpha}),
          inset 0 0 140px 65px rgba(${yellowColor.rgb}, ${outerAlpha})
        `;
      }
    }, 10);

    return () => clearTimeout(timer);
  }, [photos.length, colorPhase, glowIntensity]);

  // Cleanup timers
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  if (photos.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-stone-600">No photos yet.</p>
          <p className="mt-2 text-sm text-stone-500">Add photos to get your analysis. Taking you back…</p>
        </div>
      </div>
    );
  }

  const currentPhoto = photos[currentPhotoIndex];
  const currentText = TEXT_SEQUENCE[currentTextIndex];
  const isYellow = colorPhase === "yellow";
  const colorValue = isYellow ? getYellowColor() : getColorValue(borderColor);
  const finalColorValue = getColorValue(borderColor);

  // Softer glow in render; lessen intensity in final phase so the border isn’t overwhelming
  const baseAlpha = isYellow ? 0.6 : 0.32;
  const pulseMultiplier = glowIntensity;
  const innerAlpha = Math.min(isYellow ? 0.65 : 0.45, baseAlpha * pulseMultiplier * 0.9);
  const middleAlpha = Math.min(isYellow ? 0.5 : 0.35, baseAlpha * pulseMultiplier * 0.7);
  const outerAlpha = Math.min(isYellow ? 0.35 : 0.22, baseAlpha * pulseMultiplier * 0.4);

  const currentGlowShadow = `
    inset 0 0 60px 25px rgba(${colorValue.rgb}, ${innerAlpha}),
    inset 0 0 100px 45px rgba(${colorValue.rgb}, ${middleAlpha}),
    inset 0 0 140px 65px rgba(${colorValue.rgb}, ${outerAlpha})
  `;

  return (
    <div className="analyzing-container fixed inset-0 bg-white">
      {/* Pulsating border glow - using edge divs for guaranteed visibility */}
      <div
        ref={borderGlowRef}
        className="border-glow-layer"
        style={{
          boxShadow: currentGlowShadow,
          transition: showRecommendation
            ? "box-shadow 0.45s ease-out"
            : "box-shadow 0.45s ease-in-out",
        }}
        aria-hidden="true"
      />
      
      {/* Edge glow overlays — softened so they don’t feel intense */}
      {!showRecommendation && (
        <>
          <div
            className="fixed left-0 right-0 top-0 pointer-events-none"
            style={{
              height: "56px",
              background: `linear-gradient(to bottom, rgba(${colorValue.rgb}, ${Math.min(0.2, innerAlpha * 0.35)}), rgba(${colorValue.rgb}, ${Math.min(0.12, middleAlpha * 0.2)}), transparent)`,
              opacity: isYellow ? glowIntensity * 0.35 : 0.1,
              zIndex: 2,
              transition: "opacity 0.15s ease-out",
            }}
            aria-hidden="true"
          />
          <div
            className="fixed left-0 right-0 bottom-0 pointer-events-none"
            style={{
              height: "56px",
              background: `linear-gradient(to top, rgba(${colorValue.rgb}, ${Math.min(0.2, innerAlpha * 0.35)}), rgba(${colorValue.rgb}, ${Math.min(0.12, middleAlpha * 0.2)}), transparent)`,
              opacity: isYellow ? glowIntensity * 0.35 : 0.1,
              zIndex: 2,
              transition: "opacity 0.15s ease-out",
            }}
            aria-hidden="true"
          />
          <div
            className="fixed left-0 top-0 bottom-0 pointer-events-none"
            style={{
              width: "56px",
              background: `linear-gradient(to right, rgba(${colorValue.rgb}, ${Math.min(0.2, innerAlpha * 0.35)}), rgba(${colorValue.rgb}, ${Math.min(0.12, middleAlpha * 0.2)}), transparent)`,
              opacity: isYellow ? glowIntensity * 0.35 : 0.1,
              zIndex: 2,
              transition: "opacity 0.15s ease-out",
            }}
            aria-hidden="true"
          />
          <div
            className="fixed right-0 top-0 bottom-0 pointer-events-none"
            style={{
              width: "56px",
              background: `linear-gradient(to left, rgba(${colorValue.rgb}, ${Math.min(0.2, innerAlpha * 0.35)}), rgba(${colorValue.rgb}, ${Math.min(0.12, middleAlpha * 0.2)}), transparent)`,
              opacity: isYellow ? glowIntensity * 0.35 : 0.1,
              zIndex: 2,
              transition: "opacity 0.15s ease-out",
            }}
            aria-hidden="true"
          />
        </>
      )}

      {/* Spark animation during reveal - glides smoothly along border */}
      {showRecommendation && (
        <div className="absolute inset-0 pointer-events-none overflow-visible">
          <div
            className="spark-trail"
            style={{
              background: `linear-gradient(90deg, 
                rgba(255, 255, 255, 0) 0%, 
                rgba(255, 255, 255, 0.4) 25%, 
                rgba(${finalColorValue.rgb}, 0.7) 50%, 
                rgba(255, 255, 255, 0.4) 75%, 
                rgba(255, 255, 255, 0) 100%
              )`,
              boxShadow: `
                0 0 15px rgba(${finalColorValue.rgb}, 0.6),
                0 0 30px rgba(255, 255, 255, 0.4),
                0 0 45px rgba(${finalColorValue.rgb}, 0.3)
              `,
            }}
          />
        </div>
      )}

      {/* Main content */}
      <div className="relative z-5 flex h-full flex-col items-center justify-center px-6">
        {!showRecommendation ? (
          <>
            {/* Photo with scanning bar */}
            <div className="relative mb-8 aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl">
              <img
                src={currentPhoto}
                alt="Analyzing"
                className="h-full w-full object-cover"
              />
              {/* Scanning bar overlay - loops continuously */}
              <div className="scan-bar-container absolute inset-0 pointer-events-none">
                <div className="scan-bar h-1 w-full bg-gradient-to-r from-transparent via-white/50 to-transparent shadow-lg" />
              </div>
            </div>

            {/* Text */}
            <p className="text-center text-lg font-medium text-stone-700">
              {currentText}
            </p>
            {/* Progress bar — fills over ANALYSIS_DURATION so user sees progress */}
            <div
              className="mt-4 w-full max-w-sm overflow-hidden rounded-full bg-stone-200"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={showRecommendation ? 100 : undefined}
              aria-label="Analysis in progress"
            >
              <div
                className="analyzing-progress-fill h-1.5 rounded-full bg-stone-500"
                style={{
                  animation: `analyzing-progress ${ANALYSIS_DURATION}ms linear forwards`,
                }}
              />
            </div>
          </>
        ) : (
          <>
            {/* Recommendation reveal */}
            <div className="recommendation-reveal">
              <h1 className="font-title-serif text-center text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
                {recommendationHeadline}
              </h1>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
