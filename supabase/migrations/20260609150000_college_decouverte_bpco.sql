-- =============================================================================
-- Migration : Création du collège "Découverte" + cours BPCO (Pneumologie)
--   • Nouveau collège visible par tous les étudiants en espace découverte
--   • Cours BPCO (Pneumologie) avec contenu vide (placeholder pour démo)
--   • Tous les autres collèges ont leurs contenus marqués 'specific' = verrou
--     (à afficher avec cadenas + popup côté étudiant)
-- =============================================================================

do $$
declare
  v_semestre_id text;
  v_decouverte_id text := 'decouverte';
  v_bpco_id uuid;
begin
  -- 1) Récupérer un semestre par défaut (le premier disponible)
  select id into v_semestre_id from public.semestres limit 1;

  -- Si aucun semestre n'existe encore : créer une faculté + semestre par défaut
  if v_semestre_id is null then
    insert into public.facultes (id, nom, ville)
    values ('major-ecn-paris', 'Major ECN', 'Paris')
    on conflict (id) do nothing;

    insert into public.semestres (id, faculte_id, numero, label)
    values ('major-ecn-paris-s1', 'major-ecn-paris', 1, 'Préparation EVC')
    on conflict (id) do nothing;

    v_semestre_id := 'major-ecn-paris-s1';
  end if;

  -- 2) Créer le collège "Découverte"
  insert into public.matieres (id, semestre_id, nom, icon_key, color_hex, order_index, access_type)
  values (
    v_decouverte_id,
    v_semestre_id,
    'Découverte',
    'rocket',
    '#C0112E',
    -1,             -- premier (avant les autres)
    'all'
  )
  on conflict (id) do update set
    nom = 'Découverte',
    icon_key = 'rocket',
    color_hex = '#C0112E',
    order_index = -1;

  -- 3) Créer le cours BPCO (Pneumologie) dans le collège Découverte
  --    Pas de linked_to_cours_id : c'est un contenu propre (placeholder).
  select id into v_bpco_id
    from public.cours
   where matiere_id = v_decouverte_id
     and titre = 'BPCO (Pneumologie)'
   limit 1;

  if v_bpco_id is null then
    insert into public.cours (matiere_id, titre, description, order_index, access_type)
    values (
      v_decouverte_id,
      'BPCO (Pneumologie)',
      'Aperçu pédagogique d''un item EVC : QCM corrigés, fiche synthétique, flashcards et cas clinique.',
      0,
      'all'
    )
    returning id into v_bpco_id;

    raise notice 'Cours BPCO créé : %', v_bpco_id;
  end if;

  raise notice 'Collège Découverte prêt : %', v_decouverte_id;
end $$;

-- =============================================================================
-- ROLLBACK (manuel) :
--   delete from public.cours where matiere_id = 'decouverte';
--   delete from public.matieres where id = 'decouverte';
-- =============================================================================
