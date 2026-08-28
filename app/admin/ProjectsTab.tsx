"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { createProject, deleteProject, updateProject } from "./actions";
import ImageUploadField from "./ImageUploadField";
import type { Database } from "@/lib/supabase/database.types";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export default function ProjectsTab({ projects }: { projects: ProjectRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<ProjectRow | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const closeForm = () => setEditing(null);
  const afterSave = () => {
    closeForm();
    router.refresh();
  };

  const handleDelete = async (project: ProjectRow) => {
    if (!confirm(`Delete "${project.title}"? This can't be undone.`)) return;
    setBusyId(project.id);
    const result = await deleteProject(project.id, project.slug);
    setBusyId(null);
    if (!result.ok) alert(result.error);
    else router.refresh();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl text-white">Projects</h2>
        <button
          type="button"
          onClick={() => setEditing(editing === "new" ? null : "new")}
          className="flex items-center gap-1.5 rounded border border-scoreboard-amber/50 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-scoreboard-amber transition hover:bg-scoreboard-amber hover:text-black"
        >
          <Plus size={14} /> New Project
        </button>
      </div>

      {editing && (
        <ProjectForm
          key={editing === "new" ? "new" : editing.id}
          project={editing === "new" ? null : editing}
          onCancel={closeForm}
          onSaved={afterSave}
        />
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-white/10">
        {projects.length === 0 && (
          <p className="p-6 text-center font-mono text-xs text-white/40">
            No projects yet — add your first one above.
          </p>
        )}
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex items-center justify-between gap-3 border-b border-white/5 bg-white/[0.02] px-4 py-3 last:border-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded font-mono text-[10px] font-bold text-white"
                style={{ backgroundColor: project.jersey_color }}
              >
                {project.jersey_number}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{project.title}</p>
                <p className="truncate font-mono text-[10px] text-white/40">/{project.slug}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing(project)}
                aria-label={`Edit ${project.title}`}
                className="rounded p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(project)}
                disabled={busyId === project.id}
                aria-label={`Delete ${project.title}`}
                className="rounded p-1.5 text-white/60 transition hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
              >
                {busyId === project.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectForm({
  project,
  onCancel,
  onSaved,
}: {
  project: ProjectRow | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [imageUrl, setImageUrl] = useState(project?.image_url ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setPending(true);
    setError(null);
    const result = project ? await updateProject(project.id, formData) : await createProject(formData);
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
          {project ? `Editing "${project.title}"` : "New Project"}
        </h3>
        <button type="button" onClick={onCancel} aria-label="Close form" className="text-white/50 hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Title" name="title" defaultValue={project?.title} required />
        <Field label="Slug (auto if blank)" name="slug" defaultValue={project?.slug} placeholder="e.g. runrate-commerce" />
        <Field label="Role / Subtitle" name="role" defaultValue={project?.role ?? ""} />
        <Field label="Tagline" name="tagline" defaultValue={project?.tagline ?? ""} />
        <Field
          label="Jersey Number"
          name="jersey_number"
          defaultValue={project?.jersey_number ?? "00"}
          className="sm:col-span-1"
        />
        <div>
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-white/50">
            Jersey Colors
          </span>
          <div className="flex gap-2">
            <ColorInput name="jersey_color" defaultValue={project?.jersey_color ?? "#0b3d91"} title="Primary" />
            <ColorInput
              name="jersey_secondary_color"
              defaultValue={project?.jersey_secondary_color ?? "#f5c518"}
              title="Secondary"
            />
            <ColorInput
              name="jersey_accent_color"
              defaultValue={project?.jersey_accent_color ?? "#ffffff"}
              title="Accent"
            />
          </div>
        </div>
        <Field
          label="Tech Tags (comma-separated)"
          name="tags"
          defaultValue={project?.tags?.join(", ") ?? ""}
          className="sm:col-span-2"
        />
        <Field label="GitHub URL" name="github_url" defaultValue={project?.github_url ?? ""} />
        <Field label="Live URL" name="live_url" defaultValue={project?.live_url ?? ""} />
        <div>
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-white/50">Result</span>
          <select
            name="result"
            defaultValue={project?.result ?? "In Progress"}
            className="w-full rounded border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-scoreboard-amber"
          >
            <option value="In Progress">In Progress</option>
            <option value="Won">Won</option>
            <option value="Draw">Draw</option>
          </select>
        </div>
        <label className="flex items-center gap-2 self-end pb-2 font-mono text-xs text-white/70">
          <input type="checkbox" name="featured" defaultChecked={project?.featured ?? false} className="accent-scoreboard-amber" />
          Featured
        </label>

        <div className="sm:col-span-2">
          <TextAreaField label="Summary (short)" name="summary" defaultValue={project?.summary ?? ""} rows={2} />
        </div>
        <div className="sm:col-span-2">
          <TextAreaField label="Description (full)" name="description" defaultValue={project?.description ?? ""} rows={4} />
        </div>

        <div className="sm:col-span-2">
          <ImageUploadField label="Cover / Jersey Image" name="image_url" folder="projects" value={imageUrl} onChange={setImageUrl} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => setAdvancedOpen((v) => !v)}
        className="mt-5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-white/50 hover:text-white"
      >
        <ChevronDown size={13} className={`transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
        Advanced: features / stats (JSON)
      </button>

      {advancedOpen && (
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextAreaField
            label='Features — [{"over","title","description"}]'
            name="features"
            defaultValue={project ? JSON.stringify(project.features, null, 2) : "[]"}
            rows={6}
            mono
          />
          <TextAreaField
            label='Stats — [{"label","value"}]'
            name="stats"
            defaultValue={project ? JSON.stringify(project.stats, null, 2) : "[]"}
            rows={6}
            mono
          />
        </div>
      )}

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
          {project ? "Save Changes" : "Create Project"}
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

export function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  type = "text",
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-white/50">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        className="w-full rounded border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/30 focus:border-scoreboard-amber"
      />
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  defaultValue,
  rows = 3,
  mono = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
  mono?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-white/50">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        className={`w-full resize-y rounded border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-scoreboard-amber ${
          mono ? "font-mono text-xs" : ""
        }`}
      />
    </div>
  );
}

export function ColorInput({
  name,
  defaultValue,
  title,
}: {
  name: string;
  defaultValue: string;
  title: string;
}) {
  return (
    <input
      type="color"
      name={name}
      defaultValue={defaultValue}
      title={title}
      className="h-9 w-12 cursor-pointer rounded border border-white/15 bg-black/40 p-1"
    />
  );
}
