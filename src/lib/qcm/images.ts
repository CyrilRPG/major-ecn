/**
 * Détection d'image sur une question de série (index de l'éditeur, badge
 * « image » du panneau admin). Helper pur : aucune dépendance React ni réseau.
 */

export type QuestionAvecImages = {
  enonce?: string | null;
  correction_generale?: string | null;
  images?: readonly string[] | null;
  items?: readonly { images?: readonly string[] | null }[] | null;
};

/** Le fragment HTML contient-il une balise `<img` ? */
export function contientImageHtml(html: string | null | undefined): boolean {
  return !!html && /<img\b/i.test(html);
}

/**
 * Une question « a une image » si :
 * - `qcm_questions.images` n'est pas vide, ou
 * - un `qcm_items.images` n'est pas vide, ou
 * - une balise `<img` figure dans l'énoncé, le corrigé général ou la vignette
 *   clinique de la série (commune à toutes ses questions).
 */
export function questionAUneImage(question: QuestionAvecImages, vignette?: string | null): boolean {
  if ((question.images?.length ?? 0) > 0) return true;
  if ((question.items ?? []).some((it) => (it.images?.length ?? 0) > 0)) return true;
  return contientImageHtml(question.enonce) || contientImageHtml(question.correction_generale) || contientImageHtml(vignette);
}

/**
 * Libellé court d'une question pour un index : la dernière ligne non vide de
 * l'énoncé (la question proprement dite, après une éventuelle vignette
 * intégrée), en texte brut, tronquée à `max` caractères.
 */
export function libelleCourtQuestion(enonce: string | null | undefined, max = 90): string {
  if (!enonce) return '';
  const texte = enonce
    .replace(/<img\b[^>]*>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"');
  const lignes = texte.split('\n').map((l) => l.replace(/\s+/g, ' ').trim()).filter((l) => l.length > 0);
  const derniere = lignes[lignes.length - 1] ?? '';
  return derniere.length > max ? `${derniere.slice(0, max - 1).trimEnd()}…` : derniere;
}
