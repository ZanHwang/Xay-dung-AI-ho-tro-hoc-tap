import { addSubjectDocuments } from "@/features/subjects/services/document.service";
import { CHAT_IMAGES_GROUP, MAX_IMAGE_BYTES, validateChatImages } from "./chat-images";

export const DOCUMENT_ACCEPT = ".pdf,.txt,.md,.doc,.docx,.ppt,.pptx,.xls,.xlsx";
const extensions = new Set(DOCUMENT_ACCEPT.split(","));
export function validateChatAttachments(files: File[]) {
  if (files.length > 4) throw new Error("Mỗi tin nhắn tối đa 4 tệp (ảnh hoặc tài liệu).");
  validateChatImages(files.filter((file) => file.type.startsWith("image/")));
  for (const file of files) {
    if (!file.size || file.size > MAX_IMAGE_BYTES) throw new Error(`Tệp “${file.name}” phải có dung lượng từ 1 byte đến 10 MB.`);
    if (!file.type.startsWith("image/") && !extensions.has(file.name.slice(file.name.lastIndexOf(".")).toLowerCase())) {
      throw new Error("Chọn ảnh JPG/PNG/WebP hoặc tài liệu PDF, TXT, MD, Word, PowerPoint, Excel.");
    }
  }
}

export async function saveChatAttachments(files: File[]) {
  validateChatAttachments(files);
  if (!files.length) return [];
  for (const file of files.filter((item) => item.type.startsWith("image/"))) {
    try { const bitmap = await createImageBitmap(file); bitmap.close(); }
    catch { throw new Error(`Không đọc được ảnh “${file.name}”. Hãy chọn ảnh hợp lệ.`); }
  }
  // Save all files atomically; documents are downloads, never rendered as executable HTML.
  return (await addSubjectDocuments(CHAT_IMAGES_GROUP, files)).map(({ id, name, type, size }) => ({ id, name, type, size }));
}
