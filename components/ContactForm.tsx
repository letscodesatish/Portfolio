"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, Mic, Send } from "lucide-react";
import { SectionHeading } from "./Scorecard";
import { useSound } from "./providers/SoundProvider";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { play } = useSound();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    setStatus("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await res.json();

      if (!res.ok) {
        setErrorMsg(payload.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      play("cheer");
      setStatus("success");
      form.reset();
    } catch {
      setErrorMsg("Network error — please try again.");
      setStatus("error");
    }
  };

  return (
    <section id="press-box" className="mx-auto max-w-6xl px-5 py-24">
      <SectionHeading kicker="Post-Match Presentation" title="Contact Box" />

      <div className="relative max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-locker-wood p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-full border border-scoreboard-amber/40 bg-scoreboard-amber/10 p-2">
            <Mic size={18} className="text-scoreboard-amber" />
          </div>
          <div>
            <p className="font-display text-xl tracking-wide text-foreground">Ask the Player a Question</p>
            <p className="font-mono text-xs text-pitch-sand/70">Reporters, recruiters &amp; collaborators welcome.</p>
          </div>
        </div>

        {status === "success" ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 rounded-xl border border-scoreboard-amber/30 bg-scoreboard-green/30 py-12 text-center"
          >
            <Mail size={28} className="text-scoreboard-amber" />
            <p className="font-display text-2xl tracking-wide text-foreground">Statement Recorded</p>
            <p className="max-w-sm font-mono text-sm text-pitch-sand/70">
              Thanks for the question — expect a reply in the post-match press release (a.k.a. your inbox) soon.
            </p>
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="mt-2 font-mono text-xs uppercase tracking-wider text-scoreboard-amber underline underline-offset-4"
            >
              Ask another question
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Name" name="name" placeholder="Your name" required />
              <Field label="Purpose" name="purpose" placeholder="Why are you reaching out?" required />
              <Field label="Phone No." name="phone" type="tel" placeholder="+91 00000 00000" required />
              <Field label="Email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div>
              <label htmlFor="message" className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-pitch-sand/70">
                Question
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={5}
                placeholder="What would you like to ask?"
                className="w-full resize-none rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm text-foreground placeholder:text-pitch-sand/40 outline-none focus:border-scoreboard-amber"
              />
            </div>

            {status === "error" && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 font-mono text-xs text-red-300">
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-leather-red to-leather-red-dark px-4 py-3 font-display text-lg tracking-wide text-foreground transition hover:brightness-110 disabled:opacity-60"
            >
              {status === "submitting" ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Sending to the Contact Box…
                </>
              ) : (
                <>
                  <Send size={18} /> Submit Question
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-pitch-sand/70">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/15 bg-black/30 px-3.5 py-2.5 text-sm text-foreground placeholder:text-pitch-sand/40 outline-none focus:border-scoreboard-amber"
      />
    </div>
  );
}
