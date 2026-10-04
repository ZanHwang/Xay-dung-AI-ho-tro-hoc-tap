"use client";

import { useState } from "react";
import { useQuizzes } from "@/features/quiz/hooks/use-quizzes";
import { QuizPage } from "@/features/quiz/pages/quiz-page";
import { pageTitles } from "@/config/navigation";
import type { DemoUser } from "@/features/auth/services/demo-auth";

import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardPage } from "@/features/dashboard/pages/dashboard-page";
import { SettingsPage } from "@/features/settings/pages/settings-page";
import { SubjectsPage } from "@/features/subjects/pages/subjects-page";
import { TutorPage } from "@/features/tutor/pages/tutor-page";
import { useConversations } from "@/features/tutor/hooks/use-conversations";
import { useLearningWorkspace } from "@/features/workspace/hooks/use-learning-workspace";

export function LearningWorkspace({ user, onLogout }: { user: DemoUser; onLogout: () => void }) {
  const chats = useConversations();
  const quizzes = useQuizzes();
  const [quizRequest, setQuizRequest] = useState<{ subjectId?: string; quizId?: string; conversationId?: string; revision: number }>({ revision: 0 });
  const workspace = useLearningWorkspace(chats.store.startNew);

  const pageTitle = workspace.selectedSubject?.name ?? pageTitles[workspace.activePage];

  function openQuiz(subjectId?: string, quizId?: string, conversationId?: string) {
    setQuizRequest((current) => ({ subjectId, quizId, conversationId, revision: current.revision + 1 }));
    workspace.navigate("quiz");
  }

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden md:flex-row bg-card">
      <AppSidebar
        user={user}
        onLogout={onLogout}
        activePage={workspace.activePage}
        onNavigate={workspace.navigate}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <AppHeader title={pageTitle} />
        <main className="min-h-0 flex-1 overflow-y-auto bg-card">
          {workspace.activePage === "dashboard" ? (
            <DashboardPage userName={user.name} quizzes={quizzes} subjects={workspace.subjects}
              conversations={chats.conversations} onNavigate={workspace.navigate} onOpenSubject={workspace.openSubject}
              onOpenConversation={(id) => { chats.store.select(id); workspace.navigate("tutor", true); }} />
          ) : null}
          {workspace.activePage === "tutor" ? (
            <TutorPage isVisible={true} subjects={workspace.subjects} chats={chats} onCreateQuiz={(subjectId, conversationId) => openQuiz(subjectId ?? undefined, undefined, conversationId ?? undefined)} />
          ) : null}
          {workspace.activePage === "subjects" ? (
            <SubjectsPage
              quizzes={quizzes}
              onOpenQuiz={openQuiz}
              subjects={workspace.subjects}
              selectedSubject={workspace.selectedSubject}
              onBack={workspace.clearSelectedSubject}
              onOpen={workspace.openSubject}
              onCreate={workspace.addSubject}
              onAskTutor={(id) => {
                chats.store.startNew(id);
                workspace.navigate("tutor", true);
              }}
            />
          ) : null}
          {workspace.activePage === "settings" ? <SettingsPage profile={user} /> : null}
          {workspace.activePage === "quiz" ? (
            <QuizPage
              key={quizRequest.revision}
              subjects={workspace.subjects}
              controller={quizzes}
              initialSubjectId={quizRequest.subjectId}
              initialQuizId={quizRequest.quizId}
              conversationId={quizRequest.conversationId}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
