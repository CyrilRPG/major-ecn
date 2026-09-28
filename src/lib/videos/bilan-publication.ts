/**
 * Bilan avant publication (Admin › Vidéos, 28/09/2026).
 *
 * Demande de Cyril : avant d'enregistrer, une fenêtre récapitule ce qui va
 * partir (destination, vidéo Bunny, formules, voies, accès nominatifs,
 * supports) et signale ce qui ressemble à une erreur, pour la corriger AVANT
 * que les élèves ne la voient. Ce module calcule les alertes ; il ne bloque
 * rien (la personne décide), sauf ce que le formulaire refusait déjà.
 *
 * Module PUR : aucune dépendance au navigateur ni au serveur (testé seul).
 */

export type TypeVideoBilan = 'cours' | 'seance_approfondie';

export type SupportBilan = {
  nom: string;
  /** Inconnus pour un support déjà en ligne (publication d'une vidéo « À valider »). */
  taille: number | null;
  mime: string | null;
  /** Audience propre au support (sinon : celle de la séance). */
  differentes: boolean;
  voies: string[];
  offers: string[];
};

export type SeanceBilan = {
  titre: string;
  /** Séance à venir : pas encore de vidéo, seulement des dossiers. */
  aVenir: boolean;
  /** Identifiant Bunny extrait du lien ; null si aucun lien. */
  bunnyId: string | null;
  liveAt: string | null;
  voies: string[];
  offers: string[];
  deniedUserIds: string[];
  allowedUserIds: string[];
  supports: SupportBilan[];
};

export type Alerte = { niveau: 'attention' | 'info'; texte: string };

const LIBELLE_OFFRE: Record<string, string> = {
  essentiel: 'Formule Essentielle',
  intensif: 'Formule Intensive',
  approfondi: 'Programme Approfondi',
};
const LIBELLE_VOIE: Record<string, string> = { interne: 'voie interne', externe: 'voie externe' };

/** Formule attendue pour chaque catégorie (celle cochée par défaut). */
export const OFFRE_ATTENDUE: Record<TypeVideoBilan, string> = {
  cours: 'intensif',
  seance_approfondie: 'approfondi',
};

export const libelleOffre = (o: string) => LIBELLE_OFFRE[o] ?? o;
export const libelleVoie = (v: string) => LIBELLE_VOIE[v] ?? v;

/** Taille lisible : « 2,4 Mo ». */
export function tailleLisible(octets: number): string {
  if (!(octets > 0)) return '0 o';
  if (octets < 1024) return `${octets} o`;
  if (octets < 1024 * 1024) return `${Math.round(octets / 1024)} Ko`;
  return `${(octets / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`;
}

const cle = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const estPdf = (s: SupportBilan) => s.mime === 'application/pdf' || /\.pdf$/i.test(s.nom);
/** Fichier local choisi à l'instant (et non support déjà en ligne). */
const estFichierLocal = (s: SupportBilan) => s.taille !== null;

/** Au-delà, un support met longtemps à s'ouvrir sur téléphone. */
export const SUPPORT_LOURD_OCTETS = 40 * 1024 * 1024;

/**
 * Alertes d'une séance du lot. `existantes` : les vidéos déjà présentes dans
 * l'item et la catégorie ; `lot` : toutes les séances en cours d'envoi (pour
 * repérer un doublon DANS le lot).
 */
export function alertesSeance(
  s: SeanceBilan,
  index: number,
  ctx: { type: TypeVideoBilan; existantes: { titre: string; bunnyId: string | null }[]; lot: SeanceBilan[] },
): Alerte[] {
  const out: Alerte[] = [];
  const attendue = OFFRE_ATTENDUE[ctx.type];

  if (!s.offers.includes(attendue)) {
    out.push({
      niveau: 'attention',
      texte: `${libelleOffre(attendue)} non cochée alors que la catégorie lui est destinée : ses élèves ne verront pas cette ${ctx.type === 'cours' ? 'vidéo' : 'séance'}.`,
    });
  }
  if (s.voies.length === 1) {
    const autre = s.voies[0] === 'interne' ? 'externe' : 'interne';
    out.push({ niveau: 'attention', texte: `Réservée à la ${libelleVoie(s.voies[0])} : les élèves de ${libelleVoie(autre)} ne la verront pas.` });
  }

  const titre = cle(s.titre);
  if (ctx.existantes.some((v) => cle(v.titre) === titre)) {
    out.push({ niveau: 'attention', texte: 'Une vidéo porte déjà ce titre dans cet item : doublon ?' });
  }
  if (ctx.lot.some((o, i) => i !== index && cle(o.titre) === titre)) {
    out.push({ niveau: 'attention', texte: 'Ce titre est utilisé deux fois dans ce dépôt.' });
  }
  if (s.bunnyId) {
    if (ctx.existantes.some((v) => v.bunnyId === s.bunnyId)) {
      out.push({ niveau: 'attention', texte: 'Cette vidéo Bunny est déjà publiée dans cet item : doublon ?' });
    }
    if (ctx.lot.some((o, i) => i !== index && o.bunnyId === s.bunnyId)) {
      out.push({ niveau: 'attention', texte: 'Le même lien Bunny est collé sur deux séances de ce dépôt.' });
    }
  }

  if (s.aVenir && !s.bunnyId) {
    if (s.supports.length === 0) {
      out.push({ niveau: 'attention', texte: 'Séance à venir sans aucun document : elle restera invisible des élèves tant qu’aucun support n’est déposé.' });
    }
    if (!s.liveAt) {
      out.push({ niveau: 'info', texte: 'Séance à venir sans date : les élèves ne sauront pas quand elle a lieu.' });
    }
  }

  const noms = new Set<string>();
  for (const sup of s.supports) {
    if (estFichierLocal(sup) && !estPdf(sup)) out.push({ niveau: 'attention', texte: `« ${sup.nom} » n’est pas un PDF.` });
    if (sup.taille === 0) out.push({ niveau: 'attention', texte: `« ${sup.nom} » est vide (0 octet).` });
    else if (sup.taille !== null && sup.taille > SUPPORT_LOURD_OCTETS) {
      out.push({ niveau: 'info', texte: `« ${sup.nom} » pèse ${tailleLisible(sup.taille)} : long à ouvrir sur téléphone.` });
    }
    const n = cle(sup.nom);
    if (noms.has(n)) out.push({ niveau: 'attention', texte: `« ${sup.nom} » est joint deux fois.` });
    noms.add(n);
    if (sup.differentes && sup.offers.length === 0) {
      out.push({ niveau: 'attention', texte: `« ${sup.nom} » : audience propre sans aucune formule, personne ne le verra.` });
    }
  }

  if (s.allowedUserIds.length > 0) {
    out.push({ niveau: 'info', texte: `${s.allowedUserIds.length} élève${s.allowedUserIds.length > 1 ? 's' : ''} y ont accès nominativement, même hors formule.` });
  }
  if (s.deniedUserIds.length > 0) {
    out.push({ niveau: 'info', texte: `${s.deniedUserIds.length} élève${s.deniedUserIds.length > 1 ? 's' : ''} en sont exclus nominativement.` });
  }
  return out;
}
