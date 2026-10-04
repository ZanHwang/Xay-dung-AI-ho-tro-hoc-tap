import { Button } from "@/components/ui/button";
import type { QuizController } from "../hooks/use-quizzes";

export function SubjectQuizSummary({ subjectId, quizzes, onOpen }: {
  subjectId: string; quizzes: QuizController; onOpen: (quizId?: string) => void;
}) {
  const items = quizzes.quizzes.filter((quiz) => quiz.subjectId === subjectId);
  const mastery = quizzes.mastery.filter((item) => item.subjectId === subjectId);
  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-foreground">Quiz & luyện tập ({items.length})</h3>
        <Button disabled={!quizzes.ready} onClick={() => onOpen()} className="bg-blue-500 text-white hover:bg-blue-600">Tạo Quiz / Xem lịch sử</Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Mức nắm vững tạm tính bằng tỷ lệ đúng trên tối đa 20 câu đã nộp gần nhất mỗi chủ đề.</p>
      {mastery.length ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {mastery.map((item) => (
            <li key={item.topic} className="rounded-xl bg-muted p-3 text-sm text-foreground">
              {item.topic}: <strong className="text-foreground">{item.percent}%</strong>
              <span className="ml-2 text-xs text-muted-foreground">({item.correct}/{item.total} câu đúng)</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">Chưa có kết quả luyện tập.</p>
      )}
      <ul className="mt-4 space-y-2">
        {items.map((quiz) => (
          <li key={quiz.id}>
            <button
              type="button"
              onClick={() => onOpen(quiz.id)}
              className="w-full rounded-lg p-3 text-left text-sm text-blue-600 dark:text-blue-300 hover:bg-muted"
            >
              {quiz.title} · {quiz.questions.length} câu · {quizzes.attempts.filter((attempt) => attempt.quizId === quiz.id).length} lần nộp
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
