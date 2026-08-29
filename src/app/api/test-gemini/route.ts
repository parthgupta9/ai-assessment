import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      status: "error",
      message: "GEMINI_API_KEY is not set in Vercel Environment Variables.",
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
        apiKeyUsed: maskedKey,
        googleApiError: data?.error || data,
      }, { status: 400 });
    }

    const availableModels = (data.models || [])
      .filter((m: { supportedGenerationMethods?: string[] }) =>
        m.supportedGenerationMethods?.includes("generateContent")
      )
      .map((m: { name: string }) => m.name.replace(/^models\//, ""));

    return NextResponse.json({
      status: "ok",
      apiKeyUsed: maskedKey,
      availableModelsCount: availableModels.length,
      availableModels,
    });
  } catch (err) {
    return NextResponse.json({
      status: "error",
      apiKeyUsed: maskedKey,
      error: err instanceof Error ? err.message : String(err),
    }, { status: 500 });
  }
}
