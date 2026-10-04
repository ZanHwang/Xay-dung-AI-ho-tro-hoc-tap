import { z } from "zod";
import type { ChatMessage, Conversation } from "../types";

export const CONVERSATIONS_STORAGE_KEY = "jarvis.conversations.v1";
const conversationSchema = z.object({
  classification: z.enum(["automatic", "manual", "uncertain", "general"]).optional(),
  id: z.string().min(1),
  subjectId: z.string().min(1).nullable(),
  title: z.string().trim().min(1).max(120),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  messages: z.array(z.object({
    id: z.string().min(1),
    role: z.enum(["user", "assistant"]),
    content: z.string(),
    timestamp: z.string(),
    documents: z.array(z.object({ id: z.string().min(1), name: z.string(), type: z.string(), size: z.number().int().positive().max(10 * 1024 * 1024) })).max(4).optional(),
    images: z.array(z.object({ id: z.string().min(1), name: z.string(), type: z.enum(["image/jpeg", "image/png", "image/webp"]), size: z.number().int().positive().max(10 * 1024 * 1024) })).max(4).optional(),
  })).refine((messages) => new Set(messages.map((message) => message.id)).size === messages.length),
});
const savedSchema = z.object({
  conversations: z.array(conversationSchema).refine(
    (items) => new Set(items.map((item) => item.id)).size === items.length,
  ),
  activeId: z.string().nullable(),
});

type Snapshot = {
  draftSubjectId: string | null;
  draftRevision: number;
  conversations: Conversation[];
  activeId: string | null;
  ready: boolean;
  storageError: string | null;
};
type StorageAccess = () => Pick<Storage, "getItem" | "setItem">;

export function createConversationStore(getStorage: StorageAccess) {
  let state: Snapshot = { conversations: [], activeId: null, ready: false, storageError: null, draftRevision: 0, draftSubjectId: null };
  const listeners = new Set<() => void>();
  function publish(next: Snapshot) {
    state = next;
    listeners.forEach((listener) => listener());
  }
  function save(next: Snapshot) {
    try {
      getStorage().setItem(CONVERSATIONS_STORAGE_KEY, JSON.stringify({
        conversations: next.conversations, activeId: next.activeId,
      }));
      publish({ ...next, storageError: null });
    } catch {
      publish({ ...next, storageError: "Không thể lưu lịch sử trên trình duyệt. Thay đổi hiện chỉ được giữ trong phiên này." });
    }
  }
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    hydrate() {
      if (state.ready) return;
      try {
        const value = getStorage().getItem(CONVERSATIONS_STORAGE_KEY);
        const saved = value === null ? { conversations: [], activeId: null } : savedSchema.parse(JSON.parse(value));
        publish({ ...state, ...saved, activeId: null, ready: true, storageError: null });
      } catch {
        publish({ ...state, ready: true, storageError: "Không thể đọc lịch sử đã lưu. Dữ liệu có thể bị lỗi hoặc trình duyệt đang chặn lưu trữ." });
      }
    },
    startNew(subjectId: string | null = null) {
      // A blank composer is not a persisted conversation.
      publish({ ...state, activeId: null, draftRevision: state.draftRevision + 1, draftSubjectId: subjectId });
    },
    create(title: string, subjectId: string | null, classification?: Conversation["classification"], firstMessage?: ChatMessage, activate = true) {
      if (!state.ready || !title.trim()) return null;
      const now = new Date().toISOString();
      const conversation: Conversation = {
        id: crypto.randomUUID(), title: title.trim().slice(0, 120), subjectId,
        createdAt: now, updatedAt: now, classification, messages: firstMessage ? [firstMessage] : [],
      };
      save({ ...state, conversations: [conversation, ...state.conversations], activeId: activate ? conversation.id : state.activeId });
      return conversation.id;
    },
    select(id: string) {
      if (state.conversations.some((item) => item.id === id)) save({ ...state, activeId: id });
    },
    rename(id: string, title: string) {
      if (!title.trim()) return;
      save({ ...state, conversations: state.conversations.map((item) => item.id === id
        ? { ...item, title: title.trim().slice(0, 120) } : item) });
    },
    setSubject(id: string, subjectId: string | null) {
      save({ ...state, conversations: state.conversations.map((item) => item.id === id
        ? { ...item, subjectId, classification: "manual" } : item) });
    },
    remove(id: string) {
      const conversations = state.conversations.filter((item) => item.id !== id);
      const removedActive = state.activeId === id;
      save({ ...state, conversations, activeId: removedActive ? null : state.activeId,
        draftSubjectId: removedActive ? null : state.draftSubjectId,
        draftRevision: state.draftRevision + (removedActive ? 1 : 0) });
    },
    append(id: string, message: ChatMessage) {
      // A late response must never recreate a deleted conversation or enter another chat.
      if (!state.conversations.some((item) => item.id === id)) return;
      save({ ...state, conversations: state.conversations.map((item) => item.id === id
        ? { ...item, messages: [...item.messages, message], updatedAt: new Date().toISOString() } : item) });
    },
  };
}
