export type PriveMatiere = {
  id: string;
  nom: string;
  icon: string;
  color: string;
  cours: PriveCours[];
};

export type PriveCours = {
  slug: string;
  titre: string;
  matiereId: string;
  hasAnnales: boolean;
};

export type PriveFicheRow = {
  concept: string;
  detail_md: string;
  kind: 'normal' | 'a_retenir' | 'piege' | 'mnemo';
};

export type PriveFicheSousPartie = {
  titre: string;
  rows: PriveFicheRow[];
};

export type PriveFichePartie = {
  numero: string;
  titre: string;
  sous_parties: PriveFicheSousPartie[];
};

export type PriveFiche = {
  parties: PriveFichePartie[];
  points_cles: string[];
  chiffres_cles?: { titre: string; markdown: string };
};

export type PriveFlashcard = {
  recto: string;
  verso: string;
  order_index: number;
};

export type PriveAnnaleQuestion = {
  enonce: string;
  items: { lettre: string; enonce: string; is_correct: boolean }[];
  correction: string;
};

export type PriveAnnale = {
  titre: string;
  annee: string;
  rappel_cours: string;
  questions: PriveAnnaleQuestion[];
};

export type PriveCourseContent = {
  fiche: PriveFiche;
  flashcards: PriveFlashcard[];
  annales: PriveAnnale[];
};

export const PRIVE_MATIERES: PriveMatiere[] = [
  {
    id: 'physiologie',
    nom: 'Physiologie Rénale',
    icon: 'activity',
    color: '#7C3AED',
    cours: [
      { slug: 'filtration-glomerulaire', titre: 'Filtration glomérulaire', matiereId: 'physiologie', hasAnnales: true },
      { slug: 'clairance-renale', titre: 'Clairance rénale', matiereId: 'physiologie', hasAnnales: true },
      { slug: 'bilan-sodium', titre: 'Rôle du rein dans le bilan du sodium', matiereId: 'physiologie', hasAnnales: true },
      { slug: 'regulation-potassium', titre: 'Régulation du potassium', matiereId: 'physiologie', hasAnnales: true },
      { slug: 'desordres-hydroelectrolytiques', titre: 'Désordres hydroélectrolytiques', matiereId: 'physiologie', hasAnnales: true },
      { slug: 'miction', titre: 'Miction', matiereId: 'physiologie', hasAnnales: true },
      { slug: 'role-rein-equilibre-acido-basique', titre: 'Rôle du rein dans l\'équilibre acido-basique', matiereId: 'physiologie', hasAnnales: true },
    ],
  },
  {
    id: 'semiologie',
    nom: 'Sémiologie Médicale',
    icon: 'stethoscope',
    color: '#2563EB',
    cours: [
      { slug: 'irc', titre: 'Insuffisance rénale chronique (IRC)', matiereId: 'semiologie', hasAnnales: true },
      { slug: 'ira-fonctionnelle', titre: 'Insuffisance rénale aiguë fonctionnelle', matiereId: 'semiologie', hasAnnales: false },
      { slug: 'semiologie-urologique', titre: 'Sémiologie urologique', matiereId: 'semiologie', hasAnnales: true },
    ],
  },
  {
    id: 'andrologie',
    nom: 'Andrologie',
    icon: 'heart-pulse',
    color: '#DC2626',
    cours: [
      { slug: 'andrologie', titre: 'Cours d\'andrologie', matiereId: 'andrologie', hasAnnales: true },
      { slug: 'appareil-genital-masculin', titre: 'Appareil génital masculin', matiereId: 'andrologie', hasAnnales: true },
    ],
  },
  {
    id: 'anatomie',
    nom: 'Anatomie',
    icon: 'bone',
    color: '#059669',
    cours: [
      { slug: 'perinee-femme', titre: 'Anatomie topographique du périnée chez la femme', matiereId: 'anatomie', hasAnnales: false },
      { slug: 'petit-bassin', titre: 'Anatomie topographique du petit bassin', matiereId: 'anatomie', hasAnnales: false },
      { slug: 'retroperitoine', titre: 'Rétropéritoine et sémiologie radiologique', matiereId: 'anatomie', hasAnnales: false },
    ],
  },
  {
    id: 'pharmacologie',
    nom: 'Pharmacologie',
    icon: 'pill',
    color: '#F59E0B',
    cours: [
      { slug: 'pharmacologie-ue5', titre: 'Pharmacologie UE5', matiereId: 'pharmacologie', hasAnnales: true },
    ],
  },
  {
    id: 'histologie',
    nom: 'Histologie',
    icon: 'microscope',
    color: '#EC4899',
    cours: [
      { slug: 'histologie-appareil-genital', titre: 'Histologie de l\'appareil génital masculin', matiereId: 'histologie', hasAnnales: true },
    ],
  },
  {
    id: 'medecine-nucleaire',
    nom: 'Médecine Nucléaire',
    icon: 'atom',
    color: '#06B6D4',
    cours: [
      { slug: 'medecine-nucleaire-ue5', titre: 'Médecine nucléaire UE5', matiereId: 'medecine-nucleaire', hasAnnales: true },
    ],
  },
];

export function getAllCours(): PriveCours[] {
  return PRIVE_MATIERES.flatMap((m) => m.cours);
}

export function getCoursBySlug(slug: string): PriveCours | undefined {
  return getAllCours().find((c) => c.slug === slug);
}

export function getMatiereById(id: string): PriveMatiere | undefined {
  return PRIVE_MATIERES.find((m) => m.id === id);
}

export function getMatiereForCours(slug: string): PriveMatiere | undefined {
  const cours = getCoursBySlug(slug);
  if (!cours) return undefined;
  return getMatiereById(cours.matiereId);
}
