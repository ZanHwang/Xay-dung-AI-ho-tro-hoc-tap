export type DocumentPreview =
  | { kind: "pdf" | "image"; blob: Blob }
  | { kind: "text"; text: string; truncated: boolean }
  | { kind: "unsupported" };

const TEXT_LIMIT = 2 * 1024 * 1024;
const imageTypes: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif",
  webp: "image/webp", bmp: "image/bmp", avif: "image/avif",
};
const textExtensions = new Set(["txt", "md", "csv", "json", "ipynb", "log", "py", "js", "ts", "tsx", "jsx", "java", "c", "cpp", "h", "css", "html", "xml", "svg", "yaml", "yml", "sql"]);

export async function prepareDocumentPreview(name: string, blob: Blob): Promise<DocumentPreview> {
  const extension = name.split(".").at(-1)?.toLowerCase() ?? "";
  const mime = blob.type.toLowerCase().split(";")[0];
  if (extension === "pdf" || mime === "application/pdf") {
    return { kind: "pdf", blob: blob.slice(0, blob.size, "application/pdf") };
  }
  const imageType = imageTypes[extension] ?? Object.values(imageTypes).find((type) => type === mime);
  if (imageType) return { kind: "image", blob: blob.slice(0, blob.size, imageType) };
  if (textExtensions.has(extension) || mime.startsWith("text/") || mime === "application/json") {
    return { kind: "text", text: await blob.slice(0, TEXT_LIMIT).text(), truncated: blob.size > TEXT_LIMIT };
  }
  return { kind: "unsupported" };
}

export function downloadDocument(name: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
