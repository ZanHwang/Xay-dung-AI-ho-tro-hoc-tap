import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Subject } from "@/features/subjects/types";
import { SubjectDocuments } from "./subject-documents";
import type { QuizController } from "@/features/quiz/hooks/use-quizzes";
import { SubjectQuizSummary } from "@/features/quiz/components/subject-quiz-summary";

type SubjectDetailProps = {
  quizzes: QuizController;
  onOpenQuiz: (quizId?: string) => void;
  subject: Subject;
  onBack: () => void;
  onAskTutor: (id: string) => void;
};

export function SubjectDetail({ subject, onBack, onAskTutor, quizzes, onOpenQuiz }: SubjectDetailProps) {
  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <Button
        onClick={onBack}
        variant="ghost"
        className="mb-5 -ml-3 text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <ArrowLeft /> Quay lại danh sách
      </Button>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-gradient-to-br from-blue-50 via-transparent to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 dark:from-blue-950/40 dark:to-indigo-950/40 p-7 md:p-10">
          <span className={`grid size-14 place-items-center rounded-2xl text-lg font-bold subject-${subject.accent}`}>
            {subject.shortName}
          </span>
          <h2 className="mt-6 text-3xl font-semibold text-foreground">{subject.name}</h2>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">{subject.description}</p>
          <Button onClick={() => onAskTutor(subject.id)} className="mt-5 bg-blue-500 text-white hover:bg-blue-600">
            <MessageCircle /> Hỏi AI Tutor về môn này
          </Button>
        </div>


      </div>

      <SubjectDocuments key={subject.id} subjectId={subject.id} />
      <SubjectQuizSummary subjectId={subject.id} quizzes={quizzes} onOpen={onOpenQuiz} />
    </div>
  );
}
