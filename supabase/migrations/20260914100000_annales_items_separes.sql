-- Annales EVC : un item « Annales - <Collège> » distinct de « Révisions - <Collège> »
-- (demande de Cyril, 14/09/2026) pour que les élèves trouvent les annales d'un
-- coup d'œil dans la liste des items. Migration de DONNÉES (appliquée en
-- production via le MCP Supabase le 14/09/2026), rejouable sans effet.
--
--  1. Items « Révisions - X » qui ne contiennent QUE des annales (aucune autre
--     série, ni vidéo, ni fiche, ni flashcard) : simplement renommés.
--  2. Items « Révisions - X » mêlant annales et autre contenu : un nouvel item
--     « Annales - X » est créé (même collège, même rang, mêmes droits) et les
--     séries d'annales (libellé « Annales - … ») y sont déplacées. Les tentatives
--     des élèves suivent la série, rien n'est perdu.
--     Facturation IA : l'item créé est rattaché (linked_to_cours_id) à l'item
--     d'origine UNIQUEMENT quand celui-ci conserve d'autres séries — sinon la
--     ligne de facturation des annales passerait à zéro d'un côté et
--     reviendrait de l'autre : le total reste identique.
--
-- Côté application : un item d'annales ouvre directement l'onglet DP · QI, sans
-- autre onglet (src/lib/data/annales.ts, estItemAnnales).

-- 1. Renommages (items d'annales pures)
update public.cours c
set titre = 'Annales - ' || m.nom, updated_at = now()
from public.matieres m
where m.id = c.matiere_id
  and c.id in (
    '40391f80-7555-4c29-af31-caac2fda8ea9', -- Anesthésie-Réanimation
    '9d401a30-ec3f-40cc-81a8-1b0ffc71054c', -- Cardiologie
    '1bcd3a37-7cdd-4a52-a918-3646fedcbb03', -- Gynécologie-obstétrique
    '0ecda29c-e03b-4613-8e54-742965e6a2bd', -- Orthopédie
    '3429f7a2-31ae-4f86-91d2-9187aab285f9'  -- Pneumologie
  )
  and c.titre ilike 'Révisions - %';

-- 2. Scissions (annales + autre contenu)
do $$
declare
  src record;
  nouveau uuid;
  restantes int;
begin
  for src in
    select c.*, m.nom as matiere_nom
    from public.cours c join public.matieres m on m.id = c.matiere_id
    where c.id in (
      'ea444fe7-161a-469a-a626-363039ee9fde', -- Gériatrie
      'c82d00a1-563f-4f67-9f89-1b1e134a8551', -- Médecine d’urgence
      '656b7e46-ef83-4b00-9980-dc392cec702a', -- Pédiatrie
      'f041c116-19cf-4aac-a363-7602d675112a'  -- Psychiatrie
    )
  loop
    -- Rejouable : rien à faire si l'item d'annales existe déjà dans ce collège.
    if exists (select 1 from public.cours x where x.matiere_id = src.matiere_id and x.titre = 'Annales - ' || src.matiere_nom) then
      continue;
    end if;
    select count(*) into restantes from public.qcm_series s where s.cours_id = src.id and s.label !~* '^annales?\y';
    insert into public.cours (matiere_id, titre, description, order_index, access_type, importance, hidden_blocks, linked_to_cours_id)
    values (src.matiere_id, 'Annales - ' || src.matiere_nom, null, src.order_index, src.access_type, src.importance, src.hidden_blocks,
            case when restantes > 0 then src.id else null end)
    returning id into nouveau;
    update public.qcm_series set cours_id = nouveau
    where cours_id = src.id and label ~* '^annales?\y';
  end loop;
end $$;
