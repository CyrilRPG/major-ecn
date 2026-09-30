/**
 * Modèles d'e-mail des relances — TEXTES EXACTS du cahier des charges (§14 à
 * §17), en valeurs par défaut dans le code, surchargées champ par champ par
 * les modèles édités en administration (`decouverte_parametres.modeles`).
 *
 * Variables : {{prenom}} (« Bonjour, » seul si le prénom est absent),
 * {{duree_video}} (durée réelle de la visite guidée, jamais en dur),
 * {{validite}} (jours de validité du lien d'accès).
 *
 * Le mot « récemment » est INTERDIT (§6, §17) : une demande peut être
 * ancienne. `validerModele` le refuse à l'enregistrement, un test le vérifie
 * sur les valeurs par défaut.
 *
 * Module PUR.
 */
import type { ModeleSurcharge, TypeModele } from './types';

export type Modele = {
  objet: string;
  preheader: string;
  surtitre: string;
  titre: string;
  paragraphes: string[];
  cta: string;
  sousCta: string;
  ligneVideoIntro: string;
  ligneVideo: string;
  aideTitre: string;
  aideTexte: string;
  signature: string;
  /** Structure (non éditable) : rangée des 4 bénéfices, ligne vidéo. */
  benefices: boolean;
  video: boolean;
};

export const CHAMPS_EDITABLES: ReadonlyArray<{ cle: keyof ModeleSurcharge; label: string; multi?: boolean }> = [
  { cle: 'objet', label: 'Objet' },
  { cle: 'preheader', label: 'Préheader (texte d’aperçu)' },
  { cle: 'surtitre', label: 'Surtitre' },
  { cle: 'titre', label: 'Titre' },
  { cle: 'paragraphes', label: 'Paragraphes (un par ligne)', multi: true },
  { cle: 'cta', label: 'Libellé du bouton' },
  { cle: 'sousCta', label: 'Ligne sous le bouton' },
  { cle: 'ligneVideoIntro', label: 'Ligne vidéo — phrase d’introduction' },
  { cle: 'ligneVideo', label: 'Ligne vidéo — texte du lien' },
  { cle: 'aideTitre', label: 'Aide — titre' },
  { cle: 'aideTexte', label: 'Aide — texte' },
  { cle: 'signature', label: 'Signature' },
];

export const MODELES_DEFAUT: Record<TypeModele, Modele> = {
  R1: {
    objet: 'Votre espace découverte Major ECN vous attend',
    preheader: 'Votre accès découverte Major ECN vous attend',
    surtitre: 'Offre découverte',
    titre: 'Votre espace découverte Major ECN vous attend',
    paragraphes: [
      'Vous avez demandé à découvrir Major ECN et votre accès à la plateforme est bien disponible.',
      'Nous avons remarqué que vous n’avez pas encore eu l’occasion de vous connecter.',
    ],
    cta: 'Accéder à mon espace découverte',
    sousCta: 'Votre accès est déjà activé. Il ne vous reste plus qu’à découvrir la plateforme.',
    ligneVideoIntro: 'Vous souhaitez d’abord voir comment fonctionne Major ECN ?',
    ligneVideo: 'Visite guidée — {{duree_video}}',
    aideTitre: 'Une question ?',
    aideTexte: 'Répondez simplement à cet email.',
    signature: '',
    benefices: true,
    video: true,
  },
  R2: {
    objet: 'Avez-vous pu découvrir Major ECN ?',
    preheader: 'Votre espace découverte Major ECN est toujours disponible',
    surtitre: 'Offre découverte',
    titre: 'Avez-vous pu découvrir Major ECN ?',
    paragraphes: [
      'Votre espace découverte Major ECN est toujours disponible.',
      'Si vous n’avez pas encore eu le temps de parcourir la plateforme, vous pouvez y accéder directement ci-dessous.',
    ],
    cta: 'Accéder à mon espace',
    sousCta: '',
    ligneVideoIntro: 'Vous souhaitez d’abord voir comment fonctionne Major ECN ?',
    ligneVideo: 'Visite guidée — {{duree_video}}',
    aideTitre: 'Une difficulté pour vous connecter ou une question concernant votre préparation aux EVC ?',
    aideTexte: 'Répondez simplement à cet email.',
    signature: '',
    benefices: true,
    video: true,
  },
  R3: {
    objet: 'Votre accès découverte Major ECN est toujours disponible',
    preheader: 'Votre accès découverte Major ECN est toujours disponible',
    surtitre: 'Offre découverte',
    titre: 'Votre accès découverte Major ECN est toujours disponible',
    paragraphes: [
      'Vous aviez souhaité découvrir notre plateforme de préparation aux EVC.',
      'Si votre projet est toujours d’actualité, votre espace découverte reste accessible.',
    ],
    cta: 'Accéder à mon espace',
    sousCta: '',
    ligneVideoIntro: '',
    ligneVideo: '',
    aideTitre: '',
    aideTexte: 'Si vous avez une question, vous pouvez répondre directement à cet email.',
    signature: 'L’équipe Major ECN',
    benefices: false,
    video: false,
  },
  ancien_acces: {
    objet: 'Votre accès Major ECN est toujours disponible',
    preheader: 'Votre accès Major ECN est toujours disponible',
    surtitre: 'Offre découverte',
    titre: 'Votre accès Major ECN est toujours disponible',
    paragraphes: [
      'Vous aviez demandé à découvrir la plateforme Major ECN.',
      'Si votre projet de préparation aux EVC est toujours d’actualité, votre espace découverte est toujours disponible.',
    ],
    cta: 'Découvrir Major ECN',
    sousCta: '',
    ligneVideoIntro: '',
    ligneVideo: 'Voir la plateforme en vidéo',
    aideTitre: 'Une question ?',
    aideTexte: 'Répondez simplement à cet email.',
    signature: 'L’équipe Major ECN',
    benefices: false,
    video: true,
  },
  renvoi_lien: {
    objet: 'Votre lien d’accès Major ECN',
    preheader: 'Votre nouveau lien d’accès à votre espace découverte',
    surtitre: 'Offre découverte',
    titre: 'Votre nouveau lien d’accès Major ECN',
    paragraphes: [
      'Vous avez demandé un nouveau lien pour accéder à votre espace découverte Major ECN.',
      'Ce lien est personnel et valable {{validite}} jours.',
    ],
    cta: 'Accéder à mon espace',
    sousCta: '',
    ligneVideoIntro: '',
    ligneVideo: '',
    aideTitre: 'Une difficulté pour vous connecter ?',
    aideTexte: 'Répondez simplement à cet email.',
    signature: 'L’équipe Major ECN',
    benefices: false,
    video: false,
  },
};

/** Les 4 bénéfices (R1, R2) — textes validés par le client (retouches). */
export const BENEFICES: ReadonlyArray<{ icone: string; titre: string; texte: string }> = [
  { icone: 'decouverte-ico-cours.png', titre: 'Cours & fiches', texte: 'Des contenus clairs et à jour' },
  { icone: 'decouverte-ico-qcm.png', titre: 'QCM / QROC', texte: 'Entraînements adaptés aux épreuves' },
  { icone: 'decouverte-ico-cas.png', titre: 'Cas cliniques & annales', texte: 'Pour vous confronter aux situations réelles' },
  { icone: 'decouverte-ico-suivi.png', titre: 'Suivi & révisions', texte: 'Des outils pour progresser efficacement' },
];

const TEXTE = (v: unknown): v is string => typeof v === 'string';

/** Modèle effectif : défaut du code, champ par champ surchargé par l'administration. */
export function modeleEffectif(type: TypeModele, surcharges: Partial<Record<TypeModele, ModeleSurcharge>> | null | undefined): Modele {
  const d = MODELES_DEFAUT[type];
  const s = surcharges?.[type] ?? {};
  const m: Modele = { ...d, paragraphes: [...d.paragraphes] };
  for (const cle of ['objet', 'preheader', 'surtitre', 'titre', 'cta', 'sousCta', 'ligneVideoIntro', 'ligneVideo', 'aideTitre', 'aideTexte', 'signature'] as const) {
    if (TEXTE(s[cle])) m[cle] = s[cle];
  }
  if (Array.isArray(s.paragraphes) && s.paragraphes.every(TEXTE)) m.paragraphes = s.paragraphes.map((x) => x.trim()).filter(Boolean);
  return m;
}

export const MOT_INTERDIT = /r[ée]cemment/i;

/** Erreurs bloquantes d'un modèle édité ([] si valide). */
export function validerModele(type: TypeModele, m: Modele): string[] {
  const e: string[] = [];
  if (!m.objet.trim()) e.push('L’objet est obligatoire.');
  if (m.objet.length > 150) e.push('Objet trop long (150 caractères au plus).');
  if (!m.titre.trim()) e.push('Le titre est obligatoire.');
  if (!m.cta.trim()) e.push('Le libellé du bouton est obligatoire.');
  if (m.paragraphes.length === 0) e.push('Au moins un paragraphe est requis.');
  const tout = [m.objet, m.preheader, m.surtitre, m.titre, ...m.paragraphes, m.cta, m.sousCta, m.ligneVideoIntro, m.ligneVideo, m.aideTitre, m.aideTexte, m.signature].join('\n');
  if (MOT_INTERDIT.test(tout)) e.push('Le mot « récemment » est interdit : une demande peut être ancienne.');
  if (/\{\{(?!\s*(prenom|duree_video|validite)\s*\}\})[^}]*\}\}/.test(tout)) e.push('Variable inconnue : seules {{prenom}}, {{duree_video}} et {{validite}} sont disponibles.');
  if (m.video && type !== 'renvoi_lien' && !m.ligneVideo.trim()) e.push('Le texte du lien vidéo est obligatoire pour ce modèle.');
  return e;
}

export type Variables = { prenom: string | null; dureeVideo: string; validiteJours: number };

/** Remplace les variables dans un texte brut (le HTML est échappé ensuite). */
export function remplir(texte: string, v: Variables): string {
  return texte
    .replace(/\{\{\s*prenom\s*\}\}/g, (v.prenom ?? '').trim())
    .replace(/\{\{\s*duree_video\s*\}\}/g, v.dureeVideo)
    .replace(/\{\{\s*validite\s*\}\}/g, String(v.validiteJours));
}

/** « Bonjour Sara, » — ou « Bonjour, » sans prénom (§14). */
export function salutation(prenom: string | null | undefined): string {
  const p = (prenom ?? '').trim();
  return p ? `Bonjour ${p},` : 'Bonjour,';
}

/** Surcharge minimale : seuls les champs qui diffèrent du défaut sont stockés. */
export function surchargeDepuisModele(type: TypeModele, m: Modele): ModeleSurcharge {
  const d = MODELES_DEFAUT[type];
  const s: ModeleSurcharge = {};
  for (const cle of ['objet', 'preheader', 'surtitre', 'titre', 'cta', 'sousCta', 'ligneVideoIntro', 'ligneVideo', 'aideTitre', 'aideTexte', 'signature'] as const) {
    if (m[cle] !== d[cle]) s[cle] = m[cle];
  }
  if (m.paragraphes.join('\n') !== d.paragraphes.join('\n')) s.paragraphes = m.paragraphes;
  return s;
}
