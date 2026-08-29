# The Dressing Room — SKS

A cricket-themed personal portfolio for **Satish Kumar Sharma** — an all-rounder in tech blending AI/ML and full-stack development, built as an interactive "dressing room" you walk into rather than a static resume page.

Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Framer Motion**, and a **Supabase**-backed CMS.

---

## The idea

Most portfolios are a scroll of sections. This one is staged as a cricket broadcast: you open on a stadium, play a **Cricket Cover Drive** intro (bowl a ball, the batsman connects, the screen shatters like glass), and land in the **Dressing Room** — a hub where projects are **jersey cards**, skills are a **SkillCard** scoreboard, achievements are **Certificates**, and school/college history is told as two **cricket innings**. Even the contact form is a **Contact Box** press conference.

The goal was to make the theme structural, not decorative — every section name, layout, and interaction borrows from how a cricket broadcast actually presents information (scorecards, tickers, innings breaks), while staying a fast, accessible, real-world Next.js app underneath.

## How it was built — the journey

**1. The intro.** The entry point is a hand-built animation sequence (`CricketCoverDriveIntro.tsx`): a bowler's-eye ball delivery, a bat swing timed to intercept it, an impact reaction, the ball rocketing toward the viewer, and a canvas-based glass-shatter effect that reveals the site underneath. Every visual asset (batsman cutout, ball, stadium backdrop) is a real photo with the background removed locally (Python/PIL/OpenCV GrabCut), loaded as a CSS `background-image` rather than `<img>` so a missing asset degrades to a plain color instead of a broken-image icon. The intro replays every time the page loads — there's no "seen it, skip it" flag — because it's the front door, not a splash screen.

**2. The Dressing Room hub.** A single stadium-backdrop page hosts a broadcast-style score-ticker navbar, a profile modal (bio, contact details, and real brand-logo links to LinkedIn/GitHub/LeetCode/GeeksforGeeks/YouTube/Instagram), and the section stack: jersey-card projects, a SkillCard table, Certificates & Achievements, a Career Innings timeline, and the Contact Box.

**3. Career Innings.** School and college history is framed as two cricket innings — **Innings I: The Foundation Overs** (four Kendriya Vidyalaya postings across Jabalpur, Bengdubi, Hisar Cantt, and Mughalsarai) and **Innings II: The CSJMU Campaign** (three years at Chhatrapati Shahu Ji Maharaj University, Kanpur, with real achievements per year — hackathons, an AI/ML course, a placement-coordinator role, and an internship in ML and Agentic AI) — each stage carrying the institution's real crest in a circular badge.

**4. The CMS.** Projects, skills, and certificates are editable from a `/admin` dashboard backed by Supabase (Postgres + Row Level Security + Storage), with Server Actions for CRUD and image uploads. It's **local-development-only by design**: `proxy.ts` (Next.js 16 renamed `middleware.ts`) hard-blocks `/admin` in production with no override, and every Server Action independently re-checks admin auth as defense-in-depth, since Server Actions aren't separate routes and can silently lose proxy coverage on a refactor. When Supabase isn't configured, every page gracefully falls back to static data files — the site never breaks because a database call failed.

**5. The Contact Box.** A real contact form that sends mail via Resend and always keeps a durable copy in a Supabase `messages` table, so a submission is never lost even if email delivery fails. Name, phone, and email fields carry live format validation (no digits in a name, no letters in a phone number, a real `@`-and-domain email) enforced both client-side, with inline error messages as you type, and again server-side in the API route as defense-in-depth.

**6. Iteration.** The rest was refinement driven by real usage: fixing a Next.js Server Action body-size limit that blocked jersey image uploads, tracking down a Resend sandbox-mode restriction that silently dropped emails, correcting a cross-section alignment bug found by measuring exact pixel `boundingBox()` coordinates rather than eyeballing screenshots, simplifying the skills table from a multi-column scoreboard down to just a name, and reorganizing image assets into a `public/images/core/` folder as the project grew.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (`@theme inline`, no config file) |
| Animation | Framer Motion |
| Backend | Supabase (Postgres, Row Level Security, Storage) |
| Email | Resend, with a Supabase durable fallback |
| Icons | Lucide + real brand logo assets |

## Project structure

```
app/                    # App Router pages, API routes, and the /admin CMS
  admin/                # Local-dev-only CMS: dashboard, tabs, Server Actions
  api/contact/          # Contact Box submission handler (Resend + Supabase)
  projects/[slug]/      # Individual project "Match Report" pages
components/             # Intro, Dressing Room, Navbar, sections, ProfileModal
data/                   # Static fallback content (used when Supabase is off)
lib/
  data/                 # Supabase-aware data loaders with static fallback
  supabase/             # Browser / server / admin Supabase clients + types
  audio/                # Lightweight Web Audio synth for UI sound effects
public/images/
  core/                 # Hero photography (batsman, ball, stadium, profile)
  education/            # School/college crests for the Career Innings timeline
  taglogo/               # Real brand logos for the profile modal's social links
supabase/migrations/    # SQL migrations, applied in order
```

## Running it locally

```bash
npm install
cp .env.example .env.local   # fill in Supabase / Resend credentials (optional — the site works without them, using static data)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The `/admin` CMS is reachable only in development (`npm run dev`), never in a production build — this is enforced in `proxy.ts`, not just hidden from navigation.

## Environment variables

See `.env.example` for the full list: Supabase project URL/keys (public + service role), a Resend API key for Contact Box email delivery, and an admin secret for the CMS login. Every one of them is optional — omit any of them and the corresponding feature falls back gracefully instead of breaking the build.

---

Built end-to-end — intro animation, CMS, email pipeline, and every section in between — as a from-scratch Next.js project, then reorganized here into a readable commit history.
