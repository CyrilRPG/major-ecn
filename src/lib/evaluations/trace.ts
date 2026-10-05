import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Client service-role dont chaque écriture est SIGNÉE pour le journal des
 * évaluations : les déclencheurs de la base lisent `x-eval-auteur` et
 * `x-eval-motif` (base64, accents compris) — seulement sur une requête
 * service-role, jamais sur celle d'un élève qui pourrait les forger.
 *
 * À réserver aux tables NON cloisonnées par faculté (copies d'épreuve,
 * sessions de Check-up…) : ce client brut ne pose pas le filtre `faculte_id`.
 */
export function clientSigne(auteur: string, motif: string) {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY manquante');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { 'x-eval-auteur': auteur, 'x-eval-motif': Buffer.from(motif, 'utf8').toString('base64') } },
  });
}

export const MOTIF_AUTO_EVALUATION = 'Auto-évaluation d’une question rédactionnelle modifiée par l’élève après correction';
