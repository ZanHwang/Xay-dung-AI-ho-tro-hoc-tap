"use client";
import { BookOpen, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { navigationItems } from "@/config/navigation";
import type { DemoUser } from "@/features/auth/services/demo-auth";
import type { NavKey } from "@/features/workspace/types";
type Props = { user: DemoUser; onLogout: () => void; activePage: NavKey; onNavigate: (page: NavKey) => void };
export function AppSidebar({ user, onLogout, activePage, onNavigate }: Props) {
  return (
    <aside className="flex shrink-0 flex-col border-b border-border bg-muted md:h-full md:w-64 md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-3 px-5 py-4 md:block">
        <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-blue-500"><BookOpen className="size-6" /> JARVIS</Link>
        <p className="truncate text-sm text-muted-foreground md:mt-3">{user.name}</p>
      </div>
      <nav aria-label="Điều hướng học tập" className="overflow-x-auto px-3 pb-3 md:flex-1 md:overflow-y-auto">
        <ul className="flex gap-1 md:flex-col">
          {navigationItems.map((item) => <li key={item.id} className="shrink-0">
            <button type="button" onClick={() => onNavigate(item.id)} aria-current={activePage === item.id ? "page" : undefined}
              className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium ${activePage === item.id ? "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" : "text-muted-foreground hover:bg-secondary"}`}>
              <item.icon className="size-4 shrink-0" /> {item.label}
            </button>
          </li>)}
        </ul>
      </nav>
      <div className="px-3 pb-3 md:border-t md:pt-3">
        <Button variant="ghost" onClick={onLogout} className="justify-start gap-2 text-muted-foreground md:w-full"><LogOut className="size-4" /> Đăng xuất</Button>
      </div>
    </aside>
  );
}
