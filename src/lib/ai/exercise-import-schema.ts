/**
 * Schéma de sortie de l'import d'exercices — module PUR.
 *
 * Séparé de `exercise-import.ts` (marqué `server-only`) pour être vérifiable
 * hors Next : cf. `tests/exercise-import-schema.test.ts`, qui contrôle les
 * règles du MODE STRICT d'OpenAI. Un schéma non conforme fait échouer la
 * requête avec « 400 — Invalid schema for response_format » et l'analyse ne
 * démarre jamais : c'est exactement ce qui bloquait tous les imports le
 * 03/09/2026 (`item_letter` absent de `required`).
 */

/**
 * Schéma d'une image, partagé par les images de question et celles d'item.
 *
 * MODE STRICT D'OPENAI : `required` doit énumérer TOUS les champs de
 * `properties`, sans exception. Un champ facultatif s'exprime donc par un type
 * nullable, jamais par son absence de `required`. Ce schéma était dupliqué à
 * deux endroits et omettait `item_letter` : chaque import échouait en
 * « OpenAI 400 — Invalid schema for response_format », et l'analyse n'a donc
 * jamais abouti une seule fois (03/09/2026). Une définition unique évite que
 * les deux copies divergent à nouveau.
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

export const outputSchema = {
  type: 'object', additionalProperties: false,
  required: ['questions', 'warnings'],
  properties: {
    warnings: { type: 'array', items: { type: 'string' } },
    questions: {
      type: 'array', items: {
        type: 'object', additionalProperties: false,
        required: ['client_id', 'source_pages', 'format', 'enonce', 'images', 'items', 'reponse_attendue', 'correction_generale', 'warnings'],
        properties: {
          client_id: { type: 'string' }, source_pages: { type: 'array', items: { type: 'integer' } },
          format: { type: 'string', enum: ['qcm', 'qroc'] }, enonce: { type: 'string' },
          reponse_attendue: { type: 'string' }, correction_generale: { type: 'string' }, warnings: { type: 'array', items: { type: 'string' } },
          images: { type: 'array', items: IMAGE_SCHEMA },
          items: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['lettre', 'enonce', 'is_correct', 'justification', 'images'], properties: { lettre: { type: 'string' }, enonce: { type: 'string' }, is_correct: { type: 'boolean' }, justification: { type: 'string' }, images: { type: 'array', items: IMAGE_SCHEMA } } } },
        },
      },
    },
  },
} as const;

/* ─────────── Forme du résultat renvoyé par le modèle ─────────── */

export type ImportVoie = 'interne' | 'externe';

export type ImagePlacement = 'question' | 'item' | 'correction';

export type ImportedImage = {
  /** Référence de page dans le document source. L'image reste traçable même si
   * le fournisseur ne peut pas extraire son binaire natif. */
  source_page: number | null;
  source_description: string;
  placement: ImagePlacement;
  /** Lettre de l'item illustré, `null` pour une image de question ou de
   *  correction. En mode strict, le champ est toujours renvoyé (cf. IMAGE_SCHEMA). */
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
  source_pages: number[];
  format: 'qcm' | 'qroc';
  enonce: string;
  images: ImportedImage[];
  items: ImportedItem[];
  reponse_attendue: string;
  correction_generale: string;
  warnings: string[];
};

export type ExerciseImportResult = {
  questions: ImportedQuestion[];
  warnings: string[];
};

/* ─────────── Contrôle de ce que le modèle renvoie ─────────── */

const LETTRES = 'ABCDEFGHIJK';

/**
 * Ramène une lettre de proposition à une seule majuscule de A à K.
 *
 * Les corrigés ne l'écrivent pas tous pareil : « A », « a », « A. », « A) »,
 * « (A) », et certains numérotent les propositions de 1 à 11. Rejeter ces
 * formes revenait à jeter tout le document (incident du 03/09/2026).
 * `null` quand rien d'exploitable n'en ressort.
 */
export function normaliserLettre(brute: string): string | null {
  const net = String(brute ?? '').toUpperCase().replace(/[^A-K0-9]/g, '');
  if (net.length === 1 && /[A-K]/.test(net)) return net;
  const n = Number(net);
  if (Number.isInteger(n) && n >= 1 && n <= LETTRES.length) return LETTRES[n - 1];
  return null;
}

/**
 * Contrôle chaque question et ÉCARTE celles qui sont inexploitables, au lieu
 * d'interrompre tout l'import à la première.
 *
 * Un document d'annales fait couramment plus de cent pages : une proposition
 * mal formée en tête ne doit pas coûter les quatre-vingts exercices qui
 * suivent. Chaque écart est consigné dans les avertissements, visibles dans le
 * détail de l'import, pour que le rejet reste vérifiable.
 */
export function validate(result: ExerciseImportResult, voie: ImportVoie): ExerciseImportResult {
  const wanted = voie === 'interne' ? 'qcm' : 'qroc';
  const seen = new Set<string>();
  const avertissements = [...(result.warnings ?? [])];
  const gardees: ImportedQuestion[] = [];

  result.questions.forEach((q, index) => {
    const repere = `question ${index + 1}` + (q.enonce?.trim() ? ` (« ${q.enonce.trim().slice(0, 60)}… »)` : '');
    const ecarter = (raison: string) => avertissements.push(`${repere} écartée : ${raison}`);

    if (q.format !== wanted) { ecarter(`elle n'est pas au format ${wanted}`); return; }
    if (!q.enonce?.trim()) { ecarter('énoncé vide'); return; }

    q.client_id ||= crypto.randomUUID();
    if (seen.has(q.client_id)) q.client_id = crypto.randomUUID();
    seen.add(q.client_id);
    q.warnings = q.warnings ?? [];

    if (q.format === 'qcm') {
      if (q.items.length < 2) { ecarter(`${q.items.length} proposition(s), il en faut au moins deux`); return; }
      if (q.items.length > LETTRES.length) { ecarter(`${q.items.length} propositions, le maximum est ${LETTRES.length}`); return; }
      if (!q.items.some((i) => i.is_correct)) { ecarter('aucune proposition n’est marquée exacte'); return; }

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
    }

    gardees.push(q);
  });

  const ecartees = result.questions.length - gardees.length;
  if (ecartees > 0) avertissements.unshift(`${ecartees} exercice(s) écarté(s) sur ${result.questions.length}.`);
  if (gardees.length === 0 && result.questions.length > 0) {
    throw new Error(`Aucun des ${result.questions.length} exercices extraits n'est exploitable. ${avertissements.slice(0, 3).join(' ')}`);
  }
  return { questions: gardees, warnings: avertissements };
}
