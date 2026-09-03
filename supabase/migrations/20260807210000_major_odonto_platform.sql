-- Major Odontologie — arborescence plateforme (faculté + collège mère + item 01)
-- Projet Supabase partagé Major ECN.

insert into public.facultes (id, nom, ville)
values ('major-odonto', 'Major Odontologie', 'France')
on conflict (id) do update set nom = excluded.nom, ville = excluded.ville;

insert into public.semestres (id, faculte_id, numero, label)
values ('odonto-s1', 'major-odonto', 1, 'Programme Odontologie')
on conflict (id) do update set label = excluded.label, faculte_id = excluded.faculte_id;

insert into public.matieres (id, semestre_id, nom, icon_key, color_hex, order_index, parent_matiere_id)
values (
  'col-odontologie',
  'odonto-s1',
  'Odontologie',
  'tooth',
  '#1B5FB8',
  0,
  null
)
on conflict (id) do update set
  nom = excluded.nom,
  color_hex = excluded.color_hex,
  semestre_id = excluded.semestre_id,
  order_index = excluded.order_index;

insert into public.cours (id, matiere_id, titre, description, order_index, importance, access_type)
values (
  'a0110001-0d01-4000-8000-000000000001',
  'col-odontologie',
  'Item 01 · Recueil des éléments constitutifs du bilan diagnostique',
  'Questionnaire médical, anamnèse, observation clinique, examens complémentaires. Source : Réhabilitation prothétique oro-faciale, partie 1, p. 11-18.',
  1,
  5,
  'all'
)
on conflict (id) do update set
  titre = excluded.titre,
  description = excluded.description,
  matiere_id = excluded.matiere_id,
  importance = excluded.importance;
