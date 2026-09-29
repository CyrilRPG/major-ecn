import Link from 'next/link';
import type { ReactElement } from 'react';
import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { createClient } from '@/lib/supabase/server';
import { parseScope } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/navigator';
import { getMaintienStats, getStudiedSpecialties, loadStudentAttempts } from '@/lib/pedago/maintien';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { transversalSessionSize, requiredReevaluationKind, SEUIL_REEVALUATION } from '@/lib/pedago/status';
import { aplatirUnites, choisirUnites, dossiersDepuisSeries, formeDeSerie, regrouperEnUnites, type PositionDossier, type SerieRowForme } from '@/lib/pedago/dossiers';
import {
  COLONNES_REPRISE, TABLE_REPRISE, decoderSuite, encoderSuite, etatDeReprise, repriseUtilisable,
  type EtatReprise, type RepriseTransversale,
} from '@/lib/pedago/reprise-transversale';
import { questionsAEcarter } from '@/lib/qcm/donnees-manquantes';
import {
  TransversalSession,
  type TransversalQuestion,
} from '@/components/student/transversal-session';
import type { TransversalKind } from './actions';

const VALID_KINDS: TransversalKind[] = ['daily', 'recommended', 'intensive', 'reevaluation', 'reevaluation_deep', 'bilan_global'];

type PoolRow = {
  id: string;
  serie_id: string;
  order_index: number;
  format: 'qcm' | 'qroc' | null;
  qcm_items: { count: number }[] | null;
  qcm_series: { cours: { matieres: { id: string; semestres: { faculte_id: string } } } };
};

/**
 * Questions (sans énoncé) et séries des cours étudiés, sous la RLS de l'élève.
 * Un appel à `vivier_revisions_cours` ; repli sur l'ancienne lecture par
 * tranches si la fonction manque.
 */
async function chargerVivier(
  supabase: Awaited<ReturnType<typeof createClient>>,
  coursIds: string[],
): Promise<[PoolRow[], SerieRowForme[]]> {
  type Vivier = {
    questions: { id: string; serie_id: string; order_index: number; format: 'qcm' | 'qroc' | null; n_items: number; matiere_id: string; faculte_id: string }[];
    series: { id: string; label: string | null; type: string | null; vignette: string | null; n_questions: number }[];
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any).rpc('vivier_revisions_cours', { p_cours_ids: coursIds });
  if (!error && data) {
    const v = data as Vivier;
    return [
      v.questions.map((q) => ({
        id: q.id, serie_id: q.serie_id, order_index: q.order_index, format: q.format,
        qcm_items: [{ count: q.n_items }],
        qcm_series: { cours: { matieres: { id: q.matiere_id, semestres: { faculte_id: q.faculte_id } } } },
      })),
      v.series.map((s) => ({ id: s.id, label: s.label, type: s.type, vignette: s.vignette, qcm_questions: [{ count: s.n_questions }] })),
    ];
  }

  const COURS_PAR_TRANCHE = 50;
  const tranches: string[][] = [];
  for (let i = 0; i < coursIds.length; i += COURS_PAR_TRANCHE) tranches.push(coursIds.slice(i, i + COURS_PAR_TRANCHE));
  return Promise.all([
    Promise.all(tranches.map((ids) =>
      fetchAllRows<PoolRow>((from, to) =>
        supabase
          .from('qcm_questions')
          .select('id, serie_id, order_index, format, qcm_items(count), qcm_series!inner(cours_id, cours!inner(matieres!inner(id, semestres!inner(faculte_id))))')
          .in('qcm_series.cours_id', ids)
          .order('id', { ascending: true })
          .range(from, to) as never,
      ),
    )).then((r) => r.flat()),
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
  ]);
}

type QRow = {
  id: string;
  enonce: string;
  order_index: number;
  format: 'qcm' | 'qroc' | null;
  reponse_attendue: string | null;
  correction_generale: string | null;
  commentaire_enseignant: string | null;
  /** Documents de l'énoncé (ECG, radio, cliché…) : sans eux la question est
   *  souvent impossible à traiter (« Vous faites réaliser l'ECG suivant »). */
  images: string[] | null;
  qcm_items: { id: string; lettre: string; enonce: string; justification: string; is_correct: boolean; images: string[] | null }[] | null;
  qcm_series: {
    cours_id: string;
    label: string | null;
    /** Contexte clinique partagé du dossier progressif (l'« énoncé » du dossier). */
    vignette: string | null;
    cours: { matieres: { id: string; nom: string; semestres: { faculte_id: string } } };
  };
};

export default async function TransversalSessionPage({
  searchParams,
}: { searchParams: Promise<{ kind?: string }> }) {
  const { user, profile } = await requireUser();
  const scope = parseScope(profile.permission_scope);
  const sp = await searchParams;
  let kind: TransversalKind = (VALID_KINDS.includes(sp.kind as TransversalKind)
    ? sp.kind
    : 'daily') as TransversalKind;

  const supabase = await createClient();
  const unitLabel = scope.voie === 'externe' ? 'QROC' : 'QCM';

  /* 1) Spécialités étudiées (par matière) + état de maintien des acquis.
        Les tentatives sont lues INTÉGRALEMENT (par tranches de 1 000) et une
        seule fois : elles servent aux spécialités ET au choix des questions. */
  const attempts = await loadStudentAttempts(supabase as never, user.id);
  const [specs, stats] = await Promise.all([
    getStudiedSpecialties(supabase as never, user.id, scope, attempts),
    getMaintienStats(supabase as never, user.id),
  ]);

  // Section 15 : au-delà de 14 jours sans révision, la seule session possible
  // est la réévaluation exigée (30/50/75 questions selon l'ancienneté) — une
  // révision du jour ne doit pas lever le blocage à sa place.
  if (stats.daysSinceLast !== null && stats.daysSinceLast >= SEUIL_REEVALUATION) {
    kind = requiredReevaluationKind(stats.daysSinceLast);
  }

  /* 2) Vivier vide : écran EXPLICITE (plus de redirection silencieuse). */
  if (specs.length === 0) {
    return (
      <ExplainScreen
        title="Aucune spécialité étudiée pour le moment"
        body={`Les révisions transversales piochent des ${unitLabel} dans les spécialités que vous avez déjà étudiées. Commencez par regarder un cours, lire une fiche ou répondre à une série de ${unitLabel} dans une spécialité : votre révision du jour se débloquera automatiquement.`}
        ctaHref="/facultes"
        ctaLabel="Découvrir les spécialités"
      />
    );
  }

  /* 2 bis) Session entamée sur un autre appareil (ou avant un rechargement) :
        on reprend LA MÊME suite de questions, là où l'élève s'était arrêtée,
        au lieu d'en tirer une nouvelle. Table absente ou illisible = on
        retombe sur le tirage, comme avant. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;
  const { data: repriseLue } = await db
    .from(TABLE_REPRISE)
    .select(COLONNES_REPRISE)
    .eq('user_id', user.id)
    .eq('kind', kind)
    .maybeSingle();
  const reprise: RepriseTransversale | null = repriseUtilisable(repriseLue) ? repriseLue : null;

  type Suite = { question: { id: string }; dossier: PositionDossier | null }[];

  /* 3 à 5) Tirage d'une nouvelle suite — ou l'écran qui explique pourquoi le
        vivier ne permet aucune session. */
  const tirerSuite = async (): Promise<{ suite: Suite; targetN: number } | { ecran: ReactElement }> => {
    const studiedCoursIds = specs.flatMap((s) => s.studiedCoursIds);

    /* 3) Historique de réponses : jamais vu / raté / ancien, par question. */
    type AttemptStat = { seen: number; fails: number; last: number };
    const attemptStats = new Map<string, AttemptStat>();
    for (const a of attempts) {
      const cur = attemptStats.get(a.question_id) ?? { seen: 0, fails: 0, last: 0 };
      cur.seen++;
      if (!a.is_correct) cur.fails++;
      const t = new Date(a.attempted_at).getTime();
      if (t > cur.last) cur.last = t;
      attemptStats.set(a.question_id, cur);
    }

    /* 4) Questions EDN accessibles dans les cours étudiés.

          POURQUOI CETTE FORME. L'ancienne version listait d'abord les séries des
          cours étudiés puis demandait les questions « dont serie_id est dans la
          liste ». Chez un élève assidu (41 cours, 1 360 séries le 13/09/2026),
          la liste des séries était tronquée à 1 000 par PostgREST, et l'URL de
          la seconde requête (37 Ko d'identifiants) était refusée : la page
          concluait « Aucune question disponible pour votre profil » alors que
          près de 7 000 questions étaient accessibles. On filtre désormais les
          questions par COURS (liste courte, par tranches de 50), on lit toutes
          les pages de 1 000 lignes, sans embarquer les énoncés ni les items —
          seules les questions retenues sont ensuite chargées en entier. */
    //
    // Depuis le 29/09/2026 (audit de lenteur) : une seule fonction SQL,
    // `vivier_revisions_cours` (SECURITY INVOKER, même RLS que PostgREST),
    // renvoie les questions ET les séries des cours étudiés — les identifiants
    // partent dans le corps de la requête. Les tranches OFFSET coûtaient 6,8 s
    // à l'élève le plus avancé (336 cours), 1,6 s désormais, résultat identique.
    // L'ancienne lecture reste le repli si la fonction manque.
    //
    // Les séries : TOUTES celles des cours étudiés, avec ce qui décide de leur
    // forme (vignette, libellé, type) et leur nombre TOTAL de questions. Seule
    // une série de questions isolées se pioche question par question ; toute
    // autre (dossier progressif, annale, entraînement, séance, sujet long) est
    // servie entière ou pas du tout — règle du 18/09/2026 précisée le
    // 20/09/2026 (annales servies question par question), voir
    // lib/pedago/dossiers.ts.
    const [pool, serieRows] = await chargerVivier(supabase, studiedCoursIds);
    const dossiers = dossiersDepuisSeries(serieRows.map(formeDeSerie));

    if (pool.length === 0) {
      return { ecran: (
        <ExplainScreen
          title={`Aucune série de ${unitLabel} disponible`}
          body={`Les spécialités que vous avez étudiées ne contiennent pas encore de ${unitLabel} accessibles pour la révision transversale. Poursuivez votre progression dans les cours : les questions apparaîtront ici dès qu'elles seront disponibles.`}
          ctaHref="/revisions-transversales"
          ctaLabel="Retour au dashboard"
        />
      ) };
    }

    const accessibleMatieres = new Set(specs.map((s) => s.matiereId));
    const allQ = pool.filter((q) => {
      const m = q.qcm_series.cours.matieres;
      if (m.semestres.faculte_id !== EDN_FACULTE_ID) return false;
      if (!accessibleMatieres.has(m.id)) return false;
      // On garde les QCM (avec items) ET les QROC (saisie libre, sans items).
      const isQroc = q.format === 'qroc';
      if (!isQroc && (q.qcm_items?.[0]?.count ?? 0) === 0) return false;
      return true;
    });

    if (allQ.length === 0) {
      return { ecran: (
        <ExplainScreen
          title={`Aucune question disponible pour votre profil`}
          body={`Aucun ${unitLabel} n'est disponible dans le périmètre de vos spécialités étudiées. Si le problème persiste, contactez l'équipe pédagogique.`}
          ctaHref="/revisions-transversales"
          ctaLabel="Retour au dashboard"
        />
      ) };
    }

    const targetN = transversalSessionSize(kind, specs.length);
    const N = Math.min(targetN, allQ.length);

    /* 5) Sélection — priorités du cahier des charges (section 3) :
          1. questions jamais vues ;
          2. questions déjà ratées (les plus ratées d'abord) ;
          3. questions anciennes (dernière tentative > 30 jours) ;
          4. spécialités fragiles/insuffisantes privilégiées ;
          5. spécialités validées mais peu revues récemment.
       Implémentation : score = rang de priorité principal + pondération de la
       spécialité + bruit aléatoire léger (varier les sessions).

       UNITÉ DE SÉLECTION (règle du 18/09/2026, précisée le 20/09/2026) : une
       question isolée pour les séries de questions isolées ; la SÉRIE ENTIÈRE,
       dans l'ordre, pour tout le reste (dossiers progressifs, annales,
       entraînements, séances, sujets longs) — une question servie hors de son
       sujet n'a pas les éléments pour être traitée. Une série incomplète est
       écartée, jamais tronquée. */
    const now = Date.now();
    const days30Ms = 30 * 86_400_000;

    // Pondération par spécialité : insuffisante < fragile < non évaluée < validée,
    // et parmi les validées, la moins revue récemment d'abord.
    const specWeight = new Map<string, number>();
    for (const s of specs) {
      let w: number;
      if (s.officialStatus === 'insuffisante') w = 0;
      else if (s.officialStatus === 'fragile') w = 0.5;
      else if (s.officialStatus === null) w = 1.5;
      else {
        // Validée : 2 (revue il y a longtemps) → 3 (revue aujourd'hui).
        const daysSinceActivity = s.lastActivity ? (now - s.lastActivity.getTime()) / 86_400_000 : 60;
        w = 3 - Math.min(1, daysSinceActivity / 30);
      }
      specWeight.set(s.matiereId, w);
    }

    const scoreDe = (q: PoolRow): number => {
      const st = attemptStats.get(q.id);
      let bucket: number;
      if (!st) bucket = 0;                                     // jamais vue
      else if (st.fails > 0) bucket = 1;                       // déjà ratée
      else if (now - st.last > days30Ms) bucket = 2;           // ancienne
      else bucket = 3;                                         // récente et réussie
      const failBoost = st ? Math.min(0.9, st.fails * 0.3) : 0;
      const w = specWeight.get(q.qcm_series.cours.matieres.id) ?? 1.5;
      // Déterministe : le bruit qui varie les sessions est tiré par choisirUnites,
      // une fois par unité (sinon un dossier le moyennait et ne sortait jamais).
      return bucket * 10 + w - failBoost;
    };

    const { unites, dossiersIncomplets } = regrouperEnUnites(allQ, dossiers);
    if (dossiersIncomplets.length > 0) {
      console.warn('[revisions-transversales] dossiers incomplets écartés du vivier', dossiersIncomplets.length);
    }
    // Le mélange de l'ordre de passage se fait PAR UNITÉ : on conserve la
    // sélection prioritaire, les dossiers restent d'un seul tenant, et l'élève
    // n'enchaîne pas 25 questions jamais vues puis 15 ratées.
    const suite = aplatirUnites(choisirUnites(unites, scoreDe, N));
    if (suite.length === 0) {
      // Vivier non vide mais fait de sujets complets (dossiers, annales) bien
      // plus longs que la session : un écran qui le dit, jamais un « 0/0 ».
      return { ecran: (
        <ExplainScreen
          title="Aucune série ne tient dans cette session"
          body={`Les ${unitLabel} de vos spécialités étudiées sont regroupés en sujets complets (dossiers progressifs, annales) bien plus longs que cette session de ${targetN} questions. Poursuivez votre progression dans les cours : de nouvelles questions viendront l'alimenter.`}
          ctaHref="/revisions-transversales"
          ctaLabel="Retour au dashboard"
        />
      ) };
    }
    return { suite, targetN };
  };

  /* 6) Chargement complet des seules questions retenues (N ≤ 120). */
  const construireQuestions = async (suite: Suite): Promise<TransversalQuestion[]> => {
    const retenues = suite.map((r) => r.question.id);
    if (retenues.length === 0) return [];
    const { data: fullRaw } = await supabase
      .from('qcm_questions')
      .select('id, enonce, order_index, format, reponse_attendue, correction_generale, commentaire_enseignant, images, qcm_items(id, lettre, enonce, justification, is_correct, images), qcm_series!inner(cours_id, label, vignette, cours!inner(matieres!inner(id, nom, semestres!inner(faculte_id))))')
      .in('id', retenues);
    const parId = new Map(((fullRaw ?? []) as unknown as QRow[]).map((q) => [q.id, q]));

    // Un dossier dont une question n'aurait pas été rechargée serait servi
    // amputé : on écarte alors le dossier entier, comme au regroupement.
    const seriesAmputees = new Set(
      suite.filter((r) => r.dossier && !parId.has(r.question.id)).map((r) => r.dossier!.serieId),
    );

    // Filet de sécurité : jamais de question qui demande un document ou des
    // résultats invisibles (« Interprétez les gaz du sang » sans gaz) — voir
    // lib/qcm/donnees-manquantes. Le dossier entier est écarté.
    const incompletes = questionsAEcarter(suite, parId);

    return suite.flatMap(({ question, dossier }) => {
      const q = parId.get(question.id);
      if (!q || (dossier && seriesAmputees.has(dossier.serieId)) || incompletes.has(question.id)) return [];
      return [{
        id: q.id,
        enonce: q.enonce,
        vignette: q.qcm_series.vignette,
        dossier: dossier
          ? { serie_id: dossier.serieId, label: q.qcm_series.label, position: dossier.position, total: dossier.total }
          : null,
        college: q.qcm_series.cours.matieres.nom,
        matiere_id: q.qcm_series.cours.matieres.id,
        cours_id: q.qcm_series.cours_id,
        format: q.format ?? 'qcm',
        reponse_attendue: q.reponse_attendue,
        correction_generale: q.correction_generale,
        commentaire_enseignant: q.commentaire_enseignant,
        images: q.images ?? [],
        items: [...(q.qcm_items ?? [])]
          .map((it) => ({ id: it.id, lettre: it.lettre, enonce: it.enonce, justification: it.justification, is_correct: it.is_correct, images: it.images ?? [] }))
          .sort((a, b) => a.lettre.localeCompare(b.lettre)),
      }];
    });
  };

  // Point de reprise : dans les questions RECONSTRUITES (un dossier a pu être
  // écarté depuis). Une reprise dont il ne reste plus rien à répondre — ses
  // questions restantes retirées entre-temps — cède la place à un tirage neuf,
  // au lieu de servir une session vide ou déjà faite.
  let questions: TransversalQuestion[] = [];
  let targetN = 0;
  let etatInitial: EtatReprise | null = null;
  if (reprise) {
    questions = await construireQuestions(decoderSuite(reprise.suite));
    targetN = reprise.suite.length;
    etatInitial = etatDeReprise(reprise, questions);
  }
  if (!etatInitial) {
    const tirage = await tirerSuite();
    if ('ecran' in tirage) return tirage.ecran;
    questions = await construireQuestions(tirage.suite);
    targetN = tirage.targetN;
    if (questions.length === 0) {
      return (
        <ExplainScreen
          title="Aucune question disponible pour votre profil"
          body={`Les ${unitLabel} retenus pour cette session n'ont pas pu être chargés. Réessayez dans un instant ; si le problème persiste, contactez l'équipe pédagogique.`}
          ctaHref="/revisions-transversales"
          ctaLabel="Retour au dashboard"
        />
      );
    }
    // Nouvelle session : on inscrit sa suite, pour qu'un autre appareil la
    // retrouve.
    const maintenant = new Date().toISOString();
    const { error } = await db.from(TABLE_REPRISE).upsert({
      user_id: user.id,
      kind,
      suite: encoderSuite(questions),
      answered: 0,
      score: 0,
      per_cours: {},
      per_matiere: {},
      started_at: maintenant,
      updated_at: maintenant,
    }, { onConflict: 'user_id,kind' });
    if (error) console.warn('[revisions-transversales] reprise non enregistrée', error.message);
  }

  // Statut officiel par spécialité — conditionne les boutons de fin de session
  // (« Consolider » si déjà orange officiellement, « Renforcement » si rouge).
  const officialStatuses: Record<string, 'validee' | 'fragile' | 'insuffisante'> = {};
  for (const s of specs) {
    if (s.officialStatus) officialStatuses[s.matiereId] = s.officialStatus;
  }

  return (
    <TransversalSession
      questions={questions}
      kind={kind}
      targetCount={targetN}
      unitLabel={unitLabel}
      officialStatuses={officialStatuses}
      reprise={etatInitial}
    />
  );
}

/** Écran explicite : remplace les anciennes redirections silencieuses. */
function ExplainScreen({
  title, body, ctaHref, ctaLabel,
}: { title: string; body: string; ctaHref: string; ctaLabel: string }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F1E8FD] text-[#6D28D9]">
        <BookOpen className="h-7 w-7" />
      </span>
      <h1 className="mt-6 text-xl font-black tracking-tight text-(--color-ink)">{title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-(--color-ink-soft)">{body}</p>
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href={ctaHref}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-4 py-3 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.01]"
        >
          {ctaLabel} <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/revisions-transversales"
          className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-(--color-ink-soft) hover:text-(--color-ink)"
        >
          <ArrowLeft className="h-4 w-4" /> Retour aux révisions transversales
        </Link>
      </div>
    </div>
  );
}
