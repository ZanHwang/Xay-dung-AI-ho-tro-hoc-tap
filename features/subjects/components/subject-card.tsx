import { ArrowUpRight, BookOpen, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Subject } from "@/features/subjects/types";

type SubjectCardProps = {
  subject: Subject;
  onOpen: (id: string) => void;
  onAskTutor: (id: string) => void;
};

export function SubjectCard({ subject, onOpen, onAskTutor }: SubjectCardProps) {
  return (
    <article className="group flex min-h-72 flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <span
          className={`grid size-12 place-items-center rounded-2xl font-bold subject-${subject.accent}`}
        >
          {subject.shortName}
        </span>
        <BookOpen className="size-5 text-muted-foreground" />
      </div>
      <h3 className="mt-6 text-lg font-semibold text-foreground">{subject.name}</h3>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
        {subject.description}
      </p>
      <Button
        onClick={() => onAskTutor(subject.id)}
        variant="outline"
        className="mt-3 w-fit border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-950/40"
        aria-label={`Hỏi AI Tutor về ${subject.name}`}
      >
        <MessageCircle /> Hỏi AI Tutor
      </Button>
      <div className="mt-auto pt-6">
        <Button
          onClick={() => onOpen(subject.id)}
          variant="ghost"
          className="mt-4 w-full justify-between text-foreground hover:bg-muted hover:text-foreground"
        >
          Mở môn học <ArrowUpRight />
        </Button>
      </div>
    </article>
  );
}
