import "server-only";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { Project } from "@/lib/types";
import {
  projects as staticProjects,
  getProjectBySlug as getStaticProjectBySlug,
} from "@/data/projects";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

function mapDbProject(row: ProjectRow): Project {
  return {
    slug: row.slug,
    jerseyNumber: row.jersey_number,
    jerseyImage: row.image_url ?? "/images/jerseys/jersey-01.png",
    name: row.title,
    role: row.role ?? "",
    tagline: row.tagline ?? "",
    summary: row.summary ?? row.description ?? "",
    description: row.description ?? "",
    colors: {
      primary: row.jersey_color,
      secondary: row.jersey_secondary_color,
      accent: row.jersey_accent_color,
    },
    techStack: row.tags ?? [],
    features: row.features ?? [],
    stats: row.stats ?? [],
    architecture: row.architecture ?? [],
    screenshots: row.screenshots ?? 3,
    github: row.github_url ?? undefined,
    live: row.live_url ?? undefined,
    featured: row.featured,
    result: row.result,
  };
}

/** All projects, newest/most-relevant first. Falls back to the static
 * data/projects.ts list whenever Supabase isn't configured, empty, or
 * unreachable — the site never breaks because of a CMS outage. */
export async function getProjects(): Promise<Project[]> {
  if (!isSupabaseConfigured()) return staticProjects;

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return staticProjects;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) return staticProjects;
    return data.map(mapDbProject);
  } catch {
    return staticProjects;
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  if (!isSupabaseConfigured()) return getStaticProjectBySlug(slug);

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return getStaticProjectBySlug(slug);

    const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).maybeSingle();
    if (error || !data) return getStaticProjectBySlug(slug);
    return mapDbProject(data);
  } catch {
    return getStaticProjectBySlug(slug);
  }
}

export async function getAllSlugs(): Promise<string[]> {
  const all = await getProjects();
  return all.map((p) => p.slug);
}
