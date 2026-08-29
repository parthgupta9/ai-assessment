import {
  GoogleGenerativeAI,
  SchemaType,
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

let cachedDiscoveredModels: string[] | null = null;

function getApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY environment variable is missing. Please add it to your Vercel Environment Variables."
    );
  }
  return apiKey;
}

function getGenerativeAIClient(): GoogleGenerativeAI {
  return new GoogleGenerativeAI(getApiKey());
}

async function discoverSupportedModels(apiKey: string): Promise<string[]> {
  if (cachedDiscoveredModels && cachedDiscoveredModels.length > 0) {
    return cachedDiscoveredModels;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      { cache: "no-store" }
    );

    if (res.ok) {
      const data = (await res.json()) as {
        models?: { name: string; supportedGenerationMethods?: string[] }[];
      };
      if (data.models && Array.isArray(data.models)) {
        const available = data.models
          .filter((m) =>
            m.supportedGenerationMethods?.includes("generateContent")
          )
          .map((m) => m.name.replace(/^models\//, ""));

        if (available.length > 0) {
          // Sort to prioritize fast flash models then pro models
          available.sort((a, b) => {
            const getPriority = (name: string) => {
              if (name.includes("2.0-flash")) return 1;
              if (name.includes("1.5-flash")) return 2;
              if (name.includes("flash")) return 3;
              if (name.includes("pro")) return 4;
              return 5;
            };
            return getPriority(a) - getPriority(b);
          });

          cachedDiscoveredModels = available;
          return available;
        }
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      if (errData?.error?.message) {
        throw new Error(errData.error.message);
      }
    }
  } catch (err) {
    // If specific API error thrown, rethrow so user sees exact reason
    if (err instanceof Error && err.message.includes("API key")) {
      throw err;
    }
  }

  const fallback = [
    process.env.GEMINI_MODEL,
    "gemini-2.0-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.5-flash",
    "gemini-2.0-flash-exp",
  ].filter(Boolean) as string[];

  cachedDiscoveredModels = fallback;
  return fallback;
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
  schema: ResponseSchema,
  parts: Part[],
  validator: (data: unknown) => T
): Promise<T> {
  const apiKey = getApiKey();
  const ai = getGenerativeAIClient();
  const availableModels = await discoverSupportedModels(apiKey);

  const prioritizedList = [
    process.env.GEMINI_MODEL,
    ...availableModels,
  ].filter(Boolean) as string[];

  const modelsToTry = [...new Set(prioritizedList)];
  let lastError: unknown;

  for (const modelName of modelsToTry) {
    try {
      const model = ai.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await model.generateContent({
            contents: [{ role: "user", parts }],
          });
          const text = response.response.text();
          return validator(parseJsonResponse(text));
        } catch (err) {
          lastError = err;
          const errMsg = err instanceof Error ? err.message : String(err);
          // If model is not found on endpoint, break to try next available model
          if (
            errMsg.includes("404") ||
            errMsg.includes("not found") ||
            errMsg.includes("unsupported") ||
            errMsg.includes("is not supported")
          ) {
            break;
          }
        }
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Gemini AI API execution failed. Please verify your GEMINI_API_KEY has Generative Language API access.");
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
  const parts = [
    { text: QUESTION_EXTRACTION_PROMPT },
    ...convertPagesToParts(pages, "Question Paper"),
  ];
  const res = await requestStructuredJson(
    questionsResponseSchema,
    parts,
    (data) => GeminiQuestionsResponseSchema.parse(data)
  );
  return res.questions;
}

export async function extractAnswersFromPages(
  pages: { base64: string; mimeType: string }[],
  questionNumbers: string[]
) {
  const prompt = buildAnswerExtractionPrompt(questionNumbers);
  const parts = [
    { text: prompt },
    ...convertPagesToParts(pages, "Answer Sheet"),
  ];
  const res = await requestStructuredJson(
    answersResponseSchema,
    parts,
    (data) => GeminiAnswersResponseSchema.parse(data)
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
  const prompt = buildGradingPrompt(questions, answers);
  const parts = [{ text: prompt }];
  return await requestStructuredJson(
    gradesResponseSchema,
    parts,
    (data) => GeminiGradesResponseSchema.parse(data)
  );
}

function clampNormalized(val: number): number {
  if (Number.isNaN(val)) return 0;
  return Math.min(1, Math.max(0, val));
}
