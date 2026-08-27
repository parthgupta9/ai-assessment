"use client";

import { useEffect, useMemo, useState } from "react";
import type { AnswerSheetBoundingBox, StudentAnswerRegion } from "@/types/assessment-extraction";

type Props = {
  pages: string[];
  highlights: AnswerSheetBoundingBox[];
  unmatched: StudentAnswerRegion[];
  questionLabel?: string;
};

export function AnswerSheetRegionHighlighter({
  pages,
  highlights,
  unmatched,
  questionLabel,
}: Props) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const pagesWithHighlights = useMemo(() => {
    const set = new Set(highlights.map((h) => h.pageIndex));
    return set;
  }, [highlights]);

  useEffect(() => {
    if (highlights.length > 0) {
      setCurrentPageIndex(highlights[0].pageIndex);
    }
  }, [highlights]);

  const activeHighlightsOnPage = highlights.filter(
    (box) => box.pageIndex === currentPageIndex
  );
  const totalPagesCount = pages.length || 1;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#ececec] bg-white">
      {/* Viewer Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ececec] bg-[#2f2f2f] px-4 py-2.5 text-white">
        <h2 className="text-sm font-semibold">Answer Sheet Region Highlighter</h2>
        <div className="flex items-center gap-3 text-xs">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 rounded-full bg-white/10 px-1 py-0.5">
            <button
              type="button"
              className="rounded-full px-2 py-1 hover:bg-white/10"
              onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="min-w-[3rem] text-center font-mono">{zoomLevel}%</span>
            <button
              type="button"
              className="rounded-full px-2 py-1 hover:bg-white/10"
              onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
              aria-label="Zoom in"
            >
              +
            </button>
          </div>

          {/* Page Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="rounded-full px-2 py-1 hover:bg-white/10 disabled:opacity-40"
              disabled={currentPageIndex <= 0}
              onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
            >
              ‹
            </button>
            <span>
              Page {currentPageIndex + 1} of {totalPagesCount}
            </span>
            <button
              type="button"
              className="rounded-full px-2 py-1 hover:bg-white/10 disabled:opacity-40"
              disabled={currentPageIndex >= totalPagesCount - 1}
              onClick={() => setCurrentPageIndex((p) => Math.min(totalPagesCount - 1, p + 1))}
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* Canvas Workspace */}
      <div className="flex-1 overflow-auto bg-[#f3f3f3] p-4">
        {unmatched.length > 0 ? (
          <p className="mb-3 text-center text-xs font-medium text-[#6b7280]">
            ⚠️ {unmatched.length} unmapped handwritten answer block{unmatched.length === 1 ? "" : "s"} detected
          </p>
        ) : null}

        {pages[currentPageIndex] ? (
          <div
            className="relative mx-auto origin-top transition-all duration-150"
            style={{
              width: `${zoomLevel}%`,
              maxWidth: "100%",
            }}
          >
            <div className="relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-[#e5e5e5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={pages[currentPageIndex]}
                alt={`Student answer sheet page ${currentPageIndex + 1}`}
                className="block h-auto w-full"
              />

              {/* Exact Region Highlight Boxes */}
              {activeHighlightsOnPage.map((box, idx) => (
                <div
                  key={`region-${box.x}-${box.y}-${idx}`}
                  className="pointer-events-none absolute rounded-sm border-2 border-[#16a34a] bg-[#16a34a]/20 shadow-[0_0_8px_rgba(22,163,74,0.4)]"
                  style={{
                    left: `${box.x * 100}%`,
                    top: `${box.y * 100}%`,
                    width: `${box.w * 100}%`,
                    height: `${box.h * 100}%`,
                  }}
                >
                  <span className="absolute -left-0.5 -top-5 rounded-t bg-[#16a34a] px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    {questionLabel || "Q"}
                  </span>
                </div>
              ))}
            </div>

            {/* Multi-page region badge */}
            {pagesWithHighlights.size > 1 ? (
              <p className="mt-2 text-center text-xs font-semibold text-[#16a34a]">
                Answer spans across multiple pages:{" "}
                {[...pagesWithHighlights]
                  .sort((a, b) => a - b)
                  .map((p) => p + 1)
                  .join(", ")}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-center text-sm text-[#6b7280]">No answer sheet pages available</p>
        )}
      </div>
    </div>
  );
}
