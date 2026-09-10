# Visuels EVC Arena — crédits

## Photos Unsplash (licence Unsplash : utilisation libre, commerciale comprise)

Recadrées et compressées pour le web le 07/09/2026.

| Fichier | Photographe | Source |
|---|---|---|
| stadium-red.jpg | Jackson Barger | https://unsplash.com/photos/HzEbXnpPA-M |
| floodlights.jpg | Daniel van den Berg | https://unsplash.com/photos/29Jx9qyTW14 |
| seats-red.jpg | Egor Myznik | https://unsplash.com/photos/86re3sqrI7c |
| seats-red-portrait.jpg | Egor Myznik | https://unsplash.com/photos/bl5QDPDs2y8 |
| amphitheatre.jpg | Vagelis Karathanasis | https://unsplash.com/photos/0khGrCaCy8E |
| lights-fog.jpg | Warner Shaw | https://unsplash.com/photos/pEDaJ9obTBQ |

## Visuels fournis par le client (07/09/2026)

| Fichier | Origine |
|---|---|
| helmet.png, helmet-320.png | Casque spartiate fourni par Major ECN, détouré (canal alpha nettoyé, recadré) |
| hero-arena.jpg | Visuel de l'arène médicale fourni par Major ECN (hero de la landing, image Open Graph) |

## Dérivés (10/09/2026)

| Fichier | Origine |
|---|---|
| colosseum-plate.jpg | `colosseum-2026.png` sans ses deux bannières latérales (zones reconstruites par symétrie des colonnades voisines, `tmp/_arena-plate.mjs`, @napi-rs/canvas). Fond unique de toutes les pages Arena (`arena-backdrop.tsx`) ; les oriflammes sont désormais des éléments HTML (`arena-oriflammes.tsx`). |
| colosseum-plate-1080.jpg | Même plaque réduite à 1080 px de large pour la couche statique mobile / tablette. |
| rules-scene-2026.png | Décor de la page Règles recréé avec l’outil intégré `image_gen` à partir de la maquette client du 10/09/2026 : amphithéâtre, bannières et casque sur son socle. Tous les textes et contrôles de la page sont rendus en HTML, en dehors des inscriptions décoratives des bannières. Consigne : `rules-scene-2026.prompt.md`. |
| lobby-banner-evc-2026.png, lobby-banner-season-2026.png | Bannières raster de l’accueil participant recréées avec l’outil intégré `image_gen` à partir de la maquette client du 09/09/2026 (01:32:18). Tissu, casque, devise, bordures, lauriers et franges en image ; année de saison issue des dates du tournoi en HTML. Consignes : `lobby-banners-2026.prompt.md`. |

## Dérivés du 10/09/2026 (après-midi) — `tmp/_arena-img/build.mjs`

| Fichier | Origine |
|---|---|
| hero-arena.jpg, hero-arena-1080.jpg | Ré-encodés depuis le PNG source du client (`ChatGPT Image 7 sept. 2026, 18_21_01.png`, 1536 × 1024) : suréchantillonnage Lanczos-3 à 2560 px + accentuation légère, JPEG q90 ; variante 1080 px pour mobile. |
| colosseum-plate.jpg, colosseum-plate-1080.jpg | Plaque sans bannières refaite à 2560 px depuis `colosseum-2026.png` (Lanczos-3, mêmes raccords par symétrie que `_arena-plate.mjs`). |
| rules-scene-2026.jpg, rules-scene-2026-1024.jpg | Scène de la page Règles fournie par le client le 10/09/2026 (`ChatGPT Image 10 sept. 2026 à 11_35_08.png`, 1024 × 1536) : Lanczos-3 à 1536 × 2304, JPEG q90 ; variante 1024 px pour mobile. Remplace `rules-scene-2026.png`. |
| laurel-gold.png | Couronne de lauriers dorée détourée (canal alpha calculé par chromie or / bordeaux) depuis `lobby-banner-season-2026.png`, 485 × 412. Pied de page des Règles, page de garde des corrigés. |
| specialites/{stethoscope,poumons,rein,cerveau,coeur,intestin}.png | Visuels des cartes « Choisissez votre tournoi », découpés dans la maquette client (`ChatGPT Image 10 sept. 2026 à 13_38_29.png`), Lanczos-3 ×4, bords fondus (alpha elliptique). Visuel par défaut par spécialité ; un tournoi peut déposer le sien (`arena_tournaments.cover_image_path`, bucket `arena-public`). |
