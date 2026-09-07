'use client';

import { useEffect, useRef } from 'react';

/**
 * Fond de l'arène — canvas 2D léger (aucune dépendance) : sol en perspective
 * qui défile lentement vers le spectateur, anneaux concentriques au point de
 * fuite et projecteur rouge qui balaie la piste comme dans un stade.
 *
 * Choix délibéré du 2D plutôt que d'un moteur 3D : rendu identique sur
 * mobile à connexion dégradée (§16), aucune bibliothèque de 600 Ko, et l'effet
 * reste sobre (§13 : transitions rapides et sobres, aucune animation
 * infantile). Respecte prefers-reduced-motion (image fixe) et s'arrête quand
 * le canvas sort de l'écran.
 */
export function ArenaBackdrop({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let visible = true;
    let w = 0;
    let h = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      const time = reduced ? 0 : t / 1000;
      ctx.clearRect(0, 0, w, h);
      const vx = w / 2;
      const vy = h * 0.46; // ligne d'horizon
      const floor = h - vy;

      // Halo d'horizon
      const halo = ctx.createRadialGradient(vx, vy, 0, vx, vy, Math.max(w, h) * 0.55);
      halo.addColorStop(0, 'rgba(228,0,43,0.20)');
      halo.addColorStop(0.35, 'rgba(228,0,43,0.06)');
      halo.addColorStop(1, 'rgba(228,0,43,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      // Projecteur : cône rouge qui balaie la piste
      const angle = Math.sin(time * 0.16) * 0.55;
      ctx.save();
      ctx.translate(vx, vy);
      ctx.rotate(angle);
      const cone = ctx.createLinearGradient(0, 0, 0, floor * 1.3);
      cone.addColorStop(0, 'rgba(228,0,43,0.16)');
      cone.addColorStop(0.6, 'rgba(228,0,43,0.05)');
      cone.addColorStop(1, 'rgba(228,0,43,0)');
      ctx.fillStyle = cone;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-floor * 0.75, floor * 1.3);
      ctx.lineTo(floor * 0.75, floor * 1.3);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Sol : lignes de fuite
      ctx.lineWidth = 1;
      const lanes = 16;
      for (let i = -lanes; i <= lanes; i++) {
        const x = vx + (i / lanes) * w * 1.6;
        const a = 0.09 - Math.abs(i / lanes) * 0.06;
        ctx.strokeStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(vx, vy);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Sol : lignes transversales qui avancent vers le spectateur
      const rows = 14;
      const scroll = (time * 0.06) % 1;
      for (let k = 0; k < rows; k++) {
        const p = ((k + scroll) % rows) / rows;
        const y = vy + floor * p * p;
        const a = 0.02 + p * 0.10;
        ctx.strokeStyle = `rgba(255,255,255,${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Ligne d'horizon et anneaux du centre de l'arène
      ctx.strokeStyle = 'rgba(228,0,43,0.45)';
      ctx.beginPath();
      ctx.moveTo(0, vy);
      ctx.lineTo(w, vy);
      ctx.stroke();
      const rings = [70, 170, 320, 540];
      rings.forEach((r, i) => {
        ctx.strokeStyle = `rgba(242,86,103,${(0.18 - i * 0.035).toFixed(3)})`;
        ctx.beginPath();
        ctx.ellipse(vx, vy, r, r * 0.32, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      if (!reduced && visible) raf = requestAnimationFrame(draw);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };

    resize();
    start();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw(0);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return <canvas ref={ref} aria-hidden className={className} />;
}
