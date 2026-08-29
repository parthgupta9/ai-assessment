import type { QuestionPaperItem, StudentAnswerRegion } from "@/types/assessment-extraction";
import { normalizeQuestionNumber } from "@/lib/utils";

export function mapAnswersToQuestions(
  questions: QuestionPaperItem[],
  extractedAnswers: {
    questionNumber?: string | null;
    transcribedText: string;
    regions: { pageIndex: number; x: number; y: number; w: number; h: number }[];
  }[],
  totalPages: number
): {
  answers: StudentAnswerRegion[];
  unmatchedAnswers: StudentAnswerRegion[];
  unansweredQuestionIds: string[];
} {
  const answers: StudentAnswerRegion[] = extractedAnswers.map((item, index) => {
    const questionId = findMatchingQuestionId(questions, item.questionNumber);
    return {
      id: `ans-${index + 1}`,
      questionId,
      questionNumber: item.questionNumber ?? null,
      transcribedText: item.transcribedText.trim(),
      regions: item.regions.filter(
        (reg) =>
          reg.pageIndex >= 0 &&
          reg.pageIndex < totalPages &&
          reg.w > 0.005 &&
          reg.h > 0.005
      ),
    };
  });

  const answeredSet = new Set<string>();
  for (const ans of answers) {
    if (ans.questionId) {
      answeredSet.add(ans.questionId);
    }
  }

  const unmatchedAnswers = answers.filter((ans) => !ans.questionId);
  const unansweredQuestionIds = questions
    .filter((q) => !answeredSet.has(q.id))
    .map((q) => q.id);

  return {
    answers,
    unmatchedAnswers,
    unansweredQuestionIds,
  };
}

function findMatchingQuestionId(
  questions: QuestionPaperItem[],
  questionLabel: string | null | undefined
): string | null {
  if (!questionLabel) return null;
  const target = normalizeQuestionNumber(questionLabel);

  const exact = questions.find(
    (q) => normalizeQuestionNumber(q.number) === target
  );
  if (exact) return exact.id;

  const soft = questions.find((q) => {
    const norm = normalizeQuestionNumber(q.number);
    return norm === target || norm.includes(target) || target.includes(norm);
  });

  return soft?.id ?? null;
}
