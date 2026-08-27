import { randomUUID } from "crypto";
import type { PublicSessionDTO, SessionRecord } from "@/types/session";

const globalStore = globalThis as typeof globalThis & {
  __assessmentSessionMap?: Map<string, SessionRecord>;
};

function getSessionMap(): Map<string, SessionRecord> {
  if (!globalStore.__assessmentSessionMap) {
    globalStore.__assessmentSessionMap = new Map();
  }
  return globalStore.__assessmentSessionMap;
}

const SESSION_TTL_MS = 1000 * 60 * 60 * 2; // 2 Hours TTL

function cleanupExpiredSessions() {
  const now = Date.now();
  const map = getSessionMap();
  for (const [id, session] of map) {
    if (now - session.createdAt > SESSION_TTL_MS) {
      map.delete(id);
    }
  }
}

export function createAssessmentSession(
  payload: Omit<SessionRecord, "id" | "createdAt" | "status" | "progress" | "message">
): SessionRecord {
  cleanupExpiredSessions();
  const session: SessionRecord = {
    id: randomUUID(),
    createdAt: Date.now(),
    status: "queued",
    progress: 0,
    message: "Queued for AI extraction",
    ...payload,
  };
  getSessionMap().set(session.id, session);
  return session;
}

export function getAssessmentSession(id: string): SessionRecord | undefined {
  cleanupExpiredSessions();
  return getSessionMap().get(id);
}

export function updateAssessmentSession(
  id: string,
  patch: Partial<SessionRecord>
): SessionRecord | undefined {
  const map = getSessionMap();
  const session = map.get(id);
  if (!session) return undefined;

  Object.assign(session, patch);
  map.set(id, session);
  return session;
}

export function serializePublicSessionDTO(
  session: SessionRecord,
  options?: { includePages?: boolean }
): PublicSessionDTO {
  return {
    id: session.id,
    status: session.status,
    progress: session.progress,
    message: session.message,
    error: session.error,
    questionPaperName: session.questionPaperName,
    answerSheetName: session.answerSheetName,
    questionPaperPageCount: session.questionPaperPages.length,
    answerSheetPageCount: session.answerSheetPages.length,
    result: session.result,
    ...(options?.includePages
      ? { answerSheetPages: session.answerSheetPages }
      : {}),
  };
}
