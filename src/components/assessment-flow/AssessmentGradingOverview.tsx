"use client";

import type { AssessmentMappingResult } from "@/types/assessment-extraction";
import { roundDecimal } from "@/lib/utils";

type Props = {
  result: AssessmentMappingResult;
  questionPaperName: string;
  answerSheetName: string;
  onClose: () => void;
};

export function AssessmentGradingOverview({
  result,
  questionPaperName,
  answerSheetName,
  onClose,
}: Props) {
  const totalObtainedScore = result.grades.reduce((sum, g) => sum + g.score, 0);
  const totalMaxMarks = result.grades.reduce((sum, g) => sum + g.maxScore, 0);
  const percentageScore =
    totalMaxMarks > 0
      ? Math.round((totalObtainedScore / totalMaxMarks) * 100)
      : 0;

  function handlePrintReport() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ececec] px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-[#111]">
              AI Assessment Grading Summary & Insights
            </h3>
            <p className="text-xs text-[#6b7280]">
              {questionPaperName} · {answerSheetName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintReport}
              className="rounded-full bg-[#2a2a2a] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#111] transition"
            >
              Export PDF / Print Report
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-[#9ca3af] hover:bg-[#f5f5f5]"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBox
              label="Final Score"
              value={`${roundDecimal(totalObtainedScore)} / ${roundDecimal(totalMaxMarks)} (${percentageScore}%)`}
              color="text-[#ff5a1f]"
            />
            <StatBox
              label="Extracted Questions"
              value={String(result.questions.length)}
            />
            <StatBox
              label="Unanswered"
              value={String(result.unansweredQuestionIds.length)}
              color={result.unansweredQuestionIds.length > 0 ? "text-red-600" : "text-gray-900"}
            />
            <StatBox
              label="Unmatched Answers"
              value={String(result.unmatchedAnswers.length)}
              color={result.unmatchedAnswers.length > 0 ? "text-amber-600" : "text-gray-900"}
            />
          </div>

          {/* AI Overall Insight */}
          <div className="rounded-2xl border border-[#ffecd6] bg-[#fffbf7] p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#ff5a1f]">
              AI Teacher Feedback & Summary Analysis
            </h4>
            <p className="mt-2 text-sm leading-relaxed text-[#444]">
              {result.overallFeedback || "No overall feedback generated."}
            </p>
          </div>

          {/* Question Level Breakdown */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-[#111]">
              Question-by-Question Grading & Mapping Details
            </h4>
            <div className="space-y-2">
              {result.questions.map((q) => {
                const grade = result.grades.find((g) => g.questionId === q.id);
                const answer = result.answers.find((a) => a.questionId === q.id);
                const unanswered = result.unansweredQuestionIds.includes(q.id);

                return (
                  <div
                    key={q.id}
                    className="rounded-xl border border-[#ececec] p-3 text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-[#111]">
                        Q{q.number}: {q.text}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 ${
                          unanswered
                            ? "bg-red-100 text-red-700"
                            : grade?.status === "correct"
                            ? "bg-green-100 text-green-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {grade ? `${grade.score} / ${grade.maxScore}` : "0"}
                      </span>
                    </div>

                    <p className="mt-1 text-[#6b7280]">
                      <span className="font-medium text-[#444]">Student Answer: </span>
                      {answer?.transcribedText || "No answer region mapped."}
                    </p>

                    {grade?.feedback ? (
                      <p className="mt-1 text-[#ff5a1f]">
                        <span className="font-medium text-[#c44415]">Feedback: </span>
                        {grade.feedback}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  color = "text-[#111]",
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#f0f0f0] bg-[#fafafa] p-3 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9ca3af]">
        {label}
      </p>
      <p className={`mt-1 text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}
