import { notFound, redirect } from 'next/navigation';
import { requireUser, canEditCoursContent, profPageReadGuard } from '@/lib/auth/require-role';
import { RelectureToggle } from '@/components/professor/relecture-toggle';
import { chargerRelectures } from '@/lib/data/relectures';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { QcmSession } from '@/components/qcm/qcm-session';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { buildQcmAccessContext, canStudentReadSerie, SERIE_ACCESS_COLUMNS, type SerieAccessRow } from '@/lib/data/qcm-access';
import { estSerieAnnale, anneeDeSerieAnnale } from '@/lib/data/annales';
import { serieSuivanteDpQi, trierSeriesDpQi } from '@/lib/data/qcm-ordre';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { scopeOffers } from '@/lib/auth/permissions';

type ProfilLecteur = Awaited<ReturnType<typeof requireUser>>['profile'];

/**
 * Série qui suit `serieId` dans l'onglet DP · QI de l'item, pour le bouton
 * « Dossier suivant » du mode édition. Rejoue les filtres de la liste
 * (`/cours/[cours]/qcm`) : types listés, entraînements masqués, droits élève,
 * séries verrouillées (sans question) ; puis le tri partagé de lib/data/qcm-ordre.
 */
async function serieSuivantePourLecteur(
  profile: ProfilLecteur,
  coursId: string,
  serieId: string,
  accessCtx: Awaited<ReturnType<typeof buildQcmAccessContext>>,
) {
  const scope = parseScope(profile.permission_scope);
  const isAdmin = profile.role === 'admin';
  const access = isAdmin ? undefined : await fetchContentAccessForScope(scope);
  const showSeances = !access || access.seanceProf;
  const hideEntrainement = !!access && !access.entrainement;
  const { data: raw } = await createAdminClient()
    .from('qcm_series')
    .select(`${SERIE_ACCESS_COLUMNS}, order_index, annee, qcm_questions(id, format)` as 'id, label, order_index, type')
    .eq('cours_id', coursId)
    .in('type', showSeances ? ['qcm', 'seance', 'qroc'] : ['qcm', 'qroc'])
    .order('order_index');
  type Row = SerieAccessRow & { order_index: number; annee?: number | null; qcm_questions?: { id: string; format: string }[] | null };
  const series = trierSeriesDpQi(
    ((raw ?? []) as unknown as Row[])
      .filter((s) => !hideEntrainement || !/entra[iî]nement/i.test(s.label))
      .filter((s) => canStudentReadSerie(s, accessCtx, (s.qcm_questions ?? []).map((q) => q.format)))
      // Une série sans question est verrouillée dans la liste : on ne s'y rend pas.
      .filter((s) => (s.qcm_questions ?? []).length > 0 || s.id === serieId),
    { isApprofondi: scopeOffers(scope).includes('approfondi') },
  );
  return serieSuivanteDpQi(series, serieId);
}

export default async function QcmRunPage({
  params,
  searchParams,
}: {
  params: Promise<{ cours: string; serie: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { cours: coursId, serie: serieId } = await params;
  const { q: focusQuestionId } = await searchParams;
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
  if (profile.role !== 'admin' && !canAccessCollege(parseScope(profile.permission_scope), c.matiere_id)) redirect('/facultes');
  profPageReadGuard(profile, 'qcm', `/cours/${coursId}`);

  // Série et questions lues via le client service-role : la RLS de `qcm_series`
  // / `qcm_questions` est récursive en production (42P17) et faisait échouer
  // ces lectures — donc `notFound()` sur TOUS les DP et QCM. Les droits élève
  // sont rejoués juste après, en application (cf. lib/data/qcm-access).
  const admin = createAdminClient();
  const { data: serie, error: serieError } = await admin
    .from('qcm_series')
    // cast pour exposer la colonne vignette (ajoutée par migration)
    .select(`${SERIE_ACCESS_COLUMNS}, cours_id, vignette, annee` as 'id, label, type, cours_id')
    .eq('id', serieId)
    .eq('cours_id', coursId)
    .maybeSingle();
  if (serieError) throw serieError;
  if (!serie) notFound();
  const serieRow = serie as unknown as SerieAccessRow & { vignette?: string | null; annee?: number | null };
  const vignette = serieRow.vignette ?? null;

  const { data: questions, error: questionsError } = await admin
    .from('qcm_questions')
    .select('id, enonce, order_index, format, reponse_attendue, correction_generale, commentaire_enseignant, images, qcm_items(id, lettre, enonce, is_correct, justification, images)')
    .eq('serie_id', serieId)
    .order('order_index');
  if (questionsError) throw questionsError;

  if (!questions || questions.length === 0) notFound();

  // Contrôle d'accès élève (voie, formule, entraînements, bonus Gériatrie → MG) :
  // exactement les règles que la RLS appliquait avant l'incident.
  const accessCtx = await buildQcmAccessContext(profile, c.matiere_id);
  const questionFormats = (questions as unknown as { format: string }[]).map((q) => q.format);
  if (!canStudentReadSerie(serieRow, accessCtx, questionFormats)) notFound();

  type QRow = {
    id: string; enonce: string; order_index: number; format: string;
    reponse_attendue: string | null; correction_generale: string | null;
    commentaire_enseignant: string | null;
    images: string[] | null;
    qcm_items: Array<{ id: string; lettre: string; enonce: string; is_correct: boolean; justification: string | null; images: string[] | null }>;
  };
  const enrichedQuestions = (questions as unknown as QRow[]).map((q) => ({
    id: q.id,
    enonce: q.enonce,
    order_index: q.order_index,
    format: q.format as 'qcm' | 'qroc',
    reponse_attendue: q.reponse_attendue,
    correction_generale: q.correction_generale,
    commentaire_enseignant: q.commentaire_enseignant,
    images: q.images ?? [],
    items: (q.qcm_items ?? [])
      .map((it) => ({ id: it.id, lettre: it.lettre, enonce: it.enonce, justification: it.justification, is_correct: it.is_correct, images: it.images ?? [] }))
      .sort((a, b) => a.lettre.localeCompare(b.lettre)),
  }));

  // Mode édition prof : visible UNIQUEMENT pour un prof ayant le droit
  // d'écriture QCM **et** cet item dans sa portée. Permet d'ouvrir l'éditeur de
  // question depuis la vue élève via un bouton crayon.
  const editable = canEditCoursContent(profile, 'qcm', c.matiere_id, c.id);

  // Mode édition : « Dossier suivant » en fin de série, pour enchaîner la
  // relecture des dossiers d'un item sans repasser par la liste (retour
  // enseignant du 14/09/2026). L'ordre est CELUI de la liste DP · QI — mêmes
  // filtres, même tri (lib/data/qcm-ordre) ; une annale enchaîne dans sa session.
  const suivante = editable ? await serieSuivantePourLecteur(profile, coursId, serieId, accessCtx) : null;
  // Mode édition : la case « relue » de CETTE série, dans la barre du lecteur —
  // le professeur coche en fin de relecture sans revenir à la liste.
  const relectures = editable ? await chargerRelectures(coursId) : null;
  const relectureSlot = relectures && !relectures.indisponible
    ? <RelectureToggle cible={{ coursId, serieId }} initial={relectures.series.get(serieId) ?? null} />
    : null;

  // Questions déjà enregistrées dans « Questions à revoir » par cet élève.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: savedRows } = await (supabase as any)
    .from('student_saved_questions')
    .select('question_id')
    .eq('user_id', user.id)
    .in('question_id', enrichedQuestions.map((q) => q.id));
  const savedQuestionIds = ((savedRows ?? []) as { question_id: string }[]).map((r) => r.question_id);

  const { data: session } = await supabase
    .from('qcm_sessions')
    .insert({ user_id: user.id, serie_id: serieId, score_correct: 0, score_total: enrichedQuestions.length })
    .select('id')
    .single();
  if (!session) notFound();

  const isSeance = serie.type === 'seance';
  // Les annales EVC corrigées vivent dans l'onglet DP · QI (type 'qcm', libellé
  // « Annales - <Collège> - <Année> - <Type> ») : le bandeau doit néanmoins les
  // annoncer comme des annales, pas comme une série maison.
  const bandeauAnnale = serie.type === 'annale' || estSerieAnnale(serie.label);
  // Retour à l'écran d'où l'on vient : la liste de la session pour une annale,
  // l'onglet DP · QI pour tout le reste.
  const anneeAnnale = bandeauAnnale ? anneeDeSerieAnnale(serieRow) : null;
  const backHref = anneeAnnale !== null
    ? `/cours/${coursId}/qcm/annales/${anneeAnnale}`
    : `/cours/${coursId}/qcm`;

  return (
    <QcmSession
      sessionId={session.id}
      coursId={coursId}
      serieId={serieId}
      serieLabel={serie.label}
      serieKind={isSeance ? 'seance' : bandeauAnnale ? 'annale' : 'qcm'}
      vignette={vignette}
      questions={enrichedQuestions}
      backHref={backHref}
      editable={editable}
      relectureSlot={relectureSlot}
      nextSerieHref={suivante ? `/cours/${coursId}/qcm/${suivante.id}` : null}
      nextSerieLabel={suivante?.label ?? null}
      savedQuestionIds={savedQuestionIds}
      initialIndex={focusQuestionId ? Math.max(0, enrichedQuestions.findIndex((q) => q.id === focusQuestionId)) : 0}
    />
  );
}
