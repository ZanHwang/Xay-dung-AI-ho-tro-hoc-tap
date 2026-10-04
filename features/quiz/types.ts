export type QuizQuestion = {
  id: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};
export type Quiz = {
  id: string;
  subjectId: string;
  title: string;
  createdAt: string;
  adaptive: boolean;
  source: "sample";
  conversationId: string | null;
  questions: QuizQuestion[];
};
export type QuizDraft = { id: string; quizId: string; startedAt: string; answers: Record<string, number> };
export type QuizAttempt = QuizDraft & { submittedAt: string };
export type TopicMastery = { subjectId: string; topic: string; correct: number; total: number; percent: number | null };
