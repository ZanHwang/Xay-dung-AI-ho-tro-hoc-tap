import { BookOpen, Bot, ClipboardCheck, LayoutDashboard, Settings, type LucideIcon } from "lucide-react";
import type { NavKey } from "@/features/workspace/types";
export type NavigationItem = { id: NavKey; label: string; icon: LucideIcon };
export const navigationItems: NavigationItem[] = [
  { id: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { id: "tutor", label: "AI Tutor", icon: Bot },
  { id: "subjects", label: "Môn học", icon: BookOpen },
  { id: "quiz", label: "Quiz & luyện tập", icon: ClipboardCheck },
  { id: "settings", label: "Cài đặt", icon: Settings },
];
export const pageTitles: Record<NavKey, string> = {
  dashboard: "Tổng quan", tutor: "AI Tutor", subjects: "Môn học",
  quiz: "Quiz & luyện tập", settings: "Cài đặt",
};
