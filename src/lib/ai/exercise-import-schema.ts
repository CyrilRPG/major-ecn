/**
 * Import d'exercices — schéma de sortie, découpage en lots et fusion.
 *
 * MODULE PUR : aucune dépendance serveur, pour être vérifiable hors Next
 * (`tests/exercise-import-*.test.ts`). L'appel au modèle vit dans
 * `exercise-import.ts`, l'orchestration dans la route `analyse`.
 *
 * POURQUOI DES LOTS (06/09/2026)
 * -----------------------------
 * L'analyse envoyait le document ENTIER en une requête et attendait un seul
 * JSON. Sur un sujet de 160 pages, la réponse s'arrêtait après une trentaine
 * de pages : plafond de sortie, ou modèle qui « résume » quand la tâche est
 * trop longue. Le document est désormais découpé en lots de quelques pages,
 * chaque lot est extrait séparément, et les résultats sont fusionnés ici.
 * Deux lots voisins se recouvrent d'une page pour qu'un exercice à cheval
 * soit vu en entier par au moins l'un des deux ; le modèle ne restitue que les
 * exercices qui COMMENCENT dans les pages « cœur » du lot, et la fusion
 * dédoublonne par sécurité.
 */

import { noteDuModele } from './exercise-import-verite-texte';

/* ─────────── Schéma JSON (sorties structurées) ─────────── */

/**
 * Règles de forme, communes aux sorties structurées d'Anthropic et au mode
 * strict d'OpenAI (cf. tests) : tout objet porte `additionalProperties: false`
 * et son `required` énumère TOUTES ses propriétés. Un champ facultatif est donc
 * un type nullable, jamais une clé absente de `required`.
 */
const IMAGE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['source_page', 'source_description', 'placement', 'item_letter'],
  properties: {
    source_page: { type: ['integer', 'null'] },
    source_description: { type: 'string' },
    placement: { type: 'string', enum: ['question', 'item', 'correction'] },
    item_letter: { type: ['string', 'null'] },
  },
} as const;

const ITEM_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['lettre', 'enonce', 'is_correct', 'justification', 'images'],
  properties: {
    lettre: { type: 'string' },
    enonce: { type: 'string' },
    is_correct: { type: 'boolean' },
    justification: { type: 'string' },
    images: { type: 'array', items: IMAGE_SCHEMA },
  },
} as const;

export const outputSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['questions', 'warnings'],
  properties: {
    warnings: { type: 'array', items: { type: 'string' } },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'client_id', 'numero_source', 'source_pages', 'format', 'enonce', 'images', 'items',
          'reponse_attendue', 'correction_generale', 'warnings',
        ],
        properties: {
          client_id: { type: 'string' },
          /** Numéro de l'exercice tel qu'imprimé (« 12 », « Q3 », « DP 2 – Q4 »),
           *  `null` s'il n'y en a pas. Sert à recoller un corrigé séparé et à
           *  dédoublonner les lots qui se recouvrent. */
          numero_source: { type: ['string', 'null'] },
          source_pages: { type: 'array', items: { type: 'integer' } },
          format: { type: 'string', enum: ['qcm', 'qroc'] },
          enonce: { type: 'string' },
          reponse_attendue: { type: 'string' },
          correction_generale: { type: 'string' },
          warnings: { type: 'array', items: { type: 'string' } },
          images: { type: 'array', items: IMAGE_SCHEMA },
          items: { type: 'array', items: ITEM_SCHEMA },
        },
      },
    },
  },
} as const;

/**
 * Sortie de la passe « corrigé seul » (mode sujet + corrigé séparés, quand le
 * corrigé est trop long pour accompagner chaque lot du sujet).
 */
export const correctionsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['corrections', 'warnings'],
  properties: {
    warnings: { type: 'array', items: { type: 'string' } },
    corrections: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['numero_source', 'source_pages', 'lettres_justes', 'justifications', 'reponse_attendue', 'correction_generale'],
        properties: {
          numero_source: { type: 'string' },
          source_pages: { type: 'array', items: { type: 'integer' } },
          /** Lettres des propositions exactes (QCM), vide pour une QROC. */
          lettres_justes: { type: 'array', items: { type: 'string' } },
          justifications: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['lettre', 'texte'],
              properties: { lettre: { type: 'string' }, texte: { type: 'string' } },
            },
          },
          reponse_attendue: { type: 'string' },
          correction_generale: { type: 'string' },
        },
      },
    },
  },
} as const;

/* ─────────── Formes des résultats ─────────── */

export type ImportVoie = 'interne' | 'externe';

export type ImagePlacement = 'question' | 'item' | 'correction';

export type ImportedImage = {
  source_page: number | null;
  source_description: string;
  placement: ImagePlacement;
  item_letter?: string | null;
};

export type ImportedItem = {
  lettre: string;
  enonce: string;
  is_correct: boolean;
  justification: string;
  images: ImportedImage[];
};

export type ImportedQuestion = {
  client_id: string;
  numero_source?: string | null;
  source_pages: number[];
  format: 'qcm' | 'qroc';
  enonce: string;
  images: ImportedImage[];
  items: ImportedItem[];
  reponse_attendue: string;
  correction_generale: string;
  warnings: string[];
};

/** Gravité d'une alerte : `bloquant` empêche la publication en l'état. */
export type GraviteAlerte = 'bloquant' | 'a_relire' | 'info';

/**
 * Alerte structurée, parallèle aux `warnings` texte (conservés pour la
 * compatibilité). `question_client_id` désigne la question concernée quand
 * il y en a une.
 */
export type Alerte = {
  gravite: GraviteAlerte;
  code: string;
  message: string;
  question_client_id?: string;
};

export type ExerciseImportResult = {
  questions: ImportedQuestion[];
  warnings: string[];
  /** Alertes structurées, renseignées par `validate` (absentes des lots bruts). */
  alertes?: Alerte[];
};

export type ImportedCorrection = {
  numero_source: string;
  source_pages: number[];
  lettres_justes: string[];
  justifications: { lettre: string; texte: string }[];
  reponse_attendue: string;
  correction_generale: string;
};

export type CorrectionsResult = { corrections: ImportedCorrection[]; warnings: string[] };

/* ─────────── Découpage en lots ─────────── */

/** Pages par lot : assez pour garder le contexte d'un dossier progressif,
 *  assez peu pour que la réponse tienne largement dans le budget de sortie. */
export const PAGES_PAR_LOT = 8;
/** Recouvrement entre lots voisins, pour les exercices à cheval. */
export const RECOUVREMENT_PAGES = 1;

export type Lot = {
  /** Index 0-based, stable d'une reprise à l'autre. */
  index: number;
  /** Pages réellement envoyées (1-based, inclusives). */
  debut: number;
  fin: number;
  /** Pages dont les exercices sont attendus de CE lot (1-based, inclusives). */
  coeurDebut: number;
  coeurFin: number;
};

/**
 * Plan de découpage : cœurs disjoints qui couvrent 1..nbPages, chaque lot
 * élargi d'un recouvrement de part et d'autre. Déterministe : une reprise
 * après panne retrouve exactement les mêmes lots.
 */
export function planifierLots(nbPages: number, taille = PAGES_PAR_LOT, recouvrement = RECOUVREMENT_PAGES): Lot[] {
  if (!Number.isInteger(nbPages) || nbPages < 1) return [];
  const t = Math.max(1, Math.floor(taille));
  const r = Math.max(0, Math.floor(recouvrement));
  const lots: Lot[] = [];
  for (let debut = 1, index = 0; debut <= nbPages; debut += t, index++) {
    const coeurFin = Math.min(nbPages, debut + t - 1);
    lots.push({
      index,
      coeurDebut: debut,
      coeurFin,
      debut: Math.max(1, debut - r),
      fin: Math.min(nbPages, coeurFin + r),
    });
  }
  return lots;
}

/**
 * Découpe un texte brut (TXT, DOCX converti) en « pages » virtuelles de taille
 * bornée, en coupant de préférence à une frontière de paragraphe. Le résultat
 * est ensuite planifié comme un PDF (`planifierLots`), ce qui unifie les deux
 * chemins.
 */
export function paginerTexte(texte: string, taillePage = 6000): string[] {
  const propre = texte.replace(/\r\n?/g, '\n').trim();
  if (!propre) return [];
  const pages: string[] = [];
  let reste = propre;
  while (reste.length > taillePage) {
    // Coupe au dernier saut de paragraphe dans la fenêtre, sinon au dernier
    // saut de ligne, sinon brutalement.
    let coupe = reste.lastIndexOf('\n\n', taillePage);
    if (coupe < taillePage * 0.4) coupe = reste.lastIndexOf('\n', taillePage);
    if (coupe < taillePage * 0.4) coupe = taillePage;
    pages.push(reste.slice(0, coupe).trim());
    reste = reste.slice(coupe).trim();
  }
  if (reste) pages.push(reste);
  return pages;
}

/* ─────────── Fusion des lots ─────────── */

const normaliser = (s: string) =>
  String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * Numéro d'exercice comparable d'un document à l'autre : « Q12 », « Question
 * 12 », « 12. » et « n° 12 » désignent le même exercice ; « DP 2 – Q4 » et
 * « Dossier 2, question 4 » aussi (→ « 2-4 »). On ne garde que les suites de
 * chiffres, dans l'ordre ; sans chiffre, le texte alphanumérique brut.
 */
export function normaliserNumero(n: string | null | undefined): string {
  const brut = String(n ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const chiffres = brut.match(/\d+/g);
  if (chiffres && chiffres.length > 0) return chiffres.map((c) => String(Number(c))).join('-');
  return brut.replace(/[^a-z0-9]+/g, '');
}

/** Clé de dédoublonnage d'un exercice : numéro imprimé si présent, sinon les
 *  premiers mots de l'énoncé. Deux lots voisins peuvent restituer le même
 *  exercice à cheval sur leur page commune. */
export function cleExercice(q: Pick<ImportedQuestion, 'numero_source' | 'enonce'>): string {
  const numero = normaliserNumero(q.numero_source);
  const debut = normaliser(q.enonce).split(' ').slice(0, 12).join(' ');
  return numero ? `n:${numero}|${debut.slice(0, 40)}` : `e:${debut}`;
}

/**
 * Fusionne les résultats des lots dans l'ordre du document (`ordre` = première
 * page cœur, ce qui reste juste quand un lot a été scindé en cours de route).
 * Un doublon (même clé) garde la version la plus complète (plus de
 * propositions, corrigé plus long). Les avertissements des lots sont
 * conservés, préfixés du libellé du lot.
 */
export function fusionnerLots(lots: Array<{ ordre: number; label: string; result: ExerciseImportResult }>): ExerciseImportResult {
  const tri = [...lots].sort((a, b) => a.ordre - b.ordre);
  const vues = new Map<string, ImportedQuestion>();
  const ordre: string[] = [];
  const warnings: string[] = [];
  let doublons = 0;

  for (const lot of tri) {
    for (const w of lot.result.warnings ?? []) if (w?.trim()) warnings.push(`${lot.label} : ${w.trim()}`);
    for (const q of lot.result.questions ?? []) {
      const cle = cleExercice(q);
      const existante = vues.get(cle);
      if (!existante) { vues.set(cle, q); ordre.push(cle); continue; }
      doublons++;
      if (completude(q) > completude(existante)) vues.set(cle, q);
    }
  }
  if (doublons > 0) warnings.unshift(`${doublons} exercice(s) vu(s) dans deux lots voisins, fusionné(s).`);
  return { questions: ordre.map((c) => vues.get(c) as ImportedQuestion), warnings };
}

function completude(q: ImportedQuestion): number {
  return (q.items?.length ?? 0) * 10
    + (q.items ?? []).filter((i) => i.justification?.trim()).length
    + Math.min(5, Math.floor((q.correction_generale?.length ?? 0) / 100))
    + (q.reponse_attendue?.trim() ? 2 : 0);
}

/**
 * Applique un corrigé extrait séparément aux questions du sujet, par numéro
 * imprimé. Une question sans corrigé correspondant reçoit un avertissement ;
 * un corrigé orphelin est signalé une fois.
 */
export function appliquerCorrections(sujet: ExerciseImportResult, corrections: CorrectionsResult): ExerciseImportResult {
  const parNumero = new Map<string, ImportedCorrection>();
  for (const c of corrections.corrections ?? []) {
    const k = normaliserNumero(c.numero_source);
    if (k && !parNumero.has(k)) parNumero.set(k, c);
  }
  const utilises = new Set<string>();
  const questions = sujet.questions.map((q) => {
    const k = normaliserNumero(q.numero_source);
    const c = k ? parNumero.get(k) : undefined;
    if (!c) {
      return { ...q, warnings: [...(q.warnings ?? []), 'Aucun corrigé trouvé pour cet exercice dans le document de correction.'] };
    }
    utilises.add(k);
    const justes = new Set(c.lettres_justes.map((l) => normaliserLettre(l)).filter(Boolean) as string[]);
    const justifs = new Map(c.justifications.map((j) => [normaliserLettre(j.lettre), j.texte] as const));
    const items = q.items.map((it) => {
      const lettre = normaliserLettre(it.lettre) ?? it.lettre;
      return {
        ...it,
        is_correct: q.format === 'qcm' ? justes.has(lettre) : it.is_correct,
        justification: it.justification?.trim() || justifs.get(lettre) || '',
      };
    });
    return {
      ...q,
      items,
      reponse_attendue: q.reponse_attendue?.trim() || c.reponse_attendue || '',
      correction_generale: q.correction_generale?.trim() || c.correction_generale || '',
    };
  });
  const warnings = [...sujet.warnings, ...(corrections.warnings ?? []).map((w) => `Corrigé : ${w}`)];
  const orphelins = [...parNumero.keys()].filter((k) => !utilises.has(k)).length;
  if (orphelins > 0) warnings.push(`${orphelins} corrigé(s) sans exercice correspondant dans le sujet (numérotation différente ?).`);
  return { questions, warnings };
}

/* ─────────── Contrôle de ce que le modèle renvoie ─────────── */

const LETTRES = 'ABCDEFGHIJK';

/**
 * Ramène une lettre de proposition à une seule majuscule de A à K.
 * Les corrigés ne l'écrivent pas tous pareil : « A », « a », « A. », « A) »,
 * « (A) », et certains numérotent les propositions de 1 à 11. `null` quand
 * rien d'exploitable n'en ressort.
 */
export function normaliserLettre(brute: string): string | null {
  const net = String(brute ?? '').toUpperCase().replace(/[^A-K0-9]/g, '');
  if (net.length === 1 && /[A-K]/.test(net)) return net;
  const n = Number(net);
  if (Number.isInteger(n) && n >= 1 && n <= LETTRES.length) return LETTRES[n - 1];
  return null;
}

/**
 * Écart du rapport de fiabilité (`confronterALaSource`) tel que `validate`
 * en a besoin : forme structurelle, pour ne pas dépendre du module de
 * confrontation.
 */
export type EcartFiabilite = {
  gravite: GraviteAlerte;
  code: string;
  message: string;
  question_client_id: string | null;
};

export type OptionsValidation = {
  /** Écarts du rapport de fiabilité, remontés en alertes (« propositions manquantes » notamment). */
  ecarts?: EcartFiabilite[];
};

/**
 * Contrôle chaque question et ÉCARTE celles qui sont inexploitables, au lieu
 * d'interrompre tout l'import à la première. Chaque écart est consigné dans
 * les avertissements, visibles dans le détail de l'import, et doublé d'une
 * alerte structurée (`alertes`) avec sa gravité.
 *
 * Contrôles ajoutés le 10/09/2026 : une note de fabrication du modèle
 * (« [contexte manquant] », « d'après le corpus »…) dans un champ destiné aux
 * élèves est BLOQUANTE ; une liste de propositions que le rapport de
 * fiabilité dit tronquée l'est aussi.
 */
export function validate(result: ExerciseImportResult, voie: ImportVoie, options: OptionsValidation = {}): ExerciseImportResult {
  const wanted = voie === 'interne' ? 'qcm' : 'qroc';
  const seen = new Set<string>();
  const avertissements = [...(result.warnings ?? [])];
  const alertes: Alerte[] = [];
  const gardees: ImportedQuestion[] = [];
  const ecartsParQuestion = new Map<string, EcartFiabilite[]>();
  for (const e of options.ecarts ?? []) {
    if (!e.question_client_id) { alertes.push({ gravite: e.gravite, code: e.code, message: e.message }); continue; }
    const l = ecartsParQuestion.get(e.question_client_id) ?? []; l.push(e); ecartsParQuestion.set(e.question_client_id, l);
  }

  result.questions.forEach((q, index) => {
    const repere = `question ${index + 1}` + (q.enonce?.trim() ? ` (« ${q.enonce.trim().slice(0, 60)}… »)` : '');
    const ecarter = (raison: string) => {
      avertissements.push(`${repere} écartée : ${raison}`);
      alertes.push({ gravite: 'info', code: 'question_ecartee', message: `${repere} écartée : ${raison}`, ...(q.client_id ? { question_client_id: q.client_id } : {}) });
    };

    if (q.format !== wanted) { ecarter(`elle n'est pas au format ${wanted}`); return; }
    if (!q.enonce?.trim()) { ecarter('énoncé vide'); return; }

    const idInitial = q.client_id;
    q.client_id ||= crypto.randomUUID();
    if (seen.has(q.client_id)) q.client_id = crypto.randomUUID();
    seen.add(q.client_id);
    q.warnings = q.warnings ?? [];
    q.items = q.items ?? [];
    const alerter = (gravite: GraviteAlerte, code: string, message: string) => {
      // Un même écart ne compte qu'une fois par question (le rapport de
      // fiabilité et les contrôles ci-dessous peuvent relever la même note).
      if (alertes.some((a) => a.code === code && a.question_client_id === q.client_id)) return;
      alertes.push({ gravite, code, message, question_client_id: q.client_id });
    };
    // Les écarts du rapport ont été produits avant `validate` : ils portent
    // l'identifiant initial de la question (réattribué ci-dessus s'il doublait).
    for (const e of ecartsParQuestion.get(idInitial ?? '') ?? []) alerter(e.gravite, e.code, e.message);

    // Notes de fabrication : le modèle avoue qu'il n'a pas recopié le
    // document, ou commente sa propre extraction. Un élève ne doit jamais
    // lire cela : bloquant.
    const champs: Array<[string, string]> = [
      ['énoncé', q.enonce],
      ...q.items.flatMap((i): Array<[string, string]> => [[`proposition ${i.lettre}`, i.enonce], [`justification ${i.lettre}`, i.justification ?? '']]),
      ['corrigé général', q.correction_generale ?? ''],
      ['réponse attendue', q.reponse_attendue ?? ''],
    ];
    for (const [ou, texte] of champs) {
      const note = noteDuModele(texte);
      if (!note) continue;
      const message = `${repere} : note de fabrication du modèle dans ${ou} (« ${note.slice(0, 60)} ») — à corriger avant publication.`;
      avertissements.push(message);
      alerter('bloquant', 'note_du_modele', message);
      if (!q.warnings.some((w) => w.startsWith('Note du modèle'))) q.warnings.push(`Note du modèle à la place du contenu (${ou}) : « ${note.slice(0, 60)} ».`);
      break;
    }

    if (q.format === 'qcm') {
      if (q.items.length < 2) { ecarter(`${q.items.length} proposition(s), il en faut au moins deux`); return; }
      if (q.items.length > LETTRES.length) { ecarter(`${q.items.length} propositions, le maximum est ${LETTRES.length}`); return; }
      if (!q.items.some((i) => i.is_correct)) { ecarter('aucune proposition n’est marquée exacte'); return; }

      // Propositions manquantes attestées par le document (rapport de
      // fiabilité) : bloquant, sauf si elles ont déjà été complétées (l'écart
      // est alors « à relire », déjà remonté ci-dessus).
      const tronquee = (ecartsParQuestion.get(idInitial ?? '') ?? []).find((e) => e.code === 'propositions_tronquees' && e.gravite === 'bloquant');
      if (tronquee) avertissements.push(`${repere} : propositions manquantes par rapport au document — ${tronquee.message}`);

      // Une liste de propositions coupée par un saut de page peut n'être
      // extraite qu'à moitié : la suite (« c) … d) … e) … ») ouvre la page
      // suivante sans rappeler la question, et le modèle s'arrête parfois là.
      // Constaté le 08/09/2026 sur deux questions d'un import de 358 (les
      // trois dernières propositions manquaient, toutes exactes pour l'une).
      // On n'écarte pas — un QCM à trois propositions existe — mais on le dit,
      // pour que l'administrateur vérifie avant de publier.
      if (q.items.length < 4 && !tronquee) {
        q.warnings.push(`Seulement ${q.items.length} propositions extraites : vérifiez que la liste n’est pas coupée par un saut de page dans la source.`);
        avertissements.push(`${repere} : ${q.items.length} propositions seulement — liste peut-être coupée par un saut de page.`);
        alerter('a_relire', 'propositions_peu_nombreuses', `${repere} : ${q.items.length} propositions seulement — liste peut-être coupée par un saut de page.`);
      }

      // Lettres : on normalise, et si le compte n'y est pas on relettre dans
      // l'ORDRE DU DOCUMENT — cet ordre est l'information qui compte, la lettre
      // n'en est que l'étiquette.
      const normalisees = q.items.map((i) => normaliserLettre(i.lettre));
      const utilisables = normalisees.every((l) => l !== null) && new Set(normalisees).size === normalisees.length;
      if (utilisables) {
        q.items.forEach((item, i) => { item.lettre = normalisees[i] as string; });
      } else {
        q.items.forEach((item, i) => { item.lettre = LETTRES[i]; });
        q.warnings.push('Lettres des propositions réattribuées dans l’ordre du document (source illisible ou en double).');
      }
    } else if (!q.reponse_attendue?.trim()) {
      q.warnings.push('Réponse attendue absente de la source.');
      alerter('a_relire', 'reponse_attendue_absente', `${repere} : réponse attendue absente de la source.`);
    }

    gardees.push(q);
  });

  const ecartees = result.questions.length - gardees.length;
  if (ecartees > 0) avertissements.unshift(`${ecartees} exercice(s) écarté(s) sur ${result.questions.length}.`);
  if (gardees.length === 0 && result.questions.length > 0) {
    throw new Error(`Aucun des ${result.questions.length} exercices extraits n'est exploitable. ${avertissements.slice(0, 3).join(' ')}`);
  }
  const bloquants = alertes.filter((a) => a.gravite === 'bloquant').length;
  if (bloquants > 0) avertissements.unshift(`${bloquants} alerte(s) bloquante(s) : à corriger avant publication.`);
  return { questions: gardees, warnings: avertissements, alertes };
}
