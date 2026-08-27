import { NextRequest, NextResponse } from "next/server";
import { runAssessmentExtractionPipeline } from "@/services/pipeline/assessment-extraction-pipeline";
import {
  getExtractionSession,
  serializePublicSessionDTO,
} from "@/services/storage/assessment-session-store";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    const session = getExtractionSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Assessment session not found." },
        { status: 404 }
      );
    }

    await runAssessmentExtractionPipeline(sessionId);

    const updated = getExtractionSession(sessionId);
    if (!updated) {
      return NextResponse.json(
        { error: "Session failed to update." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      serializePublicSessionDTO(updated, { includePages: true })
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Reprocessing failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
