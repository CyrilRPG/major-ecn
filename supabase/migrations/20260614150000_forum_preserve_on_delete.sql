-- =============================================================================
-- Migration : préserver les questions/réponses du forum lors de la suppression
--             d'un compte (élève ou professeur). On garde le contenu, on
--             remplace simplement l'auteur par "ancien intervenant".
-- =============================================================================
-- Le code de l'app insère déjà `professor_name` en colonne dédiée
-- (denormalisée) sur forum_answers. On veut juste éviter que la FK ne
-- cascade-delete la ligne quand on supprime le compte côté auth.users.

do $$
begin
  -- forum_answers.professor_id → ON DELETE SET NULL
  if exists (
    select 1 from pg_constraint c
     where c.conname = 'forum_answers_professor_id_fkey'
       and c.confdeltype <> 'n'
  ) then
    alter table public.forum_answers drop constraint forum_answers_professor_id_fkey;
    alter table public.forum_answers
      add constraint forum_answers_professor_id_fkey
      foreign key (professor_id) references auth.users(id) on delete set null;
  end if;

  -- forum_questions.author_id (ou student_id, selon ce qui existe) → SET NULL
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name = 'forum_questions'
       and column_name = 'author_id'
  ) and exists (
    select 1 from pg_constraint c
     where c.conname = 'forum_questions_author_id_fkey'
       and c.confdeltype <> 'n'
  ) then
    alter table public.forum_questions drop constraint forum_questions_author_id_fkey;
    alter table public.forum_questions
      add constraint forum_questions_author_id_fkey
      foreign key (author_id) references auth.users(id) on delete set null;
  end if;

  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name = 'forum_questions'
       and column_name = 'student_id'
  ) and exists (
    select 1 from pg_constraint c
     where c.conname = 'forum_questions_student_id_fkey'
       and c.confdeltype <> 'n'
  ) then
    alter table public.forum_questions drop constraint forum_questions_student_id_fkey;
    alter table public.forum_questions
      add constraint forum_questions_student_id_fkey
      foreign key (student_id) references auth.users(id) on delete set null;
  end if;
exception
  when undefined_table then
    raise notice 'forum_questions / forum_answers absentes — migration ignorée.';
  when undefined_object then
    raise notice 'Contrainte FK absente — migration ignorée.';
end $$;

-- S'assurer qu'on a une colonne `professor_name` dénormalisée pour conserver
-- l'identité affichée même après suppression du compte (déjà alimentée par
-- answerQuestionAction côté serveur).
do $$
begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name = 'forum_answers'
       and column_name = 'professor_name'
  ) then
    alter table public.forum_answers add column professor_name text;
  end if;
exception
  when undefined_table then null;
end $$;
