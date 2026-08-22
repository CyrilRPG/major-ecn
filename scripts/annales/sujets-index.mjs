/**
 * Index des SUJETS officiels présents dans `Annales/Sujets/`.
 *
 * Sert de contrôle : un corrigé n'est réputé porter une vraie annale que si le
 * couple (type, année) qu'il annonce existe — de préférence attesté par le
 * sujet officiel du code spécialité correspondant. Les années 2020→2025 ne sont
 * pas couvertes par le dépôt : elles sont acceptées mais signalées.
 *
 * Structure renvoyée : { 'EVCF': { 2009: Set('02','03',…), … }, 'EVCP': { … },
 *                        compilations: [{ type, annee, fichier, codes: null }] }
 * `codes: null` = PDF compilé regroupant toutes les spécialités.
 */
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export const RACINE_SUJETS = 'Annales/Sujets';

/** Dossiers de sujets `.DOC` → (type, année). */
const DOSSIERS = [
  ['evcf_2009', 'EVCF', 2009],
  ['evcf_2011', 'EVCF', 2011],
  ['evcf_2012', 'EVCF', 2012],
  ['evcf_2015', 'EVCF', 2015],
  ['EVC2016_EVCF', 'EVCF', 2016],
  ['EVCF_2017', 'EVCF', 2017],
  ['EVCF 2019', 'EVCF', 2019],
  ['evcp_2-29_0', 'EVCP', 2010],
  ['evcp_30-90', 'EVCP', 2010],
  ['evcp_2011', 'EVCP', 2011],
  ['evcp_2013', 'EVCP', 2013],
  ['sujets_evc_pratiques_2015_0', 'EVCP', 2015],
  ['EVCP__2017 - 02 à 29', 'EVCP', 2017],
  ['EVCP__2017 - 30 à 76', 'EVCP', 2017],
];

/** PDF compilés : toutes spécialités dans un seul fichier. */
const COMPILATIONS = [
  ['evcf_2010_0.pdf', 'EVCF', 2010],
  ['evcp_2010_02-29.pdf', 'EVCP', 2010],
  ['evcp_2010_30-90.pdf', 'EVCP', 2010],
  ['2016_EVCP.pdf', 'EVCP', 2016],
  ['2018_EVCP.pdf', 'EVCP', 2018],
  ['2019_EVCP.pdf', 'EVCP', 2019],
  ['2020_EVCF pt1.pdf', 'EVCF', 2020],
];

/** Descend jusqu'aux fichiers `EVCx.NN.DOC`, quel que soit l'emboîtement. */
function codesDansDossier(dir) {
  const codes = new Set();
  const pile = [dir];
  while (pile.length) {
    const d = pile.pop();
    if (!existsSync(d)) continue;
    for (const nom of readdirSync(d)) {
      const p = join(d, nom);
      if (statSync(p).isDirectory()) { pile.push(p); continue; }
      const m = nom.match(/^evc[fp]\.(\d{2})\.(doc|pdf)$/i);
      if (m) codes.add(m[1]);
    }
  }
  return codes;
}

export function indexSujets(racine = RACINE_SUJETS) {
  const index = { EVCF: {}, EVCP: {}, compilations: [] };
  for (const [dossier, type, annee] of DOSSIERS) {
    const codes = codesDansDossier(join(racine, dossier));
    if (!codes.size) continue;
    index[type][annee] = new Set([...(index[type][annee] ?? []), ...codes]);
  }
  for (const [fichier, type, annee] of COMPILATIONS) {
    if (!existsSync(join(racine, fichier))) continue;
    index.compilations.push({ type, annee, fichier });
  }
  return index;
}

/**
 * Le sujet officiel de ce (type, année, code spécialité) est-il dans le dépôt ?
 * Renvoie 'doc' | 'compilation' | null.
 */
export function sujetDisponible(index, type, annee, codes) {
  const parAnnee = index[type]?.[annee];
  if (parAnnee && codes.some((c) => parAnnee.has(c))) return 'doc';
  if (index.compilations.some((c) => c.type === type && c.annee === annee)) return 'compilation';
  return null;
}
