-- =============================================================================
-- Blog CMS : table blog_posts + bucket storage blog-images + RLS
-- Permet de créer/éditer des articles depuis /admin/blog. Les articles publiés
-- s'affichent sur /blog et /blog/[slug], rendus par le même gabarit premium
-- (ArticleRich) que les articles statiques : le contenu est un tableau de blocs
-- (Block[]) stocké en JSONB, identique au type src/lib/data/blog-content/types.ts.
-- =============================================================================

create table if not exists public.blog_posts (
  id               uuid primary key default gen_random_uuid(),
  slug             text not null unique,
  title            text not null,
  excerpt          text not null default '',
  category         text not null default 'conseils-methodologie'
                     check (category in (
                       'epreuves-evc','candidature-dossier','exercice-medical',
                       'carriere-remuneration','medecins-etrangers',
                       'conseils-methodologie','specialites'
                     )),
  reading_minutes  integer not null default 5 check (reading_minutes between 1 and 120),
  hero_image       text,
  content          jsonb not null default '[]'::jsonb,
  status           text not null default 'draft' check (status in ('draft','published')),
  featured         boolean not null default false,
  published_at     date,
  author_id        uuid references public.profiles(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

comment on table public.blog_posts is
  'Articles de blog gérés depuis /admin/blog. content = Block[] (JSONB) rendu par ArticleRich.';

create index if not exists blog_posts_status_pub_idx
  on public.blog_posts (status, published_at desc);
create index if not exists blog_posts_category_idx
  on public.blog_posts (category);

-- updated_at auto ---------------------------------------------------------------
create or replace function public.blog_posts_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.blog_posts_touch_updated_at();

-- RLS ---------------------------------------------------------------------------
alter table public.blog_posts enable row level security;

-- Lecture publique : uniquement les articles publiés et dont la date est passée.
drop policy if exists blog_posts_public_read on public.blog_posts;
create policy blog_posts_public_read on public.blog_posts
  for select
  using (
    status = 'published'
    and (published_at is null or published_at <= current_date)
  );

-- Les admins voient et gèrent tout (brouillons inclus).
drop policy if exists blog_posts_admin_all on public.blog_posts;
create policy blog_posts_admin_all on public.blog_posts
  for all
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- Bucket images de blog (public en lecture, écriture réservée aux admins) --------
insert into storage.buckets (id, name, public) values ('blog-images','blog-images',true)
on conflict (id) do nothing;

drop policy if exists "storage_blog_images_public_read" on storage.objects;
create policy "storage_blog_images_public_read" on storage.objects
  for select to public using (bucket_id = 'blog-images');

drop policy if exists "storage_blog_images_admin_write" on storage.objects;
create policy "storage_blog_images_admin_write" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'blog-images' and public.current_role() = 'admin');

drop policy if exists "storage_blog_images_admin_update" on storage.objects;
create policy "storage_blog_images_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'blog-images' and public.current_role() = 'admin')
  with check (bucket_id = 'blog-images' and public.current_role() = 'admin');

drop policy if exists "storage_blog_images_admin_delete" on storage.objects;
create policy "storage_blog_images_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'blog-images' and public.current_role() = 'admin');
