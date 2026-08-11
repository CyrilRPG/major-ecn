-- Import d'exercices IA : brouillons privés, publication contrôlée et ciblage
-- précis de l'audience des séries importées.

alter table public.qcm_series
  add column if not exists allowed_voies text[],
  add column if not exists allowed_offers text[];

alter table public.qcm_series
  drop constraint if exists qcm_series_allowed_voies_check;
alter table public.qcm_series
  add constraint qcm_series_allowed_voies_check
  check (allowed_voies is null or allowed_voies <@ array['interne', 'externe']::text[]);

alter table public.qcm_series
  drop constraint if exists qcm_series_allowed_offers_check;
alter table public.qcm_series
  add constraint qcm_series_allowed_offers_check
  check (allowed_offers is null or allowed_offers <@ array['decouverte', 'essentiel', 'intensif', 'approfondi']::text[]);

create table if not exists public.exercise_imports (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete restrict,
  cours_id uuid not null references public.cours(id) on delete restrict,
  college_id text not null,
  voie text not null check (voie in ('interne', 'externe')),
  format text not null check (format in ('pdf', 'docx', 'txt')),
  source_mode text not null check (source_mode in ('combined', 'paired')),
  allowed_offers text[] not null check (allowed_offers <@ array['decouverte', 'essentiel', 'intensif', 'approfondi']::text[]),
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'processing', 'ready', 'publishing', 'published', 'cancelled', 'failed')),
  sujet_path text not null,
  corrige_path text,
  estimated_price_cents integer not null check (estimated_price_cents >= 0),
  billed_price_cents integer,
  model text,
  result jsonb,
  warnings jsonb not null default '[]'::jsonb,
  error_message text,
  published_serie_id uuid references public.qcm_series(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  processed_at timestamptz,
  published_at timestamptz
);

create index if not exists exercise_imports_created_at_idx on public.exercise_imports(created_at desc);
create index if not exists exercise_imports_status_idx on public.exercise_imports(status);

alter table public.exercise_imports enable row level security;
drop policy if exists exercise_imports_admin_all on public.exercise_imports;
create policy exercise_imports_admin_all on public.exercise_imports
  for all to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- Les imports ajoutent une couche de filtrage sans modifier les contenus déjà
-- publiés (colonnes NULL = comportement historique).
create or replace function public.current_offers() returns text[]
language sql stable security definer set search_path = public as $$
  select coalesce(
    nullif(array(
      select jsonb_array_elements_text(coalesce(p.permission_scope->'offers', '[]'::jsonb))
    ), array[]::text[]),
    array[coalesce(p.permission_scope->>'offer', 'decouverte')]
  )
  from public.profiles p where p.id = auth.uid()
$$;

drop policy if exists qcm_series_import_scope_restrict on public.qcm_series;
create policy qcm_series_import_scope_restrict on public.qcm_series
  as restrictive for select to public
  using (
    public.current_role() is distinct from 'student'
    or (
      (allowed_voies is null or public.current_voie() = any(allowed_voies))
      and (allowed_offers is null or allowed_offers && public.current_offers())
    )
  );

insert into storage.buckets (id, name, public)
values ('exercise-imports', 'exercise-imports', false)
on conflict (id) do nothing;

drop policy if exists exercise_imports_admin_read on storage.objects;
create policy exercise_imports_admin_read on storage.objects for select to authenticated
  using (bucket_id = 'exercise-imports' and public.current_role() = 'admin');
drop policy if exists exercise_imports_admin_insert on storage.objects;
create policy exercise_imports_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'exercise-imports' and public.current_role() = 'admin');
drop policy if exists exercise_imports_admin_delete on storage.objects;
create policy exercise_imports_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'exercise-imports' and public.current_role() = 'admin');

-- Publication atomique d'un brouillon validé. Les images binaires sont gérées
-- par le serveur avant cet appel; le payload ne contient que les URLs finales.
create or replace function public.publish_exercise_import(p_import_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_import public.exercise_imports%rowtype;
  v_serie uuid;
  v_question uuid;
  v_q jsonb;
  v_item jsonb;
  v_order integer := 0;
  v_letters text;
begin
  select * into v_import from public.exercise_imports where id = p_import_id for update;
  if not found then raise exception 'Import introuvable'; end if;
  if v_import.status = 'published' and v_import.published_serie_id is not null then return v_import.published_serie_id; end if;
  if v_import.status <> 'ready' then raise exception 'Cet import ne peut pas être publié'; end if;

  update public.exercise_imports set status = 'publishing', updated_at = now() where id = p_import_id;
  insert into public.qcm_series (cours_id, type, label, order_index, allowed_voies, allowed_offers)
  values (
    v_import.cours_id, 'qcm', v_import.title,
    coalesce((select max(order_index) + 1 from public.qcm_series where cours_id = v_import.cours_id and type = 'qcm'), 0),
    array[v_import.voie], v_import.allowed_offers
  ) returning id into v_serie;

  for v_q in select value from jsonb_array_elements(coalesce(v_import.result->'questions', '[]'::jsonb)) loop
    if v_q->>'format' = 'qcm' then
      select string_agg(value->>'lettre', '' order by value->>'lettre') into v_letters
      from jsonb_array_elements(coalesce(v_q->'items', '[]'::jsonb)) where coalesce((value->>'is_correct')::boolean, false);
    else
      v_letters := v_q->>'reponse_attendue';
    end if;
    insert into public.qcm_questions (serie_id, format, enonce, order_index, reponse_attendue, correction_generale, images)
    values (v_serie, v_q->>'format', v_q->>'enonce', v_order, coalesce(v_letters, ''), nullif(v_q->>'correction_generale', ''), '[]'::jsonb)
    returning id into v_question;
    v_order := v_order + 1;
    if v_q->>'format' = 'qcm' then
      for v_item in select value from jsonb_array_elements(coalesce(v_q->'items', '[]'::jsonb)) loop
        insert into public.qcm_items (question_id, lettre, enonce, is_correct, justification, images)
        values (v_question, v_item->>'lettre', v_item->>'enonce', coalesce((v_item->>'is_correct')::boolean, false), coalesce(v_item->>'justification', ''), '[]'::jsonb);
      end loop;
    end if;
  end loop;

  update public.exercise_imports
  set status = 'published', published_serie_id = v_serie, published_at = now(), updated_at = now()
  where id = p_import_id;
  return v_serie;
exception when others then
  update public.exercise_imports set status = 'ready', updated_at = now() where id = p_import_id;
  raise;
end;
$$;
