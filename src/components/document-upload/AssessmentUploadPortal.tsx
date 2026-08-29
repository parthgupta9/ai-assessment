"use client";

import { DocumentDropzone } from "@/components/upload/DocumentDropzone";

type Props = {
  questionPaperFile: File | null;
  questionPaperPageCount?: number;
  convertingQuestionPaper?: boolean;
  onSelectQuestionPaper: (file: File | null) => void;

  answerSheetFile: File | null;
  answerSheetPageCount?: number;
  convertingAnswerSheet?: boolean;
  onSelectAnswerSheet: (file: File | null) => void;
};

export function AssessmentUploadPortal({
  questionPaperFile,
  questionPaperPageCount,
  convertingQuestionPaper,
  onSelectQuestionPaper,
  answerSheetFile,
  answerSheetPageCount,
  convertingAnswerSheet,
  onSelectAnswerSheet,
}: Props) {
  return (
    <div className="grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
      <DocumentDropzone
        accentWord="Question"
        restLabel="Paper"
        file={questionPaperFile}
        pageCount={questionPaperPageCount}
        converting={convertingQuestionPaper}
        onFileSelect={onSelectQuestionPaper}
      />
      <DocumentDropzone
        accentWord="Answer"
        restLabel="Sheet"
        file={answerSheetFile}
        pageCount={answerSheetPageCount}
        converting={convertingAnswerSheet}
        onFileSelect={onSelectAnswerSheet}
      />
    </div>
  );
}
