'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, Clock, Network, Trophy } from 'lucide-react';
import type { JourActivite } from '@/lib/student/activite';
import { getSpecialtyTheme } from '@/lib/data/specialty-icons';
import { Bloc, Carte, TitreCarte, lienCarte } from './ui';

/**
 * Section 3 de l'accueil — « Mes statistiques » : temps de travail jour par
 * jour (mesuré par le battement des pages d'étude), répartition du travail
 * et maîtrise par spécialité. La période (7, 30 ou 90 jours) s'applique aux
 * deux premières cartes ; la maîtrise est l'état actuel.
 */

const PERIODES = [7, 30, 90] as const;
type Periode = (typeof PERIODES)[number];

/** Objectif conseillé : 25 h par semaine, soit environ 3 h 34 par jour. */
const OBJECTIF_JOUR_H = 25 / 7;

const decaler = (jour: string, n: number) => {
  const d = new Date(`${jour}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const courte = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;

function TempsDeTravail({ jours }: { jours: { d: string; h: number }[] }) {
  const max = Math.max(4, Math.ceil(Math.max(OBJECTIF_JOUR_H, ...jours.map((j) => j.h)) / 2) * 2);
  const L = 300; const H = 140; const g = 26; const b = 18;
  const w = (L - g) / Math.max(1, jours.length);
  const y = (h: number) => H - b - (h / max) * (H - b - 8);
  const graduations = Array.from({ length: max / 2 + 1 }, (_, i) => i * 2);
  const reperes = jours.length <= 7 ? jours.map((_, i) => i) : [0, Math.round((jours.length - 1) / 4), Math.round((jours.length - 1) / 2), Math.round(((jours.length - 1) * 3) / 4), jours.length - 1];
  return (
    <div>
      <svg viewBox={`0 0 ${L} ${H}`} className="mt-2 h-auto w-full" role="img" aria-label="Temps de travail par jour">
        {graduations.map((v) => (
          <g key={v}>
            <line x1={g} x2={L} y1={y(v)} y2={y(v)} stroke="currentColor" className="text-(--color-border)" strokeWidth={0.6} />
            <text x={g - 4} y={y(v) + 3} textAnchor="end" className="fill-(--color-ink-muted) text-[8px]">{v} h</text>
          </g>
        ))}
        {jours.map((j, i) => (
          <rect key={j.d} x={g + i * w + w * 0.18} y={y(j.h)} width={Math.max(1, w * 0.64)} height={Math.max(0, H - b - y(j.h))} rx={Math.min(2, w * 0.2)} fill="#C0112E">
            <title>{`${courte(j.d)} : ${Math.floor(j.h)} h ${String(Math.round((j.h % 1) * 60)).padStart(2, '0')}`}</title>
          </rect>
        ))}
        <line x1={g} x2={L} y1={y(OBJECTIF_JOUR_H)} y2={y(OBJECTIF_JOUR_H)} stroke="#14254E" strokeWidth={1} strokeDasharray="4 3" opacity={0.55} />
        {reperes.map((i) => jours[i] && (
          <text key={i} x={g + i * w + w / 2} y={H - 4} textAnchor="middle" className="fill-(--color-ink-muted) text-[8px]">{courte(jours[i].d)}</text>
        ))}
      </svg>
      <p className="mt-1 flex items-center justify-center gap-4 text-[11px] text-(--color-ink-soft)">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-3 rounded-sm bg-[#C0112E]" aria-hidden />Temps réalisé</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-4 border-t border-dashed border-[#14254E]/60" aria-hidden />Objectif</span>
      </p>
    </div>
  );
}

function Repartition({ parts, total, contenuTotal }: { parts: { label: string; n: number; couleur: string }[]; total: number; contenuTotal: number }) {
  const r = 40; const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <>
      <div className="mt-3 flex items-center gap-4">
        <span className="relative grid h-[108px] w-[108px] shrink-0 place-items-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-sand-100, #F1F2F4)" strokeWidth="14" />
            {total > 0 && parts.filter((p) => p.n > 0).map((p) => {
              const len = (c * p.n) / total;
              const el = <circle key={p.label} cx="50" cy="50" r={r} fill="none" stroke={p.couleur} strokeWidth="14" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
              offset += len;
              return el;
            })}
          </svg>
          <span className="relative text-center leading-tight">
            <span className="block font-(family-name:--font-jakarta) text-[22px] font-extrabold tabular-nums text-[#14254E] dark:text-(--color-ink)">{total.toLocaleString('fr-FR')}</span>
            <span className="block text-[10px] text-(--color-ink-soft)">items étudiés</span>
          </span>
        </span>
        <ul className="min-w-0 flex-1 space-y-1.5 text-[12px]">
          {parts.map((p) => (
            <li key={p.label} className="flex items-center justify-between gap-2">
              <span className="inline-flex min-w-0 items-center gap-1.5">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.couleur }} aria-hidden />
                <span className="truncate text-(--color-ink)">{p.label} ({p.n.toLocaleString('fr-FR')})</span>
              </span>
              <span className="font-bold tabular-nums text-(--color-ink-soft)">{total > 0 ? Math.round((p.n / total) * 100) : 0} %</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-auto border-t border-(--color-border) pt-2.5 text-[12px] text-(--color-ink-soft)">
        Total étudié : <strong className="text-[#14254E] dark:text-(--color-ink)">{total.toLocaleString('fr-FR')}</strong> / {contenuTotal.toLocaleString('fr-FR')}
      </p>
    </>
  );
}

function Specialite({ nom, pct }: { nom: string; pct: number }) {
  const { Icon, accent, bg } = getSpecialtyTheme(nom);
  return (
    <li className="flex items-center gap-2.5">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg" style={{ background: bg, color: accent }} aria-hidden><Icon className="h-3.5 w-3.5" /></span>
      <span className="w-24 shrink-0 truncate text-[12.5px] text-(--color-ink) sm:w-28" title={nom}>{nom}</span>
      <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-(--color-sand-100) dark:bg-white/10" aria-hidden>
        <span className="block h-full rounded-full bg-green-600" style={{ width: `${pct}%` }} />
      </span>
      <span className="w-10 shrink-0 text-right text-[12.5px] font-bold tabular-nums text-(--color-ink)">{pct} %</span>
    </li>
  );
}

export function MesStatistiques({ jours, cours, aujourdhui, specialites, contenuTotal, qLabel }: {
  jours: JourActivite[] | null;
  /** Dates (AAAA-MM-JJ) de dernière consultation des cours. */
  cours: string[];
  aujourdhui: string;
  specialites: { id: string; nom: string; pct: number }[];
  contenuTotal: number;
  qLabel: string;
}) {
  const [periode, setPeriode] = useState<Periode>(30);
  const { serie, parts, total } = useMemo(() => {
    const debut = decaler(aujourdhui, -(periode - 1));
    const parJour = new Map((jours ?? []).map((j) => [j.d, j]));
    const serie = Array.from({ length: periode }, (_, i) => { const d = decaler(debut, i); return { d, h: (parJour.get(d)?.s ?? 0) / 3600 }; });
    const dans = (jours ?? []).filter((j) => j.d >= debut && j.d <= aujourdhui);
    const somme = (k: keyof Pick<JourActivite, 'qcm' | 'cas' | 'fc' | 'transv' | 'epreuves'>) => dans.reduce((s, j) => s + (j[k] ?? 0), 0);
    const parts = [
      { label: qLabel, n: somme('qcm') + somme('cas'), couleur: '#C0112E' },
      { label: 'Flashcards', n: somme('fc'), couleur: '#E8742C' },
      { label: 'Cours', n: cours.filter((d) => d >= debut && d <= aujourdhui).length, couleur: '#2563EB' },
      { label: 'Révisions transversales', n: somme('transv'), couleur: '#7C3AED' },
      { label: 'Épreuves blanches', n: somme('epreuves'), couleur: '#14254E' },
    ];
    return { serie, parts, total: parts.reduce((s, p) => s + p.n, 0) };
  }, [jours, cours, aujourdhui, periode, qLabel]);

  return (
    <Bloc
      numero={3} id="mes-statistiques" icon={BarChart3} titre="Mes statistiques"
      description="Analysez votre travail pour mieux progresser."
      action={(
        <label className="inline-flex items-center gap-2">
          <span className="sr-only">Période</span>
          <select
            value={periode}
            onChange={(e) => setPeriode(Number(e.target.value) as Periode)}
            className="h-9 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 text-[13px] font-semibold text-[#14254E] focus-ring dark:text-(--color-ink)"
          >
            {PERIODES.map((p) => <option key={p} value={p}>{p} derniers jours</option>)}
          </select>
        </label>
      )}
    >
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Carte>
          <TitreCarte icon={Clock}>Mon temps de travail</TitreCarte>
          {jours ? <TempsDeTravail jours={serie} /> : <p className="mt-4 text-[12.5px] text-(--color-ink-soft)">Temps de travail momentanément indisponible.</p>}
        </Carte>
        <Carte>
          <TitreCarte icon={Network}>Répartition de mon travail</TitreCarte>
          <Repartition parts={parts} total={total} contenuTotal={contenuTotal} />
        </Carte>
        <Carte>
          <TitreCarte icon={Trophy} action={<Link href="/facultes" className={lienCarte}>Voir toutes <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>}>Maîtrise par spécialité</TitreCarte>
          {specialites.length === 0 ? (
            <p className="mt-4 text-[12.5px] text-(--color-ink-soft)">Vos spécialités apparaîtront ici dès vos premiers entraînements.</p>
          ) : (
            <ul className="mt-3 space-y-2.5">
              {specialites.slice(0, 5).map((s) => <Specialite key={s.id} nom={s.nom} pct={s.pct} />)}
            </ul>
          )}
        </Carte>
      </div>
    </Bloc>
  );
}
