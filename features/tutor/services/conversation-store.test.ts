import assert from "node:assert/strict";
import { test } from "node:test";
import { createConversationStore, CONVERSATIONS_STORAGE_KEY } from "./conversation-store";

function setup() {
  const data = new Map<string, string>();
  const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
  const store = createConversationStore(() => storage);
  store.hydrate();
  return { data, storage, store };
}
const message = { id: "m1", role: "user" as const, content: "Giải thích entropy", timestamp: "10:00" };

test("image metadata survives reload without storing image bytes in localStorage", () => {
  const { store, storage } = setup();
  const images = [{ id: "photo", name: "exercise.png", type: "image/png", size: 50 }];
  store.create("Photo", null, "general", { ...message, images });
  const restored = createConversationStore(() => storage);
  restored.hydrate();
  assert.deepEqual(restored.getSnapshot().conversations[0].messages[0].images, images);
});

test("attachment completion cannot steal selection from another conversation", () => {
  const { store } = setup();
  const selected = store.create("Selected", null);
  const completed = store.create("Photo uploaded", null, "general", message, false);
  assert.equal(store.getSnapshot().activeId, selected);
  assert.equal(store.getSnapshot().conversations.find((item) => item.id === completed)?.messages.length, 1);
});

test("document attachments survive history reload alongside images", () => {
  const { store, storage } = setup();
  const documents = [{ id: "pdf", name: "exercise.pdf", type: "", size: 20 }];
  const images = [{ id: "image", name: "photo.png", type: "image/png", size: 30 }];
  store.create("Documents", null, "general", { ...message, documents, images });
  const restored = createConversationStore(() => storage);
  restored.hydrate();
  assert.deepEqual(restored.getSnapshot().conversations[0].messages[0].documents, documents);
  assert.deepEqual(restored.getSnapshot().conversations[0].messages[0].images, images);
});

test("opening Tutor from a subject prepares an unsaved draft and normal new chat clears it", () => {
  const { store, data } = setup();
  store.startNew("subject-a");
  assert.equal(store.getSnapshot().draftSubjectId, "subject-a");
  assert.equal(store.getSnapshot().activeId, null);
  assert.equal(store.getSnapshot().conversations.length, 0);
  assert.equal(data.size, 0);
  store.startNew("subject-b");
  assert.equal(store.getSnapshot().draftSubjectId, "subject-b");
  store.startNew();
  assert.equal(store.getSnapshot().draftSubjectId, null);
  assert.equal(data.size, 0);
});

test("independent chats support general questions and multiple chats per subject", () => {
  const { store } = setup();
  const first = store.create("Chương 1", "subject-a")!;
  const second = store.create("Chương 2", "subject-a")!;
  const general = store.create("Kế hoạch học", null)!;
  store.append(first, message);
  store.select(second);
  assert.equal(store.getSnapshot().activeId, second);
  assert.equal(store.getSnapshot().conversations.find((item) => item.id === first)?.messages.length, 1);
  assert.equal(store.getSnapshot().conversations.find((item) => item.id === second)?.messages.length, 0);
  assert.equal(store.getSnapshot().conversations.find((item) => item.id === general)?.subjectId, null);
});

test("reload opens a blank composer but preserves history for explicit continuation", () => {
  const { store, storage } = setup();
  const id = store.create("Ban đầu", "subject-a")!;
  store.append(id, message);
  store.rename(id, "  Tên mới  ");
  const restored = createConversationStore(() => storage);
  restored.hydrate();
  assert.equal(restored.getSnapshot().activeId, null);
  restored.select(id);
  assert.equal(restored.getSnapshot().activeId, id);
  assert.equal(restored.getSnapshot().conversations[0].title, "Tên mới");
  assert.deepEqual(restored.getSnapshot().conversations[0].messages, [message]);
  restored.append(id, { ...message, id: "m2" });
  assert.equal(restored.getSnapshot().conversations[0].messages.length, 2);
});

test("new chat creates no storage entry and does not erase history", () => {
  const { store, data } = setup();
  store.startNew();
  store.startNew();
  assert.equal(data.size, 0);
  assert.equal(store.getSnapshot().conversations.length, 0);
  const id = store.create("First question", "subject-a", "automatic", message)!;
  const persisted = data.get(CONVERSATIONS_STORAGE_KEY);
  store.startNew();
  assert.equal(store.getSnapshot().activeId, null);
  assert.equal(data.get(CONVERSATIONS_STORAGE_KEY), persisted);
  store.append(id, { ...message, id: "late-response", role: "assistant" });
  assert.equal(store.getSnapshot().activeId, null);
  assert.equal(store.getSnapshot().conversations[0].messages.length, 2);
});

test("manual subject corrections persist without changing history or subsequent messages", () => {
  const { store, storage } = setup();
  const id = store.create("Question", "subject-a", "automatic", message)!;
  store.setSubject(id, "subject-b");
  store.append(id, { ...message, id: "m2" });
  const restored = createConversationStore(() => storage);
  restored.hydrate();
  const conversation = restored.getSnapshot().conversations[0];
  assert.equal(conversation.subjectId, "subject-b");
  assert.equal(conversation.classification, "manual");
  assert.equal(conversation.messages.length, 2);
  restored.setSubject(id, null);
  assert.equal(restored.getSnapshot().conversations[0].subjectId, null);
});

test("late replies stay in their original chat and cannot resurrect deleted chats", () => {
  const { store, storage, data } = setup();
  data.set("jarvis.subjects", "untouched");
  const first = store.create("A", "subject-a")!;
  const second = store.create("B", "subject-a")!;
  store.append(first, message);
  assert.equal(store.getSnapshot().activeId, second);
  assert.equal(store.getSnapshot().conversations[0].messages.length, 0);
  store.remove(first);
  store.append(first, { ...message, id: "late", role: "assistant" });
  assert.equal(store.getSnapshot().conversations.length, 1);
  assert.equal(data.get("jarvis.subjects"), "untouched");
  store.remove(second);
  assert.equal(store.getSnapshot().activeId, null);
  const restored = createConversationStore(() => storage);
  restored.hydrate();
  assert.deepEqual(restored.getSnapshot().conversations, []);
});

test("invalid persisted data is rejected without an automatic overwrite", () => {
  for (const value of ["broken", "null", "{}", '{"conversations":[{}],"activeId":null}']) {
    const { storage, data } = setup();
    data.set(CONVERSATIONS_STORAGE_KEY, value);
    const store = createConversationStore(() => storage);
    store.hydrate();
    assert.deepEqual(store.getSnapshot().conversations, []);
    assert.ok(store.getSnapshot().storageError);
    assert.equal(data.get(CONVERSATIONS_STORAGE_KEY), value);
  }
});

test("storage failure retains in-memory chats and exposes an error", () => {
  const store = createConversationStore(() => { throw new Error("Blocked"); });
  store.hydrate();
  assert.equal(store.getSnapshot().ready, true);
  const id = store.create("A", null)!;
  store.append(id, message);
  assert.equal(store.getSnapshot().conversations[0].messages.length, 1);
  assert.ok(store.getSnapshot().storageError);
});

test("empty names cannot create or rename a chat", () => {
  const { store } = setup();
  assert.equal(store.create(" ", null), null);
  const id = store.create("A", null)!;
  store.rename(id, " ");
  assert.equal(store.getSnapshot().conversations[0].title, "A");
});
