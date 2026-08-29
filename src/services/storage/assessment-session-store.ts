import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import os from "os";
import type {
  AssessmentExtractionSession,
  PublicAssessmentSessionDTO,
} from "@/types/assessment-extraction";

const globalStore = globalThis as typeof globalThis & {
  __assessmentExtractionMap?: Map<string, AssessmentExtractionSession>;
};

const TMP_DIR = path.join(os.tmpdir(), "vedaai_sessions");

function ensureTmpDir() {
  try {
    if (!fs.existsSync(TMP_DIR)) {
      fs.mkdirSync(TMP_DIR, { recursive: true });
    }
  } catch {
    // Ignore tmp dir errors
  }
}

function writeSessionToDisk(session: AssessmentExtractionSession) {
  try {
    ensureTmpDir();
    const filePath = path.join(TMP_DIR, `${session.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(session), "utf-8");
  } catch {
    // Ignore disk write errors
  }
}

function readSessionFromDisk(id: string): AssessmentExtractionSession | undefined {
  try {
    const filePath = path.join(TMP_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data) as AssessmentExtractionSession;
    }
  } catch {
    // Ignore disk read errors
  }
  return undefined;
}

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
  writeSessionToDisk(session);
  return session;
}

export function getExtractionSession(
  id: string
): AssessmentExtractionSession | undefined {
  pruneExpired();
  const memSession = getMap().get(id);
  if (memSession) return memSession;

  const diskSession = readSessionFromDisk(id);
  if (diskSession) {
    getMap().set(id, diskSession);
    return diskSession;
  }

  return undefined;
}

export function updateExtractionSession(
  id: string,
  patch: Partial<AssessmentExtractionSession>
): AssessmentExtractionSession | undefined {
  const session = getExtractionSession(id);
  if (!session) return undefined;

  Object.assign(session, patch);
  getMap().set(id, session);
  writeSessionToDisk(session);
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
