/**
 * Césure française de secours : insère des césures conditionnelles (U+00AD) aux
 * frontières de syllabes des mots très longs (14 lettres et plus). Le navigateur ne coupe que si le mot
 * ne tient pas, et affiche alors un tiret (« Électrocardio-gramme »).
 *
 * `hyphens: auto` ne suffit pas : Chrome n'a pas toujours de dictionnaire
 * français (Windows notamment) et coupait « Électrocardiogra|mme » sans tiret.
 * Règle simple : V-CV, VC-CV, sauf les groupes inséparables (bl, br, ch, cl,
 * cr, dr, fl, fr, gl, gn, gr, ph, pl, pr, th, tr, vr) ; jamais moins de trois
 * lettres de part et d'autre de la coupure.
 */
const VOYELLES = 'aeiouyàâäéèêëîïôöùûüœæ';
const INSEPARABLES = new Set(['bl', 'br', 'ch', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gn', 'gr', 'ph', 'pl', 'pr', 'th', 'tr', 'vr']);
/** Seuls les mots qui ne tiennent pas sur une ligne étroite (≈ 13 lettres) sont coupés ; les autres passent entiers à la ligne. */
const MOT_LONG = 14;
const MARGE = 3;

const voyelle = (c: string) => VOYELLES.includes(c.toLowerCase());
const lettre = (c: string) => /\p{L}/u.test(c);

function couperMot(mot: string): string {
  if (mot.length < MOT_LONG || ![...mot].every(lettre)) return mot;
  const b = mot.toLowerCase();
  const coupes: number[] = [];
  for (let i = 1; i < b.length - 1; i++) {
    // V C V → coupe avant la consonne.
    if (voyelle(b[i - 1]) && !voyelle(b[i]) && voyelle(b[i + 1])) coupes.push(i);
    // V C C V → entre les deux consonnes, sauf groupe inséparable (coupe avant le groupe).
    else if (i + 2 < b.length && voyelle(b[i - 1]) && !voyelle(b[i]) && !voyelle(b[i + 1]) && voyelle(b[i + 2])) {
      coupes.push(INSEPARABLES.has(b[i] + b[i + 1]) ? i : i + 1);
    }
  }
  const retenues = [...new Set(coupes)].filter((i) => i >= MARGE && mot.length - i >= MARGE).sort((x, y) => x - y);
  let sortie = '';
  let precedent = 0;
  for (const i of retenues) { sortie += mot.slice(precedent, i) + '­'; precedent = i; }
  return sortie + mot.slice(precedent);
}

export function cesure(texte: string): string {
  return texte.replace(/\p{L}+/gu, couperMot);
}
