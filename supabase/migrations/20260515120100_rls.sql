-- =============================================
-- Row Level Security
-- =============================================

create or replace function public.current_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.can_access_faculte(p_faculte_id text)
returns boolean language plpgsql stable security definer set search_path = public as $$
declare v_scope jsonb; v_role text;
begin
  select role, permission_scope into v_role, v_scope from public.profiles where id = auth.uid();
  if v_role = 'admin' then return true; end if;
  if v_scope is null then return false; end if;
  if v_scope->>'type' = 'all' then return true; end if;
  if v_scope->>'type' = 'faculty' then return v_scope->'faculties' ? p_faculte_id; end if;
  return false;
end; $$;

alter table public.profiles enable row level security;
alter table public.facultes enable row level security;
alter table public.semestres enable row level security;
alter table public.matieres enable row level security;
alter table public.cours enable row level security;
alter table public.videos enable row level security;
alter table public.fiches enable row level security;
alter table public.qcm_series enable row level security;
alter table public.qcm_questions enable row level security;
alter table public.qcm_items enable row level security;
alter table public.flashcards enable row level security;
alter table public.flashcard_reviews enable row level security;
alter table public.qcm_sessions enable row level security;
alter table public.qcm_attempts enable row level security;
alter table public.course_progress enable row level security;

-- PROFILES
create policy profiles_self_read on public.profiles
  for select using (id = auth.uid() or public.current_role() = 'admin');
create policy profiles_self_update on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));
create policy profiles_admin_all on public.profiles
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- FACULTES
create policy facultes_read on public.facultes for select using (true);
create policy facultes_admin_write on public.facultes for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- SEMESTRES
create policy semestres_read on public.semestres for select using (public.can_access_faculte(faculte_id));
create policy semestres_admin_write on public.semestres for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- MATIERES
create policy matieres_read on public.matieres for select using (
  public.can_access_faculte((select faculte_id from public.semestres where id = semestre_id))
);
create policy matieres_admin_write on public.matieres for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- COURS
create policy cours_read on public.cours for select using (
  public.can_access_faculte((select s.faculte_id from public.semestres s join public.matieres m on m.semestre_id = s.id where m.id = matiere_id))
);
create policy cours_admin_write on public.cours for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- VIDEOS / FICHES / QCM / FLASHCARDS (scope via cours)
create policy videos_read on public.videos for select using (
  public.can_access_faculte((select s.faculte_id from public.cours c join public.matieres m on m.id = c.matiere_id join public.semestres s on s.id = m.semestre_id where c.id = cours_id))
);
create policy videos_admin_write on public.videos for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy fiches_read on public.fiches for select using (
  public.can_access_faculte((select s.faculte_id from public.cours c join public.matieres m on m.id = c.matiere_id join public.semestres s on s.id = m.semestre_id where c.id = cours_id))
);
create policy fiches_admin_write on public.fiches for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy qcm_series_read on public.qcm_series for select using (
  public.can_access_faculte((select s.faculte_id from public.cours c join public.matieres m on m.id = c.matiere_id join public.semestres s on s.id = m.semestre_id where c.id = cours_id))
);
create policy qcm_series_admin_write on public.qcm_series for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy qcm_questions_read on public.qcm_questions for select using (
  exists (select 1 from public.qcm_series qs join public.cours c on c.id = qs.cours_id join public.matieres m on m.id = c.matiere_id join public.semestres s on s.id = m.semestre_id where qs.id = serie_id and public.can_access_faculte(s.faculte_id))
);
create policy qcm_questions_admin_write on public.qcm_questions for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy qcm_items_read on public.qcm_items for select using (
  exists (select 1 from public.qcm_questions q join public.qcm_series qs on qs.id = q.serie_id join public.cours c on c.id = qs.cours_id join public.matieres m on m.id = c.matiere_id join public.semestres s on s.id = m.semestre_id where q.id = question_id and public.can_access_faculte(s.faculte_id))
);
create policy qcm_items_admin_write on public.qcm_items for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

create policy flashcards_read on public.flashcards for select using (
  public.can_access_faculte((select s.faculte_id from public.cours c join public.matieres m on m.id = c.matiere_id join public.semestres s on s.id = m.semestre_id where c.id = cours_id))
);
create policy flashcards_admin_write on public.flashcards for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- TRACKING : owner only (admin can read all for stats)
create policy flashcard_reviews_owner on public.flashcard_reviews for all using (user_id = auth.uid() or public.current_role() = 'admin') with check (user_id = auth.uid());
create policy qcm_sessions_owner on public.qcm_sessions for all using (user_id = auth.uid() or public.current_role() = 'admin') with check (user_id = auth.uid());
create policy qcm_attempts_owner on public.qcm_attempts for all using (user_id = auth.uid() or public.current_role() = 'admin') with check (user_id = auth.uid());
create policy course_progress_owner on public.course_progress for all using (user_id = auth.uid() or public.current_role() = 'admin') with check (user_id = auth.uid());
