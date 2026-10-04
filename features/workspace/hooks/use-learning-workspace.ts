"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildSubject,
  readStoredSubjects,
  storeSubjects,
} from "@/features/subjects/services/subject.service";
import { initialSubjects } from "@/features/subjects/data/subject.mocks";
import type {
  CreateSubjectInput,
  Subject,
} from "@/features/subjects/types";
import type { NavKey } from "@/features/workspace/types";
import { addSubjectDocuments, deleteSubjectDocument } from "@/features/subjects/services/document.service";

const validPages: NavKey[] = ["dashboard", "tutor", "subjects", "quiz", "settings"];

export function useLearningWorkspace(onTutorEnter: () => void) {
  const [activePage, setActivePage] = useState<NavKey>("dashboard");
  const [hasOpenedTutor, setHasOpenedTutor] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const subjectsRef = useRef<Subject[]>(initialSubjects);

  useEffect(() => {
    const stored = readStoredSubjects();
    subjectsRef.current = stored;
    setSubjects(stored);
  }, []);

  const selectedSubject = useMemo(
    () => subjects.find((subject) => subject.id === selectedSubjectId),
    [selectedSubjectId, subjects],
  );

  const navigate = useCallback((page: NavKey, preserveConversation = false) => {
    if (page === "tutor" && !preserveConversation) onTutorEnter();
    if (page === "tutor") setHasOpenedTutor(true);
    setActivePage(page);
    if (page !== "subjects") setSelectedSubjectId(null);
  }, [onTutorEnter]);

  const openSubject = useCallback((id: string) => {
    setSelectedSubjectId(id);
    setActivePage("subjects");
  }, []);

  const addSubject = useCallback(async (input: CreateSubjectInput, files: File[] = []) => {
    const subject = buildSubject(input);
    const documents = await addSubjectDocuments(subject.id, files);
    const next = [...subjectsRef.current, subject];
    try {
      storeSubjects(next);
    } catch {
      await Promise.allSettled(documents.map((document) => deleteSubjectDocument(subject.id, document.id)));
      throw new Error("Không thể lưu môn học. Hãy kiểm tra dung lượng và quyền lưu trữ của trình duyệt rồi thử lại.");
    }
    subjectsRef.current = next;
    setSubjects(next);
    return subject;
  }, []);

  useEffect(() => {
    const context = document.modelContext;
    if (!context?.registerTool) return;

    const lifecycle = new AbortController();

    const registerTools = async () => {
      await context.registerTool(
        {
          name: "navigate_learning_workspace",
          title: "Đi đến khu vực học tập",
          description:
            "Mở Dashboard, AI Tutor, Môn học, Quiz hoặc Cài đặt trong giao diện JARVIS.",
          inputSchema: {
            type: "object",
            properties: { page: { type: "string", enum: validPages } },
            required: ["page"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: true, untrustedContentHint: false },
          execute(input: unknown) {
            const page = (input as { page?: string })?.page;
            if (!validPages.includes(page as NavKey)) {
              throw new Error("Khu vực không hợp lệ.");
            }
            navigate(page as NavKey);
            return { page, status: "opened" };
          },
        },
        { signal: lifecycle.signal },
      );

      await context.registerTool(
        {
          name: "create_subject",
          title: "Tạo môn học",
          description: "Tạo một môn học mới trong JARVIS.",
          inputSchema: {
            type: "object",
            properties: {
              name: { type: "string", minLength: 1 },
              description: { type: "string" },
            },
            required: ["name"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          async execute(input: unknown) {
            const value = input as { name?: string; description?: string };
            if (!value.name?.trim()) {
              throw new Error("Tên môn học không được để trống.");
            }
            const subject = await addSubject({
              name: value.name,
              description: value.description ?? "",
            });
            openSubject(subject.id);
            return { id: subject.id, name: subject.name, status: "created" };
          },
        },
        { signal: lifecycle.signal },
      );
    };

    void registerTools().catch(() => undefined);
    return () => lifecycle.abort();
  }, [addSubject, navigate, openSubject]);

  return {
    activePage,
    hasOpenedTutor,
    subjects,
    selectedSubject,
    navigate,
    openSubject,
    clearSelectedSubject: () => setSelectedSubjectId(null),
    addSubject,
  };
}
