-- Import d'articles de blog par IA (/admin/blog/ia).
--
-- Chaque génération réussie est tracée dans `ai_generations` avec
-- kind = 'blog_article' et feature = 'blog_article_generation' : c'est cette
-- ligne qui alimente la catégorie « Articles » de la facturation IA (2,50 € par
-- article généré). La contrainte de `kind` doit donc accepter la nouvelle
-- valeur, sinon l'insertion échoue et la génération n'est jamais facturée.
alter table public.ai_generations drop constraint if exists ai_generations_kind_check;
alter table public.ai_generations
  add constraint ai_generations_kind_check
  check (kind in ('flashcards', 'qcm', 'exam_grading', 'exam_generation', 'blog_article'));

-- Requête de facturation : toutes les générations d'articles réussies, du plus
-- récent au plus ancien.
create index if not exists idx_ai_generations_blog_article
  on public.ai_generations (feature, created_at desc)
  where feature = 'blog_article_generation' and status = 'success';
