import { z } from "zod";
import { initialSubjects } from "@/features/subjects/data/subject.mocks";
import type {
  CreateSubjectInput,
  Subject,
} from "@/features/subjects/types";

export const SUBJECTS_STORAGE_KEY = "jarvis.subjects";

const subjectSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  shortName: z.string().trim().min(1),
  description: z.string(),
  progress: z.number().finite().min(0).max(100),
  lessons: z.number().int().nonnegative(),
  lastStudied: z.string(),
  accent: z.enum(["cyan", "violet", "amber", "emerald"]),
  currentTopic: z.string(),
}) satisfies z.ZodType<Subject>;

const subjectsSchema = z.array(subjectSchema).refine(
  (subjects) => new Set(subjects.map((subject) => subject.id)).size === subjects.length,
  { message: "Subject IDs must be unique." },
);

function createShortName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 4)
    .toUpperCase();
}

export function buildSubject(input: CreateSubjectInput): Subject {
  const name = input.name.trim();

  return {
    id: crypto.randomUUID(),
    name,
    shortName: createShortName(name),
    description: input.description.trim() || "Môn học mới chưa có mô tả.",
    progress: 0,
    lessons: 0,
    lastStudied: "Chưa học",
    accent: "emerald",
    currentTopic: "Chưa chọn chủ đề",
  };
}

export function readStoredSubjects(): Subject[] {
  if (typeof window === "undefined") return initialSubjects;

  try {
    const value = window.localStorage.getItem(SUBJECTS_STORAGE_KEY);
    if (value === null) return initialSubjects;

    const parsed: unknown = JSON.parse(value);
    const result = subjectsSchema.safeParse(parsed);
    return result.success ? result.data : initialSubjects;
  } catch {
    return initialSubjects;
  }
}

export function storeSubjects(subjects: Subject[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SUBJECTS_STORAGE_KEY, JSON.stringify(subjects));
}
