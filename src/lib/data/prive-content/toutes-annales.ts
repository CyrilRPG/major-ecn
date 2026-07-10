import type { PriveCourseContent } from '../prive-courses';
import alexis from './alexis';
import autresAnnales from './autres-annales';
import nouvellesAnnales from './nouvelles-annales';

// « Toutes les annales » : fusion des trois banques (Alexis = physio/sémio/andro
// + Autres annales = histo/anat/pharmaco/méd. nucléaire + Nouvelles annales =
// anatomie/embryologie/sémiologie DP), toutes matières mélangées.
// Les <img> des schémas sont déjà intégrés dans les énoncés des sources.

// Mélange déterministe (graine fixe) : ordre stable entre les rendus (pas de
// décalage d'hydratation) mais matières bien mélangées.
function seededShuffle<T>(input: T[], seed: number): T[] {
  const a = [...input];
  let s = seed >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const merged = [...alexis.annales, ...autresAnnales.annales, ...nouvellesAnnales.annales];
const annales = seededShuffle(merged, 20260710);

const content: PriveCourseContent = {
  fiche: {
    parties: [
      {
        numero: 'I',
        titre: 'Toutes les annales UE5 — mélangées',
        sous_parties: [
          {
            titre: 'Comment utiliser ce cours',
            rows: [
              {
                concept: '◆ Onglet QCM',
                detail_md:
                  'Toutes les annales sont dans l’onglet **QCM** ci-dessus.\n· ' +
                  annales.length +
                  ' QCM d’annales UE5 **toutes matières mélangées** : physiologie, sémiologie, andrologie, histologie, anatomie, pharmacologie et médecine nucléaire.\n· C’est la fusion des cours **Alexis** et **Autres annales** (mêmes questions, ordre mélangé pour réviser en conditions d’examen).\n· Chaque question rappelle sa matière, son cours et son année ; les schémas sont intégrés.',
                kind: 'a_retenir',
              },
              {
                concept: 'Correction',
                detail_md:
                  'Après validation : le **corrigé** (bleu) puis un **rappel de cours** débutant (vert).\n· Pour les examens complets, la bonne réponse correspond à ce qui était marqué **« Valide »** dans le corrigé officiel.',
                kind: 'normal',
              },
            ],
          },
        ],
      },
    ],
    points_cles: [
      'Fusion des deux banques : Alexis (physio / sémio / andrologie) + Autres annales (histo / anat / pharmaco / médecine nucléaire).',
      'Toutes matières mélangées, pour s’entraîner comme le jour de l’examen (UE5).',
      'Total : ' + annales.length + ' QCM d’annales corrigées, schémas inclus.',
    ],
  },
  flashcards: [],
  annales,
};

export default content;
