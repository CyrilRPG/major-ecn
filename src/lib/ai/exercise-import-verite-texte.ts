/**
 * Import d'exercices — helpers de texte PURS (aucune dépendance serveur).
 *
 * Trois familles :
 *  - comparaison tolérante aux artefacts de ligature de la police des supports
 *    Major ECN (« diagnosKc », « reproduc+on », « Prépara&on », « plaqueces ») ;
 *  - nettoyage prudent d'un texte du document AVANT de l'afficher à un élève
 *    (les ligatures sûres seulement ; ce qui ne peut pas être reconstruit est
 *    laissé et signalé « à relire ») ;
 *  - détection des notes que le modèle laisse À LA PLACE du contenu
 *    (« [contexte manquant] », « voir l'énoncé », « d'après le corpus »…), et
 *    de la regex « fabrication » de `scripts/banques/qualite-publication.mjs`.
 *
 * Le texte extrait d'un PDF sert à COMPARER et à DÉCIDER ; il n'est affiché aux
 * élèves qu'après `nettoyerLigaturesPourAffichage`, et en le signalant.
 */

/* ─────────── Normalisation de comparaison ─────────── */

/**
 * Forme canonique pour comparer un texte du modèle à un texte du document.
 * Symétrique : appliquée aux DEUX côtés, elle neutralise les artefacts sans
 * jamais les « corriger » (un vrai K devient aussi « ti » des deux côtés).
 *  - K, +, & → « ti » (ligature « ti » perdue par la police) ;
 *  - ﬁ ﬂ ﬀ ﬃ ﬄ → lettres ;
 *  - « tt » → « c » (« plaquettes » et « plaqueces » deviennent identiques) ;
 *  - accents, casse et ponctuation effacés.
 */
export function normaliserPourComparaison(s: string): string {
  return String(s ?? '')
    .replace(/K/g, 'ti').replace(/\+/g, 'ti').replace(/&/g, 'ti')
    .replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl').replace(/ﬀ/g, 'ff').replace(/ﬃ/g, 'ffi').replace(/ﬄ/g, 'ffl')
    .replace(/<[^>]+>/g, ' ')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/tt/g, 'c')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

/** Mots significatifs (≥ 4 lettres) d'un texte, en forme canonique. */
export function jetons(s: string): Set<string> {
  return new Set(normaliserPourComparaison(s).split(' ').filter((w) => w.length >= 4));
}

/** Part des jetons de `a` présents dans `b`, rapportée au plus petit ensemble. */
export function recouvrement(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let c = 0; for (const w of a) if (b.has(w)) c++;
  return c / Math.min(a.size, b.size);
}

/** Recouvrement de vocabulaire, tolérant aux textes courts (0 à 1). */
export function ressemblance(a: string, b: string): number {
  const na = normaliserPourComparaison(a).replace(/ /g, '');
  const nb = normaliserPourComparaison(b).replace(/ /g, '');
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.95;
  const ja = jetons(a); const jb = jetons(b);
  if (!ja.size || !jb.size) {
    let i = 0; while (i < Math.min(na.length, nb.length) && na[i] === nb[i]) i++;
    return i / Math.max(na.length, nb.length);
  }
  return recouvrement(ja, jb);
}

/**
 * Part des mots d'une vignette du document que l'énoncé du modèle reprend
 * (0 à 1). 1 pour une vignette vide : rien à couvrir.
 */
export function couvertureVignette(vignette: string, enonce: string): number {
  const jv = jetons(vignette); if (!jv.size) return 1;
  const je = jetons(enonce);
  let c = 0; for (const w of jv) if (je.has(w)) c++;
  return c / jv.size;
}

/* ─────────── Nettoyage pour affichage ─────────── */

/**
 * Rend lisible un texte extrait du document, sans inventer : seules les
 * ligatures dont la reconstruction est sûre sont rétablies.
 *  - « K », « + », « & » entre deux lettres minuscules → « ti » (« diagnosKc »
 *    → « diagnostic ») ; un K entre majuscules (« AMIKACINE ») ou après un
 *    chiffre (« 3 Kg ») est conservé ;
 *  - ﬁ ﬂ ﬀ ﬃ ﬄ → lettres ;
 *  - espaces normalisés.
 * La ligature « tt » rendue « c » (« plaqueces ») n'est PAS réversible sans
 * dictionnaire : elle reste, et l'appelant signale le texte comme à relire.
 */
export function nettoyerLigaturesPourAffichage(s: string): string {
  return String(s ?? '')
    .replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl').replace(/ﬀ/g, 'ff').replace(/ﬃ/g, 'ffi').replace(/ﬄ/g, 'ffl')
    .replace(/(?<=[a-zàâäéèêëîïôöùûüç])[K+&](?=[a-zàâäéèêëîïôöùûüçé])/g, 'ti')
    .replace(/\s+/g, ' ').trim();
}

/** Le texte porte-t-il encore un artefact non réparable (« tt » → « c », K isolé) ? */
export function porteArtefactsResiduels(s: string): boolean {
  const t = String(s ?? '');
  return /[a-z][K+&][a-z]/.test(t) || /\b(?:plaqueces|gouces|bandelece|intermicente|cece|leces|mece|pece)\b/i.test(t);
}

/* ─────────── Notes du modèle à la place du contenu ─────────── */

/** Forme sans accents ni apostrophes typographiques, pour les regex ci-dessous. */
function aplatir(s: string): string {
  return String(s ?? '').replace(/<[^>]+>/g, ' ').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’‘`´]/g, "'").replace(/\s+/g, ' ').toLowerCase();
}

/**
 * Fragments par lesquels le modèle avoue qu'il n'a pas recopié le document :
 * un placeholder, un renvoi à un contexte qu'il n'a pas transcrit, ou une note
 * de prudence. Appliqués à un texte aplati (`aplatir`).
 */
export const MOTIFS_NOTE_DU_MODELE: RegExp[] = [
  /\[\s*contexte/,
  /contexte (?:clinique )?(?:manquant|absent|non (?:fourni|disponible|transcrit))/,
  /\[\s*(?:vignette|enonce|donnees|extrait|texte)[^\]]{0,60}\]/,
  /\b(?:voir|cf\.?|se reporter a) (?:l')?(?:enonce|vignette|dossier|cas clinique)\b/,
  /\bcf\.? (?:la )?vignette\b/,
  /\bmeme patient(?:e)?\b/,
  /\bsuite du (?:dossier|cas)\b/,
  /\bnon disponible\b/,
  /\bnon fourni(?:e|es|s)?\b/,
  /\b(?:dans l'|l'|cet )?extrait fourni\b/,
  /\ba verifier\b/,
  /\bcorrection fondee sur\b/,
  /\ble document (?:fourni )?ne (?:mentionne|precise|contient|fournit|comporte)\b/,
  /\bd'apres le corpus\b/,
  /\b(?:le|la|les) (?:corpus|source) (?:ne )?(?:mentionne|indique|precise)\b/,
  /\bnon (?:lisible|visible|transcrit(?:e)?)\b/,
  /\billisible dans (?:la|le) (?:source|document)\b/,
  /\bpage (?:precedente|suivante)\b/,
];

/**
 * Regex « fabrication » de `scripts/banques/qualite-publication.mjs`, reprise
 * TELLE QUELLE (un test vérifie qu'elle n'a pas divergé du script). Elle
 * s'applique au texte brut (accents conservés, balises retirées).
 */
export const REGEX_FABRICATION = /(?:correction|réponse) fondée sur le corpus|(?:la source|le corpus|le document fourni) (?:ne mentionne|ne cite|précise|indique)|correction s.appuie exclusivement|ce distracteur|mmctm|(?:problème de|problème d’)(?:quelles?|dans |à propos)|quelle décision est appropriée concernant (?:On|Vous)|(?:à vérifier|à compléter) (?:avant publication|par le rédacteur)|incohérence du document|contradictoires.+indiqués comme corrects/i;

/**
 * Rend le fragment fautif (tel qu'écrit, pour le montrer à l'administrateur)
 * si le texte contient une note du modèle ou un motif de fabrication, `null`
 * sinon.
 */
export function noteDuModele(texte: string): string | null {
  const brut = String(texte ?? '').replace(/<[^>]+>/g, ' ');
  const plat = aplatir(brut);
  for (const re of MOTIFS_NOTE_DU_MODELE) {
    const m = re.exec(plat);
    if (m) {
      // On remonte le fragment d'origine (accents conservés) à la même position.
      const debut = Math.max(0, m.index - 10);
      return brut.replace(/\s+/g, ' ').slice(debut, m.index + m[0].length + 20).trim();
    }
  }
  const f = REGEX_FABRICATION.exec(brut.replace(/\s+/g, ' '));
  return f ? f[0].slice(0, 80) : null;
}

/** Une ligne qui n'est QU'un placeholder (crochets, parenthèses, ponctuation autour). */
export function estPlaceholderSeul(ligne: string): boolean {
  const l = String(ligne ?? '').trim();
  if (!l || l.length > 140) return false;
  const coeur = l.replace(/^[\s[(«"'*_-]+|[\s\])»"'*_.:;-]+$/g, '');
  if (!coeur) return false;
  if (!MOTIFS_NOTE_DU_MODELE.some((re) => re.test(aplatir(coeur)))) return false;
  // Un placeholder seul est court et n'interroge pas : au-delà de huit mots,
  // ou avec un point d'interrogation, c'est une phrase de contenu qui contient
  // une note, et il faut la relire plutôt que l'effacer.
  return coeur.split(/\s+/).length <= 8 && !/\?/.test(coeur);
}

/**
 * Retire d'un énoncé les lignes qui ne sont qu'un placeholder du modèle.
 * Une note MÊLÉE à une phrase de contenu n'est pas touchée (elle est signalée
 * par ailleurs comme bloquante).
 */
export function retirerPlaceholdersSeuls(enonce: string): { enonce: string; retires: string[] } {
  const retires: string[] = [];
  const lignes = String(enonce ?? '').split('\n');
  const gardees = lignes.filter((l) => { if (estPlaceholderSeul(l)) { retires.push(l.trim()); return false; } return true; });
  return { enonce: gardees.join('\n').replace(/\n{3,}/g, '\n\n').trim(), retires };
}

/** Dernière ligne non vide d'un énoncé : la question proprement dite, sans sa vignette. */
export function derniereLigne(enonce: string): string {
  const lignes = String(enonce ?? '').split('\n').map((l) => l.trim()).filter(Boolean);
  return lignes[lignes.length - 1] ?? '';
}

/** Libellé court d'un texte, pour les listes du rapport. */
export function libelleCourt(s: string, n = 70): string {
  const t = String(s ?? '').replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '…' : t;
}
