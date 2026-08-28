"use client";

import { motion } from "framer-motion";
import { Skill } from "@/lib/types";

const GRID_COLS = "grid-cols-[48px_1fr]";

export default function Scorecard({ skills }: { skills: Skill[] }) {
  return (
    <section id="scorecard" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHeading kicker="Innings in Progress" title="SkillCard" />

      <div className="max-w-2xl overflow-hidden rounded-lg border-2 border-black/50 bg-[#0a1128] shadow-xl">
        {/* Gold banner header, like a broadcast standings table */}
        <div className="bg-scoreboard-amber px-5 py-3 text-center">
          <h3 className="font-sans text-base font-extrabold uppercase tracking-[0.2em] text-black sm:text-lg">
            Skill Table
          </h3>
        </div>

        {/* Column headers */}
        <div
          className={`grid ${GRID_COLS} items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2 font-mono text-[9px] uppercase tracking-wider text-white/50 sm:text-[10px]`}
        >
          <span>S No.</span>
          <span>Skill Name</span>
        </div>

        {skills.map((skill, i) => (
          <motion.div
            key={skill.name}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: i * 0.035 }}
            className={`grid ${GRID_COLS} items-center gap-2 border-b border-white/5 px-4 py-3 last:border-0 ${
              i % 2 === 1 ? "bg-white/[0.02]" : ""
            }`}
          >
            <span className="scoreboard-digits text-sm text-white/60">{i + 1}</span>

            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-scoreboard-amber shadow-[0_0_6px_var(--scoreboard-amber)]" />
              <span className="truncate text-sm font-medium text-white">{skill.name}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function SectionHeading({ kicker, title }: { kicker: string; title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-10"
    >
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-scoreboard-amber">{kicker}</p>
      <h2 className="font-display text-4xl tracking-wide text-foreground sm:text-5xl">{title}</h2>
      <div className="mt-3 h-px w-24 bg-gradient-to-r from-leather-red to-transparent" />
    </motion.div>
  );
}
