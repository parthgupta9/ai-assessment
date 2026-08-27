"use client";

import Image from "next/image";
import Link from "next/link";

type Props = {
  collapsed?: boolean;
};

const NAVIGATION_ITEMS = [
  { key: "home", label: "Home", icon: HomeIcon },
  { key: "classroom", label: "My Classroom", icon: ClassroomIcon },
  { key: "assignments", label: "Assignments", icon: AssignmentsIcon },
  { key: "exams", label: "Exams", icon: ExamsIcon, active: true },
  { key: "library", label: "My Library", icon: LibraryIcon },
] as const;

export function NavigationSidebar({ collapsed = false }: Props) {
  return (
    <aside
      className={`flex h-full flex-col rounded-3xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] transition-all duration-200 ${
        collapsed ? "w-[72px] px-2 py-4" : "w-[240px] px-4 py-5"
      }`}
    >
      <div
        className={`mb-5 flex items-center ${
          collapsed ? "justify-center" : "justify-between gap-2"
        }`}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <Image
            src="/veda-logo.png"
            alt="VedaAI"
            width={36}
            height={36}
            className="rounded-lg"
            priority
          />
          {!collapsed ? (
            <span className="text-[17px] font-semibold tracking-tight text-[#111]">
              VedaAI
            </span>
          ) : null}
        </Link>
        {!collapsed ? (
          <button
            type="button"
            className="rounded-lg p-1.5 text-[#9ca3af] hover:bg-[#f5f5f5]"
            aria-label="Collapse sidebar"
          >
            <CollapseIcon />
          </button>
        ) : null}
      </div>

      {!collapsed ? (
        <button
          type="button"
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-full bg-[#2a2a2a] px-3 py-2.5 text-sm font-medium text-white shadow-[0_0_0_2px_rgba(255,90,31,0.35)] hover:bg-[#111]"
        >
          <SparkleIcon className="text-[#ff8f66]" />
          AI Teacher&apos;s Toolkit
        </button>
      ) : (
        <button
          type="button"
          className="mx-auto mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#2a2a2a] shadow-[0_0_0_2px_rgba(255,90,31,0.45)] hover:bg-[#111]"
          aria-label="AI Teacher's Toolkit"
        >
          <SparkleIcon className="text-white" />
        </button>
      )}

      <nav className="flex flex-1 flex-col gap-1">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = "active" in item && item.active;
          return (
            <div
              key={item.key}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                active
                  ? "bg-[#f3f3f3] font-medium text-[#111]"
                  : "text-[#6b7280] hover:bg-[#f9f9f9]"
              } ${collapsed ? "justify-center px-0" : ""}`}
              title={item.label}
            >
              <Icon className={active ? "text-[#111]" : "text-[#9ca3af]"} />
              {!collapsed ? <span>{item.label}</span> : null}
            </div>
          );
        })}
      </nav>

      {!collapsed ? (
        <>
          <button
            type="button"
            className="mb-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#6b7280] hover:bg-[#f5f5f5]"
          >
            <SettingsIcon />
            Settings
          </button>
          <div className="flex items-center gap-3 rounded-2xl bg-[#f5f5f5] px-3 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-[10px] font-bold text-[#1d4ed8]">
              DPS
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-[#111]">
                Delhi Public School
              </p>
              <p className="truncate text-[11px] text-[#6b7280]">
                Bokaro Steel City
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="mt-auto flex flex-col items-center gap-3 pb-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dcfce7] text-[10px] font-bold text-[#15803d]">
            DPS
          </div>
          <button
            type="button"
            className="text-[#9ca3af] hover:text-[#111]"
            aria-label="Expand sidebar"
          >
            <ExpandIcon />
          </button>
        </div>
      )}
    </aside>
  );
}

function SparkleIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2z" />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
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

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
    </svg>
  );
}
