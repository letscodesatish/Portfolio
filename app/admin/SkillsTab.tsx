"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { createSkill, deleteSkill, updateSkill } from "./actions";
import { Field } from "./ProjectsTab";
import type { Database } from "@/lib/supabase/database.types";

type SkillRow = Database["public"]["Tables"]["skills"]["Row"];

export default function SkillsTab({ skills }: { skills: SkillRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<SkillRow | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const closeForm = () => setEditing(null);
  const afterSave = () => {
    closeForm();
    router.refresh();
  };

  const handleDelete = async (skill: SkillRow) => {
    if (!confirm(`Delete "${skill.name}"?`)) return;
    setBusyId(skill.id);
    const result = await deleteSkill(skill.id);
    setBusyId(null);
    if (!result.ok) alert(result.error);
    else router.refresh();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl text-white">Skills / SkillCard</h2>
        <button
          type="button"
          onClick={() => setEditing(editing === "new" ? null : "new")}
          className="flex items-center gap-1.5 rounded border border-scoreboard-amber/50 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-scoreboard-amber transition hover:bg-scoreboard-amber hover:text-black"
        >
          <Plus size={14} /> New Skill
        </button>
      </div>

      {editing && (
        <SkillForm
          key={editing === "new" ? "new" : editing.id}
          skill={editing === "new" ? null : editing}
          onCancel={closeForm}
          onSaved={afterSave}
        />
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-white/10">
        {skills.length === 0 && (
          <p className="p-6 text-center font-mono text-xs text-white/40">No skills yet — add your first one above.</p>
        )}
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="flex items-center justify-between gap-3 border-b border-white/5 bg-white/[0.02] px-4 py-3 last:border-0"
          >
            <p className="truncate text-sm font-medium text-white">{skill.name}</p>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing(skill)}
                aria-label={`Edit ${skill.name}`}
                className="rounded p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(skill)}
                disabled={busyId === skill.id}
                aria-label={`Delete ${skill.name}`}
                className="rounded p-1.5 text-white/60 transition hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
              >
                {busyId === skill.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SkillForm({
  skill,
  onCancel,
  onSaved,
}: {
  skill: SkillRow | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setPending(true);
    setError(null);
    const result = skill ? await updateSkill(skill.id, formData) : await createSkill(formData);
    setPending(false);
    if (!result.ok) setError(result.error);
    else onSaved();
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      action={handleSubmit}
      className="mb-6 rounded-lg border border-white/10 bg-white/[0.02] p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-scoreboard-amber">
          {skill ? `Editing "${skill.name}"` : "New Skill"}
        </h3>
        <button type="button" onClick={onCancel} aria-label="Close form" className="text-white/50 hover:text-white">
          <X size={16} />
        </button>
      </div>

      <Field label="Skill Name" name="name" defaultValue={skill?.name} required />

      {error && (
        <p className="mt-4 rounded border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-300">
          {error}
        </p>
      )}

      <div className="mt-5 flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded bg-scoreboard-amber px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-black transition hover:brightness-110 disabled:opacity-60"
        >
          {pending && <Loader2 size={14} className="animate-spin" />}
          {skill ? "Save Changes" : "Submit"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-wider text-white/70 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </motion.form>
  );
}
