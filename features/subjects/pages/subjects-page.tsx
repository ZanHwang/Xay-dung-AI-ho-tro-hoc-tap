import { CreateSubjectDialog } from "@/features/subjects/components/create-subject-dialog";
import { SubjectCard } from "@/features/subjects/components/subject-card";
import { SubjectDetail } from "@/features/subjects/components/subject-detail";
import type { QuizController } from "@/features/quiz/hooks/use-quizzes";
import type {
  CreateSubjectInput,
  Subject,
} from "@/features/subjects/types";

type SubjectsPageProps = {
  quizzes: QuizController;
  onOpenQuiz: (subjectId: string, quizId?: string) => void;
  subjects: Subject[];
  selectedSubject?: Subject;
  onOpen: (id: string) => void;
  onBack: () => void;
  onAskTutor: (id: string) => void;
  onCreate: (input: CreateSubjectInput, files: File[]) => Promise<unknown>;
};

export function SubjectsPage({
  subjects,
  selectedSubject,
  onOpen,
  onBack,
  onCreate,
  onAskTutor,
  quizzes,
  onOpenQuiz,
}: SubjectsPageProps) {
  if (selectedSubject) {
    return <SubjectDetail subject={selectedSubject} onBack={onBack} onAskTutor={onAskTutor} quizzes={quizzes} onOpenQuiz={(quizId) => onOpenQuiz(selectedSubject.id, quizId)} />;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">Thư viện kiến thức</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">Môn học của tôi</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tổ chức tài liệu, chủ đề và tiến độ theo từng môn học.</p>
        </div>
        <CreateSubjectDialog onCreate={onCreate} />
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} onOpen={onOpen} onAskTutor={onAskTutor} />
        ))}
      </div>
    </div>
  );
}
