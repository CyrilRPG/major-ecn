import { redirect, notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { canAccessCollege, parseScope } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { aplatirUnites, choisirUnites, regrouperEnUnites, type PositionDossier } from '@/lib/pedago/dossiers';
import { loadStudentAttempts } from '@/lib/pedago/maintien';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { ConsolidationFlow } from './consolidation-flow';

export const metadata = { title: 'Consolidation' };

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

export default async function ConsolidationPage({ params }: { params: Promise<{ matiere: string }> }) {
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
    .select('id')
    .eq('matiere_id', matiere);
  const coursIds = (coursRaw ?? []).map((c) => c.id);
  if (coursIds.length === 0) redirect(`/matieres/${matiere}`);

  /* Vivier lu par COURS et par pages de 1 000. Lister d'abord les séries puis
     demander « serie_id in (…) » tronquait la liste à 1 000 (PostgREST) et
     faisait refuser l'URL (39 Ko d'identifiants pour les 1 371 séries de
     Psychiatrie) : la page annonçait alors « 0 QCM ciblés ». Même correctif
     que la session transversale du 14/09/2026. */
  type DossierRow = { id: string; qcm_questions: { count: number }[] | null };
  const COURS_PAR_TRANCHE = 50;
  const tranches: string[][] = [];
  for (let i = 0; i < coursIds.length; i += COURS_PAR_TRANCHE) {
    tranches.push(coursIds.slice(i, i + COURS_PAR_TRANCHE));
  }
  const [pool, dossierRows, attempts] = await Promise.all([
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
    // Les dossiers (séries à vignette) avec leur nombre TOTAL de questions :
    // un dossier n'est servi que complet, dans l'ordre, jamais question par
    // question (règle du 18/09/2026).
    Promise.all(tranches.map((ids) =>
      fetchAllRows<DossierRow>((from, to) =>
        supabase
          .from('qcm_series')
          .select('id, qcm_questions(count)')
          .in('cours_id', ids)
          .not('vignette', 'is', null)
          .neq('vignette', '')
          .order('id', { ascending: true })
          .range(from, to) as never,
      ),
    )).then((r) => r.flat()),
    // Tentatives lues intégralement (par pages) : une seule requête tronquait
    // l'historique d'un élève assidu à 1 000 lignes.
    loadStudentAttempts(supabase as never, user.id),
  ]);
  if (pool.length === 0) redirect(`/matieres/${matiere}`);
  const dossiers = new Map<string, number>(
    dossierRows.map((s) => [s.id, s.qcm_questions?.[0]?.count ?? 0]),
  );

  // Un QCM jouable a au moins 3 items.
  const allQ = pool.filter((q) => (q.qcm_items?.[0]?.count ?? 0) >= 3);

  // Historique par question : nb d'échecs, jamais vue, ancienneté.
  const qIds = new Set(allQ.map((q) => q.id));
  const attemptStat = new Map<string, { fails: number; last: number }>();
  for (const a of attempts) {
    if (!qIds.has(a.question_id)) continue;
    const cur = attemptStat.get(a.question_id) ?? { fails: 0, last: 0 };
    if (!a.is_correct) cur.fails++;
    const t = new Date(a.attempted_at).getTime();
    if (t > cur.last) cur.last = t;
    attemptStat.set(a.question_id, cur);
  }

  // Sélection des 40 QCM ciblés — priorités de la spec section 11 :
  // 1. QCM ratés (les plus ratés d'abord) ; 2. jamais vus ; 3. anciens
  // (> 30 jours) ; 4. le reste. Bruit aléatoire léger pour varier les sessions.
  const now = Date.now();
  const days30Ms = 30 * 86_400_000;
  const scoreDe = (q: PoolRow): number => {
    const st = attemptStat.get(q.id);
    let bucket: number;
    if (st && st.fails > 0) bucket = 0;
    else if (!st) bucket = 1;
    else if (now - st.last > days30Ms) bucket = 2;
    else bucket = 3;
    const failBoost = st ? Math.min(0.9, st.fails * 0.3) : 0;
    // Déterministe : le bruit qui varie les sessions est tiré par choisirUnites,
    // une fois par unité (sinon un dossier le moyennait et ne sortait jamais).
    return bucket * 10 - failBoost;
  };

  // Unité de sélection : dossier complet ou question isolée. Un dossier
  // incomplet dans le vivier (série tronquée, question sans items) est écarté.
  const { unites, dossiersIncomplets } = regrouperEnUnites(allQ, dossiers);
  if (dossiersIncomplets.length > 0) {
    console.warn('[consolidation] dossiers incomplets écartés du vivier', dossiersIncomplets.length);
  }
  const consolidation = choisirUnites(unites, scoreDe, 40);
  const picked = new Set(consolidation.flatMap((u) => u.questions.map((q) => q.id)));
  // Mini-évaluation : tirage aléatoire parmi ce qui reste, par unités aussi.
  const reste = unites.filter((u) => !u.questions.some((q) => picked.has(q.id)));
  const miniEval = choisirUnites(reste, () => 0, 20);

  // Chargement complet des seules questions retenues (≤ 60), série comprise
  // (libellé et contexte clinique du dossier).
  const suiteConsolidation = aplatirUnites(consolidation);
  const suiteMiniEval = aplatirUnites(miniEval);
  const retenues = [...suiteConsolidation, ...suiteMiniEval].map((r) => r.question.id);
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
    [...suiteConsolidation, ...suiteMiniEval]
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

  return (
    <ConsolidationFlow
      matiereId={matiere}
      matiereName={matiereName}
      consolidationQuestions={mapQ(suiteConsolidation)}
      miniEvalQuestions={mapQ(suiteMiniEval)}
    />
  );
}
