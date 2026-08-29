"use client";

import Link from "next/link";

type Props = {
  backHref?: string;
  onOpenGradingSummary?: () => void;
  onToggleMobileMenu?: () => void;
};

export function TeacherHeaderBar({
  backHref = "/",
  onOpenGradingSummary,
  onToggleMobileMenu,
}: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between rounded-2xl bg-white px-3.5 sm:px-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      {/* Left Section */}
      <div className="flex items-center gap-2 text-sm font-semibold text-[#111]">
        <Link
          href={backHref}
          className="rounded-lg p-1.5 text-[#374151] hover:bg-[#f3f4f6] transition"
          aria-label="Back"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </Link>

        {/* Mobile Title: VedaAI */}
        <span className="text-base font-bold tracking-tight text-[#111] md:hidden">
          VedaAI
        </span>

        {/* Desktop Breadcrumb: Document icon + Exams */}
        <div className="hidden items-center gap-2 md:flex">
          <span className="text-[#6b7280]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </span>
          <span className="text-sm font-medium text-[#4b5563]">Exams</span>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
      

        {/* Desktop: Help (?) Icon */}
        <div className="hidden md:flex">
          <IconButton label="Help">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <circle cx="12" cy="12" r="9" />
              <path
                d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"
                strokeLinecap="round"
              />
            </svg>
          </IconButton>
        </div>

        {/* Notification Bell with Orange Dot */}
        <div className="relative">
          <IconButton label="Notifications">
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </IconButton>
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff5a1f] ring-2 ring-white" />
        </div>

        {/* Desktop: Sparkle Star Icon */}
        <div className="hidden md:flex">
          <IconButton label="AI Actions">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </IconButton>
        </div>

        {/* Teacher Avatar & Dropdown */}
        <div className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1.5 hover:bg-[#f5f5f5] cursor-pointer transition">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-[#1e293b] to-[#0f172a] text-xs font-bold text-white shadow-sm overflow-hidden ring-2 ring-[#ffedd5]">
            <span>MR</span>
          </div>
          <span className="hidden text-xs font-semibold text-[#111] md:inline">
            Madhur Rastogi
          </span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="hidden text-[#6b7280] md:inline"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

        {/* Mobile Hamburger Menu Icon */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="flex rounded-lg p-2 text-[#374151] hover:bg-[#f3f4f6] md:hidden transition"
          aria-label="Open menu"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
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
      className="flex rounded-xl p-2 text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111] transition"
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
