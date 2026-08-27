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
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
      <DocumentDropzone
        accentWord="Question"
        restLabel="Paper"
        file={questionPaperFile}
        pageCount={questionPaperPageCount}
        converting={convertingQuestionPaper}
        onFileSelect={onSelectQuestionPaper}
      />
      <DocumentDropzone
        accentWord="Student Answer"
        restLabel="Sheet"
        file={answerSheetFile}
        pageCount={answerSheetPageCount}
        converting={convertingAnswerSheet}
        onFileSelect={onSelectAnswerSheet}
      />
    </div>
  );
}
