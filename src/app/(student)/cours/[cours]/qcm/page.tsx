import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowRight, ClipboardCheck, ClipboardList, GraduationCap, Lightbulb, Lock, Pencil, PenLine, Star, Trophy, Sparkles } from 'lucide-react';
import { requireUser, profPageReadGuard, getProfessorScope } from '@/lib/auth/require-role';
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

type SerieListRow = SerieAccessRow & {
  order_index: number;
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
  if (!canAccessCollege(scope, c.matiere_id)) redirect('/facultes');
  profPageReadGuard(profile, 'qcm', `/cours/${coursId}`);

  const isAdmin = profile.role === 'admin';
  const canEditQcm = isAdmin
    || (profile.role === 'professor' && canWrite(getProfessorScope(profile.permission_scope), 'qcm'));
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
    .select(`${SERIE_ACCESS_COLUMNS}, order_index, qcm_questions(id, format)` as 'id, label, order_index, type')
    .eq('cours_id', coursId)
    .in('type', seriesTypes)
    .order('order_index');
  if (seriesError) throw seriesError;
  const hideEntrainement = access && !access.entrainement;
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

  // Voie externe : QROC (« QROC — Série N ») et DP-QROC (« DP QROC N · … »)
  // partagent une identité visuelle « teal » distincte des QCM/DP (voie interne).
  const isDpQroc = (label: string) => /^dp\s*qroc/i.test(label);
  // Les 2 nouveaux DP QROC premium (générés item par item) portent une étoile :
  // ce sont « DP QROC 1 » / « DP QROC 2 » (les anciens sont décalés en ≥ 3).
  const isStarredDpQroc = (label: string) => /^dp\s*qroc\s*[12]\b/i.test(label);
  const isQroc = (label: string) => /^qroc/i.test(label);
  // « DP 1 » (DP QCM) → traitement rouge + icône DP.
  const isDp = (label: string) => /^dp\b/i.test(label);
  const isEntrainement = (label: string) => /entra[iî]nement/i.test(label);
  const isSeance = (s: { type?: string | null }) => s.type === 'seance';

  // Couleur du score : rouge < 50 %, orange < 80 %, vert ≥ 80 %.
  const scoreTheme = (correct: number, total: number) => {
    const r = total > 0 ? correct / total : 0;
    if (r < 0.5) return { bg: '#FDE7E9', fg: '#C0001F' };
    if (r < 0.8) return { bg: '#FEF3E2', fg: '#B26A00' };
    return { bg: '#E7F6EC', fg: '#16793C' };
  };

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
      {/* Bandeau d'info : ampoule + tagline EVC. */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3 shadow-(--shadow-soft)">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#FEF3E2] text-[#B26A00]">
          <Lightbulb className="h-4.5 w-4.5" />
        </span>
        <p className="text-sm text-(--color-ink-soft)">
          Chaque proposition est corrigée et justifiée immédiatement, au format EVC.
        </p>
      </div>

      {!series || series.length === 0 ? (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface)">
          <EmptyState
            icon={ClipboardCheck}
            title="Pas encore de dossiers progressifs"
            description="Les séries de ce cours sont en cours de rédaction."
          />
        </div>
      ) : (
        <ul className="space-y-2.5">
          {series.map((s, idx) => {
            const lr = lastBySerie.get(s.id);
            const qCount = s.qcm_questions?.length ?? 0;
            const dp = isDp(s.label);
            const entr = isEntrainement(s.label);
            // Série SANS question = verrouillée (Découverte) → cadenas + popup tarifs.
            if (qCount === 0) {
              return (
                <li key={s.id}>
                  <LockedSerieButton
                    label={s.label}
                    idx={idx}
                    kind={entr ? 'entrainement' : dp ? 'dp' : 'qcm'}
                  />
                </li>
              );
            }
            const seance = isSeance(s);
            const dpQroc = isDpQroc(s.label);
            const qroc = isQroc(s.label);
            // Violet=Séance, vert=Entraînement, teal=QROC/DP-QROC (voie externe),
            // rouge=DP, bleu=QCM standard (voie interne).
            const theme = seance
              ? { bar: '#7C3AED', bg: '#F3EAFF', fg: '#5B21B6', Icon: Sparkles,      kindLabel: 'Séance du prof' }
              : entr
              ? { bar: '#16A34A', bg: '#E7F6EC', fg: '#16793C', Icon: Trophy,         kindLabel: 'Entraînement' }
              : dpQroc
              ? { bar: '#0D9488', bg: '#CCFBF1', fg: '#0F766E', Icon: ClipboardList,  kindLabel: 'DP QROC' }
              : qroc
              ? { bar: '#0D9488', bg: '#CCFBF1', fg: '#0F766E', Icon: PenLine,        kindLabel: 'QROC' }
              : dp
              ? { bar: '#E4002B', bg: '#FDE7E9', fg: '#C0001F', Icon: ClipboardList,  kindLabel: 'DP' }
              : { bar: '#2563EB', bg: '#E5F1FF', fg: '#1E4D8B', Icon: GraduationCap,  kindLabel: 'QCM' };
            const scoreT = lr ? scoreTheme(lr.score_correct, lr.score_total) : null;
            return (
              <li key={s.id}>
                <Link
                  href={`/cours/${coursId}/qcm/${s.id}`}
                  className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3.5 shadow-(--shadow-soft) transition-all hover:-translate-y-0.5 hover:shadow-(--shadow-lifted) focus-ring"
                >
                  {/* Barre verticale colorée à gauche selon le type. */}
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 w-1.5"
                    style={{ background: theme.bar }}
                  />
                  <span
                    className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ background: theme.bg, color: theme.fg }}
                  >
                    <theme.Icon className="h-5 w-5" />
                  </span>
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold"
                    style={{ background: theme.bg, color: theme.fg }}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-[15px] font-semibold text-(--color-ink)">
                      {/* Étoile distinctive sur les nouveaux DP QROC (voie externe). */}
                      {isStarredDpQroc(s.label) && <Star className="h-4 w-4 shrink-0 fill-[#F5B301] text-[#F5B301]" aria-label="Nouveau dossier QROC" />}
                      <span className="truncate">{s.label}</span>
                    </p>
                    <p className="text-xs text-(--color-ink-muted)">
                      {qCount} questions · environ {Math.max(1, qCount)} min
                    </p>
                  </div>
                  {scoreT ? (
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums"
                      style={{ background: scoreT.bg, color: scoreT.fg }}
                    >
                      {lr!.score_correct} / {lr!.score_total}
                    </span>
                  ) : (
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ background: theme.bg, color: theme.fg }}
                    >
                      {theme.kindLabel}
                    </span>
                  )}
                  <ArrowRight className="h-4 w-4 shrink-0 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      {/* Entraînements verrouillés (MG uniquement) — template vert trophée + cadenas.
          Au clic, popup "Information importante - Nouveaux contenus en cours". */}
      {/^m[eé]decine\s+g[eé]n[eé]rale/i.test(c.matieres.nom) && (
        <LockedTrainingsList
          startIndex={series?.length ?? 0}
          title="Entraînements à venir"
          subtitle="De nouveaux entraînements sont en cours d’intégration par l’équipe pédagogique."
        />
      )}
    </div>
  );
}
