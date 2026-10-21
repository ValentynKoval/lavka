"use client";

import { useEffect, useRef } from "react";

const COLORS = ["#c2633f", "#d9a441", "#6b7a4b", "#e9b9a1", "#3f5f8f", "#fbf8f3"];

/** A short burst of paper confetti on a full-screen canvas; no library, ~2.5 s, reduced-motion aware. */
export function Confetti({ pieces = 140 }: { pieces?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };
    resize();
    const W = () => canvas.width;
    const H = () => canvas.height;
    const parts = Array.from({ length: pieces }, () => ({
      x: W() * (0.3 + Math.random() * 0.4),
      y: H() * 0.35,
      vx: (Math.random() - 0.5) * 14 * dpr,
      vy: (-9 - Math.random() * 9) * dpr,
      w: (6 + Math.random() * 6) * dpr,
      h: (10 + Math.random() * 8) * dpr,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, W(), H());
      for (const p of parts) {
        p.vy += 0.35 * dpr;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - 1.6) / 0.9);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, Math.abs(Math.cos(p.rot * 1.3)) * p.h + 1);
        ctx.restore();
      }
      if (t < 2.6) frame = requestAnimationFrame(tick);
      else ctx.clearRect(0, 0, W(), H());
    };
    frame = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, [pieces]);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-50 h-full w-full" />;
}
