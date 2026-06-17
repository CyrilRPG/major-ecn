# Régénération des fiches cardiologie

État au moment de la persistence (commit X) :
- Vercel fix bundle Chromium-min : déployé (`1171afa` sur `main`).
- Patch `major-ecn-fiche` (HTML standalone + push Supabase + nouvelles normes) :
  branche locale `feat/html-standalone-supabase` sur le clone, sha `741d521`.
- Migration DB `fiches.content_html` + unique index `cours_id` : appliquée.
- Composant éditeur HTML WYSIWYG : déployé.

## Pré-requis pour reprendre

1. Env vars dans la session (à mettre dans Personnaliser → Environnement) :
   - `SUPABASE_URL=https://mrrgfnirpwsknuyiwcqy.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY=eyJ...` (service_role)
   - `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`
2. Network egress allowlist : `mrrgfnirpwsknuyiwcqy.supabase.co`.
3. GitHub MCP scope : `cyrilrpg/major-ecn-fiche` (pour pouvoir y pousser).
4. NE PAS utiliser l'API Anthropic — tout faire via sub-agents Claude Max.

## Scripts dans ce dossier

- `regen_cardio.py` — orchestrateur batch des 22 fiches cardio (utilise
  l'API Anthropic, à NE PAS UTILISER tant qu'on est en mode Claude Max).
- `render_one_fiche.py` — render d'une fiche depuis un JSON FicheData
  produit manuellement (par un sub-agent Claude Max). Pipeline render
  HTML standalone + Chromium + push Supabase. **C'est celui qu'on
  utilise.**

## Workflow recommandé

Pour chaque fiche cardio (22) :
1. Télécharge le PDF source : `curl -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" "$SUPABASE_URL/storage/v1/object/fiches/<cours_id>/<filename>.pdf" -o /tmp/src.pdf`
2. Extrait le texte avec PyMuPDF : `python3 -c "import fitz; doc=fitz.open('/tmp/src.pdf'); print('\n'.join(p.get_text() for p in doc))"`
3. Délègue à un sub-agent Claude Max qui produit un JSON FicheData.
4. Lance `python3 scripts/render_one_fiche.py --fiche-json /tmp/fiche.json --cours-id <uuid> --cours-titre "<titre>"`.

## Liste des 22 cours cardio (cours_id, storage_path)

Voir la requête SQL :
```sql
SELECT c.id, c.titre, (
  SELECT name FROM storage.objects
  WHERE bucket_id='fiches' AND name LIKE c.id::text || '/%'
  ORDER BY created_at DESC LIMIT 1
) AS source_path
FROM public.cours c
JOIN public.matieres m ON m.id = c.matiere_id
WHERE lower(m.nom) LIKE '%cardio%'
ORDER BY c.order_index;
```
