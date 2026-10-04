import assert from "node:assert/strict";
import { test } from "node:test";
import { initialSubjects } from "@/features/subjects/data/subject.mocks";
import { questionsForSubject } from "../data/question-bank";
import { calculateMastery, gradeQuiz, selectQuestions } from "./quiz-engine";
import { createQuizStore, QUIZ_STORAGE_KEY } from "./quiz-store";
import type { Quiz, QuizAttempt } from "../types";

const questions = questionsForSubject(initialSubjects[0]);
const input = { subjectId: initialSubjects[0].id, title: "Quiz test", adaptive: false, source: "sample" as const, conversationId: "chat-1", questions: questions.slice(0, 3) };
const quiz: Quiz = { ...input, id: "quiz-1", createdAt: "2026-01-01T00:00:00.000Z" };
function setup() {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); } };
  const store = createQuizStore(() => storage);
  store.hydrate();
  return { store, storage, values };
}

test("grades correct, incorrect, zero-index, and unanswered choices", () => {
  const result = gradeQuiz(quiz, { [quiz.questions[0].id]: 0, [quiz.questions[1].id]: 0 });
  assert.equal(result.correct, 1);
  assert.equal(result.total, 3);
  assert.equal(result.percent, 33);
  assert.equal(result.items[2].selected, undefined);
  assert.equal(gradeQuiz(quiz, {}).percent, 0);
  assert.equal(gradeQuiz(quiz, Object.fromEntries(quiz.questions.map((q) => [q.id, q.correctIndex]))).percent, 100);
});

test("preserves subject, Tutor source, partial answers and history after reload", () => {
  const { store, storage } = setup();
  const id = store.create(input);
  const draftId = store.start(id)!;
  store.answer(draftId, questions[0].id, questions[0].correctIndex);
  const restored = createQuizStore(() => storage);
  restored.hydrate();
  assert.equal(restored.getSnapshot().quizzes[0].conversationId, "chat-1");
  assert.equal(restored.getSnapshot().quizzes[0].subjectId, initialSubjects[0].id);
  assert.equal(restored.start(id), draftId);
  assert.equal(restored.getSnapshot().drafts[0].answers[questions[0].id], questions[0].correctIndex);
  restored.submit(draftId);
  const reloaded = createQuizStore(() => storage);
  reloaded.hydrate();
  assert.equal(reloaded.getSnapshot().drafts.length, 0);
  assert.equal(reloaded.getSnapshot().attempts.length, 1);
});

test("double submission is idempotent and retry produces an independent attempt", () => {
  const { store } = setup();
  const id = store.create(input);
  const first = store.start(id)!;
  store.answer(first, questions[0].id, 0);
  store.submit(first); store.submit(first);
  assert.equal(store.getSnapshot().attempts.length, 1);
  store.answer(first, questions[0].id, 1);
  assert.equal(store.getSnapshot().attempts[0].answers[questions[0].id], 0);
  const second = store.start(id)!;
  assert.notEqual(second, first);
  assert.deepEqual(store.getSnapshot().drafts[0].answers, {});
  store.submit(second);
  assert.equal(store.getSnapshot().attempts.length, 2);
});

test("drafts and answers are isolated between quizzes and reject invalid options", () => {
  const { store } = setup();
  const a = store.start(store.create(input))!;
  const b = store.start(store.create({ ...input, subjectId: "other-subject" }))!;
  for (const answer of [-1, 99, 0.5]) store.answer(a, questions[0].id, answer);
  store.answer(a, "not-in-quiz", 0);
  assert.deepEqual(store.getSnapshot().drafts[0].answers, {});
  store.answer(a, questions[0].id, 0);
  assert.deepEqual(store.getSnapshot().drafts.find((draft) => draft.id === b)?.answers, {});
});

test("mastery only uses submitted answers, separates subjects, and caps history at 20 responses", () => {
  assert.deepEqual(calculateMastery([quiz], []), []);
  const single = { ...quiz, questions: [questions[0]] };
  const attempts: QuizAttempt[] = Array.from({ length: 21 }, (_, index) => ({
    id: String(index), quizId: single.id, startedAt: "2026-01-01T00:00:00.000Z", submittedAt: new Date(Date.UTC(2026, 0, index + 1)).toISOString(),
    answers: { [questions[0].id]: index === 0 ? 1 : 0 },
  }));
  const result = calculateMastery([single], attempts);
  assert.equal(result[0].total, 20);
  assert.equal(result[0].percent, 100);
  const other = { ...single, id: "other", subjectId: "other-subject" };
  const combined = calculateMastery([single, other], [...attempts, { ...attempts[0], id: "other-attempt", quizId: other.id, answers: {} }]);
  assert.equal(combined.length, 2);
  assert.equal(combined.find((item) => item.subjectId === "other-subject")?.percent, 0);
});

test("adaptive generation prioritizes weak topics and easier questions", () => {
  const mastery = [
    { subjectId: quiz.subjectId, topic: "Entropy", correct: 0, total: 3, percent: 0 },
    { subjectId: quiz.subjectId, topic: "Thông tin tương hỗ", correct: 3, total: 3, percent: 100 },
  ];
  const selected = selectQuestions(questions, 2, mastery, true, "", () => 0.5);
  assert.equal(selected.length, 2);
  assert.ok(selected.every((q) => q.topic === "Entropy"));
  assert.equal(selected[0].difficulty, "easy");
  const filtered = selectQuestions(questions, 10, mastery, true, "Thông tin tương hỗ", () => 0.5);
  assert.equal(filtered.length, 3);
  assert.equal(filtered[0].difficulty, "hard");
  assert.equal(new Set(filtered.map((q) => q.id)).size, filtered.length);
});

test("sample banks cover the supported subjects and do not invent questions for others", () => {
  for (const subject of initialSubjects) assert.ok(questionsForSubject(subject).length >= 5);
  assert.deepEqual(questionsForSubject({ ...initialSubjects[0], name: "Hóa học" }), []);
  assert.deepEqual(selectQuestions(questions, 5, [], false, "unknown"), []);
});

test("corrupt storage and invalid question keys do not break the application", () => {
  for (const value of ["broken", "null", "{}", JSON.stringify({ quizzes: [{ ...quiz, questions: [{ ...questions[0], correctIndex: 99 }] }], drafts: [], attempts: [] })]) {
    const { storage, values } = setup();
    values.set(QUIZ_STORAGE_KEY, value);
    const store = createQuizStore(() => storage);
    store.hydrate();
    assert.equal(store.getSnapshot().ready, true);
    assert.ok(store.getSnapshot().error);
    assert.deepEqual(store.getSnapshot().quizzes, []);
    assert.equal(values.get(QUIZ_STORAGE_KEY), value);
  }
});

test("storage failures retain the current session and expose an error", () => {
  const store = createQuizStore(() => { throw new Error("Storage blocked"); });
  store.hydrate();
  const id = store.create(input);
  store.submit(store.start(id)!);
  assert.equal(store.getSnapshot().attempts.length, 1);
  assert.ok(store.getSnapshot().error);
});
