import Link from 'next/link';
import { ArrowRight, Info } from 'lucide-react';
import { requireSuiviPage } from '@/lib/suivi/roles';
import { chargerEvaluations, elevesVisibles, nomsMatieres, promotions } from '@/lib/evaluations/historique';
import {
  MENTION_TRACABILITE, STATUT_LABEL, TYPE_COULEUR, TYPE_COURT, TYPES_ORDRE, filtresDepuisQuery, formatDuree, formatHeure,
  formatJour, formatNote, formatPourcentage, libellePeriode, lienDetail, precisionEtat,
} from '@/lib/evaluations/historique-core';
import { BoutonsExport } from '@/components/admin/resultats/historique-admin';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Résultats & évaluations' };

const AFFICHAGE = 300;
const champ = 'h-10 w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-ink)';
const etiquette = 'grid gap-1 text-xs font-semibold text-(--color-ink-soft)';

/**
 * Résultats & évaluations (administration) : toutes les tentatives de tous
 * les candidats — Check-up, épreuves blanches, interrogations, réévaluations,
 * Parcours du Major, et sur demande les révisions transversales — filtrables
 * par période, nature, spécialité, statut, promotion et candidat, exportables
 * (PDF, Excel, CSV) sur la même sélection. Chaque candidat ouvre sa fiche.
 */
export default async function ResultatsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requireSuiviPage('view');
  const sp = await searchParams;
  const f = filtresDepuisQuery(sp);
  const promotion = typeof sp.promotion === 'string' && sp.promotion ? sp.promotion : null;
  const recherche = typeof sp.q === 'string' && sp.q.trim() ? sp.q.trim() : null;

  const [brutes, noms, promos, visibles] = await Promise.all([
    chargerEvaluations({ ...f, promotion, recherche }),
    nomsMatieres(),
    promotions(),
    elevesVisibles(actor),
  ]);
  const liste = visibles ? brutes.filter((e) => visibles.has(e.userId)) : brutes;
  const candidats = new Set(liste.map((e) => e.userId)).size;
  const notees = liste.filter((e) => e.statut === 'termine' && e.pourcentage !== null);
  const moyenne = notees.length ? Math.round((notees.reduce((s, e) => s + e.pourcentage!, 0) / notees.length) * 10) / 10 : null;

  const query = new URLSearchParams(
    Object.entries({ du: f.du, au: f.au, type: f.types?.join(',') || null, entrainement: f.entrainement ? '1' : null, specialite: f.specialite, statut: f.statut, promotion, q: recherche })
      .filter((x): x is [string, string] => !!x[1]),
  ).toString();
  const specialites = [...noms.entries()].sort((a, b) => a[1].localeCompare(b[1], 'fr'));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-(--color-border) pb-5">
        <div>
          <p className="text-xs font-medium text-(--color-ink-muted)">Suivi & analyse</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">Résultats & évaluations</h1>
          <p className="mt-0.5 max-w-3xl text-sm text-(--color-ink-soft)">
            Toutes les évaluations des candidats, chaque tentative conservée : Check-up, épreuves blanches, interrogations, réévaluations et Parcours du Major. Ouvrez un candidat pour sa courbe de progression, ses évaluations prévues et le journal des corrections.
          </p>
        </div>
        <BoutonsExport query={query} />
      </header>

      <form method="get" className="mb-5 grid gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        <label className={etiquette}>Du<input type="date" name="du" defaultValue={f.du ?? ''} className={champ} /></label>
        <label className={etiquette}>Au<input type="date" name="au" defaultValue={f.au ?? ''} className={champ} /></label>
        <label className={etiquette}>Nature
          <select name="type" defaultValue={f.types?.length === 1 ? f.types[0] : ''} className={champ}>
            <option value="">Toutes les évaluations</option>
            {TYPES_ORDRE.map((t) => <option key={t} value={t}>{TYPE_COURT[t]}</option>)}
          </select>
        </label>
        <label className={etiquette}>Spécialité
          <select name="specialite" defaultValue={f.specialite ?? ''} className={champ}>
            <option value="">Toutes</option>
            {specialites.map(([id, nom]) => <option key={id} value={id}>{nom}</option>)}
          </select>
        </label>
        <label className={etiquette}>Statut
          <select name="statut" defaultValue={f.statut ?? ''} className={champ}>
            <option value="">Tous</option>
            {(['termine', 'commence', 'non_termine'] as const).map((s) => <option key={s} value={s}>{STATUT_LABEL[s]}</option>)}
          </select>
        </label>
        <label className={etiquette}>Promotion
          <select name="promotion" defaultValue={promotion ?? ''} className={champ}>
            <option value="">Toutes</option>
            {promos.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </label>
        <label className={`${etiquette} xl:col-span-2`}>Candidat (nom, prénom ou e-mail)<input type="search" name="q" defaultValue={recherche ?? ''} className={champ} placeholder="Rechercher un candidat" /></label>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4 xl:col-span-8">
          <label className="inline-flex items-center gap-2 text-sm text-(--color-ink-soft)">
            <input type="checkbox" name="entrainement" value="1" defaultChecked={!!f.entrainement} className="h-4 w-4 accent-[#E4002B]" />
            Inclure les révisions transversales du quotidien (entraînement)
          </label>
          <button type="submit" className="ml-auto inline-flex h-10 items-center rounded-lg bg-(--color-primary) px-4 text-sm font-semibold text-white">Filtrer</button>
          <Link href="/admin/resultats" className="inline-flex h-10 items-center text-sm font-semibold text-(--color-ink-soft) hover:text-(--color-ink)">Réinitialiser</Link>
        </div>
      </form>

      <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ['Évaluations', liste.length.toLocaleString('fr-FR')],
          ['Candidats', candidats.toLocaleString('fr-FR')],
          ['Terminées', liste.filter((e) => e.statut === 'termine').length.toLocaleString('fr-FR')],
          ['Non terminées / en cours', liste.filter((e) => e.statut !== 'termine').length.toLocaleString('fr-FR')],
          ['Résultat moyen', moyenne === null ? '—' : formatPourcentage(moyenne)],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
            <p className="text-xs font-medium text-(--color-ink-muted)">{l}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-(--color-ink)">{v}</p>
          </div>
        ))}
      </section>

      <p className="mb-2 text-xs text-(--color-ink-muted)">Période : {libellePeriode(f)}{liste.length > AFFICHAGE ? ` — ${AFFICHAGE} premières lignes affichées sur ${liste.length.toLocaleString('fr-FR')} ; les exports contiennent tout.` : ''}</p>
      <div className="overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-surface)">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead>
            <tr className="border-b border-(--color-border) bg-(--color-surface-soft) text-xs font-semibold text-(--color-ink-muted)">
              <th className="py-2.5 pl-4 pr-3">Date</th>
              <th className="px-3 py-2.5">Candidat</th>
              <th className="px-3 py-2.5">Évaluation</th>
              <th className="px-3 py-2.5">Statut</th>
              <th className="px-3 py-2.5">Résultat</th>
              <th className="px-3 py-2.5">Durée</th>
              <th className="py-2.5 pl-3 pr-4"><span className="sr-only">Détail</span></th>
            </tr>
          </thead>
          <tbody>
            {liste.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-(--color-ink-soft)">Aucune évaluation pour ces critères.</td></tr>}
            {liste.slice(0, AFFICHAGE).map((e) => {
              const lien = lienDetail(e, 'admin');
              const nom = [e.prenom, e.nom].filter(Boolean).join(' ') || e.email || 'Candidat';
              return (
                <tr key={e.cle} className="border-b border-(--color-border) align-top last:border-0">
                  <td className="whitespace-nowrap py-2.5 pl-4 pr-3 tabular-nums"><span className="text-(--color-ink)">{formatJour(e.date)}</span><span className="block text-xs text-(--color-ink-muted)">{formatHeure(e.date)}</span></td>
                  <td className="px-3 py-2.5">
                    <Link href={`/admin/resultats/eleve/${e.userId}`} className="font-medium text-(--color-ink) hover:underline">{nom}</Link>
                    <span className="block text-xs text-(--color-ink-muted)">{e.promotion ? `promo ${e.promotion}` : e.email}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-(--color-ink-soft)"><span className="h-2 w-2 rounded-full" style={{ background: TYPE_COULEUR[e.type] }} aria-hidden />{TYPE_COURT[e.type]}{e.archive ? ' · archivée' : ''}</span>
                    <span className="block text-(--color-ink)">{e.intitule}</span>
                    {e.specialite && <span className="block text-xs text-(--color-ink-muted)">{e.specialite}</span>}
                  </td>
                  <td className="px-3 py-2.5"><span className="text-(--color-ink)">{STATUT_LABEL[e.statut]}</span>{precisionEtat(e) && <span className="block text-xs text-(--color-ink-muted)">{precisionEtat(e)}</span>}</td>
                  <td className="px-3 py-2.5 tabular-nums">{e.statut === 'termine' && e.pourcentage !== null ? <><span className="font-semibold text-(--color-ink)">{formatPourcentage(e.pourcentage)}</span><span className="block text-xs text-(--color-ink-muted)">{formatNote(e)}</span></> : <span className="text-(--color-ink-muted)">—</span>}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-(--color-ink-soft)">{formatDuree(e.dureeSecondes)}</td>
                  <td className="py-2.5 pl-3 pr-4 text-right">
                    <Link href={lien ?? `/admin/resultats/eleve/${e.userId}`} className="inline-flex items-center gap-1 text-xs font-semibold text-(--color-primary) hover:underline">
                      {lien ? 'Détail' : 'Fiche'} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-6 flex items-start gap-2 text-xs text-(--color-ink-muted)"><Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden /> {MENTION_TRACABILITE}</p>
    </main>
  );
}
