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
    // reset input so the same file can be re-selected if cleared
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
      className={`relative flex min-h-[220px] flex-col items-center justify-center rounded-3xl border-2 border-dashed p-6 text-center transition ${
        isDragOver
          ? "border-[#ff5a1f] bg-[#fff6f2]"
          : file
          ? "border-[#22c55e] bg-[#f0fdf4]"
          : "border-[#e5e5e5] bg-[#fafafa] hover:border-[#ff5a1f]/60 hover:bg-[#fffcfb] cursor-pointer"
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
        <div className="flex w-full flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dcfce7] text-[#16a34a]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6M9 15l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p className="max-w-[220px] truncate text-sm font-semibold text-[#111]" title={file.name}>
            {file.name}
          </p>

          <div className="mt-1 flex items-center gap-2 text-xs text-[#6b7280]">
            <span>{formatBytes(file.size)}</span>
            {pageCount !== undefined && (
              <>
                <span>•</span>
                <span className="font-semibold text-[#16a34a]">
                  {pageCount} page{pageCount === 1 ? "" : "s"} ready
                </span>
              </>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#374151] shadow-sm ring-1 ring-[#e5e7eb] hover:bg-[#f9fafb]"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFileSelect(null);
              }}
              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-600 shadow-sm ring-1 ring-red-200 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff1eb] text-[#ff5a1f]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p className="text-sm font-semibold text-[#111]">
            <span className="text-[#ff5a1f]">{accentWord}</span> {restLabel}
          </p>
          <p className="mt-1 text-xs text-[#9ca3af]">
            Drag & drop or <span className="font-medium text-[#ff5a1f] underline">browse</span>
          </p>
          <p className="mt-2 text-[10px] text-[#9ca3af]">
            PDF, PNG, JPG, WebP (up to 15 pages)
          </p>
        </div>
      )}
    </div>
  );
}
