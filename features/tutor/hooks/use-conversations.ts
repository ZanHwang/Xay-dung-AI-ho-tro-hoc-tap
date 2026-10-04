"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Subject } from "@/features/subjects/types";
import { createConversationStore } from "../services/conversation-store";
import { generateTutorReply } from "../services/tutor.service";
import { classifyQuestion, titleFromQuestion } from "../services/classify-question";
import { removeChatImages } from "../services/chat-images";
import { saveChatAttachments } from "../services/chat-attachments";
import type { ChatImage } from "../types";

export function useConversations() {
  const [store] = useState(() => createConversationStore(() => window.localStorage));
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const inFlight = useRef(new Set<string>());
  const submittedDraft = useRef<number | null>(null);
  const [pending, setPending] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  useEffect(() => { store.hydrate(); }, [store]);

  async function send(id: string | null, text: string, subjects: Subject[], files: File[] = []) {
    const question = text.trim() || (files.length ? "Hỏi về tệp đính kèm" : "");
    const origin = store.getSnapshot();
    const key = id ?? `draft:${origin.draftRevision}`;
    if (!origin.ready || !question || inFlight.current.has(key)) return false;
    if (id === null) {
      if (submittedDraft.current === origin.draftRevision) return false;
    }
    inFlight.current.add(key);
    setPending([...inFlight.current]);
    setErrors((current) => ({ ...current, [key]: "" }));
    let images: ChatImage[] = [];
    let accepted = false;
    try {
      images = await saveChatAttachments(files);
      const message = { id: crypto.randomUUID(), role: "user" as const, content: question,
        images: images.filter((file) => file.type.startsWith("image/")),
        documents: images.filter((file) => !file.type.startsWith("image/")),
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) };
      if (id === null) {
        const classification = classifyQuestion(question, subjects, origin.draftSubjectId);
        const current = store.getSnapshot();
        const activate = current.activeId === null && current.draftRevision === origin.draftRevision;
        id = store.create(titleFromQuestion(question), classification.subjectId, classification.classification, message, activate);
        submittedDraft.current = origin.draftRevision;
      } else {
        if (!store.getSnapshot().conversations.some((item) => item.id === id)) throw new Error("Cuộc hội thoại đã bị xóa.");
        store.append(id, message);
      }
      const conversation = store.getSnapshot().conversations.find((item) => item.id === id);
      if (!conversation || !id) throw new Error("Không thể gửi tin nhắn.");
      accepted = true;
      inFlight.current.add(id); setPending([...inFlight.current]);
      const reply = await generateTutorReply({
        conversationId: id, subjectId: conversation.subjectId,
        subjectName: subjects.find((subject) => subject.id === conversation.subjectId)?.name,
        messages: conversation.messages,
      });
      store.append(id, {
        id: crypto.randomUUID(), role: "assistant", content: reply,
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      });
      return { conversationId: id, reply };
    } catch (error) {
      if (!accepted) await removeChatImages(images).catch(() => undefined);
      setErrors((current) => ({ ...current, [accepted && id ? id : key]: error instanceof Error ? error.message : "Không thể gửi câu hỏi. Hãy thử lại." }));
      return accepted && id ? { conversationId: id, reply: null } : false;
    } finally {
      inFlight.current.delete(key);
      if (id) inFlight.current.delete(id);
      setPending([...inFlight.current]);
    }
  }

  async function remove(id: string) {
    const images = store.getSnapshot().conversations.find((item) => item.id === id)?.messages.flatMap((message) => [...message.images ?? [], ...message.documents ?? []]) ?? [];
    store.remove(id);
    await removeChatImages(images).catch(() => {
      setErrors((current) => ({ ...current, cleanup: "Đã xóa chat nhưng chưa xóa được một số tệp trên thiết bị." }));
    });
  }

  return { ...state, store, pending, errors, send, remove };
}

export type ConversationsController = ReturnType<typeof useConversations>;
