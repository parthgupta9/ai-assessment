import { randomUUID } from "crypto";
import type {
  AssessmentExtractionSession,
  PublicAssessmentSessionDTO,
} from "@/types/assessment-extraction";

const globalStore = globalThis as typeof globalThis & {
  __assessmentExtractionMap?: Map<string, AssessmentExtractionSession>;
};

function getMap(): Map<string, AssessmentExtractionSession> {
  if (!globalStore.__assessmentExtractionMap) {
    globalStore.__assessmentExtractionMap = new Map();
  }
  return globalStore.__assessmentExtractionMap;
}

const TTL_MS = 1000 * 60 * 60 * 2; // 2 hours

function pruneExpired() {
  const now = Date.now();
  const map = getMap();
  for (const [id, session] of map) {
    if (now - session.createdAt > TTL_MS) {
      map.delete(id);
    }
  }
}

export function createExtractionSession(
  payload: Omit<
    AssessmentExtractionSession,
    "id" | "createdAt" | "status" | "progress" | "message"
  >
): AssessmentExtractionSession {
  pruneExpired();
  const session: AssessmentExtractionSession = {
    id: randomUUID(),
    createdAt: Date.now(),
    status: "queued",
    progress: 0,
    message: "Queued for Question Extraction",
    ...payload,
  };
  getMap().set(session.id, session);
  return session;
}

export function getExtractionSession(
  id: string
): AssessmentExtractionSession | undefined {
  pruneExpired();
  return getMap().get(id);
}

export function updateExtractionSession(
  id: string,
  patch: Partial<AssessmentExtractionSession>
): AssessmentExtractionSession | undefined {
  const map = getMap();
  const session = map.get(id);
  if (!session) return undefined;

  Object.assign(session, patch);
  map.set(id, session);
  return session;
}

export function serializePublicSessionDTO(
  session: AssessmentExtractionSession,
  options?: { includePages?: boolean }
): PublicAssessmentSessionDTO {
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
