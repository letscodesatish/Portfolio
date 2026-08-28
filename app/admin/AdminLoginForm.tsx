"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, Lock } from "lucide-react";
import { loginAdmin } from "./actions";

export default function AdminLoginForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(loginAdmin, null);

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5">
      <form
        action={formAction}
        className="w-full max-w-sm rounded-lg border border-scoreboard-amber/40 bg-white/[0.02] p-6 text-center"
      >
        <Lock size={22} className="mx-auto text-scoreboard-amber" />
        <h1 className="mt-3 font-display text-2xl text-white">Admin Secret Required</h1>
        <p className="mt-1 font-mono text-xs text-white/50">
          ADMIN_SECRET is set in .env.local — enter it to unlock the dashboard.
        </p>

        <input
          type="password"
          name="secret"
          autoFocus
          required
          placeholder="Admin secret"
          className="mt-5 w-full rounded border border-white/15 bg-black/40 px-3 py-2.5 text-center text-sm text-white outline-none placeholder:text-white/30 focus:border-scoreboard-amber"
        />

        {state && !state.ok && (
          <p className="mt-3 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-300">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-scoreboard-amber py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-black transition hover:brightness-110 disabled:opacity-60"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          Unlock
        </button>
      </form>
    </div>
  );
}
