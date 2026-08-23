# Corpus Gériatrie MG DP - TERMINÉ (2026-08-23)

## Résultat final

- 60/60 cours complétés
- 960/960 séries insérées en base (480 DP QCM + 480 DP QROC)
- ~6 720 questions (7 par série)
- Facturation : +300 € IA brut ajouté dans `facturation-dashboard.tsx`

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
