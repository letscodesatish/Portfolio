import "server-only";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { Skill } from "@/lib/types";
import { skills as staticSkills } from "@/data/skills";

type SkillRow = Database["public"]["Tables"]["skills"]["Row"];

function mapDbSkill(row: SkillRow): Skill {
  return { name: row.name };
}

/** Falls back to the static data/skills.ts list whenever Supabase isn't
 * configured, empty, or unreachable. */
export async function getSkills(): Promise<Skill[]> {
  if (!isSupabaseConfigured()) return staticSkills;

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return staticSkills;

    const { data, error } = await supabase.from("skills").select("*").order("name", { ascending: true });

    if (error || !data || data.length === 0) return staticSkills;
    return data.map(mapDbSkill);
  } catch {
    return staticSkills;
  }
}
