import "server-only";
import { getSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { Certificate } from "@/lib/types";
import { certificates as staticCertificates } from "@/data/certificates";

type CertificateRow = Database["public"]["Tables"]["certificates"]["Row"];

function mapDbCertificate(row: CertificateRow): Certificate {
  const year = row.issue_date
    ? new Date(row.issue_date).getFullYear().toString()
    : new Date(row.created_at).getFullYear().toString();

  return {
    id: row.id,
    title: row.title,
    issuer: row.issuing_org,
    year,
    category: row.category,
    credentialId: row.credential_id ?? undefined,
    verifyUrl: row.credential_url ?? undefined,
    verified: row.verified,
    accent: row.accent_color,
    image: row.image_url ?? undefined,
  };
}

/** Falls back to the static data/certificates.ts list whenever Supabase
 * isn't configured, empty, or unreachable. */
export async function getCertificates(): Promise<Certificate[]> {
  if (!isSupabaseConfigured()) return staticCertificates;

  try {
    const supabase = getSupabaseServerClient();
    if (!supabase) return staticCertificates;

    const { data, error } = await supabase
      .from("certificates")
      .select("*")
      .order("order_index", { ascending: true })
      .order("issue_date", { ascending: false });

    if (error || !data || data.length === 0) return staticCertificates;
    return data.map(mapDbCertificate);
  } catch {
    return staticCertificates;
  }
}
