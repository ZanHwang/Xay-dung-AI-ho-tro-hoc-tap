"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authErrorMessage, demoAuth } from "../services/demo-auth";
import { GuestLoginButton } from "./guest-login-button";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const registering = mode === "register";
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [major, setMajor] = useState("");
  const [goal, setGoal] = useState("");
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(false);

  const inFlight = useRef(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    setError("");
    if (registering && step === 1) {
      if (name.trim().length < 2) { setError("Họ tên cần ít nhất 2 ký tự."); return; }
      if (password.length < 8) { setError("Mật khẩu cần ít nhất 8 ký tự."); return; }
      if (password !== confirm) { setError("Mật khẩu nhập lại chưa khớp."); return; }
      setStep(2); return;
    }
    if (registering && step === 2) { setStep(3); return; }
    inFlight.current = true; setBusy(true);
    try {
      if (registering) {
        await demoAuth.register({ name: name.trim(), email, password, major: major.trim(), goal: goal.trim() });
        setPassword(""); setConfirm(""); setCompleted(true);
      } else {
        await demoAuth.login(email, password);
        setPassword(""); router.replace("/workspace");
      }
    } catch (error) { setError(authErrorMessage(error)); }
    finally { inFlight.current = false; setBusy(false); }
  }

  return (
    <main className="min-h-screen bg-card px-5 py-8 text-foreground sm:py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Trang giới thiệu
        </Link>
        <div className="mt-8 grid gap-10 lg:grid-cols-[.85fr_1fr] lg:gap-20">
          <aside className="py-3 lg:py-12">
            <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight text-blue-500">
              <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-sm">
                <BookOpen className="size-5" />
              </div>
              JARVIS
            </Link>
            <h1 className="mt-7 text-4xl font-semibold leading-tight text-foreground">
              {registering ? "Bắt đầu hành trình học của bạn." : "Chào mừng bạn trở lại."}
            </h1>
            <p className="mt-5 max-w-sm leading-7 text-muted-foreground">
              Môn học, tài liệu, cuộc hội thoại và kết quả luyện tập — cùng trong một không gian.
            </p>
            <ul className="mt-8 space-y-4 text-sm text-foreground">
              {["Sắp xếp tài liệu theo môn", "Lưu và tiếp tục cuộc hội thoại", "Luyện Quiz và xem lại kiến thức yếu"].map((text) => (
                <li key={text} className="flex items-center gap-3">
                  <Check className="size-4 text-blue-500" />{text}
                </li>
              ))}
            </ul>
          </aside>

          <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-9">
            <p className="mb-5 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs leading-6 text-amber-800 dark:text-amber-300">
              Đăng nhập thử nghiệm: tài khoản và mã băm mật khẩu lưu trên trình duyệt này, chưa kết nối máy chủ. Hãy dùng mật khẩu dành riêng cho bản thử nghiệm.
            </p>
            {completed ? (
              <div className="py-8 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300">
                  <Check />
                </span>
                <h2 className="mt-5 text-2xl font-semibold text-foreground">Hồ sơ demo đã sẵn sàng</h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Bạn đã đăng ký với email <strong className="break-all text-foreground">{email}</strong>. Hãy đăng nhập để bắt đầu.
                </p>
                <Link href="/login" className="mt-6 inline-flex rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-600">
                  Đến trang đăng nhập
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-semibold text-foreground">{registering ? "Đăng ký" : "Đăng nhập"}</h2>
                {registering && (
                  <ol aria-label="Các bước đăng ký" className="my-6 flex gap-2 text-xs">
                    {["Tài khoản", "Hồ sơ học tập", "Xác nhận"].map((label, index) => (
                      <li
                        key={label}
                        aria-current={step === index + 1 ? "step" : undefined}
                        className={`flex-1 border-t-2 pt-3 ${step >= index + 1 ? "border-blue-500 text-blue-600 dark:text-blue-300" : "border-border text-muted-foreground"}`}
                      >
                        {index + 1}. {label}
                      </li>
                    ))}
                  </ol>
                )}
                <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-5">
                  {(!registering || step === 1) && (
                    <>
                      {registering && (
                        <label className="block text-sm text-foreground">
                          Họ và tên
                          <Input autoComplete="name" required minLength={2} maxLength={80} value={name} onChange={(event) => setName(event.target.value)} disabled={busy} className="mt-2" placeholder="Tên của bạn" />
                        </label>
                      )}
                      <label className="block text-sm text-foreground">
                        Email
                        <Input type="email" autoComplete="email" required maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} disabled={busy} className="mt-2" placeholder="ban@example.com" />
                      </label>
                      <label className="block text-sm text-foreground">
                        Mật khẩu demo
                        <span className="relative mt-2 block">
                          <Input type={visible ? "text" : "password"} autoComplete={registering ? "new-password" : "current-password"} required minLength={registering ? 8 : undefined} maxLength={128} value={password} onChange={(event) => setPassword(event.target.value)} disabled={busy} className="pr-12" placeholder="Mật khẩu thử nghiệm" />
                          <button type="button" aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"} aria-pressed={visible} onClick={() => setVisible((current) => !current)} className="absolute right-3 top-2.5 text-muted-foreground">
                            {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                          </button>
                        </span>
                      </label>
                      {registering && (
                        <label className="block text-sm text-foreground">
                          Nhập lại mật khẩu demo
                          <Input type={visible ? "text" : "password"} autoComplete="off" required maxLength={128} value={confirm} onChange={(event) => setConfirm(event.target.value)} disabled={busy} className="mt-2" />
                        </label>
                      )}
                    </>
                  )}
                  {registering && step === 2 && (
                    <>
                      <p className="text-sm text-muted-foreground">Bạn có thể bỏ trống và tiếp tục.</p>
                      <label className="block text-sm text-foreground">
                        Chuyên ngành / Lĩnh vực học
                        <Input maxLength={120} value={major} onChange={(event) => setMajor(event.target.value)} className="mt-2" placeholder="Ví dụ: Khoa học dữ liệu" />
                      </label>
                      <label className="block text-sm text-foreground">
                        Mục tiêu học tập
                        <textarea maxLength={300} value={goal} onChange={(event) => setGoal(event.target.value)} className="mt-2 min-h-28 w-full rounded-lg border border-input bg-card p-3 text-sm focus:border-blue-500 focus:outline-none" placeholder="Bạn muốn cải thiện điều gì?" />
                      </label>
                    </>
                  )}
                  {registering && step === 3 && (
                    <dl className="space-y-4 rounded-xl bg-muted p-4 text-sm">
                      {[["Họ tên", name], ["Email", email], ["Chuyên ngành", major || "Chưa thiết lập"], ["Mục tiêu", goal || "Chưa thiết lập"]].map(([label, value]) => (
                        <div key={label}>
                          <dt className="text-xs text-muted-foreground">{label}</dt>
                          <dd className="mt-1 break-words text-foreground">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
                  <div className="flex gap-3">
                    {registering && step > 1 && (
                      <Button type="button" variant="outline" disabled={busy} onClick={() => { setStep(step - 1); setError(""); }}>
                        Quay lại
                      </Button>
                    )}
                    <Button type="submit" disabled={busy} className="h-11 flex-1 bg-blue-500 text-white hover:bg-blue-600">
                      {busy ? "Đang xử lý..." : registering ? (step < 3 ? "Tiếp tục" : "Hoàn tất đăng ký demo") : "Đăng nhập demo"}
                      <ArrowRight />
                    </Button>
                  </div>
                </form>
                <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="h-px flex-1 bg-secondary" />hoặc<span className="h-px flex-1 bg-secondary" />
                </div>
                <GuestLoginButton disabled={busy} onBusyChange={setBusy} />
                <p className="mt-3 text-center text-xs leading-5 text-muted-foreground">
                  Không cần tài khoản. Sử dụng đầy đủ tính năng demo; dữ liệu học tập dùng chung trên trình duyệt này.
                </p>
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  {registering ? "Đã có hồ sơ?" : "Chưa có hồ sơ demo?"}{" "}
                  <Link href={registering ? "/login" : "/register"} className="font-medium text-blue-500 hover:underline">
                    {registering ? "Đăng nhập" : "Đăng ký"}
                  </Link>
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
