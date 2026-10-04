"use client";
import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { loadChatImage } from "../services/chat-images";
import { formatFileSize } from "@/features/subjects/services/document.service";
import type { ChatImage } from "../types";

export function ChatDocument({ document }: { document: ChatImage }) {
  const [url, setUrl] = useState<string>();
  const [error, setError] = useState(false);
  useEffect(() => {
    let disposed = false;
    let objectUrl: string | undefined;
    void loadChatImage(document.id).then((blob) => {
      if (disposed) return;
      if (!blob) { setError(true); return; }
      objectUrl = URL.createObjectURL(blob); setUrl(objectUrl);
    }).catch(() => { if (!disposed) setError(true); });
    return () => { disposed = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [document.id]);
  return (
    <div className="my-2 flex items-center gap-2 rounded-xl border border-border bg-muted p-3 text-sm text-foreground">
      <FileText className="size-5 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block break-all">{document.name}</span>
        <span className="text-xs text-muted-foreground">{formatFileSize(document.size)}</span>
      </span>
      {url && <a href={url} download={document.name} aria-label={`Tải ${document.name}`} className="rounded p-2 hover:bg-secondary"><Download className="size-4" /></a>}
      {error && <span role="alert" className="text-xs text-red-500">Không đọc được tệp</span>}
    </div>
  );
}
