"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Subject } from "@/features/subjects/types";
import type { QuizController } from "../hooks/use-quizzes";
import { questionsForSubject } from "../data/question-bank";
import { gradeQuiz, selectQuestions } from "../services/quiz-engine";

type Props = { subjects: Subject[]; controller: QuizController; initialSubjectId?: string; initialQuizId?: string; conversationId?: string };
const selectClass = "mt-2 w-full rounded-lg border border-input bg-card p-2 text-sm text-foreground focus:border-blue-500 focus:outline-none";

export function QuizPage({ subjects, controller: quizzes, initialSubjectId, initialQuizId, conversationId }: Props) {
  const [subjectId, setSubjectId] = useState(initialSubjectId ?? subjects[0]?.id ?? "");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [adaptive, setAdaptive] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(initialQuizId ?? null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [taking, setTaking] = useState(false);
  const [wrongOnly, setWrongOnly] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [error, setError] = useState("");
  const subject = subjects.find((item) => item.id === subjectId);
  const pool = subject ? questionsForSubject(subject) : [];
  const topics = [...new Set(pool.map((question) => question.topic))];
  const available = pool.filter((question) => !topic || question.topic === topic).length;
  const selected = quizzes.quizzes.find((quiz) => quiz.id === selectedId);
  const draft = quizzes.drafts.find((item) => item.quizId === selectedId);
  const attempt = quizzes.attempts.find((item) => item.id === attemptId && item.quizId === selectedId);
  const result = selected && attempt ? gradeQuiz(selected, attempt.answers) : null;
  const subjectQuizzes = quizzes.quizzes.filter((quiz) => quiz.subjectId === subjectId);
  const subjectQuizIds = new Set(subjectQuizzes.map((quiz) => quiz.id));
  const history = [...quizzes.attempts].filter((item) => subjectQuizIds.has(item.quizId)).reverse();
  const unanswered = selected && draft ? selected.questions.filter((q) => draft.answers[q.id] === undefined).length : 0;

  function start(id: string) {
    quizzes.store.start(id); setSelectedId(id); setAttemptId(null); setTaking(true); setWrongOnly(false); setError("");
  }
  function create() {
    if (!subject) return;
    try {
      const questions = selectQuestions(pool, count, quizzes.mastery.filter((item) => item.subjectId === subject.id), adaptive, topic);
      if (!questions.length) throw new Error("Chưa có câu hỏi cho môn/chủ đề này.");
      const id = quizzes.store.create({ subjectId: subject.id, title: `${adaptive ? "Luyện thích nghi" : "Quiz"} · ${topic || subject.name}`,
        adaptive, source: "sample", conversationId: conversationId ?? null, questions });
      start(id);
    } catch (error) { setError(error instanceof Error ? error.message : "Không thể tạo Quiz."); }
  }
  function submit() {
    if (!draft) return;
    const id = quizzes.store.submit(draft.id);
    setAttemptId(id); setTaking(false); setConfirmSubmit(false); setWrongOnly(false);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">Kiểm tra & ôn tập</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">Quiz</h1>
      <p className="mt-1 text-sm text-muted-foreground">Làm bài, xem giải thích và theo dõi kết quả theo từng chủ đề.</p>

      <p className="mb-5 mt-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-4 text-sm text-amber-800 dark:text-amber-300">
        Bản hiện tại sử dụng câu hỏi mẫu cho Học máy, Lý thuyết thông tin và Xử lý ngôn ngữ tự nhiên. Chưa tạo câu hỏi bằng AI hoặc từ tài liệu đã tải lên.
      </p>
      {(quizzes.error || error) && <p role="alert" className="mb-4 text-sm text-red-500">{error || quizzes.error}</p>}

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-semibold text-foreground">Tạo Quiz</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="text-sm text-foreground">Môn học
            <select aria-label="Môn học cho Quiz" className={selectClass} value={subjectId} disabled={taking}
              onChange={(event) => { setSubjectId(event.target.value); setTopic(""); setSelectedId(null); setAttemptId(null); setError(""); }}>
              {!subjects.length && <option value="">Chưa có môn học</option>}
              {subjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="text-sm text-foreground">Chủ đề
            <select className={selectClass} value={topic} disabled={taking} onChange={(event) => setTopic(event.target.value)}>
              <option value="">Tất cả chủ đề có câu hỏi</option>
              {topics.map((name) => <option key={name}>{name}</option>)}
            </select>
          </label>
          <label className="text-sm text-foreground">Số câu mong muốn
            <select className={selectClass} value={count} disabled={taking} onChange={(event) => setCount(Number(event.target.value))}>
              {[1, 3, 5, 10].map((value) => <option key={value} value={value}>{value} câu</option>)}
            </select>
          </label>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={adaptive} disabled={taking} onChange={(event) => setAdaptive(event.target.checked)} className="rounded border-input text-blue-500 focus:ring-blue-500" />
          Luyện tập thích nghi: ưu tiên chủ đề yếu và mức độ câu hỏi phù hợp
        </label>
        <p className="mt-2 text-xs text-muted-foreground">Mức nắm vững = tỷ lệ đúng trên tối đa 20 câu đã nộp gần nhất của mỗi chủ đề.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button disabled={!quizzes.ready || !available || taking} onClick={create} className="bg-blue-500 text-white hover:bg-blue-600">
            Tạo và làm Quiz
          </Button>
          <span className="text-xs text-muted-foreground">{available ? `Bài mới gồm ${Math.min(count, available)} câu từ ${available} câu có sẵn.` : "Môn này chưa có ngân hàng câu hỏi mẫu."}</span>
        </div>
      </section>

      {selected && (
        <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-foreground">{selected.title}</h2>
            {!taking && <Button onClick={() => start(selected.id)} className="bg-blue-500 text-white hover:bg-blue-600">{draft ? "Tiếp tục bài đang làm" : attempt ? "Làm lại" : "Bắt đầu làm bài"}</Button>}
            {taking && <Button variant="ghost" onClick={() => setTaking(false)}>Lưu và tạm dừng</Button>}
          </div>
          {taking && draft && (
            <>
              <p className="mt-3 text-sm text-muted-foreground">Đã trả lời {selected.questions.length - unanswered}/{selected.questions.length} câu. Đáp án và giải thích hiển thị sau khi nộp.</p>
              <div className="mt-5 space-y-6">
                {selected.questions.map((question, index) => (
                  <fieldset key={question.id} className="rounded-xl border border-border p-4">
                    <legend className="px-2 text-sm font-semibold text-foreground">Câu {index + 1} · {question.topic}</legend>
                    <p className="mb-4 whitespace-pre-wrap text-foreground">{question.prompt}</p>
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex cursor-pointer items-start gap-3 rounded-lg bg-muted p-3 text-sm text-foreground hover:bg-secondary">
                          <input
                            className="mt-1 text-blue-500"
                            type="radio"
                            name={`${draft.id}-${question.id}`}
                            checked={draft.answers[question.id] === optionIndex}
                            onChange={() => quizzes.store.answer(draft.id, question.id, optionIndex)}
                          />
                          <span>{String.fromCharCode(65 + optionIndex)}. {option}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
              <Button className="mt-6 bg-blue-500 text-white hover:bg-blue-600" onClick={() => { if (unanswered) setConfirmSubmit(true); else submit(); }}>Nộp bài</Button>
            </>
          )}
          {!taking && result && (
            <>
              <p role="status" className="mt-4 text-2xl font-semibold text-blue-600 dark:text-blue-300">{result.correct}/{result.total} câu đúng · {result.percent}%</p>
              <p className="mt-2 text-sm text-muted-foreground">Câu bỏ trống được tính là sai. Làm lại tạo một lần nộp mới, không ghi đè kết quả này.</p>
              <label className="mt-4 flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={wrongOnly} onChange={(event) => setWrongOnly(event.target.checked)} className="rounded border-input text-blue-500 focus:ring-blue-500" />
                Chỉ xem câu sai ({result.total - result.correct})
              </label>
              {wrongOnly && result.correct === result.total && <p className="mt-4 text-emerald-600 dark:text-emerald-300">Bạn đã trả lời đúng tất cả câu hỏi.</p>}
              <div className="mt-4 space-y-4">
                {result.items.map((item, index) => (!wrongOnly || !item.correct) && (
                  <article key={item.question.id} className={`rounded-xl border p-4 ${item.correct ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40" : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/40"}`}>
                    <h3 className="font-medium text-foreground">Câu {index + 1}: {item.question.prompt}</h3>
                    <p className={`mt-2 text-sm ${item.correct ? "text-emerald-700 dark:text-emerald-300" : "text-red-700 dark:text-red-300"}`}>
                      {item.correct ? "Đúng" : "Sai"} · Bạn chọn: {item.selected === undefined ? "Chưa trả lời" : item.question.options[item.selected]}
                    </p>
                    <p className="mt-2 text-sm text-blue-600 dark:text-blue-300">Đáp án đúng: {item.question.options[item.question.correctIndex]}</p>
                    <p className="mt-2 text-sm leading-6 text-foreground">{item.question.explanation}</p>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-semibold text-foreground">Quiz đã lưu của môn ({subjectQuizzes.length})</h2>
          {!quizzes.ready && <p className="mt-3 text-sm text-muted-foreground">Đang tải...</p>}
          <ul className="mt-3 space-y-2">
            {subjectQuizzes.map((quiz) => (
              <li key={quiz.id}>
                <button disabled={taking} type="button" className="w-full rounded-lg bg-muted p-3 text-left text-sm text-blue-600 dark:text-blue-300 hover:bg-secondary disabled:opacity-50"
                  onClick={() => { setSelectedId(quiz.id); setAttemptId(null); setWrongOnly(false); }}>
                  {quiz.title} · {quiz.questions.length} câu{quizzes.drafts.some((draft) => draft.quizId === quiz.id) ? " · Đang làm" : ""}
                </button>
              </li>
            ))}
          </ul>
          <h3 className="mt-5 font-medium text-foreground">Mức nắm vững theo chủ đề</h3>
          <ul className="mt-3 space-y-2 text-sm text-foreground">
            {[...new Set([...topics, ...quizzes.mastery.filter((item) => item.subjectId === subjectId).map((item) => item.topic)])].map((name) => {
              const mastery = quizzes.mastery.find((item) => item.subjectId === subjectId && item.topic === name);
              return <li key={name}>{name}: {mastery ? `${mastery.percent}% (${mastery.correct}/${mastery.total} câu đúng)` : "Chưa có dữ liệu"}</li>;
            })}
          </ul>
        </section>
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-semibold text-foreground">Lịch sử làm bài ({history.length})</h2>
          {!history.length && <p className="mt-3 text-sm text-muted-foreground">Chưa có bài đã nộp.</p>}
          <ul className="mt-3 space-y-2">
            {history.map((item) => {
              const quiz = quizzes.quizzes.find((quiz) => quiz.id === item.quizId)!;
              const grade = gradeQuiz(quiz, item.answers);
              return (
                <li key={item.id}>
                  <button disabled={taking} type="button" className="w-full rounded-lg bg-muted p-3 text-left text-sm text-foreground hover:bg-secondary disabled:opacity-50" onClick={() => {
                    setSelectedId(quiz.id); setAttemptId(item.id); setTaking(false); setWrongOnly(false);
                  }}>
                    <span className="block">{quiz.title} · {grade.percent}%</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{new Date(item.submittedAt).toLocaleString("vi-VN")} · {grade.correct}/{grade.total} câu đúng</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <Dialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
        <DialogContent className="border-border bg-card text-foreground">
          <DialogHeader><DialogTitle>Nộp bài chưa hoàn thành?</DialogTitle>
            <DialogDescription className="text-muted-foreground">Còn {unanswered} câu chưa trả lời. Những câu này được tính là sai.</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setConfirmSubmit(false)}>Tiếp tục làm</Button>
            <Button onClick={submit} className="bg-blue-500 text-white hover:bg-blue-600">Vẫn nộp bài</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
