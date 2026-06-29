-- Adds parent_matiere_id to matieres for sub-matière nesting (e.g. Dermatologie under MG)
ALTER TABLE matieres ADD COLUMN IF NOT EXISTS parent_matiere_id text
  REFERENCES matieres(id) ON DELETE SET NULL;

-- Dermatologie as a child of Médecine Générale
INSERT INTO matieres (id, nom, icon_key, color_hex, semestre_id, order_index, parent_matiere_id)
VALUES (
  'col-dermatologie',
  'Dermatologie',
  'stethoscope',
  '#E8742C',
  (SELECT id FROM semestres WHERE faculte_id = 'major-ecn' LIMIT 1),
  99,
  'col-medecine-generale'
)
ON CONFLICT (id) DO UPDATE SET parent_matiere_id = EXCLUDED.parent_matiere_id;

-- 12 Dermatologie courses
INSERT INTO cours (id, titre, matiere_id, order_index) VALUES
  ('d1000001-de00-4000-a000-000000000001', 'Dermatoses faciales', 'col-dermatologie', 1),
  ('d1000001-de00-4000-a000-000000000002', 'Ectoparasitoses cutanées', 'col-dermatologie', 2),
  ('d1000001-de00-4000-a000-000000000003', 'Herpès cutanéo-muqueux', 'col-dermatologie', 3),
  ('d1000001-de00-4000-a000-000000000004', 'Infections cutanées bactériennes', 'col-dermatologie', 4),
  ('d1000001-de00-4000-a000-000000000005', 'Prurit', 'col-dermatologie', 5),
  ('d1000001-de00-4000-a000-000000000006', 'Psoriasis', 'col-dermatologie', 6),
  ('d1000001-de00-4000-a000-000000000007', 'Purpuras', 'col-dermatologie', 7),
  ('d1000001-de00-4000-a000-000000000008', 'Syphilis', 'col-dermatologie', 8),
  ('d1000001-de00-4000-a000-000000000009', 'Ulcère de jambe', 'col-dermatologie', 9),
  ('d1000001-de00-4000-a000-000000000010', 'Urticaire', 'col-dermatologie', 10),
  ('d1000001-de00-4000-a000-000000000011', 'Varicelle et zona', 'col-dermatologie', 11),
  ('d1000001-de00-4000-a000-000000000012', 'Acrosyndromes vasculaires', 'col-dermatologie', 12)
ON CONFLICT (id) DO NOTHING;
