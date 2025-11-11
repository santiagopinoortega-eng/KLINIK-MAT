// lib/progress.ts

export type SavedProgress = {
  indice: number;
  score: number;
  mcqAnswers: Record<string, string>;
  shortAnswers: Record<string, string>;
  startedAt?: number;
  finishedAt?: number;
  durationSec?: number;
};

export function readProgress(caseId: string): SavedProgress | null {
  try {
    const raw = localStorage.getItem(`klinikmat:case:${caseId}`);
    return raw ? (JSON.parse(raw) as SavedProgress) : null;
  } catch {
    return null;
  }
}

export function clearProgress(caseId: string) {
  try {
    localStorage.removeItem(`klinikmat:case:${caseId}`);
  } catch {}
}