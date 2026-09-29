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
  'approfondi-hors-mg-externe': 'd6a91c09-fb36-42c4-86d7-369a3c1fbba4',
  'approfondi-hors-mg-interne': 'a9669512-3f29-487e-a0d5-658bbfa77873',
  'approfondi-mg-externe': 'e9251aaf-42bc-401a-bc10-5ff471dcefc6',
  'approfondi-mg-interne': '2b521959-a964-489f-b480-bf727a705f35',
  'approfondi-planning-externe': '18d4b098-f18b-4f91-911f-503ab5a18cc2',
  'approfondi-planning-interne': '17550edf-6c8c-4775-b0a5-98fdaeabbf98',
  'decouverte': '95a54a38-84ee-44a2-8a8e-4af074456333',
  'essentiel-hors-mg-externe': 'e65d96eb-acda-4555-9df9-3d73078560aa',
  'essentiel-hors-mg-interne': '766a9dda-f260-4311-8639-d719abc89621',
  'essentiel-mg-externe': 'a95d381f-76be-41d4-b955-8a6afbdd881a',
  'essentiel-mg-interne': 'aedcddf9-5f25-4829-90a8-e0c4bbc52053',
  'essentiel-planning-externe': '2b928981-6e28-4f2c-9f65-0eae60ec2c39',
  'essentiel-planning-interne': 'a0ff1dab-4c90-46d0-8a06-136f3c4b5c98',
  'intensif-hors-mg-externe': 'a895b76a-a315-4a7e-bb24-6045b2c35f5f',
  'intensif-hors-mg-interne': 'b1226be1-fd79-4f9c-86a9-b82df0d03ad3',
  'intensif-mg-externe': 'b065b7c7-f580-4474-af4b-e5976efe4d84',
  'intensif-mg-interne': 'd1a0cb02-c74c-4647-84b5-7239af91ff9c',
  'intensif-planning-externe': 'a9fb4aa0-0157-4b0c-97a7-a9f72eeda24d',
  'intensif-planning-interne': '3a7cd73d-2c4c-44cc-96e2-25e14defb51c',
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
