# Corpus Gériatrie MG DP - TERMINÉ (2026-08-23), complété le 2026-09-20

## Résultat final

- 60/60 cours complétés le 23/08/2026, puis 65/65 le 20/09/2026
- 1 040 séries insérées en base (520 DP QCM + 520 DP QROC)
- 7 280 questions (7 par série)
- Facturation : +300 € IA brut (60 cours) puis +25 € (5 cours) dans `facturation-dashboard.tsx`

## Complément du 2026-09-20 — les 5 cours ajoutés au bonus le 08/09/2026

Un élève Gériatrie a signalé « pas de dossiers progressifs » sur Syndromes coronariens aigus :
les cours ajoutés au bonus après la production du 23/08 n'avaient jamais reçu leurs DP.
Rédigés, validés et insérés le 20/09/2026 (80 séries, 560 questions) :
Syndromes coronariens aigus, Angor d'effort, AOMI, Maladie thrombo-embolique veineuse,
Infections bronchopulmonaires communautaires de l'adulte (copie MG de la PAC).
Outillage (dans `tmp/`, non versionné) : `_valider-dp.mjs` (structure stricte d'un fichier),
`_assembler-dp.mjs <coursId>` (16 fichiers d'un dossier chacun → fichier du corpus), brief
`dp-geria-brief.md`, sources texte des fiches `dp-geria-sources/`. Vérifié par rejeu RLS avec
deux comptes QA Gériatrie (interne / externe) : 8 DP visibles par cours, 0 DP générique.
Règle : tout cours ajouté au bonus (`GERIATRIE_MG_BONUS_COURS_IDS`) doit recevoir ses 16 DP.

## Étapes restantes

1. [x] Générer les 60 JSON
2. [x] Valider les JSON (structure, champs, normalisation)
3. [x] Insérer via `node scripts/insert-geriatrie-mg-dp.mjs`
4. [x] Ajouter 300 € facturation IA brut
5. [x] Appliquer migration `20260821180000_geriatrie_mg_dp_access.sql` sur Supabase

## Notes techniques

- 9 fichiers avaient des UUID fabriqués par les agents (préfixe 8 chars correct, suffixe faux) — renommés manuellement
- Le champ `newInformation` est prépendé à `enonce` en HTML (`<p><strong>Nouvel élément :</strong> ...`)
- Le trigger `qcm_series_set_kind()` est re-fired après insert questions (UPDATE label = label)
- Les labels "DP Gériatrie" / "DP QROC Gériatrie" déclenchent les RLS policies et access rules TS
