# Refonte de la Médecine générale — séparation en sous‑collèges d'items

> Directive de travail réutilisable **pour chaque spécialité** de Médecine
> générale. Objectif : passer d'une fiche **monolithique par spécialité** à un
> **sous‑collège éclaté en items**, une fiche courte par item — sur le modèle
> **Dermatologie**, déjà réalisé.

---

## 1. Objectif

Pour chaque spécialité de Médecine générale, transformer :

- **Avant** : 1 cours « Cardiologie » (ou Pneumologie, Néphrologie…) dans le
  collège `col-medecine-generale`, avec **une seule grosse fiche** (30–52 pages).
- **Après** : 1 **sous‑collège** rattaché à Médecine générale (comme
  `col-dermatologie`), **éclaté en items** (1 cours = 1 item), avec **une fiche
  courte et soignée par item**.

Résultat attendu : mêmes objectifs que Dermatologie — navigation par item,
fiches concises, plan clair, tableaux de synthèse, fiche éclair.

---

## 2. Périmètre — NE PAS CONFONDRE

| Élément | Rôle | À faire |
|---|---|---|
| **`col-medecine-generale`** (19 cours = 19 spécialités, fiche monolithique chacune) | **SOURCE** de production | On part de ces fiches vérifiées |
| **`col-dermatologie`** (sous‑collège de MG, 12 items) | **MODÈLE** déjà réalisé | On réplique exactement sa structure |
| **Collèges de spécialité autonomes** (`col-cardiologie`, `col-pneumologie`, `col-neurologie`…) | **HORS PÉRIMÈTRE** | ⛔ **Ne JAMAIS réutiliser** leurs cours/fiches comme source de production. Ce sont des collèges séparés. |

> ⚠️ Le collège autonome `col-cardiologie` (22 cours) **n'est pas** la source de
> la cardiologie de Médecine générale. La source, c'est **le cours « Cardiologie »
> de `col-medecine-generale`** et son unique fiche vérifiée.

Comme pour Dermatologie (qui a été **retirée** des 19 cours monolithiques puis
remplacée par le sous‑collège `col-dermatologie`), à la fin de la séparation
d'une spécialité, le **cours monolithique correspondant est retiré** de
`col-medecine-generale`.

---

## 3. Sources & ordre de priorité (règle d'or)

1. **PRIMAIRE — la fiche vérifiée en ligne** de la spécialité dans
   `col-medecine-generale` (`fiches.content_html` / `content_json`).
   Elle est **relue et validée par les enseignants** : elle **PRIME sur tout**.
   Le contenu médical de chaque item vient d'abord d'elle.
2. **SECONDAIRE — les dossiers de fiches individuelles** fournis dans
   `colleges-inputs/…` puis `medecine generale/…` (ajoutés au fur et à mesure,
   en commençant par la cardiologie). **Rôle : enrichir uniquement** (compléter
   un plan, ajouter un tableau, préciser un chiffre) — **jamais** contredire ni
   remplacer la fiche vérifiée.

> En cas de divergence : **la fiche vérifiée l'emporte** toujours.

---

## 4. Structure cible (modèle Dermatologie)

### 4.1 Sous‑collège (table `matieres`)

- `id` : `col-mg-<specialite>` (ex. `col-mg-cardiologie`).
  - ⚠️ **Ne pas** réutiliser l'id d'un collège autonome existant
    (`col-cardiologie` est pris) → suffixe/prefixe `mg` pour éviter la collision.
  - Exception historique : Dermatologie = `col-dermatologie` (aucun collège
    autonome homonyme, donc pas de collision).
- `parent_matiere_id` : **`col-medecine-generale`** (rattachement à MG).
- `semestre_id` : `edn-prog`.
- `nom` : nom de la spécialité (ex. `Cardiologie`).
- `icon_key` : icône lucide gérée par `src/lib/icons.ts`
  (ex. `HeartPulse` pour cardio, `Wind` pneumo, `Brain` neuro, `Droplets`
  néphro, `Microscope` médecine interne…). Fallback `Stethoscope`.
- `color_hex` : reprendre la teinte de la spécialité (cf.
  `src/components/flashcards/flashcard-theme.ts`, champ `accent`).
- `order_index` : ordre d'apparition sous MG.
- `access_type` : `'all'`, `min_offer` : `null` (comme les autres).

### 4.2 Items (table `cours`)

- 1 ligne `cours` **par item**, `matiere_id = col-mg-<specialite>`,
  `order_index` 1..N, `titre` = intitulé de l'item.
- Le titre doit être **court et clair** (ex. « Fibrillation atriale »,
  « Syndromes coronariens aigus »), pas un intitulé EDN à rallonge.

### 4.3 Fiche (table `fiches`)

- 1 ligne `fiches` **par cours** (`cours_id`), `content_format = 'html'`,
  `content_html` = document HTML autoporté (cf. §5), PDF régénéré via le
  pipeline (cf. §6).

---

## 5. Format d'une fiche‑item (charte Major ECN)

Chaque fiche est **courte** (c'est normal et voulu ; cf. Dermatologie ~8–14
pages) mais **complète et soignée**. Elle reprend la charte du générateur
`major-ecn-fiche` et du modèle `FicheData` (`src/lib/fiches/types.ts`).

Éléments obligatoires :

1. **Page de garde (cover)** — bandeau + logo Major ECN, **titre du cours**,
   footer « Major ECN · 2025‑2026 » (classes `.cover`, `.cover-band`,
   `.cover-logo`, `.string-source`).
2. **Watermark** de page (`.page-watermark`).
3. **Plan** clair et numéroté (parties I, II, III… et sous‑parties A, B, C…),
   avec un court résumé par partie (page de garde).
4. **Corps structuré** en parties/sous‑parties, sous forme de **tableaux
   concept | détail** ; lignes‑réflexe pleine largeur :
   - `À retenir`, `Piège`, `Moyen mnémotechnique` (kinds `a_retenir`,
     `piege`, `mnemo`).
5. **Tableaux de synthèse** (`<table>`, Markdown GFM) — au moins un par fiche.
6. **Chiffres clés** (tableau dédié quand pertinent : seuils, scores, doses).
7. **Points clés** (liste courte).
8. **Fiche éclair** (`fiche_eclair_md`) — résumé express de l'item, le
   « survol 2 minutes ».
9. **Légende des marqueurs** : `★` déjà tombé aux EVC · `◆` haut rendement ·
   `⚠` piège classique.

> Deux formats possibles, au choix selon l'outil :
> - **`content_json`** = objet `FicheData` structuré (source canonique éditable
>   dans l'éditeur WYSIWYG). **Préféré** car ré‑éditable proprement.
> - **`content_html`** = HTML autoporté (comme les fiches Dermatologie
>   actuelles). Accepté ; rendu identique.

---

## 6. Pipeline technique (création d'une fiche)

1. **Créer le sous‑collège** (`matieres`) et les **cours** (items) via SQL
   (Supabase MCP `execute_sql` / `apply_migration`).
2. **Composer la fiche** de chaque item (content_html ou content_json) à partir
   de la **fiche vérifiée** (source primaire), enrichie si besoin (source
   secondaire).
3. **Rendre le PDF** servi aux étudiants :
   `POST /api/fiches/[coursId]/render-html`
   avec `{ content_html, save: true, nom_cours, annee }`.
   → stocke `content_html`, convertit en **PDF (Chromium + charte + polices)**,
   upload dans Storage, met à jour `fiches.storage_path` et `fiches.pages`.
   (Côté admin : onglet Fiche → dépôt `.html` ou éditeur WYSIWYG → « Publier ».)
4. **Réindexer le RAG** du cours (`reindexCoursAction`) pour préparer la
   génération QCM/flashcards.
5. **Retirer** le cours monolithique de la spécialité de `col-medecine-generale`
   (après vérif) — comme cela a été fait pour Dermatologie.

---

## 7. Découpage en items

- La **liste d'items** d'une spécialité est fournie par les **dossiers
  individuels** déposés (`colleges-inputs/…` puis `medecine generale/…`),
  ajoutés au fur et à mesure (**cardiologie en premier**).
- À défaut, elle est déduite du **plan de la fiche vérifiée** (grands chapitres
  → items), validée avec l'équipe avant production.
- 1 dossier / 1 fiche fournie = 1 item = 1 cours.

---

## 8. Conventions

| Champ | Valeur |
|---|---|
| `matieres.id` | `col-mg-<specialite>` (kebab‑case, sans collision) |
| `matieres.parent_matiere_id` | `col-medecine-generale` |
| `matieres.semestre_id` | `edn-prog` |
| `matieres.access_type` | `all` · `min_offer` `null` |
| `matieres.icon_key` | icône lucide valide (`src/lib/icons.ts`) |
| `matieres.color_hex` | teinte spécialité (`flashcard-theme.ts` → `accent`) |
| `cours.order_index` | 1..N, ordre pédagogique |
| `fiches.content_format` | `html` |
| Nom du collège | doit matcher `flashcard-theme.ts` pour le thème auto |

---

## 9. Contrôle qualité — checklist par fiche

- [ ] Cover Major ECN correcte (titre du cours, footer année).
- [ ] Plan numéroté présent et cohérent.
- [ ] ≥ 1 tableau de synthèse.
- [ ] Chiffres clés / seuils présents quand pertinents.
- [ ] **Fiche éclair** présente.
- [ ] Marqueurs ★ / ◆ / ⚠ utilisés à bon escient.
- [ ] Contenu fidèle à la **fiche vérifiée** (primauté), enrichissement cohérent.
- [ ] Fiche **courte** mais complète (pas de remplissage).
- [ ] PDF régénéré (pages > 0), fiche visible côté étudiant.
- [ ] RAG réindexé.

## 10. Après les fiches — QCM & flashcards

Une fois les fiches d'items en ligne, générer par item selon
`docs/content-generation-standards.md` :
- **Flashcards** : 50–200, exhaustives.
- **QCM** : 8 séries (4 « Cours — Série N » + 4 « DP N »).
Sources : fiche de l'item + annales indexées.

---

## 11. Journal d'avancement (à compléter au fil de l'eau)

| Spécialité | Sous‑collège | Items | Fiches | QCM/FC | Statut |
|---|---|---|---|---|---|
| Dermatologie | `col-dermatologie` | 12 | 12 | — | ✅ modèle |
| Cardiologie | `col-mg-cardiologie` | à définir | — | — | 🚧 en cours |
| … | | | | | |

## ⚠️ Accès : propagation parent → sous‑collèges

Un sous‑collège de Médecine générale (`parent_matiere_id = 'col-medecine-generale'`)
est un `matiere` distinct : accorder le parent dans `permission_scope.colleges`
n'ouvre PAS automatiquement l'enfant côté pages d'enforcement.

- Le **provisioning Stripe** inclut déjà les enfants au moment de l'achat.
- Le **navigator (sidebar)** hérite désormais des enfants d'un parent accessible.
- Mais les élèves déjà provisionnés AVANT la création d'un nouveau sous‑collège
  ne l'ont pas dans leur scope → **après avoir créé un nouveau sous‑collège MG,
  relancer cette requête idempotente** pour propager le grant parent aux enfants :

```sql
with expanded as (
  select p.id,
    (select to_jsonb(array(select distinct e from (
       select jsonb_array_elements_text(p.permission_scope->'colleges') as e
       union
       select m.id from matieres m
       where m.parent_matiere_id in (select jsonb_array_elements_text(p.permission_scope->'colleges'))
     ) s)) ) as new_colleges
  from profiles p
  where p.permission_scope->>'type' = 'college' and p.permission_scope ? 'colleges'
    and exists (select 1 from matieres m
      where m.parent_matiere_id in (select jsonb_array_elements_text(p.permission_scope->'colleges'))
        and not (p.permission_scope->'colleges' ? m.id))
)
update profiles p set permission_scope = jsonb_set(p.permission_scope, '{colleges}', e.new_colleges)
from expanded e where p.id = e.id;
```
