import {
  GoogleGenerativeAI,
  SchemaType,
  type GenerativeModel,
  type Part,
  type ResponseSchema,
} from "@google/generative-ai";
import {
  GeminiAnswersResponseSchema,
  GeminiGradesResponseSchema,
  GeminiQuestionsResponseSchema,
} from "@/types/assessment";
import {
  QUESTION_EXTRACTION_PROMPT,
  buildAnswerExtractionPrompt,
  buildGradingPrompt,
} from "./prompt-templates";

const GEMINI_MODEL_NAME = process.env.GEMINI_MODEL || "gemini-1.5-flash";

function getGenerativeAIClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY environment variable is required. Please check .env.local or deployment configuration."
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

function getStructuredModel(schema: ResponseSchema): GenerativeModel {
  const ai = getGenerativeAIClient();
  return ai.getGenerativeModel({
    model: GEMINI_MODEL_NAME,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });
}

function convertPagesToParts(
  pages: { base64: string; mimeType: string }[],
  label: string
): Part[] {
  const parts: Part[] = [];
  pages.forEach((page, idx) => {
    parts.push({ text: `${label} Page ${idx + 1} (pageIndex ${idx}):` });
    parts.push({
      inlineData: {
        data: page.base64,
        mimeType: page.mimeType,
      },
    });
  });
  return parts;
}

function parseJsonResponse(rawText: string): unknown {
  const cleanText = rawText.trim();
  try {
    return JSON.parse(cleanText);
  } catch {
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Generative AI response is not valid JSON.");
  }
}

async function requestStructuredJson<T>(
  model: GenerativeModel,
  parts: Part[],
  validator: (data: unknown) => T
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await model.generateContent({
        contents: [{ role: "user", parts }],
      });
      const text = response.response.text();
      return validator(parseJsonResponse(text));
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini AI API execution failed after retries.");
}

// Response Schemas for Gemini Structured JSON Output
const questionsResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    questions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          number: { type: SchemaType.STRING },
          text: { type: SchemaType.STRING },
          maxMarks: { type: SchemaType.NUMBER, nullable: true },
        },
        required: ["number", "text"],
      },
    },
  },
  required: ["questions"],
};

const answersResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    answers: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          questionNumber: { type: SchemaType.STRING, nullable: true },
          transcribedText: { type: SchemaType.STRING },
          regions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                pageIndex: { type: SchemaType.NUMBER },
                x: { type: SchemaType.NUMBER },
                y: { type: SchemaType.NUMBER },
                w: { type: SchemaType.NUMBER },
                h: { type: SchemaType.NUMBER },
              },
              required: ["pageIndex", "x", "y", "w", "h"],
            },
          },
        },
        required: ["transcribedText", "regions"],
      },
    },
  },
  required: ["answers"],
};

const gradesResponseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    overallFeedback: { type: SchemaType.STRING },
    grades: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          questionNumber: { type: SchemaType.STRING },
          status: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["correct", "incorrect", "partial", "unanswered"],
          },
          score: { type: SchemaType.NUMBER },
          maxScore: { type: SchemaType.NUMBER },
          feedback: { type: SchemaType.STRING },
        },
        required: [
          "questionNumber",
          "status",
          "score",
          "maxScore",
          "feedback",
        ],
      },
    },
  },
  required: ["overallFeedback", "grades"],
};

export async function extractQuestionsFromPages(
  pages: { base64: string; mimeType: string }[]
) {
  const model = getStructuredModel(questionsResponseSchema);
  const parts = [
    { text: QUESTION_EXTRACTION_PROMPT },
    ...convertPagesToParts(pages, "Question Paper"),
  ];
  const res = await requestStructuredJson(model, parts, (data) =>
    GeminiQuestionsResponseSchema.parse(data)
  );
  return res.questions;
}

export async function extractAnswersFromPages(
  pages: { base64: string; mimeType: string }[],
  questionNumbers: string[]
) {
  const model = getStructuredModel(answersResponseSchema);
  const prompt = buildAnswerExtractionPrompt(questionNumbers);
  const parts = [
    { text: prompt },
    ...convertPagesToParts(pages, "Answer Sheet"),
  ];
  const res = await requestStructuredJson(model, parts, (data) =>
    GeminiAnswersResponseSchema.parse(data)
  );

  return res.answers.map((ans) => ({
    ...ans,
    regions: ans.regions.map((r) => ({
      pageIndex: Math.max(0, Math.floor(r.pageIndex)),
      x: clampNormalized(r.x),
      y: clampNormalized(r.y),
      w: clampNormalized(r.w),
      h: clampNormalized(r.h),
    })),
  }));
}

export async function generateAnswerGrading(
  questions: { number: string; text: string; maxMarks?: number | null }[],
  answers: { questionNumber?: string | null; transcribedText: string }[]
) {
  const model = getStructuredModel(gradesResponseSchema);
  const prompt = buildGradingPrompt(questions, answers);
  const parts = [{ text: prompt }];
  return await requestStructuredJson(model, parts, (data) =>
    GeminiGradesResponseSchema.parse(data)
  );
}

function clampNormalized(val: number): number {
  if (Number.isNaN(val)) return 0;
  return Math.min(1, Math.max(0, val));
}

export function getCurrentModelName(): string {
  return GEMINI_MODEL_NAME;
}
