"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Plus, FileText, Pencil, Trash2, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Subject } from "@/features/subjects/types";
import { ChatMessage } from "@/features/tutor/components/chat-message";
import type { ConversationsController } from "../hooks/use-conversations";
import { ChatImageView } from "../components/chat-image";
import { ChatMediaControls } from "../components/chat-media-controls";
import { validateChatAttachments } from "../services/chat-attachments";
import { formatFileSize } from "@/features/subjects/services/document.service";

type Props = { subjects: Subject[]; chats: ConversationsController; isVisible: boolean; onCreateQuiz: (subjectId: string | null, conversationId: string | null) => void };
type Editor = { id: string; title: string };

export function TutorPage({ subjects, chats, onCreateQuiz, isVisible }: Props) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<Record<string, File[]>>({});
  const [mediaErrors, setMediaErrors] = useState<Record<string, string>>({});
  const bottom = useRef<HTMLDivElement>(null);
  const active = chats.conversations.find((item) => item.id === chats.activeId);
  const pendingKey = active?.id ?? `draft:${chats.draftRevision}`;
  const pending = chats.pending.includes(pendingKey);
  const draftKey = active?.id ?? `new-${chats.draftRevision}`;
  const files = attachments[draftKey] ?? [];
  const input = drafts[draftKey] ?? "";
  const draftSubject = subjects.find((subject) => subject.id === chats.draftSubjectId);
  const subjectName = (id: string | null) => id === null ? "Hỏi đáp chung"
    : subjects.find((subject) => subject.id === id)?.name ?? "Môn học không còn tồn tại";
  const conversations = [...chats.conversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  useEffect(() => { bottom.current?.scrollIntoView({ block: "nearest" }); }, [active?.id, active?.messages.length, pending]);

  async function send(text = input) {
    if (!chats.ready || pending || (!text.trim() && !files.length)) return;
    const result = await chats.send(active?.id ?? null, text, subjects, files);
    if (!result) return;
    setDrafts((current) => ({ ...current, [draftKey]: "" }));
    setAttachments((current) => ({ ...current, [draftKey]: [] }));
  }

  function addFiles(added: File[]) {
    try {
      validateChatAttachments([...files, ...added]);
      setAttachments((current) => ({ ...current, [draftKey]: [...files, ...added] }));
      setMediaErrors((current) => ({ ...current, [draftKey]: "" }));
    } catch (error) { setMediaErrors((current) => ({ ...current, [draftKey]: error instanceof Error ? error.message : "Không thể thêm tệp." })); }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">Trợ giảng cá nhân</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">AI Tutor</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {draftSubject && !active ? `Đặt câu hỏi về môn ${draftSubject.name}.` : "Hỏi ngay để bắt đầu. JARVIS sẽ đặt tên và nhận diện môn học từ câu hỏi đầu tiên."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={!chats.ready} variant="outline" onClick={() => onCreateQuiz(active ? active.subjectId : chats.draftSubjectId, active?.id ?? null)}>
            <ClipboardCheck /> Tạo Quiz
          </Button>
          <Button
            disabled={!chats.ready}
            onClick={() => chats.store.startNew()}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            <Plus /> Hội thoại mới
          </Button>
        </div>
      </div>

      {chats.storageError && <p role="alert" className="mb-4 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-3 text-sm text-amber-700 dark:text-amber-300">{chats.storageError}</p>}

      <div className="grid overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:grid-cols-[280px_1fr]">
        <aside className="max-h-64 overflow-y-auto border-b border-border bg-muted p-4 lg:max-h-[720px] lg:border-b-0 lg:border-r" aria-label="Lịch sử hội thoại">
          <p className="mb-3 text-sm font-semibold text-foreground">Cuộc hội thoại ({conversations.length})</p>
          {!chats.ready ? <p className="text-sm text-muted-foreground">Đang tải lịch sử...</p> : conversations.length === 0 && <p className="text-sm text-muted-foreground">Chưa có cuộc hội thoại.</p>}
          <div className="space-y-2">
            {conversations.map((conversation) => <button type="button" key={conversation.id}
              aria-current={active?.id === conversation.id ? "true" : undefined}
              onClick={() => chats.store.select(conversation.id)}
              className={`w-full rounded-lg p-3 text-left ${active?.id === conversation.id ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300" : "text-foreground hover:bg-secondary"}`}>
              <span className="block truncate text-sm font-medium">{conversation.title}</span>
              <span className="mt-1 block truncate text-xs text-muted-foreground">{conversation.classification === "uncertain" ? "Chưa xác định môn" : subjectName(conversation.subjectId)}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{conversation.messages.length} tin nhắn{chats.pending.includes(conversation.id) ? " · Đang trả lời" : ""}</span>
            </button>)}
          </div>
          <p className="mt-5 text-xs leading-5 text-muted-foreground">Lịch sử được lưu trên trình duyệt này. Tài liệu và tiến độ thuộc môn học, độc lập với cuộc hội thoại.</p>
        </aside>

        <section className="flex h-[640px] min-w-0 flex-col lg:h-[720px]" aria-label="Nội dung hội thoại">
          <div className="flex items-center gap-3 border-b border-border p-4">
            <Bot className="size-6 shrink-0 text-blue-500" />
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-semibold text-foreground">{active?.title ?? "Cuộc hội thoại mới"}</h2>
              {active ? <label className="mt-2 block text-xs text-muted-foreground">
                {active.classification === "automatic" ? "Môn được nhận diện · Có thể thay đổi" : "Ngữ cảnh học tập"}
                <select aria-label="Thay đổi môn học" disabled={pending}
                  value={active.classification === "uncertain" ? "__uncertain" : active.subjectId ?? ""}
                  onChange={(event) => chats.store.setSubject(active.id, event.target.value || null)}
                  className="mt-1 block w-full max-w-xs rounded border border-input bg-card p-1 text-sm text-foreground">
                  {active.classification === "uncertain" && <option value="__uncertain" disabled>Chưa xác định môn — hãy chọn nếu cần</option>}
                  <option value="">Hỏi đáp chung</option>
                  {active.subjectId && !subjects.some((subject) => subject.id === active.subjectId) && <option value={active.subjectId} disabled>Môn học không còn tồn tại</option>}
                  {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                </select>
              </label> : <p className="mt-1 text-xs text-muted-foreground">{draftSubject ? `Môn học: ${draftSubject.name}` : "Tự nhận diện môn sau câu hỏi đầu tiên"}</p>}
            </div>
            {active && <>
              <Button variant="ghost" size="icon" aria-label="Đổi tên cuộc hội thoại" onClick={() => setEditor({ id: active.id, title: active.title })}>
                <Pencil />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Xóa cuộc hội thoại" onClick={() => setDeleteId(active.id)}>
                <Trash2 />
              </Button>
            </>}
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5" role="log" aria-label="Tin nhắn">
            {!active && <div className="py-12 text-center">
              <Bot className="mx-auto mb-4 size-10 text-blue-500" />
              <h3 className="text-xl text-foreground">{draftSubject ? `Bạn muốn hỏi gì về ${draftSubject.name}?` : "Hôm nay bạn muốn học gì?"}</h3>
              <p className="mt-3 text-sm text-muted-foreground">Gửi câu hỏi để bắt đầu. Hội thoại chỉ được lưu sau khi bạn gửi tin nhắn đầu tiên.</p>
            </div>}
            {active?.messages.length === 0 && <p className="text-sm leading-6 text-muted-foreground">Bạn muốn tìm hiểu điều gì?</p>}
            {active?.messages.map((message) => <ChatMessage key={message.id} message={message} />)}
            {pending && <p role="status" className="text-sm text-blue-500">JARVIS đang suy nghĩ...</p>}
            {chats.errors[pendingKey] && <p role="alert" className="text-sm text-red-500">{chats.errors[pendingKey]}</p>}
            {chats.errors.cleanup && <p role="alert" className="text-sm text-red-500">{chats.errors.cleanup}</p>}
            <div ref={bottom} />
          </div>

          <div className="border-t border-border p-4">
            {files.length > 0 && <div className="mb-3 flex max-h-48 gap-3 overflow-auto">{files.map((file, index) => <div key={`${file.name}-${file.lastModified}-${index}`} className="shrink-0">
              {file.type.startsWith("image/") ? <ChatImageView file={file} /> : <div className="flex max-w-60 items-center gap-2 rounded-lg border border-border p-3 text-sm text-foreground"><FileText className="size-5 shrink-0" /><div className="min-w-0"><p className="truncate">{file.name}</p><p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p></div></div>}
              <Button size="sm" variant="ghost" disabled={pending} aria-label={`Bỏ tệp ${file.name}`} onClick={() => setAttachments((current) => ({ ...current, [draftKey]: files.filter((_, i) => i !== index) }))}>Bỏ tệp</Button>
            </div>)}</div>}
            {mediaErrors[draftKey] && <p role="alert" className="mb-2 text-sm text-red-500">{mediaErrors[draftKey]}</p>}
            {isVisible && <ChatMediaControls key={draftKey} disabled={!chats.ready || pending} onFiles={addFiles}
              input={input} hasFiles={files.length > 0} onInput={(text) => setDrafts((current) => ({ ...current, [draftKey]: text }))}
              onSend={() => void send()} onVoice={(text) => setDrafts((current) => ({ ...current, [draftKey]: [current[draftKey]?.trim(), text].filter(Boolean).join(" ") }))} />}
            <p className="mt-2 text-center text-[11px] text-muted-foreground">Phản hồi mô phỏng · Chưa đọc nội dung ảnh/tài liệu · Shift + Enter để xuống dòng</p>
          </div>
        </section>
      </div>

      <Dialog open={editor !== null} onOpenChange={(open) => { if (!open) setEditor(null); }}>
        <DialogContent className="bg-card text-foreground">
          <DialogHeader><DialogTitle>Đổi tên cuộc hội thoại</DialogTitle>
            <DialogDescription>Đặt tên để dễ tìm lại nội dung học tập.</DialogDescription></DialogHeader>
          {editor && <form className="space-y-4" onSubmit={(event) => {
            event.preventDefault();
            if (!editor.title.trim()) return;
            chats.store.rename(editor.id, editor.title);
            setEditor(null);
          }}>
            <label className="block text-sm">Tên cuộc hội thoại<Input autoFocus maxLength={120} value={editor.title}
              onChange={(event) => setEditor({ ...editor, title: event.target.value })} placeholder="Ví dụ: Ôn tập chương 1" className="mt-2" /></label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditor(null)}>Hủy</Button>
              <Button type="submit" disabled={!editor.title.trim()}>Lưu tên</Button>
            </div>
          </form>}
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
        <DialogContent className="bg-card text-foreground">
          <DialogHeader><DialogTitle>Xóa cuộc hội thoại?</DialogTitle>
            <DialogDescription>Toàn bộ tin nhắn của cuộc hội thoại này sẽ bị xóa. Môn học, tài liệu và tiến độ vẫn được giữ nguyên.</DialogDescription></DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setDeleteId(null)}>Hủy</Button>
            <Button variant="destructive" onClick={() => { if (deleteId) void chats.remove(deleteId); setDeleteId(null); }}>Xóa hội thoại</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
