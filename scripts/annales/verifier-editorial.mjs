import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Garde-fou : une annale doit se lire comme un sujet d'examen.
 *
 * Aucun champ publié — vignette, énoncé, réponse attendue, correction — ne doit
 * parler du document dont il est tiré (« le diaporama ne reproduit pas
 * l'énoncé », « le conférencier rappelle que… », « intitulé non reproduit par le
 * corrigé »). Ces notes appartiennent au dépôt, pas à l'étudiant : elles se
 * rangent dans les champs `note` et `sources[].remarque`, qui ne sont jamais
 * publiés. À lancer depuis scripts/annales/ après tout nouvel import.
 *
 *   node scripts/annales/verifier-editorial.mjs
 */

// Contrôle final : aucun champ publié ne doit désigner le document source.
// « corrigé » est aussi un participe médical (QT corrigé, natrémie corrigée) :
// seuls ses emplois nominaux sont retenus.
const META = [
  /conférenci/i, /diaporama/i, /diapositive/i, /\b[LlDdCc]e corrigé\b/, /\bdu corrigé\b/,
  /en séance/i, /projeté[es]? en réponse/i, /retranscrit/i, /réponse inventée/i,
  /sujet officiel/i, /Intitulé (officiel )?non (reproduit|disponible)/i,
  /n’est pas (corrigée|reproduit)/i, /ne (reproduit|développe|traite) pas cette question/i,
  /support de correction/i, /dans le dépôt/i,
];
const CHAMPS = ['enonce', 'reponseAttendue', 'correctionGenerale'];

const fichiers = [];
for (const d of readdirSync('data')) {
  const dir = join('data', d);
  if (!statSync(dir).isDirectory()) continue;
  // _meta.json ne porte que le rattachement au collège, pas de contenu publié.
  for (const f of readdirSync(dir)) if (f.endsWith('.json') && f !== '_meta.json') fichiers.push(join(dir, f));
}

let hits = 0;
let series = 0;
let questions = 0;
for (const f of fichiers) {
  const data = JSON.parse(readFileSync(f, 'utf8'));
  // Un fichier porte soit une liste de séries, soit une série seule.
  for (const serie of Array.isArray(data.series) ? data.series : [data]) {
    series += 1;
    const voir = (ou, v) => {
      if (typeof v !== 'string') return;
      const regle = META.find((r) => r.test(v));
      if (!regle) return;
      hits += 1;
      console.log(`${f} :: ${serie.label} [${ou}] ${regle}\n   ${v.replace(/\s+/g, ' ').slice(0, 170)}\n`);
    };
    voir('vignette', serie.vignette);
    (serie.questions ?? []).forEach((q, i) => {
      questions += 1;
      for (const c of CHAMPS) voir(`${c} ${i}`, q[c]);
      (q.items ?? []).forEach((it, j) => voir(`justification ${i}.${j}`, it.justification));
    });
  }
}
console.log(`${fichiers.length} fichiers · ${series} séries · ${questions} questions`);
console.log(hits ? `❌ ${hits} champ(s) restant(s)` : '✅ aucun commentaire d’édition dans les champs publiés');
