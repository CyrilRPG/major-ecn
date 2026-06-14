-- =============================================================================
-- Migration : threading du forum
--   • forum_replies : permet aux élèves (et profs) de répondre dans le même
--     thread que la question, au lieu de créer une nouvelle question.
--   • La question reste l'unité parente (1 question → N answers + N replies
--     fusionnés chronologiquement à l'affichage).
-- =============================================================================

create table if not exists public.forum_replies (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.forum_questions(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null,
  -- Snapshot du rôle au moment de la rédaction, pour l'affichage post-suppression.
  author_role text not null check (author_role in ('student','professor','admin')),
  -- Snapshot du nom/pseudo affiché. Garde l'historique même si l'auteur change
  -- son pseudo ou est supprimé.
  author_name text not null,
  body text not null check (char_length(body) between 1 and 8000),
  created_at timestamptz not null default now()
);

create index if not exists forum_replies_question_idx
  on public.forum_replies(question_id, created_at);
create index if not exists forum_replies_author_idx
  on public.forum_replies(author_id);

comment on table public.forum_replies is
  'Replies (élève ou prof) attachés à une question du forum. Permet le threading sans recréer une question à chaque échange.';

-- RLS
alter table public.forum_replies enable row level security;

-- SELECT : l'auteur de la question voit toutes les replies de SA question ;
-- les staff (prof/admin) voient toutes les replies (filtrées par accès collège
-- via la jointure question côté requête) ; les autres élèves ne voient les
-- replies que si la question est `is_public = true`.
drop policy if exists forum_replies_select on public.forum_replies;
create policy forum_replies_select on public.forum_replies
  for select using (
    exists (
      select 1 from public.forum_questions q
       where q.id = forum_replies.question_id
         and (
              q.student_id = auth.uid()
           or q.is_public = true
           or exists (
                select 1 from public.profiles p
                 where p.id = auth.uid()
                   and p.role in ('professor','admin')
              )
         )
    )
  );

-- INSERT : tout user authentifié peut poster une reply sur une question qu'il
-- voit déjà (RLS SELECT). On enforce author_id = auth.uid().
drop policy if exists forum_replies_insert on public.forum_replies;
create policy forum_replies_insert on public.forum_replies
  for insert with check (
    author_id = auth.uid()
    and exists (
      select 1 from public.forum_questions q
       where q.id = forum_replies.question_id
         and (
              q.student_id = auth.uid()
           or q.is_public = true
           or exists (
                select 1 from public.profiles p
                 where p.id = auth.uid()
                   and p.role in ('professor','admin')
              )
         )
    )
  );

-- UPDATE/DELETE : l'auteur peut éditer/supprimer ses propres replies pendant
-- 30 minutes. Admin peut tout faire.
drop policy if exists forum_replies_update on public.forum_replies;
create policy forum_replies_update on public.forum_replies
  for update using (
       (author_id = auth.uid() and created_at > now() - interval '30 minutes')
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists forum_replies_delete on public.forum_replies;
create policy forum_replies_delete on public.forum_replies
  for delete using (
       author_id = auth.uid()
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );
