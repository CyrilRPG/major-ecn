/**
 * Extraction d'une SECTION de spécialité dans un sujet officiel « compilé ».
 *
 * `Annales/Sujets/2018_EVCP.pdf`, `2019_EVCP.pdf`, `2016_EVCP.pdf`,
 * `2020_EVCF pt1.pdf`, `evcf_2010_0.pdf`, `evcp_2010_*.pdf` regroupent TOUTES
 * les spécialités d'une même session dans un seul PDF, chacune introduite par
 * son intitulé en capitales (« MEDECINE D’URGENCE », « PSYCHIATRIE »…).
 *
 * Ces fichiers portent une couche texte : ils permettent de restituer les
 * ÉNONCÉS officiels que les corrigés Major ECN ne reprennent pas toujours —
 * beaucoup se contentent de numéroter leurs réponses. Sans eux, l'élève lirait
 * une correction sans savoir à quelle question elle répond.
 *
 * Usage : node scripts/annales/sujet-compile.mjs --fichier 2018_EVCP.pdf --section "MEDECINE D’URGENCE"
 *         node scripts/annales/sujet-compile.mjs --fichier 2018_EVCP.pdf --lister
 */
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { texte } from './pdf.mjs';
import { RACINE_SUJETS } from './sujets-index.mjs';

/** Une ligne « intitulé de spécialité » : capitales seules, au moins 6 signes. */
const EST_TITRE = /^\s*[A-ZÉÈÀÂÎÔÛÇ][A-ZÉÈÀÂÎÔÛÇ'’ ,.\-]{5,}\s*$/;

/** Titres qui ne sont pas des spécialités mais des consignes de l'épreuve. */
const CONSIGNES = /^(TOUS LES SUJETS|L[’']ENSEMBLE DES SUJETS|VOUS DEVEZ|EPREUVE|ÉPREUVE|SUJET|VENTILATION|PERFUSION|ANGIOGRAPHIE|DÉSIGNATION|HEMOGLOBINE|LEUCOCYTES|MONOCYTES|PLAQUETTE|EVOLUTION)/;

/** Normalise pour comparer « MEDECINE D’URGENCE » et « medecine d'urgence ». */
const cle = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/['’]/g, ' ').replace(/[^A-Za-z]+/g, ' ').trim().toUpperCase();

/** Lignes du PDF + position des intitulés de spécialité. */
function decouper(fichier) {
  const lignes = texte(join(RACINE_SUJETS, fichier)).split(/\r?\n/);
  const titres = [];
  lignes.forEach((l, i) => {
    if (EST_TITRE.test(l) && !CONSIGNES.test(l.trim())) titres.push({ i, titre: l.trim() });
  });
  return { lignes, titres };
}

/** Intitulés de spécialité présents dans la compilation, dans l'ordre. */
export function sections(fichier) {
  return decouper(fichier).titres.map((t) => t.titre);
}

/**
 * Texte de la section `titre`, de son intitulé jusqu'au suivant.
 * La comparaison est insensible aux accents et aux apostrophes typographiques.
 */
export function section(fichier, titre) {
  const { lignes, titres } = decouper(fichier);
  const k = cle(titre);
  const n = titres.findIndex((t) => cle(t.titre) === k);
  if (n < 0) throw new Error('Section introuvable : ' + titre + ' dans ' + fichier);
  const debut = titres[n].i;
  const fin = n + 1 < titres.length ? titres[n + 1].i : lignes.length;
  return lignes.slice(debut, fin).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

async function principal() {
  const arg = (n) => process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : null;
  const fichier = arg('--fichier');
  if (!fichier) throw new Error('Usage : --fichier <nom.pdf> [--lister | --section "<INTITULÉ>"]');
  if (process.argv.includes('--lister')) { console.log(sections(fichier).join('\n')); return; }
  console.log(section(fichier, arg('--section')));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await principal();
