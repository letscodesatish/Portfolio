"use client";

import { useRef, useState } from "react";
import { ImageUp, Loader2, X } from "lucide-react";
import { uploadAsset } from "./actions";

export default function ImageUploadField({
  label,
  name,
  folder,
  value,
  onChange,
}: {
  label: string;
  name: string;
  folder: "projects" | "certificates" | "jerseys";
  value: string;
  onChange: (url: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const result = await uploadAsset(folder, formData);
      if (result.ok) {
        onChange(result.url);
      } else {
        setError(result.error);
      }
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-wider text-white/50">
        {label}
      </label>
      <input type="hidden" name={name} value={value} />

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded border-2 border-dashed px-4 py-6 text-center transition ${
          dragging
            ? "border-scoreboard-amber bg-scoreboard-amber/10"
            : "border-white/15 bg-white/[0.02] hover:border-white/30"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        {value ? (
          <div className="relative">
            <div
              className="h-20 w-20 rounded border border-white/10 bg-cover bg-center"
              style={{ backgroundImage: `url('${value}')` }}
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              aria-label="Remove image"
              className="absolute -right-2 -top-2 rounded-full bg-black p-1 text-white/70 hover:text-white"
            >
              <X size={13} />
            </button>
          </div>
        ) : uploading ? (
          <Loader2 size={22} className="animate-spin text-scoreboard-amber" />
        ) : (
          <ImageUp size={22} className="text-white/40" />
        )}

        <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">
          {uploading ? "Uploading…" : value ? "Click or drop to replace" : "Drag & drop, or click to browse"}
        </p>
      </div>

      {error && <p className="mt-1.5 font-mono text-[10px] text-red-400">{error}</p>}
    </div>
  );
}
