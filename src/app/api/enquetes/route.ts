import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/auth/bearer';
import { envoiBloquant } from '@/lib/qualite/blocage';
import { envoisDuCandidat } from '@/lib/qualite/serveur/soumission';
import { qdb } from '@/lib/qualite/serveur/base';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Questionnaires du candidat connecté (web par cookie, application par Bearer) :
 * à compléter, puis complétés ; et le questionnaire bloquant éventuel.
 */
export async function GET(req: Request) {
  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const envois = await envoisDuCandidat(auth.user.id);
  const { data: etat } = await qdb().from('qualite_candidats').select('sans_blocage').eq('user_id', auth.user.id).maybeSingle();
  const bloquant = envoiBloquant(envois, Date.now(), !!(etat as { sans_blocage?: boolean } | null)?.sans_blocage);
  return NextResponse.json({
    bloquant: bloquant ? { id: bloquant.id, blocking_scope: bloquant.blocking_scope } : null,
    enquetes: envois.map((e) => ({
      id: e.id, famille: e.famille, titre: e.titre, statut: e.statut, obligatoire: e.obligatoire,
      programme_pour: e.programme_pour, echeance: e.echeance, complete_at: e.complete_at,
    })),
  });
}
