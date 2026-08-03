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

/**
 * Word colle parfois DEUX légendes dans le même paragraphe
 * (« Figure 7. … Figure 8. … »). Attribuer les deux à une seule image
 * produirait une légende fausse : on ne garde que la première.
 */
function premiereLegende(texte) {
  const m = texte.match(/^(.*?)(?=\s(?:Figure|Fig\.|Tableau|Photo)\s*\d)/is);
  return (m ? m[1] : texte).trim();
}

function main() {
  const [fichier, outDir] = process.argv.slice(2);
  if (!fichier || !outDir) {
    console.error('usage: node scripts/docx-extract.mjs "<fichier.docx>" "<outDir>"');
    process.exit(1);
  }

  const zip = lireZip(fs.readFileSync(fichier));
  const docXml = zip.get('word/document.xml');
  if (!docXml) throw new Error('word/document.xml introuvable — fichier .docx invalide');

  // Relations rId → cible média.
  const rels = new Map();
  const relsXml = zip.get('word/_rels/document.xml.rels');
  if (relsXml) {
    for (const m of relsXml.toString('utf8').matchAll(/Id="([^"]+)"[^>]*Target="([^"]+)"/g)) {
      rels.set(m[1], m[2].replace(/^\.\//, ''));
    }
  }

  fs.mkdirSync(path.join(outDir, 'img'), { recursive: true });

  const xml = docXml.toString('utf8');
  // Découpe en paragraphes : c'est l'unité qui porte à la fois le texte et les
  // ancrages d'image, donc l'ordre de lecture réel du document.
  const paragraphes = xml.split(/<w:p[ >]/).slice(1);

  const blocs = [];
  const images = [];
  let compteur = 0;
  let accentsRepares = 0;

  for (const p of paragraphes) {
    const brut = normaliserLigatures(decoderEntites(p.replace(/<[^>]+>/g, '')))
      .replace(/\s+/g, ' ').trim();
    accentsRepares += (brut.match(/[cC]¸/g) ?? []).length;
    const texte = recomposerAccents(brut);
    const styles = [...p.matchAll(/w:val="([^"]*(?:Heading|Titre)[^"]*)"/g)].map((m) => m[1]);
    const embeds = [...p.matchAll(/r:embed="([^"]+)"/g)].map((m) => m[1]);

    for (const rid of embeds) {
      const cible = rels.get(rid);
      if (!cible) continue;
      const donnees = zip.get(`word/${cible}`);
      if (!donnees || donnees.length < 4096) continue; // écarte les puces et filets
      compteur += 1;
      const ext = path.extname(cible) || '.png';
      const nomFichier = `img_${String(compteur).padStart(3, '0')}${ext}`;
      fs.writeFileSync(path.join(outDir, 'img', nomFichier), donnees);
      const img = {
        index: compteur,
        fichier: `img/${nomFichier}`,
        octets: donnees.length,
        blocIndex: blocs.length,
        // Une légende présente dans le MÊME paragraphe que l'ancrage.
        legende: estLegende(texte) ? premiereLegende(texte) : null,
      };
      images.push(img);
      blocs.push({ type: 'image', index: compteur });
    }

    if (!texte) continue;
    blocs.push({
      type: styles.length > 0 ? 'titre' : estLegende(texte) ? 'legende' : 'paragraphe',
      texte,
      style: styles[0] ?? null,
    });
  }

  // Rattachement des légendes voisines : le paragraphe qui SUIT immédiatement
  // une image, s'il est de forme « Figure N — … », la légende. C'est la
  // convention Word ; on ne remonte pas plus loin pour ne rien inventer.
  for (const img of images) {
    if (img.legende) continue;
    const suivant = blocs[img.blocIndex + 1];
    if (suivant?.type === 'legende') img.legende = premiereLegende(suivant.texte);
  }

  const rapport = {
    source: path.basename(fichier),
    caracteres: blocs.filter((b) => b.texte).reduce((n, b) => n + b.texte.length, 0),
    blocs: blocs.length,
    titres: blocs.filter((b) => b.type === 'titre').length,
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
