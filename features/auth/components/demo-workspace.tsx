"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LearningWorkspace } from "@/features/workspace/components/learning-workspace";
import { demoAuth, authErrorMessage, type DemoUser } from "../services/demo-auth";

export function DemoWorkspace() {
  const router = useRouter();
  const [user, setUser] = useState<DemoUser | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let disposed = false;
    demoAuth.current().then((profile) => {
      if (disposed) return;
      if (!profile) router.replace("/login");
      else setUser(profile);
    }).catch((error: unknown) => { if (!disposed) setError(authErrorMessage(error)); });
    return () => { disposed = true; };
  }, [router]);
  async function logout() {
    try { await demoAuth.logout(); setUser(null); router.replace("/"); }
    catch (error) { setError(authErrorMessage(error)); }
  }
  if (!user) {
    return (
      <main className="grid min-h-screen place-items-center bg-card p-6 text-center">
        <div>
          <p role={error ? "alert" : "status"} className="text-sm text-muted-foreground">
            {error || "Đang mở không gian học tập..."}
          </p>
          {error && <Link href="/login" className="mt-4 inline-block text-blue-500 hover:underline">Về đăng nhập</Link>}
        </div>
      </main>
    );
  }
  return (
    <>
      {error && <p role="alert" className="bg-red-100 dark:bg-red-950/40 p-3 text-center text-sm text-red-700 dark:text-red-300">{error}</p>}
      <LearningWorkspace user={user} onLogout={() => void logout()} />
    </>
  );
}
