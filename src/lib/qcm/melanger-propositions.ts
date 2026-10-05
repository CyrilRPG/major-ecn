// Ordre des propositions d'un QCM généré par IA. Les modèles placent
// spontanément les réponses justes en tête : avant octobre 2026, A était juste
// dans près de 90 % des QCM générés et E dans moins de 40 %, si bien qu'on
// pouvait répondre sans lire. Les propositions sont donc mélangées à
// l'insertion puis re-lettrées A, B, C… dans leur nouvel ordre ; chacune garde
// son énoncé, sa justification et sa valeur de vérité.
//
// Restent en place : une proposition positionnelle (« toutes les réponses
// ci-dessus ») garde son rang, et si un texte cite une proposition par sa
// lettre (« Réponses : A, C », « B. Faux », « cf. D »), l'ordre d'origine est
// conservé pour ne pas rendre la correction fausse.
//
// Banques déjà publiées : scripts/equilibrer-lettres-qcm.mjs.

const MOT = "A-Za-zÀ-ÿ0-9'’";
const CITATIONS = [
  new RegExp(`(?:[Pp]ropositions?|[Rr]éponses?|[Ii]tems?|[Ll]ettres?|[Cc]hoix)(?:\\s+(?:justes?|exactes?|vraies?|fausses?|correctes?|inexactes?|attendues?|retenues?))?\\s*:?\\s*[A-K]+(?![${MOT}])`),
  /(?:^|\n)\s*[•\-–—]?\s*[A-K]\s*[:.)–—-]\s*(?:vrai|faux|exact|inexact|juste|correct|incorrect)/i,
  new RegExp(`\\((?:cf\\.?|voir)\\s*[A-K](?:\\s*(?:,|et|ou)\\s*[A-K])*\\)`),
  new RegExp(`(?:^|\\n)\\s*[A-K](?:\\s*,\\s*[A-K])+\\s*(?:→|:)`),
];
const POSITIONNELLE = /(?:aucune|toutes?|tous|l['’]ensemble)\s+(?:les\s+|des\s+)?(?:propositions|réponses)|(?:propositions?|réponses?)\s+(?:ci-dessus|précédentes?|suivantes?|proposées)|tout(?:es)?\s+ce\s+qui\s+précède/i;

const texte = (value: string | null | undefined) => String(value ?? '')
  .replace(/<br\s*\/?>/gi, '\n').replace(/<\/(?:p|li|div)>/gi, '\n').replace(/<[^>]+>/g, ' ');

export function citeUneLettre(value: string | null | undefined): boolean {
  const plain = texte(value);
  return CITATIONS.some((pattern) => pattern.test(plain));
}

export function melangerPropositions<T extends { lettre: string; enonce: string; justification?: string | null }>(
  items: T[],
  textesLies: (string | null | undefined)[] = [],
  random: () => number = Math.random,
): T[] {
  if (items.length < 2 || items.length > 11) return items;
  if ([...items.flatMap((item) => [item.enonce, item.justification]), ...textesLies].some(citeUneLettre)) return items;
  const fixes = items.map((item) => POSITIONNELLE.test(texte(item.enonce)));
  const mobiles = items.filter((_, index) => !fixes[index]);
  for (let index = mobiles.length - 1; index > 0; index -= 1) {
    const other = Math.floor(random() * (index + 1));
    [mobiles[index], mobiles[other]] = [mobiles[other], mobiles[index]];
  }
  let rang = 0;
  return items.map((item, index) => ({
    ...(fixes[index] ? item : mobiles[rang++]),
    lettre: String.fromCharCode(65 + index),
  }));
}
