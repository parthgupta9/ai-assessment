"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AssessmentAppLayout } from "@/components/layout/AssessmentAppLayout";
import { ExtractionProgressIndicator } from "@/components/common/ExtractionProgressIndicator";
import { AssessmentUploadPortal } from "@/components/document-upload/AssessmentUploadPortal";
import {
  convertBlobsToPageFiles,
  convertPdfOrImageToBlobs,
} from "@/services/document/pdf-converter";
import { saveAssessmentSessionClient } from "@/services/storage/client-session";
import type { PublicAssessmentSessionDTO } from "@/types/assessment-extraction";

type PreparedDoc = {
  file: File;
  pages: File[];
};

export default function AssessmentUploadPage() {
  const router = useRouter();
  const [questionPaper, setQuestionPaper] = useState<PreparedDoc | null>(null);
  const [answerSheet, setAnswerSheet] = useState<PreparedDoc | null>(null);
  const [converting, setConverting] = useState<"qp" | "as" | null>(null);
  const [isProcessingPipeline, setIsProcessingPipeline] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isReadyToStart =
    Boolean(questionPaper && answerSheet) && !converting && !isProcessingPipeline;

  async function handlePickFile(kind: "qp" | "as", file: File | null) {
    setErrorMessage(null);
    if (!file) {
      if (kind === "qp") setQuestionPaper(null);
      else setAnswerSheet(null);
      return;
    }

    setConverting(kind);
    try {
      const pageBlobs = await convertPdfOrImageToBlobs(file);
      const pageFiles = convertBlobsToPageFiles(
        pageBlobs,
        kind === "qp" ? "question-paper" : "answer-sheet"
      );
      const prepared = { file, pages: pageFiles };

      if (kind === "qp") setQuestionPaper(prepared);
      else setAnswerSheet(prepared);
    } catch (err) {
      if (kind === "qp") setQuestionPaper(null);
      else setAnswerSheet(null);
      setErrorMessage(
        err instanceof Error ? err.message : "Could not process document file."
      );
    } finally {
      setConverting(null);
    }
  }

  async function handleStartExtractionPipeline() {
    if (!questionPaper || !answerSheet) return;
    setIsProcessingPipeline(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.set("questionPaperName", questionPaper.file.name);
      formData.set("answerSheetName", answerSheet.file.name);

      for (const page of questionPaper.pages) {
        formData.append("questionPaperPages", page);
      }
      for (const page of answerSheet.pages) {
        formData.append("answerSheetPages", page);
      }

      const res = await fetch("/api/assessment-pipeline/process", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as PublicAssessmentSessionDTO & {
        error?: string;
      };

      if (!res.ok) {
        throw new Error(data.error || "Failed to execute extraction pipeline.");
      }

      saveAssessmentSessionClient(data);
      router.push(`/review/${data.id}`);
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Pipeline execution failed."
      );
      setIsProcessingPipeline(false);
    }
  }

  return (
    <AssessmentAppLayout collapsed={isProcessingPipeline}>
      {isProcessingPipeline ? (
        <ExtractionProgressIndicator />
      ) : (
        <div className="flex flex-1 flex-col items-center overflow-y-auto px-6 py-10 sm:px-10">
          <h1 className="max-w-3xl text-center text-3xl font-semibold tracking-tight text-[#111] sm:text-4xl">
            Upload{" "}
            <span className="rounded-lg bg-[#ff5a1f] px-2 py-0.5 text-white">
              Question Paper & Answer Sheets
            </span>
          </h1>
          <p className="mt-3 max-w-xl text-center text-sm text-[#6b7280]">
            AI Assessment Extraction & Answer Mapping: Upload printed question paper and handwritten student answer sheet to view side-by-side exact region mapping.
          </p>

          <div className="relative my-8 flex h-40 w-40 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#fff1eb]" />
            <div className="relative z-10 flex h-28 w-28 animate-[float-soft_3s_ease-in-out_infinite] items-center justify-center rounded-full bg-gradient-to-br from-[#fdba74] to-[#ff5a1f] shadow-md">
              <TeacherAvatar />
            </div>
            <span className="absolute -left-1 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow">
              <DocIcon />
            </span>
            <span className="absolute -right-2 top-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#ff5a1f] shadow">
              ✦
            </span>
            <span className="absolute bottom-2 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#16a34a] shadow font-bold text-xs">
              ✓
            </span>
          </div>

          <AssessmentUploadPortal
            questionPaperFile={questionPaper?.file ?? null}
            questionPaperPageCount={questionPaper?.pages.length}
            convertingQuestionPaper={converting === "qp"}
            onSelectQuestionPaper={(f) => void handlePickFile("qp", f)}
            answerSheetFile={answerSheet?.file ?? null}
            answerSheetPageCount={answerSheet?.pages.length}
            convertingAnswerSheet={converting === "as"}
            onSelectAnswerSheet={(f) => void handlePickFile("as", f)}
          />

          <button
            type="button"
            disabled={!isReadyToStart}
            onClick={() => void handleStartExtractionPipeline()}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#2a2a2a] px-8 py-3 text-sm font-semibold text-white transition enabled:hover:bg-[#111] disabled:cursor-not-allowed disabled:bg-[#e5e5e5] disabled:text-[#a3a3a3]"
          >
            Start Assessment Mapping & Extraction
            <span aria-hidden>→</span>
          </button>

          <p className="mt-4 max-w-md text-center text-xs text-[#a3a3a3]">
            Supports multi-page PDF & high-resolution handwritten answer sheet images.
          </p>

          {errorMessage ? (
            <p className="mt-4 max-w-lg rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {errorMessage}
            </p>
          ) : null}
        </div>
      )}
    </AssessmentAppLayout>
  );
}

function TeacherAvatar() {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" aria-hidden>
      <circle cx="32" cy="24" r="12" fill="#fff7ed" />
      <path d="M12 56c2-14 12-20 20-20s18 6 20 20" fill="#fff7ed" />
      <rect x="38" y="30" width="14" height="18" rx="2" fill="#fff" opacity="0.9" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.75">
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}
