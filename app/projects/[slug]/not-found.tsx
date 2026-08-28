import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ProjectNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stadium-night px-5 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-scoreboard-amber">
        Umpire&apos;s Call
      </p>
      <h1 className="font-display text-5xl tracking-wide text-foreground">No Match Found</h1>
      <p className="max-w-sm text-sm text-foreground/70">
        This jersey isn&apos;t hanging in any locker. It may have been retired or the number
        doesn&apos;t exist yet.
      </p>
      <Link
        href="/"
        className="mt-2 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-wider text-pitch-sand/80 transition hover:border-scoreboard-amber hover:text-scoreboard-amber"
      >
        <ArrowLeft size={14} /> Return to Dressing Room
      </Link>
    </div>
  );
}
