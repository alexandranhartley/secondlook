"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import ConfidencePill from "./ConfidencePill";

export type Insight = {
  label: string;
  value: string;
  confidence: "High" | "Medium" | "Low";
  note?: string;
  icon?: ReactNode;
  reasoning?: string;
};

type InsightRowProps = {
  insight: Insight;
  isExpanded: boolean;
  onToggle: () => void;
  onConfidenceUpdate?: (newConfidence: "High" | "Medium" | "Low") => void;
};

export default function InsightRow({
  insight,
  isExpanded,
  onToggle,
  onConfidenceUpdate,
}: InsightRowProps) {
  const [currentConfidence, setCurrentConfidence] = useState(insight.confidence);

  // Sync confidence when insight prop changes
  useEffect(() => {
    setCurrentConfidence(insight.confidence);
  }, [insight.confidence]);

  // Reasoning is now always provided from analysis, no need to fetch
  const reasoning = insight.reasoning || "";

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
          className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-600">
              {insight.icon}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                {insight.label}
              </p>
              <p className="text-base font-semibold text-stone-900">{insight.value}</p>
            </div>
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
                <p className="text-sm text-stone-500">More detail isn’t available for this insight yet.</p>
              )}
            </div>

          </div>
        )}
      </div>
    </>
  );
}
