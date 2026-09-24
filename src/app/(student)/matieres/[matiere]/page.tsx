import { notFound, redirect } from 'next/navigation';
import { CheckCircle2, ClipboardCheck, RefreshCcw, ShieldCheck } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { IndexHeader, IndexList, RowIcon, type IndexRow } from '@/components/shell/index-view';
import { iconFromKey } from '@/lib/icons';
import {
  canAccessCollege,
  canAccessCours,
  parseScope,
} from '@/lib/auth/permissions';
import { normalizeSpecialtyStatus } from '@/lib/pedago/status';
import { chargerProgressionCours } from '@/lib/progress/course-progress-data';
import { estItemAnnales } from '@/lib/data/annales';
import { chargerAnnonces } from '@/lib/annonces/server';
import { TEXTES_COMMUNS, epreuvePassee, joursAvant, specialitesDeLEleve } from '@/lib/annonces/concours';

export default async function MatierePage({ params }: { params: Promise<{ matiere: string }> }) {
  const { matiere } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();

  const { data: m } = await supabase
    .from('matieres')
    .select('id, nom, color_hex, icon_key, access_type, semestre_id, semestres(id, label, faculte_id, facultes(id, nom))')
    .eq('id', matiere)
    .maybeSingle();

  if (!m || !m.semestres) notFound();
  const scope = parseScope(profile.permission_scope);
  // L'administration parcourt l'espace élève sans restriction : tous les
  // collèges et tous les items, y compris ceux en accès restreint.
  const isAdmin = profile.role === 'admin';
  const collegeAccess = ((m as { access_type?: 'all' | 'specific' }).access_type ?? 'all');
  if (!isAdmin && !canAccessCollege(scope, m.id, collegeAccess)) redirect('/facultes');

  const { data: coursAll } = await supabase
    .from('cours')
    .select('id, titre, description, order_index, access_type, course_progress(video_watched, fiche_read), qcm_series(id, label), flashcards(id), fiches(storage_path), videos(id)')
    .eq('matiere_id', matiere)
    // À rang égal, « Annales - X » précède « Replays - Révisions ».
    .order('order_index')
    .order('titre');

  // Filtrage fin : un prof peut être limité à un sous-ensemble de cours
  // (scope.cours). Cours marqués 'specific' : exige listing explicite.
  const cours = (coursAll ?? []).filter((c) =>
    isAdmin
    || canAccessCours(scope, matiere, c.id, (c as { access_type?: 'all' | 'specific' }).access_type ?? 'all')
  );
  // Progression : LA formule commune (lib/progress) — questions accessibles
  // pour la voie/formule de l'élève (85 %) + couverture fiche/flashcards/vidéo
  // (15 %). Même chiffre que la bague de l'item et le navigateur.
  const progression = await chargerProgressionCours({
    userId: user.id,
    faculteId: m.semestres.faculte_id,
    scope,
    staff: isAdmin,
    cours,
  });

  const Icon = iconFromKey(m.icon_key);

  const coursRows: IndexRow[] = cours.map((c, idx) => {
    const p = c.course_progress?.[0];
    const hasContent = (c.qcm_series?.length ?? 0) > 0 || (c.flashcards?.length ?? 0) > 0;
    const progress = progression.get(c.id)?.progression ?? 0;
    // Item d'annales (« Annales - <Collège> ») : l'élève tombe directement sur
    // DP · QI, la seule page de l'item (aucun autre onglet).
    const annales = estItemAnnales({ series: c.qcm_series, fiches: c.fiches, videos: c.videos, flashcards: c.flashcards });
    return {
      id: c.id,
      href: annales ? `/cours/${c.id}/qcm` : `/cours/${c.id}`,
      title: c.titre,
      subtitle: c.description ?? (annales ? 'Annales EVC officielles, corrigées et justifiées — par année et par épreuve.' : undefined),
      leading: (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-(--color-primary) font-mono text-xs font-semibold text-white">
          {String(idx + 1).padStart(2, '0')}
        </span>
      ),
      badge: hasContent && !p ? 'Nouveau' : undefined,
      progress,
    };
  });

  // Check specialty evaluation status for this matière
  const { data: evalData } = await (supabase as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        eq: (k: string, v: string) => {
          eq: (k2: string, v2: string) => {
            order: (k: string, o: { ascending: boolean }) => {
              limit: (n: number) => Promise<{
                data: { status: string; eval_type: string }[] | null;
              }>;
            };
          };
        };
      };
    };
  }).from('specialty_evaluations')
    .select('status, eval_type')
    .eq('user_id', user.id)
    .eq('matiere_id', matiere)
    .order('created_at', { ascending: false })
    .limit(1);
  const latestEval = evalData?.[0] ?? null;
  // Vocabulaire CANONIQUE : la base écrit validee | fragile | insuffisante.
  // Les anciennes valeurs 'consolider'/'renforcer' n'ont jamais existé en base
  // — les cartes Consolidation/Renforcement ne s'affichaient donc jamais.
  const evalStatus = normalizeSpecialtyStatus(latestEval?.status);

  // Spécialité « terminée » : tous les cours abordés (fiche/vidéo/QCM) →
  // interrogation officielle proposée ; sans interrogation passée, le statut
  // est « Validation en attente » (spec section 9).
  const isSpecialtyFinished = cours.length > 0 && cours.every((c) => {
    const p = c.course_progress?.[0];
    return !!p?.video_watched || !!p?.fiche_read || (progression.get(c.id)?.input.questionsFaites ?? 0) > 0;
  });
  const awaitingValidation = isSpecialtyFinished && !evalStatus;

  // Evaluation / Consolidation / Renforcement cards based on status
  const evalRow: IndexRow = {
    id: '__evaluation__',
    href: `/matieres/${matiere}/evaluation`,
    title: 'Interrogation officielle Major EVC',
    subtitle: evalStatus === 'validee'
      ? 'Spécialité validée — vous pouvez repasser l\'interrogation.'
      : awaitingValidation
      ? `${m.nom} terminée — interrogation non réalisée.`
      : 'Évaluez votre niveau pour valider cette spécialité.',
    leading: <RowIcon Icon={ClipboardCheck} color="#6D28D9" />,
    badge: evalStatus === 'validee'
      ? 'Validée'
      : evalStatus
      ? 'À refaire'
      : awaitingValidation
      ? 'Validation en attente'
      : 'Nouveau',
  };

  const actionRows: IndexRow[] = [evalRow];

  if (evalStatus === 'fragile') {
    actionRows.push({
      id: '__consolidation__',
      href: `/matieres/${matiere}/consolidation`,
      title: 'Consolidation',
      subtitle: 'Spécialité fragile — revoyez les points faibles puis passez la mini-évaluation de 20 QCM.',
      leading: <RowIcon Icon={RefreshCcw} color="#E8742C" />,
      badge: 'Recommandé',
    });
  }

  if (evalStatus === 'insuffisante') {
    actionRows.push({
      id: '__renforcement__',
      href: `/matieres/${matiere}/renforcement`,
      title: 'Renforcement approfondi',
      subtitle: 'Spécialité insuffisamment maîtrisée — fiches, flashcards, QCM renforcés et nouvelle évaluation.',
      leading: <RowIcon Icon={ShieldCheck} color="#A91D2C" />,
      badge: 'Prioritaire',
    });
  }

  if (evalStatus === 'validee') {
    actionRows.push({
      id: '__validated__',
      href: '#',
      title: 'Spécialité validée',
      subtitle: 'Vous maîtrisez cette spécialité. Continuez les révisions transversales.',
      leading: <RowIcon Icon={CheckCircle2} color="#16793C" />,
      badge: 'Validée',
      progress: 100,
    });
  }

  // Les annales EVC ne sont plus un onglet PDF séparé : elles sont publiées
  // corrigées, question par question, dans l'onglet DP · QI des items
  // « Annales - <Collège> » / « Replays - Révisions ».
  const rows: IndexRow[] = [...actionRows, ...coursRows];

  // ── Date d'épreuve de cette spécialité ──────────────────────────────────
  // Lue dans la fiche concours de la spécialité (Admin › Annonces) — la même
  // source que la carte de l'accueil. Un sous-collège prend la fiche de son
  // collège parent.
  const annonces = await chargerAnnonces(supabase);
  const ficheId = annonces.parentDe.get(m.id) ?? m.id;
  const fiche = annonces.fiches.get(ficheId);
  const specialitesEleve = specialitesDeLEleve(scope, annonces.parentDe);
  const concerne = profile.role !== 'student' || specialitesEleve === null || specialitesEleve.includes(ficheId);
  const examBanner = fiche?.date_epreuve && concerne && !epreuvePassee(fiche)
    ? {
      title: `Épreuve écrite — ${TEXTES_COMMUNS.session}`,
      date: fiche.date_epreuve,
      note: null as string | null,
      days: joursAvant(fiche.date_epreuve),
    }
    : null;

  const fmtExam = (iso: string) => {
    try { return new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' }); }
    catch { return iso; }
  };

  return (
    <>
      <IndexHeader context="Collège EVC" title={m.nom} meta={`${rows.length} item${rows.length > 1 ? 's' : ''}`} />
      {examBanner && (
        <div className="mx-5 mt-4 flex items-center gap-4 rounded-2xl border border-(--color-primary)/25 bg-(--color-primary-soft)/40 px-4 py-3 lg:mx-10">
          <div className="flex flex-col items-center justify-center rounded-xl bg-(--color-primary) px-3 py-1.5 text-white">
            <span className="text-[10px] font-semibold uppercase leading-none tracking-wide opacity-80">Jours</span>
            <span className="text-xl font-black leading-tight tabular-nums">{examBanner.days === 0 ? 'J' : `J−${examBanner.days}`}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-(--color-ink)">{examBanner.title}</p>
            <p className="text-xs text-(--color-ink-soft)">
              {examBanner.note ?? `Épreuve le ${fmtExam(examBanner.date)}`}
            </p>
          </div>
        </div>
      )}
      <div className="flex w-full items-center gap-3 px-5 pt-6 lg:px-10">
        <RowIcon Icon={Icon} color={m.color_hex ?? undefined} />
        <p className="text-sm text-(--color-ink-muted)">Sélectionnez un item pour ouvrir la console d’étude.</p>
      </div>
      <IndexList rows={rows} />
    </>
  );
}
