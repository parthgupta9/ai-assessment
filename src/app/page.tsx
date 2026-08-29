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
import Image from "next/image";

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
        <div className="flex flex-1 flex-col items-center justify-start overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          <h1 className="max-w-2xl text-center text-2xl font-bold tracking-tight text-[#111] sm:text-3xl lg:text-[32px]">
            Upload{" "}
            <span className="rounded-xl  px-2.5 py-0.5 font-bold text-[#ff5a1f] inline-block">
              Question Paper & Answer Sheets
            </span>
          </h1>

          <p className="mt-1.5 text-center text-xs sm:text-sm text-[#6b7280]">
            Upload both files to get started
          </p>

          {/* Center Teacher Avatar Illustration with Orbiting Elements */}
          <div className="relative my-6 sm:my-7 flex h-32 w-32 items-center justify-center">
           
           <Image src="/4.png" alt="Teacher Avatar" height={128} width={128} className="relative z-10" />
          </div>

          {/* File Upload Dropzones */}
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

          {/* Action Button */}
          <button
            type="button"
            disabled={!isReadyToStart}
            onClick={() => void handleStartExtractionPipeline()}
            className="mt-6 sm:mt-8 inline-flex items-center gap-2 rounded-full bg-[#2a2a2a] px-8 py-3 text-sm font-semibold text-white shadow-sm transition enabled:hover:bg-[#111] disabled:cursor-not-allowed disabled:bg-[#c5c5c5] disabled:text-[#f5f5f5]"
          >
            Start Mapping
            <span aria-hidden className="text-base leading-none">→</span>
          </button>

          {/* Subtext info */}
          <p className="mt-3 max-w-sm text-center text-xs text-[#8e8e93]">
            Once both files are uploaded, you&apos;ll able to map answers with questions
          </p>

          {errorMessage ? (
            <p className="mt-4 max-w-lg rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
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
    <svg width="68" height="68" viewBox="0 0 80 80" fill="none" aria-hidden>
      {/* Hair back */}
      <circle cx="40" cy="38" r="22" fill="#2d221e" />
      {/* Face */}
      <circle cx="40" cy="36" r="16" fill="#fed7aa" />
      {/* Glasses */}
      <rect x="29" y="32" width="9" height="7" rx="2" fill="none" stroke="#374151" strokeWidth="1.5" />
      <rect x="42" y="32" width="9" height="7" rx="2" fill="none" stroke="#374151" strokeWidth="1.5" />
      <line x1="38" y1="35" x2="42" y2="35" stroke="#374151" strokeWidth="1.5" />
      {/* Eyes */}
      <circle cx="33.5" cy="35.5" r="1.5" fill="#1f2937" />
      <circle cx="46.5" cy="35.5" r="1.5" fill="#1f2937" />
      {/* Smile */}
      <path d="M36 43c1.5 1.5 6.5 1.5 8 0" stroke="#ea580c" strokeWidth="1.5" strokeLinecap="round" />
      {/* Hair front */}
      <path d="M26 32c2-8 10-14 14-14s12 6 14 14c-4-4-9-6-14-6s-10 2-14 6z" fill="#2d221e" />
      {/* Body / Blazer */}
      <path d="M22 68c2-14 10-18 18-18s16 4 18 18" fill="#1f2937" />
      <polygon points="40,50 35,62 45,62" fill="#fff" />
      {/* Document / Folder in hands */}
      <rect x="33" y="58" width="14" height="12" rx="2" fill="#ffedd5" stroke="#ff5a1f" strokeWidth="1" />
    </svg>
  );
}
