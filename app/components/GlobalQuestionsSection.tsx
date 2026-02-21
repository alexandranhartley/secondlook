"use client";

import { useState, useEffect, useCallback } from "react";
import QuestionAnswerModal, { type Question } from "./QuestionAnswerModal";
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
  const [selectedQuestion, setSelectedQuestion] = useState<(Question & { helpsInsights: string[] }) | null>(null);
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

      // Close the modal after saving
      setSelectedQuestion(null);

      // Automatically recalculate confidence after saving answer
      if (insightsForRecalc.length > 0) {
        // Use the updated answers that include the newly saved answer
        const updates = recalculateAllInsights(insightsForRecalc, allAnswers);
        if (onConfidenceUpdates && Object.keys(updates).length > 0) {
          onConfidenceUpdates(updates);
          
          // Start dissolve animation for this question
          setDissolvingQuestions((prev) => new Set(prev).add(questionId));
          
          // Remove question after animation completes (600ms for fade-out)
          setTimeout(() => {
            setDissolvedQuestions((prev) => new Set(prev).add(questionId));
            setDissolvingQuestions((prev) => {
              const next = new Set(prev);
              next.delete(questionId);
              return next;
            });
          }, 600);
        }
      }
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

  return (
    <>
      <div className="rounded-2xl bg-white shadow-sm">
        <div className="px-5 py-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Questions to strengthen confidence
          </h3>
          <div className="space-y-3">
            {questionsFromProps
              .filter((q) => !dissolvedQuestions.has(q.id))
              .map((q) => (
                <div
                  key={q.id}
                  className={`space-y-2 transition-opacity ease-out ${
                    dissolvingQuestions.has(q.id) ? "opacity-0" : "opacity-100"
                  }`}
                  style={{ transitionDuration: "400ms" }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedQuestion(q)}
                    className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                      isAnswered(q.id)
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : "border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex-1 font-medium">{q.text}</span>
                      {isAnswered(q.id) && (
                        <span className="flex-shrink-0 text-emerald-600">✓</span>
                      )}
                    </div>
                    {q.helpsInsights && q.helpsInsights.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {q.helpsInsights.map((insightLabel) => (
                          <span
                            key={insightLabel}
                            className="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-medium text-stone-600"
                          >
                            {insightLabel}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Question answer modal */}
      {selectedQuestion && (
        <QuestionAnswerModal
          question={selectedQuestion}
          insightLabel={selectedQuestion.helpsInsights.join(", ")}
          onSave={(answer) =>
            handleAnswerQuestion(selectedQuestion.id, answer, selectedQuestion.helpsInsights)
          }
          onClose={() => setSelectedQuestion(null)}
        />
      )}
    </>
  );
}
