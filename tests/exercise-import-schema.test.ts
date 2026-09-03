/**
 * Le schéma de sortie de l'import d'exercices doit respecter le MODE STRICT
 * d'OpenAI, sans quoi l'API refuse la requête et l'analyse ne démarre jamais.
 *
 * Incident du 03/09/2026 : « OpenAI 400 — Invalid schema for response_format
 * 'exercise_import' : 'required' is required to be supplied and to be an array
 * including every key in properties. Missing 'item_letter'. » Le schéma des
 * images omettait `item_letter` dans `required`, à deux endroits. Aucun import
 * n'avait donc jamais abouti.
 *
 * Les deux règles vérifiées ici sont celles que l'API applique :
 *  1. tout objet déclare `additionalProperties: false` ;
 *  2. son `required` énumère EXACTEMENT toutes les clés de `properties`.
 * Un champ facultatif s'exprime par un type nullable, jamais par son absence
 * de `required`.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { outputSchema } from '../src/lib/ai/exercise-import-schema';

type Noeud = {
  type?: unknown;
  properties?: Record<string, Noeud>;
  required?: string[];
  additionalProperties?: unknown;
  items?: Noeud;
  enum?: unknown[];
};

/** Parcourt le schéma et renvoie une anomalie par violation, avec son chemin. */
function anomalies(noeud: Noeud, chemin = '$'): string[] {
  const out: string[] = [];
  const estObjet = noeud.type === 'object'
    || (Array.isArray(noeud.type) && noeud.type.includes('object'))
    || !!noeud.properties;

  if (estObjet) {
    const props = Object.keys(noeud.properties ?? {});
    const requis = noeud.required ?? [];
    if (noeud.additionalProperties !== false) {
      out.push(`${chemin} : additionalProperties doit valoir false`);
    }
    const manquants = props.filter((k) => !requis.includes(k));
    if (manquants.length) out.push(`${chemin} : absent(s) de required → ${manquants.join(', ')}`);
    const enTrop = requis.filter((k) => !props.includes(k));
    if (enTrop.length) out.push(`${chemin} : requis mais non déclaré(s) → ${enTrop.join(', ')}`);
    for (const [k, v] of Object.entries(noeud.properties ?? {})) out.push(...anomalies(v, `${chemin}.${k}`));
  }
  if (noeud.items) out.push(...anomalies(noeud.items, `${chemin}[]`));
  return out;
}

test('le schéma d’import respecte le mode strict d’OpenAI', () => {
  const trouvees = anomalies(outputSchema as unknown as Noeud);
  assert.deepEqual(trouvees, [], 'Schéma non conforme :\n' + trouvees.join('\n'));
});

test('le champ item_letter d’une image est requis et nullable', () => {
  // Régression directe du 400 : `item_letter` ne décrit une lettre d'item que
  // pour une image d'item ; en strict il doit tout de même être requis, donc
  // nullable pour les images de question et de correction.
  const schema = outputSchema as unknown as Noeud;
  const question = schema.properties!.questions.items!;
  const cibles: Array<[string, Noeud]> = [
    ['images de question', question.properties!.images.items!],
    ['images d’item', question.properties!.items.items!.properties!.images.items!],
  ];
  for (const [quoi, image] of cibles) {
    assert.ok(image.required?.includes('item_letter'), `${quoi} : item_letter absent de required`);
    const type = image.properties!.item_letter.type;
    assert.ok(Array.isArray(type) && type.includes('null'), `${quoi} : item_letter doit accepter null`);
  }
});

test('le schéma des images est bien partagé par les deux emplacements', () => {
  // Les deux copies avaient divergé, d'où un correctif appliqué à une seule.
  const schema = outputSchema as unknown as Noeud;
  const question = schema.properties!.questions.items!;
  const a = question.properties!.images.items!;
  const b = question.properties!.items.items!.properties!.images.items!;
  assert.equal(a, b, 'les deux emplacements doivent référencer le MÊME objet de schéma');
});
