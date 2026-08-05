import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope, canAccessCollege } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID, getNavigatorTree } from '@/lib/data/navigator';
import { TargetedSession, type TQuestion } from '@/components/student/targeted-session';

const MAX_Q = 12;
/**
 * Vivier de remplissage. On complète la sélection prioritaire avec les
 * premières questions des collèges autorisés ; 300 candidats suffisent
 * largement à en retenir 12 une fois écartées celles sans items exploitables.
 */
const TAILLE_VIVIER = 300;

/** Colonnes communes aux deux lectures de questions. */
const CHAMPS_QUESTION =
  'id, enonce, order_index, format, reponse_attendue, correction_generale, commentaire_enseignant, images, '
  + 'qcm_items(id, lettre, enonce, justification, is_correct, images), '
  + 'qcm_series!inner(vignette, cours!inner(matieres!inner(id, nom, semestres!inner(faculte_id))))';

type AttemptRow = {
  question_id: string;
  is_correct: boolean;
  qcm_questions: { qcm_series: { cours: { matieres: { id: string; semestres: { faculte_id: string } } } } };
};
type QRow = {
  id: string;
  enonce: string;
  order_index: number;
  format: 'qcm' | 'qroc' | null;
  reponse_attendue: string | null;
  correction_generale: string | null;
  commentaire_enseignant: string | null;
  images: string[] | null;
  qcm_items: { id: string; lettre: string; enonce: string; justification: string; is_correct: boolean; images: string[] | null }[] | null;
  qcm_series: { vignette: string | null; cours: { matieres: { id: string; nom: string; semestres: { faculte_id: string } } } };
};

export default async function TargetedSessionPage({
  searchParams,
}: { searchParams: Promise<{ colleges?: string }> }) {
  const { user, profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  const sp = await searchParams;
  const selected = sp.colleges?.split(',').filter(Boolean) ?? [];
  const collegeFilter: Set<string> | null = selected.length > 0 ? new Set(selected) : null;
  const supabase = await createClient();

  // 1. Fail counts per question (EDN scope)
  const { data: attemptsRaw } = await supabase
    .from('qcm_attempts')
    .select('question_id, is_correct, qcm_questions!inner(qcm_series!inner(cours!inner(matieres!inner(id, semestres!inner(faculte_id)))))')
    .eq('user_id', user.id);

  const failCount = new Map<string, number>();
  for (const a of ((attemptsRaw ?? []) as unknown as AttemptRow[])) {
    const m = a.qcm_questions.qcm_series.cours.matieres;
    if (m.semestres.faculte_id !== EDN_FACULTE_ID || !canAccessCollege(scope, m.id)) continue;
    if (collegeFilter && !collegeFilter.has(m.id)) continue;
    if (!a.is_correct) failCount.set(a.question_id, (failCount.get(a.question_id) ?? 0) + 1);
  }

  const prioritized = [...failCount.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id).slice(0, MAX_Q);

  // 2. Périmètre interrogeable, calculé AVANT toute lecture de questions.
  //
  // Cette page rapatriait auparavant la table `qcm_questions` ENTIÈRE — sans
  // filtre, sans limite, embed `qcm_items` compris — pour n'en retenir que 12 :
  // 51 341 questions et 143 369 items traversaient le réseau à chaque
  // démarrage de session. C'était la requête la plus coûteuse de la
  // plateforme. Le filtre part désormais en base.
  //
  // L'arbre est déjà chargé par le layout étudiant et `getNavigatorTree` est
  // enveloppé dans `cache()` : cet appel ne coûte donc rien de plus.
  const arbre = await getNavigatorTree(profile);
  const coursInterrogeables = arbre
    .flatMap((c) => [c, ...(c.children ?? [])])
    .filter((c) => canAccessCollege(scope, c.id))
    .filter((c) => !collegeFilter || collegeFilter.has(c.id))
    // `hasQcm` évite d'aller chercher des séries pour des items qui n'en ont pas.
    .flatMap((c) => c.cours.filter((x) => x.hasQcm).map((x) => x.id));

  if (coursInterrogeables.length === 0) redirect('/entrainement');

  const { data: seriesRaw } = await supabase
    .from('qcm_series')
    .select('id')
    .eq('type', 'qcm')
    .in('cours_id', coursInterrogeables);
  const toutesLesSeries = (seriesRaw ?? []).map((s) => s.id as string);
  if (toutesLesSeries.length === 0) redirect('/entrainement');

  // Le vivier est tiré d'un échantillon de séries, pas de toutes.
  //
  // Trier `order_index` sur l'ensemble des séries obligeait la base à parcourir
  // les ~23 000 questions du périmètre pour n'en garder que 300 — et donnait un
  // résultat médiocre : toutes les questions retenues portaient le même
  // `order_index`, c'est-à-dire toujours la PREMIÈRE question de chaque série.
  // En échantillonnant les séries, la lecture devient minuscule et le contenu
  // proposé plus varié d'une session à l'autre.
  const SERIES_ECHANTILLONNEES = 40;
  const melangees = [...toutesLesSeries];
  for (let i = melangees.length - 1; i > 0; i--) {
    // La règle de pureté React vise les composants qui se re-rendent : un
    // résultat instable y produirait un affichage qui saute. Ici nous sommes
    // dans un composant SERVEUR, exécuté une fois par requête, et le tirage
    // aléatoire est précisément l'effet recherché — deux sessions d'affilée
    // ne doivent pas proposer les mêmes questions.
    // eslint-disable-next-line react-hooks/purity
    const j = Math.floor(Math.random() * (i + 1));
    [melangees[i], melangees[j]] = [melangees[j], melangees[i]];
  }
  const serieIds = melangees.slice(0, SERIES_ECHANTILLONNEES);

  // 3. Deux lectures bornées, en parallèle : les questions prioritaires (au
  //    plus 12, visées par identifiant) et un vivier de remplissage.
  const [prioRes, vivierRes] = await Promise.all([
    prioritized.length > 0
      ? supabase.from('qcm_questions').select(CHAMPS_QUESTION).in('id', prioritized)
      : Promise.resolve({ data: [] as unknown[] }),
    supabase
      .from('qcm_questions')
      .select(CHAMPS_QUESTION)
      .in('serie_id', serieIds)
      .order('order_index')
      .limit(TAILLE_VIVIER),
  ]);

  // Mêmes garde-fous qu'avant : périmètre EDN, droits, et question réellement
  // jouable (un QCM sans items n'est pas exploitable).
  const utilisable = (q: QRow) =>
    q.qcm_series.cours.matieres.semestres.faculte_id === EDN_FACULTE_ID
    && canAccessCollege(scope, q.qcm_series.cours.matieres.id)
    && (!collegeFilter || collegeFilter.has(q.qcm_series.cours.matieres.id))
    // On garde les QCM (avec items) ET les QROC (saisie libre).
    && (q.format === 'qroc' || (!!q.qcm_items && q.qcm_items.length > 0));

  const prioQ = ((prioRes.data ?? []) as unknown as QRow[]).filter(utilisable);
  const vivier = ((vivierRes.data ?? []) as unknown as QRow[]).filter(utilisable);

  const byId = new Map(prioQ.map((q) => [q.id, q]));
  const ordered: QRow[] = [];
  for (const id of prioritized) {
    const q = byId.get(id);
    if (q) ordered.push(q);
  }
  if (ordered.length < 8) {
    const picked = new Set(ordered.map((q) => q.id));
    for (const q of vivier) {
      if (ordered.length >= MAX_Q) break;
      if (!picked.has(q.id)) ordered.push(q);
    }
  }

  if (ordered.length === 0) redirect('/entrainement');

  const questions: TQuestion[] = ordered.slice(0, MAX_Q).map((q) => ({
    id: q.id,
    enonce: q.enonce,
    college: q.qcm_series.cours.matieres.nom,
    format: q.format ?? 'qcm',
    reponse_attendue: q.reponse_attendue,
    correction_generale: q.correction_generale,
    commentaire_enseignant: q.commentaire_enseignant,
    images: q.images,
    vignette: q.qcm_series.vignette,
    items: [...(q.qcm_items ?? [])]
      .map((it) => ({ id: it.id, lettre: it.lettre, enonce: it.enonce, justification: it.justification, is_correct: it.is_correct, images: it.images }))
      .sort((a, b) => a.lettre.localeCompare(b.lettre)),
  }));

  return <TargetedSession questions={questions} backHref="/entrainement" />;
}
