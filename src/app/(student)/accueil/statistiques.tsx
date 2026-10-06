'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BarChart3, Network, Trophy } from 'lucide-react';
import { ActiviteChart } from '@/components/student/activite-chart';
import type { JourActivite } from '@/lib/student/activite';
import { getSpecialtyTheme } from '@/lib/data/specialty-icons';
import { Bloc, Carte, TitreCarte, lienCarte } from './ui';

/**
 * Section 3 de l'accueil — « Mes statistiques » : « Votre activité » (temps
 * de travail jour par jour, mesuré par le battement des pages d'étude, avec
 * son propre choix de période et le bilan de la semaine), la répartition du
 * travail (7, 30 ou 90 jours) et la maîtrise par spécialité (état actuel).
 */

const PERIODES = [7, 30, 90] as const;
type Periode = (typeof PERIODES)[number];

const decaler = (jour: string, n: number) => {
  const d = new Date(`${jour}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
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
  const { parts, total } = useMemo(() => {
    const debut = decaler(aujourdhui, -(periode - 1));
    const dans = (jours ?? []).filter((j) => j.d >= debut && j.d <= aujourdhui);
    const somme = (k: keyof Pick<JourActivite, 'qcm' | 'cas' | 'fc' | 'transv' | 'epreuves'>) => dans.reduce((s, j) => s + (j[k] ?? 0), 0);
    const parts = [
      { label: qLabel, n: somme('qcm') + somme('cas'), couleur: '#C0112E' },
      { label: 'Flashcards', n: somme('fc'), couleur: '#E8742C' },
      { label: 'Cours', n: cours.filter((d) => d >= debut && d <= aujourdhui).length, couleur: '#2563EB' },
      { label: 'Révisions transversales', n: somme('transv'), couleur: '#7C3AED' },
      { label: 'Épreuves blanches', n: somme('epreuves'), couleur: '#14254E' },
    ];
    return { parts, total: parts.reduce((s, p) => s + p.n, 0) };
  }, [jours, cours, aujourdhui, periode, qLabel]);

  const selecteur = (
    <label className="inline-flex items-center">
      <span className="sr-only">Période de la répartition</span>
      <select
        value={periode}
        onChange={(e) => setPeriode(Number(e.target.value) as Periode)}
        className="h-8 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 text-[12px] font-semibold text-[#14254E] focus-ring dark:text-(--color-ink)"
      >
        {PERIODES.map((p) => <option key={p} value={p}>{p} derniers jours</option>)}
      </select>
    </label>
  );

  return (
    <Bloc numero={3} id="mes-statistiques" icon={BarChart3} titre="Mes statistiques" description="Analysez votre travail pour mieux progresser.">
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Carte className="min-h-[300px]">
          <ActiviteChart jours={jours} />
        </Carte>
        <div className="flex min-w-0 flex-col gap-3">
          <Carte>
            <TitreCarte icon={Network} action={selecteur}>Répartition de mon travail</TitreCarte>
            <Repartition parts={parts} total={total} contenuTotal={contenuTotal} />
          </Carte>
          <Carte className="flex-1">
            <TitreCarte icon={Trophy} action={<Link href="/facultes" className={lienCarte}>Voir toutes <ArrowRight className="h-3.5 w-3.5" aria-hidden /></Link>}>Maîtrise par spécialité</TitreCarte>
            {specialites.length === 0 ? (
              <p className="mt-4 text-[12.5px] text-(--color-ink-soft)">Vos spécialités apparaîtront ici dès vos premiers entraînements.</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {specialites.slice(0, 5).map((sp) => <Specialite key={sp.id} nom={sp.nom} pct={sp.pct} />)}
              </ul>
            )}
          </Carte>
        </div>
      </div>
    </Bloc>
  );
}
