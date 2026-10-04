import assert from "node:assert/strict";
import { test } from "node:test";
import { prepareDocumentPreview } from "./document-preview";

test("PDF without a MIME type receives the correct preview type without changing bytes", async () => {
  const original = new Blob(["%PDF-1.7 test"]);
  const preview = await prepareDocumentPreview("Giáo trình.PDF", original);
  assert.equal(preview.kind, "pdf");
  if (preview.kind !== "pdf") return;
  assert.equal(preview.blob.type, "application/pdf");
  assert.equal(await preview.blob.text(), await original.text());
});

test("recognizes raster images by extension or MIME", async () => {
  assert.equal((await prepareDocumentPreview("slide.PNG", new Blob(["image"]))).kind, "image");
  assert.equal((await prepareDocumentPreview("scan", new Blob(["image"], { type: "image/jpeg" }))).kind, "image");
});

test("HTML and SVG remain plain text rather than active documents", async () => {
  const source = '<script>alert("test")</script>';
  for (const name of ["notes.html", "diagram.svg"]) {
    const preview = await prepareDocumentPreview(name, new Blob([source]));
    assert.deepEqual(preview, { kind: "text", text: source, truncated: false });
  }
});

test("preserves Vietnamese text and handles empty documents", async () => {
  assert.deepEqual(await prepareDocumentPreview("ghi-chú.md", new Blob(["# Ôn tập tiếng Việt"])),
    { kind: "text", text: "# Ôn tập tiếng Việt", truncated: false });
  assert.deepEqual(await prepareDocumentPreview("empty.txt", new Blob()), { kind: "text", text: "", truncated: false });
});

test("limits large text previews while preserving the original file for download", async () => {
  const original = new Blob(["a".repeat(2 * 1024 * 1024 + 100)]);
  const preview = await prepareDocumentPreview("large.txt", original);
  assert.equal(preview.kind, "text");
  if (preview.kind !== "text") return;
  assert.equal(preview.truncated, true);
  assert.equal(preview.text.length, 2 * 1024 * 1024);
  assert.equal(original.size, 2 * 1024 * 1024 + 100);
});

test("unsupported office and binary files return a download fallback", async () => {
  for (const name of ["lesson.docx", "slides.pptx", "scores.xlsx", "archive.zip"]) {
    assert.deepEqual(await prepareDocumentPreview(name, new Blob([new Uint8Array([0, 1, 2])])), { kind: "unsupported" });
  }
});
