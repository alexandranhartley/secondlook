"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { getStoredPhotos, getStoredAnalysis } from "../lib/capture";
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
] as const;

const PULSE_DURATION = 2000; // 2 seconds per cycle
const ANALYSIS_DURATION = 5000; // 5 seconds total
const REVEAL_DURATION = 2000; // 2 seconds to show recommendation
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
  const [glowIntensity, setGlowIntensity] = useState(0.7); // For pulsing effect - start visible
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const borderGlowRef = useRef<HTMLDivElement>(null);

  // Load analysis result on mount
  useEffect(() => {
    const storedPhotos = getStoredPhotos();
    if (storedPhotos.length === 0) {
      // Redirect after a brief delay to show something
      setTimeout(() => {
        router.push("/");
      }, 1000);
      return;
    }
    setPhotos(storedPhotos);

    // Get stored analysis from API call
    const analysis = getStoredAnalysis();
    if (analysis && analysis.recommendation) {
      const color = getRecommendationColor(analysis.recommendation.headline);
      setBorderColor(color);
      setRecommendationHeadline(analysis.recommendation.headline);
    } else {
      // Fallback: redirect to home if no analysis found
      setTimeout(() => {
        router.push("/");
      }, 1000);
    }
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

  // Text updates
  useEffect(() => {
    if (photos.length === 0) return;

    const textInterval = setInterval(() => {
      setCurrentTextIndex((prev) => {
        if (prev < TEXT_SEQUENCE.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, ANALYSIS_DURATION / TEXT_SEQUENCE.length);

    timersRef.current.push(textInterval);
    return () => clearInterval(textInterval);
  }, [photos.length]);

  // Color transition and haptic
  useEffect(() => {
    if (photos.length === 0) return;

    const colorTimer = setTimeout(() => {
      setColorPhase("final");
      // Haptic feedback on mobile
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }, 2000);

    timersRef.current.push(colorTimer);
    return () => clearTimeout(colorTimer);
  }, [photos.length]);

  // Recommendation reveal
  useEffect(() => {
    if (photos.length === 0) return;

    const revealTimer = setTimeout(() => {
      setShowRecommendation(true);
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

  // Pulsing animation for glow intensity - smooth, gradual breathing effect
  useEffect(() => {
    if (showRecommendation || photos.length === 0) return;
    
    let startTime: number | null = null;
    const duration = 2000; // 2 second cycle
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % duration) / duration;
      
      // Smooth sine wave for natural breathing effect
      // Very wide range (0.4 to 1.0) for highly visible pulsing
      const intensity = 0.4 + (0.6 * (Math.sin(progress * Math.PI * 2) + 1) / 2);
      setGlowIntensity(intensity);
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationId);
  }, [showRecommendation, photos.length]);

  // Update border glow via ref - this ensures it's set immediately
  useEffect(() => {
    if (!borderGlowRef.current || photos.length === 0) return;
    // Sync with inline styles - using inset shadows
    const isYellow = colorPhase === "yellow";
    const colorValue = isYellow ? getYellowColor() : getColorValue(borderColor);
    const baseAlpha = isYellow ? 1.2 : 0.5; // Higher for yellow
    const pulseMultiplier = glowIntensity;
    const innerAlpha = Math.min(1.0, baseAlpha * pulseMultiplier * 0.9);
    const middleAlpha = Math.min(0.9, baseAlpha * pulseMultiplier * 0.7);
    const outerAlpha = Math.min(0.7, baseAlpha * pulseMultiplier * 0.4);
    
    borderGlowRef.current.style.boxShadow = `
      inset 0 0 80px 35px rgba(${colorValue.rgb}, ${innerAlpha}),
      inset 0 0 120px 60px rgba(${colorValue.rgb}, ${middleAlpha}),
      inset 0 0 160px 85px rgba(${colorValue.rgb}, ${outerAlpha})
    `;
  }, [colorPhase, borderColor, glowIntensity, photos.length]);
  
  // Force initial yellow glow on mount - runs immediately after photos are set
  useEffect(() => {
    if (photos.length === 0) return;
    // Small delay to ensure ref is ready
    const timer = setTimeout(() => {
      if (borderGlowRef.current && colorPhase === "yellow") {
        const yellowColor = getYellowColor();
        const baseAlpha = 1.2;
        const pulseMultiplier = glowIntensity;
        const innerAlpha = Math.min(1.0, baseAlpha * pulseMultiplier * 0.9);
        const middleAlpha = Math.min(0.9, baseAlpha * pulseMultiplier * 0.7);
        const outerAlpha = Math.min(0.7, baseAlpha * pulseMultiplier * 0.4);
        
        borderGlowRef.current.style.boxShadow = `
          inset 0 0 80px 35px rgba(${yellowColor.rgb}, ${innerAlpha}),
          inset 0 0 120px 60px rgba(${yellowColor.rgb}, ${middleAlpha}),
          inset 0 0 160px 85px rgba(${yellowColor.rgb}, ${outerAlpha})
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
      <div className="flex min-h-screen items-center justify-center bg-background">
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

  // Calculate glow DIRECTLY in render - ensures yellow is visible immediately
  // Using inset shadows - these create an edge-only glow effect
  // Much higher opacity for yellow to ensure visibility
  const baseAlpha = isYellow ? 1.2 : 0.5; // Exceed 1.0 for maximum intensity
  const pulseMultiplier = glowIntensity;
  // Clamp values to ensure they're visible but not exceed reasonable bounds
  const innerAlpha = Math.min(1.0, baseAlpha * pulseMultiplier * 0.9);
  const middleAlpha = Math.min(0.9, baseAlpha * pulseMultiplier * 0.7);
  const outerAlpha = Math.min(0.7, baseAlpha * pulseMultiplier * 0.4);
  
  // Inset shadows create edge glow - multiple layers for softness
  // Increased blur and spread for more visible glow
  const currentGlowShadow = `
    inset 0 0 80px 35px rgba(${colorValue.rgb}, ${innerAlpha}),
    inset 0 0 120px 60px rgba(${colorValue.rgb}, ${middleAlpha}),
    inset 0 0 160px 85px rgba(${colorValue.rgb}, ${outerAlpha})
  `;

  return (
    <div className="analyzing-container fixed inset-0 bg-background">
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
      
      {/* Edge glow overlays - visible gradient divs that pulse with intensity */}
      {!showRecommendation && (
        <>
          {/* Top edge - pulses with glowIntensity */}
          <div
            className="fixed left-0 right-0 top-0 pointer-events-none"
            style={{
              height: '70px',
              background: `linear-gradient(to bottom, 
                rgba(${colorValue.rgb}, ${Math.min(0.5, innerAlpha * 0.6)}), 
                rgba(${colorValue.rgb}, ${Math.min(0.25, middleAlpha * 0.35)}), 
                transparent)`,
              opacity: isYellow ? glowIntensity * 0.7 : 0.2,
              zIndex: 2,
              transition: 'opacity 0.1s ease-out',
            }}
            aria-hidden="true"
          />
          {/* Bottom edge */}
          <div
            className="fixed left-0 right-0 bottom-0 pointer-events-none"
            style={{
              height: '70px',
              background: `linear-gradient(to top, 
                rgba(${colorValue.rgb}, ${Math.min(0.5, innerAlpha * 0.6)}), 
                rgba(${colorValue.rgb}, ${Math.min(0.25, middleAlpha * 0.35)}), 
                transparent)`,
              opacity: isYellow ? glowIntensity * 0.7 : 0.2,
              zIndex: 2,
              transition: 'opacity 0.1s ease-out',
            }}
            aria-hidden="true"
          />
          {/* Left edge */}
          <div
            className="fixed left-0 top-0 bottom-0 pointer-events-none"
            style={{
              width: '70px',
              background: `linear-gradient(to right, 
                rgba(${colorValue.rgb}, ${Math.min(0.5, innerAlpha * 0.6)}), 
                rgba(${colorValue.rgb}, ${Math.min(0.25, middleAlpha * 0.35)}), 
                transparent)`,
              opacity: isYellow ? glowIntensity * 0.7 : 0.2,
              zIndex: 2,
              transition: 'opacity 0.1s ease-out',
            }}
            aria-hidden="true"
          />
          {/* Right edge */}
          <div
            className="fixed right-0 top-0 bottom-0 pointer-events-none"
            style={{
              width: '70px',
              background: `linear-gradient(to left, 
                rgba(${colorValue.rgb}, ${Math.min(0.5, innerAlpha * 0.6)}), 
                rgba(${colorValue.rgb}, ${Math.min(0.25, middleAlpha * 0.35)}), 
                transparent)`,
              opacity: isYellow ? glowIntensity * 0.7 : 0.2,
              zIndex: 2,
              transition: 'opacity 0.1s ease-out',
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
