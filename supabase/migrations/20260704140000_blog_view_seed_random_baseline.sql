-- Compteur de lecteurs du blog : « compte vraiment tout » + amorçage aléatoire.
--
-- • Chaque visite d'un article incrémente réellement le compteur (+1).
-- • Un article « sans compteur » (1re visite → nouvelle ligne) est amorcé avec
--   un nombre aléatoire entre 50 et 150 lecteurs, comme demandé.
--
-- Le tout est porté par la fonction RPC increment_blog_view(p_slug) appelée par
-- /api/blog/view. Idempotent (create table if not exists + create or replace).

create table if not exists public.blog_views (
  slug text primary key,
  view_count integer not null default 0,
  updated_at timestamptz not null default now()
);

create or replace function public.increment_blog_view(p_slug text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  insert into public.blog_views (slug, view_count, updated_at)
  values (p_slug, floor(random() * 101)::int + 50, now())  -- amorçage 50–150
  on conflict (slug)
  do update set view_count = public.blog_views.view_count + 1,  -- +1 par visite
                updated_at = now()
  returning view_count into v_count;
  return v_count;
end;
$$;

grant execute on function public.increment_blog_view(text) to anon, authenticated, service_role;
