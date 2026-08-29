import type { PublicAssessmentSessionDTO } from "@/types/assessment-extraction";

const DB_NAME = "VedaAIAssessmentDB";
const STORE_NAME = "assessment_sessions";
const DB_VERSION = 1;
const STORAGE_PREFIX = "vedaai-extraction-session:";

// In-memory global cache for instant 0ms retrieval within the same tab lifecycle
declare global {
  interface Window {
    __vedaai_session_cache?: Map<string, PublicAssessmentSessionDTO>;
  }
}

function getMemoryCache(): Map<string, PublicAssessmentSessionDTO> {
  if (typeof window === "undefined") return new Map();
  if (!window.__vedaai_session_cache) {
    window.__vedaai_session_cache = new Map();
  }
  return window.__vedaai_session_cache;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      return reject(new Error("IndexedDB not available"));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAssessmentSessionClient(
  session: PublicAssessmentSessionDTO
): Promise<void> {
  if (typeof window === "undefined") return;

  // 1. Save to in-memory window cache for immediate zero-delay access
  getMemoryCache().set(session.id, session);

  // 2. Save to IndexedDB (handles 50MB+ base64 document images with no 5MB quota limit)
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(session);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Fallback: try sessionStorage if small enough
    try {
      sessionStorage.setItem(
        `${STORAGE_PREFIX}${session.id}`,
        JSON.stringify(session)
      );
    } catch {
      // Ignored if quota exceeded
    }
  }
}

export function loadAssessmentSessionClient(
  id: string
): PublicAssessmentSessionDTO | null {
  if (typeof window === "undefined") return null;

  // 1. Check in-memory window cache first
  const inMem = getMemoryCache().get(id);
  if (inMem) return inMem;

  // 2. Check sessionStorage
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (raw) return JSON.parse(raw) as PublicAssessmentSessionDTO;
  } catch {
    // Ignore
  }

  return null;
}

export async function loadAssessmentSessionClientAsync(
  id: string
): Promise<PublicAssessmentSessionDTO | null> {
  // 1. Fast synchronous check (memory / sessionStorage)
  const syncCached = loadAssessmentSessionClient(id);
  if (syncCached) return syncCached;

  // 2. Check IndexedDB
  try {
    const db = await openDatabase();
    const result = await new Promise<PublicAssessmentSessionDTO | null>(
      (resolve, reject) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);
        req.onsuccess = () => resolve((req.result as PublicAssessmentSessionDTO) || null);
        req.onerror = () => reject(req.error);
      }
    );

    if (result) {
      getMemoryCache().set(id, result);
      return result;
    }
  } catch {
    // Ignore IndexedDB read errors
  }

  return null;
}
