"use client";

import { useMemo, useState } from "react";
import type { QuestionEvaluationGrade, QuestionPaperItem } from "@/types/assessment-extraction";
import { roundDecimal } from "@/lib/utils";

type FilterTab = "all" | "correct" | "partial" | "incorrect" | "unanswered";

type Props = {
  questions: QuestionPaperItem[];
  grades: QuestionEvaluationGrade[];
  unansweredIds: string[];
  selectedId: string | null;
  onSelectQuestion: (id: string) => void;
  answeredIds: Set<string>;
  onEditGrade?: (questionId: string) => void;
};

function getBadgeClass(grade: QuestionEvaluationGrade | undefined, unanswered: boolean) {
  if (!grade || unanswered || grade.status === "unanswered") {
    return "bg-[#fee2e2] text-[#dc2626]";
  }
  if (grade.status === "correct" || grade.score >= grade.maxScore) {
    return "bg-[#dcfce7] text-[#16a34a]";
  }
  if (grade.status === "incorrect" || grade.score === 0) {
    return "bg-[#fee2e2] text-[#dc2626]";
  }
  return "bg-[#ffedd5] text-[#ea580c]";
}

export function QuestionPaperExtractor({
  questions,
  grades,
  unansweredIds,
  selectedId,
  onSelectQuestion,
  answeredIds,
  onEditGrade,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const gradeByQuestion = useMemo(() => {
    const map = new Map<string, QuestionEvaluationGrade>();
    for (const g of grades) map.set(g.questionId, g);
    return map;
  }, [grades]);

  const filteredQuestions = useMemo(() => {
    if (activeFilter === "all") return questions;
    return questions.filter((q) => {
      const g = gradeByQuestion.get(q.id);
      const unanswered = unansweredIds.includes(q.id) || !answeredIds.has(q.id);
      if (activeFilter === "unanswered") return unanswered;
      if (unanswered) return false;
      return g?.status === activeFilter;
    });
  }, [questions, activeFilter, gradeByQuestion, unansweredIds, answeredIds]);

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleExpandAll() {
    if (expandedIds.size === questions.length) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(questions.map((q) => q.id)));
    }
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-[#fafafa]">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-[#ececec] bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[#111]">
            Question Extraction (from question paper)
            
          </h2>
          <button
            type="button"
            onClick={toggleExpandAll}
            className="text-xs font-medium text-black hover:text-[#111] border-2 rounded-2xl border-[#ececec] px-3 py-1.5 transition"
          >
            {expandedIds.size === questions.length ? "Collapse All" : "Expand All"}
          </button>
        </div>

      
      </div>

      {/* Extracted Questions List */}
      <ul className="flex-1 space-y-2 overflow-y-auto p-3">
        {filteredQuestions.length === 0 ? (
          <li className="p-8 text-center text-xs text-[#9ca3af]">
            No questions match status "{activeFilter}".
          </li>
        ) : (
          filteredQuestions.map((q, index) => {
            const grade = gradeByQuestion.get(q.id);
            const isUnanswered =
              unansweredIds.includes(q.id) || !answeredIds.has(q.id);
            const isSelected = selectedId === q.id;
            const isOpen = expandedIds.has(q.id);
            const displayNum = q.number.replace(/\.$/, "") || String(index + 1);

            return (
              <li key={q.id}>
                <div
                  className={`rounded-2xl border bg-white transition ${
                    isSelected
                      ? "border-[#ff5a1f] shadow-[0_0_0_1px_rgba(255,90,31,0.25)]"
                      : "border-[#ececec]"
                  }`}
                >
                  <div
                    className="flex w-full cursor-pointer items-start gap-3 px-3 py-3 text-left"
                    onClick={() => {
                      onSelectQuestion(q.id);
                      if (!isOpen) toggleExpanded(q.id);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelectQuestion(q.id);
                        if (!isOpen) toggleExpanded(q.id);
                      }
                    }}
                  >
                    <span className="mt-0.5 flex h-7 min-w-[1.75rem] shrink-0 items-center justify-center rounded-full bg-[#f3f3f3] px-1 text-xs font-semibold text-[#111]">
                      {displayNum}
                    </span>
                    <span className="min-w-0 flex-1 text-sm leading-snug text-[#111]">
                      {q.text}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${getBadgeClass(
                        grade,
                        isUnanswered
                      )}`}
                    >
                      {grade
                        ? `${roundDecimal(grade.score)}/${roundDecimal(grade.maxScore)}`
                        : "—"}
                    </span>
                    <button
                      type="button"
                      className="mt-0.5 shrink-0 rounded p-0.5 text-[#9ca3af] hover:bg-[#f5f5f5]"
                      aria-label={isOpen ? "Collapse" : "Expand"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(q.id);
                        onSelectQuestion(q.id);
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        className={`transition ${isOpen ? "rotate-180" : ""}`}
                      >
                        <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>

                  {isOpen && grade ? (
                    <div className="border-t border-[#f0f0f0] px-3 pb-3 pt-2">
                      <div className="rounded-xl bg-[#f9f9f9] px-3 py-2.5">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-[13px] tracking-wide text-black">
                            AI Feedback
                          </p>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-[#444]">
                          {grade.feedback}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
