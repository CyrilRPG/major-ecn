/**
 * Plusieurs fiches par item — helpers partagés (client ET serveur).
 *
 * Un item peut porter plusieurs fiches de cours. Elles s'affichent toutes dans
 * le MÊME onglet « Fiche de cours » : la première est ouverte par défaut, les
 * autres sont accessibles par des pastilles, comme les supports de séance.
 *
 * La fiche à `order_index` le plus bas est la « fiche principale » : c'est elle
 * que visent l'éditeur HTML, la conversion HTML → PDF et la fiche éclair.
 */

export type FicheOrdonnable = {
  order_index?: number | null;
  created_at?: string | null;
};

/** Tri d'affichage : order_index croissant, puis date de création. */
export function trierFiches<T extends FicheOrdonnable>(rows: readonly T[]): T[] {
  return rows.slice().sort((a, b) => {
    const oa = a.order_index ?? 0;
    const ob = b.order_index ?? 0;
    if (oa !== ob) return oa - ob;
    return (a.created_at ?? '').localeCompare(b.created_at ?? '');
  });
}

/** Nom affiché à l'élève pour une fiche, avec repli sur « Fiche N ». */
export function ficheLabel(fiche: { titre?: string | null }, index: number): string {
  const t = fiche.titre?.trim();
  return t && t.length > 0 ? t : `Fiche ${index + 1}`;
}

/**
 * Titre par défaut d'une fiche déposée, dérivé du nom de fichier :
 * « Angor.pdf » → « Angor ». L'extension est retirée quelle qu'elle soit — on
 * dépose aussi des `.html` / `.htm`, dont l'extension restait auparavant
 * collée au titre affiché à l'élève. Les séparateurs de nom de fichier
 * deviennent des espaces : « Item-221-Angor.pdf » → « Item 221 Angor ».
 */
export function titreDepuisFichier(fileName: string): string {
  return (
    fileName
      .replace(/\.(pdf|html?|docx?|odt)$/i, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200) || 'Fiche'
  );
}
