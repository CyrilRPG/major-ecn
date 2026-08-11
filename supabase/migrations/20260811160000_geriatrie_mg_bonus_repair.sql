-- Répare le bonus « Gériatrie → Médecine générale » (2026-08-11).
--
-- Les backfills 20260805150000 / 20260805170000 étaient ponctuels. La route
-- admin `update-student` ne ré-appliquait le bonus qu'à la TRANSITION
-- « pas de gériatrie » → « gériatrie » : toute ré-édition d'un élève déjà
-- inscrit en Gériatrie (changement de formule, de voie, du téléphone…)
-- réécrivait `colleges`/`cours` depuis le seul formulaire admin, effaçant
-- `col-medecine-generale`, les sous-collèges MG et les 60 items bonus.
--
-- Conséquence côté élève : `getNavigatorTree` ne trouvait plus
-- `col-medecine-generale` (mgIdx = -1), donc les sous-collèges MG n'étaient
-- jamais rattachés sous Gériatrie et les items bonus disparaissaient.
--
-- Cette migration reconstruit le scope de TOUS les élèves Gériatrie. Elle est
-- idempotente (union d'ensembles) et dérive les sous-collèges dynamiquement
-- depuis la table `cours`, sans liste de sous-collèges en dur.
-- La récidive est corrigée côté applicatif dans update-student/route.ts.

do $$
declare
  bonus_cours_ids text[] := array[
    'd25268e2-29a0-4096-968a-e4550282a84b','6fd7cf91-4a36-476d-a399-4d6cf3540d92',
    '1793b6dc-6d92-4f1b-9fdb-7ee9f551a278','d03249d2-d5fe-4a2a-b308-b911aa9c1569',
    '2cfbbe72-c1fd-4fa7-b881-5a3d2a65dbbc','91b03319-376a-4c6f-89e2-c4bba5bb856f',
    'd1000001-de00-4000-a000-000000000002','d1000001-de00-4000-a000-000000000003',
    'd1000001-de00-4000-a000-000000000005','d1000001-de00-4000-a000-000000000009',
    'd1000001-de00-4000-a000-000000000011',
    'c46f5ee6-2dee-4d38-93a4-413f8836a300','a7c45a98-e3ba-4fdb-acf3-e75193a7560b',
    '3b479e28-c28a-487b-b4fb-a76b9aef5a59',
    '821bdf2f-3b32-426c-a8bc-4246a2db3a13','02eb0fd9-20f5-4146-a38a-2deffc60a6dc',
    '26658a4b-f89b-4183-b24a-c6994ae8ea8d','e776a250-e816-4c0c-9c4f-605a0647c772',
    '50722171-2a18-47b1-a330-1836435a6f1b','548193b1-71fd-42cb-b1c3-363d4eb8febb',
    '431ccaf3-842b-47f4-9065-2db86d4cbe32','d5ab5e2f-4df7-48a8-8264-61aa1116993b',
    '3be03e90-b1d9-4d9c-89fe-fe0d222dc597','16f9a1ad-5f83-4d9c-abf2-a80422d3bbd9',
    '27389db3-72b1-4883-97b5-d86bd704ffd6','18a26139-a533-4a1e-8d70-a006854d9b09',
    '9e315bac-6318-4046-8aea-0f8d6f3a87e1','08582015-bfdd-4771-a3f0-cef7e4dea878',
    '6444a66f-d250-41f6-ac58-09b277c0c757','f6fb8ba0-bce4-4ce1-bf2d-93d377502c88',
    'c4424af7-1d82-41ff-8371-f33de79a02e3','5bf6ed18-d70f-422b-b267-e28fcd2f50b2',
    'ba8fc71a-c3eb-42d6-a3e1-9e9ef4de8b32','e98ffbcc-5d11-4f1b-9b23-0b18d4fdf6b0',
    'b4eaff25-3887-4d9f-9f7a-a28ca4deef25','a2561aa6-6195-4a74-8201-518018582a61',
    '6f9d18b9-a3e6-4368-9502-007277257776','3ce8a986-06cc-4831-b71d-4220ab2a04cc',
    'a6466920-bc1c-4754-b2e2-1cd8e9cea80e','0431ecdf-a9eb-4bbd-9476-bf3e5f1550da',
    '3ece1bf7-9020-497b-863a-9443fa4326f6','347c04c1-08b6-4457-aec7-7e7b0d818639',
    'f7a664a7-60dd-40e8-9757-975272aa144d','1c893317-cac4-41ab-bf7c-72a29d0c39d3',
    '93743aa0-34b6-43aa-94f0-8a33aba111bb','814be3b8-d092-4640-b533-453b0a85d2be',
    '2f5d2fcd-0b1d-42b2-9e85-017a0f2c456c',
    '5507f4ce-759b-4b10-9454-0935b745676d',
    'ef1cdd6e-c7e2-4bfd-abb0-327adf4b699d',
    'a7760386-561e-4c9c-ba13-d9e13075ca12','9e970025-d7e3-4445-8c9e-964f8b03f871',
    '5b008441-54ef-439e-b72f-c2ea82a13afb','cb0186f1-e517-4409-9d9d-43e36ef5ae82',
    '2408bcb9-6d67-4a0d-8066-4ceabae1eb78','d370b0b8-0b0c-45b5-8dfb-f303d83f7a33',
    '2ebc5f0a-dcae-4ea4-b9f0-775ffea6aeb2',
    '6ade0a63-4d55-43f8-8021-fede4822f2c0','1cc55abb-6be4-4f11-8a35-054c9472939a',
    'bce946d4-2211-4319-b92a-e57007aa8602','0cab0cb5-dbe0-4536-91c0-8a4dc1f0629d'
  ];
  r record;
  geriatrie_cours_ids text[];
  bonus_subcolleges text[];
  merged_cours text[];
  merged_colleges text[];
begin
  -- Sous-collèges MG portant réellement les items bonus (dérivés de la base).
  select coalesce(array_agg(distinct c.matiere_id), array[]::text[])
    into bonus_subcolleges
    from public.cours c
   where c.id::text = any(bonus_cours_ids);

  for r in
    select id, permission_scope
      from public.profiles
     where role = 'student'
       and permission_scope->>'type' = 'college'
       and permission_scope->'colleges' @> '"col-geriatrie"'::jsonb
  loop
    -- Tous les cours propres à Gériatrie (relus à chaque exécution pour rester
    -- valides si de nouveaux items y sont ajoutés).
    select coalesce(array_agg(id::text), array[]::text[])
      into geriatrie_cours_ids
      from public.cours
     where matiere_id = 'col-geriatrie';

    select coalesce(array_agg(distinct v), array[]::text[])
      into merged_cours
      from unnest(
        coalesce((
          select array_agg(x)
            from jsonb_array_elements_text(coalesce(r.permission_scope->'cours', '[]'::jsonb)) x
        ), array[]::text[])
        || geriatrie_cours_ids
        || bonus_cours_ids
      ) v;

    select coalesce(array_agg(distinct v), array[]::text[])
      into merged_colleges
      from unnest(
        coalesce((
          select array_agg(x)
            from jsonb_array_elements_text(coalesce(r.permission_scope->'colleges', '[]'::jsonb)) x
        ), array[]::text[])
        || array['col-medecine-generale']::text[]
        || bonus_subcolleges
      ) v;

    update public.profiles
       set permission_scope = jsonb_set(
             jsonb_set(r.permission_scope, '{colleges}', to_jsonb(merged_colleges), true),
             '{cours}', to_jsonb(merged_cours), true
           )
     where id = r.id;
  end loop;
end $$;
