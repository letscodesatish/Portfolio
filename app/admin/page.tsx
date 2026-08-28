import { AlertTriangle } from "lucide-react";
import { isAdminUnlocked } from "@/lib/admin-auth";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import AdminLoginForm from "./AdminLoginForm";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  const unlocked = await isAdminUnlocked();
  if (!unlocked) return <AdminLoginForm />;

  if (!isSupabaseAdminConfigured()) {
    return <SetupNotice />;
  }

  const supabase = getSupabaseAdminClient();
  const [projectsRes, skillsRes, certificatesRes] = await Promise.all([
    supabase.from("projects").select("*").order("order_index", { ascending: true }),
    supabase.from("skills").select("*").order("category", { ascending: true }).order("order_index", { ascending: true }),
    supabase.from("certificates").select("*").order("order_index", { ascending: true }),
  ]);

  const queryError = projectsRes.error || skillsRes.error || certificatesRes.error;
  if (queryError) {
    return <SetupNotice detail={queryError.message} />;
  }

  return (
    <AdminDashboard
      projects={projectsRes.data ?? []}
      skills={skillsRes.data ?? []}
      certificates={certificatesRes.data ?? []}
      secretConfigured={Boolean(process.env.ADMIN_SECRET)}
    />
  );
}

function SetupNotice({ detail }: { detail?: string }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-16 text-center">
      <AlertTriangle size={28} className="mx-auto text-scoreboard-amber" />
      <h1 className="mt-4 font-display text-3xl text-white">Supabase Not Connected</h1>
      <p className="mt-3 text-sm text-white/60">
        The public site is still running fine — it&apos;s falling back to the static data in{" "}
        <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">/data/*.ts</code>. To manage content
        from here, connect a Supabase project:
      </p>

      <ol className="mt-5 space-y-2 text-left font-mono text-xs text-white/70">
        <li>1. Create a project at supabase.com and run supabase/migrations/0001_init.sql in its SQL editor.</li>
        <li>
          2. Copy <code className="text-scoreboard-amber">.env.example</code> to{" "}
          <code className="text-scoreboard-amber">.env.local</code> and fill in your project URL, anon key, and
          service role key.
        </li>
        <li>3. Restart the dev server.</li>
      </ol>

      {detail && (
        <p className="mt-5 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-left font-mono text-[11px] text-red-300">
          {detail}
        </p>
      )}
    </div>
  );
}
