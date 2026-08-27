// Hand-written to match supabase/migrations/0001_init.sql. If you change the
// schema, update this file to match (or regenerate with the Supabase CLI:
// `supabase gen types typescript --project-id <id> > lib/supabase/database.types.ts`).
//
// Every table must declare Row/Insert/Update/Relationships (even when there
// are no foreign keys) — @supabase/postgrest-js's GenericTable constraint
// requires all four, and silently falls back to `never` types on insert/
// update calls if one is missing, rather than raising a clear error.

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          slug: string;
          title: string;
          role: string | null;
          tagline: string | null;
          summary: string | null;
          description: string | null;
          jersey_number: string;
          jersey_color: string;
          jersey_secondary_color: string;
          jersey_accent_color: string;
          tags: string[];
          features: { over: string; title: string; description: string }[];
          stats: { label: string; value: string }[];
          architecture: { layer: string; detail: string }[];
          screenshots: number;
          github_url: string | null;
          live_url: string | null;
          image_url: string | null;
          result: "Won" | "Draw" | "In Progress";
          featured: boolean;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["projects"]["Row"]> & {
          slug: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Row"]>;
        Relationships: [];
      };
      skills: {
        Row: {
          id: string;
          name: string;
        };
        Insert: Partial<Database["public"]["Tables"]["skills"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["skills"]["Row"]>;
        Relationships: [];
      };
      certificates: {
        Row: {
          id: string;
          title: string;
          issuing_org: string;
          issue_date: string | null;
          category: string;
          credential_id: string | null;
          credential_url: string | null;
          verified: boolean;
          accent_color: string;
          image_url: string | null;
          order_index: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["certificates"]["Row"]> & {
          title: string;
          issuing_org: string;
        };
        Update: Partial<Database["public"]["Tables"]["certificates"]["Row"]>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          name: string;
          purpose: string | null;
          phone: string | null;
          email: string;
          question: string;
          email_sent: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["messages"]["Row"]> & {
          name: string;
          email: string;
          question: string;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
