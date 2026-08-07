-- Table pour les sections d'annonces génériques (compte à rebours, inscription,
-- postes, dates clés) avec un enregistrement par collège. Permet à l'admin de
-- remplir un simple input par collège au lieu de créer une annonce complète.
CREATE TABLE IF NOT EXISTS homepage_generic_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL,
  college_id TEXT NOT NULL REFERENCES matieres(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(section_key, college_id)
);

ALTER TABLE homepage_generic_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all" ON homepage_generic_data
  FOR ALL USING (public.current_role() = 'admin');

CREATE POLICY "authenticated_read" ON homepage_generic_data
  FOR SELECT USING (auth.role() = 'authenticated');
