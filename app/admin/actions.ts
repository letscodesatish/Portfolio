"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import {
  assertLocalAdmin,
  lockAdmin as lockAdminSession,
  unlockAdmin as unlockAdminSession,
} from "@/lib/admin-auth";
import { getSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

export type ActionResult = { ok: true } | { ok: false; error: string };

function errorResult(err: unknown): ActionResult {
  return { ok: false, error: err instanceof Error ? err.message : "Something went wrong." };
}

function revalidateSite(slug?: string) {
  revalidatePath("/");
  revalidatePath("/projects/[slug]", "page");
  if (slug) revalidatePath(`/projects/${slug}`);
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export async function loginAdmin(_prevState: ActionResult | null, formData: FormData): Promise<ActionResult> {
  if (process.env.NODE_ENV === "production") {
    return { ok: false, error: "Admin access is disabled in production." };
  }
  const secret = String(formData.get("secret") ?? "");
  const success = await unlockAdminSession(secret);
  if (!success) return { ok: false, error: "Incorrect admin secret." };
  return { ok: true };
}

export async function logoutAdmin(): Promise<void> {
  await lockAdminSession();
}

// ---------------------------------------------------------------------------
// Uploads
// ---------------------------------------------------------------------------

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export async function uploadAsset(
  folder: "projects" | "certificates" | "jerseys",
  formData: FormData
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    await assertLocalAdmin();
  } catch (err) {
    return errorResult(err) as { ok: false; error: string };
  }

  if (!isSupabaseAdminConfigured()) {
    return {
      ok: false,
      error: "Supabase isn't configured yet — add SUPABASE_SERVICE_ROLE_KEY to .env.local.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "No file provided." };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Only image files are supported." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: "Image must be under 5MB." };
  }

  const extension = file.name.includes(".") ? file.name.split(".").pop() : "png";
  const path = `${folder}/${randomUUID()}.${extension}`;

  try {
    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.storage
      .from("portfolio-assets")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (error) return { ok: false, error: error.message };

    const { data } = supabase.storage.from("portfolio-assets").getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (err) {
    return errorResult(err) as { ok: false; error: string };
  }
}

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];

function parseJsonField<T>(raw: FormDataEntryValue | null, fieldLabel: string, fallback: T): { ok: true; value: T } | { ok: false; error: string } {
  const text = String(raw ?? "").trim();
  if (!text) return { ok: true, value: fallback };
  try {
    return { ok: true, value: JSON.parse(text) as T };
  } catch {
    return { ok: false, error: `${fieldLabel} must be valid JSON.` };
  }
}

function parseProjectForm(formData: FormData): { ok: true; data: ProjectInsert } | { ok: false; error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const rawSlug = String(formData.get("slug") ?? "").trim() || title;
  const slug = rawSlug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!title) return { ok: false, error: "Title is required." };
  if (!slug) return { ok: false, error: "Couldn't derive a slug — set one explicitly." };

  const features = parseJsonField(formData.get("features"), "Features", []);
  if (!features.ok) return features;
  const stats = parseJsonField(formData.get("stats"), "Stats", []);
  if (!stats.ok) return stats;
  const architecture = parseJsonField(formData.get("architecture"), "Architecture", []);
  if (!architecture.ok) return architecture;

  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const screenshots = Number(formData.get("screenshots"));
  const result = String(formData.get("result") ?? "In Progress");

  return {
    ok: true,
    data: {
      slug,
      title,
      role: String(formData.get("role") ?? "").trim() || null,
      tagline: String(formData.get("tagline") ?? "").trim() || null,
      summary: String(formData.get("summary") ?? "").trim() || null,
      description: String(formData.get("description") ?? "").trim() || null,
      jersey_number: String(formData.get("jersey_number") ?? "00").trim() || "00",
      jersey_color: String(formData.get("jersey_color") ?? "#0b3d91"),
      jersey_secondary_color: String(formData.get("jersey_secondary_color") ?? "#f5c518"),
      jersey_accent_color: String(formData.get("jersey_accent_color") ?? "#ffffff"),
      tags,
      features: features.value,
      stats: stats.value,
      architecture: architecture.value,
      screenshots: Number.isFinite(screenshots) && screenshots > 0 ? screenshots : 3,
      github_url: String(formData.get("github_url") ?? "").trim() || null,
      live_url: String(formData.get("live_url") ?? "").trim() || null,
      image_url: String(formData.get("image_url") ?? "").trim() || null,
      result: (["Won", "Draw", "In Progress"].includes(result) ? result : "In Progress") as ProjectInsert["result"],
      featured: formData.get("featured") === "on",
    },
  };
}

export async function createProject(formData: FormData): Promise<ActionResult> {
  try {
    await assertLocalAdmin();
    if (!isSupabaseAdminConfigured()) throw new Error("Supabase isn't configured yet.");

    const parsed = parseProjectForm(formData);
    if (!parsed.ok) return parsed;

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("projects").insert(parsed.data);
    if (error) return { ok: false, error: error.message };

    revalidateSite(parsed.data.slug);
    return { ok: true };
  } catch (err) {
    return errorResult(err);
  }
}

export async function updateProject(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await assertLocalAdmin();
    if (!isSupabaseAdminConfigured()) throw new Error("Supabase isn't configured yet.");

    const parsed = parseProjectForm(formData);
    if (!parsed.ok) return parsed;

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("projects").update(parsed.data).eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidateSite(parsed.data.slug);
    return { ok: true };
  } catch (err) {
    return errorResult(err);
  }
}

export async function deleteProject(id: string, slug: string): Promise<ActionResult> {
  try {
    await assertLocalAdmin();
    if (!isSupabaseAdminConfigured()) throw new Error("Supabase isn't configured yet.");

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidateSite(slug);
    return { ok: true };
  } catch (err) {
    return errorResult(err);
  }
}

// ---------------------------------------------------------------------------
// Skills
// ---------------------------------------------------------------------------

type SkillInsert = Database["public"]["Tables"]["skills"]["Insert"];

function parseSkillForm(formData: FormData): { ok: true; data: SkillInsert } | { ok: false; error: string } {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, error: "Skill name is required." };

  return { ok: true, data: { name } };
}

export async function createSkill(formData: FormData): Promise<ActionResult> {
  try {
    await assertLocalAdmin();
    if (!isSupabaseAdminConfigured()) throw new Error("Supabase isn't configured yet.");

    const parsed = parseSkillForm(formData);
    if (!parsed.ok) return parsed;

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("skills").insert(parsed.data);
    if (error) return { ok: false, error: error.message };

    revalidateSite();
    return { ok: true };
  } catch (err) {
    return errorResult(err);
  }
}

export async function updateSkill(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await assertLocalAdmin();
    if (!isSupabaseAdminConfigured()) throw new Error("Supabase isn't configured yet.");

    const parsed = parseSkillForm(formData);
    if (!parsed.ok) return parsed;

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("skills").update(parsed.data).eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidateSite();
    return { ok: true };
  } catch (err) {
    return errorResult(err);
  }
}

export async function deleteSkill(id: string): Promise<ActionResult> {
  try {
    await assertLocalAdmin();
    if (!isSupabaseAdminConfigured()) throw new Error("Supabase isn't configured yet.");

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidateSite();
    return { ok: true };
  } catch (err) {
    return errorResult(err);
  }
}

// ---------------------------------------------------------------------------
// Certificates
// ---------------------------------------------------------------------------

type CertificateInsert = Database["public"]["Tables"]["certificates"]["Insert"];

function parseCertificateForm(
  formData: FormData
): { ok: true; data: CertificateInsert } | { ok: false; error: string } {
  const title = String(formData.get("title") ?? "").trim();
  const issuingOrg = String(formData.get("issuing_org") ?? "").trim();
  if (!title) return { ok: false, error: "Certificate title is required." };
  if (!issuingOrg) return { ok: false, error: "Issuing organization is required." };

  const orderIndex = Number(formData.get("order_index"));
  const issueDate = String(formData.get("issue_date") ?? "").trim();

  return {
    ok: true,
    data: {
      title,
      issuing_org: issuingOrg,
      issue_date: issueDate || null,
      // No longer surfaced anywhere on the public site or in the admin form
      // — kept as fixed defaults rather than exposing dead inputs.
      category: "General",
      verified: true,
      credential_id: String(formData.get("credential_id") ?? "").trim() || null,
      credential_url: String(formData.get("credential_url") ?? "").trim() || null,
      accent_color: String(formData.get("accent_color") ?? "#ffb703"),
      image_url: String(formData.get("image_url") ?? "").trim() || null,
      order_index: Number.isFinite(orderIndex) ? orderIndex : 0,
    },
  };
}

export async function createCertificate(formData: FormData): Promise<ActionResult> {
  try {
    await assertLocalAdmin();
    if (!isSupabaseAdminConfigured()) throw new Error("Supabase isn't configured yet.");

    const parsed = parseCertificateForm(formData);
    if (!parsed.ok) return parsed;

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("certificates").insert(parsed.data);
    if (error) return { ok: false, error: error.message };

    revalidateSite();
    return { ok: true };
  } catch (err) {
    return errorResult(err);
  }
}

export async function updateCertificate(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await assertLocalAdmin();
    if (!isSupabaseAdminConfigured()) throw new Error("Supabase isn't configured yet.");

    const parsed = parseCertificateForm(formData);
    if (!parsed.ok) return parsed;

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("certificates").update(parsed.data).eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidateSite();
    return { ok: true };
  } catch (err) {
    return errorResult(err);
  }
}

export async function deleteCertificate(id: string): Promise<ActionResult> {
  try {
    await assertLocalAdmin();
    if (!isSupabaseAdminConfigured()) throw new Error("Supabase isn't configured yet.");

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("certificates").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    revalidateSite();
    return { ok: true };
  } catch (err) {
    return errorResult(err);
  }
}
