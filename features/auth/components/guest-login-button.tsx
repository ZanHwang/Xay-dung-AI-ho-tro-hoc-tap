"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authErrorMessage, demoAuth } from "../services/demo-auth";

export function GuestLoginButton({ disabled = false, onBusyChange }: { disabled?: boolean; onBusyChange?: (busy: boolean) => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  async function enter() {
    if (disabled || inFlight.current) return;
    inFlight.current = true; setBusy(true); onBusyChange?.(true); setError("");
    try {
      await demoAuth.loginAsGuest();
      router.replace("/workspace");
    } catch (error) {
      setError(authErrorMessage(error));
      inFlight.current = false; setBusy(false); onBusyChange?.(false);
    }
  }
  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        disabled={disabled || busy}
        onClick={() => void enter()}
        className="h-12 w-full rounded-xl border-input bg-card px-6 text-foreground hover:bg-muted hover:text-foreground"
      >
        <UserRound />{busy ? "Đang mở không gian học tập…" : "Tiếp tục với tư cách khách"}
      </Button>
      {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
