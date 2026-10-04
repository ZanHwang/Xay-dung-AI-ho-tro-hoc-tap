import Link from "next/link";
import { GuestLoginButton } from "@/features/auth/components/guest-login-button";
import { ArrowRight, BookOpen, Bot, Check, ClipboardCheck, FileText } from "lucide-react";

const features = [
  { icon: Bot, title: "Một nơi để hỏi và hiểu", description: "Tách cuộc hội thoại theo môn, lưu lại câu hỏi và tiếp tục từ nơi bạn đã dừng." },
  { icon: FileText, title: "Tài liệu luôn có tổ chức", description: "Đưa giáo trình, slide và bài tập về đúng môn. Xem lại tài liệu ngay trong không gian học." },
  { icon: ClipboardCheck, title: "Học đến đâu, kiểm tra đến đó", description: "Làm Quiz, xem lời giải và nhận diện những chủ đề cần luyện thêm từ kết quả của bạn." },
];

export function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-card text-foreground">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight text-blue-500">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-sm">
            <BookOpen className="size-5" />
          </div>
          <span className="text-xl">JARVIS</span>
        </Link>
        <nav aria-label="Điều hướng trang giới thiệu" className="flex items-center gap-5 text-sm">
          <a href="#features" className="hidden text-muted-foreground hover:text-foreground sm:block">Tính năng</a>
          <Link href="/login" className="font-medium text-foreground hover:text-blue-500">Đăng nhập</Link>
          <Link href="/register" className="rounded-full bg-blue-500 px-5 py-2.5 font-semibold text-white hover:bg-blue-600">Bắt đầu</Link>
        </nav>
      </header>

      <main>
        <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-14 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:pb-28 lg:pt-24">
          <div>
            <p className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.22em] text-blue-500">
              <span className="size-2 rounded-full bg-blue-500" /> Không gian học tập cá nhân
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold leading-[1.12] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Học có hướng.<br /><span className="text-blue-500">Hiểu sâu hơn.</span>
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-muted-foreground">
              Từ câu hỏi đầu tiên đến lần ôn tập tiếp theo. JARVIS giúp bạn tổ chức môn học, quản lý tài liệu và nhìn lại kiến thức trong một nơi.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/register" className="inline-flex items-center gap-3 rounded-xl bg-blue-500 px-6 py-3.5 font-semibold text-white hover:bg-blue-600">
                Tạo không gian của bạn <ArrowRight className="size-4" />
              </Link>
              <GuestLoginButton />
              <a href="#how-it-works" className="rounded-xl border border-input px-6 py-3.5 text-sm font-medium text-foreground hover:bg-muted">
                Khám phá cách học
              </a>
            </div>
            <p className="mt-6 text-xs leading-6 text-muted-foreground">Bản thử nghiệm: Tutor trả lời mô phỏng; Quiz sử dụng ngân hàng câu hỏi mẫu.</p>
          </div>

          <div className="relative rounded-3xl border border-border bg-card p-5 shadow-lg shadow-gray-200/50 dark:shadow-black/20 sm:p-7" aria-label="Minh họa không gian học tập">
            <div className="flex items-center justify-between border-b border-border pb-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <BookOpen className="size-4 text-blue-500" /> Góc học tập của bạn
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground">Minh họa</span>
            </div>
            <div className="mt-6 flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-xl bg-blue-100 dark:bg-blue-950/40 font-semibold text-blue-600 dark:text-blue-300">ML</span>
              <div>
                <h2 className="font-semibold text-foreground">Học máy</h2>
                <p className="mt-1 text-xs text-muted-foreground">Giáo trình · Hội thoại · Quiz</p>
              </div>
            </div>
            <div className="mt-6 space-y-3 rounded-2xl bg-muted p-4">
              <p className="ml-7 rounded-xl bg-blue-100 dark:bg-blue-950/40 p-3 text-sm text-blue-800 dark:text-blue-300">Làm sao để hiểu overfitting?</p>
              <div className="flex gap-3">
                <Bot className="mt-3 size-5 shrink-0 text-blue-500" />
                <p className="rounded-xl bg-card border border-border p-3 text-sm leading-6 text-foreground">
                  Hãy hình dung một mô hình nhớ rất kỹ bài đã học, nhưng gặp khó khi làm bài mới.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border p-4">
                <FileText className="size-5 text-blue-500" />
                <p className="mt-3 text-sm text-foreground">Tài liệu theo môn</p>
                <p className="mt-1 text-xs text-muted-foreground">Thêm và xem bất cứ lúc nào</p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <ClipboardCheck className="size-5 text-amber-500" />
                <p className="mt-3 text-sm text-foreground">Luyện tập có phản hồi</p>
                <p className="mt-1 text-xs text-muted-foreground">Biết vì sao đúng, vì sao sai</p>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-y border-border bg-muted px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs uppercase tracking-[.2em] text-blue-500">Được thiết kế cho việc học</p>
            <h2 className="mt-4 text-3xl font-semibold text-foreground sm:text-4xl">Mọi thứ kết nối với môn học của bạn.</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <article key={title} className="rounded-2xl border border-border bg-card p-6">
                  <Icon className="size-7 text-blue-500" />
                  <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <h2 className="text-3xl font-semibold text-foreground">Bắt đầu từ một mục tiêu nhỏ.</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              ["Tạo hồ sơ", "Đăng ký và cho JARVIS biết bạn muốn học điều gì."],
              ["Sắp xếp môn học", "Tạo môn, thêm mô tả và những tài liệu bạn đang sử dụng."],
              ["Hỏi, luyện tập, nhìn lại", "Đặt câu hỏi, làm Quiz và tiếp tục luyện những chủ đề còn yếu."],
            ].map(([title, description], index) => (
              <li key={title}>
                <span className="font-mono text-sm text-blue-500">0{index + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
              </li>
            ))}
          </ol>
          <div className="mt-16 flex flex-wrap items-center justify-between gap-6 rounded-3xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 p-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Một nơi để bắt đầu buổi học tiếp theo.</h2>
              <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="size-4 text-blue-500" /> Tổ chức rõ ràng. Lưu lại quá trình. Học theo nhịp của bạn.
              </p>
            </div>
            <Link href="/register" className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white hover:bg-blue-600">Bắt đầu ngay</Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 border-t border-border px-5 py-7 text-xs text-muted-foreground">
        <span>JARVIS · Learning companion</span>
        <Link href="/login" className="hover:text-foreground">Vào không gian học tập →</Link>
      </footer>
    </div>
  );
}
