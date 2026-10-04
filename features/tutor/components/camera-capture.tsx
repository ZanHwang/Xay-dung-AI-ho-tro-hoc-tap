"use client";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function CameraCapture({ onCapture, onClose }: { onCapture: (file: File) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const mounted = useRef(true);
  useEffect(() => {
    let disposed = false;
    let stream: MediaStream | null = null;
    mounted.current = true;
    async function open() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Camera cần HTTPS hoặc localhost và trình duyệt hỗ trợ.");
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false });
        if (disposed) { stream.getTracks().forEach((track) => track.stop()); return; }
        if (video.current) { video.current.srcObject = stream; await video.current.play(); }
      } catch (error) {
        stream?.getTracks().forEach((track) => track.stop());
        if (!disposed) setError(error instanceof DOMException && error.name === "NotAllowedError" ? "Chưa được cấp quyền camera. Hãy cho phép truy cập hoặc chọn ảnh từ thiết bị." : "Không mở được camera. Hãy kiểm tra thiết bị, quyền truy cập và HTTPS/localhost.");
      }
    }
    void open();
    return () => { disposed = true; mounted.current = false; stream?.getTracks().forEach((track) => track.stop()); };
  }, []);
  function capture() {
    if (!video.current?.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.current.videoWidth; canvas.height = video.current.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) { setError("Không thể tạo ảnh trên trình duyệt này."); return; }
    context.drawImage(video.current, 0, 0);
    canvas.toBlob((blob) => {
      if (!mounted.current) return;
      if (!blob) { setError("Không chụp được ảnh. Hãy thử lại."); return; }
      onCapture(new File([blob], `bai-tap-${Date.now()}.jpg`, { type: "image/jpeg" })); onClose();
    }, "image/jpeg", 0.9);
  }
  return <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="bg-[#0c1728] text-white sm:max-w-3xl">
    <DialogHeader><DialogTitle>Chụp ảnh bài tập</DialogTitle><DialogDescription>Đặt đề bài trong khung, chụp rõ chữ. Ảnh chỉ được gửi khi bạn bấm Gửi.</DialogDescription></DialogHeader>
    <video ref={video} muted playsInline onLoadedData={() => setReady(true)} className="max-h-[60svh] w-full rounded-xl bg-black" />
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
    <div className="flex justify-end gap-2"><Button variant="ghost" onClick={onClose}>Hủy</Button><Button disabled={!ready || !!error} onClick={capture}>Chụp ảnh</Button></div>
  </DialogContent></Dialog>;
}
