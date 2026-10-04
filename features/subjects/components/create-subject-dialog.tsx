"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { CreateSubjectInput } from "@/features/subjects/types";
import { DocumentPicker } from "./document-picker";

type CreateSubjectDialogProps = {
  onCreate: (input: CreateSubjectInput, files: File[]) => Promise<unknown>;
};

export function CreateSubjectDialog({ onCreate }: CreateSubjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim() || saving) return;
    setSaving(true); setError("");
    try {
      await onCreate({ name, description }, files);
      setName(""); setDescription(""); setFiles([]); setOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Không thể tạo môn học. Hãy thử lại.");
    } finally { setSaving(false); }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!saving) { setOpen(next); setError(""); } }}>
      <DialogTrigger asChild>
        <Button className="bg-blue-500 text-white hover:bg-blue-600">
          <Plus /> Tạo môn học
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] overflow-y-auto border-border bg-card text-foreground">
        <DialogHeader>
          <DialogTitle>Tạo môn học mới</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Môn học sẽ được lưu trên trình duyệt của thiết bị này.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <label className="block text-sm text-foreground">
            Tên môn học
            <Input
              value={name}
              disabled={saving}
              onChange={(event) => setName(event.target.value)}
              className="mt-2 border-border bg-card text-foreground"
              placeholder="Ví dụ: Khai phá dữ liệu"
            />
          </label>
          <label className="block text-sm text-foreground">
            Mô tả
            <Input
              value={description}
              disabled={saving}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 border-border bg-card text-foreground"
              placeholder="Nội dung chính của môn học"
            />
          </label>
          <DocumentPicker files={files} onChange={setFiles} disabled={saving} />
          {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            disabled={saving}
            onClick={() => setOpen(false)}
            className="text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            Hủy
          </Button>
          <Button
            onClick={() => void handleCreate()}
            disabled={!name.trim() || saving}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            {saving ? "Đang lưu môn và tài liệu..." : "Tạo môn"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
