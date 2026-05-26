# Optimisation des coûts API IA — Major ECN

> **Objectif** : tenir un volume de 3000 questions / mois (forum + assistant IA)
> à **moins de 20 € HT/mois** d'API, **zéro hallucination médicale**.

---

## TL;DR — Stack cible

| Composant | Choix | Pourquoi |
|---|---|---|
| Modèle principal | **Claude Haiku 4.5** | 10× moins cher que Sonnet, suffisant pour RAG médical |
| Fallback complexe | **Claude Sonnet 4.6** | Activé manuellement par l'élève (« réponse détaillée ») |
| Embeddings | **voyage-3-lite** ou `text-embedding-3-small` | ~0,02 €/1M tokens, qualité largement suffisante |
| Stockage vecteurs | **pgvector** (Supabase) | Gratuit, déjà installé |
| Cache prompt | **Anthropic Prompt Caching** (`cache_control`) | -90 % sur l'input cacheable |
| Cache sémantique | **Table `qa_cache` + similarité cosinus ≥ 0,92** | -30 à -40 % d'appels API au bout de 3 mois |
| Garde-fou anti-hallucination | **System prompt strict + abstention forcée** | Sécurité médicale |

---

## 1. RAG plutôt qu'envoi de fiche entière

**Avant** : on envoie la fiche complète à chaque question (~30 K tokens d'input).
**Après** : on retrieve les 4-6 chunks les plus pertinents (~2-3 K tokens).

### Pipeline d'ingestion (1 fois par cours)

1. À l'upload d'une fiche PDF dans l'admin :
   - parser le PDF avec `pdf-parse` ou équivalent
   - découper en chunks de **400-600 tokens** avec **chevauchement de 80 tokens**
     (préserver les paragraphes — utiliser `RecursiveCharacterTextSplitter`)
2. Pour chaque chunk : appel embeddings → vecteur 1024 dim
3. Stocker dans Supabase :

```sql
create table cours_chunks (
  id uuid primary key default gen_random_uuid(),
  cours_id uuid references cours(id) on delete cascade,
  chunk_index int not null,
  content text not null,
  token_count int not null,
  embedding vector(1024)
);
create index on cours_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);
```

4. Idem pour les QCM (recto+verso de chaque item) et les flashcards (recto+verso) :
   c'est gratuit et ça augmente le rappel.

**Coût d'ingestion** : ~0,03 € pour seeder tous les collèges EVC en une fois.

### Retrieval à chaque question

```ts
// Pseudo-code
const qEmbed = await embed(question);
const { data: chunks } = await supabase.rpc('match_chunks', {
  query_embedding: qEmbed,
  match_count: 5,
  cours_id_filter: coursId, // strict : on ne sort PAS du cours visé
});
```

Et la fonction SQL :
```sql
create function match_chunks(query_embedding vector(1024), match_count int, cours_id_filter uuid)
returns table(id uuid, content text, similarity float)
language sql stable as $$
  select id, content, 1 - (embedding <=> query_embedding) as similarity
  from cours_chunks
  where cours_id = cours_id_filter
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

**Économie** : input divisé par ~10.

---

## 2. Modèle : Haiku 4.5 par défaut

| Modèle | Input ($/1M) | Output ($/1M) |
|---|---|---|
| Sonnet 4.6 | 3,00 | 15,00 |
| **Haiku 4.5** | **0,80** | **4,00** |

Pour répondre à une question d'EVC à partir d'un contexte fourni, Haiku 4.5
est **plus que capable**. Sonnet reste utile pour :
- la génération de QCM/flashcards en admin (déjà en place)
- un bouton optionnel « Réponse plus détaillée » côté élève
  (rare, ~5 % du volume)

Dans `src/lib/ai/anthropic.ts`, changer le modèle par défaut à
`claude-haiku-4-5` pour l'endpoint forum/assistant uniquement.

---

## 3. Prompt caching (Anthropic)

Tout ce qui est constant entre 2 questions doit être **cacheable** :

```ts
const response = await anthropic.messages.create({
  model: 'claude-haiku-4-5',
  max_tokens: 600,
  system: [
    {
      type: 'text',
      text: SYSTEM_PROMPT_FOREVER, // règles, format, ton
      cache_control: { type: 'ephemeral' },
    },
  ],
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: contextBlock, // chunks retrieved
          cache_control: { type: 'ephemeral' },
        },
        { type: 'text', text: `Question : ${question}` },
      ],
    },
  ],
});
```

- Le **system prompt** est constant → cached 100 %
- Le **bloc de chunks** est partiellement cacheable si on ordonne par
  pertinence stable (les chunks fréquents seront servis en hit)

**Tarif cache hit** : 10 % du prix normal. Sur Haiku, ça tombe à
`$0.08 / 1M input tokens` pour la partie cachée.

---

## 4. Cache sémantique des réponses

Les étudiants posent souvent les **mêmes questions**. Avant d'appeler l'API,
on regarde si une question similaire (≥ 0,92 cosinus) a déjà reçu une réponse
sur ce cours dans les 30 derniers jours.

```sql
create table qa_cache (
  id uuid primary key default gen_random_uuid(),
  cours_id uuid not null references cours(id) on delete cascade,
  question text not null,
  question_embedding vector(1024) not null,
  answer text not null,
  model text not null,
  created_at timestamptz default now()
);
create index on qa_cache using ivfflat (question_embedding vector_cosine_ops);
```

Logique côté `app/api/qa/ask/route.ts` :
```ts
const qEmbed = await embed(question);
const { data: hit } = await supabase.rpc('find_cached_answer', {
  query_embedding: qEmbed,
  cours_id_filter: coursId,
  min_similarity: 0.92,
  max_age_days: 30,
});
if (hit?.length) return hit[0].answer; // 0 appel API
// sinon → appel Claude + cache de la réponse
```

**Gain** : 30-40 % d'appels en moins après 3 mois (étudiants qui répètent
les questions classiques d'un cours).

---

## 5. Garde-fous anti-hallucination

C'est la **priorité absolue** pour du contenu médical. Trois couches.

### Couche 1 — System prompt verrouillé

```
Tu es un assistant d'apprentissage médical pour le concours EVC. Tu réponds
UNIQUEMENT à partir des extraits de cours fournis ci-dessous. Si l'information
demandée ne figure pas explicitement dans ces extraits :
- réponds EXACTEMENT : « Cette information ne figure pas dans le cours.
  Pose ta question à un professeur via le forum. »
- ne propose AUCUNE supposition, aucune connaissance générale, aucune analogie.

Règles strictes :
1. Ne JAMAIS recommander de posologie, de diagnostic, ou de conduite à tenir
   en dehors de ce qui est textuellement écrit dans les extraits.
2. Citer la source en fin de réponse : « (source : <titre du chunk>) ».
3. Si la question demande un avis personnel ou un cas clinique réel, refuser
   et rappeler qu'il s'agit d'un outil de révision, pas d'un avis médical.
4. Format : 3-6 lignes maximum, structuré en puces si plus d'un point.
```

### Couche 2 — Filtre de retrieval

Si la similarité du **meilleur chunk** retrieved est < 0,70, on **n'appelle
même pas Claude** et on renvoie directement l'abstention. Cela évite que le
modèle « brode » sur des chunks hors sujet.

```ts
const best = chunks[0]?.similarity ?? 0;
if (best < 0.70) {
  return { answer: ABSTENTION_MESSAGE, source: null };
}
```

### Couche 3 — Vérification du grounding (optionnel mais recommandé)

Après la réponse de Haiku, on vérifie chaque assertion factuelle :
- soit en demandant au modèle de **citer la phrase du chunk** qui justifie
  chaque puce (et on regex-match la citation dans les chunks fournis)
- soit en passant la réponse + chunks à un **second appel Haiku** ultra-court
  (~100 tokens output) qui répond `OK` / `NON_GROUNDED`. Si `NON_GROUNDED`,
  on remplace par l'abstention.

Coût d'un appel de vérif : ~0,001 € → négligeable, gain énorme en confiance.

### Couche 4 — Disclaimer permanent dans l'UI

Sous chaque réponse IA :
> « Les réponses générées par IA sont basées uniquement sur tes cours.
> Pour un cas clinique, une posologie ou un avis médical, consulte
> systématiquement un professionnel. »

---

## 6. Budgets serrés

Dans `callClaude`, imposer :

```ts
{
  max_tokens: 600,           // réponse forum
  temperature: 0.2,          // pas de créativité
  stop_sequences: ['\n\n\n'],
}
```

Et rejeter côté client toute question > 500 tokens en input
(l'élève reformule).

---

## 7. Monitoring

Étendre la table `ai_generations` existante (déjà utilisée pour les QCM/flashcards admin) au forum :

```sql
alter table ai_generations add column if not exists feature text default 'admin_gen';
-- 'admin_gen' | 'forum_qa' | 'assistant_chat'
```

Dashboard /admin/facturation : graphique mensuel par feature, alerte si
> 25 € sur le mois en cours.

---

## Coût mensuel projeté (3000 q/mois)

| Poste | Quantité | Tarif | Coût |
|---|---:|---:|---:|
| Embeddings questions | 3000 × 100 tk | 0,02 €/M | 0,01 € |
| Embeddings cours (one-shot) | déjà fait | — | 0 € |
| Haiku input cacheable (cached 80 %) | 3000 × 2,5K × 0,8 | 0,08 €/M | 0,48 € |
| Haiku input non-cached (20 %) | 3000 × 2,5K × 0,2 | 0,80 €/M | 1,20 € |
| Haiku output | 3000 × 400 tk | 4,00 €/M | 4,80 € |
| Vérif grounding (couche 3) | 3000 × 200 tk in/100 tk out | Haiku | ~1,20 € |
| Cache sémantique hits (35 %) | 1050 questions économisées | — | -2,50 € |
| **TOTAL** | | | **~5–7 €/mois** |

Avec une marge de sécurité × 2 (pics, retries, debug) → **prévoir 15 €/mois**.

---

## Plan d'implémentation (par ordre)

1. **Couche 1 (system prompt + abstention)** — 1 h, gain immédiat sur la qualité.
2. **Switch Haiku 4.5 sur les endpoints forum/QA** — 30 min, gain de 10×.
3. **Pipeline RAG (chunks + pgvector + retrieval)** — 1 jour.
4. **Prompt caching** — 1 h, gain de 10× sur l'input répété.
5. **Cache sémantique des réponses** — 2 h.
6. **Couche 3 — vérification de grounding** — 2 h.
7. **Monitoring `ai_generations` étendu** — 1 h.

Total : ~2 jours de dev pour passer de 300-500 €/mois à 10-15 €/mois,
avec un filet anti-hallucination robuste.
