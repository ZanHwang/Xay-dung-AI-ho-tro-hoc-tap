"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp, Camera, FilePlus, ImagePlus, Mic, Plus, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { DOCUMENT_ACCEPT } from "../services/chat-attachments";
import { CameraCapture } from "./camera-capture";

type Recognition = {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((event: { results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
};

export function ChatMediaControls({ disabled, onFiles, onVoice, input, onInput, onSend, hasFiles }: {
  disabled: boolean; onFiles: (files: File[]) => void; onVoice: (text: string) => void;
  input: string; onInput: (text: string) => void; onSend: () => void; hasFiles: boolean;
}) {
  const picker = useRef<HTMLInputElement>(null);
  const documents = useRef<HTMLInputElement>(null);
  const recognition = useRef<Recognition | null>(null);
  const [camera, setCamera] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");
  const stopping = useRef(false);
  useEffect(() => () => {
    const current = recognition.current;
    if (current) { current.onend = null; current.onresult = null; current.onerror = null; current.abort(); }
  }, []);
  useEffect(() => {
    if (disabled && recognition.current) {
      const current = recognition.current;
      current.onresult = null; current.onerror = null;
      current.onend = () => { recognition.current = null; setListening(false); };
      current.abort();
    }
  }, [disabled]);

  function start() {
    if (recognition.current || disabled) return;
    const browser = window as unknown as { SpeechRecognition?: new () => Recognition; webkitSpeechRecognition?: new () => Recognition };
    const Constructor = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Constructor) { setError("Trình duyệt chưa hỗ trợ nhận giọng nói. Hãy thử Chrome/Edge hoặc nhập câu hỏi."); return; }
    window.speechSynthesis?.cancel();
    const current = new Constructor();
    recognition.current = current;
    current.lang = "vi-VN"; current.continuous = true; current.interimResults = true;
    let finalText = "";
    let failed = false;
    stopping.current = false;
    setError(""); setTranscript("");
    current.onresult = (event) => {
      const results = Array.from(event.results);
      finalText = results.filter((result) => result.isFinal).map((result) => result[0].transcript).join(" ");
      setTranscript(results.map((result) => result[0].transcript).join(" "));
    };
    current.onerror = (event) => {
      failed = true;
      setError(event.error === "not-allowed" ? "Chưa được cấp quyền micro. Hãy cho phép micro trong trình duyệt." : "Không nhận được giọng nói. Kiểm tra micro/kết nối và thử lại.");
    };
    current.onend = () => {
      recognition.current = null; setListening(false);
      if (finalText.trim()) onVoice(finalText.trim());
      else if (!failed) setError("Chưa nghe rõ câu hỏi. Hãy thử lại.");
    };
    try { current.start(); setListening(true); }
    catch { recognition.current = null; setError("Không thể bật micro. Hãy thử lại."); }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 rounded-2xl border border-border bg-card p-2 shadow-sm focus-within:border-blue-400 sm:gap-2">
        <input ref={picker} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" aria-label="Chọn ảnh bài tập"
          onChange={(event) => { onFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
        <input ref={documents} type="file" accept={DOCUMENT_ACCEPT} multiple className="hidden" aria-label="Chọn tài liệu"
          onChange={(event) => { onFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" disabled={disabled || listening} aria-label="Thêm ảnh hoặc tài liệu" title="Thêm ảnh hoặc tài liệu" className="size-9 shrink-0 rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Plus className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="top" sideOffset={12} className="w-56 rounded-2xl border-border bg-card p-2 text-foreground">
            <DropdownMenuItem onSelect={() => setCamera(true)} className="rounded-lg py-2.5 focus:bg-secondary focus:text-foreground">
              <Camera /> Chụp bài tập
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => picker.current?.click()} className="rounded-lg py-2.5 focus:bg-secondary focus:text-foreground">
              <ImagePlus /> Thêm ảnh
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => documents.current?.click()} className="rounded-lg py-2.5 focus:bg-secondary focus:text-foreground">
              <FilePlus /> Thêm tài liệu
            </DropdownMenuItem>
            <p className="px-2 pt-2 text-xs text-muted-foreground">Tối đa 4 tệp, 10 MB/tệp</p>
          </DropdownMenuContent>
        </DropdownMenu>
        <Textarea
          aria-label="Câu hỏi cho AI Tutor"
          rows={1}
          value={input}
          disabled={disabled || listening}
          onChange={(event) => onInput(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); onSend(); } }}
          placeholder={listening ? "Đang nghe… bấm mic để dừng" : "Bạn muốn hỏi gì?"}
          className="min-h-9 max-h-36 min-w-0 flex-1 resize-none rounded-none border-0 bg-transparent px-1 py-2 text-sm text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0 disabled:opacity-70"
        />
        <span className="hidden shrink-0 self-center text-xs text-muted-foreground sm:block">AI Tutor</span>
        <Button
          size="icon"
          variant="ghost"
          disabled={disabled && !listening}
          aria-pressed={listening}
          aria-label={listening ? "Dừng ghi âm" : "Bắt đầu ghi âm"}
          title={listening ? "Bấm để dừng nói" : "Nhập bằng giọng nói"}
          className={`size-9 shrink-0 rounded-full ${listening ? "animate-pulse bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-950/40" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
          onClick={() => {
            if (!listening) start();
            else if (!stopping.current) { stopping.current = true; recognition.current?.stop(); }
          }}
        >
          {listening ? <Square className="size-4 fill-current" /> : <Mic className="size-5" />}
        </Button>
        <Button
          size="icon"
          disabled={disabled || listening || (!input.trim() && !hasFiles)}
          onClick={onSend}
          aria-label="Gửi câu hỏi"
          title="Gửi câu hỏi"
          className="size-9 shrink-0 rounded-full bg-gray-900 text-white hover:bg-gray-800 disabled:bg-secondary disabled:text-muted-foreground"
        >
          <ArrowUp className="size-5" />
        </Button>
      </div>
      {listening && (
        <div className="flex items-center gap-2 px-2">
          <p role="status" className="min-w-0 flex-1 text-sm text-red-600 dark:text-red-300">{transcript || "Đang nghe… Bấm lại nút mic để dừng."}</p>
          <Button size="sm" variant="ghost" onClick={() => {
            const current = recognition.current;
            if (current) { current.onend = null; current.onresult = null; current.onerror = null; current.abort(); }
            recognition.current = null; setListening(false); setTranscript("");
          }}>Hủy</Button>
        </div>
      )}
      {listening && <p className="px-2 text-[11px] text-muted-foreground">Giọng nói sẽ chuyển thành chữ để bạn kiểm tra trước khi gửi. Trình duyệt có thể xử lý âm thanh trực tuyến.</p>}
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
      {camera && <CameraCapture onCapture={onFilesFromCamera} onClose={() => setCamera(false)} />}
    </div>
  );

  function onFilesFromCamera(file: File) { onFiles([file]); }
}
