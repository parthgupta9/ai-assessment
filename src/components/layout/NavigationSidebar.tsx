"use client";

import Link from "next/link";
import Image from "next/image";

type Props = {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

const NAVIGATION_ITEMS = [
  { key: "home", label: "Home", icon: HomeIcon },
  { key: "classroom", label: "My Classroom", icon: ClassroomIcon },
  { key: "assignments", label: "Assignments", icon: AssignmentsIcon },
  { key: "exams", label: "Exams", icon: ExamsIcon, active: true },
  { key: "library", label: "My Library", icon: LibraryIcon },
] as const;

export function NavigationSidebar({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}: Props) {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen ? (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      ) : null}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col bg-white shadow-xl transition-all duration-300 ease-in-out md:static md:z-auto md:h-full md:shadow-[0_1px_3px_rgba(0,0,0,0.06)] md:rounded-[28px] ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } ${collapsed ? "md:w-[76px] md:p-3" : "w-[260px] p-5"}`}
      >
        <div
          className={`mb-10 flex items-center  ${
            collapsed ? "md:justify-center" : "justify-between gap-2"
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#111] shadow-sm font-black text-lg">
              <Image src="/1.png" alt="VedaAI Logo" width={20} height={20} />
              
            </div>
            {!collapsed || mobileOpen ? (
              <span className="text-[19px] font-extrabold tracking-tight text-[#111]">
                VedaAI
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden rounded-xl p-2 text-[#6b7280] hover:bg-[#f5f5f5] hover:text-[#111] transition md:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <SidebarToggleIcon />
          </button>

       
        </div>

        {!collapsed || mobileOpen ? (
          <button
            type="button"
            className="mb-10 pt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[#2a2a2a] px-2 py-2.5 text-sm font-semibold text-white shadow-[0_0_0_2px_rgba(255,90,31,0.3)] hover:bg-[#111] transition"
          >
            <SparkleIcon className="text-[#ff8f66]" />
            AI Teacher&apos;s Toolkit
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#2a2a2a] text-[#ff8f66] shadow-[0_0_0_2px_rgba(255,90,31,0.35)] hover:bg-[#111] transition "
            aria-label="AI Teacher's Toolkit"
            title="AI Teacher's Toolkit"
          >
            <SparkleIcon className="text-[#ff8f66]" />
          </button>
        )}

        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = "active" in item && item.active;
            return (
              <div
                key={item.key}
                className={`flex cursor-pointer items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-base font-medium transition ${
                  active
                    ? "bg-[#f3f4f6] text-[#111] font-semibold"
                    : "text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111]"
                } ${collapsed && !mobileOpen ? "justify-center px-0 py-3" : ""}`}
                title={item.label}
              >
                <Icon className={`shrink-0 ${active ? "text-[#111]" : "text-[#9ca3af]"}`} />
                {!collapsed || mobileOpen ? (
                  <span className="truncate">{item.label}</span>
                ) : null}
              </div>
            );
          })}
        </nav>

        {/* Bottom Profile & School Info Card */}
        <div className="mt-auto pt-4">
          {!collapsed || mobileOpen ? (
            <div className="flex flex-col gap-3">
           
              <div className="flex items-center gap-3 rounded-2xl bg-[#f5f5f5] px-3 py-3 border border-[#ebebeb]">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold text-[#15803d] shadow-sm border border-emerald-100">
                 <Image src="/3.png" alt="School Logo" width={32} height={32} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-bold text-[#111]">
                    Delhi Public School
                  </p>
                  <p className="truncate text-[11px] text-[#6b7280]">
                    Bokaro Steel City
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f3f4f6] text-[#15803d] shadow-sm border border-emerald-100 cursor-pointer"
                title="Delhi Public School - Bokaro Steel City"
                onClick={onToggleCollapse}
              >
                <span className="text-[10px] font-bold">DPS</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function SidebarToggleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth="1.75" />
      <line x1="9" y1="3" x2="9" y2="21" strokeWidth="1.75" />
      <path d="M14 9l-3 3 3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" />
    </svg>
  );
}

function HomeIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function ClassroomIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <rect x="2" y="4" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 18v3" strokeLinecap="round" />
    </svg>
  );
}

function AssignmentsIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-6z" />
      <path d="M14 2v6h6M9 13h6M9 17h4" strokeLinecap="round" />
    </svg>
  );
}

function ExamsIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" strokeLinecap="round" />
    </svg>
  );
}

function LibraryIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  );
}
