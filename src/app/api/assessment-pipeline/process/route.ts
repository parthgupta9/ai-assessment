import { NextRequest, NextResponse } from "next/server";
import {
  processAndNormalizePageImage,
  validatePageLimit,
} from "@/services/document/image-processor";
import { runAssessmentExtractionPipeline } from "@/services/pipeline/assessment-extraction-pipeline";
import {
  createExtractionSession,
  getExtractionSession,
  serializePublicSessionDTO,
} from "@/services/storage/assessment-session-store";

export const runtime = "nodejs";
export const maxDuration = 300;

const ACCEPTED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

async function extractPagesFromFormData(
  formData: FormData,
  fieldKey: string,
  documentLabel: string
): Promise<string[]> {
  const fileEntries = formData.getAll(fieldKey);
  if (!fileEntries.length) {
    throw new Error(`${documentLabel} file is required.`);
  }

  const base64Pages: string[] = [];
  for (const entry of fileEntries) {
    if (!(entry instanceof File)) continue;
    if (
      !ACCEPTED_IMAGE_TYPES.has(entry.type) &&
      !entry.type.startsWith("image/")
    ) {
      throw new Error(
        `Unsupported file type "${entry.type || entry.name}" for ${documentLabel}. Upload PDF or standard image files.`
      );
    }
    const buffer = Buffer.from(await entry.arrayBuffer());
    const normalized = await processAndNormalizePageImage(
      buffer,
      entry.type || "image/jpeg"
    );
    base64Pages.push(`data:${normalized.mimeType};base64,${normalized.base64}`);
  }

  validatePageLimit(base64Pages.length, documentLabel);
  return base64Pages;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const questionPaperName =
      String(formData.get("questionPaperName") || "question-paper.pdf") ||
      "question-paper.pdf";
    const answerSheetName =
      String(formData.get("answerSheetName") || "answer-sheet.pdf") ||
      "answer-sheet.pdf";

    const questionPaperPages = await extractPagesFromFormData(
      formData,
      "questionPaperPages",
      "Question Paper"
    );
    const answerSheetPages = await extractPagesFromFormData(
      formData,
      "answerSheetPages",
      "Answer Sheet"
    );

    const session = createExtractionSession({
      questionPaperPages,
      answerSheetPages,
      questionPaperName,
      answerSheetName,
    });

    // Run pipeline synchronously within request lifecycle
    await runAssessmentExtractionPipeline(session.id);

    const completed = getExtractionSession(session.id);
    if (!completed) {
      return NextResponse.json(
        { error: "Session creation failed." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      serializePublicSessionDTO(completed, { includePages: true }),
      { status: 201 }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Pipeline execution failed.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
