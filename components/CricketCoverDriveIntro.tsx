"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimationControls, type Variants } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";
import ShatterCanvas from "./ShatterCanvas";
import { useSound } from "./providers/SoundProvider";

type Phase = "idle" | "delivery" | "shot" | "rocket" | "shatter";

// Where the ball is "pitched" from (bowler's end, off to the top-left).
const BOWLER_START = { top: "6%", left: "8%" };

// The bat-impact point isn't hardcoded as a viewport percentage — the
// BatsmanRig box's height and right-offset change between the mobile and
// sm+ breakpoints (see its className), and since batsman.png is a portrait
// photo (941x1672), `background-size: contain` letterboxes it on a
// *different axis* depending on the box's own aspect ratio: horizontal
// gaps on the wide desktop box, a vertical gap on the narrow mobile box. A
// marker positioned as a plain percentage of the outer box ignores that and
// drifts onto the helmet on phones. Instead these two constants describe
// where the bat actually is as a fraction of the PHOTO itself (a fixed,
// screen-size-independent ratio, tuned by eye against the desktop render),
// and getImpactPoint() below replicates the real `contain`/`bottom`
// letterboxing math at runtime to convert that into a viewport position for
// whatever box size the current screen produces.
const BATSMAN_IMAGE_ASPECT = 941 / 1672;
const BAT_POINT_IN_IMAGE = { xRatio: 0.5555, yRatio: 0.4167 };

function getImpactPoint(rigEl: HTMLElement) {
  const box = rigEl.getBoundingClientRect();
  const boxAspect = box.width / box.height;

  let renderW: number;
  let renderH: number;
  if (BATSMAN_IMAGE_ASPECT > boxAspect) {
    // Width-constrained: the box is proportionally narrower than the photo,
    // so the photo fills the box's full width and leaves a gap above it
    // (bg-bottom anchors it to the bottom).
    renderW = box.width;
    renderH = box.width / BATSMAN_IMAGE_ASPECT;
  } else {
    // Height-constrained: the box is proportionally wider than the photo,
    // so the photo fills the box's full height and is centered horizontally.
    renderH = box.height;
    renderW = box.height * BATSMAN_IMAGE_ASPECT;
  }

  const imgLeft = box.left + (box.width - renderW) / 2;
  const imgTop = box.top + (box.height - renderH);

  return {
    top: ((imgTop + BAT_POINT_IN_IMAGE.yRatio * renderH) / window.innerHeight) * 100,
    left: ((imgLeft + BAT_POINT_IN_IMAGE.xRatio * renderW) / window.innerWidth) * 100,
  };
}

const ballVariants: Variants = {
  idle: {
    top: BOWLER_START.top,
    left: BOWLER_START.left,
    x: "-50%",
    y: "-50%",
    opacity: 0,
    scale: 0.5,
    rotate: 0,
    filter: "blur(1px)",
  },
  rocket: {
    top: "50%",
    left: "50%",
    x: "-50%",
    y: "-50%",
    scale: 20,
    rotate: 2160,
    filter: "blur(3px)",
    transition: { duration: 0.5, ease: [0.7, 0, 0.9, 0.2] },
  },
  shatter: { opacity: 0, transition: { duration: 0.05 } },
};

const batsmanVariants: Variants = {
  idle: { rotate: 0, x: 0 },
  delivery: { rotate: 0, x: 0 },
  shot: {
    // A real swing: wind up slightly away from the ball, then whip through
    // and connect right as the ball's own "shot" reaction fires (both use
    // the same duration so the two stay in sync), then settle into the
    // follow-through.
    rotate: [-10, 26, 8],
    x: [-3, 20, 4],
    transition: { duration: 0.22, times: [0, 0.7, 1], ease: "easeOut" },
  },
  rocket: { rotate: 6, x: 2 },
  shatter: { rotate: 6, x: 2, opacity: 0, transition: { duration: 0.15 } },
};

const swooshVariants: Variants = {
  idle: { pathLength: 0, opacity: 0 },
  delivery: { pathLength: 0, opacity: 0 },
  shot: {
    pathLength: [0, 1],
    opacity: [0, 1, 0],
    transition: { duration: 0.35, ease: "easeOut" },
  },
  rocket: { pathLength: 1, opacity: 0 },
  shatter: { pathLength: 1, opacity: 0 },
};

export default function CricketCoverDriveIntro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const shakeControls = useAnimationControls();
  const ballControls = useAnimationControls();
  const { play, muted, toggleMute } = useSound();
  const triggeredRef = useRef(false);
  const rigRef = useRef<HTMLDivElement>(null);
  const impactRef = useRef({ top: 58, left: 75 }); // sane default before the first measurement

  const measureImpact = useCallback(() => {
    const el = rigRef.current;
    if (!el) return;
    impactRef.current = getImpactPoint(el);
  }, []);

  useEffect(() => {
    measureImpact();
    window.addEventListener("resize", measureImpact);
    window.addEventListener("orientationchange", measureImpact);
    return () => {
      window.removeEventListener("resize", measureImpact);
      window.removeEventListener("orientationchange", measureImpact);
    };
  }, [measureImpact]);

  // Sequenced imperatively (rather than via reactive `animate={phase}` +
  // onAnimationComplete chaining) because each leg of the delivery must
  // fully settle — including opacity/blur, not just position — before the
  // next one starts. `controls.start()` resolving is the one signal that
  // actually guarantees that; a shared onAnimationComplete callback fired
  // early on some property channels and caused the ball to fade out mid-flight.
  const bowl = useCallback(async () => {
    if (triggeredRef.current) return;
    triggeredRef.current = true;

    // Re-measure right before playing — cheap, and guards against any
    // layout shift between mount and the user actually pressing play.
    measureImpact();
    const { top: impactTop, left: impactLeft } = impactRef.current;

    play("whoosh");
    setPhase("delivery");
    await ballControls.start({
      top: `${impactTop}%`,
      left: `${impactLeft}%`,
      x: "-50%",
      y: "-50%",
      opacity: 1,
      scale: 1,
      rotate: 620,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: [0.55, 0, 1, 0.45] },
    });

    play("batHit");
    setPhase("shot");
    await ballControls.start({
      // Small directional kick away from the bat, toward where the "rocket"
      // leg launches from — makes the ball visibly react to being struck
      // instead of just swelling in place.
      top: `${impactTop - 4}%`,
      left: `${impactLeft - 5}%`,
      x: "-50%",
      y: "-50%",
      scale: 1.08,
      rotate: 660,
      transition: { duration: 0.22, ease: "easeOut" },
    });

    setPhase("rocket");
    await ballControls.start("rocket");

    ballControls.set("shatter");
    setPhase("shatter");
    play("shatter");
    await shakeControls.start({
      x: [0, -16, 14, -10, 7, -4, 0],
      y: [0, 7, -6, 5, -3, 1, 0],
      transition: { duration: 0.5, ease: "easeOut" },
    });
  }, [play, ballControls, shakeControls, measureImpact]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        bowl();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bowl]);

  return (
    <motion.div
      animate={shakeControls}
      className="fixed inset-0 z-50 overflow-hidden bg-stadium-night"
      exit={{ opacity: 0 }}
      onClick={phase === "idle" ? bowl : undefined}
      role={phase === "idle" ? "button" : undefined}
      tabIndex={phase === "idle" ? 0 : undefined}
      aria-label={phase === "idle" ? "Play the cover drive to enter the site" : undefined}
    >
      {/* Stadium backdrop. A CSS background (rather than <Image>) degrades
          gracefully to the gradient below if stadium.png isn't in place
          yet, instead of showing a broken-image icon. */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/core/stadium.png')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-stadium-night" />
      <div className="absolute inset-0 bg-floodlight-radial animate-flicker" />

      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
        aria-pressed={muted}
        className="absolute right-5 top-5 z-30 rounded-full border border-white/15 bg-black/30 p-2.5 text-foreground/80 backdrop-blur transition hover:border-scoreboard-amber hover:text-scoreboard-amber"
      >
        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <BatsmanRig phase={phase} variants={batsmanVariants} swooshVariants={swooshVariants} rigRef={rigRef} />

      <motion.div
        className="absolute z-20 h-11 w-11 rounded-full sm:h-14 sm:w-14"
        style={{
          backgroundImage: "url('/images/core/cricket-ball.png')",
          backgroundSize: "cover",
          backgroundColor: "#a01f22",
          boxShadow: "0 0 30px rgba(160,31,34,0.55)",
          willChange: "transform, top, left, filter",
        }}
        variants={ballVariants}
        initial="idle"
        animate={ballControls}
      />

      {phase === "shatter" && (
        <ShatterCanvas
          originX={typeof window !== "undefined" ? window.innerWidth / 2 : 0}
          originY={typeof window !== "undefined" ? window.innerHeight / 2 : 0}
          onDone={onComplete}
        />
      )}

      {phase === "idle" && (
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-14 z-10 flex flex-col items-center gap-2 text-center sm:bottom-20"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <motion.span
            className="rounded-full border border-scoreboard-amber/40 bg-black/70 px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-scoreboard-amber backdrop-blur sm:text-sm"
            animate={{ opacity: [0.5, 1, 0.5], boxShadow: ["0 0 0px rgba(255,183,3,0)", "0 0 16px rgba(255,183,3,0.5)", "0 0 0px rgba(255,183,3,0)"] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          >
            Press [SPACEBAR] or Click to Play the Cover Drive
          </motion.span>
        </motion.div>
      )}

      <StadiumSilhouette />
    </motion.div>
  );
}

function BatsmanRig({
  phase,
  variants,
  swooshVariants,
  rigRef,
}: {
  phase: Phase;
  variants: Variants;
  swooshVariants: Variants;
  rigRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <motion.div
      ref={rigRef}
      className="absolute bottom-0 right-[4%] z-10 h-[62%] w-[46%] max-w-[420px] sm:right-[10%] sm:h-[72%]"
      style={{ willChange: "transform" }}
      variants={variants}
      initial="idle"
      animate={phase}
    >
      <div className="relative h-full w-full">
        {/* Full player cutout (a single pre-composited photo, face included).
            CSS background degrades gracefully if batsman.png isn't in place yet. */}
        <div
          className="absolute inset-0 bg-contain bg-bottom bg-no-repeat"
          style={{ backgroundImage: "url('/images/core/batsman.png')" }}
        />

        {/* Bat swing swoosh trail */}
        <motion.svg
          className="pointer-events-none absolute -left-[35%] bottom-[18%] h-[55%] w-[130%] overflow-visible"
          viewBox="0 0 200 120"
          fill="none"
        >
          <motion.path
            d="M10,100 Q90,110 130,60 Q155,28 190,10"
            stroke="url(#swoosh-gradient)"
            strokeWidth="6"
            strokeLinecap="round"
            variants={swooshVariants}
            initial="idle"
            animate={phase}
          />
          <defs>
            <linearGradient id="swoosh-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ffb703" stopOpacity="0" />
              <stop offset="100%" stopColor="#ffb703" stopOpacity="0.9" />
            </linearGradient>
          </defs>
        </motion.svg>
      </div>
    </motion.div>
  );
}

function StadiumSilhouette() {
  return (
    <svg
      className="pointer-events-none absolute bottom-0 left-0 z-0 w-full text-black/70"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0,160 Q200,100 400,150 T800,140 T1200,160 L1200,200 L0,200 Z" fill="currentColor" />
    </svg>
  );
}
