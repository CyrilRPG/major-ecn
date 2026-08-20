'use client';

import { useState } from 'react';
import { ArrowRight, ClipboardCheck, Lock, Sparkles, Video, X } from 'lucide-react';

export function LockedSeanceApprofondieCard({
  label,
  desc,
  accent,
  bg,
}: {
  label: string;
  desc: string;
  accent: string;
  bg: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative flex min-h-[170px] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 text-left shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-lifted) focus:outline-none focus-visible:ring-2"
        style={{ '--tw-ring-color': accent } as React.CSSProperties}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ background: `linear-gradient(135deg, transparent 55%, ${bg} 100%)` }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 bottom-0 select-none opacity-[0.08]"
          style={{ color: accent }}
        >
          <Video className="h-44 w-44" strokeWidth={1.4} />
        </span>

        <div className="relative flex items-start justify-between">
          <span
            className="flex h-12 w-12 items-center justify-center rounded-xl opacity-90"
            style={{ background: bg, color: accent }}
          >
            <Video className="h-6 w-6" />
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] shadow-sm"
            style={{ background: bg, color: accent }}
          >
            <Lock className="h-3 w-3" />
            Verrouillé
          </span>
        </div>
        <div className="relative mt-5">
          <h3 className="text-lg font-bold text-(--color-ink)">{label}</h3>
          <p className="mt-1.5 max-w-[80%] text-sm leading-relaxed text-(--color-ink-soft)">{desc}</p>
        </div>
        <span
          className="relative mt-4 inline-flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: accent }}
        >
          <Lock className="h-4 w-4" /> Comment débloquer ?
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div
              className="relative px-7 pb-6 pt-8"
              style={{ background: 'linear-gradient(135deg, #F3EAFF 0%, #E5D4FB 100%)' }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-gray-500 shadow-sm hover:bg-white"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/90 shadow-sm" style={{ color: '#7C3AED' }}>
                  <Sparkles className="h-7 w-7" />
                </span>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#7C3AED]">
                    Programme Approfondi
                  </p>
                  <h3 className="text-xl font-extrabold text-[#1F2937]">
                    Séance approfondie
                  </h3>
                </div>
              </div>
            </div>

            <div className="px-7 py-6">
              <p className="text-[15px] font-semibold leading-relaxed text-[#1F2937]">
                Cette séance approfondie est reliée à une séance du professeur : terminez celle-ci pour la débloquer.
              </p>
              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-3 rounded-xl bg-[#F9FAFB] p-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FEF3E2] text-[#D97706]">
                    <ClipboardCheck className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#1F2937]">1. Séances du professeur</p>
                    <p className="mt-0.5 text-xs text-[#6B7280]">
                      Rendez-vous dans « Dossiers progressifs & QI » et terminez la séance qui ouvre cette vidéo.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-[#F9FAFB] p-3.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F3EAFF] text-[#7C3AED]">
                    <Video className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-[#1F2937]">2. Vidéos débloquées</p>
                    <p className="mt-0.5 text-xs text-[#6B7280]">
                      Une fois toutes les séances terminées, les vidéos de séance approfondie se débloquent automatiquement.
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold text-white shadow-[0_10px_25px_-10px_rgba(124,58,237,0.55)] transition-transform hover:scale-[1.02]"
                style={{ background: 'linear-gradient(90deg, #5B21B6 0%, #7C3AED 100%)' }}
              >
                J'ai compris <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
