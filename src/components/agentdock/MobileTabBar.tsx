import { FolderGit2, Home, ListTodo, Settings, StickyNote } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", icon: Home, label: "Home", end: true },
  { to: "/projects", icon: FolderGit2, label: "Projects" },
  { to: "/tasks", icon: ListTodo, label: "Tasks" },
  { to: "/notes", icon: StickyNote, label: "Notes" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export function MobileTabBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-0.5 py-2 text-[10px]",
              isActive ? "text-foreground" : "text-muted-foreground",
            )
          }
        >
          <it.icon className="h-4 w-4" />
          {it.label}
        </NavLink>
      ))}
    </nav>
  );
}