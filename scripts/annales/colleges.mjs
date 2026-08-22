/**
 * Correspondance dossier de corrigés → collège de la plateforme.
 *
 * ATTENTION AU PIÈGE MÉDECINE GÉNÉRALE : `col-medecine-generale` possède des
 * sous-collèges nommés comme des spécialités (`col-mg-cardiologie`,
 * `col-mg-pneumologie`, `col-mg-orl`…). Ils ne sont PAS les collèges de
 * spécialité autonomes (`col-cardiologie`, `col-pneumologie`) : ce sont deux
 * choses distinctes. Les annales d'une spécialité vont dans le collège
 * autonome ; les annales de Médecine générale (code EVC 71) vont dans l'item
 * « Annales - Médecine générale » rattaché au collège parent.
 *
 * `nom` doit reproduire EXACTEMENT `matieres.nom` : il sert à composer le
 * libellé « Annales - <Collège> - <Année> - <Type> ».
 */
export const COLLEGES = {
  'ANNALES AREA': {
    collegeId: 'col-anesthesie-reanimation',
    nom: 'Anesthésie-Réanimation',
    codes: ['03'],
  },
  'ANNALES CARDIOLOGIE': {
    collegeId: 'col-cardiologie',
    nom: 'Cardiologie',
    codes: ['07'],
    // Decks « Séance … correction » : une annale ne correspond pas à un fichier,
    // il faut la repérer dans le contenu (« EVCP 2024, sujet n°3 »).
    annalesDansLeContenu: true,
  },
  'ANNALES GERIATRIE': {
    collegeId: 'col-geriatrie',
    nom: 'Gériatrie',
    codes: ['76'],
    annalesDansLeContenu: true,
  },
  'ANNALES GYNECOLOGIE': {
    collegeId: 'col-gynecologie',
    nom: 'Gynécologie-obstétrique',
    codes: ['18', '17'],
  },
  'ANNALES MG': {
    collegeId: 'col-medecine-generale',
    nom: 'Médecine générale',
    codes: ['71'],
  },
  'ANNALES ORL': {
    exclu: 'Aucun collège ORL autonome sur la plateforme : ORL n’existe que comme '
      + 'sous-collège de Médecine générale (col-mg-orl), ce qui est une autre chose. '
      + 'Exclusion décidée avec l’utilisateur.',
  },
  'ANNALES ORTHOPEDIE': {
    collegeId: 'col-orthopedie',
    nom: 'Orthopédie',
    codes: ['53'],
  },
  'ANNALES PEDIATRIE': {
    collegeId: 'col-pediatrie',
    nom: 'Pédiatrie',
    codes: ['36'],
    annalesDansLeContenu: true,
  },
  'ANNALES PNEUMOLOGIE BON': {
    collegeId: 'col-pneumologie',
    nom: 'Pneumologie',
    codes: ['38'],
    annalesDansLeContenu: true,
  },
  'ANNALES PSYCHIATRIE': {
    collegeId: 'col-psychiatrie',
    nom: 'Psychiatrie',
    codes: ['74'],
  },
  'ANNALES URGENCE': {
    collegeId: 'col-mir',
    nom: 'Médecine d’urgence',
    codes: ['43'],
    annalesDansLeContenu: true,
  },
};

/** Item d'accueil des séries d'annales, par collège. */
export const ITEMS_ANNALES = {
  'col-orthopedie': { titre: 'Révisions - Orthopédie', aCreer: true, id: 'a11a1e50-0000-4000-a000-000000000053' },
  'col-anesthesie-reanimation': { titre: 'Révisions - Anesthésie-Réanimation', aCreer: true },
  'col-cardiologie': { titre: 'Révisions - Cardiologie', aCreer: true },
  'col-gynecologie': { titre: 'Révisions - Gynécologie-obstétrique', aCreer: true },
  'col-geriatrie': { titre: 'Révisions - Gériatrie', aCreer: false },
  'col-psychiatrie': { titre: 'Révisions - Psychiatrie', aCreer: false },
  'col-pediatrie': { titre: 'Révisions - Pédiatrie', aCreer: false },
  'col-mir': { titre: 'Révisions - Médecine d’urgence', aCreer: false },
  'col-pneumologie': { titre: 'Révisions - Pneumologie', aCreer: true },
  // MG : item propre, placé AVANT les sous-collèges (order_index = 0).
  'col-medecine-generale': { titre: 'Annales - Médecine générale', aCreer: true },
};

/** Libellé d'une série d'annales. `suffixes` = ['QCM'] | ['Sujet 3'] | []. */
export function libelleSerie(nomCollege, annee, type, ...suffixes) {
  return ['Annales', nomCollege, String(annee), type, ...suffixes].join(' - ');
}
