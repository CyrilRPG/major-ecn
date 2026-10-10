import { NextResponse } from 'next/server';
import { envoiParJeton, soumettre } from '@/lib/qualite/serveur/soumission';
import { journaliser } from '@/lib/qualite/serveur/base';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Réponse par lien sécurisé (enquête post-EVC, suivi différé) : sans connexion,
 * le jeton ne donne accès qu'à ce questionnaire.
 */
export async function POST(req: Request, { params }: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await params;
  const e = await envoiParJeton(jeton);
  if (!e) return NextResponse.json({ ok: false, error: 'Ce lien n’est plus valide.' }, { status: 404 });
  const body = await req.json().catch(() => ({})) as { reponses?: Record<string, unknown> };
  const r = await soumettre(e, body.reponses && typeof body.reponses === 'object' ? body.reponses : {}, 'lien');
  if (r.ok) await journaliser({ objet_type: 'envoi', objet_id: e.id, action: 'reponse_par_lien', user_id: e.user_id });
  return NextResponse.json(r, { status: r.ok ? 200 : 400 });
}
