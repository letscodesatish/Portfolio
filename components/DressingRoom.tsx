"use client";

import { motion } from "framer-motion";
import Navbar from "./Navbar";
import JerseyCard from "./JerseyCard";
import Scorecard from "./Scorecard";
import Timeline from "./Timeline";
import Certificates from "./Certificates";
import ContactForm from "./ContactForm";
import { profile } from "@/data/profile";
import { Project, Skill, Certificate as CertificateType } from "@/lib/types";

export default function DressingRoom({
  projects,
  skills,
  certificates,
}: {
  projects: Project[];
  skills: Skill[];
  certificates: CertificateType[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="relative min-h-screen bg-stadium-night"
    >
      {/* Stadium backdrop, fixed so it stays anchored behind the page as you
          scroll — the same photo the intro cuts to, for visual continuity. */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('/images/core/stadium.png')" }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/80 via-stadium-night/90 to-stadium-night" />
      <div className="fixed inset-0 z-0 bg-floodlight-radial animate-flicker" />

      <div className="relative z-10">
        <Navbar />

        <section id="locker-room" className="mx-auto max-w-6xl px-5 pb-20 pt-14 sm:pt-20">
          <div className="mb-14 text-center sm:text-left">
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-scoreboard-amber">
              Welcome Players
            </p>
            <h1 className="mt-2 font-display text-5xl leading-none tracking-wide text-foreground sm:text-7xl">
              {profile.name}
              <span className="text-leather-red">.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl font-mono text-sm text-pitch-sand/80 sm:mx-0 sm:text-base">
              {profile.bio[0]}
              <br />
              {profile.bio[1]}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <JerseyCard key={project.slug} project={project} index={i} />
            ))}
          </div>
        </section>

        <Scorecard skills={skills} />
        <Timeline />
        <Certificates certificates={certificates} />
        <ContactForm />

        <Footer />
      </div>
    </motion.div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/10 px-5 py-8 text-center font-mono text-xs text-pitch-sand/50">
      <p>Built with Next.js, Tailwind CSS &amp; Framer Motion &middot; Stumps drawn at {new Date().getFullYear()}.</p>
    </footer>
  );
}
