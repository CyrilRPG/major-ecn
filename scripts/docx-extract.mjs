#!/usr/bin/env node
/**
 * Extraction d'un .docx : texte structuré + images, dans le format attendu par
 * la chaîne de génération de fiches.
 *
 * POURQUOI CE SCRIPT. `scripts/pdf-extract.mjs` et `add_images_all.py` du dépôt
 * major-ecn-fiche ne lisent que du PDF. Le fonds Orthopédie est livré en .docx.
 * Plutôt que de convertir (ce qui perdrait l'ancrage des légendes), on lit le
 * .docx directement : c'est une archive ZIP contenant `word/document.xml` et
 * `word/media/*`.
 *
 * CE QU'IL GARANTIT, et qui compte pour la fidélité éditoriale :
 *  - l'ORDRE des images dans le document est conservé (relation r:embed →
 *    word/_rels/document.xml.rels → word/media/<fichier>) ;
 *  - une image n'est légendée QUE si le document porte une légende à son
 *    endroit. Aucune légende n'est fabriquée. Une figure sans légende source
 *    ressort avec `legende: null` — à l'appelant de ne rien inventer.
 *
 * Sortie : <outDir>/extract.json + <outDir>/img/*.{png,jpeg,…}
 *
 *   node scripts/docx-extract.mjs "<fichier.docx>" "<outDir>"
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

/** Lit une archive ZIP sans dépendance : renvoie Map<nom, Buffer>. */
function lireZip(buf) {
  const entrees = new Map();
  for (let i = 0; i < buf.length - 4; i++) {
    if (buf.readUInt32LE(i) !== 0x04034b50) continue;
    const methode = buf.readUInt16LE(i + 8);
    let tailleComp = buf.readUInt32LE(i + 18);
    let tailleBrute = buf.readUInt32LE(i + 22);
    const nomLen = buf.readUInt16LE(i + 26);
    const extraLen = buf.readUInt16LE(i + 28);
    const nom = buf.slice(i + 30, i + 30 + nomLen).toString('utf8');
    const debut = i + 30 + nomLen + extraLen;

    // Descripteur différé (bit 3) : les tailles sont à 0 dans l'en-tête local.
    // On retombe alors sur le répertoire central, plus fiable.
    if ((buf.readUInt16LE(i + 6) & 0x08) !== 0 && tailleComp === 0) {
      const central = trouverDansCentral(buf, nom);
      if (!central) continue;
      tailleComp = central.tailleComp;
      tailleBrute = central.tailleBrute;
    }
    if (tailleComp === 0 && tailleBrute === 0) continue;

    const donnees = buf.slice(debut, debut + tailleComp);
    try {
      entrees.set(nom, methode === 8 ? zlib.inflateRawSync(donnees) : donnees);
    } catch {
      // Entrée illisible : on l'ignore plutôt que de faire échouer toute
      // l'extraction pour une image corrompue.
    }
  }
  return entrees;
}

function trouverDansCentral(buf, nomCherche) {
  for (let i = buf.length - 4; i >= 0; i--) {
    if (buf.readUInt32LE(i) !== 0x02014b50) continue;
    const nomLen = buf.readUInt16LE(i + 28);
    const nom = buf.slice(i + 46, i + 46 + nomLen).toString('utf8');
    if (nom === nomCherche) {
      return { tailleComp: buf.readUInt32LE(i + 20), tailleBrute: buf.readUInt32LE(i + 24) };
    }
  }
  return null;
}

/**
 * Retire les sous-arbres de dessin d'un paragraphe. Leur contenu textuel n'est
 * pas du texte d'auteur mais des paramètres de placement — `<wp:align>center`
 * et `<wp:posOffset>635` — qui se collaient en tête de chaque légende sous la
 * forme « center635 Coupe sagittale du pharynx ».
 *
 * Les `r:embed` sont relevés AVANT l'appel : rien de la relation image ne se
 * perd ici, seul le bruit de mise en page disparaît.
 */
function retirerDessins(xmlParagraphe) {
  return xmlParagraphe
    .replace(/<w:drawing\b[\s\S]*?<\/w:drawing>/g, '')
    .replace(/<w:pict\b[\s\S]*?<\/w:pict>/g, '')
    .replace(/<mc:AlternateContent\b[\s\S]*?<\/mc:AlternateContent>/g, '');
}

const decoderEntites = (s) => s
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&amp;/g, '&');

/**
 * Les PDF d'origine ont été composés avec des ligatures typographiques, que
 * Word conserve comme caractères Unicode à part entière : « ﬁxation »,
 * « proﬁl », « diﬃcile ». Recopiées telles quelles dans une fiche, elles
 * cassent la recherche plein texte, la lecture d'écran et le rendu PDF.
 * On les décompose dès l'extraction.
 */
function normaliserLigatures(s) {
  return s
    .replace(/ﬀ/g, 'ff').replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl')
    .replace(/ﬃ/g, 'ffi').replace(/ﬄ/g, 'ffl')
    .replace(/ﬅ/g, 'st').replace(/ﬆ/g, 'st')
    .replace(/œ/g, 'œ').replace(/ /g, ' ');
}

/**
 * Accents décomposés par la conversion d'origine : la cédille ressort en
 * « c¸ » (« rec¸oivent »). 62 des 133 chapitres portent ce défaut.
 *
 * ATTENTION — réparation de SURFACE uniquement. Les chapitres qui portent ce
 * marqueur viennent d'une conversion à deux colonnes qui a AUSSI entrelacé
 * les colonnes et perdu des mots (« à à mm », « Elle est transitionnelle les
 * fractures »). Recomposer les cédilles ne les rend pas fiables : le compteur
 * « accentsRepares » du rapport sert à repérer les chapitres à ne pas
 * exploiter sans relecture humaine.
 */
function recomposerAccents(s) {
  return s.replace(/c¸/g, "ç").replace(/C¸/g, "Ç");
}

/**
 * Une légende Word suit ou précède immédiatement la figure et commence par
 * « Figure », « Fig. », « Tableau »… On ne retient QUE ces formes explicites :
 * prendre le paragraphe voisin au hasard fabriquerait des légendes fausses.
 */
const RE_LEGENDE = /^\s*(figure|fig\.?|tableau|tabl\.?|photo|schéma|encadré)\s*\d*\s*[.:—-]?\s*(.*)$/i;

function estLegende(texte) {
  return RE_LEGENDE.test(texte) && texte.trim().length > 4;
}

const RE_CHAPITRE = /^\s*chapitre\s+\d+\b/i;
const RE_TITRE_NUMEROTE = /^\s*((?:\d{1,2}\.){1,3}\d*|\d{1,2})[.):]?\s+(.+)$/;
// Le fonds ORL numérote ses titres avec un DEUX-POINTS — « I: Rappels »,
// « A: Anatomie du larynx », « 1: Loge parotidienne ». Sans ce cas, les
// 19 chapitres ressortaient avec `titres: 0` et toute la hiérarchie était perdue.
const RE_TITRE_ROMAIN = /^\s*([IVX]{1,6}|[A-H])[.):]\s+(.+)$/;

/**
 * Les DOCX Anesthésie-Réanimation n'emploient pas les styles Word Heading/Titre.
 * La hiérarchie est donc reconstruite uniquement quand la forme est assez
 * contraignante pour ne pas transformer une phrase médicale numérotée en titre.
 */
function classifierParagraphe(texte, styles, xmlParagraphe) {
  if (estLegende(texte)) return { type: 'legende', niveau: null };
  if (styles.length > 0) {
    const style = styles[0] || '';
    const niveau = Number(style.match(/(\d+)$/)?.[1] || 1);
    return { type: 'titre', niveau: Math.min(4, Math.max(1, niveau)) };
  }
  const court = texte.length <= 180 && (texte.match(/\S+/g) || []).length <= 22;
  if (court && RE_CHAPITRE.test(texte)) return { type: 'titre', niveau: 1 };
  const numerote = court ? texte.match(RE_TITRE_NUMEROTE) : null;
  const ressembleQuestion = /^(?:avez|êtes|est|existe|quel(?:le|les|s)?|comment|pourquoi|quand|où)\b/i.test(numerote?.[2] || '');
  if (numerote && !ressembleQuestion && !/[!?;:]\s*$/.test(numerote[2])) {
    const numeroNormalise = numerote[1].replace(/\.$/, '');
    const profondeur = (numeroNormalise.match(/\./g) || []).length + 2;
    return { type: 'titre', niveau: Math.min(4, profondeur) };
  }
  const romain = court ? texte.match(RE_TITRE_ROMAIN) : null;
  if (romain && !/[.!?;:]\s*$/.test(romain[2])) {
    return { type: 'titre', niveau: /^[IVX]/.test(romain[1]) ? 1 : 2 };
  }
  if (/<w:numPr\b/.test(xmlParagraphe)) return { type: 'liste', niveau: null };
  return { type: 'paragraphe', niveau: null };
}

/**
 * Word colle parfois DEUX légendes dans le même paragraphe
 * (« Figure 7. … Figure 8. … »). Attribuer les deux à une seule image
 * produirait une légende fausse : on ne garde que la première.
 */
function premiereLegende(texte) {
  const m = texte.match(/^(.*?)(?=\s(?:Figure|Fig\.|Tableau|Photo)\s*\d)/is);
  return (m ? m[1] : texte).trim();
}

/**
 * Un paragraphe réduit au NUMÉRO d'une figure : « FIG. 12.1 », « Tableau 11.3 ».
 * Le fonds ORL les place systématiquement deux paragraphes avant l'image. Ce
 * numéro est éditorial : il ne se publie jamais et ne fait pas une légende.
 */
const RE_NUMERO_SEUL = /^\s*(fig\.?|figure|tableau|tabl\.?|photo|encadré|schéma)\s*\d+(?:[.\-–]\d+)*\s*[.:]?\s*$/i;
const estNumeroDeFigure = (texte) => RE_NUMERO_SEUL.test(texte);

/**
 * Découpe le document en paragraphes, quel que soit le format de l'archive.
 *
 * POURQUOI. Le fonds ORL contient un fichier qui porte l'extension `.docx` mais
 * qui est en réalité un ODT (« Chapitre 16 » : `mimetype`, `content.xml`,
 * `Pictures/`, aucun `word/document.xml`). Les deux formats décrivent la même
 * chose — une suite de paragraphes dont certains ancrent une image — donc on
 * les ramène à une structure commune ici plutôt que de convertir le fichier :
 * une conversion déplacerait les ancrages et donc les légendes.
 *
 * Renvoie { format, paragraphes: [{ xml, medias: [chemin dans l'archive] }] },
 * dans l'ordre de lecture du document.
 */
function decouperDocument(zip) {
  const docXml = zip.get('word/document.xml');
  if (docXml) {
    // Relations rId → cible média.
    const rels = new Map();
    const relsXml = zip.get('word/_rels/document.xml.rels');
    if (relsXml) {
      for (const m of relsXml.toString('utf8').matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)) {
        rels.set(m[1], m[2].replace(/^\.\//, ''));
      }
    }
    const paragraphes = docXml.toString('utf8').split(/<w:p[ >]/).slice(1).map((brut) => ({
      xml: retirerDessins(brut),
      medias: [...brut.matchAll(/r:embed="([^"]+)"/g)]
        .map((m) => rels.get(m[1]))
        .filter(Boolean)
        .map((cible) => `word/${cible}`),
    }));
    return { format: 'ooxml', paragraphes };
  }

  const contentXml = zip.get('content.xml');
  if (!contentXml) {
    throw new Error('ni word/document.xml ni content.xml — archive non reconnue');
  }

  // Le cadre de dessin ODT porte le lien vers l'image et peut contenir des
  // paragraphes imbriqués. On l'aplatit en un jeton simple AVANT le découpage :
  // sinon un `<text:p>` interne couperait le paragraphe en deux et séparerait la
  // légende de son image.
  let xml = contentXml.toString('utf8').replace(
    /<draw:frame\b[\s\S]*?<\/draw:frame>/g,
    (cadre) => {
      const href = cadre.match(/xlink:href="([^"]+)"/)?.[1];
      return href ? `<odtmedia href="${href}"/>` : '';
    },
  );
  // Espaces explicites de l'ODT : sans eux, le retrait des balises collerait les
  // mots entre eux.
  xml = xml
    .replace(/<text:s\b[^>]*\/>/g, ' ')
    .replace(/<text:tab\b[^>]*\/>/g, ' ')
    .replace(/<text:line-break\b[^>]*\/>/g, ' ');

  // La balise ouvrante est consommée ENTIÈREMENT (attributs compris) : découper
  // sur le seul nom laisserait `text:style-name="Standard">` en tête de chaque
  // fragment, qui ressortait ensuite comme du texte d'auteur. Le garde `(?=[\s/>])`
  // évite d'attraper `<text:page-number>` et consorts.
  const paragraphes = xml.split(/<text:(?:p|h)(?=[\s/>])[^>]*>/).slice(1).map((frag) => ({
    xml: frag,
    medias: [...frag.matchAll(/<odtmedia href="([^"]+)"\/>/g)].map((m) => m[1]),
  }));
  return { format: 'odt', paragraphes };
}

function main() {
  const [fichier, outDir] = process.argv.slice(2);
  if (!fichier || !outDir) {
    console.error('usage: node scripts/docx-extract.mjs "<fichier.docx>" "<outDir>"');
    process.exit(1);
  }

  const zip = lireZip(fs.readFileSync(fichier));
  const { format, paragraphes } = decouperDocument(zip);

  fs.mkdirSync(path.join(outDir, 'img'), { recursive: true });

  const blocs = [];
  const images = [];
  let compteur = 0;
  let accentsRepares = 0;

  for (const { xml: p, medias } of paragraphes) {
    const brut = normaliserLigatures(decoderEntites(p.replace(/<[^>]+>/g, '')))
      .replace(/\s+/g, ' ').trim();
    accentsRepares += (brut.match(/[cC]¸/g) ?? []).length;
    const texte = recomposerAccents(brut);
    const styles = [...p.matchAll(/<w:pStyle[^>]*w:val="([^"]*(?:Heading|Titre)[^"]*)"/g)].map((m) => m[1]);

    // Le fonds ORL écrit la légende DANS le paragraphe qui ancre l'image, et
    // place deux paragraphes plus haut un paragraphe ne portant que le numéro
    // (« FIG. 12.1 »). C'est donc ce texte-ci qui est la légende — le numéro,
    // lui, ne se publie jamais.
    const legendeDuParagraphe = texte && !estNumeroDeFigure(texte)
      ? premiereLegende(texte)
      : null;
    let imagesEcrites = 0;

    for (const chemin of medias) {
      const donnees = zip.get(chemin);
      if (!donnees || donnees.length < 4096) continue; // écarte les puces et filets
      compteur += 1;
      imagesEcrites += 1;
      const ext = path.extname(chemin) || '.png';
      const nomFichier = `img_${String(compteur).padStart(3, '0')}${ext}`;
      fs.writeFileSync(path.join(outDir, 'img', nomFichier), donnees);
      images.push({
        index: compteur,
        fichier: `img/${nomFichier}`,
        octets: donnees.length,
        blocIndex: blocs.length,
        legende: legendeDuParagraphe,
      });
      blocs.push({ type: 'image', index: compteur });
    }

    if (!texte) continue;
    // Un paragraphe qui a ancré une image porte sa légende, pas de la prose :
    // le typer autrement la ferait figurer deux fois dans la fiche.
    const classification = imagesEcrites > 0
      ? { type: 'legende', niveau: null }
      : classifierParagraphe(texte, styles, p);
    blocs.push({
      id: `b${String(blocs.length + 1).padStart(5, '0')}`,
      type: classification.type,
      texte,
      style: styles[0] ?? null,
      niveau: classification.niveau,
    });
  }

  // Rattachement des légendes voisines : suivant d'abord, précédent ensuite.
  // Les deux placements sont employés dans le corpus ; aucune autre proximité
  // n'est acceptée afin de ne pas fabriquer une légende.
  const legendeUtilisable = (bloc) => bloc?.type === 'legende'
    && bloc.texte
    && !estNumeroDeFigure(bloc.texte);

  for (const img of images) {
    if (img.legende) continue;
    const suivant = blocs[img.blocIndex + 1];
    if (legendeUtilisable(suivant)) img.legende = premiereLegende(suivant.texte);
    if (img.legende) continue;
    const precedent = blocs[img.blocIndex - 1];
    if (legendeUtilisable(precedent)) img.legende = premiereLegende(precedent.texte);
  }

  const rapport = {
    source: path.basename(fichier),
    format,
    caracteres: blocs.filter((b) => b.texte).reduce((n, b) => n + b.texte.length, 0),
    blocs: blocs.length,
    titres: blocs.filter((b) => b.type === 'titre').length,
    listes: blocs.filter((b) => b.type === 'liste').length,
    images: images.length,
    imagesLegendees: images.filter((i) => i.legende).length,
    // > 0 signale une conversion défectueuse : ce chapitre a de fortes chances
    // de porter AUSSI des colonnes entrelacées et des mots manquants.
    accentsRepares,
  };

  fs.writeFileSync(
    path.join(outDir, 'extract.json'),
    JSON.stringify({ rapport, blocs, images }, null, 1),
    'utf8',
  );
  console.log(JSON.stringify(rapport, null, 1));
}

main();
