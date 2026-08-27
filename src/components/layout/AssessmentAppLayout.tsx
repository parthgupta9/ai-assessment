"use client";

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
  collapsed = false,
  backHref = "/",
  onOpenGradingSummary,
}: Props) {
  return (
    <div className="flex min-h-screen gap-3 bg-[#f5f5f5] p-3">
      <NavigationSidebar collapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <TeacherHeaderBar backHref={backHref} onOpenGradingSummary={onOpenGradingSummary} />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05)]">
          {children}
        </div>
      </div>
    </div>
  );
}
