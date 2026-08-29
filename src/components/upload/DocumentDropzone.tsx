"use client";

import { useRef, useState } from "react";
import { formatBytes } from "@/lib/utils";

type Props = {
  accentWord: string;
  restLabel: string;
  file: File | null;
  pageCount?: number;
  converting?: boolean;
  onFileSelect: (file: File | null) => void;
};

export function DocumentDropzone({
  accentWord,
  restLabel,
  file,
  pageCount,
  converting = false,
  onFileSelect,
}: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        if (!file && !converting) {
          inputRef.current?.click();
        }
      }}
      className={`relative flex min-h-[160px] sm:min-h-[190px] w-full flex-col items-center justify-center rounded-[24px] sm:rounded-[28px] border-2 border-dashed p-4 sm:p-6 text-center transition-all ${
        isDragOver
          ? "border-[#ff5a1f] bg-[#fff6f2]"
          : file
          ? "border-[#e0e0e0] bg-[#fafafa]/80"
          : "border-[#d8d8d8] bg-white hover:border-[#ff5a1f]/70 hover:bg-[#fffbf9] cursor-pointer"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleInputChange}
        className="hidden"
      />

      {converting ? (
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#ff5a1f] border-t-transparent" />
          <p className="text-xs font-semibold text-[#ff5a1f]">
            Converting document pages...
          </p>
        </div>
      ) : file ? (
        /* Uploaded State - Matching Screenshot */
        <div className="relative flex w-full max-w-sm items-center gap-3.5 rounded-2xl border border-[#ececec] bg-white px-4 py-3 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          {/* PDF / Document Badge Icon */}
          <div className="flex h-10 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-[#e11d48] text-white shadow-sm">
            <span className="text-[9px] font-black uppercase tracking-wider">PDF</span>
            <div className="h-0.5 w-4 rounded-full bg-white/60 mt-0.5" />
          </div>

          {/* File Information */}
          <div className="min-w-0 flex-1 text-left">
            <p
              className="truncate text-xs sm:text-sm font-semibold text-[#111]"
              title={file.name}
            >
              {file.name}
            </p>
            <p className="mt-0.5 text-[11px] text-[#6b7280]">
              {formatBytes(file.size)}
              {pageCount !== undefined ? ` • ${pageCount} Page${pageCount === 1 ? "" : "s"}` : ""}
            </p>
          </div>

          {/* Close / Remove Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFileSelect(null);
            }}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4b5563] text-white hover:bg-[#111] transition"
            title="Remove file"
            aria-label="Remove file"
          >
            <span className="text-xs font-bold leading-none mb-0.5">✕</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3f4f6] text-[#374151]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>

          <p className="text-lg font-semibold text-[#111]">
            Upload <span className="text-[#ff5a1f]">{accentWord} {restLabel}</span>
          </p>
          <p className="mt-1 text-sm text-[#9ca3af]">Max 10MB</p>
        </div>
      )}
    </div>
  );
}
