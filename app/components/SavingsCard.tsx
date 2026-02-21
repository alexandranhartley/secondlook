"use client";

import { useState, useEffect } from "react";
import ConfidencePill from "./ConfidencePill";
import StatusDot, { confidenceToVariant } from "./StatusDot";

type SavingsCardProps = {
  estSavingsRange: [number, number];
  askingPrice: number;
  fairValueRange: [number, number];
  confidence?: "High" | "Medium" | "Low";
  reasoning?: string;
  isExpanded: boolean;
  onToggle: () => void;
  onConfidenceUpdate?: (newConfidence: "High" | "Medium" | "Low") => void;
};

function qualitativeLabel(confidence: "High" | "Medium" | "Low"): string {
  return confidence === "High" ? "Great Value" : confidence === "Medium" ? "Fair Value" : "Estimate";
}

export default function SavingsCard({
  estSavingsRange,
  askingPrice,
  fairValueRange,
  confidence = "Medium",
  reasoning: initialReasoning,
  isExpanded,
  onToggle,
}: SavingsCardProps) {
  const [currentConfidence, setCurrentConfidence] = useState(confidence);

  useEffect(() => {
    setCurrentConfidence(confidence);
  }, [confidence]);

  const reasoning = initialReasoning || "";
  const displayValue =
    estSavingsRange[0] > 0 ? `$${estSavingsRange[0]}-${estSavingsRange[1]}` : "Calculating...";
  const label = qualitativeLabel(currentConfidence);

  return (
    <div
      className={`rounded-[18px] bg-white transition-shadow ${
        isExpanded ? "shadow-[0_2px_8px_rgba(0,0,0,0.06)]" : "shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          {/* Figma 1:57 — row 1: category label (light grey) + green/orange dot */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-stone-500">Est. Savings</span>
            <StatusDot variant={confidenceToVariant(currentConfidence)} />
          </div>
          {/* Row 2: main value (bold black), then secondary value (smaller regular black) */}
          <p className="text-base font-bold text-stone-900">{label}</p>
          <p className="text-sm font-normal text-stone-900">{displayValue}</p>
        </div>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 shrink-0 text-stone-400 transition-transform ${
            isExpanded ? "rotate-90" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>

      {isExpanded && (
        <div className="border-t border-stone-200/80 px-4 pb-4 pt-3">
          <div className="mb-2">
            <ConfidencePill level={currentConfidence} showDot={true} />
          </div>
          {reasoning ? (
            <p className="mb-4 text-sm leading-relaxed text-stone-700">{reasoning}</p>
          ) : (
            <p className="mb-4 text-sm text-stone-500">More detail isn’t available for this estimate yet.</p>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm text-stone-600">
            <div>
              <p className="text-xs uppercase tracking-wide text-stone-500">Asking price</p>
              <p className="font-semibold text-stone-700">
                ${askingPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-stone-500">Est. fair value</p>
              <p className="font-semibold text-stone-700">
                ${fairValueRange[0]}–${fairValueRange[1]}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
