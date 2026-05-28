# Standards de génération de contenu — Major ECN

> **Règle d'or** : zéro hallucination médicale. Toute génération s'appuie
> exclusivement sur les sources fournies (fiche PDF + annales du cours).
> En l'absence de source, on ne génère pas — on demande la source.

---

## QCM — 20 par cours, ventilés en 4 séries de 5

À chaque demande « génère 20 QCM pour le cours X » :

### Découpage obligatoire

| Série | Type | Format | Nb questions |
|---|---|---|---|
| Série 1 — Cours | Questions isolées | 5 items A-E, 1+ bonnes réponses | 5 |
| Série 2 — Cours | Questions isolées | 5 items A-E, 1+ bonnes réponses | 5 |
| Série 3 — DP 1 | Dossier progressif | Énoncé clinique commun, 5 questions liées | 5 |
| Série 4 — DP 2 | Dossier progressif | Énoncé clinique commun, 5 questions liées | 5 |

**Total : 20 QCM, 4 séries.**

### Nomenclature des séries (champ `label` dans `qcm_series`)

- Séries de cours : `Cours — Série 1`, `Cours — Série 2`
- Dossiers progressifs : `DP 1 — <titre court du cas>`, `DP 2 — <titre court>`
  (ex. `DP 1 — Pneumonie de la femme âgée`)

### Style des questions

**Cours** (Séries 1 & 2) : 10 questions au total — questions de connaissances
isolées sur des points hypertombables, format EVC :
- énoncé court, factuel
- 5 items A à E
- 1 à 4 bonnes réponses possibles
- justification médicale par item (validée par la fiche ou les annales)

**Dossiers progressifs** (Séries 3 & 4) : 2 DP × 5 questions chacun, en
conditions réelles annales :
- énoncé clinique unique en tête (vignette de 8-15 lignes : patient, motif,
  examen, première para-clinique)
- 5 questions qui suivent le raisonnement clinique : diagnostic → para-clinique
  complémentaire → diagnostic différentiel → thérapeutique → suivi/complication
- **inspiration directe des annales du cours** : style, longueur, niveau de
  pertinence des distracteurs
- **pas trop faciles** : viser le niveau réel des EVC, pas un exercice scolaire
- pièges classiques attendus : item piège « toutes les réponses ci-dessus »,
  faux amis pharmaco, contre-indications souvent oubliées

### Sources

- **Fiche PDF du cours** = source primaire pour le contenu théorique
- **Annales du cours** (table `qcm_series` type = `annale`, et la table
  `cours_chunks` qui les indexe) = référence de style obligatoire pour les DP
- Aucune connaissance externe : si un point n'est pas dans la fiche ou les
  annales, on ne crée pas de question dessus

---

## Flashcards — 50 à 200 par cours, exhaustives

À chaque demande « génère des flashcards exhaustifs pour X » :

### Volume

- **Minimum 50** cartes
- **Maximum 200** cartes
- Cible : ~1 carte par notion essentielle de la fiche + 1 carte par item piège
  des annales du cours

### Format

Champ `recto` : question courte, claire, **mémorisable**.
Champ `verso` : réponse concise (1-3 lignes max), **structurée** quand
plusieurs éléments (puces ou triade type :).

Exemples :
- ✅ `recto`: « Triade de l'insuffisance cardiaque droite ? »
       `verso`: « Œdèmes des membres inférieurs · turgescence jugulaire ·
                  hépatalgie d'effort »
- ❌ Carte trop longue, ouverte ou nécessitant un raisonnement.

### Couverture

Le set doit couvrir **tous les points essentiels** :
1. Définitions / épidémiologie clés
2. Mécanismes physiopath obligatoires
3. Signes cliniques pathognomoniques / triades
4. Critères diagnostiques chiffrés (seuils, scores)
5. Para-clinique : examens à demander en 1re intention
6. Diagnostics différentiels indispensables
7. Thérapeutique : 1re intention, posologies clés, contre-indications
8. Complications à connaître
9. Suivi / pronostic / facteurs de mauvais pronostic
10. Points piégeants identifiés dans les annales (justifications des items
    faux ou faux amis fréquents)

### Sources

- **Fiche PDF du cours** = source primaire pour 80 % des cartes
- **Annales du cours** = source pour les ~20 % de cartes ciblant les pièges
  réellement tombés au concours
- Aucune extrapolation hors source

---

## Procédure côté Claude Code

Quand l'utilisateur demande une génération :

1. **Vérifier que le PDF de fiche est attaché à la demande** (ou présent dans
   le stockage Supabase). Sinon, refuser et demander le PDF.
2. **Récupérer les annales existantes du cours** depuis la DB
   (`qcm_series.type = 'annale'` + `qcm_questions` + `qcm_items`).
3. **Générer le contenu** strictement à partir des deux sources ci-dessus.
4. **Insérer en DB** via Supabase (`apply_migration` ou `execute_sql`) :
   - `qcm_series` : créer 4 lignes (2 type='qcm' label='Cours — Série N',
     2 type='qcm' label='DP N — …')
   - `qcm_questions` : 5 lignes par série
   - `qcm_items` : 5 items A-E par question avec `is_correct` et `justification`
   - `flashcards` : 50-200 lignes
5. **Déclencher la réindexation RAG** (`reindexCoursAction`) après insertion
   pour mettre à jour `cours_chunks`.

## Procédure côté admin de la plateforme

L'admin peut aussi déclencher la génération automatique :
- Onglet « Flashcards » → bouton **Générer flashcards exhaustifs** (action
  `generateFlashcardsAction`)
- Onglet « QCM » → bouton **Générer 4 séries de 5 QCM** (action
  `generateQcmAction`)

Les deux actions appellent Claude Sonnet 4.6 avec le contexte fiche + annales
et respectent les standards ci-dessus.

---

## Anti-hallucination — règles non négociables

1. **Pas de PDF → pas de génération**. On répond : « PDF manquant. Téléverse
   d'abord la fiche dans l'onglet Fiche ou joins-la à la demande. »
2. **Pas d'annale → DP simplifié**. Si le cours n'a pas encore d'annale
   indexée, prévenir l'utilisateur et générer les DP en s'inspirant
   uniquement de la fiche (qualité dégradée).
3. **Posologies, scores, seuils** : reproduction textuelle de la fiche, jamais
   recopiés de mémoire.
4. **Disclaimer permanent** dans l'UI étudiant pour toute génération IA.
