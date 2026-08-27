import type { PublicAssessmentSessionDTO } from "@/types/assessment-extraction";

const STORAGE_PREFIX = "vedaai-extraction-session:";

export function saveAssessmentSessionClient(session: PublicAssessmentSessionDTO): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(
      `${STORAGE_PREFIX}${session.id}`,
      JSON.stringify(session)
    );
  } catch {
    // Silent fail if quota exceeded
  }
}

export function loadAssessmentSessionClient(id: string): PublicAssessmentSessionDTO | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PublicAssessmentSessionDTO;
  } catch {
    return null;
  }
}
