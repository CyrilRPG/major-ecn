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
