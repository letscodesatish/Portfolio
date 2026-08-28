import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin | Cricket Portfolio CMS",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Defense in depth: proxy.ts already 404s /admin in production before the
  // request even reaches here. This second check exists so the admin route
  // is still safe if proxy.ts is ever removed, misconfigured, or skipped by
  // a deployment platform that doesn't run Proxy the way Vercel/Node does.
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#05070a] font-sans text-foreground">
      <div className="border-b border-scoreboard-amber/30 bg-black">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-scoreboard-amber" />
            <span className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-scoreboard-amber">
              Admin &middot; Local Only
            </span>
          </div>
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-wider text-white/50 transition hover:text-white"
          >
            &larr; Back to site
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
