import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScopeWith } from '@/lib/auth/formula-permissions';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import {
  estSerieDeQuestionsIsolees,
  formeDeSerie,
  tirerQuestionsIsolees,
  vivierInterrogation,
  type SerieForme,
  type SerieRowForme,
} from './dossiers';
import {
  AUCUN_PREREQUIS,
  N_QUESTIONS_INTERROGATION,
  PNEUMO_COURS_ID,
  candidatsDuVerrou,
  decisionOuverture,
  type CoursInterrogation,
  type OuvertureInterrogation,
  type PrerequisInterrogation,
  type ProfilInterrogation,
} from './interrogation-core';

export {
  N_QUESTIONS_INTERROGATION,
  PNEUMO_COURS_ID,
  redirectionDuRefus,
  type CoursInterrogation,
  type OuvertureInterrogation,
  type PrerequisInterrogation,
  type ProfilInterrogation,
} from './interrogation-core';

/**
 * Interrogation de fin de parcours (`/cours/[cours]/interrogation`) : qui peut
 * l'ouvrir et ce qu'elle sert. Lu par la page ELLE-MÊME, par son pendant mobile
 * (`/api/mobile/interrogation`) et par les deux verrous qui y conduisent l'élève
 * — le layout élève web et `/api/mobile/gates` (`interrogationEnAttente`).
 *
 * POURQUOI UN SEUL MODULE. Le verrou « Interrogation obligatoire » renvoie
 * l'élève sur l'interrogation de tout cours terminé dont le certificat n'est pas
 * signé, et l'y ramène à chaque page (seuls /logout sur le web et /profil sur
 * mobile y échappent). Tout écart entre le verrou et la page est une impasse :
 *   - la page REFUSE (accès perdu au collège, à l'item ou, par la formule, à
 *     l'interrogation) et renvoie ailleurs : le layout ramène sur la page, qui
 *     renvoie ailleurs… boucle de redirection (ERR_TOO_MANY_REDIRECTS) ;
 *   - la page n'a AUCUNE QUESTION (« Aucune question disponible pour le
 *     moment. ») : le certificat ne se signe pas, la plateforme reste bloquée ;
 *   - l'écran mobile exigeait une `qcm_sessions` TERMINÉE là où le verrou compte
 *     une réponse (`qcm_attempts`) : il affichait des prérequis « à faire » dont
 *     chaque lien était renvoyé sur l'interrogation.
 * Le verrou ne retient donc l'élève que sur un cours que la page ouvre
 * (`ouverturesInterrogation`, les contrôles de la page) ET qui a des questions.
 *
 * Mesuré le 22/09/2026 : 608 des 1 361 cours à QCM jouables n'ont aucune
 * question isolée (604 items d'odontologie dont l'unique série QCM dépasse dix
 * questions, « Tour général de révision » en Pédiatrie, « Replays - Révisions »
 * en Dermatologie, deux items d'annales) ; les cours à QROC seuls étaient déjà
 * dans ce cas. Pour un élève de voie externe, la RLS masque les séries QCM de
 * tout item qui n'est pas « Révisions… » : son vivier y est toujours vide.
 *
 * L'interrogation d'un cours a des questions si :
 *   - une interrogation COMPOSÉE par l'équipe (moteur d'épreuve) est publiée
 *     sur le cours et compte au moins une question — elle prime sur le tirage ;
 *   - à défaut, si le vivier du tirage automatique n'est pas vide
 *     (`vivierInterrogation`, lib/pedago/dossiers).
 *
 * Tout se lit avec le client de l'ÉLÈVE (RLS), comme sur la page — sauf les
 * interrogations composées, lues en service-role comme la page les a toujours
 * lues. Lu en service-role, le vivier compterait des séries que la RLS masque à
 * l'élève, et le verrou le conduirait sur une page vide.
 */

// Les tables d'épreuves ne sont pas dans les types générés : client non typé ciblé.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>;

/** Séries par requête : garde l'URL `in.(…)` loin de la limite (37 Ko refusés). */
const TRANCHE_SERIES = 100;

/** Cours examinés ensemble par le verrou. */
const TRANCHE_VERROU = 10;

/**
 * Prérequis de l'interrogation, par cours, lus avec le client de l'élève.
 *
 * Une question existe-t-elle ? `limit(1)` par cours, et non une lecture groupée
 * de toutes les réponses : celle-ci était tronquée à 1 000 lignes par PostgREST,
 * et un élève qui avait beaucoup répondu sur un cours pouvait y cacher les
 * autres. Une lecture en échec compte « non fait » : jamais de verrou sur ce
 * qu'on n'a pas pu lire.
 */
async function prerequisInterrogation(
  db: AnyClient,
  userId: string,
  coursIds: readonly string[],
): Promise<Map<string, PrerequisInterrogation>> {
  const out = new Map<string, PrerequisInterrogation>();
  if (coursIds.length === 0) return out;
  const existe = (q: PromiseLike<{ data: unknown[] | null }>) => Promise.resolve(q).then(({ data }) => (data ?? []).length > 0);
  const [{ data: progres }, qcm, flashcards] = await Promise.all([
    db.from('course_progress')
      .select('cours_id, video_watched, fiche_read')
      .eq('user_id', userId)
      .in('cours_id', [...coursIds]),
    Promise.all(coursIds.map((id) => existe(db
      .from('qcm_attempts')
      .select('id, qcm_questions!inner(qcm_series!inner(cours_id))')
      .eq('user_id', userId)
      .eq('qcm_questions.qcm_series.cours_id', id)
      .limit(1)))),
    Promise.all(coursIds.map((id) => existe(db
      .from('flashcard_reviews')
      .select('id, flashcards!inner(cours_id)')
      .eq('user_id', userId)
      .eq('flashcards.cours_id', id)
      .limit(1)))),
  ]);
  const parCours = new Map(
    ((progres ?? []) as { cours_id: string; video_watched: boolean | null; fiche_read: boolean | null }[])
      .map((p) => [p.cours_id, p]),
  );
  coursIds.forEach((id, i) => {
    const p = parCours.get(id);
    out.set(id, { video: !!p?.video_watched, fiche: !!p?.fiche_read, qcm: qcm[i], flashcards: flashcards[i] });
  });
  return out;
}

/**
 * La page d'interrogation s'ouvre-t-elle, pour chacun de ces cours ? Mêmes
 * contrôles, dans le même ordre, que la page : cours lisible (RLS) et rattaché à
 * un collège, accès au collège, à l'item, à l'interrogation par la formule, puis
 * les quatre étapes du parcours (sauf contournement Pneumologie).
 *
 * `db` est le client de l'ÉLÈVE ; `profil` son rôle et son `permission_scope`.
 */
export async function ouverturesInterrogation(
  db: AnyClient,
  profil: ProfilInterrogation,
  coursIds: readonly string[],
): Promise<Map<string, OuvertureInterrogation>> {
  const out = new Map<string, OuvertureInterrogation>();
  if (coursIds.length === 0) return out;
  const estAdmin = profil.role === 'admin';
  const scope = parseScope(profil.permission_scope);
  const [lus, formuleOuvre, prerequis] = await Promise.all([
    db.from('cours')
      .select('id, titre, matiere_id, matieres(nom)')
      .in('id', [...coursIds])
      .then(({ data, error }) => {
        if (error) console.error('[interrogation] cours illisibles', error.message);
        // Relation n→1 (`cours.matiere_id`) : PostgREST renvoie un objet, `null`
        // quand la RLS masque le collège — comme la page, qui répondait alors 404.
        type Row = CoursInterrogation & { matieres: { nom: string } | null };
        return new Map(((data ?? []) as unknown as Row[])
          .filter((c) => !!c.matieres)
          .map((c) => [c.id, { id: c.id, titre: c.titre, matiere_id: c.matiere_id }]));
      }),
    estAdmin ? true : fetchContentAccessForScopeWith(db, scope).then((a) => a.interrogation),
    prerequisInterrogation(db, profil.id, coursIds.filter((id) => id !== PNEUMO_COURS_ID)),
  ]);
  for (const id of coursIds) {
    out.set(id, decisionOuverture({
      cours: lus.get(id) ?? null,
      estAdmin,
      scope,
      formuleOuvre,
      prerequis: prerequis.get(id) ?? AUCUN_PREREQUIS,
    }));
  }
  return out;
}

/** Interrogation composée, telle que la page la passe au moteur d'épreuve. */
export type InterrogationComposee = {
  id: string;
  title: string;
  qroc_mode: 'self' | 'ai';
  instructions: string;
  duration_minutes: number | null;
  question_order: 'fixed' | 'random';
};

/**
 * Interrogations COMPOSÉES (`mock_exams.cours_id`) publiées sur ces cours et
 * comptant au moins une question, par cours. Lues en service-role, comme la
 * page. Un cours qui en porte plusieurs (création concurrente) n'en a aucune :
 * la page les lisait par `maybeSingle()`, sans résultat sur plusieurs lignes,
 * et passait au tirage automatique.
 */
export async function interrogationsComposees(
  coursIds: readonly string[],
): Promise<Map<string, InterrogationComposee>> {
  const out = new Map<string, InterrogationComposee>();
  if (coursIds.length === 0) return out;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data, error } = await admin
    .from('mock_exams')
    .select('id, cours_id, title, qroc_mode, instructions, duration_minutes, question_order, mock_exam_questions(count)')
    .in('cours_id', [...coursIds])
    .eq('status', 'published');
  if (error) {
    console.error('[interrogation] interrogations composées illisibles', error.message);
    return out;
  }
  type Row = InterrogationComposee & { cours_id: string; mock_exam_questions: { count: number }[] | null };
  const parCours = new Map<string, Row[]>();
  for (const row of (data ?? []) as Row[]) {
    const liste = parCours.get(row.cours_id);
    if (liste) liste.push(row);
    else parCours.set(row.cours_id, [row]);
  }
  for (const [coursId, rows] of parCours) {
    if (rows.length !== 1) continue;
    const [{ id, title, qroc_mode, instructions, duration_minutes, question_order, mock_exam_questions }] = rows;
    if ((mock_exam_questions?.[0]?.count ?? 0) === 0) continue;
    out.set(coursId, { id, title, qroc_mode, instructions, duration_minutes, question_order });
  }
  return out;
}

export type QuestionDuVivier = { id: string; serie_id: string };

export type VivierDuCours = {
  /** Séries du cours visibles de l'élève, pour `tirerQuestionsIsolees`. */
  series: (SerieForme & { id: string })[];
  /** Le vivier (`vivierInterrogation`) — identifiants seulement. */
  questions: QuestionDuVivier[];
};

/**
 * Vivier du tirage automatique, par cours. `db` est le client de l'ÉLÈVE (RLS).
 *
 * Toutes les questions des séries isolées sont lues, par tranches
 * (`fetchAllRows`) : aucune limite ne coupe le vivier, qui est donc le même pour
 * la page et pour le verrou. Identifiants seulement : la page ne charge en
 * entier que les N questions tirées.
 *
 * Une lecture en échec donne un vivier vide — l'interrogation est alors « sans
 * question », jamais un verrou sur une page qu'on n'a pas pu lire.
 */
export async function viviersInterrogation(
  db: AnyClient,
  coursIds: readonly string[],
): Promise<Map<string, VivierDuCours>> {
  const vide = () => new Map<string, VivierDuCours>(coursIds.map((id) => [id, { series: [], questions: [] }]));
  if (coursIds.length === 0) return vide();
  try {
    type SerieRow = SerieRowForme & { cours_id: string };
    const seriesRows = await fetchAllRows<SerieRow>((from, to) => db
      .from('qcm_series')
      .select('id, cours_id, label, type, vignette, qcm_questions(count)')
      .in('cours_id', [...coursIds])
      .order('id')
      .range(from, to));

    const out = vide();
    const coursDeSerie = new Map<string, string>();
    for (const row of seriesRows) {
      const vivier = out.get(row.cours_id);
      if (!vivier) continue;
      vivier.series.push(formeDeSerie(row));
      coursDeSerie.set(row.id, row.cours_id);
    }

    const isolees = [...out.values()].flatMap((v) => v.series.filter(estSerieDeQuestionsIsolees).map((s) => s.id));
    type QuestionRow = QuestionDuVivier & { qcm_items: { count: number }[] | null };
    const parCours = new Map<string, QuestionRow[]>();
    for (let i = 0; i < isolees.length; i += TRANCHE_SERIES) {
      const tranche = isolees.slice(i, i + TRANCHE_SERIES);
      const rows = await fetchAllRows<QuestionRow>((from, to) => db
        .from('qcm_questions')
        .select('id, serie_id, qcm_items(count)')
        .in('serie_id', tranche)
        .order('id')
        .range(from, to));
      for (const q of rows) {
        const coursId = coursDeSerie.get(q.serie_id);
        if (!coursId) continue;
        const liste = parCours.get(coursId);
        if (liste) liste.push(q);
        else parCours.set(coursId, [q]);
      }
    }

    for (const [coursId, vivier] of out) {
      vivier.questions = vivierInterrogation(parCours.get(coursId) ?? [], vivier.series, (q) => q.qcm_items?.[0]?.count ?? 0)
        .map(({ id, serie_id }) => ({ id, serie_id }));
    }
    return out;
  } catch (e) {
    console.error('[interrogation] vivier illisible', e instanceof Error ? e.message : e);
    return vide();
  }
}

/** Question de l'interrogation automatique, propositions dans l'ordre des lettres. */
export type QuestionTiree = {
  id: string;
  enonce: string;
  /** Documents de l'énoncé (ECG, radiographie, cliché…). */
  images: string[];
  items: { id: string; lettre: string; enonce: string; is_correct: boolean; images: string[] }[];
};

/**
 * Tirage de l'interrogation automatique : `n` questions du vivier
 * (`tirerQuestionsIsolees`), chargées en entier, dans l'ordre du tirage. Un item
 * qui compte moins de `n` questions isolées en sert moins, sans compléter avec
 * des questions de dossier.
 */
export async function questionsDuTirage(
  db: AnyClient,
  vivier: VivierDuCours,
  n: number = N_QUESTIONS_INTERROGATION,
): Promise<QuestionTiree[]> {
  const tirees = tirerQuestionsIsolees(vivier.questions, vivier.series, n);
  if (tirees.length === 0) return [];
  const { data } = await db
    .from('qcm_questions')
    .select('id, enonce, images, qcm_items(id, lettre, enonce, is_correct, images)')
    .in('id', tirees.map((q) => q.id));
  type Row = {
    id: string;
    enonce: string;
    images: string[] | null;
    qcm_items: { id: string; lettre: string; enonce: string; is_correct: boolean; images: string[] | null }[] | null;
  };
  const parId = new Map(((data ?? []) as Row[]).map((q) => [q.id, q]));
  return tirees.flatMap(({ id }) => {
    const q = parId.get(id);
    if (!q) return [];
    return [{
      id: q.id,
      enonce: q.enonce,
      images: q.images ?? [],
      items: [...(q.qcm_items ?? [])]
        .sort((a, b) => a.lettre.localeCompare(b.lettre))
        .map((it) => ({ id: it.id, lettre: it.lettre, enonce: it.enonce, is_correct: it.is_correct, images: it.images ?? [] })),
    }];
  });
}

/**
 * Premier cours de `coursIds` — une tranche du verrou, dans son ordre — dont
 * l'interrogation a au moins une question ; `null` si aucun. Un cours sans
 * question est passé, le suivant est examiné.
 */
async function premierCoursAvecInterrogation(
  db: AnyClient,
  coursIds: readonly string[],
): Promise<string | null> {
  const [composees, viviers] = await Promise.all([
    interrogationsComposees(coursIds),
    viviersInterrogation(db, coursIds),
  ]);
  return coursIds.find((id) => composees.has(id) || (viviers.get(id)?.questions.length ?? 0) > 0) ?? null;
}

/**
 * Verrou de fin de parcours — layout élève web ET `/api/mobile/gates` : le cours
 * dont l'interrogation retient l'élève, ou `null`.
 *
 * Candidats : vidéo vue et fiche lue, certificat non signé. Retenu : le premier
 * que la page ouvre (`ouverturesInterrogation` — un cours dont l'élève a perdu
 * l'accès, ou dont le parcours n'est pas fini, est passé) et qui a des
 * questions. Ordre stable (identifiant du cours) : le verrou désigne le même
 * cours d'une page à l'autre, sur le web comme sur l'app.
 *
 * `db` est le client de l'ÉLÈVE (cookie sur le web, `auth.supabase` pour les
 * gates) : c'est celui avec lequel la page lit tout ce qui la décide.
 */
export async function interrogationEnAttente(
  db: AnyClient,
  profil: ProfilInterrogation,
): Promise<string | null> {
  const [{ data: progres, error: e1 }, { data: completions, error: e2 }] = await Promise.all([
    db.from('course_progress')
      .select('cours_id')
      .eq('user_id', profil.id)
      .eq('video_watched', true)
      .eq('fiche_read', true)
      .order('cours_id'),
    db.from('parcours_completions')
      .select('cours_id, certificate_signed_at')
      .eq('user_id', profil.id),
  ]);
  // Sans les certificats, un parcours déjà signé passerait pour « à signer » :
  // jamais de verrou sur une lecture en échec.
  if (e1 || e2) {
    console.error('[interrogation] verrou illisible', (e1 ?? e2)?.message);
    return null;
  }
  const candidats = candidatsDuVerrou(
    (progres ?? []) as { cours_id: string }[],
    (completions ?? []) as { cours_id: string; certificate_signed_at: string | null }[],
  );
  // Par tranches, jusqu'au premier cours retenu : ce layout s'exécute à chaque
  // page. Le cas courant (un parcours terminé) ne coûte qu'une tranche, et un
  // élève qui a vu la vidéo et lu la fiche de nombreux cours sans les finir, ou
  // dont aucun parcours terminé n'a de question (voie externe), ne déclenche
  // pas deux requêtes par cours d'un seul coup.
  for (let i = 0; i < candidats.length; i += TRANCHE_VERROU) {
    const tranche = candidats.slice(i, i + TRANCHE_VERROU);
    const ouvertures = await ouverturesInterrogation(db, profil, tranche);
    const ouverts = tranche.filter((id) => ouvertures.get(id)?.ok);
    const cours = ouverts.length > 0 ? await premierCoursAvecInterrogation(db, ouverts) : null;
    if (cours) return cours;
  }
  return null;
}
