# Comptes de démo

| Rôle | Email | Mot de passe | Permission |
|------|-------|--------------|------------|
| Admin | `admin@hermione-demo.co` | `Demo2026!` | Toutes facultés |
| Étudiante | `alice@hermione-demo.co` | `Demo2026!` | Toutes facultés (PASS) |
| Étudiant | `bob@hermione-demo.co` | `Demo2026!` | Sorbonne Paris Nord (LAS1) |

## Données seedées

- 2 facultés : **Sorbonne Paris Nord** (active) et **Paris Cité** (vide — montre le verrouillage).
- 2 semestres (S1, S2) avec 12 matières au total (5 S1 + 7 S2).
- 36 cours (33 placeholders + 3 cours Biochimie complets).
- **Biochimie** : 3 cours complets — Acides aminés, Enzymes, Métabolisme glucidique.
  - 6 séries par cours (3 QCM + 3 annales) × 5 questions × 5 items A→E avec justifications.
  - 15 flashcards par cours.
  - Fiches PDF générées (`pnpm seed-fiches`) ; pas de vidéo uploadée → écran « bientôt disponible ».
