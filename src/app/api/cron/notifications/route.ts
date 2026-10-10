import { NextResponse } from 'next/server';
import { annoncerNouveauxContenus, envoyerEmailsImmediats, envoyerRecapitulatifs, rappelerSeances } from '@/lib/notifications/balayage';
import { heartbeat, journaliser } from '@/lib/echanges/serveur/base';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * Centre de notifications — toutes les 5 minutes (vercel.json) : nouveaux
 * contenus publiés, rappels des séances en direct, e-mails immédiats, puis
 * récapitulatif du soir à l'heure choisie.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET ?? process.env.CAMPAIGN_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const debut = Date.now();
  const now = new Date();
  const resultat: Record<string, unknown> = {};
  const etape = async (nom: string, f: () => Promise<unknown>) => {
    try {
      resultat[nom] = await f();
    } catch (e) {
      resultat[nom] = { erreur: String(e).slice(0, 300) };
      await journaliser('erreur', 'notification', `Étape « ${nom} » en échec`, { erreur: String(e).slice(0, 500) });
    }
  };
  await etape('contenus', () => annoncerNouveauxContenus(now));
  await etape('rappels', () => rappelerSeances(now));
  await etape('emails', () => envoyerEmailsImmediats());
  await etape('recapitulatifs', () => envoyerRecapitulatifs(now));
  await heartbeat('notifications', debut, resultat);
  return NextResponse.json({ ok: true, resultat });
}
