/**
 * Retire des annales les commentaires d'édition destinés au dépôt.
 *
 * Une annale doit se lire comme un sujet d'examen : une vignette, des
 * questions, des réponses. Tout ce qui parle du document source — « le
 * diaporama ne reproduit pas l'énoncé », « le conférencier ajoute », « ce
 * corrigé ne développe pas cette question » — est une note interne, et n'a
 * rien à faire sous les yeux d'un étudiant.
 *
 * Ce script applique des remplacements exacts, décrits dans un fichier de
 * correctifs, et refuse de travailler si le texte cherché est introuvable ou
 * ambigu : aucune réécriture n'est laissée à une expression régulière.
 *
 * Usage :
 *   node scripts/annales/nettoyer-editorial.mjs --data <fichier.json> --patch <correctifs.json>
 *
 * Chaque correctif vaut pour un champ publié d'une série :
 *   { "serie": "<label>", "champ": "vignette", "cherche": "…", "remplace": "…" }
 *   { "serie": "<label>", "champ": "enonce", "index": 3, "cherche": "…", "remplace": "…" }
 *
 * Une question dont ni l'énoncé ni la réponse n'ont survécu au document source
 * ne peut pas être réécrite : elle se retire, plutôt que de laisser une coquille.
 *   { "serie": "<label>", "supprimer": 15 }
 */
import { readFileSync, writeFileSync } from 'node:fs';

const arg = (nom) => (process.argv.includes(nom) ? process.argv[process.argv.indexOf(nom) + 1] : null);
const dataPath = arg('--data');
const patchPath = arg('--patch');
if (!dataPath || !patchPath) throw new Error('Usage : --data <fichier.json> --patch <correctifs.json>');

const data = JSON.parse(readFileSync(dataPath, 'utf8'));
const correctifs = JSON.parse(readFileSync(patchPath, 'utf8'));

const cible = (serie, champ, index) =>
  champ === 'vignette' ? serie : serie.questions[index];

let appliques = 0;
// Les suppressions décalent les index : on les applique après les remplacements.
const suppressions = [];
for (const { serie: label, champ, index, cherche, remplace, supprimer } of correctifs) {
  const serie = data.series.find((s) => s.label === label);
  if (!serie) throw new Error(`série introuvable : « ${label} »`);
  if (supprimer !== undefined) {
    if (!serie.questions[supprimer]) throw new Error(`${label} : question ${supprimer} introuvable`);
    suppressions.push([serie, supprimer]);
    appliques += 1;
    continue;
  }
  const porteur = cible(serie, champ, index);
  if (!porteur) throw new Error(`${label} : question ${index} introuvable`);
  const avant = porteur[champ];
  if (typeof avant !== 'string') throw new Error(`${label} [${champ} ${index}] : champ absent`);
  const occurrences = avant.split(cherche).length - 1;
  if (occurrences === 0) throw new Error(`${label} [${champ} ${index}] : texte introuvable — « ${cherche.slice(0, 70)}… »`);
  if (occurrences > 1) throw new Error(`${label} [${champ} ${index}] : texte ambigu (${occurrences} occurrences)`);
  porteur[champ] = avant.replace(cherche, remplace).replace(/[ \t]+\n/g, '\n').trim();
  appliques += 1;
}

for (const [serie, index] of suppressions.sort((a, b) => b[1] - a[1])) serie.questions.splice(index, 1);

// Garde-fou : un correctif ne doit jamais réintroduire de balise d'italique
// isolée ni laisser un champ vide.
for (const serie of data.series) {
  const champs = [['vignette', serie.vignette], ...serie.questions.flatMap((q, i) => [[`enonce ${i}`, q.enonce], [`reponseAttendue ${i}`, q.reponseAttendue]])];
  for (const [nom, valeur] of champs) {
    if (typeof valeur !== 'string') continue;
    if (!valeur.trim()) throw new Error(`${serie.label} [${nom}] : champ vide après nettoyage`);
    const ouvrantes = (valeur.match(/<i>/g) ?? []).length;
    if (ouvrantes !== (valeur.match(/<\/i>/g) ?? []).length) throw new Error(`${serie.label} [${nom}] : italiques déséquilibrées`);
  }
}

writeFileSync(dataPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`✔ ${dataPath} : ${appliques} correctif(s) appliqué(s)`);
