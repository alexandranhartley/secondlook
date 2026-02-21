import { NextResponse } from "next/server";
import OpenAI from "openai";
import {
  REASONING_SYSTEM_PROMPT,
  buildReasoningUserPrompt,
} from "@/app/lib/prompts";

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY not configured" },
      { status: 503 }
    );
  }

  let body: { label?: string; value?: string; confidence?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const label = body.label ?? "Assessment";
  const value = body.value ?? "";
  const confidence = body.confidence ?? "Medium";

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: REASONING_SYSTEM_PROMPT },
        {
          role: "user",
          content: buildReasoningUserPrompt(label, value, confidence),
        },
      ],
      temperature: 0.4,
    });

    const reasoning = completion.choices[0]?.message?.content?.trim();
    if (!reasoning) {
      return NextResponse.json(
        { error: "No response from model" },
        { status: 502 }
      );
    }

    return NextResponse.json({ reasoning });
  } catch (err) {
    console.error("OpenAI generate-reasoning error:", err);
    if (err instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: err.message || "OpenAI API error" },
        { status: err.status ?? 502 }
      );
    }
    return NextResponse.json(
      { error: "Failed to generate reasoning" },
      { status: 502 }
    );
  }
}
