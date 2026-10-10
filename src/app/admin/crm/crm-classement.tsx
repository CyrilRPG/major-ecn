'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Brain, FileText, Loader2, Medal, Search, Trophy, Video, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { OFFER_KEYS, OFFER_SHORT_LABEL } from '@/lib/suivi/types';
import {
  CRITERES, LIBELLE_CRITERE, POIDS_CLASSEMENT, classer,
  type CritereClassement, type EleveClassement, type LigneClassee,
} from '@/lib/crm/classement';
import { chargerClassement, type PeriodeClassement } from './classement-actions';

type FiltreFormule = 'payantes' | 'toutes' | (typeof OFFER_KEYS)[number];
type FiltreVoie = 'toutes' | 'interne' | 'externe';
type Vue = 'tableau' | 'specialites' | 'formules';

const PERIODES: { key: PeriodeClassement; label: string }[] = [
  { key: 'tout', label: 'Depuis le début' },
  { key: '30j', label: '30 derniers jours' },
  { key: '7j', label: '7 derniers jours' },
];

const ICONE: Record<CritereClassement, typeof Video> = {
  videos: Video,
  questions: BookOpen,
  fiches: FileText,
  flashcards: Brain,
};

const COULEUR: Record<CritereClassement, string> = {
  videos: '#3B82F6',
  questions: '#F97316',
  fiches: '#10B981',
  flashcards: '#8B5CF6',
};

const MEDAILLE = ['#D4A017', '#9CA3AF', '#B87333'];

function formatRelatif(iso: string | null) {
  if (!iso) return '—';
  const jours = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (jours <= 0) return 'Aujourd’hui';
  if (jours === 1) return 'Hier';
  return `Il y a ${jours} j`;
}

function aLaFormule(e: EleveClassement, f: FiltreFormule): boolean {
  if (f === 'toutes') return true;
  if (f === 'payantes') return e.formules.some((o) => o !== 'decouverte');
  return e.formules.includes(f);
}

function libelleFormules(formules: string[]): string {
  return [...formules]
    .sort((a, b) => OFFER_KEYS.indexOf(a as never) - OFFER_KEYS.indexOf(b as never))
    .map((o) => OFFER_SHORT_LABEL[o] ?? o)
    .join(' + ');
}

function Rang({ rang }: { rang: number }) {
  if (rang <= 3) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: MEDAILLE[rang - 1] }}>
        {rang}
      </span>
    );
  }
  return <span className="inline-flex h-7 w-7 items-center justify-center text-sm font-semibold tabular-nums text-gray-500">{rang}</span>;
}

function BarreScore({ ligne }: { ligne: LigneClassee }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-right text-sm font-bold tabular-nums text-gray-900">{ligne.score}</span>
      <div
        className="flex h-2 w-24 overflow-hidden rounded-full bg-gray-100"
        title={CRITERES.map((c) => `${LIBELLE_CRITERE[c]} : ${ligne.detail[c]} / ${POIDS_CLASSEMENT[c]}`).join('\n')}
      >
        {CRITERES.map((c) => (
          <div key={c} style={{ width: `${ligne.detail[c]}%`, background: COULEUR[c] }} />
        ))}
      </div>
    </div>
  );
}

export function CrmClassement() {
  const [periode, setPeriode] = useState<PeriodeClassement>('tout');
  const [cache, setCache] = useState<Partial<Record<PeriodeClassement, EleveClassement[]>>>({});
  const [erreurs, setErreurs] = useState<Partial<Record<PeriodeClassement, string>>>({});

  const [specialite, setSpecialite] = useState('toutes');
  const [formule, setFormule] = useState<FiltreFormule>('payantes');
  const [voie, setVoie] = useState<FiltreVoie>('toutes');
  const [vue, setVue] = useState<Vue>('tableau');
  const [recherche, setRecherche] = useState('');
  const [limite, setLimite] = useState(100);

  // Chargé à la première ouverture de chaque période, puis gardé en mémoire.
  const charge = cache[periode] !== undefined;
  const erreur = erreurs[periode] ?? null;
  const pending = !charge && !erreur;
  useEffect(() => {
    if (charge || erreur) return;
    let annule = false;
    chargerClassement(periode).then(
      (r) => {
        if (annule) return;
        if (r.ok) setCache((c) => ({ ...c, [periode]: r.eleves }));
        else setErreurs((e) => ({ ...e, [periode]: r.error }));
      },
      () => { if (!annule) setErreurs((e) => ({ ...e, [periode]: 'Classement indisponible pour le moment.' })); },
    );
    return () => { annule = true; };
  }, [periode, charge, erreur]);

  const eleves = useMemo(() => cache[periode] ?? [], [cache, periode]);

  // Spécialités présentes : clé normalisée → libellé le plus fréquent.
  const specialites = useMemo(() => {
    const parCle = new Map<string, Map<string, number>>();
    for (const e of eleves) {
      e.specialitesCles.forEach((k, i) => {
        const m = parCle.get(k) ?? new Map<string, number>();
        m.set(e.specialites[i], (m.get(e.specialites[i]) ?? 0) + 1);
        parCle.set(k, m);
      });
    }
    return [...parCle.entries()]
      .map(([cle, libelles]) => {
        const tri = [...libelles.entries()].sort((a, b) => b[1] - a[1]);
        return { cle, libelle: tri[0][0], total: tri.reduce((s, [, n]) => s + n, 0) };
      })
      .sort((a, b) => a.libelle.localeCompare(b.libelle, 'fr'));
  }, [eleves]);

  const dansFiltres = useMemo(
    () => (e: EleveClassement, spe = specialite, form = formule) =>
      (spe === 'toutes' || e.specialitesCles.includes(spe))
      && aLaFormule(e, form)
      && (voie === 'toutes' || e.voie === voie),
    [specialite, formule, voie],
  );

  // Le classement porte sur le GROUPE filtré ; la recherche par nom ne fait
  // que retrouver un élève, sans changer les rangs.
  const classement = useMemo(() => classer(eleves.filter((e) => dansFiltres(e))), [eleves, dansFiltres]);
  const affiches = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return classement;
    return classement.filter((l) => l.nom.toLowerCase().includes(q) || (l.email ?? '').toLowerCase().includes(q));
  }, [classement, recherche]);

  const podiums = useMemo(() => {
    if (vue === 'specialites') {
      return specialites
        .map((s) => ({ titre: s.libelle, lignes: classer(eleves.filter((e) => dansFiltres(e, s.cle))) }))
        .filter((g) => g.lignes.length > 0);
    }
    if (vue === 'formules') {
      const offres = formule === 'toutes' ? [...OFFER_KEYS]
        : formule === 'payantes' ? OFFER_KEYS.filter((o) => o !== 'decouverte')
        : [formule];
      return offres
        .map((o) => ({ titre: OFFER_SHORT_LABEL[o], lignes: classer(eleves.filter((e) => dansFiltres(e, specialite, o))) }))
        .filter((g) => g.lignes.length > 0);
    }
    return [];
  }, [vue, specialites, eleves, dansFiltres, formule, specialite]);

  const actifs = classement.filter((l) => l.score > 0).length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl px-6 py-7 sm:px-8"
        style={{ background: 'linear-gradient(135deg, #1E1145 0%, #E4002B 50%, #F97316 100%)' }}
      >
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Classement</h1>
              <p className="text-sm text-white/70">Qui travaille le plus, par spécialité et par formule</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CRITERES.map((c) => {
              const Icon = ICONE[c];
              return (
                <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
                  <Icon className="h-3.5 w-3.5" />
                  {LIBELLE_CRITERE[c]} · {POIDS_CLASSEMENT[c]} pts
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-gray-500">
        Score sur 100, calculé dans le groupe affiché : sur chaque critère, le meilleur du groupe obtient tous les points
        du critère (échelle logarithmique, pour qu’un très gros volume n’écrase pas le reste). Vidéos = vidéos vues ou
        séances émargées ; QCM · DP = questions différentes répondues ; fiches = fiches lues ; flashcards = révisions.
        {periode !== 'tout' && ' Sur une période, vidéos et fiches lues sont datées par la dernière visite de l’item.'}
      </p>

      {/* Période + vue */}
      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
          {PERIODES.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPeriode(p.key)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                periode === p.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1">
          {([
            { key: 'tableau' as const, label: 'Classement' },
            { key: 'specialites' as const, label: 'Podiums par spécialité' },
            { key: 'formules' as const, label: 'Podiums par formule' },
          ]).map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setVue(v.key)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                vue === v.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtres */}
      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <select
          aria-label="Spécialité"
          value={specialite}
          onChange={(e) => setSpecialite(e.target.value)}
          disabled={vue === 'specialites'}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#E4002B]/20 disabled:opacity-50"
        >
          <option value="toutes">Toutes les spécialités</option>
          {specialites.map((s) => <option key={s.cle} value={s.cle}>{s.libelle} ({s.total})</option>)}
        </select>
        <select
          aria-label="Formule"
          value={formule}
          onChange={(e) => setFormule(e.target.value as FiltreFormule)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#E4002B]/20"
        >
          <option value="payantes">Formules payantes</option>
          <option value="toutes">Toutes les formules (Découverte comprise)</option>
          {OFFER_KEYS.map((o) => <option key={o} value={o}>{OFFER_SHORT_LABEL[o]}</option>)}
        </select>
        <select
          aria-label="Voie"
          value={voie}
          onChange={(e) => setVoie(e.target.value as FiltreVoie)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#E4002B]/20"
        >
          <option value="toutes">Toutes les voies</option>
          <option value="interne">Voie interne</option>
          <option value="externe">Voie externe</option>
        </select>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Retrouver un élève…"
            disabled={vue !== 'tableau'}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-8 text-sm shadow-sm outline-none focus:ring-2 focus:ring-[#E4002B]/20 disabled:opacity-50"
          />
          {recherche && (
            <button type="button" aria-label="Effacer" onClick={() => setRecherche('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100">
              <X className="h-3.5 w-3.5 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {erreur ? (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">{erreur}</p>
      ) : pending && eleves.length === 0 ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Calcul du classement…
        </div>
      ) : vue === 'tableau' ? (
        <>
          <p className="mt-3 flex items-center gap-2 text-xs text-gray-500">
            {pending && <Loader2 className="h-3 w-3 animate-spin" />}
            {classement.length} élève{classement.length > 1 ? 's' : ''} dans le groupe · {actifs} avec une activité
            {recherche.trim() && ` · ${affiches.length} correspondant${affiches.length > 1 ? 's' : ''} à la recherche`}
          </p>
          <div className="mt-2 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-3 py-2.5">Rang</th>
                  <th className="px-3 py-2.5">Élève</th>
                  <th className="px-3 py-2.5">Score</th>
                  {CRITERES.map((c) => {
                    const Icon = ICONE[c];
                    return (
                      <th key={c} className="px-3 py-2.5 text-right">
                        <span className="inline-flex items-center gap-1"><Icon className="h-3 w-3" style={{ color: COULEUR[c] }} />{LIBELLE_CRITERE[c]}</span>
                      </th>
                    );
                  })}
                  <th className="px-3 py-2.5">Activité</th>
                </tr>
              </thead>
              <tbody>
                {affiches.slice(0, limite).map((l) => (
                  <tr key={l.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60">
                    <td className="px-3 py-2"><Rang rang={l.rang} /></td>
                    <td className="max-w-72 px-3 py-2">
                      <Link href={`/admin/suivi/candidats/${l.id}`} className="block truncate font-semibold text-gray-900 hover:text-[#E4002B] hover:underline">
                        {l.nom}
                      </Link>
                      <p className="truncate text-xs text-gray-500">
                        {[l.specialites.join(', ') || 'Spécialité non renseignée', libelleFormules(l.formules), l.voie ? `Voie ${l.voie}` : null].filter(Boolean).join(' · ')}
                      </p>
                    </td>
                    <td className="px-3 py-2"><BarreScore ligne={l} /></td>
                    <td className="px-3 py-2 text-right tabular-nums">{l.videos}</td>
                    <td className="px-3 py-2 text-right tabular-nums" title={`${l.series} série${l.series > 1 ? 's' : ''} terminée${l.series > 1 ? 's' : ''}`}>
                      {l.questions}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">{l.fiches}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{l.flashcards}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-gray-500">{formatRelatif(l.derniereActivite)}</td>
                  </tr>
                ))}
                {affiches.length === 0 && (
                  <tr><td colSpan={8} className="px-3 py-10 text-center text-sm text-gray-500">Aucun élève dans ce groupe.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {affiches.length > limite && (
            <button type="button" onClick={() => setLimite((n) => n + 200)} className="mt-3 w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
              Afficher la suite ({affiches.length - limite} restants)
            </button>
          )}
        </>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {podiums.map((g) => (
            <div key={g.titre} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="truncate text-sm font-bold text-gray-900">{g.titre}</h3>
                <span className="shrink-0 text-xs text-gray-500">{g.lignes.length} élève{g.lignes.length > 1 ? 's' : ''}</span>
              </div>
              <ol className="mt-3 space-y-2">
                {g.lignes.slice(0, 5).map((l) => (
                  <li key={l.id} className="flex items-center gap-2">
                    <Rang rang={l.rang} />
                    <Link href={`/admin/suivi/candidats/${l.id}`} className="min-w-0 flex-1 truncate text-sm text-gray-800 hover:text-[#E4002B] hover:underline">
                      {l.nom}
                    </Link>
                    <BarreScore ligne={l} />
                  </li>
                ))}
              </ol>
              {g.lignes.length > 0 && g.lignes[0].score === 0 && (
                <p className="mt-2 flex items-center gap-1 text-xs text-gray-400"><Medal className="h-3 w-3" /> Aucune activité sur la période.</p>
              )}
            </div>
          ))}
          {podiums.length === 0 && (
            <p className="col-span-full rounded-xl border-2 border-dashed border-gray-200 p-10 text-center text-sm text-gray-500">Aucun élève pour ces filtres.</p>
          )}
        </div>
      )}
    </div>
  );
}
