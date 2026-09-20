import { redirect, notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { aplatirUnites, choisirUnites, dossiersDepuisSeries, formeDeSerie, regrouperEnUnites, type PositionDossier, type SerieRowForme } from '@/lib/pedago/dossiers';
import { loadStudentAttempts } from '@/lib/pedago/maintien';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { RenforcementFlow } from './renforcement-flow';

export const metadata = { title: 'Renforcement approfondi' };

/** Ligne légère du vivier : de quoi regrouper, prioriser et vérifier qu'un
 *  QCM est jouable (≥ 3 items), sans embarquer énoncés ni items. */
type PoolRow = {
  id: string;
  serie_id: string;
  order_index: number;
  qcm_items: { count: number }[] | null;
  qcm_series: { cours_id: string };
};
/** Ligne complète, chargée pour les seules questions retenues. */
type QRow = {
  id: string;
  serie_id: string;
  enonce: string;
  order_index: number;
  /** Documents de l'énoncé (ECG, radiographie, cliché…). */
  images: string[] | null;
  qcm_items: { id: string; lettre: string; enonce: string; justification: string; is_correct: boolean; images: string[] | null }[] | null;
  qcm_series: { cours_id: string; label: string | null; vignette: string | null };
};

export default async function RenforcementPage({ params }: { params: Promise<{ matiere: string }> }) {
  const { matiere } = await params;
  const { user, profile } = await requireUser();
  const supabase = await createClient();
  const scope = parseScope(profile.permission_scope);
  if (!canAccessCollege(scope, matiere)) redirect('/facultes');

  const { data: mat } = await supabase
    .from('matieres')
    .select('id, nom, semestres!inner(faculte_id)')
    .eq('id', matiere)
    .maybeSingle();
  if (!mat) notFound();
  const sem = mat.semestres as unknown as { faculte_id: string };
  if (sem.faculte_id !== EDN_FACULTE_ID) notFound();

  const matiereName = (mat as unknown as { nom: string }).nom;

  const { data: coursRaw } = await supabase
    .from('cours')
    .select('id, titre, order_index, fiches(id), flashcards(id)')
    .eq('matiere_id', matiere)
    .order('order_index');
  type CoursRow = { id: string; titre: string; order_index: number | null; fiches: { id: string }[] | null; flashcards: { id: string }[] | null };
  const coursList = ((coursRaw ?? []) as unknown as CoursRow[]);
  const coursIds = coursList.map((c) => c.id);
  if (coursIds.length === 0) redirect(`/matieres/${matiere}`);

  /* Vivier lu par COURS et par pages de 1 000. Lister d'abord les séries puis
     demander « serie_id in (…) » tronquait la liste à 1 000 (PostgREST) et
     faisait refuser l'URL (39 Ko d'identifiants pour les 1 371 séries de
     Psychiatrie) : la série renforcée était alors vide. Même correctif que la
     session transversale du 14/09/2026. */
  const COURS_PAR_TRANCHE = 50;
  const tranches: string[][] = [];
  for (let i = 0; i < coursIds.length; i += COURS_PAR_TRANCHE) {
    tranches.push(coursIds.slice(i, i + COURS_PAR_TRANCHE));
  }
  const [pool, serieRows, attempts, { data: progressRow }] = await Promise.all([
    Promise.all(tranches.map((ids) =>
      fetchAllRows<PoolRow>((from, to) =>
        supabase
          .from('qcm_questions')
          .select('id, serie_id, order_index, qcm_items(count), qcm_series!inner(cours_id)')
          .in('qcm_series.cours_id', ids)
          .order('id', { ascending: true })
          .range(from, to) as never,
      ),
    )).then((r) => r.flat()),
    // TOUTES les séries de la spécialité (libellé, type, vignette, nombre
    // TOTAL de questions) : seule une série de questions isolées se pioche
    // question par question ; toute autre (dossier progressif, annale,
    // entraînement, séance, sujet long) est servie entière, dans l'ordre, ou
    // pas du tout (règle du 18/09/2026 précisée le 20/09/2026).
    Promise.all(tranches.map((ids) =>
      fetchAllRows<SerieRowForme>((from, to) =>
        supabase
          .from('qcm_series')
          .select('id, label, type, vignette, qcm_questions(count)')
          .in('cours_id', ids)
          .order('id', { ascending: true })
          .range(from, to) as never,
      ),
    )).then((r) => r.flat()),
    // Tentatives lues intégralement (par pages) : une seule requête tronquait
    // l'historique d'un élève assidu à 1 000 lignes.
    loadStudentAttempts(supabase as never, user.id),
    // Parcours de renforcement en cours : reprendre là où l'élève s'était arrêté.
    (supabase as unknown as {
      from: (t: string) => {
        select: (s: string) => {
          eq: (k: string, v: string) => {
            eq: (k: string, v: string) => {
              is: (k: string, v: null) => {
                maybeSingle: () => Promise<{ data: {
                  fiches_completed: boolean | null; flashcards_completed: boolean | null;
                  qcm_completed: boolean | null; eval_completed: boolean | null;
                } | null }>;
              };
            };
          };
        };
      };
    }).from('renforcement_progress')
      .select('fiches_completed, flashcards_completed, qcm_completed, eval_completed')
      .eq('user_id', user.id)
      .eq('matiere_id', matiere)
      .is('completed_at', null)
      .maybeSingle(),
  ]);
  const dossiers = dossiersDepuisSeries(serieRows.map(formeDeSerie));

  // Un QCM jouable a au moins 3 items.
  const allQ = pool.filter((q) => (q.qcm_items?.[0]?.count ?? 0) >= 3);

  // Série renforcée : priorité aux questions déjà ratées, puis tirage.
  const failCount = new Map<string, number>();
  const qIds = new Set(allQ.map((q) => q.id));
  for (const a of attempts) {
    if (qIds.has(a.question_id) && !a.is_correct) {
      failCount.set(a.question_id, (failCount.get(a.question_id) ?? 0) + 1);
    }
  }
  // Déterministe : le bruit (1) est tiré par choisirUnites, une fois par unité.
  const scoreDe = (q: PoolRow): number => -(failCount.get(q.id) ?? 0);

  // Unité de sélection : dossier complet ou question isolée. Un dossier
  // incomplet dans le vivier (série tronquée, question sans items) est écarté.
  const { unites, dossiersIncomplets } = regrouperEnUnites(allQ, dossiers);
  if (dossiersIncomplets.length > 0) {
    console.warn('[renforcement] dossiers incomplets écartés du vivier', dossiersIncomplets.length);
  }
  const qcmUnites = choisirUnites(unites, scoreDe, 50, Math.random, 1);
  const pickedIds = new Set(qcmUnites.flatMap((u) => u.questions.map((q) => q.id)));
  const reste = unites.filter((u) => !u.questions.some((q) => pickedIds.has(q.id)));
  const evalUnites = choisirUnites(reste, scoreDe, 30, Math.random, 1);

  // Chargement complet des seules questions retenues (≤ 80), série comprise
  // (libellé et contexte clinique du dossier).
  const suiteQcm = aplatirUnites(qcmUnites);
  const suiteEval = aplatirUnites(evalUnites);
  const retenues = [...suiteQcm, ...suiteEval].map((r) => r.question.id);
  const { data: fullRaw } = retenues.length > 0
    ? await supabase
        .from('qcm_questions')
        .select('id, serie_id, enonce, order_index, images, qcm_items(id, lettre, enonce, justification, is_correct, images), qcm_series!inner(cours_id, label, vignette)')
        .in('id', retenues)
    : { data: [] };
  const parId = new Map(((fullRaw ?? []) as unknown as QRow[]).map((q) => [q.id, q]));

  // Un dossier dont une question n'aurait pas été rechargée serait servi
  // amputé : on écarte alors le dossier entier, comme au regroupement.
  const seriesAmputees = new Set(
    [...suiteQcm, ...suiteEval]
      .filter((r) => r.dossier && !parId.has(r.question.id))
      .map((r) => r.dossier!.serieId),
  );
  const mapQ = (suite: { question: PoolRow; dossier: PositionDossier | null }[]) =>
    suite.flatMap(({ question, dossier }) => {
      const q = parId.get(question.id);
      if (!q || (dossier && seriesAmputees.has(dossier.serieId))) return [];
      return [{
        id: q.id,
        enonce: q.enonce,
        cours_id: q.qcm_series.cours_id,
        college: matiereName,
        images: q.images ?? [],
        vignette: dossier ? q.qcm_series.vignette : null,
        dossier: dossier
          ? { serie_id: dossier.serieId, label: q.qcm_series.label, position: dossier.position, total: dossier.total }
          : null,
        items: [...(q.qcm_items ?? [])]
          .sort((a, b) => a.lettre.localeCompare(b.lettre))
          .map((it) => ({ id: it.id, lettre: it.lettre, enonce: it.enonce, justification: it.justification, is_correct: it.is_correct, images: it.images ?? [] })),
      }];
    });

  const initialCompleted: number[] = [];
  if (progressRow?.fiches_completed) initialCompleted.push(1);
  if (progressRow?.flashcards_completed) initialCompleted.push(2);
  if (progressRow?.qcm_completed) initialCompleted.push(3);
  if (progressRow?.eval_completed) initialCompleted.push(4);

  return (
    <RenforcementFlow
      matiereId={matiere}
      matiereName={matiereName}
      coursFiches={coursList.filter((c) => (c.fiches?.length ?? 0) > 0).map((c) => ({ id: c.id, titre: c.titre }))}
      coursFlashcards={coursList.filter((c) => (c.flashcards?.length ?? 0) > 0).map((c) => ({ id: c.id, titre: c.titre }))}
      qcmQuestions={mapQ(suiteQcm)}
      evalQuestions={mapQ(suiteEval)}
      initialCompleted={initialCompleted}
    />
  );
}
