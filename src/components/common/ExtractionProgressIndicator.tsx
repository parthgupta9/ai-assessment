"use client";

import type { ExtractionPipelinePhase } from "@/types/assessment-extraction";

type Props = {
  phase?: ExtractionPipelinePhase;
  message?: string;
  error?: string;
  onRetry?: () => void;
};


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

   
    </div>
  );
}
