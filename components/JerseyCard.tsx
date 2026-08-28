"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Code2, ExternalLink } from "lucide-react";
import { Project } from "@/lib/types";
import { useSound } from "./providers/SoundProvider";

export default function JerseyCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const { play } = useSound();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 18 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 18 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const resetTilt = () => {
    mouseX.set(0);
    mouseY.set(0);
    setHovered(false);
  };

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: (index % 6) * 0.06 }}
    >
      <div className="relative rounded-2xl border border-white/10 bg-black/30 p-4 pt-10 shadow-[inset_0_0_40px_rgba(0,0,0,0.6)] backdrop-blur-sm">
        <div className="absolute left-1/2 top-3 h-2 w-2 -translate-x-1/2 rounded-full bg-zinc-500/70 shadow-[0_0_12px_2px_rgba(234,246,255,0.35)]" />
        <span className="absolute right-3 top-2 font-mono text-[10px] text-pitch-sand/50">
          BAY {String(index + 1).padStart(2, "0")}
        </span>

        <div
          ref={ref}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => {
            setHovered(true);
            play("hover");
          }}
          onMouseLeave={resetTilt}
          style={{ perspective: 900 }}
          className="relative"
        >
          <motion.div
            animate={{ rotate: [-1.4, 1.4, -1.4] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          >
            <Link
              href={`/projects/${project.slug}`}
              onClick={() => play("click")}
              className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-scoreboard-amber rounded-xl"
              aria-label={`View ${project.name} project details`}
            >
              <JerseyShape project={project} />
            </Link>
          </motion.div>
        </div>

        <div className="mt-4 flex items-center justify-between px-1">
          <div>
            <p className="font-display text-lg tracking-wide text-foreground">{project.name}</p>
            <p className="font-mono text-[11px] text-pitch-sand/70">{project.role}</p>
          </div>
          <div className="flex items-center gap-2">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  play("click");
                }}
                aria-label={`${project.name} GitHub repository`}
                className="rounded-full border border-white/15 p-1.5 text-pitch-sand/80 transition hover:border-scoreboard-amber hover:text-scoreboard-amber"
              >
                <Code2 size={14} />
              </a>
            )}
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  play("click");
                }}
                aria-label={`${project.name} live demo`}
                className="rounded-full border border-white/15 p-1.5 text-pitch-sand/80 transition hover:border-scoreboard-amber hover:text-scoreboard-amber"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>
      </div>

      <div
        className={`pointer-events-none absolute -top-2 left-1/2 z-20 w-56 -translate-x-1/2 -translate-y-full rounded-lg border border-white/10 bg-black/90 p-3 text-xs shadow-xl transition-all duration-200 ${
          hovered ? "opacity-100 translate-y-[-100%]" : "opacity-0 translate-y-[-90%]"
        }`}
      >
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-wider text-scoreboard-amber">
          Kit Tech
        </p>
        <div className="flex flex-wrap gap-1">
          {project.techStack.map((tech) => (
            <span
              key={tech}
              className="rounded border border-white/10 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-foreground/80"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function JerseyShape({ project }: { project: Project }) {
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-[260px] drop-shadow-[0_18px_20px_rgba(0,0,0,0.55)]">
      {/* Real jersey photo. CSS background degrades to just the text overlay
          below if the file isn't in place yet, rather than a broken-image icon. */}
      <div
        className="absolute inset-0 bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${project.jerseyImage}')` }}
      />
      <div className="absolute inset-x-0 top-[20%] flex justify-center px-4">
        <span
          className="select-none whitespace-nowrap rounded bg-black/45 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-white"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}
        >
          {project.name.length > 18 ? `${project.name.slice(0, 17)}…` : project.name}
        </span>
      </div>
      <div className="absolute inset-x-0 top-[36%] flex justify-center">
        <span
          className="select-none font-display text-6xl leading-none text-white"
          style={{ textShadow: "0 3px 10px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.6)" }}
        >
          {project.jerseyNumber}
        </span>
      </div>
      <div
        className="absolute inset-x-0 top-[52%] mx-auto h-0.5 w-10 rounded-full"
        style={{ backgroundColor: project.colors.accent }}
      />
    </div>
  );
}
