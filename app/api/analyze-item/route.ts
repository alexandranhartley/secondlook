import { NextResponse } from "next/server";
import OpenAI from "openai";
import { resizeDataUrlForAnalysisServer } from "@/app/lib/resizeForAnalysisServer";

export type AnalyzeItemResponse = {
  recommendation: {
    headline: string;
    subhead: string;
    confidence: "High" | "Medium" | "Low";
    chips: string[];
    /** Exactly 3 concise reasons for the recommendation (value, condition/materials, risk or upside). */
    rationalePoints: string[];
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

const ANALYSIS_SYSTEM_PROMPT = `You are an expert secondhand furniture advisor. Analyze furniture photos, price, and notes to provide a comprehensive assessment. Generate reasoning for all insights, and if any insights have Low or Medium confidence, generate questions to help improve confidence.

Use the full range of recommendations; do not default to "Worth a closer look." Reserve "Worth a closer look" only for genuine uncertainty (e.g. need more info, mixed signals, borderline price). Use "Purchase this!" when value, condition, and materials support buying; use "Pass" when clearly overpriced, poor condition, or major red flags. Tie confidence to evidence strength: use High when the photos and notes clearly support your headline; use Medium or Low when something is unclear or would benefit from more info.

Return valid JSON only, no markdown or explanation.`;

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
  const photosCapped = photos.slice(0, 3);
  // Server-side resize so we never send huge images even if client sent them (saves tokens)
  const photosToSend = await Promise.all(
    photosCapped.map((url) => resizeDataUrlForAnalysisServer(url))
  );

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
    "chips": ["Save $X-Y", "Condition note", "Restoration note"],
    "rationalePoints": ["First reason in one short sentence", "Second reason", "Third reason"]
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

Recommendation rules (choose headline and confidence from the full range):
- Purchase this! — When asking price is at or below fair value, condition is Good or better, materials are solid, and there are no major red flags. Use High confidence when evidence from photos and notes is clear.
- Worth a closer look — Only when genuinely uncertain (e.g. cannot assess condition from photos, price is borderline, or a key factor like age or materials is unclear). Use Medium or Low confidence when more info would help.
- Pass — When overpriced vs fair value, condition is poor, major restoration needed, or clear red flags. Use High confidence when the evidence clearly does not support buying.

IMPORTANT REQUIREMENTS:
1. Provide reasoning for ALL insights (required, not optional)
2. recommendation.rationalePoints MUST be an array of exactly 3 concise sentences explaining why you gave this recommendation. Focus on: (1) value vs market, (2) condition/materials, (3) key risk or upside. One short sentence per point.
3. If ANY insight has Low or Medium confidence, include a "questions" array with exactly 2 questions
4. If recommendation confidence is Low or Medium, include "savingsReasoning"
5. Questions should prioritize helping multiple insights simultaneously
6. Questions must reference details from the photos, price, or notes provided

Base your assessment on what you can see in the photos, the asking price, and any notes provided. Your title, recommendation, insights, rationalePoints, and questions MUST be specific to these exact photos and this price—do not give generic or repeated answers. Describe what you actually see in the images (style, condition, materials, wear) and how the asking price compares to your fair value estimate.`;

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

    // Ensure recommendation.rationalePoints is exactly 3 items (required for SMART VERDICT UI)
    const rawPoints = parsed.recommendation?.rationalePoints;
    const fallbackPoints = parsed.recommendation?.chips?.slice(0, 3) || [
      "Based on condition, materials, and price.",
      "Assessment from photos and asking price.",
      "See more details below for full reasoning.",
    ];
    const rationalePoints =
      Array.isArray(rawPoints) && rawPoints.length >= 3
        ? rawPoints.slice(0, 3)
        : fallbackPoints.length >= 3
          ? fallbackPoints
          : [...fallbackPoints, ...fallbackPoints].slice(0, 3);

    const response: AnalyzeItemResponse = {
      ...parsed,
      recommendation: {
        ...parsed.recommendation,
        rationalePoints,
      },
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
