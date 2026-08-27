"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, X } from "lucide-react";
import { profile } from "@/data/profile";

export default function ProfileModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

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
        aria-labelledby="profile-modal-name"
        onClick={(e) => e.stopPropagation()}
        className="custom-scrollbar relative max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-lg border border-scoreboard-amber/50 bg-black p-6 text-center shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile"
          className="absolute right-3 top-3 rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        {/* Photo. CSS background degrades to a plain amber-ringed circle if
            profile.jpg isn't in place yet, instead of a broken-image icon. */}
        <div
          role="img"
          aria-label={profile.name}
          className="mx-auto h-28 w-28 rounded-full border-2 border-scoreboard-amber bg-cover bg-center shadow-[0_0_24px_rgba(255,183,3,0.35)]"
          style={{ backgroundImage: `url('${profile.photo}')`, backgroundColor: "#1a1a1a" }}
        />

        <h2 id="profile-modal-name" className="mt-4 font-display text-2xl text-white">
          {profile.name}
        </h2>
        <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-scoreboard-amber">
          {profile.tagline}
        </p>

        <div className="mt-5 flex flex-col gap-2 border-t border-white/10 pt-5">
          <a
            href={profile.phoneHref}
            className="flex items-center justify-center gap-2 font-mono text-xs text-white/70 transition hover:text-scoreboard-amber"
          >
            <Phone size={13} />
            {profile.phone}
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="flex items-center justify-center gap-2 font-mono text-xs text-white/70 transition hover:text-scoreboard-amber"
          >
            <Mail size={13} />
            {profile.email}
          </a>
        </div>

        <div className="mt-5 flex flex-col gap-2.5 border-t border-white/10 pt-5">
          {profile.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded border border-white/15 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white/80 transition hover:border-scoreboard-amber hover:text-scoreboard-amber"
            >
              {/* Real brand logo from public/images/taglogo/. CSS background
                  degrades to an empty 15px slot if the file isn't in place yet,
                  instead of a broken-image icon. */}
              <span
                className="h-[15px] w-[15px] shrink-0 bg-contain bg-center bg-no-repeat"
                style={{ backgroundImage: `url('/images/taglogo/${social.icon}.png')` }}
                aria-hidden="true"
              />
              {social.label}
            </a>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
