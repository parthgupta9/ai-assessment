import type {
  QuestionEvaluationGrade,
  QuestionPaperItem,
  StudentAnswerRegion,
} from "@/types/assessment-extraction";
import { generateAnswerGrading } from "@/services/ai/gemini-vision";
import { normalizeQuestionNumber } from "@/lib/utils";

export async function evaluateAssessmentGrading(
  questions: QuestionPaperItem[],
  answers: StudentAnswerRegion[],
  unansweredQuestionIds: string[]
): Promise<{ grades: QuestionEvaluationGrade[]; overallFeedback: string }> {
  const gradePayload = answers.map((ans) => ({
    questionNumber:
      ans.questionNumber ??
      questions.find((q) => q.id === ans.questionId)?.number ??
      null,
    transcribedText: ans.transcribedText,
  }));

  const aiGradingResult = await generateAnswerGrading(
    questions.map((q) => ({
      number: q.number,
      text: q.text,
      maxMarks: q.maxMarks,
    })),
    gradePayload
  );

  const unansweredSet = new Set(unansweredQuestionIds);

  const grades: QuestionEvaluationGrade[] = questions.map((q) => {
    const targetNorm = normalizeQuestionNumber(q.number);
    const matchedGrade = aiGradingResult.grades.find(
      (item) => normalizeQuestionNumber(item.questionNumber) === targetNorm
    );
    const isUnanswered = unansweredSet.has(q.id);

    if (!matchedGrade) {
      return {
        questionId: q.id,
        status: isUnanswered ? "unanswered" : "partial",
        score: 0,
        maxScore: q.maxMarks ?? 1,
        feedback: isUnanswered
          ? "No answer found on the student's answer sheet."
          : "Answer transcribed but pending detailed grading evaluation.",
      };
    }

    return {
      questionId: q.id,
      status: isUnanswered ? "unanswered" : matchedGrade.status,
      score: isUnanswered ? 0 : matchedGrade.score,
      maxScore: matchedGrade.maxScore || q.maxMarks || 1,
      feedback: isUnanswered
        ? "No answer found on the student's answer sheet."
        : matchedGrade.feedback,
    };
  });

  return {
    grades,
    overallFeedback: aiGradingResult.overallFeedback,
  };
}
