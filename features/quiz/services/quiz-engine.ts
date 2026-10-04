import type { Quiz, QuizAttempt, QuizQuestion, TopicMastery } from "../types";

export function gradeQuiz(quiz: Quiz, answers: Record<string, number>) {
  const items = quiz.questions.map((question) => ({ question, selected: answers[question.id], correct: answers[question.id] === question.correctIndex }));
  const correct = items.filter((item) => item.correct).length;
  return { items, correct, total: items.length, percent: items.length ? Math.round(correct * 100 / items.length) : 0 };
}

// Recent practice accuracy, not a clinical or calibrated measurement of knowledge.
export function calculateMastery(quizzes: Quiz[], attempts: QuizAttempt[]): TopicMastery[] {
  const results = new Map<string, { subjectId: string; topic: string; outcomes: boolean[] }>();
  const quizMap = new Map(quizzes.map((quiz) => [quiz.id, quiz]));
  for (const attempt of [...attempts].sort((a, b) => a.submittedAt.localeCompare(b.submittedAt))) {
    const quiz = quizMap.get(attempt.quizId);
    if (!quiz) continue;
    for (const item of gradeQuiz(quiz, attempt.answers).items) {
      const key = JSON.stringify([quiz.subjectId, item.question.topic]);
      const group = results.get(key) ?? { subjectId: quiz.subjectId, topic: item.question.topic, outcomes: [] };
      group.outcomes.push(item.correct);
      group.outcomes = group.outcomes.slice(-20);
      results.set(key, group);
    }
  }
  return [...results.values()].map(({ subjectId, topic, outcomes }) => {
    const correct = outcomes.filter(Boolean).length;
    return { subjectId, topic, correct, total: outcomes.length, percent: Math.round(correct * 100 / outcomes.length) };
  });
}

export function selectQuestions(pool: QuizQuestion[], count: number, mastery: TopicMastery[], adaptive: boolean, topic = "", random = Math.random) {
  const candidates = pool.filter((question) => !topic || question.topic === topic);
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  if (adaptive) {
    const level = { easy: 0, medium: 1, hard: 2 };
    const priority = (question: QuizQuestion) => {
      const knowledge = mastery.find((item) => item.topic === question.topic);
      const percent = knowledge?.percent ?? 50;
      const target = percent < 60 ? 0 : percent < 80 ? 1 : 2;
      return percent * 10 + Math.abs(level[question.difficulty] - target);
    };
    candidates.sort((a, b) => priority(a) - priority(b));
  }
  return candidates.slice(0, Math.max(1, Math.min(10, Math.floor(count))));
}
