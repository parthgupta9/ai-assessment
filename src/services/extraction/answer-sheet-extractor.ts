import { extractAnswersFromPages } from "@/services/ai/gemini-vision";

export async function processStudentAnswerSheetExtraction(
  pages: { base64: string; mimeType: string }[],
  questionNumbers: string[]
) {
  return await extractAnswersFromPages(pages, questionNumbers);
}
