# Captures plateforme — site vitrine

Déposez ici les **6 fichiers PNG** suivants (haute résolution, idéalement 2× retina, fond
visible : sidebar bordeaux + contenu blanc) :

| Fichier requis            | Section du site vitrine                              | Capture à prendre                                                                 |
| ------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| `accueil.png`             | **HERO** (à droite, avec badges flottants)           | `/accueil` — dashboard d'Alice avec KPIs, graphique, matières à prioriser, donut  |
| `flashcards-ia.png`       | **Section feature « ⭐ Notre signature »** (mise en avant) | Flashcards verso + panneau **Assistant du cours** ouvert à droite                 |
| `cours.png`               | Grille « L'expérience complète »                     | `/cours/[id]` — onglet **Aperçu** d'un item (cardio Item 234 par ex.)             |
| `entrainement.png`        | Grille « L'expérience complète »                     | `/entrainement` — page entraînement ciblé avec collèges à renforcer               |
| `agenda.png`              | Grille « L'expérience complète »                     | `/agenda` — semaine complète avec créneaux cours                                  |
| `annales.png`             | Grille « L'expérience complète »                     | Une annale en cours — énoncé + items A–E                                          |

## Workflow

1. Connectez-vous au compte démo Alice (`alice@major-ecn-demo.fr` / `Demo2026!`).
2. Pour chaque capture, utilisez **Cmd/Ctrl + Shift + P** dans Chrome → tapez
   « Capture full size screenshot » → sauvegardez en PNG.
3. Déposez chaque PNG dans ce dossier (`public/screenshots/`) avec le nom exact ci-dessus.
4. Commit + push, puis Vercel redeploiera automatiquement.

## Notes techniques

- Aspect ratio recommandé : **16:10** (1920×1200) pour les images plein cadre.
- `flashcards-ia.png` peut être plus large (2400 px) pour la feature card.
- Si une image manque, Next.js affichera juste une zone vide à sa place — pas de crash.
