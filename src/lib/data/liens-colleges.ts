/**
 * Liens externes affichés en tête de la liste des items d'un collège (page
 * `/matieres/[matiere]`), avant le premier item.
 *
 * Ce ne sont PAS des items : un item vide en base fausserait la progression,
 * les décomptes, le planificateur et les révisions. La ligne est rendue avec
 * une icône lien et une teinte distincte, et s'ouvre dans un nouvel onglet.
 */
export type LienCollege = { id: string; titre: string; sousTitre?: string; url: string };

export const LIENS_COLLEGES: Readonly<Record<string, readonly LienCollege[]>> = {
  // Collège Cardiologie de premier niveau (pas le sous-collège MG
  // `col-mg-cardiologie`) — demande du 29/09/2026.
  'col-cardiologie': [
    {
      id: 'lien-recommandations-esc',
      titre: 'Recommandations',
      sousTitre: 'Recommandations de pratique clinique de l’ESC (escardio.org)',
      url: 'https://www.escardio.org/guidelines/clinical-practice-guidelines/all-esc-practice-guidelines/',
    },
  ],
};
