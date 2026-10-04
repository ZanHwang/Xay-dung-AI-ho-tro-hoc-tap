"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatFileSize } from "../services/document.service";

type Props = { files: File[]; onChange: (files: File[]) => void; disabled?: boolean };

export function DocumentPicker({ files, onChange, disabled }: Props) {
  return (
    <div className="space-y-3">
      <label className="block text-sm text-foreground">Thêm tài liệu (có thể chọn nhiều file)
        <Input type="file" multiple disabled={disabled} className="mt-2 border-border bg-card"
          onChange={(event) => {
            const selected = Array.from(event.target.files ?? []);
            const next = [...files];
            for (const file of selected) {
              if (!next.some((existing) => existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified)) next.push(file);
            }
            onChange(next);
            event.target.value = "";
          }} />
      </label>
      {files.length > 0 && (
        <ul className="max-h-40 space-y-2 overflow-y-auto" aria-label="Tài liệu đang chọn">
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
              <span className="min-w-0 flex-1 truncate text-foreground" title={file.name}>{file.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
              <Button type="button" variant="ghost" size="sm" disabled={disabled} aria-label={`Bỏ chọn ${file.name}`}
                onClick={() => onChange(files.filter((_, position) => position !== index))}>Bỏ</Button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs leading-5 text-muted-foreground">File được lưu trên trình duyệt này, chưa đồng bộ lên máy chủ hoặc xử lý để AI hỏi đáp.</p>
    </div>
  );
}
