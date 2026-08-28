import HomeClient from "@/components/HomeClient";
import { getProjects } from "@/lib/data/projects";
import { getSkills } from "@/lib/data/skills";
import { getCertificates } from "@/lib/data/certificates";

// Re-fetched at most once a minute; admin mutations also call revalidatePath("/")
// for an immediate on-demand refresh, so edits show up right away rather
// than waiting out this ceiling.
export const revalidate = 60;

export default async function Home() {
  const [projects, skills, certificates] = await Promise.all([
    getProjects(),
    getSkills(),
    getCertificates(),
  ]);

  return <HomeClient projects={projects} skills={skills} certificates={certificates} />;
}
