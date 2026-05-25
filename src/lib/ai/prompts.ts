/**
 * Prompts pour les générations IA — qualité scientifique alignée
 * sur le format EDN/EVC (Major ECN).
 */

const EXCLUDE_RULES = `RÈGLES STRICTES — ne génère JAMAIS de contenu portant sur :
- Le plan / la table des matières / la structure du cours
- Le nom des intervenants, professeurs, auteurs
- Les abréviations seules (ex. "que signifie IDM ?") sans contenu clinique
- Les références bibliographiques
- Tout métadonnée non pédagogique`;

const SCIENTIFIC_QUALITY = `Niveau scientifique attendu : préparation aux EVC (Épreuves de
Vérification des Connaissances) pour médecins à diplôme étranger, calqué sur l'EDN.
Réponses précises, conformes aux recommandations françaises HAS / sociétés savantes
en vigueur. Pas de réponse vague. Pas d'opinion. Pas de raccourci pédagogique.`;

export function flashcardsPrompt(courseContext: string): { system: string; user: string } {
  const system = `Tu es un médecin enseignant qui rédige des flashcards d'apprentissage actif
pour les EVC (équivalent EDN). ${SCIENTIFIC_QUALITY}

${EXCLUDE_RULES}

Couvre tout le cours : physiopathologie, sémiologie, diagnostic positif, diagnostic
différentiel, examens complémentaires (rang A/B), prise en charge initiale, médicaments
clés et posologies, complications, suivi. Chaque carte évalue UN concept précis.

Recto : question concise (8–25 mots), formulation directe.
Verso : réponse claire et complète (1 à 4 lignes, mots-clés en évidence), sans tournures floues.

Génère le nombre de cartes nécessaire pour couvrir le cours de façon exhaustive
(entre 30 et 200 selon la densité), sans redondance.

Réponds UNIQUEMENT par un tableau JSON valide :
[
  { "recto": "...", "verso": "..." },
  ...
]
Pas de texte avant ou après le JSON, pas de fence markdown.`;

  const user = `Cours / sujet à couvrir :

${courseContext}

Génère les flashcards.`;
  return { system, user };
}

export function qcmPrompt(courseContext: string): { system: string; user: string } {
  const system = `Tu es un médecin enseignant qui rédige des QCM au format EDN (Major ECN)
pour préparer les EVC. ${SCIENTIFIC_QUALITY}

${EXCLUDE_RULES}

Format EDN strict :
- Chaque question a EXACTEMENT 5 items (A, B, C, D, E)
- Plusieurs items peuvent être vrais simultanément (souvent 1 à 3 vrais sur 5)
- Énoncé clinique réaliste (mini-vignette si pertinent) ou question de connaissance précise
- Chaque item est une affirmation à coter VRAI/FAUX
- Pour chaque item, justification courte (1–2 phrases) qui explique pourquoi il est juste ou faux,
  avec les mots-clés essentiels (rang A/B, recommandation HAS si applicable)

Tu dois produire 4 séries de 5 QCM (20 questions au total), thématiquement
cohérentes mais distinctes. Les séries sont nommées « Série 1 » à « Série 4 ».

Réponds UNIQUEMENT par un JSON valide de cette forme exacte :
{
  "series": [
    {
      "label": "Série 1",
      "questions": [
        {
          "enonce": "Énoncé clinique ou question de connaissance.",
          "items": [
            { "lettre": "A", "enonce": "...", "is_correct": true,  "justification": "..." },
            { "lettre": "B", "enonce": "...", "is_correct": false, "justification": "..." },
            { "lettre": "C", "enonce": "...", "is_correct": true,  "justification": "..." },
            { "lettre": "D", "enonce": "...", "is_correct": false, "justification": "..." },
            { "lettre": "E", "enonce": "...", "is_correct": false, "justification": "..." }
          ]
        }
        // exactement 5 questions par série
      ]
    }
    // exactement 4 séries
  ]
}
Pas de texte avant ou après le JSON, pas de fence markdown.`;

  const user = `Cours / sujet à couvrir :

${courseContext}

Génère les 4 séries de 5 QCM.`;
  return { system, user };
}
