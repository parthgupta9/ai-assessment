export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export function roundDecimal(num: number, decimals = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

export function normalizeQuestionNumber(value: string): string {
  return value
    .toLowerCase()
    .replace(/^q(uestion)?\s*/i, "")
    .replace(/[\s._:-]+/g, "")
    .replace(/[()]/g, "");
}
