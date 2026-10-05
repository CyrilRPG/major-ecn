'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowRight, BarChart3, ClipboardCheck, Repeat, Target } from 'lucide-react';
import { TEXTS } from '@/lib/checkup/types';
import { CHECKUP_VIDEO } from '@/lib/marketing/checkup-video';

/**
 * Mise en avant produit de l'EVC Check-up (CDC Check-up §42) : la carte du
 * site — score global, analyse par domaine, items à consolider, plan de
 * reprise — et la vidéo de démonstration (lancement → chrono → résultat →
 * items faibles → plan de reprise), chargée seulement à l'approche.
 * Aucun pronostic de réussite, aucune « moyenne » sans cohorte (§22).
 */

const FONT = "'Plus Jakarta Sans', sans-serif";
const FONT_BODY = "'Manrope', sans-serif";
const RED = '#C0112E';
const NAVY = '#0F1F4D';
const INK_SOFT = '#52607A';
const BORDER = '#E5E9F0';

const POINTS = [
  { Icon: BarChart3, title: 'Score global', desc: 'Pourcentage, points et temps : une mesure nette de votre niveau du jour.' },
  { Icon: Target, title: 'Analyse par domaine', desc: 'Vos résultats par catégorie et par dossier, pour savoir où vous perdez des points.' },
  { Icon: ClipboardCheck, title: 'Items à consolider', desc: 'Les items à revoir en priorité et ceux à consolider, rattachés au programme.' },
  { Icon: Repeat, title: 'Plan de reprise', desc: 'Révisions programmées, entraînement ciblé et planning ajusté, automatiquement.' },
];

function useVideoUrl(enabled: boolean): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled || !CHECKUP_VIDEO.bunnyGuid) return;
    let alive = true;
    fetch('/api/marketing/checkup-video').then((r) => (r.ok ? r.json() : null)).then((d: { url?: string } | null) => { if (alive && d?.url) setUrl(d.url); }).catch(() => undefined);
    return () => { alive = false; };
  }, [enabled]);
  return url;
}

/** Aperçu du résultat d'un Check-up (illustration, affichée tant que la vidéo n'est pas chargée). */
function ResultMock() {
  const score = 68;
  const dash = 2 * Math.PI * 42;
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-[0_30px_80px_-30px_rgba(20,37,78,0.35)] sm:p-6" style={{ borderColor: BORDER, fontFamily: FONT_BODY }} aria-hidden>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ color: RED }}>Résultat · EVC Check-up</p>
      <div className="mt-3 flex items-center gap-4">
        <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#F1F2F6" strokeWidth="10" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={RED} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(score / 100) * dash} ${dash}`} transform="rotate(-90 50 50)" />
          <text x="50" y="56" textAnchor="middle" fontSize="22" fontWeight="800" fill={NAVY} style={{ fontFamily: FONT }}>{score} %</text>
        </svg>
        <div className="text-sm" style={{ color: INK_SOFT }}>
          <p className="font-bold" style={{ color: NAVY }}>27,2 / 40 points</p>
          <p>Temps : 52 min sur 60</p>
          <p className="mt-1 text-xs">Score global en pourcentage, sous-scores en fraction sous 5 questions.</p>
        </div>
      </div>
      <div className="mt-4 space-y-2 text-[13px]">
        {[{ d: 'Cardiologie', s: '70 % (7/10)', w: 70 }, { d: 'Pneumologie', s: '58 % (7/12)', w: 58 }, { d: 'Insuffisance cardiaque', s: '3/4', w: 75 }].map((x) => (
          <div key={x.d}>
            <p className="flex justify-between font-semibold" style={{ color: NAVY }}><span>{x.d}</span><span>{x.s}</span></p>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#F1F2F6]"><div className="h-full rounded-full" style={{ width: `${x.w}%`, background: RED }} /></div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-[12px]">
        <div className="rounded-xl bg-[#FCEAEC] p-2.5"><p className="font-bold" style={{ color: RED }}>À revoir en priorité</p><p style={{ color: INK_SOFT }}>BPCO · Embolie pulmonaire</p></div>
        <div className="rounded-xl bg-[#FEF3C7] p-2.5"><p className="font-bold text-[#A16207]">À consolider</p><p style={{ color: INK_SOFT }}>Asthme · Pneumonie</p></div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-[12px] font-bold">
        <span className="rounded-lg px-3 py-2 text-white" style={{ background: RED }}>{TEXTS.ctaTrainGaps}</span>
        <span className="rounded-lg border px-3 py-2" style={{ borderColor: BORDER, color: NAVY }}>{TEXTS.ctaAddRevisions}</span>
      </div>
    </div>
  );
}

export function CheckupShowcase() {
  const ref = useRef<HTMLElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver((e) => { if (e.some((x) => x.isIntersecting)) { setNear(true); io.disconnect(); } }, { rootMargin: '300px' });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);
  const url = useVideoUrl(near);

  return (
    <section ref={ref} id="evc-checkup" className="py-16 sm:py-20 lg:py-24" style={{ fontFamily: FONT, background: '#FBFBFD' }} aria-labelledby="evc-checkup-titre">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.05fr]">
        <div>
          <p className="inline-flex rounded-full border px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.18em]" style={{ borderColor: '#E8C987', color: '#9A6A12' }}>Nouveau</p>
          <h2 id="evc-checkup-titre" className="mt-4 text-[1.9rem] font-black leading-tight tracking-tight sm:text-[2.4rem]" style={{ color: NAVY }}>{TEXTS.siteCard}</h2>
          <p className="mt-3 text-[15px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{TEXTS.signature} Une évaluation chronométrée, au format de votre voie, qui se transforme aussitôt en programme de travail.</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {POINTS.map((p) => (
              <li key={p.title} className="rounded-2xl border bg-white p-4" style={{ borderColor: BORDER }}>
                <p className="flex items-center gap-2 font-extrabold" style={{ color: NAVY }}><p.Icon className="h-4 w-4" style={{ color: RED }} aria-hidden /> {p.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>{p.desc}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 flex flex-wrap items-center gap-1.5 text-[12px] font-bold" style={{ color: NAVY }} aria-label="La boucle du Check-up">
            {['Évaluation', 'Score', 'Lacunes', 'Plan de reprise', 'Révision', 'Réévaluation'].map((s, i, all) => (
              <span key={s} className="inline-flex items-center gap-1.5"><span className="rounded-full bg-white px-2.5 py-1 shadow-sm">{s}</span>{i < all.length - 1 && <ArrowRight className="h-3 w-3 opacity-50" aria-hidden />}</span>
            ))}
          </p>
          <p className="mt-5 text-[13px] italic" style={{ color: INK_SOFT, fontFamily: FONT_BODY }}>« {TEXTS.finalPrinciple} »</p>
        </div>
        <div>
          {url ? (
            <div className="relative overflow-hidden rounded-3xl shadow-[0_30px_80px_-30px_rgba(20,37,78,0.35)]" style={{ aspectRatio: '16 / 9' }}>
              <iframe src={url} title="EVC Check-up — démonstration" className="absolute inset-0 h-full w-full border-0" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
            </div>
          ) : (
            <ResultMock />
          )}
        </div>
      </div>
    </section>
  );
}
