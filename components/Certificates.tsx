"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useInView } from "framer-motion";
import { ArrowRight, Award, ExternalLink, X } from "lucide-react";
import { Certificate } from "@/lib/types";

export default function Certificates({ certificates }: { certificates: Certificate[] }) {
  const [selected, setSelected] = useState<Certificate | null>(null);

  const total = certificates.length;
  const latestYear =
    certificates.length > 0
      ? Math.max(...certificates.map((c) => parseInt(c.year, 10)))
      : new Date().getFullYear();

  useEffect(() => {
    if (!selected) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  return (
    <section id="certificates" className="mx-auto max-w-6xl px-5 py-24">
      <div className="relative overflow-hidden rounded-lg border border-scoreboard-amber/50 bg-black shadow-xl">
        <div className="bg-led-scanlines">
          {/* Header row: title + subtitle on the left, scoreboard stats on the right */}
          <div className="flex flex-wrap items-start justify-between gap-6 border-b border-scoreboard-amber/30 px-5 py-6">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-pitch-green">
                Trophy Cabinet &middot; Career Achievements
              </p>
              <h2 className="mt-1 font-display text-4xl tracking-wide text-scoreboard-amber sm:text-5xl">
                Certificates &amp; Achievements
              </h2>
              <div className="mt-3 h-0.5 w-28 bg-scoreboard-amber" />
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <StatTile label="Total" value={total} />
              <StatTile label="Latest" value={latestYear} />
            </div>
          </div>

          {/* Certificate cards */}
          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((cert, i) => (
              <CertificateCard key={cert.id} cert={cert} index={i} onView={() => setSelected(cert)} />
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selected && <CertificateModal cert={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <div
      ref={ref}
      className="flex min-w-[68px] flex-col items-center rounded border border-scoreboard-amber/30 bg-scoreboard-amber/5 px-3 py-2"
    >
      <span className="scoreboard-digits text-xl font-bold text-scoreboard-amber sm:text-2xl">{display}</span>
      <span className="whitespace-nowrap font-mono text-[8px] uppercase tracking-wider text-white/60 sm:text-[9px]">
        {label}
      </span>
    </div>
  );
}

function CertificateCard({
  cert,
  index,
  onView,
}: {
  cert: Certificate;
  index: number;
  onView: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.06 }}
      className="group relative overflow-hidden rounded border border-white/10 bg-white/[0.02] p-4 transition-all duration-300 hover:border-scoreboard-amber hover:bg-white/[0.04] hover:shadow-[0_0_22px_rgba(255,183,3,0.18)]"
    >
      <span className="scoreboard-digits text-[10px] uppercase tracking-wider text-white/40">
        Certificate #{String(index + 1).padStart(2, "0")}
      </span>

      <h3 className="mt-2 font-display text-lg leading-tight text-white">{cert.title}</h3>

      <div className="mt-3 h-px w-full bg-white/10" />

      <dl className="mt-3 space-y-1.5 font-mono text-[10px] uppercase tracking-wider">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-white/40">Issuer</dt>
          <dd className="truncate text-right text-white/80">{cert.issuer}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-white/40">Year</dt>
          <dd className="scoreboard-digits text-white/80">{cert.year}</dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onView}
        className="group/btn mt-4 flex w-full items-center justify-center gap-2 rounded border border-scoreboard-amber/40 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-scoreboard-amber transition-colors hover:bg-scoreboard-amber hover:text-black"
      >
        View Certificate
        <ArrowRight size={13} className="transition-transform duration-200 group-hover/btn:translate-x-1" />
      </button>
    </motion.div>
  );
}

function CertificateModal({ cert, onClose }: { cert: Certificate; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cert-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="custom-scrollbar max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-scoreboard-amber/50 bg-black shadow-2xl"
      >
        <div className="sticky top-0 flex items-center justify-between border-b border-white/10 bg-black/95 px-5 py-3 backdrop-blur">
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
            Certificate Preview
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close certificate preview"
            className="rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {cert.image ? (
            <div
              role="img"
              aria-label={`${cert.title} certificate`}
              className="mb-5 aspect-[4/3] w-full rounded border border-white/10 bg-cover bg-center"
              style={{ backgroundImage: `url('${cert.image}')` }}
            />
          ) : (
            <GeneratedCertificatePreview cert={cert} />
          )}

          <h2 id="cert-modal-title" className="font-display text-2xl text-white">
            {cert.title}
          </h2>

          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-white/10 pt-4 font-mono text-xs">
            <div>
              <dt className="uppercase tracking-wider text-white/40">Issuer</dt>
              <dd className="mt-0.5 text-white">{cert.issuer}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-wider text-white/40">Issued</dt>
              <dd className="mt-0.5 scoreboard-digits text-white">{cert.year}</dd>
            </div>
            {cert.credentialId && (
              <div>
                <dt className="uppercase tracking-wider text-white/40">Credential ID</dt>
                <dd className="mt-0.5 text-white">{cert.credentialId}</dd>
              </div>
            )}
          </dl>

          {cert.verifyUrl && (
            <a
              href={cert.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 flex items-center justify-center gap-2 rounded border border-scoreboard-amber bg-scoreboard-amber/10 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-scoreboard-amber transition hover:bg-scoreboard-amber hover:text-black"
            >
              Verify Credential <ExternalLink size={14} />
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function GeneratedCertificatePreview({ cert }: { cert: Certificate }) {
  return (
    <div
      className="relative mb-5 flex aspect-[4/3] w-full flex-col items-center justify-center overflow-hidden rounded border-2 p-6 text-center"
      style={{
        borderColor: cert.accent,
        background: `radial-gradient(circle at 50% 0%, ${cert.accent}22, transparent 60%), #0a0a0a`,
      }}
    >
      <div
        className="absolute inset-2 rounded border border-dashed"
        style={{ borderColor: `${cert.accent}66` }}
      />
      <Award size={40} style={{ color: cert.accent }} />
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
        Certificate of Completion
      </p>
      <p className="mt-2 max-w-xs font-display text-xl text-white">{cert.title}</p>
      <p className="mt-2 font-mono text-xs uppercase tracking-wider" style={{ color: cert.accent }}>
        {cert.issuer}
      </p>
      <div className="mt-4 h-px w-24 bg-white/20" />
      <p className="mt-2 font-mono text-[10px] text-white/40">Awarded {cert.year}</p>
    </div>
  );
}
