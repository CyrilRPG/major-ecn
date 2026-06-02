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

Génère le nombre de cartes nécessaire pour couvrir le cours de façon exhaustive :
- Minimum 50 cartes
- Maximum 200 cartes
- Cible : ~1 carte par notion essentielle de la fiche + ~1 carte par item piège
  identifié dans les annales du cours (justifications, distracteurs récurrents).
Aucune redondance.

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
- Pour chaque item, justification courte (1–2 phrases) qui explique pourquoi il est juste ou faux,
  avec les mots-clés essentiels (rang A/B, recommandation HAS si applicable)

Tu dois produire EXACTEMENT 8 séries de 5 QCM (40 questions au total) réparties ainsi :

  ▸ Séries 1 à 4 — Cours · 5 questions isolées de connaissance pure chacune
    labels : « QCM — Série 1 · <sous-thème> » à « QCM — Série 4 · <sous-thème> »
    (les 4 séries Cours doivent couvrir des sous-thèmes complémentaires
     du cours, sans chevauchement)
  ▸ Séries 5 à 8 — Dossiers progressifs (DP) · 5 questions enchaînées chacun
    labels : « DP 1 · <titre court du cas> » à « DP 4 · <titre court du cas> »
    (4 cas cliniques distincts, couvrant les situations cliniques classiques
     hypertombables du cours)

Spécification des dossiers progressifs :
- Chaque DP s'appuie sur une VIGNETTE CLINIQUE unique (8 à 15 lignes : patient,
  motif, antécédents, examen, premier bilan paraclinique).
- Cette vignette doit être REPRISE INTÉGRALEMENT en tête de chaque énoncé des
  5 questions du DP (l'élève la relit à chaque question).
- Les 5 questions doivent suivre le raisonnement clinique : diagnostic →
  examens complémentaires → diagnostic différentiel → thérapeutique → suivi
  ou complication.
- **Inspire-toi obligatoirement du style et du niveau des annales fournies
  dans le contexte ci-dessous** (longueur, niveau de pertinence des
  distracteurs, pièges).
- Niveau attendu : EVC réel, pas un exercice scolaire facile. Inclus des
  pièges classiques (item « toutes les réponses ci-dessus », faux amis
  pharmaco, contre-indications souvent oubliées).

Spécification des séries de Cours :
- Questions de connaissances isolées portant sur les points hypertombables
  identifiés dans la fiche.
- Pas de vignette clinique (juste un énoncé court et factuel).

Réponds UNIQUEMENT par un JSON valide de cette forme exacte :
{
  "series": [
    { "label": "QCM — Série 1 · ...", "kind": "cours", "questions": [ ...5 questions... ] },
    { "label": "QCM — Série 2 · ...", "kind": "cours", "questions": [ ...5 questions... ] },
    { "label": "QCM — Série 3 · ...", "kind": "cours", "questions": [ ...5 questions... ] },
    { "label": "QCM — Série 4 · ...", "kind": "cours", "questions": [ ...5 questions... ] },
    { "label": "DP 1 · ...", "kind": "dp", "vignette": "...vignette commune...", "questions": [ ...5 questions, énoncé spécifique uniquement (vignette gérée à part)... ] },
    { "label": "DP 2 · ...", "kind": "dp", "vignette": "...", "questions": [ ...5 questions... ] },
    { "label": "DP 3 · ...", "kind": "dp", "vignette": "...", "questions": [ ...5 questions... ] },
    { "label": "DP 4 · ...", "kind": "dp", "vignette": "...", "questions": [ ...5 questions... ] }
  ]
}
Chaque question = { "enonce": "...", "items": [5 items A-E avec is_correct et justification] }.
Pas de texte avant ou après le JSON, pas de fence markdown.`;

  const user = `Cours / sujet à couvrir (fiche + annales du cours pour inspiration de style) :

${courseContext}

Génère les 8 séries : 4 séries de Cours (20 questions isolées) + 4 DP (20 questions enchaînées sur 4 cas cliniques distincts).`;
  return { system, user };
}
