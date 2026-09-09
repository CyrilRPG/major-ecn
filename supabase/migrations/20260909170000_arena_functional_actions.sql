-- Marks belong to the saved attempt, so they survive browser/session changes.
create table public.arena_question_marks (
  attempt_id uuid not null references public.arena_attempts(id) on delete cascade,
  question_id uuid not null references public.arena_questions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (attempt_id, question_id)
);
alter table public.arena_question_marks enable row level security;
revoke all on public.arena_question_marks from anon, authenticated;
grant all on public.arena_question_marks to service_role;

-- Serialize answers from multiple tabs. The immutable order is chosen at start.
create function public.arena_guard_answer_order() returns trigger
language plpgsql set search_path = public as $$
declare a public.arena_attempts%rowtype; next_id uuid;
begin
  select * into strict a from public.arena_attempts where id = new.attempt_id for update;
  -- Let the existing UNIQUE constraint handle an idempotent retry.
  if exists (select 1 from public.arena_answers where attempt_id = a.id and question_id = new.question_id) then return new; end if;
  if a.status <> 'in_progress' then raise exception 'Cette manche est terminée.' using errcode = '23514'; end if;
  select q.id into next_id from unnest(a.question_order) with ordinality q(id, n)
    where not exists (select 1 from public.arena_answers b where b.attempt_id = a.id and b.question_id = q.id)
    order by q.n limit 1;
  if new.question_id is distinct from next_id then
    raise exception 'Validez la question en cours avant de continuer.' using errcode = '23514';
  end if;
  return new;
end; $$;
create trigger arena_guard_answer_order before insert on public.arena_answers
  for each row execute function public.arena_guard_answer_order();
