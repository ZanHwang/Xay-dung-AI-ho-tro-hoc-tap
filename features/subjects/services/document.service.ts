export type SubjectDocument = {
  id: string;
  subjectId: string;
  name: string;
  size: number;
  type: string;
  addedAt: string;
};
type StoredDocument = SubjectDocument & { blob: Blob };
const DATABASE = "jarvis.subject-documents";
const STORE = "documents";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("Trình duyệt không hỗ trợ lưu tài liệu."));
      return;
    }
    const request = indexedDB.open(DATABASE, 1);
    let blocked = false;
    request.onblocked = () => {
      blocked = true;
      reject(new Error("Kho tài liệu đang bị chặn. Hãy đóng các tab khác của ứng dụng rồi thử lại."));
    };
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE, { keyPath: "id" });
      store.createIndex("subjectId", "subjectId");
    };
    request.onsuccess = () => {
      const db = request.result;
      if (blocked) { db.close(); return; }
      db.onversionchange = () => db.close();
      resolve(db);
    };
    request.onerror = () => reject(new Error("Không thể mở kho tài liệu. Hãy kiểm tra quyền lưu trữ của trình duyệt."));
  });
}

async function transaction<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore, result: (value: T) => void) => void): Promise<T> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    let result: T;
    let tx: IDBTransaction | undefined;
    try {
      tx = db.transaction(STORE, mode);
      tx.oncomplete = () => { db.close(); resolve(result); };
      tx.onabort = () => {
        db.close();
        reject(new Error("Không thể lưu hoặc đọc tài liệu. Trình duyệt có thể đã hết dung lượng hoặc chặn lưu trữ."));
      };
      run(tx.objectStore(STORE), (value) => { result = value; });
    } catch (error) {
      tx?.abort();
      db.close();
      reject(error);
    }
  });
}

export async function addSubjectDocuments(subjectId: string, files: File[]): Promise<SubjectDocument[]> {
  if (!files.length) return [];
  const documents: StoredDocument[] = files.map((file) => ({
    id: crypto.randomUUID(), subjectId, name: file.name, size: file.size,
    type: file.type, addedAt: new Date().toISOString(), blob: file,
  }));
  return transaction("readwrite", (store, result) => {
    for (const document of documents) store.add(document);
    result(documents.map(({ id, subjectId, name, size, type, addedAt }) => ({ id, subjectId, name, size, type, addedAt })));
  });
}

export function listSubjectDocuments(subjectId: string): Promise<SubjectDocument[]> {
  return transaction("readonly", (store, result) => {
    const request = store.index("subjectId").getAll(subjectId);
    request.onsuccess = () => {
      const documents = request.result as StoredDocument[];
      result(documents.map(({ id, subjectId, name, size, type, addedAt }) => ({ id, subjectId, name, size, type, addedAt }))
        .sort((a, b) => b.addedAt.localeCompare(a.addedAt)));
    };
  });
}

export function readSubjectDocument(subjectId: string, id: string): Promise<StoredDocument | null> {
  return transaction("readonly", (store, result) => {
    const request = store.get(id);
    request.onsuccess = () => {
      const document = request.result as StoredDocument | undefined;
      result(document?.subjectId === subjectId ? document : null);
    };
  });
}

export function deleteSubjectDocument(subjectId: string, id: string): Promise<void> {
  return transaction("readwrite", (store, result) => {
    const request = store.get(id);
    request.onsuccess = () => {
      if ((request.result as StoredDocument | undefined)?.subjectId === subjectId) store.delete(id);
      result(undefined);
    };
  });
}

export function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
