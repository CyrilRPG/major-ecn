# Major ECN — Plateforme E-learning EDN/EVC

Plateforme de préparation aux Épreuves Dématérialisées Nationales (EDN) et aux Épreuves de
Vérification des Connaissances (EVC) pour Major ECN — D2, D3, D4 et PAE.
Démo de qualité commerciale 2026.

## Stack technique

- **Next.js 16** (App Router) + **TypeScript strict**
- **Tailwind CSS v4** (CSS-first `@theme`) + primitives custom inspirées de shadcn/ui (Radix UI)
- **Supabase** : Postgres + Auth email/password + Storage (videos & PDFs privés)
- **Framer Motion** pour les micro-animations (stagger, slide, flip 3D)
- **react-hook-form** + **zod**, **TanStack Query**, **Recharts**, **Lucide**, **next-themes**

## Comptes de démo

| Rôle | Email | Mot de passe | Accès |
|------|-------|--------------|-------|
| Admin | `admin@major-ecn-demo.fr` | `Demo2026!` | Tout |
| Étudiante full access | `alice@major-ecn-demo.fr` | `Demo2026!` | Toutes facultés |
| Étudiant restreint | `bob@major-ecn-demo.fr` | `Demo2026!` | Sorbonne Paris Nord uniquement |

## Mise en route locale

### 1. Pré-requis

- Node ≥ 20 (testé sur 22)
- pnpm ≥ 11 (`corepack enable && corepack prepare pnpm@latest --activate`)
- Python ≥ 3.10 (pour la génération des fiches PDF — optionnel si tu utilises l’upload manuel)

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configurer Supabase

Crée un projet Supabase puis dans le SQL Editor, exécute dans l’ordre les migrations suivantes :

1. `supabase/migrations/20260515120000_schema.sql` — tables, indexes, trigger `handle_new_user`.
2. `supabase/migrations/20260515120100_rls.sql` — fonctions et policies Row Level Security.
3. `supabase/migrations/20260515120200_storage.sql` — buckets `videos`, `fiches`, `assets` + leurs policies.

Le seed des données pédagogiques (facultés, matières, cours, 3 cours biochimie complets, comptes démo) est appliqué via SQL — copie le contenu généré par l’assistant (ou exécute manuellement `supabase/seed.sql` si tu le crées).

### 4. Variables d’environnement

Copie `.env.local.example` vers `.env.local` et remplis :

```
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxx
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

La service role key se récupère sur **Project Settings → API keys**. Elle est utilisée par les routes `/api/admin/*` (création d’élèves, impersonation).

### 5. Générer et téléverser les fiches PDF (optionnel)

```bash
pip install reportlab
pnpm seed-fiches   # = generate-pdfs (Python) + upload-fiches (TS)
```

Trois fiches Biochimie réalistes sont produites dans `supabase/seed-assets/fiches/` puis uploadées dans le bucket `fiches`.

### 6. Démarrer

```bash
pnpm dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Architecture

```
src/
├── middleware.ts                # Refresh session + gate /app /admin /cours /facultes /matieres
├── app/
│   ├── page.tsx                 # Landing minimale
│   ├── (auth)/login/            # Écran connexion (split brand + form)
│   ├── (student)/               # Route group : layout + impersonation banner
│   │   ├── app/                 # Dashboard étudiant (→ /facultes)
│   │   ├── facultes/[fac]/[sem] # Faculté → semestre → matières
│   │   ├── matieres/[matiere]/  # Liste des cours
│   │   └── cours/[cours]/       # Parcours timeline + vidéo / fiche / QCM / annales / flashcards / résultats
│   ├── admin/                   # Sidebar + role gate
│   │   ├── eleves/              # Table + add student dialog + impersonation
│   │   ├── contenu/[cours]/     # 4 onglets : vidéo / fiche / QCM / flashcards
│   │   └── stats/               # KPIs + charts Recharts + leaderboard
│   └── api/admin/               # create-student / impersonate / stop-impersonation
├── components/
│   ├── ui/                      # Primitives custom (button, card, dialog, table…)
│   ├── brand/                   # Logo Major ECN + fond géométrique émeraude/teal
│   ├── student/                 # faculte-card, matiere-card, parcours-timeline, video-player, pdf-viewer
│   ├── qcm/                     # session, item, results
│   ├── flashcards/              # flashcard 3D flip, difficulty buttons
│   └── admin/                   # sidebar, students table, content editors, stats charts
├── lib/
│   ├── supabase/                # client (browser), server, admin (service role)
│   ├── auth/                    # get-profile, require-role, permissions (canAccessFaculte)
│   ├── qcm/grade.ts             # Logique 0 ou 5/5
│   ├── flashcards/weighted-sampler.ts  # Algorithme pondéré
│   ├── schemas/                 # zod schemas (AddStudent, etc.)
│   ├── icons.ts                 # Mapping icon_key → Lucide
│   └── utils.ts                 # cn(), formatDuration(), initials()…
└── types/
    ├── database.ts              # Types générés Supabase
    └── domain.ts                # PermissionScope, Difficulty…
```

## Tests fonctionnels (parcours démo)

1. `admin@major-ecn-demo.fr` → onglet **Élèves** → table avec Alice + Bob, filtres et recherche fonctionnent.
2. Bouton **« Se connecter en tant que »** sur Alice → bandeau d’impersonation, navigue vers `/facultes` : les **deux** facultés sont accessibles.
3. Bouton **« Revenir au panel admin »** → retour `/admin/eleves` sans relogin.
4. **« Se connecter en tant que »** Bob → seule **Sorbonne Paris Nord** est cliquable, **Paris Cité** est verrouillée avec tooltip.
5. En tant que Bob : Sorbonne Paris Nord → S1 → Biochimie → cours 1 « Acides aminés ». La timeline affiche les 4 étapes. La **fiche PDF** s’ouvre (`Marquer comme lue` → check vert). La **vidéo** indique « Vidéo bientôt disponible » + CTA fiche.
6. Lance **Dossiers progressifs → Série 1** : 5 questions, validation question par question avec couleurs vert/rouge et justifications slide-down. Notation EDN.
7. Page **Résultats** : score animé, cercle de progression, comparaison avec session précédente, historique Recharts, bouton « Refaire uniquement les erreurs ».
8. **Flashcards** : 15 cartes, flip 3D, 4 boutons de difficulté. Une seconde session privilégie les cartes notées « difficile » / « très difficile ».
9. Admin → **Contenu** → choisir un cours → onglets vidéo (drag & drop MP4) / fiche (drag & drop PDF) / QCM / flashcards (ajout inline). Toggle thème en bas de la sidebar.
10. Admin → **Stats** : KPIs, AreaChart 30 j, Top 5 cours, taux de réussite par matière, leaderboard.

## Sécurité

- **Middleware Next.js** : auth gate sur `/app /admin /cours /facultes /matieres`.
- **Row Level Security** Supabase : un étudiant ne voit jamais le contenu d’une faculté hors de son `permission_scope`, même en bidouillant l’URL. Toutes les écritures pédagogiques sont réservées à `role = 'admin'`. Le tracking (`qcm_attempts`, `qcm_sessions`, `flashcard_reviews`, `course_progress`) est limité à `user_id = auth.uid()`.
- **Service role key** : utilisée uniquement côté serveur (`src/lib/supabase/admin.ts`, importée avec `server-only`). Jamais expédiée vers le client.

## Identité visuelle

Palette « émeraude clinique » construite autour du vert médical Major ECN (`#0F6E4E`) et d’un accent teal (`#15B8A6`). Tokens dans `src/app/globals.css` via `@theme`. Thème clair forcé via `next-themes`. Typographies Fraunces (titres) + Manrope (corps) + IBM Plex Mono. Ombres stratifiées teintées vert, animations Framer Motion subtiles, aucun gradient criard ni emoji dans l’UI.

## Commandes utiles

```bash
pnpm dev              # Dev server
pnpm build            # Build de production
pnpm lint             # ESLint
pnpm typecheck        # tsc --noEmit
pnpm generate-pdfs    # 3 fiches PDF Biochimie via reportlab
pnpm upload-fiches    # Upload des PDFs vers Supabase Storage (admin login)
pnpm seed-fiches      # Les deux d’un coup
```
