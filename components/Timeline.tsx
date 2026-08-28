"use client";

import { motion } from "framer-motion";
import { MapPin, Sparkles } from "lucide-react";
import { education } from "@/data/education";
import { EducationChapter, EducationStage } from "@/lib/types";
import { SectionHeading } from "./Scorecard";

export default function Timeline() {
  return (
    <section id="career-innings" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHeading kicker="Ball by Ball" title="Career Innings" />

      <div className="max-w-3xl space-y-16">
        {education.map((stage, i) => (
          <StageBlock key={stage.id} stage={stage} index={i} />
        ))}
      </div>
    </section>
  );
}

function StageBlock({ stage, index }: { stage: EducationStage; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      {/* Stage header: institution crest + innings framing */}
      <div className="flex items-center gap-4">
        <div
          className="h-14 w-14 shrink-0 rounded-full border-2 border-scoreboard-amber bg-cover bg-center shadow-[0_0_16px_rgba(255,183,3,0.3)]"
          style={{ backgroundImage: `url('${stage.logo}')`, backgroundColor: "#1a1a1a" }}
          role="img"
          aria-label={`${stage.institution} crest`}
        />
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-scoreboard-amber">
            {stage.inningsLabel} &middot; {stage.inningsTitle}
          </p>
          <h3 className="truncate font-display text-2xl tracking-wide text-foreground sm:text-3xl">
            {stage.institution}
          </h3>
        </div>
      </div>

      {/* Chapters: a compact posting-history list for schooling, full
          highlight-reel cards for college years */}
      <div className="mt-6">
        {stage.chapters.every((c) => !c.points) ? (
          <PostingList chapters={stage.chapters} />
        ) : (
          <div className="space-y-4">
            {stage.chapters.map((chapter, i) => (
              <SeasonCard key={chapter.heading} chapter={chapter} index={i} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function PostingList({ chapters }: { chapters: EducationChapter[] }) {
  return (
    <div className="relative ml-2 space-y-5 border-l border-white/10 pl-6">
      {chapters.map((chapter, i) => (
        <motion.div
          key={chapter.heading}
          initial={{ opacity: 0, x: -12 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: i * 0.06 }}
          className="relative"
        >
          <span className="absolute -left-[29px] flex h-6 w-6 items-center justify-center rounded-full border border-scoreboard-amber/50 bg-stadium-night">
            <MapPin size={11} className="text-scoreboard-amber" />
          </span>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
            <span className="scoreboard-digits rounded bg-scoreboard-green/60 px-2 py-0.5 text-xs text-scoreboard-amber">
              {chapter.heading}
            </span>
            <p className="text-sm text-foreground/85">{chapter.subheading}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SeasonCard({ chapter, index }: { chapter: EducationChapter; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="scoreboard-digits rounded bg-scoreboard-green/60 px-2.5 py-1 text-xs text-scoreboard-amber">
          {chapter.heading}
        </span>
        <p className="font-display text-lg tracking-wide text-foreground">{chapter.subheading}</p>
      </div>

      {chapter.points && (
        <ul className="mt-3 space-y-1.5 text-sm text-foreground/75">
          {chapter.points.map((point) => (
            <li key={point} className="flex gap-2">
              <Sparkles size={13} className="mt-0.5 shrink-0 text-leather-red" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
