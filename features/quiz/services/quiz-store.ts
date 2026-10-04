import { z } from "zod";
import type { Quiz, QuizAttempt, QuizDraft } from "../types";

export const QUIZ_STORAGE_KEY = "jarvis.quizzes.v1";
const questionSchema = z.object({
  id: z.string().min(1), topic: z.string().min(1), difficulty: z.enum(["easy", "medium", "hard"]),
  prompt: z.string().min(1), options: z.array(z.string().min(1)).min(2).max(6),
  correctIndex: z.number().int().nonnegative(), explanation: z.string().min(1),
}).refine((question) => question.correctIndex < question.options.length);
const quizSchema = z.object({
  id: z.string().min(1), subjectId: z.string().min(1), title: z.string().min(1), createdAt: z.string().datetime(),
  adaptive: z.boolean(), source: z.literal("sample"), conversationId: z.string().nullable(),
  questions: z.array(questionSchema).min(1).max(10).refine((questions) => new Set(questions.map((q) => q.id)).size === questions.length),
});
const draftSchema = z.object({ id: z.string().min(1), quizId: z.string().min(1), startedAt: z.string().datetime(), answers: z.record(z.number().int().nonnegative()) });
const savedSchema = z.object({
  quizzes: z.array(quizSchema), drafts: z.array(draftSchema), attempts: z.array(draftSchema.extend({ submittedAt: z.string().datetime() })),
}).refine((data) => {
  const quizzes = new Map(data.quizzes.map((quiz) => [quiz.id, quiz]));
  const runs = [...data.drafts, ...data.attempts];
  return quizzes.size === data.quizzes.length && new Set(runs.map((run) => run.id)).size === runs.length &&
    new Set(data.drafts.map((draft) => draft.quizId)).size === data.drafts.length && runs.every((run) => {
      const quiz = quizzes.get(run.quizId);
      return quiz && Object.entries(run.answers).every(([id, answer]) => {
        const question = quiz.questions.find((item) => item.id === id);
        return question && answer < question.options.length;
      });
    });
});
type Snapshot = { quizzes: Quiz[]; drafts: QuizDraft[]; attempts: QuizAttempt[]; ready: boolean; error: string | null };

export function createQuizStore(storage: () => Pick<Storage, "getItem" | "setItem">) {
  let state: Snapshot = { quizzes: [], drafts: [], attempts: [], ready: false, error: null };
  const listeners = new Set<() => void>();
  function publish(next: Snapshot) { state = next; listeners.forEach((listener) => listener()); }
  function commit(next: Snapshot) {
    try {
      storage().setItem(QUIZ_STORAGE_KEY, JSON.stringify({ quizzes: next.quizzes, drafts: next.drafts, attempts: next.attempts }));
      publish({ ...next, error: null });
    } catch { publish({ ...next, error: "Không thể lưu Quiz trên trình duyệt. Dữ liệu hiện chỉ được giữ trong phiên này." }); }
  }
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    hydrate() {
      if (state.ready) return;
      try {
        const value = storage().getItem(QUIZ_STORAGE_KEY);
        const data = value === null ? { quizzes: [], drafts: [], attempts: [] } : savedSchema.parse(JSON.parse(value));
        publish({ ...data, ready: true, error: null });
      } catch { publish({ ...state, ready: true, error: "Không thể đọc dữ liệu Quiz. Dữ liệu lưu có thể bị lỗi hoặc trình duyệt chặn lưu trữ." }); }
    },
    create(input: Omit<Quiz, "id" | "createdAt">) {
      if (!state.ready) throw new Error("Đang tải dữ liệu Quiz.");
      const quiz = quizSchema.parse({ ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() });
      commit({ ...state, quizzes: [quiz, ...state.quizzes] });
      return quiz.id;
    },
    start(quizId: string) {
      if (!state.ready || !state.quizzes.some((quiz) => quiz.id === quizId)) return null;
      const existing = state.drafts.find((draft) => draft.quizId === quizId);
      if (existing) return existing.id;
      const draft: QuizDraft = { id: crypto.randomUUID(), quizId, startedAt: new Date().toISOString(), answers: {} };
      commit({ ...state, drafts: [...state.drafts, draft] });
      return draft.id;
    },
    answer(draftId: string, questionId: string, answer: number) {
      const draft = state.drafts.find((item) => item.id === draftId);
      const question = state.quizzes.find((quiz) => quiz.id === draft?.quizId)?.questions.find((q) => q.id === questionId);
      if (!draft || !question || !Number.isInteger(answer) || answer < 0 || answer >= question.options.length) return;
      commit({ ...state, drafts: state.drafts.map((item) => item.id === draftId ? { ...item, answers: { ...item.answers, [questionId]: answer } } : item) });
    },
    submit(draftId: string) {
      const draft = state.drafts.find((item) => item.id === draftId);
      if (!draft) return state.attempts.find((item) => item.id === draftId)?.id ?? null;
      const attempt: QuizAttempt = { ...draft, submittedAt: new Date().toISOString() };
      commit({ ...state, drafts: state.drafts.filter((item) => item.id !== draftId), attempts: [...state.attempts, attempt] });
      return attempt.id;
    },
  };
}
