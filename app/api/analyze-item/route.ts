import { NextResponse } from "next/server";
import OpenAI from "openai";

export type AnalyzeItemResponse = {
  recommendation: {
    headline: string;
    subhead: string;
    confidence: "High" | "Medium" | "Low";
    chips: string[];
  };
  insights: Array<{
    label: string;
    value: string;
    confidence: "High" | "Medium" | "Low";
    reasoning: string; // Now required for all insights
  }>;
  title: string;
  fairValueRange: [number, number];
  estSavingsRange: [number, number];
  questions?: Array<{ // Only included if any insights have Low/Medium confidence
    id: string;
    text: string;
    answerType: "photo" | "text";
    helpsInsights: string[];
  }>;
  savingsReasoning?: string; // Only included if recommendation confidence is Low/Medium
};

const ANALYSIS_SYSTEM_PROMPT = `You are an expert secondhand furniture advisor. Analyze furniture photos, price, and notes to provide a comprehensive assessment. Generate reasoning for all insights, and if any insights have Low or Medium confidence, generate questions to help improve confidence. Return valid JSON only, no markdown or explanation.`;

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 503 }
    );
  }

  let body: {
    photos?: string[]; // data URLs (base64)
    price?: string;
    notes?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { photos = [], price = "", notes = "" } = body;

  if (photos.length === 0) {
    return NextResponse.json(
      { error: "At least one photo is required" },
      { status: 400 }
    );
  }

  const openai = new OpenAI({ apiKey });

  // Cap images sent to the model (cost control)
  const photosToSend = photos.slice(0, 3);

  // Build prompt with comprehensive analysis request
  const userPrompt = `Below are ${photosToSend.length} photo(s) of the item. Analyze them along with the price and notes below.

Analyze this secondhand furniture item based on:
- ${photosToSend.length} photo(s) provided
- Asking price: ${price ? `$${price}` : "Not provided"}
- Additional notes: ${notes || "None"}

Return a JSON object with this exact structure:
{
  "title": "Brief descriptive title (e.g., 'Late Victorian Dresser')",
  "recommendation": {
    "headline": "Main recommendation (e.g., 'Purchase this!' or 'Worth a closer look' or 'Pass')",
    "subhead": "One sentence explanation",
    "confidence": "High" | "Medium" | "Low",
    "chips": ["Save $X-Y", "Condition note", "Restoration note"]
  },
  "insights": [
    {
      "label": "Age",
      "value": "Estimated age range (e.g., '1890s - 1920s')",
      "confidence": "High" | "Medium" | "Low",
      "reasoning": "REQUIRED: 3-4 sentence explanation of how you arrived at this assessment"
    },
    {
      "label": "Materials",
      "value": "Material description (e.g., 'Solid oak hardwood')",
      "confidence": "High" | "Medium" | "Low",
      "reasoning": "REQUIRED: 3-4 sentence explanation of how you arrived at this assessment"
    },
    {
      "label": "Condition",
      "value": "Condition assessment (e.g., 'Excellent' or 'Good' or 'Fair')",
      "confidence": "High" | "Medium" | "Low",
      "reasoning": "REQUIRED: 3-4 sentence explanation of how you arrived at this assessment"
    },
    {
      "label": "Restoration effort",
      "value": "Restoration estimate (e.g., 'Minimal - ~1 hour' or 'Light - ~2 hours')",
      "confidence": "High" | "Medium" | "Low",
      "reasoning": "REQUIRED: 3-4 sentence explanation of how you arrived at this assessment"
    }
  ],
  "fairValueRange": [min, max],
  "estSavingsRange": [min, max],
  "questions": [ONLY include this field if ANY insight has Low or Medium confidence. Generate exactly 2 questions that would help improve confidence. Prioritize questions that help MULTIPLE insights simultaneously. Each question object must have: "id" (e.g., "q1", "q2"), "text" (one short sentence), "answerType" ("photo" | "text"), "helpsInsights" (array of insight labels this question helps, e.g., ["Age", "Materials"])],
  "savingsReasoning": "ONLY include this field if recommendation confidence is Low or Medium. Provide a 3-4 sentence explanation of how you calculated the savings estimate."
}

IMPORTANT REQUIREMENTS:
1. Provide reasoning for ALL insights (required, not optional)
2. If ANY insight has Low or Medium confidence, include a "questions" array with exactly 2 questions
3. If recommendation confidence is Low or Medium, include "savingsReasoning"
4. Questions should prioritize helping multiple insights simultaneously
5. Questions must reference details from the photos, price, or notes provided

Base your assessment on what you can see in the photos, the asking price, and any notes provided.`;

  // Multimodal user message: text + image parts (Vision API)
  const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
    { type: "text", text: userPrompt },
    ...photosToSend.map((dataUrl) => ({
      type: "image_url" as const,
      image_url: { url: dataUrl },
    })),
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json(
        { error: "No response from model" },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(content) as AnalyzeItemResponse;

    // Validate structure
    if (!parsed.recommendation || !parsed.insights || !Array.isArray(parsed.insights)) {
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 502 }
      );
    }

    // Ensure all insights have reasoning (backward compatibility)
    const validatedInsights = parsed.insights.map((insight) => ({
      ...insight,
      reasoning: insight.reasoning || "Reasoning not available",
    }));

    // Ensure questions array is valid if present
    const validatedQuestions = parsed.questions
      ? parsed.questions
          .filter((q) => q.id && q.text && q.answerType && Array.isArray(q.helpsInsights))
          .slice(0, 2) // Limit to 2 questions
      : undefined;

    const response: AnalyzeItemResponse = {
      ...parsed,
      insights: validatedInsights,
      questions: validatedQuestions,
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("OpenAI analyze-item error:", err);
    if (err instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: err.message || "OpenAI API error" },
        { status: err.status ?? 502 }
      );
    }
    return NextResponse.json(
      { error: "Failed to analyze item" },
      { status: 502 }
    );
  }
}
