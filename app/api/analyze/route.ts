import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: "No prompt" }, { status: 400 });

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }],
    });

    const text = (message.content[0] as any).text ?? "";
    return NextResponse.json({ text });
  } catch (e: any) {
    console.error("AI error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}