"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { createCertificate, deleteCertificate, updateCertificate } from "./actions";
import { ColorInput, Field } from "./ProjectsTab";
import ImageUploadField from "./ImageUploadField";
import type { Database } from "@/lib/supabase/database.types";

type CertificateRow = Database["public"]["Tables"]["certificates"]["Row"];

export default function CertificatesTab({ certificates }: { certificates: CertificateRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<CertificateRow | "new" | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const closeForm = () => setEditing(null);
  const afterSave = () => {
    closeForm();
    router.refresh();
  };

  const handleDelete = async (cert: CertificateRow) => {
    if (!confirm(`Delete "${cert.title}"?`)) return;
    setBusyId(cert.id);
    const result = await deleteCertificate(cert.id);
    setBusyId(null);
    if (!result.ok) alert(result.error);
    else router.refresh();
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-2xl text-white">Certificates / Trophy Cabinet</h2>
        <button
          type="button"
          onClick={() => setEditing(editing === "new" ? null : "new")}
          className="flex items-center gap-1.5 rounded border border-scoreboard-amber/50 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wider text-scoreboard-amber transition hover:bg-scoreboard-amber hover:text-black"
        >
          <Plus size={14} /> New Certificate
        </button>
      </div>

      {editing && (
        <CertificateForm
          key={editing === "new" ? "new" : editing.id}
          certificate={editing === "new" ? null : editing}
          onCancel={closeForm}
          onSaved={afterSave}
        />
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-white/10">
        {certificates.length === 0 && (
          <p className="p-6 text-center font-mono text-xs text-white/40">
            No certificates yet — add your first one above.
          </p>
        )}
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="flex items-center justify-between gap-3 border-b border-white/5 bg-white/[0.02] px-4 py-3 last:border-0"
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="h-8 w-8 shrink-0 rounded"
                style={{ backgroundColor: cert.accent_color }}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{cert.title}</p>
                <p className="truncate font-mono text-[10px] text-white/40">{cert.issuing_org}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing(cert)}
                aria-label={`Edit ${cert.title}`}
                className="rounded p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(cert)}
                disabled={busyId === cert.id}
                aria-label={`Delete ${cert.title}`}
                className="rounded p-1.5 text-white/60 transition hover:bg-red-500/20 hover:text-red-400 disabled:opacity-50"
              >
                {busyId === cert.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificateForm({
  certificate,
  onCancel,
  onSaved,
}: {
  certificate: CertificateRow | null;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [imageUrl, setImageUrl] = useState(certificate?.image_url ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setPending(true);
    setError(null);
    const result = certificate
      ? await updateCertificate(certificate.id, formData)
      : await createCertificate(formData);
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
          {certificate ? `Editing "${certificate.title}"` : "New Certificate"}
        </h3>
        <button type="button" onClick={onCancel} aria-label="Close form" className="text-white/50 hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Certificate Title" name="title" defaultValue={certificate?.title} required />
        <Field label="Issuing Organization" name="issuing_org" defaultValue={certificate?.issuing_org} required />
        <Field label="Issue Date" name="issue_date" type="date" defaultValue={certificate?.issue_date ?? ""} />
        <Field label="Credential ID" name="credential_id" defaultValue={certificate?.credential_id ?? ""} />
        <Field label="Credential / Verify URL" name="credential_url" defaultValue={certificate?.credential_url ?? ""} />
        <div>
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-white/50">
            Accent Color
          </span>
          <ColorInput name="accent_color" defaultValue={certificate?.accent_color ?? "#ffb703"} title="Accent" />
        </div>
        <Field
          label="Order Index"
          name="order_index"
          type="number"
          defaultValue={String(certificate?.order_index ?? 0)}
        />

        <div className="sm:col-span-2">
          <ImageUploadField
            label="Certificate Image"
            name="image_url"
            folder="certificates"
            value={imageUrl}
            onChange={setImageUrl}
          />
        </div>
      </div>

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
          {certificate ? "Save Changes" : "Create Certificate"}
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
