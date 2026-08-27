"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Howl, Howler } from "howler";
import { generateSoundUrl, isAudioSupported, type SoundName } from "@/lib/audio/synth";

interface SoundContextValue {
  muted: boolean;
  toggleMute: () => void;
  play: (name: SoundName) => void;
  ready: boolean;
}

const SoundContext = createContext<SoundContextValue | null>(null);

const STORAGE_KEY = "cricket-portfolio-muted";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const howls = useRef<Partial<Record<SoundName, Howl>>>({});
  const loading = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // localStorage is only readable client-side, so the persisted mute
    // preference can only be restored after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored !== null) setMuted(stored === "true");
  }, []);

  useEffect(() => {
    Howler.mute(muted);
    window.localStorage.setItem(STORAGE_KEY, String(muted));
  }, [muted]);

  useEffect(() => {
    if (loading.current || !isAudioSupported()) return;
    loading.current = true;

    const names: SoundName[] = ["whoosh", "impact", "batHit", "shatter", "click", "hover", "cheer"];
    Promise.all(
      names.map(async (name) => {
        const url = await generateSoundUrl(name);
        howls.current[name] = new Howl({ src: [url], format: ["wav"], volume: name === "hover" ? 0.4 : 0.9 });
      })
    ).then(() => setReady(true));
  }, []);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  const play = useCallback((name: SoundName) => {
    const howl = howls.current[name];
    if (howl) howl.play();
  }, []);

  return (
    <SoundContext.Provider value={{ muted, toggleMute, play, ready }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within a SoundProvider");
  return ctx;
}
