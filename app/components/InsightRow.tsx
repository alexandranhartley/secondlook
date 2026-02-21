"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import ConfidencePill from "./ConfidencePill";
import StatusDot, { confidenceToVariant } from "./StatusDot";

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
}: InsightRowProps) {
  const [currentConfidence, setCurrentConfidence] = useState(insight.confidence);

  useEffect(() => {
    setCurrentConfidence(insight.confidence);
  }, [insight.confidence]);

  const reasoning = insight.reasoning || "";

  // Figma: display "Material" and "Restoration" (singular / shorter)
  const displayLabel =
    insight.label === "Materials"
      ? "Material"
      : insight.label === "Restoration effort"
        ? "Restoration"
        : insight.label;

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
          {/* Figma 1:57 — row 1: category label (light grey) + status dot */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-stone-500">{displayLabel}</span>
            <StatusDot variant={confidenceToVariant(currentConfidence)} />
          </div>
          {/* Row 2: main value — larger, bold black */}
          <p className="text-base font-bold text-stone-900">{insight.value}</p>
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
            <p className="text-sm leading-relaxed text-stone-700">{reasoning}</p>
          ) : (
            <p className="text-sm text-stone-500">More detail isn’t available for this insight yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
