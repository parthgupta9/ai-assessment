import type { AssessmentMappingResult } from "@/types/assessment-extraction";
import { processQuestionPaperExtraction } from "@/services/extraction/question-paper-extractor";
import { processStudentAnswerSheetExtraction } from "@/services/extraction/answer-sheet-extractor";
import { mapAnswersToQuestions } from "@/services/mapping/answer-mapping-engine";
import { evaluateAssessmentGrading } from "@/services/grading/ai-assessment-evaluator";
import {
  getExtractionSession,
  updateExtractionSession,
} from "@/services/storage/assessment-session-store";

function decodeBase64Pages(pages: string[]) {
  return pages.map((dataUrl) => {
    const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
    if (!match) {
      return { base64: dataUrl, mimeType: "image/jpeg" };
    }
    return { mimeType: match[1], base64: match[2] };
  });
}

export async function runAssessmentExtractionPipeline(
  sessionId: string
): Promise<void> {
  const session = getExtractionSession(sessionId);
  if (!session) throw new Error("Assessment session not found");

  try {
    // Stage 1: Question Extraction
    updateExtractionSession(sessionId, {
      status: "extracting_questions",
      progress: 25,
      message: "Phase 1/4: Extracting questions from printed paper in order...",
      error: undefined,
    });

    const qpPages = decodeBase64Pages(session.questionPaperPages);
    const questions = await processQuestionPaperExtraction(qpPages);

    // Stage 2: Answer Extraction
    updateExtractionSession(sessionId, {
      status: "extracting_answers",
      progress: 55,
      message: "Phase 2/4: Transcribing student handwritten answer sheet & locating regions...",
    });

    const asPages = decodeBase64Pages(session.answerSheetPages);
    const questionNumbers = questions.map((q) => q.number);
    const rawAnswers = await processStudentAnswerSheetExtraction(
      asPages,
      questionNumbers
    );

    // Stage 3: Answer Mapping
    updateExtractionSession(sessionId, {
      status: "mapping",
      progress: 75,
      message: "Phase 3/4: Mapping student answers to questions & matching bounding regions...",
    });

    const { answers, unmatchedAnswers, unansweredQuestionIds } =
      mapAnswersToQuestions(
        questions,
        rawAnswers,
        session.answerSheetPages.length
      );

    // Stage 4: Grading & AI Feedback
    updateExtractionSession(sessionId, {
      status: "grading",
      progress: 90,
      message: "Phase 4/4: Scoring answers & generating detailed AI insights...",
    });

    const { grades, overallFeedback } = await evaluateAssessmentGrading(
      questions,
      answers,
      unansweredQuestionIds
    );

    const result: AssessmentMappingResult = {
      questions,
      answers,
      grades,
      overallFeedback,
      unmatchedAnswers,
      unansweredQuestionIds,
    };

    updateExtractionSession(sessionId, {
      status: "done",
      progress: 100,
      message: "Assessment Extraction & Answer Mapping Complete!",
      result,
    });
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : "Assessment extraction pipeline failed.";
    updateExtractionSession(sessionId, {
      status: "error",
      progress: 100,
      message: "Processing failed",
      error: errorMsg,
    });
  }
}
