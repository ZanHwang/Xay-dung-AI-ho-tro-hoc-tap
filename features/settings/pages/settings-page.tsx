"use client";

import { Monitor, Moon, Sun, User } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Input } from "@/components/ui/input";
import type { DemoUser } from "@/features/auth/services/demo-auth";

const subscribe = () => () => {};
const themes = [
  { id: "light", label: "Sáng", icon: Sun },
  { id: "dark", label: "Tối", icon: Moon },
  { id: "system", label: "Theo thiết bị", icon: Monitor },
];

export function SettingsPage({ profile }: { profile: DemoUser }) {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">Cá nhân hóa</p>
      <h1 className="mt-2 text-2xl font-semibold text-foreground">Cài đặt</h1>
      <p className="mt-1 text-sm text-muted-foreground">Điều chỉnh giao diện và xem hồ sơ học tập.</p>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <h2 className="font-semibold text-foreground">Giao diện</h2>
        <p className="mt-2 text-sm text-muted-foreground">Áp dụng ngay và ghi nhớ trên trình duyệt này. Chế độ theo thiết bị tự đổi theo cài đặt hệ thống.</p>
        <fieldset disabled={!mounted} className="mt-5 grid gap-3 sm:grid-cols-3">
          <legend className="sr-only">Chọn chế độ giao diện</legend>
          {themes.map((option) => (
            <label key={option.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${mounted && theme === option.id ? "border-primary bg-accent text-accent-foreground" : "border-border text-foreground hover:bg-muted"}`}>
              <input type="radio" name="theme" value={option.id} checked={mounted && theme === option.id}
                onChange={() => setTheme(option.id)} className="accent-primary" />
              <option.icon className="size-5" /> {option.label}
            </label>
          ))}
        </fieldset>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8">
        <div className="flex items-center gap-4">
          <span className="grid size-12 place-items-center rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300">
            <User />
          </span>
          <div>
            <h3 className="font-semibold text-foreground">Hồ sơ học tập</h3>
            <p className="text-sm text-muted-foreground">
              {profile.isGuest ? "Bạn đang sử dụng với tư cách khách, chưa tạo hồ sơ tài khoản." : "Thông tin đã nhập khi đăng ký demo (chỉ xem)."}
            </p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-foreground">
            Họ và tên
            <Input value={profile.name} readOnly className="mt-2 border-border bg-muted text-foreground" />
          </label>
          <label className="text-sm text-foreground">
            Chuyên ngành
            <Input value={profile.major || "Chưa thiết lập"} readOnly className="mt-2 border-border bg-muted text-foreground" />
          </label>
        </div>
        {profile.goal && <p className="mt-4 text-sm leading-6 text-muted-foreground">Mục tiêu học tập: {profile.goal}</p>}
      </section>


    </div>
  );
}
