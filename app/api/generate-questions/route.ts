import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  QUESTIONS_SYSTEM_PROMPT,
  buildQuestionsUserPrompt,
} from "@/app/lib/prompts";

export type QuestionItem = {
  id: string;
  text: string;
  answerType: "photo" | "text";
  helpsInsights: string[];
};

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 503 }
    );
  }

  let body: {
    insightsNeedingHelp?: Array<{ label: string; value: string; confidence: "High" | "Medium" | "Low" }>;
    photos?: string[];
    price?: string;
    notes?: string;
    overallAnalysis?: any;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const insightsNeedingHelp = body.insightsNeedingHelp ?? [];
  const photos = body.photos ?? [];
  const price = body.price ?? "";
  const notes = body.notes ?? "";
  const overallAnalysis = body.overallAnalysis ?? null;

  // If no insights need help, return empty array
  if (insightsNeedingHelp.length === 0) {
    return NextResponse.json({ questions: [] });
  }

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: QUESTIONS_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildQuestionsUserPrompt(
            insightsNeedingHelp,
            photos,
            price,
            notes,
            overallAnalysis
          ),
        },
      ],
      temperature: 0.5,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      return NextResponse.json(
        { error: "No response from model" },
        { status: 502 }
      );
    }

    // Strip possible markdown code fence
    const jsonStr = content.replace(/^```(?:json)?\s*|\s*```$/g, "").trim();
    const questions: QuestionItem[] = JSON.parse(jsonStr);

    if (!Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Invalid response format" },
        { status: 502 }
      );
    }

    // Ensure all questions have helpsInsights array
    const validatedQuestions = questions.map((q) => ({
      ...q,
      helpsInsights: Array.isArray(q.helpsInsights) ? q.helpsInsights : [],
    }));

    // Limit to 2 questions
    const limitedQuestions = validatedQuestions.slice(0, 2);

    return NextResponse.json({ questions: limitedQuestions });
  } catch (err) {
    console.error("OpenAI generate-questions error:", err);
    if (err instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: err.message || "OpenAI API error" },
        { status: err.status ?? 502 }
      );
    }
    return NextResponse.json(
      { error: "Failed to generate questions" },
      { status: 502 }
    );
  }
}
