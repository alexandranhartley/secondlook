/**
 * Logic for recalculating confidence based on answered questions
 */

import type { QuestionAnswer } from "./capture";

export function recalculateConfidence(
  currentConfidence: "High" | "Medium" | "Low",
  answeredQuestions: QuestionAnswer[]
): "High" | "Medium" | "Low" {
  if (answeredQuestions.length === 0) {
    return currentConfidence;
  }

  // Count answered questions, weight photo answers higher
  const photoAnswers = answeredQuestions.filter((q) => q.answered && q.answerPhoto).length;
  const textAnswers = answeredQuestions.filter((q) => q.answered && q.answerText).length;
  
  // Photo answers are worth 2 points, text answers 1 point
  const totalPoints = photoAnswers * 2 + textAnswers;
  
  // Thresholds based on current confidence
  if (currentConfidence === "Low") {
    // Low → Medium: 2+ points
    // Low → High: 5+ points
    if (totalPoints >= 5) return "High";
    if (totalPoints >= 2) return "Medium";
    return "Low";
  }
  
  if (currentConfidence === "Medium") {
    // Medium → High: 3+ points
    if (totalPoints >= 3) return "High";
    return "Medium";
  }
  
  // High stays High (or could go down if answers contradict, but for MVP we keep it High)
  return "High";
}

/**
 * Recalculate confidence for all insights based on global answered questions
 * Returns a map of insight label to new confidence level
 */
export function recalculateAllInsights(
  insights: Array<{ label: string; confidence: "High" | "Medium" | "Low" }>,
  allAnsweredQuestions: QuestionAnswer[]
): Record<string, "High" | "Medium" | "Low"> {
  const updates: Record<string, "High" | "Medium" | "Low"> = {};
  
  insights.forEach((insight) => {
    // Get answers that help this specific insight
    const relevantAnswers = allAnsweredQuestions.filter(
      (answer) =>
        answer.helpsInsights?.includes(insight.label) ||
        answer.insightLabel === insight.label
    );
    
    if (relevantAnswers.length > 0) {
      updates[insight.label] = recalculateConfidence(insight.confidence, relevantAnswers);
    }
  });
  
  return updates;
}
