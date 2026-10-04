import assert from "node:assert/strict";
import { test } from "node:test";
import { validateChatImages, MAX_IMAGE_BYTES, saveChatImages } from "./chat-images";
import { generateTutorReply } from "./tutor.service";
import { validateChatAttachments, saveChatAttachments } from "./chat-attachments";

test("mixed attachments support documents with missing browser MIME and enforce total limits", async () => {
  const pdf = new File(["pdf"], "exercise.PDF");
  const image = new File(["image"], "photo.png", { type: "image/png" });
  assert.doesNotThrow(() => validateChatAttachments([pdf, image]));
  assert.throws(() => validateChatAttachments([pdf, pdf, image, image, pdf]), /4 tệp/);
  assert.throws(() => validateChatAttachments([new File(["html"], "page.html", { type: "text/html" })]), /Chọn ảnh/);
  assert.throws(() => validateChatAttachments([new File([], "empty.docx")]), /10 MB/);
  assert.deepEqual(await saveChatAttachments([]), []);
});

test("chat attachments enforce count, format and size limits", () => {
  const photo = new File(["photo"], "exercise.jpg", { type: "image/jpeg" });
  assert.doesNotThrow(() => validateChatImages([photo, photo, photo, photo]));
  assert.throws(() => validateChatImages(Array(5).fill(photo)), /4 ảnh/);
  assert.throws(() => validateChatImages([new File(["svg"], "x.svg", { type: "image/svg+xml" })]), /JPG/);
  assert.throws(() => validateChatImages([new File([], "empty.png", { type: "image/png" })]), /10 MB/);
  assert.throws(() => validateChatImages([new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "large.png", { type: "image/png" })]), /10 MB/);
});

test("text-only chat needs neither image decoding nor IndexedDB", async () => {
  assert.deepEqual(await saveChatImages([]), []);
});

test("mock tutor does not claim to read an attached exercise", async () => {
  const reply = await generateTutorReply({ conversationId: "chat", subjectId: null, messages: [{
    id: "message", role: "user", content: "Giải bài này", timestamp: "10:00",
    images: [{ id: "image", name: "exercise.jpg", type: "image/jpeg", size: 10 }],
  }] });
  assert.match(reply, /chưa có AI thị giác\/OCR/);
});
