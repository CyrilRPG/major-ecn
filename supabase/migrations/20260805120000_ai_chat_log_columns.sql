-- Ajoute les colonnes nécessaires pour stocker le contenu des échanges
-- assistant IA (question/réponse) et l'identité de l'élève, afin de les
-- afficher dans l'onglet admin « Questions IA ».
alter table public.ai_generations
  add column if not exists user_id      uuid references auth.users(id) on delete set null,
  add column if not exists user_pseudo   text,
  add column if not exists user_offer    text,
  add column if not exists user_question text,
  add column if not exists ai_answer     text,
  add column if not exists cours_titre   text;

-- Index pour la requête admin (feature + date décroissante).
create index if not exists idx_ai_generations_chat
  on public.ai_generations (feature, created_at desc)
  where feature = 'assistant_chat' and status = 'success';
