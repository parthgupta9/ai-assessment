import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      status: "error",
      message: "GEMINI_API_KEY is not configured in Vercel Environment Variables.",
    }, { status: 400 });
  }

  const maskedKey = `${apiKey.slice(0, 6)}...${apiKey.slice(-4)}`;

  try {
    // 1. Check ListModels
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { cache: "no-store" }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({
        status: "error",
        step: "ListModels query",
        apiKeyUsed: maskedKey,
        googleError: data?.error || data,
      }, { status: 400 });
    }

    const availableModels = (data.models || [])
      .filter((m: { supportedGenerationMethods?: string[] }) =>
        m.supportedGenerationMethods?.includes("generateContent")
      )
      .map((m: { name: string }) => m.name.replace(/^models\//, ""));

    // 2. Perform a test generation with the first available model
    const testModelName =
      availableModels.find((m: string) => m.includes("flash")) ||
      availableModels[0] ||
      "gemini-2.0-flash";

    const ai = new GoogleGenerativeAI(apiKey);
    const model = ai.getGenerativeModel({ model: testModelName });
    const genResult = await model.generateContent("Respond with the single word: OK");
    const responseText = genResult.response.text();

    return NextResponse.json({
      status: "success",
      apiKeyUsed: maskedKey,
      selectedModel: testModelName,
      testResponse: responseText.trim(),
      availableModelsCount: availableModels.length,
      availableModels,
    });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      step: "generateContent test",
      apiKeyUsed: maskedKey,
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
