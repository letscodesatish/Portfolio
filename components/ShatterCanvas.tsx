"use client";

import { useEffect, useRef } from "react";

interface Shard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vr: number;
  size: number;
  sides: number;
  opacity: number;
  tint: number;
}

interface ShatterCanvasProps {
  originX: number;
  originY: number;
  onDone: () => void;
  durationMs?: number;
}

export default function ShatterCanvas({ originX, originY, onDone, durationMs = 1100 }: ShatterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const shardCount = 90;
    const shards: Shard[] = Array.from({ length: shardCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 16;
      return {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        rotation: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        size: 8 + Math.random() * 34,
        sides: 3 + Math.floor(Math.random() * 2),
        opacity: 1,
        tint: Math.random(),
      };
    });

    const start = performance.now();
    let raf = 0;

    const drawShard = (s: Shard) => {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      ctx.globalAlpha = Math.max(s.opacity, 0);

      const grad = ctx.createLinearGradient(-s.size / 2, -s.size / 2, s.size / 2, s.size / 2);
      const base = s.tint > 0.5 ? "234, 246, 255" : "180, 210, 230";
      grad.addColorStop(0, `rgba(${base}, 0.85)`);
      grad.addColorStop(0.5, `rgba(${base}, 0.35)`);
      grad.addColorStop(1, `rgba(${base}, 0.7)`);

      ctx.beginPath();
      for (let i = 0; i < s.sides; i++) {
        const a = (i / s.sides) * Math.PI * 2;
        const r = s.size / 2 + Math.sin(i * 7.13 + s.tint * 10) * (s.size / 6);
        const px = Math.cos(a) * r;
        const py = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.restore();
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / durationMs, 1);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const s of shards) {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.35;
        s.vx *= 0.99;
        s.rotation += s.vr;
        s.opacity = 1 - t * t;
        drawShard(s);
      }

      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else if (!doneRef.current) {
        doneRef.current = true;
        onDone();
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [originX, originY, onDone, durationMs]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-50"
      aria-hidden="true"
    />
  );
}
