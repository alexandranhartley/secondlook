/**
 * Prompt templates for OpenAI (questions and reasoning).
 * Used only in API routes; never sent to the client.
 */

export const QUESTIONS_SYSTEM_PROMPT = `You are an expert secondhand furniture advisor. Given multiple insights that need confidence improvement and full context about the item (photos, price, notes, and overall analysis), generate exactly 2 short questions that would be most beneficial and move the needle in confidence levels. Prioritize questions that help multiple insights simultaneously. Each question should be answerable by either a photo or a short text answer. Questions must be highly relevant to the specific item being analyzed, referencing details from the photos, price, or notes provided. Return valid JSON only, no markdown or explanation.`;

export function buildQuestionsUserPrompt(
  insightsNeedingHelp: Array<{ label: string; value: string; confidence: "High" | "Medium" | "Low" }>,
  photos: string[],
  price: string,
  notes: string,
  overallAnalysis: any
): string {
  const photoCount = photos.length;
  const priceInfo = price ? `Asking price: $${price}` : "No price provided";
  const notesInfo = notes ? `Notes: ${notes}` : "No notes provided";
  
  // Summarize overall analysis for context
  const analysisSummary = overallAnalysis ? `
Overall analysis summary:
- Recommendation: ${overallAnalysis.recommendation?.headline || "N/A"}
- All insights: ${overallAnalysis.insights?.map((i: any) => `${i.label}: ${i.value} (${i.confidence})`).join(", ") || "N/A"}
` : "";

  // Build insights needing help list
  const insightsList = insightsNeedingHelp.map(
    (insight) => `- ${insight.label}: "${insight.value}" (${insight.confidence} confidence)`
  ).join("\n");

  return `Insights that need confidence improvement:
${insightsList}

Context about this specific item:
- Number of photos provided: ${photoCount}
- ${priceInfo}
- ${notesInfo}
${analysisSummary}

Generate exactly 2 questions that would be most beneficial and move the needle in confidence levels. Prioritize questions that help MULTIPLE insights simultaneously (e.g., a question about maker's marks could help both Age and Materials insights). Questions must reference details from the photos, price, or notes provided.

Return a JSON array of exactly 2 objects. Each object must have:
- "id": short unique id (e.g. "q1", "q2")
- "text": the question text (one short sentence, specific to this item)
- "answerType": "photo" | "text" (use "photo" if a photo would best answer it, e.g. "Can you see the maker's mark?"; use "text" for things like style or provenance)
- "helpsInsights": array of insight labels that this question helps (e.g. ["Age", "Materials"])

Example format: [{"id":"q1","text":"Can you see a maker's mark or label?","answerType":"photo","helpsInsights":["Age","Materials"]},{"id":"q2","text":"What style period does it match?","answerType":"text","helpsInsights":["Age"]}]`;
}

export const REASONING_SYSTEM_PROMPT = `You are an expert secondhand furniture advisor. Write a clear, helpful 3-4 sentence paragraph explaining how we arrived at an assessment. Use plain language. Do not use markdown or bullet points.`;

export function buildReasoningUserPrompt(label: string, value: string, confidence: string): string {
  return `Assessment: ${label} = "${value}". Confidence: ${confidence}.

Write 3-4 sentences explaining how we landed on this answer (what we looked at, what we inferred, and any caveats).`;
}
