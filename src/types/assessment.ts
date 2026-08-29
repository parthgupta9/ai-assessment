import { z } from "zod";

export const GeminiQuestionsResponseSchema = z.object({
  questions: z.array(
    z.object({
      number: z.string(),
      text: z.string(),
      maxMarks: z.number().nullable().optional(),
    })
  ),
});

export const GeminiAnswersResponseSchema = z.object({
  answers: z.array(
    z.object({
      questionNumber: z.string().nullable().optional(),
      transcribedText: z.string(),
      regions: z.array(
        z.object({
          pageIndex: z.number(),
          x: z.number(),
          y: z.number(),
          w: z.number(),
          h: z.number(),
        })
      ),
    })
  ),
});

export const GeminiGradesResponseSchema = z.object({
  overallFeedback: z.string(),
  grades: z.array(
    z.object({
      questionNumber: z.string(),
      status: z.enum(["correct", "incorrect", "partial", "unanswered"]),
      score: z.number(),
      maxScore: z.number(),
      feedback: z.string(),
    })
  ),
});

export type GeminiQuestionsResponse = z.infer<typeof GeminiQuestionsResponseSchema>;
export type GeminiAnswersResponse = z.infer<typeof GeminiAnswersResponseSchema>;
export type GeminiGradesResponse = z.infer<typeof GeminiGradesResponseSchema>;
