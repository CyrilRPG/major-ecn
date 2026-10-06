/**
 * Tutoriel vidéo de l'élève — quelle vidéo pour quel élève.
 *
 * Une vidéo par profil (formule × voie × Médecine générale / « Mon planning ») :
 * chacune ne montre QUE ce à quoi l'élève a réellement accès. Les vidéos sont
 * produites hors de ce dépôt (projet Remotion `tutoriel-video`, captures de la
 * vraie plateforme, voix Eleven v4) et hébergées sur Bunny Stream.
 *
 * Module pur (aucun import serveur) : utilisé par le layout élève, la route de
 * l'application mobile et les tests.
 */

export type TutorielOffre = 'decouverte' | 'essentiel' | 'intensif' | 'approfondi';

export type TutorielEntree = {
  /** Offre de rang le plus haut de l'élève (`parseScope().offer`). */
  offer: TutorielOffre | string | null | undefined;
  /** Espace Découverte (col-decouverte sans formule payée). */
  isDecouverte: boolean;
  /** Accès Médecine générale (`hasMedecineGeneraleAccess`). */
  medecineGenerale: boolean;
  /** « Mon planning » ouvert pour cet élève (`planAvailableFor`). */
  planning: boolean;
  voie: 'interne' | 'externe' | null | undefined;
};

/** Clé du profil vidéo (identique aux compositions Remotion `tutoriel-<clé>`). */
export function cleTutoriel(e: TutorielEntree): string {
  if (e.isDecouverte || e.offer === 'decouverte') return 'decouverte';
  const offre: TutorielOffre = e.offer === 'essentiel' || e.offer === 'intensif' || e.offer === 'approfondi'
    ? e.offer
    : 'intensif';
  // Sans voie renseignée, l'épreuve par défaut est la voie interne (QCM).
  const voie = e.voie === 'externe' ? 'externe' : 'interne';
  const famille = e.medecineGenerale ? 'mg' : e.planning ? 'planning' : 'hors-mg';
  return `${offre}-${famille}-${voie}`;
}

/**
 * Vidéos Bunny Stream par profil (identifiants de vidéo de la librairie).
 * Rempli par `tutoriel-video/scripts/publier.mjs` après le rendu.
 */
export const TUTORIEL_VIDEOS: Readonly<Record<string, string>> = {
  'approfondi-hors-mg-externe': '0277389a-409a-4fa6-bf35-9ebdad686c10',
  'approfondi-hors-mg-interne': '6dcb6c23-91ca-4f21-947c-d2fd90d21773',
  'approfondi-mg-externe': '5c0be5a3-588b-4a7d-8214-d18ef25efab4',
  'approfondi-mg-interne': '2214a838-45b3-4410-8956-ee03d6a86667',
  'approfondi-planning-externe': 'c812e1e9-3136-47c4-ac97-ea42f6611c2d',
  'approfondi-planning-interne': '675d2853-d375-49e6-b44e-3ea54d9ba4bc',
  'decouverte': '00cfb4d9-549c-4713-b0d3-59a5f13606cf',
  'essentiel-hors-mg-externe': '3521581b-2956-42a6-a95e-f7d95883d53c',
  'essentiel-hors-mg-interne': '656ac1d8-69c5-42b3-802a-4666c0b89e60',
  'essentiel-mg-externe': '7fc780c5-6259-46c4-9094-1ab6b8e31416',
  'essentiel-mg-interne': '77f4e3a0-b530-4eaf-a54d-9fd14d7d0e9e',
  'essentiel-planning-externe': '2a3c1f34-4ced-4a25-9885-dc009b33294c',
  'essentiel-planning-interne': '094eff9e-9e6a-4884-8cc0-94b2691a8423',
  'intensif-hors-mg-externe': 'a4faa0d8-49c1-4243-a668-807c39be532e',
  'intensif-hors-mg-interne': '5422af94-f715-4641-a37c-097367abf6b1',
  'intensif-mg-externe': '3d14a072-6e55-48cb-92ee-87de5b7bde44',
  'intensif-mg-interne': 'fe5b5512-5add-4b7f-9ea3-4a7753d859b4',
  'intensif-planning-externe': '6ca272b8-626d-4895-bb5d-06f9a642e549',
  'intensif-planning-interne': '688c4681-8775-46ea-a15d-03eae2342af5',
};

/**
 * Vidéo à montrer. Si un profil n'a pas (encore) sa vidéo, on se rabat sur le
 * plus proche SANS jamais montrer plus que ce à quoi l'élève a droit : même
 * formule et même voie, en retirant le Parcours du Major puis « Mon
 * planning » (des contenus en moins, jamais en trop).
 */
export function videoTutoriel(e: TutorielEntree, videos: Readonly<Record<string, string>> = TUTORIEL_VIDEOS): { cle: string; videoId: string } | null {
  const cle = cleTutoriel(e);
  const candidats = [cle];
  if (cle !== 'decouverte') {
    const [offre, ...reste] = cle.split('-');
    const voie = reste[reste.length - 1];
    // La vidéo « planning » est celle de la Médecine générale moins le Parcours du Major.
    if (!cle.includes('-hors-mg-')) candidats.push(`${offre}-planning-${voie}`);
    candidats.push(`${offre}-hors-mg-${voie}`);
  }
  for (const c of candidats) if (videos[c]) return { cle: c, videoId: videos[c] };
  return null;
}

/** Tutoriel vu (clé cloisonnée par compte via lib/student/onboarding). */
export const TUTORIEL_VU_KEY = 'major-ecn:tutoriel-video-vu:v1';
/** Événement global qui ouvre le tutoriel (bouton de la barre, menu du compte). */
export const TUTORIEL_OPEN_EVENT = 'tutoriel:open';
