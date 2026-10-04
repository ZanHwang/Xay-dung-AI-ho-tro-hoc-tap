export type SubjectAccent = "cyan" | "violet" | "amber" | "emerald";

export type Subject = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  progress: number;
  lessons: number;
  lastStudied: string;
  accent: SubjectAccent;
  currentTopic: string;
};

export type CreateSubjectInput = Pick<Subject, "name" | "description">;
