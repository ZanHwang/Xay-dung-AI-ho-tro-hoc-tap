import { addSubjectDocuments, deleteSubjectDocument, readSubjectDocument } from "@/features/subjects/services/document.service";
import type { ChatImage } from "../types";

export const CHAT_IMAGES_GROUP = "jarvis-tutor-images";
export const MAX_CHAT_IMAGES = 4;
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const allowed = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateChatImages(files: File[]) {
  if (files.length > MAX_CHAT_IMAGES) throw new Error("Mỗi tin nhắn tối đa 4 ảnh.");
  for (const file of files) {
    if (!allowed.has(file.type)) throw new Error(`Ảnh “${file.name}” cần có định dạng JPG, PNG hoặc WebP.`);
    if (!file.size || file.size > MAX_IMAGE_BYTES) throw new Error(`Ảnh “${file.name}” phải có dung lượng từ 1 byte đến 10 MB.`);
  }
}

export async function saveChatImages(files: File[]): Promise<ChatImage[]> {
  validateChatImages(files);
  if (!files.length) return [];
  // Decode before persisting so invalid or disguised files cannot break the viewer.
  for (const file of files) {
    try {
      const bitmap = await createImageBitmap(file);
      bitmap.close();
    } catch { throw new Error(`Không đọc được ảnh “${file.name}”. Hãy chọn ảnh JPG, PNG hoặc WebP hợp lệ.`); }
  }
  const stored = await addSubjectDocuments(CHAT_IMAGES_GROUP, files);
  return stored.map(({ id, name, type, size }) => ({ id, name, type, size }));
}
export async function loadChatImage(id: string) {
  return (await readSubjectDocument(CHAT_IMAGES_GROUP, id))?.blob ?? null;
}
export async function removeChatImages(images: ChatImage[]) {
  await Promise.all(images.map((image) => deleteSubjectDocument(CHAT_IMAGES_GROUP, image.id)));
}
