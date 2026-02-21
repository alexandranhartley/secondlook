"use client";

import { useState, useEffect, useCallback } from "react";
import QuestionAnswerForm, { type Question } from "./QuestionAnswerForm";
import {
  getStoredInsightAnswers,
  setStoredInsightAnswers,
  getAllAnsweredQuestions,
  type QuestionAnswer,
} from "../lib/capture";
import { recalculateAllInsights } from "../lib/confidenceCalculator";

type GlobalQuestionsSectionProps = {
  questions?: Array<{
    id: string;
    text: string;
    answerType: "photo" | "text";
    helpsInsights: string[];
  }>;
  insightsForRecalc?: Array<{
    label: string;
    value: string;
    confidence: "High" | "Medium" | "Low";
  }>;
  onConfidenceUpdates?: (updates: Record<string, "High" | "Medium" | "Low">) => void;
};

export default function GlobalQuestionsSection({
  questions: questionsFromProps = [],
  insightsForRecalc = [],
  onConfidenceUpdates,
}: GlobalQuestionsSectionProps) {
  const [answeredQuestions, setAnsweredQuestions] = useState<QuestionAnswer[]>([]);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [recentlySubmittedId, setRecentlySubmittedId] = useState<string | null>(null);
  const [dissolvingQuestions, setDissolvingQuestions] = useState<Set<string>>(new Set());
  const [dissolvedQuestions, setDissolvedQuestions] = useState<Set<string>>(new Set());

  // Load answered questions from sessionStorage
  useEffect(() => {
    const allAnswers = getAllAnsweredQuestions();
    setAnsweredQuestions(allAnswers);
  }, []);

  const handleAnswerQuestion = useCallback(
    (questionId: string, answer: { photo?: string; text?: string }, helpsInsights: string[]) => {
      const newAnswer: QuestionAnswer = {
        questionId,
        helpsInsights,
        answerType: answer.photo ? "photo" : "text",
        answered: true,
        answerPhoto: answer.photo,
        answerText: answer.text,
      };

      // Update sessionStorage
      const stored = getStoredInsightAnswers();
      // Store under a global key for easy retrieval
      if (!stored["_global"]) {
        stored["_global"] = [];
      }
      // Check if this question was already answered
      const existingIndex = stored["_global"].findIndex((a) => a.questionId === questionId);
      if (existingIndex >= 0) {
        stored["_global"][existingIndex] = newAnswer;
      } else {
        stored["_global"].push(newAnswer);
      }
      setStoredInsightAnswers(stored);

      // Refresh answered questions from storage (after saving)
      const allAnswers = getAllAnsweredQuestions();
      setAnsweredQuestions(allAnswers);

      // Show thank-you feedback, then collapse and dissolve
      setRecentlySubmittedId(questionId);

      // Recalculate recommendation (confidence updates) right away
      if (insightsForRecalc.length > 0 && onConfidenceUpdates) {
        const updates = recalculateAllInsights(insightsForRecalc, allAnswers);
        onConfidenceUpdates(updates);
      }

      // After showing "Thank you" for 1.5s, collapse card and dissolve it
      setTimeout(() => {
        setExpandedQuestionId(null);
        setRecentlySubmittedId(null);
        setDissolvingQuestions((prev) => new Set(prev).add(questionId));
        setTimeout(() => {
          setDissolvedQuestions((prev) => new Set(prev).add(questionId));
          setDissolvingQuestions((prev) => {
            const next = new Set(prev);
            next.delete(questionId);
            return next;
          });
        }, 600);
      }, 1500);
    },
    [insightsForRecalc, onConfidenceUpdates]
  );


  const isAnswered = (questionId: string) => {
    return answeredQuestions.some((a) => a.questionId === questionId && a.answered);
  };

  // Don't render if no questions provided
  if (!questionsFromProps || questionsFromProps.length === 0) {
    return null;
  }

  // Hide the whole section once all questions have been answered and dissolved
  const visibleQuestions = questionsFromProps.filter((q) => !dissolvedQuestions.has(q.id));
  if (visibleQuestions.length === 0) {
    return null;
  }

  return (
    <>
      {/* Before you buy: questions to verify (works for online listings or in person) */}
      <section className="py-1">
        {/* BEFORE YOU BUY — small uppercase light grey sub-heading */}
        <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
          Before you buy
        </h3>
        {/* Main title — same size as More Details (text-xl) */}
        <p className="mt-2 font-title-serif text-xl font-bold text-stone-900">
          What to Look For
        </p>
        {/* Question cards — expand inline to show answer form (no modal) */}
        <div className="mt-5 space-y-3">
          {visibleQuestions.map((q) => {
              const isExpanded = expandedQuestionId === q.id;
              const questionWithType = { ...q, answerType: q.answerType as Question["answerType"] };
              return (
                <div
                  key={q.id}
                  className={`rounded-2xl transition-opacity ease-out ${
                    dissolvingQuestions.has(q.id) ? "opacity-0" : "opacity-100"
                  } ${
                    isExpanded
                      ? "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                      : isAnswered(q.id)
                        ? "bg-emerald-50"
                        : "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                  }`}
                  style={{ transitionDuration: "400ms" }}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedQuestionId(isExpanded ? null : q.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors ${
                      isAnswered(q.id) && !isExpanded
                        ? "text-emerald-900"
                        : "text-stone-900"
                    } ${isExpanded ? "rounded-b-none" : ""}`}
                  >
                    <span className="flex-1 text-base font-medium">{q.text}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      {isAnswered(q.id) && !isExpanded && (
                        <span className="text-emerald-600" aria-hidden>✓</span>
                      )}
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-4 w-4 text-stone-600 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </button>
                  {q.helpsInsights && q.helpsInsights.length > 0 && !isExpanded && (
                    <div className="flex flex-wrap gap-1.5 px-4 pb-3 pt-0">
                      {q.helpsInsights.map((insightLabel) => (
                        <span
                          key={insightLabel}
                          className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500"
                        >
                          {insightLabel}
                        </span>
                      ))}
                    </div>
                  )}
                  {isExpanded && (
                    <div className="px-4 pb-4">
                      {recentlySubmittedId === q.id ? (
                        <div className="border-t border-stone-200 pt-4 mt-3 text-center py-6">
                          <p className="text-base font-medium text-stone-900">
                            Thank you for your response.
                          </p>
                          <p className="mt-1 text-sm text-stone-500">
                            Recalculating your recommendation…
                          </p>
                        </div>
                      ) : (
                        <QuestionAnswerForm
                          question={questionWithType}
                          onSave={(answer) => {
                            handleAnswerQuestion(q.id, answer, q.helpsInsights);
                          }}
                          onCancel={() => setExpandedQuestionId(null)}
                        />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </section>
    </>
  );
}
