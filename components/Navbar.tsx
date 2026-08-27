"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Menu, Volume2, VolumeX, X } from "lucide-react";
import { profile } from "@/data/profile";
import ProfileModal from "./ProfileModal";
import { useSound } from "./providers/SoundProvider";

const NAV_LINKS = [
  { href: "#locker-room", id: "locker-room", label: "Home" },
  { href: "#scorecard", id: "scorecard", label: "SkillCard" },
  { href: "#career-innings", id: "career-innings", label: "Career" },
  { href: "#certificates", id: "certificates", label: "Certificates" },
  { href: "#press-box", id: "press-box", label: "Contact Box" },
];

export default function Navbar() {
  const { muted, toggleMute, play } = useSound();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeId, setActiveId] = useState(NAV_LINKS[0].id);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: highlights whichever section the user has scrolled into, like
  // the active-tab treatment on a real sports-platform nav. Driven by scroll
  // position (which section's top has crossed the activation line) rather
  // than IntersectionObserver ratios — ratio comparison breaks down once
  // sections have very different heights (e.g. the tall Certificates grid vs.
  // the short Press Box form), since a tall section's visible-area ratio
  // rarely wins against a short one even while it dominates the viewport.
  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const ACTIVATION_OFFSET = 160; // px from the top of the viewport

    const updateActive = () => {
      let current = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= ACTIVATION_OFFSET) {
          current = section.id;
        }
      }
      setActiveId(current);
    };

    updateActive();
    window.addEventListener("scroll", updateActive, { passive: true });
    window.addEventListener("resize", updateActive);
    return () => {
      window.removeEventListener("scroll", updateActive);
      window.removeEventListener("resize", updateActive);
    };
  }, []);

  const handleLinkClick = () => {
    play("click");
    setMenuOpen(false);
  };

  return (
    <>
    <header className="sticky top-0 z-40 px-3 pt-3 font-navbar sm:px-4">
      <div
        className={`relative mx-auto flex max-w-6xl items-stretch overflow-hidden rounded-lg border backdrop-blur-xl transition-colors ${
          scrolled ? "border-white/15 bg-black/85 shadow-lg shadow-black/40" : "border-white/10 bg-black/70"
        }`}
      >
        {/* Thin broadcast-accent line + faint pitch-dot texture, kept subtle */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-leather-red via-scoreboard-amber to-broadcast-teal" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "14px 14px",
          }}
        />

        {/* Profile segment: opens the player-card modal rather than navigating */}
        <button
          type="button"
          onClick={() => {
            play("click");
            setProfileOpen(true);
          }}
          aria-haspopup="dialog"
          aria-expanded={profileOpen}
          className="relative flex shrink-0 items-center gap-2 border-r border-white/10 px-3 py-2.5 transition hover:bg-white/5 sm:px-4"
        >
          <span
            className="h-10 w-10 shrink-0 rounded-full border-2 border-scoreboard-amber bg-cover bg-center"
            style={{ backgroundImage: `url('${profile.photo}')`, backgroundColor: "#a01f22" }}
          />
          <span className="hidden text-sm font-bold uppercase tracking-wider text-white sm:inline">
            {profile.shortName}
          </span>
        </button>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="relative hidden flex-1 items-stretch divide-x divide-white/10 md:flex">
          {NAV_LINKS.map((link) => {
            const isActive = activeId === link.id;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                aria-current={isActive ? "page" : undefined}
                className={`group relative flex flex-1 items-center justify-center overflow-hidden px-4 text-xs font-bold uppercase tracking-wider transition-colors ${
                  isActive ? "text-white" : "text-white/55 hover:text-white"
                }`}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-b from-leather-red/30 via-leather-red/5 to-transparent"
                  />
                )}
                <span className="relative">{link.label}</span>
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-3 bottom-0 h-0.5 origin-center scale-x-0 rounded-full bg-gradient-to-r from-leather-red via-scoreboard-amber to-broadcast-teal transition-transform duration-300 ${
                    isActive ? "scale-x-100" : "group-hover:scale-x-100"
                  }`}
                />
              </a>
            );
          })}
        </nav>

        {/* LIVE indicator + mute, desktop */}
        <div className="relative hidden shrink-0 items-center gap-3 border-l border-white/10 px-3 sm:flex sm:px-4">
          <span className="flex items-center gap-1.5 rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.3)]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-500" />
            </span>
            Live
          </span>
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
            aria-pressed={muted}
            className="rounded-md border border-white/15 p-1.5 text-white/80 transition hover:border-scoreboard-amber hover:text-scoreboard-amber"
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
        </div>

        {/* Mobile: compact LIVE dot + hamburger */}
        <div className="relative ml-auto flex items-center gap-3 border-l border-white/10 px-3 md:hidden">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="rounded-md p-1.5 text-white/80 transition hover:text-scoreboard-amber"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav
          id="mobile-nav"
          aria-label="Primary"
          className="mx-auto mt-1.5 max-w-6xl overflow-hidden rounded-lg border border-white/10 bg-black/90 backdrop-blur-xl md:hidden"
        >
          {NAV_LINKS.map((link) => {
            const isActive = activeId === link.id;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center justify-between border-b border-white/5 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors last:border-0 ${
                  isActive
                    ? "bg-gradient-to-r from-leather-red/25 to-transparent text-white"
                    : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
                {isActive && <span className="h-1.5 w-1.5 rounded-full bg-scoreboard-amber" />}
              </a>
            );
          })}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-red-300">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Live
            </span>
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
              aria-pressed={muted}
              className="rounded-md border border-white/15 p-1.5 text-white/80"
            >
              {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
          </div>
        </nav>
      )}
    </header>

    <AnimatePresence>
      {profileOpen && <ProfileModal onClose={() => setProfileOpen(false)} />}
    </AnimatePresence>
    </>
  );
}
