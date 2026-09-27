/**
 * Données absentes d'une question de dossier.
 *
 * POURQUOI. Le 26-27/09/2026, des élèves ont reçu en Révision du jour
 * « Question 5 — Interprétez les gaz du sang » (Annales · Médecine d'urgence ·
 * 2021 · EVCP · Sujet 2) : la série était bien servie ENTIÈRE et dans l'ordre
 * (lib/pedago/dossiers), mais ni la vignette, ni les énoncés précédents, ni la
 * question ne donnaient les valeurs des gaz. D'autres signalaient « des
 * questionnaires sans images ». Ce n'était pas l'écran : c'était le CONTENU —
 * l'import avait gardé l'intitulé de la question et perdu les données que le
 * sujet officiel intercalait entre deux questions (constantes à l'arrivée,
 * résultats de biologie, document d'imagerie).
 *
 * RÈGLE. Une question est « incomplète » quand elle demande d'exploiter un
 * DOCUMENT (radiographie, ECG, image…) ou des RÉSULTATS (gaz du sang, bilan…)
 * que l'élève ne voit nulle part :
 *   - document : ni image sur la question ou ses propositions, ni image sur une
 *     question qui la précède immédiatement (« Voici l'ECG » puis « Interprétez-le ») ;
 *   - résultats : ni image, ni valeurs chiffrées correspondantes dans le texte
 *     visible jusqu'à elle (vignette + énoncés des questions 1 à n).
 * Le doute ne profite PAS à la question : un faux positif se lit en quelques
 * secondes, un faux négatif est une question intraitable devant un élève.
 *
 * Module PUR (aucun accès base) : testé dans tests/qcm-donnees-manquantes.test.ts,
 * utilisé par scripts/audit-dossiers-incomplets.mts et par les chaînes de
 * publication.
 */

export type QuestionPourAudit = {
  enonce: string | null;
  /** Images de la question et de ses propositions (URL). */
  images: readonly string[];
};

export type Manque = {
  /** Rang (0-based) de la question dans la série. */
  index: number;
  genre: 'document' | 'resultats';
  /** Ce que la question demande d'exploiter, tel que lu dans l'énoncé. */
  objet: string;
};

/** Texte brut d'un fragment HTML. */
export function texteBrut(html: string | null | undefined): string {
  return String(html ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    // Seulement de vraies balises : « SpO₂ < 90 %, FC > 120/min » stocké tel quel
    // ne doit pas perdre ce qui sépare les deux signes.
    .replace(/<\/?[a-z][a-z0-9]*\b[^>]*>/gi, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/[ \t]+/g, ' ');
}

/** Retire l'en-tête « Question n » (et un barème) pour ne garder que l'intitulé. */
function intitule(enonce: string): string {
  return enonce.replace(/^\s*question\s*(n°\s*)?\d+\s*[:.\-–—]?\s*/i, '').trim();
}

/**
 * Documents qu'une question peut demander de LIRE. « Tableau » et « schéma »
 * n'en font pas partie : « le tableau clinique », « le schéma thérapeutique »
 * sont du vocabulaire médical, pas des pièces jointes.
 */
/** Bornes de mot Unicode : `\\b` (ASCII) ne voit pas la frontière avant « é ». */
const BORNE = '(?:(?<![\\p{L}\\p{N}_])(?=[\\p{L}\\p{N}_])|(?<=[\\p{L}\\p{N}_])(?![\\p{L}\\p{N}_]))';
function re(source: string | RegExp, drapeaux = 'i'): RegExp {
  const texte = typeof source === 'string' ? source : source.source;
  return new RegExp(texte.replaceAll('\\b', BORNE), drapeaux + 'u');
}

const NOM_DOCUMENT =
  "(?:radiographies?|radios?|clichés?|scanners?|tdm|irm|échographies?|echographies?|ecg|électrocardiogrammes?|electrocardiogrammes?|tracés?|images?|imageries?|iconographies?|photos?|photographies?|documents?|coupes?|courbes?|frottis|lames?|scintigraphies?|angiographies?|angio-?scanners?|artériographies?|coronarographies?|fonds? d['’]œil|fond d['’]oeil|dermatoscopies?|spirométries?|eeg|électroencéphalogrammes?|holters?|audiogrammes?|tympanogrammes?|partogrammes?|enregistrements?|rcf|cardiotocographies?|figures?)";

/** Document désigné comme présent (« ci-dessous », « suivant(e)(s) »…). */
const DESIGNATION = "(?:ci-?dessous|ci-?joint(?:e|es|s)?|ci-?contre|ci-?après|suivant(?:e|es|s)?)";

/**
 * Le document est désigné comme présenté à l'élève : « la radiographie
 * suivante », « l'ECG ci-dessous », « voici sa radiographie ». Le nom et sa
 * désignation sont voisins (« la courbe expiratoire n'atteint plus zéro avant le
 * cycle suivant » ne désigne aucun document).
 */
const RE_DOCUMENT_DESIGNE = re(
  `\\b${NOM_DOCUMENT}\\b(?:\\s+[\\wàâçéèêëîïôûùüÿœ'’-]+){0,3}\\s+${DESIGNATION}\\b|\\b${DESIGNATION}\\s+(?:${NOM_DOCUMENT})\\b|\\bvoici\\b[^.?!\\n]{0,30}\\b${NOM_DOCUMENT}\\b`,
  'i',
);

/** Consigne de lecture d'un document. */
const LIRE = "(?:interpr[ée]tez|comment interpr[ée]te(?:z-vous|r)|d[ée]crivez|analysez|commentez|lisez|que montre(?:nt)?|que voyez-vous|qu['’]objectivez-vous|quels? (?:signes?|anomalies?|l[ée]sions?) (?:voyez|objectivez|retrouvez|relevez)-vous)";

/** « Interprétez / Décrivez… cette radiographie, ces images, cet ECG ». */
const RE_DOCUMENT_DEMONSTRATIF = re(`\\b${LIRE}\\b[^.?!\\n]{0,40}\\b(?:cette|ces|cet|ce)\\s+${NOM_DOCUMENT}\\b`, 'i');

/**
 * « Interprétez l'ECG. », « Décrivez l'IRM. », « Analysez la radiographie
 * de thorax. » : l'article défini ne désigne le document du dossier que si la
 * consigne s'arrête là — « Que montrent les radiographies au cours d'un accès
 * goutteux ? » est une question de cours.
 */
// « Que montre la courbe de dissociation de l'hémoglobine ? » est une question
// de cours : avec l'article défini, « que montre » n'appelle pas de document.
const LIRE_DEFINI = LIRE.replace('|que montre(?:nt)?', '');
const RE_DOCUMENT_DEFINI = re(
  `\\b${LIRE_DEFINI}\\b\\s+(?:la|le|les|l['’])\\s*${NOM_DOCUMENT}\\b(?:\\s+(?:de|du|des|d['’])\\s*[\\wàâçéèêëîïôûùüÿœ'’-]+){0,2}\\s*(?:(?:réalisée?s?|effectuée?s?|pratiquée?s?|obtenue?s?)\\b[^.?!\\n]{0,30})?\\s*[.?!]?\\s*$`,
  'i',
);

/**
 * Résultats à interpréter, et ce qui prouve qu'ils sont donnés : une valeur
 * chiffrée du bon type dans le texte visible.
 */
const UNITE_BIO = re(/\d[\d,.]*\s*(?:g\/l|mg\/l|mmol\/l|µmol\/l|umol\/l|ui\/l|u\/l|g\/dl|\/mm3|ng\/ml|pg\/ml|mui\/l|µg\/l|giga\/l|g\/l)/);
const RESULTATS: { nom: RegExp; preuve: RegExp }[] = [
  {
    nom: re(/\bgaz (?:du sang|artériels?)\b|\bgazom[ée]trie|\bgds\b/),
    preuve: re(/\bpH\s*[:=à]?\s*\d|\bPa\s?CO\s?2?\b[^.\n]{0,15}\d|\bPa\s?O\s?2?\b[^.\n]{0,15}\d|\bHCO3|\b(?:acidose|alcalose|hypoxémie|hypercapnie|hypocapnie)\b|\bgaz(?:om[ée]trie| du sang)\b[^.\n]{0,30}\bnorma(?:l|le|ux)\b/),
  },
  {
    nom: re(/\bionogramme|\bnatrémie|\bkaliémie|\bchlorémie/),
    preuve: re(/\b(?:Na|K|Cl)\+?\s*[:=à]?\s*\d|\b(?:natrémie|kaliémie|chlorémie)\b[^.\n]{0,20}\d|\b(?:hypo|hyper)(?:natrémie|kaliémie|chlorémie)\b|\b(?:élévation|baisse|augmentation|diminution|correction)\b[^.\n]{0,15}\b(?:natrémie|kaliémie|chlorémie)\b/),
  },
  {
    nom: re(/\b(?:nfs|hémogramme|numération formule)\b/),
    preuve: re(/\b(?:hb|hémoglobine|leucocytes|plaquettes|gb|pnn|lymphocytes)\b[^.\n]{0,20}\d|\b(?:anémie|thrombopénie|leucopénie|neutropénie|lymphopénie|hyperleucocytose|polynucléose|pancytopénie|thrombocytose|leuconeutropénie|lymphocytose|hyperlymphocytose|syndrome mononucléosique)\b|\d[\d,.]*\s*G\/L/),
  },
  {
    nom: re(/\bponction lombaire\b|\blcr\b|\bliquide céphalo-?rachidien\b/),
    preuve: re(/\b(?:éléments|cellules|protéinorachie|glycorachie|leucocytes)\b[^.\n]{0,25}\d|\b(?:hyperprotéinorachie|hypoglycorachie|pléiocytose|méningite)\b/),
  },
  {
    nom: re(/\bbilan (?:biologique|hépatique|rénal|phosphocalcique|thyroïdien|d['’]hémostase|martial|lipidique)\b|\brésultats? (?:biologiques?|du bilan|des examens|de l['’]examen)\b/),
    preuve: UNITE_BIO,
  },
];

/**
 * L'énoncé RÉDIGE déjà le contenu du document ou des résultats (« le cliché de
 * contrôle montre un liseré radioclair… Interprétez cette image », « les
 * résultats montrent : NFS normale… ») : l'élève a de quoi répondre.
 */
const RE_CONSTAT = re(/\b(?:montre(?:nt)?|retrouve(?:nt)?|objective(?:nt)?|révèle(?:nt)?|mettent en évidence|met en évidence|reviennent|revient|présente(?:nt)?|dépasse(?:nt)?|observe|on note)\b\s*(?::|[^.?!\n]{8,})|\b(?:est|sont) (?:nettement |bien |clairement )?(?:visibles?|mesurables?)\b/);

/** Tout l'énoncé sauf sa dernière phrase (la consigne). */
function avantConsigne(question: string): string {
  const phrases = question.split(/(?<=[.!?:])\s+|\n+/).map((p) => p.trim()).filter(Boolean);
  return phrases.slice(0, -1).join(' ');
}

/** Verbes qui demandent d'EXPLOITER des résultats (et non de les prescrire). */
const RE_EXPLOITER = re(/\b(?:interpr[ée]tez|comment interpr[ée]te(?:z-vous|r)|analysez|commentez|que (?:montre(?:nt)?|retenez-vous|concluez-vous)|quelle est votre (?:interprétation|analyse)|qu['’]en (?:pensez|concluez)-vous)\b/);

/**
 * Manques d'un dossier (série servie entière, dans l'ordre).
 *
 * `vignette` : contexte clinique de la série (qcm_series.vignette).
 * `questions` : dans l'ordre de la série.
 */
export function manquesDuDossier(vignette: string | null | undefined, questions: readonly QuestionPourAudit[]): Manque[] {
  const manques: Manque[] = [];
  let contexte = texteBrut(vignette);
  // Un document montré à la question PRÉCÉDENTE peut être commenté ensuite
  // (« Voici l'ECG » puis « Interprétez-le ») ; une image plus ancienne, non :
  // l'image de la question 5 ne vaut pas pour « Interprétez l'ECG » en question 12.
  let imagePrecedente = false;
  questions.forEach((q, index) => {
    const texte = texteBrut(q.enonce);
    const question = intitule(texte);
    const aImage = q.images.length > 0 || /<img\b/i.test(String(q.enonce ?? ''));
    contexte += '\n' + texte;
    const vue = aImage || imagePrecedente;
    imagePrecedente = aImage;

    if (vue || RE_CONSTAT.test(avantConsigne(question))) return;
    const derniere = question.split(/\n+/).map((l) => l.trim()).filter(Boolean).at(-1) ?? '';
    // « Parmi les signes ECG suivants… » : « suivants » désigne les propositions.
    const designe = /\bparmi\b/i.test(question) ? null : question.match(RE_DOCUMENT_DESIGNE);
    const document = designe
      ?? question.match(RE_DOCUMENT_DEMONSTRATIF)
      ?? derniere.match(RE_DOCUMENT_DEFINI);
    if (document) {
      manques.push({ index, genre: 'document', objet: document[0].trim() });
      return;
    }
    if (!RE_EXPLOITER.test(question)) return;
    for (const r of RESULTATS) {
      const nom = question.match(r.nom);
      if (nom && !r.preuve.test(contexte)) {
        manques.push({ index, genre: 'resultats', objet: nom[0].trim() });
        return;
      }
    }
  });
  return manques;
}

/* ── Garde des sessions de révision ───────────────────────────────────────
 * Filet de sécurité côté élève : un dossier (ou une question isolée) dont une
 * question demande un document ou des résultats invisibles n'est jamais servi
 * en révision, consolidation, renforcement ni entraînement ciblé — il est
 * écarté comme un dossier amputé. L'audit (scripts/audit-dossiers-incomplets.mts)
 * reste l'outil qui le fait CORRIGER ; cette garde évite seulement qu'un élève
 * tombe dessus entre-temps. */

/** Question chargée en entier par une page de session. */
export type QuestionLisible = {
  enonce: string | null;
  images?: readonly string[] | null;
  qcm_items?: readonly { images?: readonly string[] | null }[] | null;
  qcm_series: { vignette: string | null };
};

function pourAudit(q: QuestionLisible): QuestionPourAudit {
  return { enonce: q.enonce, images: [...(q.images ?? []), ...(q.qcm_items ?? []).flatMap((it) => it.images ?? [])] };
}

/** Une unité (dossier servi entier, ou question isolée) est-elle incomplète ? */
export function uniteIncomplete(questions: readonly QuestionLisible[], enDossier: boolean): boolean {
  if (!questions.length) return false;
  if (!enDossier) return questions.some((q) => manquesDuDossier(null, [pourAudit(q)]).length > 0);
  return manquesDuDossier(questions[0].qcm_series.vignette, questions.map(pourAudit)).length > 0;
}

/**
 * Identifiants des questions à retirer d'une suite déjà choisie : toutes celles
 * d'un dossier incomplet, et les questions isolées incomplètes. Un dossier dont
 * une question manque au chargement est laissé au contrôle « dossier amputé »
 * de la page.
 */
export function questionsAEcarter(
  suite: readonly { question: { id: string }; dossier: { serieId: string } | null }[],
  parId: ReadonlyMap<string, QuestionLisible>,
): Set<string> {
  const ecartees = new Set<string>();
  const parSerie = new Map<string, string[]>();
  for (const { question, dossier } of suite) {
    if (dossier) {
      const ids = parSerie.get(dossier.serieId) ?? [];
      ids.push(question.id);
      parSerie.set(dossier.serieId, ids);
      continue;
    }
    const q = parId.get(question.id);
    if (q && uniteIncomplete([q], false)) ecartees.add(question.id);
  }
  for (const ids of parSerie.values()) {
    const qs = ids.map((id) => parId.get(id));
    if (qs.some((q) => !q)) continue;
    if (uniteIncomplete(qs as QuestionLisible[], true)) for (const id of ids) ecartees.add(id);
  }
  return ecartees;
}
