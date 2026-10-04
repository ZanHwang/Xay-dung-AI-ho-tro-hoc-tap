"use client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { loadChatImage } from "../services/chat-images";
import type { ChatImage } from "../types";

export function ChatImageView({ image, file }: { image?: ChatImage; file?: File }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState(false);
  const name = image?.name ?? file?.name ?? "Ảnh bài tập";
  useEffect(() => {
    let disposed = false;
    let objectUrl: string | null = null;
    async function load() {
      try {
        const blob = file ?? (image ? await loadChatImage(image.id) : null);
        if (disposed) return;
        if (!blob) { setError(true); return; }
        objectUrl = URL.createObjectURL(blob); setUrl(objectUrl);
      } catch { if (!disposed) setError(true); }
    }
    void load();
    return () => { disposed = true; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [file, image]);
  return (
    <>
      {error ? <p className="text-xs text-red-500">Không đọc được ảnh: {name}</p> : url ? (
        <button type="button" onClick={() => setOpen(true)} aria-label={`Xem ảnh ${name}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={name} onError={() => setError(true)} className="max-h-40 max-w-48 rounded-lg object-contain" />
        </button>
      ) : (
        <span className="text-xs text-muted-foreground">Đang tải ảnh...</span>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90svh] overflow-auto bg-card text-foreground sm:max-w-4xl">
          <DialogHeader><DialogTitle className="break-words">{name}</DialogTitle><DialogDescription className="text-muted-foreground">Ảnh bài tập đã đính kèm</DialogDescription></DialogHeader>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {url && <img src={url} alt={name} className="max-h-[70svh] w-full object-contain" />}
        </DialogContent>
      </Dialog>
    </>
  );
}
