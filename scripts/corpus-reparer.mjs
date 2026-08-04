#!/usr/bin/env node
/**
 * Réparation du corpus Orthopédie extrait par docx-extract.mjs.
 *
 * CONTEXTE. Les .docx viennent d'une conversion de PDF à deux colonnes qui, sur
 * 61 des 133 chapitres, a produit trois familles de dégâts :
 *   A. cédilles décomposées (« rec¸oivent ») — déjà traité à l'extraction ;
 *   B. mots scindés en deux jetons (« posi tion », « filetage » → « file tage ») ;
 *   C. fragments d'une colonne insérés au milieu d'une phrase de l'autre, et
 *      valeurs chiffrées purement disparues (« entre __ et __ mm »).
 *
 * CE QUE CE SCRIPT FAIT — et ne fait pas.
 *
 * Il répare B, et UNIQUEMENT quand la preuve est dans le corpus lui-même : on
 * ne recolle « A B » en « AB » que si « AB » est un mot attesté ailleurs dans
 * les 6,3 millions de caractères, et que « A » comme « B » ne sont pas des mots
 * français courants pris isolément. Une jointure qui ne satisfait pas ces trois
 * conditions n'est pas faite.
 *
 * Il ne touche PAS à C. Réordonner des phrases entrelacées ou combler une
 * valeur manquante demanderait de deviner — et sur un support médical, une
 * phrase plausible mais fausse est pire qu'une phrase visiblement cassée, car
 * plus rien ne signale l'erreur au relecteur. Ces paragraphes sont donc mis en
 * QUARANTAINE : listés, exclus de la génération de questions, laissés tels
 * quels dans le texte.
 *
 *   node scripts/corpus-reparer.mjs <corpusDir>
 */
import fs from 'node:fs';
import path from 'node:path';

/** Mots outils français : leur présence isolée ne prouve rien. */
const OUTILS = new Set([
  'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une', 'et', 'ou', 'en', 'au', 'aux',
  'ce', 'se', 'sa', 'son', 'ses', 'par', 'sur', 'pour', 'dans', 'est', 'sont', 'que',
  'qui', 'ne', 'pas', 'plus', 'avec', 'sans', 'a', 'à', 'il', 'elle', 'on', 'nous',
  'ces', 'cet', 'cette', 'leur', 'leurs', 'lui', 'y', 'si', 'mais', 'donc', 'or',
]);

/** Paragraphe porteur d'une perte non réparable → quarantaine. */
const RE_VALEUR_PERDUE = /\b(?:à|de|entre|sur|jusqu'à)\s+(?:à|de|et)?\s*(?:mm|cm|degrés|°|%|ans|mois|jours|semaines)\b/;
const RE_DOUBLON = /\b(\w{1,4}) \1\b/i;

function lireChapitres(dir) {
  return JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8')).filter((c) => !c.erreur);
}

/** Vocabulaire du corpus entier : c'est lui qui sert de preuve. */
function construireVocabulaire(dir, chapitres) {
  const freq = new Map();
  for (const c of chapitres) {
    const d = JSON.parse(fs.readFileSync(path.join(dir, c.slug, 'extract.json'), 'utf8'));
    for (const b of d.blocs) {
      if (!b.texte) continue;
      for (const m of b.texte.toLowerCase().match(/[a-zà-ÿ]{2,}/g) ?? []) {
        freq.set(m, (freq.get(m) ?? 0) + 1);
      }
    }
  }
  return freq;
}

/**
 * Recolle « A B » en « AB » lorsque le corpus l'atteste.
 * Trois garde-fous cumulatifs, tous nécessaires :
 *   1. « AB » apparaît au moins SEUIL_ATTESTE fois ailleurs ;
 *   2. « A » et « B » sont rares isolément (≤ SEUIL_RARE) ;
 *   3. ni « A » ni « B » n'est un mot outil.
 * Sans le point 3, « la » + « tence » deviendrait « latence » au milieu d'une
 * phrase parfaitement correcte.
 */
const SEUIL_ATTESTE = 8;
const SEUIL_RARE = 2;

function reparerJointures(texte, freq, journal) {
  const jetons = texte.split(/(\s+)/);
  const sortie = [];
  for (let i = 0; i < jetons.length; i++) {
    const a = jetons[i];
    const sep = jetons[i + 1];
    const b = jetons[i + 2];
    if (!/^[a-zà-ÿ]{2,}$/i.test(a) || sep !== ' ' || !/^[a-zà-ÿ]{2,}[.,;:)]?$/i.test(b ?? '')) {
      sortie.push(a);
      continue;
    }
    const bNu = b.replace(/[.,;:)]$/, '');
    const ponct = b.slice(bNu.length);
    const A = a.toLowerCase();
    const B = bNu.toLowerCase();
    if (OUTILS.has(A) || OUTILS.has(B)) { sortie.push(a); continue; }
    const fusion = A + B;
    if ((freq.get(fusion) ?? 0) >= SEUIL_ATTESTE
        && (freq.get(A) ?? 0) <= SEUIL_RARE
        && (freq.get(B) ?? 0) <= SEUIL_RARE) {
      journal.push({ avant: `${a} ${bNu}`, apres: a + bNu, attestations: freq.get(fusion) });
      sortie.push(a + bNu + ponct);
      i += 2; // on a consommé le séparateur et le second jeton
      continue;
    }
    sortie.push(a);
  }
  return sortie.join('');
}

function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error('usage: node scripts/corpus-reparer.mjs <corpusDir>');
    process.exit(1);
  }

  const chapitres = lireChapitres(dir);
  const freq = construireVocabulaire(dir, chapitres);
  console.log(`vocabulaire du corpus : ${freq.size.toLocaleString('fr-FR')} formes\n`);

  let totalJointures = 0;
  let totalQuarantaine = 0;
  let totalParagraphes = 0;
  const journalGlobal = [];
  const quarantaineGlobale = [];

  for (const c of chapitres) {
    const p = path.join(dir, c.slug, 'extract.json');
    const d = JSON.parse(fs.readFileSync(p, 'utf8'));
    const journal = [];
    let quarantaine = 0;

    for (const b of d.blocs) {
      if (!b.texte) continue;
      totalParagraphes += 1;
      b.texte = reparerJointures(b.texte, freq, journal);
      // Marquage APRÈS réparation : une jointure recollée ne doit pas laisser
      // le paragraphe en quarantaine si c'était son seul défaut.
      const perdu = RE_VALEUR_PERDUE.test(b.texte);
      const doublon = RE_DOUBLON.test(b.texte);
      if (perdu || doublon) {
        b.quarantaine = perdu ? 'valeur_chiffree_perdue' : 'texte_duplique';
        quarantaine += 1;
        if (quarantaineGlobale.length < 400) {
          quarantaineGlobale.push({ slug: c.slug, motif: b.quarantaine, extrait: b.texte.slice(0, 160) });
        }
      }
    }

    d.rapport.jointuresReparees = journal.length;
    d.rapport.paragraphesQuarantaine = quarantaine;
    fs.writeFileSync(p, JSON.stringify(d, null, 1));

    totalJointures += journal.length;
    totalQuarantaine += quarantaine;
    journalGlobal.push(...journal.map((j) => ({ slug: c.slug, ...j })));
  }

  fs.writeFileSync(path.join(dir, 'reparations.json'), JSON.stringify(journalGlobal, null, 1));
  fs.writeFileSync(path.join(dir, 'quarantaine.json'), JSON.stringify(quarantaineGlobale, null, 1));

  console.log(`paragraphes traités        : ${totalParagraphes.toLocaleString('fr-FR')}`);
  console.log(`jointures réparées         : ${totalJointures.toLocaleString('fr-FR')}`);
  console.log(`paragraphes en quarantaine : ${totalQuarantaine.toLocaleString('fr-FR')}`);
  console.log(`\njournal complet  : ${path.join(dir, 'reparations.json')}`);
  console.log(`quarantaine      : ${path.join(dir, 'quarantaine.json')}`);
}

main();
