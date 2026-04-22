import type { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { ProjectSidebar } from "./ProjectSidebar";
import { ActivityPanel } from "./ActivityPanel";
import { MobileTabBar } from "./MobileTabBar";

interface Props {
  children: ReactNode;
  showActivity?: boolean;
  showSidebar?: boolean;
}

export function AppShell({ children, showActivity = true, showSidebar = true }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <TopBar />
      <div className="flex flex-1">
        {showSidebar && <ProjectSidebar />}
        <main className="scrollbar-thin min-w-0 flex-1 overflow-x-hidden pb-16 md:pb-0">{children}</main>
        {showActivity && <ActivityPanel />}
      </div>
      <MobileTabBar />
    </div>
  );
}