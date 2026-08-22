import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowRight, ClipboardCheck, Lightbulb, Lock, Pencil, ScrollText } from 'lucide-react';
import { requireUser, profPageReadGuard, canEditCoursContent, getProfessorScope } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { EmptyState } from '@/components/empty-state';
import { canAccessCollege, parseScope, scopeOffers } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { LockedTrainingsList } from '@/components/espace-decouverte/locked-trainings-list';
import { LockedSerieButton } from '@/components/espace-decouverte/locked-serie-button';
import { canWrite } from '@/lib/schemas/professor';
import { EditHintTooltip } from '@/components/professor/edit-hint-tooltip';
import { buildQcmAccessContext, canStudentReadSerie, SERIE_ACCESS_COLUMNS, type SerieAccessRow } from '@/lib/data/qcm-access';
import { estSerieAnnale, anneeDeSerieAnnale } from '@/lib/data/annales';
import { SerieCard } from '@/components/qcm/serie-card';

type SerieListRow = SerieAccessRow & {
  order_index: number;
  annee?: number | null;
  qcm_questions?: { id: string; format: string }[] | null;
};

export default async function CoursQcmListPage({ params }: { params: Promise<{ cours: string }> }) {
  const { cours: coursId } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: c, error: coursError } = await supabase
    .from('cours')
    .select(`id, titre, matiere_id, matieres(id, nom, semestre_id, semestres(id, label, faculte_id, facultes(id, nom)))`)
    .eq('id', coursId)
    .maybeSingle();
  // Une erreur SQL/RLS ne doit jamais être déguisée en 404 : elle doit remonter.
  if (coursError) throw coursError;
  if (!c || !c.matieres?.semestres) notFound();
  const scope = parseScope(profile.permission_scope);
  if (profile.role !== 'admin' && !canAccessCollege(scope, c.matiere_id)) redirect('/facultes');
  profPageReadGuard(profile, 'qcm', `/cours/${coursId}`);

  const isAdmin = profile.role === 'admin';
  // Le bouton doit refléter l'accès RÉEL à CET item : un professeur dont le
  // scope couvre le collège mais pas l'item n'a pas accès à /admin/contenu/<id>
  // (RLS `accessible_cours_ids`) — lui proposer le lien renvoyait un 404.
  const canEditQcm = canEditCoursContent(profile, 'qcm', c.matiere_id, c.id);
  // Prof habilité sur les QCM, mais cet item ne lui est pas attribué : on le dit
  // au lieu de faire disparaître le bouton sans explication.
  const qcmHorsPerimetre = !canEditQcm
    && profile.role === 'professor'
    && canWrite(getProfessorScope(profile.permission_scope), 'qcm');
  const access = isAdmin ? undefined : await fetchContentAccessForScope(scope);
  const showSeances = !access || access.seanceProf;
  const seriesTypes = showSeances ? ['qcm', 'seance', 'qroc'] : ['qcm', 'qroc'];

  // Client service-role : la RLS de `qcm_series` est récursive en production
  // (42P17) et faisait échouer la lecture. Le contrôle d'accès élève est
  // rejoué en application juste après (cf. lib/data/qcm-access), avec les
  // MÊMES règles que la page de série — sinon une série listée renvoie un 404
  // à l'ouverture.
  const { data: rawSeries, error: seriesError } = await createAdminClient()
    .from('qcm_series')
    .select(`${SERIE_ACCESS_COLUMNS}, order_index, annee, qcm_questions(id, format)` as 'id, label, order_index, type')
    .eq('cours_id', coursId)
    .in('type', seriesTypes)
    .order('order_index');
  if (seriesError) throw seriesError;
  const hideEntrainement = access && !access.entrainement;
  // Item dédié aux annales EVC : toutes ses séries sont des annales.
  const itemDAnnales = (rawSeries ?? []).length > 0
    && (rawSeries as SerieListRow[]).every((s) => estSerieAnnale(s.label));
  const userOffers = scopeOffers(scope);
  const accessCtx = await buildQcmAccessContext(profile, c.matiere_id);
  // Programme Approfondi : ordre pédagogique imposé dans l'onglet QCM/DP/QROC —
  //   séances du professeur → entraînements → DP (DP QCM interne / DP QROC externe)
  //   → QCM (voie interne) ou QROC (voie externe).
  const isApprofondi = userOffers.includes('approfondi');
  const categoryRank = (s: { label: string; type?: string | null }) => {
    if (s.type === 'seance') return 0;                 // Séance du professeur
    if (/entra[iî]nement/i.test(s.label)) return 1;    // Entraînement
    if (/^dp\b/i.test(s.label)) return 2;              // DP (couvre « DP … » et « DP QROC … »)
    if (/^annales?\b/i.test(s.label)) return 4;        // Annales EVC corrigées (après les banques)
    return 3;                                          // QCM / QROC de base
  };
  const series = ((rawSeries ?? []) as unknown as SerieListRow[])
    .filter((s) => !hideEntrainement || !/entra[iî]nement/i.test(s.label))
    .filter((s) => canStudentReadSerie(s, accessCtx, (s.qcm_questions ?? []).map((q) => q.format)))
    .sort((a, b) => {
      if (isApprofondi) {
        const ra = categoryRank(a);
        const rb = categoryRank(b);
        return ra !== rb ? ra - rb : a.order_index - b.order_index;
      }
      // Autres formules : séances d'abord, puis ordre d'affichage défini en admin.
      const ta = a.type === 'seance' ? 0 : 1;
      const tb = b.type === 'seance' ? 0 : 1;
      return ta !== tb ? ta - tb : a.order_index - b.order_index;
    });

  // Les annales ne se listent pas série par série : une session EVC compte
  // jusqu'à onze dossiers, et dix-sept sessions cohabitent sur un même item.
  // On passe donc par l'ANNÉE — l'élève choisit une année, puis l'annale.
  const annales = series.filter((s) => estSerieAnnale(s.label));
  const autres = series.filter((s) => !estSerieAnnale(s.label));
  const parAnnee = new Map<number, SerieListRow[]>();
  for (const s of annales) {
    const an = anneeDeSerieAnnale(s);
    if (an === null) { autres.push(s); continue; }   // année illisible : on la garde en liste
    parAnnee.set(an, [...(parAnnee.get(an) ?? []), s]);
  }
  const annees = [...parAnnee.entries()].sort(([a], [b]) => b - a);   // plus récente d'abord

  const { data: sessions } = await supabase
    .from('qcm_sessions')
    .select('id, serie_id, score_correct, score_total, finished_at')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false });

  const lastBySerie = new Map<string, { score_correct: number; score_total: number }>();
  for (const s of sessions ?? []) {
    if (!s.finished_at) continue;
    if (!lastBySerie.has(s.serie_id))
      lastBySerie.set(s.serie_id, { score_correct: s.score_correct, score_total: s.score_total });
  }
  /** Annales de l'année déjà faites, pour la pastille de progression. */
  const faitesParAnnee = new Map<number, number>();
  for (const [an, l] of parAnnee) faitesParAnnee.set(an, l.filter((s) => lastBySerie.has(s.id)).length);

  const isEntrainement = (label: string) => /entra[iî]nement/i.test(label);
  const isDp = (label: string) => /^dp\b/i.test(label);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 lg:px-8">
      {canEditQcm && (
        <div className="mb-3 flex items-center justify-end">
          <EditHintTooltip contentType="qcm" message="Gérez et modifiez les QCM de ce cours depuis le panneau d'administration.">
            <Link
              href={`/admin/contenu/${coursId}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs font-bold text-(--color-ink) hover:bg-(--color-sand-100)"
            >
              <Pencil className="h-3.5 w-3.5" /> Gérer les QCM
            </Link>
          </EditHintTooltip>
        </div>
      )}
      {qcmHorsPerimetre && (
        <div className="mb-3 flex items-start gap-2 rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2 text-xs text-(--color-ink-soft)">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>
            Cet item ne vous est pas attribué : vous le consultez en lecture seule.{' '}
            <Link href="/admin/contenu" className="font-semibold text-(--color-primary-deep) underline">
              Retrouvez les items que vous pouvez modifier
            </Link>{' '}
            dans « Administration › Contenu ».
          </p>
        </div>
      )}
      {/* Bandeau d'info : ampoule + tagline EVC. */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3 shadow-(--shadow-soft)">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FEF3E2] text-[#B26A00]">
          <Lightbulb className="h-4.5 w-4.5" />
        </span>
        <p className="text-sm text-(--color-ink-soft)">
          Chaque proposition est corrigée et justifiée immédiatement, au format EVC.
        </p>
      </div>

      {series.length === 0 ? (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface)">
          <EmptyState
            icon={ClipboardCheck}
            title="Pas encore de dossiers progressifs"
            description="Les séries de ce cours sont en cours de rédaction."
          />
        </div>
      ) : (
        <>
          {autres.length > 0 && (
            <ul className="space-y-2.5">
              {autres.map((s, idx) => {
                const qCount = s.qcm_questions?.length ?? 0;
                // Série SANS question = verrouillée (Découverte) → cadenas + popup tarifs.
                if (qCount === 0) {
                  return (
                    <li key={s.id}>
                      <LockedSerieButton
                        label={s.label}
                        idx={idx}
                        kind={isEntrainement(s.label) ? 'entrainement' : isDp(s.label) ? 'dp' : 'qcm'}
                      />
                    </li>
                  );
                }
                return (
                  <li key={s.id}>
                    <SerieCard
                      href={`/cours/${coursId}/qcm/${s.id}`}
                      label={s.label}
                      type={s.type}
                      qCount={qCount}
                      rang={idx + 1}
                      dernierScore={lastBySerie.get(s.id) ?? null}
                    />
                  </li>
                );
              })}
            </ul>
          )}

          {/* Annales EVC : on choisit d'abord l'ANNÉE. Une session compte
              jusqu'à onze dossiers et un item en porte jusqu'à dix-sept : les
              lister à plat noyait la page. */}
          {annees.length > 0 && (
            <section className={autres.length > 0 ? 'mt-7' : undefined}>
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FEF3C7] text-[#92400E]">
                  <ScrollText className="h-4 w-4" />
                </span>
                <h2 className="text-sm font-bold uppercase tracking-wider text-(--color-ink)">
                  Annales EVC
                </h2>
                <span className="text-xs text-(--color-ink-muted)">
                  {annales.length} annale{annales.length > 1 ? 's' : ''} sur {annees.length} session{annees.length > 1 ? 's' : ''}
                </span>
              </div>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {annees.map(([an, lot]) => {
                  const questions = lot.reduce((n, s) => n + (s.qcm_questions?.length ?? 0), 0);
                  const faites = faitesParAnnee.get(an) ?? 0;
                  return (
                    <li key={an}>
                      <Link
                        href={`/cours/${coursId}/qcm/annales/${an}`}
                        className="group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3.5 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-lifted) focus-ring"
                      >
                        <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-[#B45309]" />
                        <span className="ml-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FEF3C7] font-mono text-sm font-bold text-[#92400E]">
                          {String(an).slice(-2)}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[15px] font-semibold tabular-nums text-(--color-ink)">Session {an}</p>
                          <p className="text-xs text-(--color-ink-muted)">
                            {lot.length} annale{lot.length > 1 ? 's' : ''} · {questions} questions
                          </p>
                        </div>
                        {faites > 0 && (
                          <span className="shrink-0 rounded-full bg-[#E7F6EC] px-2.5 py-1 text-xs font-semibold tabular-nums text-[#16793C]">
                            {faites}/{lot.length}
                          </span>
                        )}
                        <ArrowRight className="h-4 w-4 shrink-0 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}

      {/* Entraînements verrouillés (MG uniquement) — template vert trophée + cadenas.
          Au clic, popup "Information importante - Nouveaux contenus en cours".
          Jamais sur un item dédié aux annales EVC : son contenu est complet et
          définitif, rien n'y est « en cours d'intégration ». */}
      {/^m[eé]decine\s+g[eé]n[eé]rale/i.test(c.matieres.nom) && !itemDAnnales && (
        <LockedTrainingsList
          startIndex={series?.length ?? 0}
          title="Entraînements à venir"
          subtitle="De nouveaux entraînements sont en cours d’intégration par l’équipe pédagogique."
        />
      )}
    </div>
  );
}
