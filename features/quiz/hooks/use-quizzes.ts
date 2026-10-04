"use client";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createQuizStore } from "../services/quiz-store";
import { calculateMastery } from "../services/quiz-engine";

export function useQuizzes() {
  const [store] = useState(() => createQuizStore(() => window.localStorage));
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  useEffect(() => { store.hydrate(); }, [store]);
  const mastery = useMemo(() => calculateMastery(state.quizzes, state.attempts), [state.quizzes, state.attempts]);
  return { ...state, store, mastery };
}
export type QuizController = ReturnType<typeof useQuizzes>;
