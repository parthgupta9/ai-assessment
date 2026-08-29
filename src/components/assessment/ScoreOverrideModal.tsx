"use client";

import { useState } from "react";
import type {
  QuestionEvaluationGrade,
  QuestionPaperItem,
} from "@/types/assessment-extraction";

type Props = {
  question: QuestionPaperItem;
  grade: QuestionEvaluationGrade;
  onSave: (updatedGrade: QuestionEvaluationGrade) => void;
  onClose: () => void;
};

export function ScoreOverrideModal({
  question,
  grade,
  onSave,
  onClose,
}: Props) {
  const [score, setScore] = useState<number>(grade.score);
  const [status, setStatus] = useState<
    "correct" | "incorrect" | "partial" | "unanswered"
  >(grade.status);
  const [feedback, setFeedback] = useState<string>(grade.feedback);

  const maxScore = grade.maxScore || question.maxMarks || 1;

  function handleScoreChange(val: number) {
    const clamped = Math.max(0, Math.min(maxScore, val));
    setScore(clamped);

    if (clamped >= maxScore) {
      setStatus("correct");
    } else if (clamped === 0) {
      setStatus("incorrect");
    } else {
      setStatus("partial");
    }
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      ...grade,
      score,
      status,
      feedback: feedback.trim(),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#ececec] px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-[#111]">
              Override Marks & Feedback
            </h3>
            <p className="text-xs text-[#6b7280]">
              Question {question.number.replace(/\.$/, "")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-[#9ca3af] hover:bg-[#f5f5f5]"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4 p-6">
          {/* Question Text */}
          <div className="rounded-xl bg-[#fafafa] p-3 text-xs text-[#444] border border-[#f0f0f0]">
            <p className="font-semibold text-[#111] mb-1">Question:</p>
            <p className="leading-relaxed">{question.text}</p>
          </div>

          {/* Score Input */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#374151]">
                Awarded Score
              </label>
              <span className="text-xs text-[#6b7280]">Max: {maxScore} marks</span>
            </div>
            <div className="mt-1.5 flex items-center gap-3">
              <input
                type="number"
                min="0"
                max={maxScore}
                step="0.5"
                value={score}
                onChange={(e) => handleScoreChange(parseFloat(e.target.value) || 0)}
                className="w-24 rounded-xl border border-[#d1d5db] px-3 py-2 text-sm font-semibold text-[#111] focus:border-[#ff5a1f] focus:outline-none focus:ring-1 focus:ring-[#ff5a1f]"
              />
              <span className="text-sm font-medium text-[#6b7280]">/ {maxScore}</span>
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="text-xs font-semibold text-[#374151]">
              Grading Status
            </label>
            <div className="mt-1.5 grid grid-cols-4 gap-2">
              {(["correct", "partial", "incorrect", "unanswered"] as const).map(
                (opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setStatus(opt)}
                    className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold capitalize transition ${
                      status === opt
                        ? opt === "correct"
                          ? "bg-green-600 text-white"
                          : opt === "partial"
                          ? "bg-amber-500 text-white"
                          : "bg-red-600 text-white"
                        : "bg-[#f3f4f6] text-[#4b5563] hover:bg-[#e5e7eb]"
                    }`}
                  >
                    {opt}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div>
            <label className="text-xs font-semibold text-[#374151]">
              Teacher Evaluation Feedback
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide constructive feedback for the student..."
              className="mt-1.5 w-full rounded-xl border border-[#d1d5db] p-3 text-xs leading-relaxed text-[#111] placeholder:text-[#9ca3af] focus:border-[#ff5a1f] focus:outline-none focus:ring-1 focus:ring-[#ff5a1f]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0f0f0]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-xs font-semibold text-[#4b5563] hover:bg-[#f3f4f6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#ff5a1f] px-5 py-2 text-xs font-semibold text-white shadow hover:bg-[#ea4e15] transition"
            >
              Save Grade Override
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
