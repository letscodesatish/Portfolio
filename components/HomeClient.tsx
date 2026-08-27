"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import CricketCoverDriveIntro from "@/components/CricketCoverDriveIntro";
import DressingRoom from "@/components/DressingRoom";
import { Project, Skill, Certificate } from "@/lib/types";

export default function HomeClient({
  projects,
  skills,
  certificates,
}: {
  projects: Project[];
  skills: Skill[];
  certificates: Certificate[];
}) {
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      <AnimatePresence mode="wait">
        {!introDone && <CricketCoverDriveIntro key="intro" onComplete={() => setIntroDone(true)} />}
      </AnimatePresence>
      {introDone && <DressingRoom projects={projects} skills={skills} certificates={certificates} />}
    </>
  );
}
