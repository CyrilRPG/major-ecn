-- Plusieurs fiches de cours par item
-- ---------------------------------------------------------------------------
-- Jusqu'ici la table `fiches` portait DE FAIT une seule ligne par item : tous
-- les chemins de lecture prenaient « la plus récente ». On garde exactement la
-- même table (les fiches restent des fiches : filigrane, téléchargement staff,
-- édition HTML) mais on assume désormais plusieurs lignes par item, dans un
-- ordre choisi par l'administrateur — exactement comme `video_supports` pour
-- les supports de séance.
--
-- La PREMIÈRE fiche (order_index le plus bas) est la « fiche principale » :
-- c'est elle qu'ouvrent l'éditeur HTML, la conversion HTML → PDF et la fiche
-- éclair. Les suivantes sont des documents supplémentaires, affichés dans le
-- MÊME onglet « Fiche de cours » chez l'élève.

-- Un index UNIQUE sur cours_id verrouillait « une seule fiche par item ». Il
-- n'est référencé nulle part dans le code (aucun upsert on_conflict) : il ne
-- servait qu'à garantir l'unicité que l'on lève ici.
drop index if exists public.fiches_cours_id_unique;

alter table public.fiches
  add column if not exists order_index integer not null default 0;

-- Renumérotation propre : 0, 1, 2… par item, dans l'ordre de création.
-- (À la date de cette migration chaque item n'a qu'une fiche : tout passe à 0.)
with rangs as (
  select id,
         row_number() over (partition by cours_id order by created_at asc, id asc) - 1 as rang
  from public.fiches
)
update public.fiches f
set order_index = rangs.rang
from rangs
where rangs.id = f.id
  and f.order_index is distinct from rangs.rang;

create index if not exists fiches_cours_order_idx
  on public.fiches (cours_id, order_index);

comment on column public.fiches.order_index is
  'Ordre d''affichage dans l''onglet « Fiche de cours ». 0 = fiche principale (éditable en ligne).';
