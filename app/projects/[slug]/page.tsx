import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Code2, ExternalLink } from "lucide-react";
import { getAllSlugs, getProjectBySlug } from "@/lib/data/projects";
import { JerseyShape } from "@/components/JerseyCard";

// Admin mutations call revalidatePath("/projects/[slug]") for an immediate
// on-demand refresh; this ceiling just catches anything that slips through.
export const revalidate = 60;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Match Not Found" };
  return {
    title: `${project.name} | Match Report`,
    description: project.summary,
  };
}

const RESULT_STYLES: Record<string, string> = {
  Won: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  Draw: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  "In Progress": "border-sky-400/40 bg-sky-400/10 text-sky-300",
};

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-stadium-night bg-floodlight-radial">
      <div className="mx-auto max-w-6xl px-5 py-10">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-mono text-xs uppercase tracking-wider text-pitch-sand/80 transition hover:border-scoreboard-amber hover:text-scoreboard-amber"
        >
          <ArrowLeft size={14} /> Return to Dressing Room
        </Link>

        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-scoreboard-amber">
            Official Match Summary
          </span>
          <span
            className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${RESULT_STYLES[project.result]}`}
          >
            Result: {project.result}
          </span>
        </div>

        <h1 className="font-display text-4xl tracking-wide text-foreground sm:text-6xl">
          {project.name}
        </h1>
        <p className="mt-2 max-w-2xl font-mono text-sm text-pitch-sand/80 sm:text-base">
          {project.tagline}
        </p>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[320px_1fr]">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-6 backdrop-blur-sm">
              <JerseyShape project={project} />
              <p className="mt-4 text-center font-mono text-xs uppercase tracking-wider text-pitch-sand/60">
                {project.role}
              </p>
            </div>
          </aside>

          <main className="space-y-14">
            <section>
              <h2 className="mb-3 font-display text-2xl tracking-wide text-foreground">
                Match Overview
              </h2>
              <p className="text-sm leading-relaxed text-foreground/80 sm:text-base">
                {project.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-foreground/80"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-scoreboard-green/40">
                <div className="border-b border-white/10 bg-scoreboard-green/70 px-4 py-2.5">
                  <h3 className="font-display text-lg tracking-wide text-scoreboard-amber">Innings Stats</h3>
                </div>
                <dl className="divide-y divide-white/5">
                  {project.stats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between px-4 py-3">
                      <dt className="font-mono text-xs uppercase tracking-wider text-pitch-sand/70">
                        {stat.label}
                      </dt>
                      <dd className="scoreboard-digits text-sm text-foreground">{stat.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                {project.live && (
                  <a
                    href={project.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-leather-red to-leather-red-dark px-4 py-3 font-display text-lg tracking-wide text-foreground transition hover:brightness-110"
                  >
                    <ExternalLink size={16} /> Live Deployment
                  </a>
                )}
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-3 font-mono text-sm uppercase tracking-wider text-foreground/90 transition hover:border-scoreboard-amber hover:text-scoreboard-amber"
                  >
                    <Code2 size={16} /> View Source
                  </a>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
