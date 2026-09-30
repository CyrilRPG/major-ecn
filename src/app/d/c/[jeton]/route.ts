import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { enregistrerOpposition } from '@/lib/decouverte/serveur';
import { lireJetonCampagne } from '@/lib/decouverte/jetons';
import { ENTETES_PAGE, masquerEmail, pagePublique } from '@/lib/decouverte/pages';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * /d/c/<destinataire>.<signature> — désinscription de la campagne de
 * bienvenue J1-J7 (remplace l'ancien lien « mailto »). Même effet qu'une
 * désinscription des relances : opposition durable + campagne coupée.
 * GET = confirmation ; POST formulaire ou « List-Unsubscribe=One-Click ».
 */
async function destinataire(jeton: string): Promise<{ id: string; email: string } | null> {
  const id = lireJetonCampagne(jeton);
  if (!id) return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (createAdminClient() as any).from('campaign_recipients').select('id, email').eq('id', id).maybeSingle();
  return (data as { id: string; email: string } | null) ?? null;
}

function page(titre: string, paragraphes: string[], status = 200, action?: string) {
  const retour = { genre: 'lien' as const, href: '/', libelle: 'Revenir sur Major ECN', secondaire: true };
  return new NextResponse(pagePublique({
    surtitre: 'Préférences e-mail', titre, paragraphes,
    boutons: action ? [{ genre: 'formulaire', action, libelle: 'Confirmer ma désinscription', champs: { confirmer: '1' } }, retour] : [retour],
  }), { status, headers: ENTETES_PAGE });
}

export async function GET(_req: Request, ctx: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await ctx.params;
  const d = await destinataire(jeton).catch(() => null);
  if (!d) return page('Lien de désinscription invalide', ['Écrivez à contact@major-ecn.fr : nous vous désinscrirons.'], 404);
  return page('Se désinscrire des e-mails Major ECN', [`Vous ne recevrez plus nos e-mails d’information à l’adresse ${masquerEmail(d.email)}.`], 200, `/d/c/${jeton}`);
}

export async function POST(req: Request, ctx: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await ctx.params;
  const oneClick = /List-Unsubscribe=One-Click/i.test(await req.text().catch(() => ''));
  try {
    const d = await destinataire(jeton);
    if (!d) return oneClick ? new NextResponse('lien inconnu', { status: 404 }) : page('Lien de désinscription invalide', ['Écrivez à contact@major-ecn.fr : nous vous désinscrirons.'], 404);
    await enregistrerOpposition({ email: d.email, source: 'campagne', commentaire: oneClick ? 'Désinscription en un clic (campagne J1-J7)' : 'Lien de désinscription (campagne J1-J7)' });
    if (oneClick) return new NextResponse('ok', { headers: { 'Cache-Control': 'no-store' } });
    return page('Votre désinscription est confirmée', ['Vous ne recevrez plus nos e-mails d’information à cette adresse. Cette demande est définitive : nous ne vous réinscrirons pas automatiquement.']);
  } catch (e) {
    console.error('[d/c]', e instanceof Error ? e.message : e);
    return oneClick ? new NextResponse('erreur', { status: 503 }) : page('Désinscription non enregistrée', ['Réessayez ou écrivez à contact@major-ecn.fr.'], 503);
  }
}
