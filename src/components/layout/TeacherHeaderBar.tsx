"use client";

import Link from "next/link";

type Props = {
  backHref?: string;
  onOpenGradingSummary?: () => void;
};

export function TeacherHeaderBar({
  backHref = "/",
  onOpenGradingSummary,
}: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between rounded-2xl bg-white px-4 shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-2 text-sm font-medium text-[#111]">
        <Link
          href={backHref}
          className="rounded-lg p-1.5 text-[#6b7280] hover:bg-[#f5f5f5]"
          aria-label="Back to Portal"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <span className="text-[#9ca3af]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="inline">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
          </svg>
        </span>
        <span>AI Assessment Workspace</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {onOpenGradingSummary ? (
          <button
            type="button"
            onClick={onOpenGradingSummary}
            className="flex items-center gap-1.5 rounded-full bg-[#fff1eb] px-3 py-1.5 text-xs font-semibold text-[#ff5a1f] hover:bg-[#ffe5d9] transition"
          >
            <ReportIcon />
            Grading Summary
          </button>
        ) : null}

        <IconButton label="Help">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1.5 1-1.5 2.2M12 17h.01" strokeLinecap="round" />
          </svg>
        </IconButton>

        <IconButton label="Notifications">
          <span className="relative">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M6 9a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7" strokeLinecap="round" />
              <path d="M10 19a2 2 0 0 0 4 0" />
            </svg>
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[#ff5a1f]" />
          </span>
        </IconButton>

        <button
          type="button"
          className="ml-1 flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-[#f5f5f5]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#fdba74] to-[#fb923c] text-xs font-semibold text-white">
            MR
          </span>
          <span className="hidden text-sm font-medium text-[#111] sm:inline">
            Madhur Rastogi
          </span>
        </button>
      </div>
    </header>
  );
}

function IconButton({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="rounded-lg p-2 text-[#6b7280] hover:bg-[#f5f5f5]"
    >
      {children}
    </button>
  );
}

function ReportIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" strokeLinecap="round" />
    </svg>
  );
}
