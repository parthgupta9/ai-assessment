"use client";

import type { ExtractionPipelinePhase } from "@/types/assessment-extraction";

type Props = {
  phase?: ExtractionPipelinePhase;
  message?: string;
  error?: string;
  onRetry?: () => void;
};

const STAGES = [
  { key: "extracting_questions", label: "Question Extraction" },
  { key: "extracting_answers", label: "Answer Extraction" },
  { key: "mapping", label: "Answer Mapping" },
  { key: "grading", label: "Grading & Feedback" },
] as const;

export function ExtractionProgressIndicator({
  phase = "queued",
  message = "Processing Assessment...",
  error,
  onRetry,
}: Props) {
  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
          ⚠️
        </div>
        <p className="text-xl font-semibold text-[#111]">Extraction Error</p>
        <p className="mt-2 max-w-md text-sm text-[#6b7280]">{error}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 rounded-full bg-[#2a2a2a] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#ff5a1f] transition"
          >
            Retry Extraction Pipeline
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      {/* Animated Sparkles */}
      <div className="relative mb-8 h-20 w-28">
        <span className="absolute left-2 top-6 animate-[sparkle_1.6s_ease-in-out_infinite] text-[#ff5a1f]">
          ✦
        </span>
        <span className="absolute left-1/2 top-0 -translate-x-1/2 animate-[sparkle_1.8s_ease-in-out_infinite] text-[#ff5a1f] text-3xl">
          ✦
        </span>
        <span className="absolute right-1 top-8 animate-[sparkle_1.4s_ease-in-out_infinite] text-[#ff5a1f]">
          ✦
        </span>
      </div>

      <h2 className="text-2xl font-semibold tracking-tight text-[#111]">
        Processing Assessment
      </h2>
      <p className="mt-2 text-sm text-[#9ca3af]">{message}</p>

      {/* Pipeline Stages Progress Bar */}
      <div className="mt-8 flex w-full max-w-md items-center justify-between border-t border-[#f0f0f0] pt-6">
        {STAGES.map((st, idx) => {
          const activeIndex = STAGES.findIndex((s) => s.key === phase);
          const isDone = activeIndex > idx || phase === "done";
          const isCurrent = st.key === phase;

          return (
            <div key={st.key} className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                  isDone
                    ? "bg-[#16a34a] text-white"
                    : isCurrent
                    ? "bg-[#ff5a1f] text-white animate-pulse"
                    : "bg-[#f0f0f0] text-[#9ca3af]"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </div>
              <span className="text-[10px] font-medium text-[#6b7280]">
                {st.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
