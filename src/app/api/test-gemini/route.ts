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
      .map((m: { name: string }) => m.name.replace(/^models\//, ""))
      .filter((name: string) => !name.includes("2.5")); // Ignore deprecated 2.5 models

    const candidateModels = [
      process.env.GEMINI_MODEL,
      "gemini-3.6-flash",
      ...availableModels,
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ].filter(Boolean) as string[];

    const ai = new GoogleGenerativeAI(apiKey);
    let workingModel: string | null = null;
    let responseText: string | null = null;
    let lastError: string | null = null;

    for (const modelName of [...new Set(candidateModels)]) {
      try {
        const model = ai.getGenerativeModel({ model: modelName });
        const genResult = await model.generateContent("Respond with the single word: OK");
        responseText = genResult.response.text().trim();
        workingModel = modelName;
        break;
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    if (!workingModel) {
      return NextResponse.json({
        status: "error",
        step: "generateContent test",
        apiKeyUsed: maskedKey,
        lastError,
        availableModels,
      }, { status: 500 });
    }

    return NextResponse.json({
      status: "success",
      apiKeyUsed: maskedKey,
      selectedWorkingModel: workingModel,
      testResponse: responseText,
      availableModelsCount: availableModels.length,
      availableModels,
    });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      step: "API execution",
      apiKeyUsed: maskedKey,
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
