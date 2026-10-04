"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatFileSize, readSubjectDocument, type SubjectDocument } from "../services/document.service";
import { downloadDocument, prepareDocumentPreview, type DocumentPreview } from "../services/document-preview";

type LoadedDocument = { blob: Blob; preview: DocumentPreview; url: string | null };

export function DocumentViewer({ document, onClose }: { document: SubjectDocument; onClose: () => void }) {
  const [loaded, setLoaded] = useState<LoadedDocument | null>(null);
  const [error, setError] = useState("");
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let disposed = false;
    let objectUrl: string | null = null;
    async function load() {
      try {
        const stored = await readSubjectDocument(document.subjectId, document.id);
        if (!stored) throw new Error("Không tìm thấy tài liệu. File có thể đã bị xóa ở một tab khác.");
        const preview = await prepareDocumentPreview(stored.name, stored.blob);
        if (disposed) return;
        if (preview.kind === "pdf" || preview.kind === "image") objectUrl = URL.createObjectURL(preview.blob);
        setLoaded({ blob: stored.blob, preview, url: objectUrl });
      } catch (error) {
        if (!disposed) setError(error instanceof Error ? error.message : "Không thể mở tài liệu.");
      }
    }
    void load();
    return () => { disposed = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [document.id, document.subjectId]);

  const preview = loaded?.preview;
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="flex h-[90svh] w-[calc(100%-2rem)] max-w-6xl flex-col gap-3 overflow-hidden border-border bg-card text-foreground sm:max-w-6xl">
        <DialogHeader className="shrink-0 pr-8 text-left">
          <DialogTitle className="break-words">{document.name}</DialogTitle>
          <DialogDescription className="text-muted-foreground">{formatFileSize(document.size)} · Tài liệu của môn học</DialogDescription>
        </DialogHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-auto rounded-lg border border-border bg-muted">
          {error ? <p role="alert" className="p-6 text-sm text-red-500">{error}</p> : !loaded
            ? <p role="status" className="p-6 text-sm text-muted-foreground">Đang mở tài liệu...</p> : null}
          {preview?.kind === "pdf" && loaded?.url && (
            <>
              <p className="shrink-0 p-2 text-xs text-muted-foreground">Nếu trình duyệt không hiển thị PDF, bạn có thể tải xuống để xem.</p>
              <iframe src={loaded.url} title={`Nội dung ${document.name}`} className="min-h-80 w-full flex-1 border-0 bg-card" />
            </>
          )}
          {preview?.kind === "image" && loaded?.url && (imageFailed
            ? <p role="alert" className="p-6 text-sm text-red-500">Không thể hiển thị ảnh. Hãy tải xuống để kiểm tra file.</p>
            // eslint-disable-next-line @next/next/no-img-element
            : <img src={loaded.url} alt={document.name} onError={() => setImageFailed(true)} className="m-auto max-h-full max-w-full object-contain" />)}
          {preview?.kind === "text" && (
            <>
              {preview.truncated && <p className="p-3 text-sm text-amber-700 dark:text-amber-300">Đang hiển thị 2 MB đầu tiên. Tải xuống để đọc toàn bộ tài liệu.</p>}
              <pre className="whitespace-pre-wrap break-words p-4 font-mono text-sm leading-6 text-foreground">{preview.text || "Tài liệu không có nội dung văn bản."}</pre>
            </>
          )}
          {preview?.kind === "unsupported" && (
            <div className="m-auto max-w-lg p-6 text-center">
              <h3 className="font-semibold text-foreground">Định dạng này chưa hỗ trợ xem trực tiếp</h3>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">Bạn có thể tải file Word, PowerPoint, Excel hoặc định dạng khác về để mở bằng ứng dụng phù hợp. Hiện hỗ trợ xem PDF, ảnh và văn bản.</p>
            </div>
          )}
        </div>
        <div className="flex shrink-0 justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Đóng</Button>
          <Button disabled={!loaded} onClick={() => { if (loaded) downloadDocument(document.name, loaded.blob); }} className="bg-blue-500 text-white hover:bg-blue-600">Tải xuống</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
