/**
 * Carte « Bien démarrer » de l'accueil — module PUR (testé).
 *
 * Six étapes dans l'ordre de la boucle pédagogique, cochées à partir de ce
 * que l'élève a RÉELLEMENT fait (jamais d'une case à cocher) : tutoriel vu,
 * premier EVC Check-up, priorités consultées, planning créé, première
 * révision ciblée, première révision transversale. Une étape dont le module
 * n'est pas ouvert à l'élève disparaît (elle ne bloque jamais la carte).
 */

export type EtapeCle = 'tutoriel' | 'checkup' | 'priorites' | 'planning' | 'ciblee' | 'transversale';

export type EtapeDef = {
  cle: EtapeCle;
  titre: string;
  /** Libellé court (pastille de la bande). */
  court: string;
  /** Pourquoi cette étape compte (une phrase). */
  pourquoi: string;
  cta: string;
  /** null : action locale (ouvrir le tutoriel). */
  href: string | null;
};

export const ETAPES: EtapeDef[] = [
  { cle: 'tutoriel', titre: 'Découvrir la plateforme', court: 'Tutoriel', pourquoi: 'Le tutoriel vidéo vous montre où tout se trouve, en quelques minutes.', cta: 'Voir le tutoriel', href: null },
  { cle: 'checkup', titre: 'Mesurer mon niveau', court: 'Check-up', pourquoi: 'Un premier EVC Check-up situe votre niveau et repère vos lacunes, item par item.', cta: 'Faire mon Check-up', href: '/checkup' },
  { cle: 'priorites', titre: 'Lire mes priorités', court: 'Priorités', pourquoi: 'Vos résultats y deviennent une liste claire : quoi revoir, quoi consolider, et pourquoi.', cta: 'Voir mes priorités', href: '/mes-priorites' },
  { cle: 'planning', titre: 'Créer mon planning', court: 'Planning', pourquoi: 'Votre programme jour par jour jusqu’à l’EVC, construit selon vos disponibilités.', cta: 'Créer mon planning', href: '/planificateur' },
  { cle: 'ciblee', titre: 'Réviser une priorité', court: 'Révision ciblée', pourquoi: 'Une révision ciblée retravaille un item à revoir au bon moment : bouton « Réviser » de Mes priorités.', cta: 'Choisir un item', href: '/mes-priorites#a_revoir' },
  { cle: 'transversale', titre: 'Entretenir mes acquis', court: 'Révision du jour', pourquoi: 'La révision transversale du jour : un peu chaque jour, pour ne rien oublier.', cta: 'Faire ma révision du jour', href: '/revisions-transversales' },
];

export type Faits = Record<EtapeCle, boolean>;
/** Modules ouverts à l'élève (formule, réglages). */
export type Ouverts = { checkup: boolean; moteur: boolean; planning: boolean };

export type Etape = EtapeDef & { fait: boolean };
export type PriseEnMain = { etapes: Etape[]; faites: number; total: number; prochaine: Etape | null; terminee: boolean };

const OUVERTE: Record<EtapeCle, (o: Ouverts) => boolean> = {
  tutoriel: () => true,
  checkup: (o) => o.checkup,
  priorites: (o) => o.moteur,
  planning: (o) => o.planning,
  ciblee: (o) => o.moteur,
  transversale: () => true,
};

export function priseEnMain(faits: Faits, ouverts: Ouverts): PriseEnMain {
  const etapes = ETAPES.filter((e) => OUVERTE[e.cle](ouverts)).map((e) => ({ ...e, fait: !!faits[e.cle] }));
  const faites = etapes.filter((e) => e.fait).length;
  return { etapes, faites, total: etapes.length, prochaine: etapes.find((e) => !e.fait) ?? null, terminee: faites === etapes.length };
}
