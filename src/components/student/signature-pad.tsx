'use client';

/**
 * Pavé de signature manuscrite.
 *
 * Pointer Events : un seul jeu d'écouteurs couvre le doigt, le stylet et la
 * souris. `touch-action: none` empêche le navigateur d'interpréter le tracé
 * comme un défilement — sans quoi signer au doigt sur mobile fait scroller la
 * page au lieu de dessiner.
 *
 * Le canvas est dimensionné en pixels physiques (devicePixelRatio) pour que le
 * trait reste net sur écran haute densité.
 */
import { useEffect, useRef, useState } from 'react';
import { Eraser } from 'lucide-react';

export function SignaturePad({
  onChange,
  disabled = false,
}: {
  /** Appelé à chaque modification : data URL PNG, ou null si le pavé est vide. */
  onChange: (dataUrl: string | null) => void;
  disabled?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const dirtyRef = useRef(false);
  const [empty, setEmpty] = useState(true);

  // Redimensionne le canvas à sa taille CSS réelle, en pixels physiques.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      const c = canvasRef.current;
      if (!c) return;
      const rect = c.getBoundingClientRect();
      if (rect.width === 0) return;
      const dpr = window.devicePixelRatio || 1;
      // Redimensionner un canvas efface son contenu : on ne le fait que tant
      // que rien n'a été tracé, pour ne jamais perdre une signature en cours.
      if (dirtyRef.current) return;
      c.width = Math.round(rect.width * dpr);
      c.height = Math.round(rect.height * dpr);
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = '#0F1F4D';
    }

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    // Capture : le tracé continue même si le doigt sort du cadre.
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    // Un simple appui (point) doit laisser une marque.
    ctx.lineTo(x + 0.01, y);
    ctx.stroke();
    mark();
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current || disabled) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function end() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    emit();
  }

  function mark() {
    dirtyRef.current = true;
    if (empty) setEmpty(false);
  }

  function emit() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(dirtyRef.current ? canvas.toDataURL('image/png') : null);
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    // Le contexte est mis à l'échelle : on efface en coordonnées CSS.
    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    dirtyRef.current = false;
    setEmpty(true);
    onChange(null);
  }

  return (
    <div>
      <div
        className="relative overflow-hidden rounded-xl border-2 border-dashed bg-white"
        style={{ borderColor: empty ? '#C7CEDB' : '#0F1F4D' }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
          onPointerLeave={end}
          className="block h-40 w-full cursor-crosshair"
          style={{ touchAction: 'none' }}
        />
        {empty && (
          <p
            aria-hidden
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-[13px] font-medium"
            style={{ color: '#98A2B3' }}
          >
            Signez ici avec votre doigt ou votre souris
          </p>
        )}
      </div>
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={clear}
          disabled={empty || disabled}
          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-semibold disabled:opacity-40"
          style={{ color: '#5B6478' }}
        >
          <Eraser className="h-3.5 w-3.5" /> Effacer
        </button>
      </div>
    </div>
  );
}
