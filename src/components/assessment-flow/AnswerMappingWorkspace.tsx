"use client";

import type { AnswerSheetBoundingBox, AssessmentMappingResult } from "@/types/assessment-extraction";
import { QuestionPaperExtractor } from "./QuestionPaperExtractor";
import { AnswerSheetRegionHighlighter } from "./AnswerSheetRegionHighlighter";

type Props = {
  result: AssessmentMappingResult;
  answerSheetPages: string[];
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string) => void;
  answeredQuestionIdsSet: Set<string>;
  activeHighlights: AnswerSheetBoundingBox[];
  questionBadgeLabel: string;
  onEditGrade?: (questionId: string) => void;
};

export function AnswerMappingWorkspace({
  result,
  answerSheetPages,
  selectedQuestionId,
  onSelectQuestion,
  answeredQuestionIdsSet,
  activeHighlights,
  questionBadgeLabel,
  onEditGrade,
}: Props) {
  return (
    <div className="grid min-h-0 flex-1 gap-3 p-3 lg:grid-cols-[minmax(320px,42%)_minmax(0,58%)]">
      {/* Left Column: Question Extraction List */}
      <div className="min-h-[420px] lg:h-[calc(100vh-8.5rem)]">
        <QuestionPaperExtractor
          questions={result.questions}
          grades={result.grades}
          unansweredIds={result.unansweredQuestionIds}
          selectedId={selectedQuestionId}
          onSelectQuestion={onSelectQuestion}
          answeredIds={answeredQuestionIdsSet}
          onEditGrade={onEditGrade}
        />
      </div>

      <div className="min-h-[520px] lg:h-[calc(100vh-8.5rem)]">
        <AnswerSheetRegionHighlighter
          pages={answerSheetPages}
          highlights={activeHighlights}
          unmatched={result.unmatchedAnswers}
          questionLabel={questionBadgeLabel}
        />
      </div>
    </div>
  );
}
