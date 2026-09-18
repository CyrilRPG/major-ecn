import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope, canAccessCollege } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID, getNavigatorTree } from '@/lib/data/navigator';
import { TargetedSession, type TQuestion } from '@/components/student/targeted-session';
import { aplatirUnites, choisirUnites, regrouperEnUnites } from '@/lib/pedago/dossiers';

const MAX_Q = 12;
/**
 * Vivier de remplissage. On complète la sélection prioritaire avec les
 * premières questions des collèges autorisés ; 300 candidats suffisent
 * largement à en retenir 12 une fois écartées celles sans items exploitables.
 */
const TAILLE_VIVIER = 300;

/** Colonnes communes aux deux lectures de questions. */
const CHAMPS_QUESTION =
  'id, serie_id, enonce, order_index, format, reponse_attendue, correction_generale, commentaire_enseignant, images, '
  + 'qcm_items(id, lettre, enonce, justification, is_correct, images), '
  + 'qcm_series!inner(label, vignette, cours!inner(matieres!inner(id, nom, semestres!inner(faculte_id))))';

type AttemptRow = {
  question_id: string;
  is_correct: boolean;
  qcm_questions: { qcm_series: { cours: { matieres: { id: string; semestres: { faculte_id: string } } } } };
};
type QRow = {
  id: string;
  serie_id: string;
  enonce: string;
  order_index: number;
  format: 'qcm' | 'qroc' | null;
  reponse_attendue: string | null;
  correction_generale: string | null;
  commentaire_enseignant: string | null;
  images: string[] | null;
  qcm_items: { id: string; lettre: string; enonce: string; justification: string; is_correct: boolean; images: string[] | null }[] | null;
  qcm_series: { label: string | null; vignette: string | null; cours: { matieres: { id: string; nom: string; semestres: { faculte_id: string } } } };
};
/** Série de forme « dossier » (vignette) et son nombre TOTAL de questions. */
type DossierRow = { id: string; qcm_questions: { count: number }[] | null };

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

  // Mêmes garde-fous qu'avant : périmètre EDN, droits, et question réellement
  // jouable (un QCM sans items n'est pas exploitable).
  const utilisable = (q: QRow) =>
    q.qcm_series.cours.matieres.semestres.faculte_id === EDN_FACULTE_ID
    && canAccessCollege(scope, q.qcm_series.cours.matieres.id)
    && (!collegeFilter || collegeFilter.has(q.qcm_series.cours.matieres.id))
    // On garde les QCM (avec items) ET les QROC (saisie libre).
    && (q.format === 'qroc' || (!!q.qcm_items && q.qcm_items.length > 0));
  /** Un dossier = une série à vignette (critère du trigger qcm_series_set_kind). */
  const estDossier = (q: QRow) => !!q.qcm_series.vignette?.trim();

  // 3. Questions prioritaires (au plus 12, visées par identifiant). Celle qui
  //    appartient à un dossier progressif ne peut pas être servie seule : son
  //    dossier ENTIER est chargé avec l'échantillon (règle du 18/09/2026).
  const prioQ = prioritized.length > 0
    ? (((await supabase.from('qcm_questions').select(CHAMPS_QUESTION).in('id', prioritized)).data ?? []) as unknown as QRow[]).filter(utilisable)
    : [];
  const seriesACharger = [...new Set([...serieIds, ...prioQ.filter(estDossier).map((q) => q.serie_id)])];

  // 4. Vivier (séries entières, rangées série par série pour qu'une limite ne
  //    coupe pas un dossier en deux) et total de questions des dossiers, pour
  //    vérifier qu'un dossier est bien complet avant de le servir.
  const [vivierRes, dossiersRes] = await Promise.all([
    supabase
      .from('qcm_questions')
      .select(CHAMPS_QUESTION)
      .in('serie_id', seriesACharger)
      .order('serie_id')
      .order('order_index')
      .limit(TAILLE_VIVIER),
    supabase
      .from('qcm_series')
      .select('id, qcm_questions(count)')
      .in('id', seriesACharger)
      .not('vignette', 'is', null)
      .neq('vignette', ''),
  ]);
  const dossiers = new Map<string, number>(
    ((dossiersRes.data ?? []) as unknown as DossierRow[]).map((s) => [s.id, s.qcm_questions?.[0]?.count ?? 0]),
  );

  // Vivier = questions des séries chargées + questions prioritaires isolées
  // (celles d'un dossier y sont déjà, avec tout leur dossier).
  const parId = new Map<string, QRow>();
  for (const q of ((vivierRes.data ?? []) as unknown as QRow[]).filter(utilisable)) parId.set(q.id, q);
  for (const q of prioQ) if (!parId.has(q.id) && !estDossier(q)) parId.set(q.id, q);

  // Unité de sélection : dossier complet ou question isolée ; un dossier
  // incomplet (limite du vivier, question sans items) est écarté, jamais tronqué.
  const { unites, dossiersIncomplets } = regrouperEnUnites([...parId.values()], dossiers);
  if (dossiersIncomplets.length > 0) {
    console.warn('[entrainement] dossiers incomplets écartés du vivier', dossiersIncomplets.length);
  }

  // Priorité : les plus ratées d'abord (déterministe) ; le bruit qui varie les
  // sessions est tiré par choisirUnites, une fois par unité. Comme avant, les
  // unités prioritaires passent d'abord et le vivier ne complète que si elles
  // couvrent moins de 8 questions.
  const scoreDe = (q: QRow): number => -(failCount.get(q.id) ?? 0);
  const prioSet = new Set(prioritized);
  const unitesPrio = unites.filter((u) => u.questions.some((q) => prioSet.has(q.id)));
  let retenues = choisirUnites(unitesPrio, scoreDe, MAX_Q, Math.random, 1);
  const dejaPrises = retenues.reduce((n, u) => n + u.questions.length, 0);
  if (dejaPrises < 8) {
    const prises = new Set(retenues.flatMap((u) => u.questions.map((q) => q.id)));
    const reste = unites.filter((u) => !u.questions.some((q) => prises.has(q.id)));
    retenues = [...retenues, ...choisirUnites(reste, scoreDe, MAX_Q - dejaPrises, Math.random, 1)];
  }
  const suite = aplatirUnites(retenues);

  if (suite.length === 0) redirect('/entrainement');

  const questions: TQuestion[] = suite.map(({ question: q, dossier }) => ({
    id: q.id,
    enonce: q.enonce,
    college: q.qcm_series.cours.matieres.nom,
    format: q.format ?? 'qcm',
    reponse_attendue: q.reponse_attendue,
    correction_generale: q.correction_generale,
    commentaire_enseignant: q.commentaire_enseignant,
    images: q.images,
    vignette: q.qcm_series.vignette,
    dossier: dossier
      ? { serie_id: dossier.serieId, label: q.qcm_series.label, position: dossier.position, total: dossier.total }
      : null,
    items: [...(q.qcm_items ?? [])]
      .map((it) => ({ id: it.id, lettre: it.lettre, enonce: it.enonce, justification: it.justification, is_correct: it.is_correct, images: it.images }))
      .sort((a, b) => a.lettre.localeCompare(b.lettre)),
  }));

  return <TargetedSession questions={questions} backHref="/entrainement" />;
}
