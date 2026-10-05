import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, CalendarCheck, ClipboardList, History, Info } from 'lucide-react';
import { requireSuiviPage } from '@/lib/suivi/roles';
import { createAdminClient } from '@/lib/supabase/admin';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { parseScope } from '@/lib/auth/permissions';
import { chargerEvaluations, chargerJournal, chargerPrevues, elevesVisibles, nomsMatieres, volumeEntrainement } from '@/lib/evaluations/historique';
import {
  CHAMP_LABEL, MENTION_TRACABILITE, RAISON_ARCHIVE, filtrer, filtresDepuisQuery, formatHeure, formatJour, formatPourcentage,
  libellePeriode, pointsCourbe, valeurLisible,
} from '@/lib/evaluations/historique-core';
import { HistoriqueAdmin } from '@/components/admin/resultats/historique-admin';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Résultats d’un candidat' };

const champ = 'h-10 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-ink)';

/**
 * Fiche « Évaluations & progression » d'un candidat (cahier des charges
 * 06/10/2026) : courbe, historique de toutes les tentatives (archivées
 * comprises), évaluations prévues non réalisées, volume d'entraînement,
 * journal de traçabilité (corrections et archives), exports par période.
 * Lecture : administrateurs et équipe du suivi ; correction : administrateurs.
 */
export default async function ResultatsElevePage({ params, searchParams }: { params: Promise<{ userId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const actor = await requireSuiviPage('view');
  const { userId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(userId)) notFound();
  const f = filtresDepuisQuery(await searchParams);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = createAdminClient() as any;
  const { data: eleve } = await db.from('profiles')
    .select('id, first_name, last_name, email, phone, promotion, permission_scope, role, created_at')
    .eq('id', userId).eq('faculte_id', EDN_FACULTE_ID).maybeSingle();
  if (!eleve) notFound();
  const visibles = await elevesVisibles(actor);
  if (visibles && !visibles.has(userId)) notFound();

  const [toutes, journal, noms, volume] = await Promise.all([
    chargerEvaluations({ userId, entrainement: true }),
    chargerJournal(userId),
    nomsMatieres(),
    volumeEntrainement(userId),
  ]);
  const prevues = await chargerPrevues(eleve, toutes);
  const periode = filtrer(toutes, { du: f.du, au: f.au, entrainement: true });
  const evals = periode.filter((e) => e.type !== 'entrainement');
  const points = pointsCourbe(evals);
  const transversales = periode.filter((e) => e.type === 'entrainement' && e.pourcentage !== null);
  const scope = parseScope(eleve.permission_scope);
  const specialites = scope.type === 'all' ? 'Toute l’offre' : scope.colleges.map((c) => noms.get(c) ?? c).join(', ') || '—';
  const nom = [eleve.first_name, eleve.last_name].filter(Boolean).join(' ') || eleve.email;
  const matieres = Object.fromEntries(noms);
  const query = new URLSearchParams({ user: userId, ...(f.du ? { du: f.du } : {}), ...(f.au ? { au: f.au } : {}) }).toString();

  // Intitulé de l'évaluation visée par une ligne du journal.
  const intitulePar = new Map<string, string>();
  for (const e of toutes) {
    if (e.archiveId) intitulePar.set(`archive:${e.archiveId}`, `${e.intitule} (${formatJour(e.date)})`);
    else intitulePar.set(e.sourceId, `${e.intitule} (${formatJour(e.date)})`);
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/admin/resultats" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-(--color-ink-soft) hover:text-(--color-ink)">
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Résultats & évaluations
      </Link>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-(--color-border) pb-5">
        <div className="min-w-0">
          <p className="text-xs font-medium text-(--color-ink-muted)">Évaluations & progression</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-(--color-ink)">{nom}</h1>
          <p className="mt-0.5 text-sm text-(--color-ink-soft)">
            {eleve.email}{eleve.promotion ? ` · promotion ${eleve.promotion}` : ''}{scope.voie ? ` · voie ${scope.voie}` : ''}
          </p>
          <p className="mt-0.5 text-sm text-(--color-ink-soft)">Spécialité(s) : {specialites}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/suivi/eleves/${userId}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 text-[13px] font-semibold text-(--color-ink) hover:border-(--color-accent) hover:text-(--color-accent)">
            <CalendarCheck className="h-4 w-4" aria-hidden /> Fiche de suivi
          </Link>
        </div>
      </header>

      <form method="get" className="mb-5 flex flex-wrap items-end gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
        <label className="grid gap-1 text-xs font-semibold text-(--color-ink-soft)">Du<input type="date" name="du" defaultValue={f.du ?? ''} className={champ} /></label>
        <label className="grid gap-1 text-xs font-semibold text-(--color-ink-soft)">Au<input type="date" name="au" defaultValue={f.au ?? ''} className={champ} /></label>
        <button type="submit" className="inline-flex h-10 items-center rounded-lg bg-(--color-primary) px-4 text-sm font-semibold text-white">Appliquer la période</button>
        {(f.du || f.au) && <Link href={`/admin/resultats/eleve/${userId}`} className="inline-flex h-10 items-center text-sm font-semibold text-(--color-ink-soft) hover:text-(--color-ink)">Toute la période</Link>}
        <p className="ml-auto text-xs text-(--color-ink-muted)">Période : {libellePeriode(f)} — la courbe, le tableau et les exports la reprennent.</p>
      </form>

      <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          ['Évaluations terminées', String(evals.filter((e) => e.statut === 'termine').length)],
          ['Non terminées', String(evals.filter((e) => e.statut === 'non_termine').length)],
          ['Dernier résultat', points.length ? formatPourcentage(points[points.length - 1].pourcentage) : '—'],
          ['Prévues non réalisées', String(prevues.length)],
          ['Questions d’entraînement (30 j)', volume.j30.toLocaleString('fr-FR')],
        ].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
            <p className="text-xs font-medium text-(--color-ink-muted)">{l}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-(--color-ink)">{v}</p>
          </div>
        ))}
      </section>

      <HistoriqueAdmin evaluations={periode} matieres={matieres} peutCorriger={actor.profile.role === 'admin'} query={query} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section aria-labelledby="prevues" className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <h2 id="prevues" className="flex items-center gap-2 text-base font-semibold text-(--color-ink)"><ClipboardList className="h-4 w-4" aria-hidden /> Évaluations prévues non réalisées</h2>
          {prevues.length === 0 ? <p className="mt-3 text-sm text-(--color-ink-soft)">Aucune : tout ce qui est prévu à ce jour a été fait.</p> : (
            <ul className="mt-3 divide-y divide-(--color-border)">
              {prevues.slice(0, 40).map((p) => (
                <li key={p.cle} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 py-2 text-sm">
                  <span className="min-w-0"><span className="text-xs font-semibold text-(--color-ink-muted)">{p.nature}</span><span className="block font-medium text-(--color-ink)">{p.lien ? <Link href={p.lien} className="hover:underline">{p.intitule}</Link> : p.intitule}</span></span>
                  <span className="text-xs text-(--color-ink-soft)">{p.etat}</span>
                </li>
              ))}
              {prevues.length > 40 && <li className="py-2 text-xs text-(--color-ink-muted)">… et {prevues.length - 40} autre(s).</li>}
            </ul>
          )}
        </section>

        <section aria-labelledby="entrainement" className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
          <h2 id="entrainement" className="text-base font-semibold text-(--color-ink)">Entraînement (hors évaluations)</h2>
          <dl className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div><dt className="text-xs text-(--color-ink-muted)">Questions — 7 jours</dt><dd className="text-lg font-semibold tabular-nums text-(--color-ink)">{volume.j7.toLocaleString('fr-FR')}</dd></div>
            <div><dt className="text-xs text-(--color-ink-muted)">Questions — 30 jours</dt><dd className="text-lg font-semibold tabular-nums text-(--color-ink)">{volume.j30.toLocaleString('fr-FR')}</dd></div>
            <div><dt className="text-xs text-(--color-ink-muted)">Questions — total</dt><dd className="text-lg font-semibold tabular-nums text-(--color-ink)">{volume.total.toLocaleString('fr-FR')}</dd></div>
          </dl>
          <p className="mt-4 text-sm text-(--color-ink-soft)">
            Révisions transversales du quotidien sur la période : <strong className="text-(--color-ink)">{transversales.length}</strong>
            {transversales.length > 0 && <> · taux moyen de bonnes réponses <strong className="text-(--color-ink)">{formatPourcentage(Math.round(transversales.reduce((s, e) => s + (e.pourcentage ?? 0), 0) / transversales.length * 10) / 10)}</strong></>}
            . Elles s’affichent dans l’historique avec la case « Inclure les révisions transversales du quotidien ».
          </p>
        </section>
      </div>

      <section aria-labelledby="journal" className="mt-6 rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
        <h2 id="journal" className="flex items-center gap-2 text-base font-semibold text-(--color-ink)"><History className="h-4 w-4" aria-hidden /> Journal de traçabilité</h2>
        <p className="mt-1 text-sm text-(--color-ink-soft)">Toute modification d’une note définitive et toute tentative remplacée, réinitialisée ou supprimée y sont inscrites automatiquement, avec la date, l’auteur et le motif. Ce journal ne se modifie pas.</p>
        {journal.corrections.length === 0 && journal.archives.length === 0 ? (
          <p className="mt-3 text-sm text-(--color-ink-muted)">Aucune modification ni suppression enregistrée pour ce candidat.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-(--color-border) text-xs text-(--color-ink-muted)">
                  <th className="py-2 pr-3 font-semibold">Date</th>
                  <th className="px-3 py-2 font-semibold">Évaluation</th>
                  <th className="px-3 py-2 font-semibold">Opération</th>
                  <th className="px-3 py-2 font-semibold">Auteur</th>
                  <th className="py-2 pl-3 font-semibold">Motif</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ...journal.corrections.map((c) => ({
                    cle: `c:${c.id}`, le: c.le, evaluation: intitulePar.get(c.sourceId) ?? 'Évaluation',
                    operation: `${CHAMP_LABEL[c.champ] ?? c.champ} : ${valeurLisible(c.ancienne)} → ${valeurLisible(c.nouvelle)}`,
                    auteur: c.auteur ?? 'Traitement automatique', motif: c.motif,
                  })),
                  ...journal.archives.map((a) => ({
                    cle: `a:${a.id}`, le: a.le, evaluation: intitulePar.get(`archive:${a.id}`) ?? String(a.contexte.titre ?? 'Évaluation'),
                    operation: `${RAISON_ARCHIVE[a.raison] ?? a.raison} — tentative archivée`,
                    auteur: a.auteur ?? (a.raison === 'nouvelle_tentative' ? 'Nouvelle tentative de l’élève' : 'Traitement automatique'), motif: a.motif,
                  })),
                ].sort((x, y) => y.le.localeCompare(x.le)).map((l) => (
                  <tr key={l.cle} className="border-b border-(--color-border) align-top last:border-0">
                    <td className="whitespace-nowrap py-2 pr-3 tabular-nums text-(--color-ink)">{formatJour(l.le)} {formatHeure(l.le)}</td>
                    <td className="px-3 py-2 text-(--color-ink)">{l.evaluation}</td>
                    <td className="px-3 py-2 text-(--color-ink-soft)">{l.operation}</td>
                    <td className="px-3 py-2 text-(--color-ink-soft)">{l.auteur}</td>
                    <td className="py-2 pl-3 text-(--color-ink-soft)">{l.motif ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 flex items-start gap-2 text-xs text-(--color-ink-muted)"><Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden /> {MENTION_TRACABILITE}</p>
    </main>
  );
}
