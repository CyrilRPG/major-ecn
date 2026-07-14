-- Épreuves Blanches — Phase 3 : accès individuel + classement.

-- Déblocage individuel / rattrapage : fenêtre propre à un candidat.
create table if not exists public.mock_exam_access (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references public.mock_exams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  open_at timestamptz,
  close_at timestamptz,
  duration_minutes int,
  reason text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(exam_id, user_id)
);
alter table public.mock_exam_access enable row level security;
create policy mock_exam_access_admin_all on public.mock_exam_access
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');
create policy mock_exam_access_owner_read on public.mock_exam_access
  for select using (user_id = auth.uid() or public.current_role() = 'admin');

-- Classement + statistiques comparatives (agrégation cross-user, anonymisée).
create or replace function public.mock_exam_leaderboard(p_exam_id uuid)
returns jsonb
language sql
stable security definer
set search_path to 'public'
as $function$
with graded as (
  select user_id, percentage, time_spent_seconds
  from public.mock_exam_submissions
  where exam_id = p_exam_id and status = 'graded'
),
ranked as (
  select user_id, percentage, time_spent_seconds,
    rank() over (order by percentage desc, time_spent_seconds asc) as rnk,
    percent_rank() over (order by percentage asc) as pctile,
    count(*) over () as n
  from graded
)
select jsonb_build_object(
  'count', (select count(*) from graded),
  'average', (select round(avg(percentage)::numeric, 1) from graded),
  'median', (select round((percentile_cont(0.5) within group (order by percentage))::numeric, 1) from graded),
  'best', (select max(percentage) from graded),
  'worst', (select min(percentage) from graded),
  'me', (
    select jsonb_build_object('rank', rnk, 'percentage', percentage, 'n', n, 'better_than_pct', round((pctile * 100)::numeric, 0))
    from ranked where user_id = auth.uid()
  ),
  'top', (
    select jsonb_agg(jsonb_build_object('rank', rnk, 'percentage', percentage) order by rnk)
    from (select rnk, percentage from ranked order by rnk limit 10) t
  )
);
$function$;
grant execute on function public.mock_exam_leaderboard(uuid) to authenticated;
