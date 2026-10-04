import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { initialSubjects } from "@/features/subjects/data/subject.mocks";
import { readStoredSubjects, SUBJECTS_STORAGE_KEY } from "./subject.service";

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

function mockStoredValue(value: string | null) {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      localStorage: {
        getItem(key: string) {
          assert.equal(key, SUBJECTS_STORAGE_KEY);
          return value;
        },
      },
    },
  });
}

afterEach(() => {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
});

test("keeps valid stored subjects and an intentionally empty list", () => {
  const subjects = [{ ...initialSubjects[0], id: "custom", name: "Môn tự tạo" }];
  mockStoredValue(JSON.stringify(subjects));
  assert.deepEqual(readStoredSubjects(), subjects);

  mockStoredValue("[]");
  assert.deepEqual(readStoredSubjects(), []);
});

test("falls back safely for missing, malformed, or non-array data", () => {
  for (const value of [null, "", "{broken", "null", "{}", "42", '"text"']) {
    mockStoredValue(value);
    assert.deepEqual(readStoredSubjects(), initialSubjects);
  }
});

test("rejects invalid records, numeric ranges, accents, and duplicate IDs", () => {
  const subject = initialSubjects[0];
  const invalidLists = [
    [null],
    [{}],
    [{ ...subject, name: " " }],
    [{ ...subject, id: "" }],
    [{ ...subject, description: 123 }],
    [{ ...subject, progress: "50" }],
    [{ ...subject, progress: -1 }],
    [{ ...subject, progress: 101 }],
    [{ ...subject, lessons: -1 }],
    [{ ...subject, lessons: 1.5 }],
    [{ ...subject, accent: "invalid" }],
    [subject, subject],
    [subject, {}],
  ];
  for (const subjects of invalidLists) {
    mockStoredValue(JSON.stringify(subjects));
    assert.deepEqual(readStoredSubjects(), initialSubjects);
  }
});

test("works during server rendering without window", () => {
  Reflect.deleteProperty(globalThis, "window");
  assert.deepEqual(readStoredSubjects(), initialSubjects);
});

test("falls back when storage access is blocked", () => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      get localStorage() {
        throw new Error("Storage blocked");
      },
    },
  });
  assert.deepEqual(readStoredSubjects(), initialSubjects);
});
