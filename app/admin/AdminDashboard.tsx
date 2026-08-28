"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, LogOut, RefreshCw, Trophy, User } from "lucide-react";
import ProjectsTab from "./ProjectsTab";
import SkillsTab from "./SkillsTab";
import CertificatesTab from "./CertificatesTab";
import { logoutAdmin } from "./actions";
import type { Database } from "@/lib/supabase/database.types";

type Tab = "projects" | "skills" | "certificates";

const TABS: { id: Tab; label: string; icon: typeof Trophy }[] = [
  { id: "projects", label: "Projects", icon: Trophy },
  { id: "skills", label: "Skills / SkillCard", icon: User },
  { id: "certificates", label: "Certificates", icon: Award },
];

export default function AdminDashboard({
  projects,
  skills,
  certificates,
  secretConfigured,
}: {
  projects: Database["public"]["Tables"]["projects"]["Row"][];
  skills: Database["public"]["Tables"]["skills"]["Row"][];
  certificates: Database["public"]["Tables"]["certificates"]["Row"][];
  secretConfigured: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("projects");

  return (
    <div className="mx-auto max-w-6xl px-5 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex items-center gap-1.5 rounded px-3 py-2 font-mono text-xs font-bold uppercase tracking-wider transition ${
                tab === id ? "bg-scoreboard-amber text-black" : "text-white/60 hover:text-white"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.refresh()}
            className="flex items-center gap-1.5 rounded border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white/60 transition hover:text-white"
          >
            <RefreshCw size={12} /> Refresh
          </button>
          {secretConfigured && (
            <button
              type="button"
              onClick={async () => {
                await logoutAdmin();
                router.refresh();
              }}
              className="flex items-center gap-1.5 rounded border border-white/15 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-white/60 transition hover:text-white"
            >
              <LogOut size={12} /> Lock
            </button>
          )}
        </div>
      </div>

      {tab === "projects" && <ProjectsTab projects={projects} />}
      {tab === "skills" && <SkillsTab skills={skills} />}
      {tab === "certificates" && <CertificatesTab certificates={certificates} />}
    </div>
  );
}
