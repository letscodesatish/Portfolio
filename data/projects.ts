import { Project } from "@/lib/types";

// Empty on purpose. This is the fallback used only when Supabase isn't
// configured, is empty, or is unreachable — add real content through the
// /admin dashboard instead of editing this file.
export const projects: Project[] = [];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return projects.map((p) => p.slug);
}
