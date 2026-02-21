"use client";

import { useState, useEffect } from "react";
import ConfidencePill from "./ConfidencePill";

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

export default function SavingsCard({
  estSavingsRange,
  askingPrice,
  fairValueRange,
  confidence = "Medium",
  reasoning: initialReasoning,
  isExpanded,
  onToggle,
  onConfidenceUpdate,
}: SavingsCardProps) {
  const [currentConfidence, setCurrentConfidence] = useState(confidence);

  // Sync confidence when prop changes
  useEffect(() => {
    setCurrentConfidence(confidence);
  }, [confidence]);

  // Reasoning is now always provided from analysis, no need to fetch
  const reasoning = initialReasoning || "";

  const displayValue = estSavingsRange[0] > 0 ? `$${estSavingsRange[0]}-${estSavingsRange[1]}` : "Calculating...";

  return (
    <>
      <div
        className={`rounded-2xl bg-white shadow-sm transition-shadow ${
          isExpanded ? "shadow-md" : ""
        }`}
      >
        {/* Collapsed state */}
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full flex-col gap-3 px-4 py-3 text-left"
        >
          {/* Est. Savings with confidence indicator - shown at top */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                Est. Savings
              </p>
              <p className="text-2xl font-semibold text-stone-900">{displayValue}</p>
            </div>
            <div className="flex items-center gap-2">
              <ConfidencePill level={currentConfidence} />
              <svg
                viewBox="0 0 24 24"
                className={`h-4 w-4 text-stone-400 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>
          
          {/* Price breakdown - shown below Est. Savings */}
          <div className="grid grid-cols-2 gap-3 text-sm text-stone-600">
            <div>
              <p className="text-xs uppercase tracking-wide text-stone-400">
                Asking Price
              </p>
              <p className="font-semibold text-stone-700">
                ${askingPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-stone-400">
                Est. Fair Value
              </p>
              <p className="font-semibold text-stone-700">
                ${fairValueRange[0]}-${fairValueRange[1]}
              </p>
            </div>
          </div>
        </button>

        {/* Expanded state */}
        {isExpanded && (
          <div className="border-t border-stone-200 px-4 pb-4 pt-3">
            {/* Confidence badge and reasoning */}
            <div className="mb-4">
              <div className="mb-2">
                <ConfidencePill level={currentConfidence} />
              </div>
              {reasoning ? (
                <p className="text-sm leading-relaxed text-stone-700">{reasoning}</p>
              ) : (
                <p className="text-sm text-stone-500">More detail isn’t available for this estimate yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
