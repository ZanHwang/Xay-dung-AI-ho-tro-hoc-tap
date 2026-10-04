"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DocumentPicker } from "./document-picker";
import { DocumentViewer } from "./document-viewer";
import { downloadDocument } from "../services/document-preview";
import { addSubjectDocuments, deleteSubjectDocument, formatFileSize, listSubjectDocuments, readSubjectDocument, type SubjectDocument } from "../services/document.service";

export function SubjectDocuments({ subjectId }: { subjectId: string }) {
  const [documents, setDocuments] = useState<SubjectDocument[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState<SubjectDocument | null>(null);
  const [viewing, setViewing] = useState<SubjectDocument | null>(null);

  useEffect(() => {
    let disposed = false;
    listSubjectDocuments(subjectId).then((items) => {
      if (!disposed) { setDocuments(items); setLoading(false); }
    }).catch((error: unknown) => {
      if (!disposed) { setError(error instanceof Error ? error.message : "Không thể đọc tài liệu."); setLoading(false); }
    });
    return () => { disposed = true; };
  }, [subjectId]);

  async function perform(action: () => Promise<void>) {
    setBusy(true); setError(""); setNotice("");
    try { await action(); }
    catch (error) { setError(error instanceof Error ? error.message : "Không thể xử lý tài liệu."); }
    finally { setBusy(false); }
  }

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8" aria-label="Tài liệu môn học">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Tài liệu môn học ({documents.length})</h3>
      <DocumentPicker files={files} onChange={setFiles} disabled={busy} />
      <Button
        className="mt-3 bg-blue-500 text-white hover:bg-blue-600"
        disabled={busy || loading || !files.length}
        onClick={() => void perform(async () => {
          const added = await addSubjectDocuments(subjectId, files);
          setDocuments((current) => [...added, ...current]); setFiles([]);
          setNotice(`Đã thêm ${added.length} tài liệu.`);
        })}
      >
        {busy ? "Đang xử lý..." : `Lưu tài liệu${files.length ? ` (${files.length})` : ""}`}
      </Button>
      {error && <p role="alert" className="mt-3 text-sm text-red-500">{error}</p>}
      {notice && <p role="status" className="mt-3 text-sm text-emerald-600 dark:text-emerald-300">{notice}</p>}
      {loading ? (
        <p className="mt-5 text-sm text-muted-foreground">Đang tải tài liệu...</p>
      ) : documents.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">Chưa có tài liệu. Bạn có thể thêm giáo trình, slide hoặc bài tập tại đây.</p>
      ) : (
        <ul className="mt-5 divide-y divide-gray-100">
          {documents.map((document) => (
            <li key={document.id} className="flex flex-wrap items-center gap-3 py-4">
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium text-foreground">{document.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatFileSize(document.size)} · Đã lưu trên thiết bị · Chưa xử lý AI</p>
              </div>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => setViewing(document)} aria-label={`Xem ${document.name}`}>Xem</Button>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => void perform(async () => {
                const stored = await readSubjectDocument(subjectId, document.id);
                if (!stored) throw new Error("Không tìm thấy file đã lưu.");
                downloadDocument(stored.name, stored.blob);
              })}>Tải xuống</Button>
              <Button variant="ghost" size="sm" disabled={busy} onClick={() => setDeleting(document)} aria-label={`Xóa ${document.name}`}>Xóa</Button>
            </li>
          ))}
        </ul>
      )}
      {viewing && <DocumentViewer key={viewing.id} document={viewing} onClose={() => setViewing(null)} />}
      <Dialog open={deleting !== null} onOpenChange={(open) => { if (!open && !busy) setDeleting(null); }}>
        <DialogContent className="border-border bg-card text-foreground">
          <DialogHeader><DialogTitle>Xóa tài liệu?</DialogTitle>
            <DialogDescription className="break-words text-muted-foreground">{deleting?.name} sẽ bị xóa khỏi kho tài liệu của môn này.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" disabled={busy} onClick={() => setDeleting(null)}>Hủy</Button>
            <Button variant="destructive" disabled={busy} onClick={() => void perform(async () => {
              if (!deleting) return;
              await deleteSubjectDocument(subjectId, deleting.id);
              setDocuments((current) => current.filter((item) => item.id !== deleting.id));
              setDeleting(null); setNotice("Đã xóa tài liệu.");
            })}>Xóa tài liệu</Button>
          </div>
          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        </DialogContent>
      </Dialog>
    </section>
  );
}
