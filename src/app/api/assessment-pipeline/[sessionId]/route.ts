import { NextRequest, NextResponse } from "next/server";
import {
  getExtractionSession,
  serializePublicSessionDTO,
} from "@/services/storage/assessment-session-store";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await context.params;
    const session = getExtractionSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Assessment session not found or expired." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      serializePublicSessionDTO(session, { includePages: true })
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
