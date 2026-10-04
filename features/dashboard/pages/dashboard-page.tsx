import {
  ArrowUpRight,
  BookOpen,
  Brain,
  ChevronRight,
  MessageCircle,
  Target,
} from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatCard } from "@/features/dashboard/components/stat-card";
import type { Subject } from "@/features/subjects/types";
import type { NavKey } from "@/features/workspace/types";
import type { Conversation } from "@/features/tutor/types";
import type { QuizController } from "@/features/quiz/hooks/use-quizzes";
import { gradeQuiz } from "@/features/quiz/services/quiz-engine";

type DashboardPageProps = {
  userName: string;
  quizzes: QuizController;
  subjects: Subject[];
  conversations: Conversation[];
  onOpenConversation: (id: string) => void;
  onNavigate: (page: NavKey) => void;
  onOpenSubject: (id: string) => void;
};

export function DashboardPage({
  userName,
  quizzes,
  subjects,
  conversations,
  onOpenConversation,
  onNavigate,
  onOpenSubject,
}: DashboardPageProps) {
  const current = subjects[0];
  const grades = quizzes.attempts.flatMap((attempt) => {
    const quiz = quizzes.quizzes.find((item) => item.id === attempt.quizId);
    return quiz ? [gradeQuiz(quiz, attempt.answers).percent] : [];
  });
  const weakTopics = quizzes.mastery.filter((item) => item.percent !== null && item.percent < 60).sort((a, b) => (a.percent ?? 0) - (b.percent ?? 0));
  const weakest = weakTopics[0];
  const recentChats = [...conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);
  const stats = [
    {
      label: "Môn đang học",
      value: subjects.length.toString(),
      note: `${new Set(weakTopics.map((item) => item.subjectId)).size} môn cần luyện thêm`,
      icon: BookOpen,
      tone: "cyan" as const,
    },
    {
      label: "Điểm quiz trung bình",
      value: grades.length ? `${Math.round(grades.reduce((sum, grade) => sum + grade, 0) / grades.length)}%` : "—",
      note: `${grades.length} lần nộp Quiz`,
      icon: Target,
      tone: "amber" as const,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <SectionHeading
        eyebrow="Không gian học tập của bạn"
        title={`Chào bạn, ${userName}.`}
        description="Chọn một môn học, tiếp tục cuộc hội thoại hoặc làm Quiz để bắt đầu buổi học hôm nay."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.65fr]">
        <section className="glass-card overflow-hidden p-6">
          {current ? (
            <>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">
                    Mở môn học
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-foreground">
                    {current.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {current.description}
                  </p>
                </div>
              </div>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button
                  onClick={() => onOpenSubject(current.id)}
                  className="bg-cyan-400 text-slate-950 hover:bg-cyan-300"
                >
                  Mở môn học <ArrowUpRight />
                </Button>
                <Button
                  onClick={() => onNavigate("tutor")}
                  variant="outline"
                  className="border-border bg-card text-foreground hover:bg-secondary"
                >
                  Hỏi AI Tutor
                </Button>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Hãy tạo môn học đầu tiên để bắt đầu.
            </p>
          )}
        </section>

        <section className="glass-card p-6">
          <div className="flex items-center gap-3">
            <span className="icon-box icon-amber">
              <Brain className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Cần chú ý</p>
              <h3 className="font-semibold text-foreground">{weakest?.topic ?? "Luyện tập kiến thức"}</h3>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-muted-foreground">
            {weakest ? `${subjects.find((subject) => subject.id === weakest.subjectId)?.name ?? "Môn học"}: bạn trả lời đúng ${weakest.correct}/${weakest.total} câu gần nhất ở chủ đề này.` : "Làm Quiz để xác định chủ đề cần ôn và theo dõi kết quả luyện tập."}
          </p>
          <div className="mt-5 rounded-xl border border-amber-300/10 bg-amber-400/6 p-4">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Mức độ nắm vững</span>
              <strong className="text-amber-700 dark:text-amber-300">{weakest ? `${weakest.percent}%` : "Chưa có chủ đề yếu"}</strong>
            </div>
            <Progress
              value={weakest?.percent ?? 0}
              className="mt-3 h-1.5 bg-secondary [&>div]:bg-amber-400"
            />
          </div>
          <Button
            onClick={() => onNavigate("quiz")}
            variant="ghost"
            className="mt-3 w-full justify-between text-amber-700 dark:text-amber-300 hover:bg-amber-400/8 hover:text-amber-800 dark:hover:text-amber-300"
          >
            Luyện tập Quiz <ArrowUpRight />
          </Button>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="glass-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Môn học của bạn</h3>
            <Button
              onClick={() => onNavigate("subjects")}
              variant="ghost"
              size="sm"
              className="text-blue-600 dark:text-blue-300 hover:bg-cyan-400/8"
            >
              Xem tất cả
            </Button>
          </div>
          <div className="space-y-3">
            {subjects.slice(0, 3).map((subject) => (
              <button
                type="button"
                key={subject.id}
                onClick={() => onOpenSubject(subject.id)}
                className="flex w-full items-center gap-4 rounded-xl border border-border bg-muted p-3 text-left transition hover:border-cyan-300/20 hover:bg-secondary"
              >
                <span
                  className={`grid size-11 place-items-center rounded-xl font-semibold subject-${subject.accent}`}
                >
                  {subject.shortName}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-foreground">
                    {subject.name}
                  </strong>
                  <span className="text-xs text-muted-foreground">
                    {subject.description}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="glass-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Chat gần đây</h3>
            <Button
              onClick={() => onNavigate("tutor")}
              variant="ghost"
              size="sm"
              className="text-blue-600 dark:text-blue-300 hover:bg-cyan-400/8"
            >
              <MessageCircle /> Mở Tutor
            </Button>
          </div>
          <div className="space-y-3">
            {recentChats.length === 0 && <p className="text-sm text-muted-foreground">Chưa có cuộc hội thoại. Mở Tutor để bắt đầu.</p>}
            {recentChats.map((chat) => (
              <button
                type="button"
                key={chat.id}
                onClick={() => onOpenConversation(chat.id)}
                className="flex w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-secondary"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-indigo-400/10 text-indigo-300">
                  <MessageCircle className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-medium text-foreground">
                    {chat.title}
                  </strong>
                  <span className="text-xs text-muted-foreground">
                    {chat.classification === "uncertain" ? "Chưa xác định môn" : chat.subjectId === null ? "Hỏi đáp chung" : subjects.find((subject) => subject.id === chat.subjectId)?.name ?? "Môn học không còn tồn tại"} · {chat.messages.length} tin nhắn
                  </span>
                </span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
