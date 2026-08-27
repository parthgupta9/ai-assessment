import { z } from "zod";

export const AnswerSheetBoundingBoxSchema = z.object({
  pageIndex: z.number().int().min(0),
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  w: z.number().min(0).max(1),
  h: z.number().min(0).max(1),
});

export const QuestionPaperItemSchema = z.object({
  id: z.string(),
  number: z.string(),
  text: z.string(),
  maxMarks: z.number().optional(),
});

export const StudentAnswerRegionSchema = z.object({
  id: z.string(),
  questionId: z.string().nullable(),
  questionNumber: z.string().nullable().optional(),
  transcribedText: z.string(),
  regions: z.array(AnswerSheetBoundingBoxSchema),
});

export const QuestionEvaluationGradeSchema = z.object({
  questionId: z.string(),
  status: z.enum(["correct", "incorrect", "partial", "unanswered"]),
  score: z.number(),
  maxScore: z.number(),
  feedback: z.string(),
});

export type AnswerSheetBoundingBox = z.infer<typeof AnswerSheetBoundingBoxSchema>;
export type QuestionPaperItem = z.infer<typeof QuestionPaperItemSchema>;
export type StudentAnswerRegion = z.infer<typeof StudentAnswerRegionSchema>;
export type QuestionEvaluationGrade = z.infer<typeof QuestionEvaluationGradeSchema>;

export type AssessmentMappingResult = {
  questions: QuestionPaperItem[];
  answers: StudentAnswerRegion[];
  grades: QuestionEvaluationGrade[];
  overallFeedback: string;
  unmatchedAnswers: StudentAnswerRegion[];
  unansweredQuestionIds: string[];
};

export type ExtractionPipelinePhase =
  | "queued"
  | "extracting_questions"
  | "extracting_answers"
  | "mapping"
  | "grading"
  | "done"
  | "error";

export type AssessmentExtractionSession = {
  id: string;
  createdAt: number;
  status: ExtractionPipelinePhase;
  progress: number;
  message: string;
  error?: string;
  questionPaperPages: string[];
  answerSheetPages: string[];
  questionPaperName: string;
  answerSheetName: string;
  result?: AssessmentMappingResult;
};

export type PublicAssessmentSessionDTO = {
  id: string;
  status: ExtractionPipelinePhase;
  progress: number;
  message: string;
  error?: string;
  questionPaperName: string;
  answerSheetName: string;
  questionPaperPageCount: number;
  answerSheetPageCount: number;
  answerSheetPages?: string[];
  result?: AssessmentMappingResult;
};
