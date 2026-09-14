/**
 * Ordre des séries dans l'onglet DP · QI — logique PURE, partagée par la liste
 * (`/cours/[cours]/qcm`) et par le lecteur (`/cours/[cours]/qcm/[serie]`).
 *
 * Le lecteur propose « Dossier suivant » en fin de série au professeur qui
 * relit un item : ce bouton doit suivre EXACTEMENT l'ordre affiché dans la
 * liste, sinon l'enseignant ne sait plus où il en est (retour du 14/09/2026 :
 * « l'ordre des dossiers qui change »).
 */
import { estSerieAnnale, anneeDeSerieAnnale } from './annales';

export type SerieOrdonnable = {
  id: string;
  label: string;
  type?: string | null;
  order_index: number;
  annee?: number | null;
};

/**
 * Rang de catégorie du Programme Approfondi : séances du professeur →
 * entraînements → DP → QCM / QROC → annales.
 */
export function rangCategorie(s: { label: string; type?: string | null }): number {
  if (s.type === 'seance') return 0;                 // Séance du professeur
  if (/entra[iî]nement/i.test(s.label)) return 1;    // Entraînement
  if (/^dp\b/i.test(s.label)) return 2;              // DP (couvre « DP … » et « DP QROC … »)
  if (/^annales?\b/i.test(s.label)) return 4;        // Annales EVC corrigées (après les banques)
  return 3;                                          // QCM / QROC de base
}

/**
 * Trie les séries comme la liste DP · QI les affiche.
 *  - Programme Approfondi : ordre pédagogique imposé (cf. `rangCategorie`),
 *    puis `order_index` ;
 *  - autres formules : séances d'abord, puis ordre d'affichage défini en admin.
 */
export function trierSeriesDpQi<T extends SerieOrdonnable>(series: T[], { isApprofondi }: { isApprofondi: boolean }): T[] {
  return [...series].sort((a, b) => {
    if (isApprofondi) {
      const ra = rangCategorie(a);
      const rb = rangCategorie(b);
      return ra !== rb ? ra - rb : a.order_index - b.order_index;
    }
    const ta = a.type === 'seance' ? 0 : 1;
    const tb = b.type === 'seance' ? 0 : 1;
    return ta !== tb ? ta - tb : a.order_index - b.order_index;
  });
}

/** Annale rangée par année dans la liste (les autres annales restent en liste plate). */
function annaleParAnnee(s: SerieOrdonnable): number | null {
  return estSerieAnnale(s.label) ? anneeDeSerieAnnale(s) : null;
}

/**
 * Série qui suit `serieId` dans la navigation de l'onglet DP · QI, sur des
 * séries DÉJÀ triées par `trierSeriesDpQi` et déjà filtrées par les droits :
 *  - une annale enchaîne sur l'annale suivante de la MÊME session (année) ;
 *  - toute autre série enchaîne sur la suivante de la liste plate.
 * `null` en fin de liste.
 */
export function serieSuivanteDpQi<T extends SerieOrdonnable>(seriesTriees: T[], serieId: string): T | null {
  const courante = seriesTriees.find((s) => s.id === serieId);
  if (!courante) return null;
  const annee = annaleParAnnee(courante);
  const candidates = annee === null
    ? seriesTriees.filter((s) => annaleParAnnee(s) === null)
    : seriesTriees.filter((s) => annaleParAnnee(s) === annee);
  const i = candidates.findIndex((s) => s.id === serieId);
  return i >= 0 && i < candidates.length - 1 ? candidates[i + 1] : null;
}
