import { extractQuestionsFromPages } from "@/services/ai/gemini-vision";
import type { QuestionPaperItem } from "@/types/assessment-extraction";

export async function processQuestionPaperExtraction(
  pages: { base64: string; mimeType: string }[]
): Promise<QuestionPaperItem[]> {
  const rawQuestions = await extractQuestionsFromPages(pages);

  return rawQuestions.map((item, index) => ({
    id: `q-${index + 1}`,
    number: item.number.trim(),
    text: item.text.trim(),
    maxMarks: item.maxMarks ?? undefined,
  }));
}
