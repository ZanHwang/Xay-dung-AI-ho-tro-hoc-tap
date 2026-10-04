import assert from "node:assert/strict";
import { test } from "node:test";
import { initialSubjects } from "@/features/subjects/data/subject.mocks";
import { classifyQuestion, titleFromQuestion } from "./classify-question";

test("an explicit existing subject takes priority over automatic classification", () => {
  assert.deepEqual(classifyQuestion("Giải thích Linear Regression", initialSubjects, "information-theory"),
    { subjectId: "information-theory", classification: "manual" });
  assert.equal(classifyQuestion("Giải thích Linear Regression", initialSubjects, "deleted-subject").subjectId, "machine-learning");
});

test("recognizes clear topics with Vietnamese, English, or unaccented questions", () => {
  for (const question of ["Giải thích Linear Regression", "Hoi quy tuyen tinh la gi?", "HỌC MÁY là gì?"]) {
    assert.deepEqual(classifyQuestion(question, initialSubjects), { subjectId: "machine-learning", classification: "automatic" });
  }
  assert.equal(classifyQuestion("PhoBERT hoạt động thế nào?", initialSubjects).subjectId, "natural-language-processing");
  assert.equal(classifyQuestion("Thông tin tương hỗ là gì?", initialSubjects).subjectId, "information-theory");
});

test("leaves ambiguous, unmatched, and cross-subject questions unclassified", () => {
  for (const question of ["Giải thích entropy", "Giúp tôi bài này", "So sánh linear regression và mutual information"]) {
    assert.deepEqual(classifyQuestion(question, initialSubjects), { subjectId: null, classification: "uncertain" });
  }
});

test("recognizes general study requests and never invents a subject", () => {
  assert.deepEqual(classifyQuestion("Lập kế hoạch học tuần này", initialSubjects), { subjectId: null, classification: "general" });
  assert.equal(classifyQuestion("Giải thích Linear Regression", []).subjectId, null);
  assert.equal(classifyQuestion("Giải thích Linear Regression", [initialSubjects[0]]).subjectId, null);
});

test("supports custom subject names and ignores tied duplicate subject names", () => {
  const subject = { ...initialSubjects[0], id: "custom", name: "Đại số tuyến tính", currentTopic: "Chưa chọn chủ đề" };
  assert.equal(classifyQuestion("ĐẠI SỐ TUYẾN TÍNH có gì?", [subject]).subjectId, "custom");
  assert.equal(classifyQuestion("Đại số tuyến tính", [subject, { ...subject, id: "other" }]).subjectId, null);
});

test("titles are derived from the first question with normalized whitespace and bounded length", () => {
  assert.equal(titleFromQuestion("  Giải thích\n  entropy  "), "Giải thích entropy");
  assert.ok(titleFromQuestion("a".repeat(200)).length <= 80);
});
