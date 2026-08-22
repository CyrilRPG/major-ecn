/**
 * Chargement d'un jeu de données d'annales.
 *
 * Deux formes acceptées, pour que la production puisse avancer série par série
 * sans réécrire un fichier de plusieurs mégaoctets à chaque ajout :
 *
 *  - un FICHIER `data/<college>.json` complet ;
 *  - un DOSSIER `data/<college>/` contenant `_meta.json` (collegeId, nom,
 *    coursTitre, sources) et un fichier par série, fusionnés par ordre
 *    alphabétique de nom de fichier.
 *
 * Les deux formes produisent exactement la même structure en mémoire.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

export function charger(chemin) {
  if (!existsSync(chemin)) throw new Error('Jeu de données introuvable : ' + chemin);
  if (statSync(chemin).isFile()) return JSON.parse(readFileSync(chemin, 'utf8'));

  const meta = join(chemin, '_meta.json');
  if (!existsSync(meta)) throw new Error('_meta.json manquant dans ' + chemin);
  const data = JSON.parse(readFileSync(meta, 'utf8'));
  data.sources = data.sources ?? {};
  data.series = [];
  for (const nom of readdirSync(chemin).sort()) {
    if (nom === '_meta.json' || !nom.endsWith('.json')) continue;
    const bloc = JSON.parse(readFileSync(join(chemin, nom), 'utf8'));
    // Un fichier = une série, ou une liste de séries issues du même corrigé.
    const series = Array.isArray(bloc.series) ? bloc.series : [bloc];
    if (bloc.sources) Object.assign(data.sources, bloc.sources);
    data.series.push(...series);
  }
  return data;
}
