"use client";

import { useState } from "react";
import { NavigationSidebar } from "./NavigationSidebar";
import { TeacherHeaderBar } from "./TeacherHeaderBar";

type Props = {
  children: React.ReactNode;
  collapsed?: boolean;
  backHref?: string;
  onOpenGradingSummary?: () => void;
};

export function AssessmentAppLayout({
  children,
  collapsed: initialCollapsed = false,
  backHref = "/",
  onOpenGradingSummary,
}: Props) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#ebedef] sm:p-3 p-3 gap-2">
     
      <NavigationSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((prev) => !prev)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 sm:gap-3 h-full">
        <TeacherHeaderBar
          backHref={backHref}
          onOpenGradingSummary={onOpenGradingSummary}
          onToggleMobileMenu={() => setMobileMenuOpen(true)}
        />
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] sm:rounded-[28px]JP, shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          {children}
        </main>
      </div>
    </div>
  );
}
