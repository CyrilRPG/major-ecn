import { NextResponse } from 'next/server';
import { enregistrerOpposition, resoudreJeton, type LienResolu } from '@/lib/decouverte/serveur';
import { normaliserEmail } from '@/lib/decouverte/types';
import { ENTETES_PAGE, masquerEmail, pagePublique } from '@/lib/decouverte/pages';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * /d/u/<jeton> — désinscription (cahier §20).
 *  - GET : page de confirmation (un scanner qui suit le lien ne désinscrit
 *    personne) ;
 *  - POST formulaire : désinscription confirmée ;
 *  - POST « List-Unsubscribe=One-Click » (RFC 8058, bouton natif de Gmail,
 *    Outlook, Apple Mail) : désinscription immédiate, réponse 200 sans page.
 * Effet : opposition DURABLE (adresse + compte), exclusion immédiate des
 * relances et de la campagne de bienvenue J1-J7. Aucune réintégration
 * automatique. Ce lien reste actif après l'expiration du lien d'accès.
 */

function page(titre: string, paragraphes: string[], o: { status?: number; ton?: 'succes' | 'alerte'; action?: string } = {}) {
  const retour = { genre: 'lien' as const, href: '/', libelle: 'Revenir sur Major ECN', secondaire: true };
  return new NextResponse(pagePublique({
    surtitre: 'Préférences e-mail', titre, paragraphes, ton: o.ton,
    boutons: o.action ? [{ genre: 'formulaire', action: o.action, libelle: 'Confirmer ma désinscription', champs: { confirmer: '1' } }, retour] : [retour],
  }), { status: o.status ?? 200, headers: ENTETES_PAGE });
}

function adresseDe(r: LienResolu): string {
  return r.envoi.email_utilise ?? r.candidat?.auth_email ?? r.candidat?.email_actuel ?? '';
}

async function desinscrire(r: LienResolu, source: 'lien_desinscription' | 'one_click') {
  const emails = new Set([adresseDe(r), r.candidat?.auth_email ?? '', r.candidat?.email_actuel ?? ''].map(normaliserEmail).filter(Boolean));
  for (const email of emails) {
    await enregistrerOpposition({ email, userId: r.candidat?.user_id ?? null, candidatId: r.candidat?.id ?? null, source, envoiId: r.envoi.id });
  }
}

export async function GET(_req: Request, ctx: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await ctx.params;
  try {
    const r = await resoudreJeton(jeton);
    if (!r) return page('Lien de désinscription invalide', ['Pour ne plus recevoir nos e-mails, répondez « STOP » à l’un d’eux ou écrivez à contact@major-ecn.fr.'], { status: 404 });
    if (r.envoi.type === 'test') return page('E-mail de test', ['Ce lien provient d’un e-mail de test : aucune désinscription n’est enregistrée.']);
    return page('Se désinscrire des e-mails Major ECN', [
      `Vous ne recevrez plus les relances et les e-mails d’information de Major ECN à l’adresse ${masquerEmail(adresseDe(r))}.`,
      'Les messages strictement liés à votre compte (sécurité, lien d’accès que vous demandez vous-même) restent possibles.',
    ], { action: `/d/u/${jeton}` });
  } catch (e) {
    console.error('[d/u] GET', e instanceof Error ? e.message : e);
    return page('Service momentanément indisponible', ['Réessayez dans quelques instants ou écrivez à contact@major-ecn.fr.'], { status: 503, ton: 'alerte' });
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await ctx.params;
  const oneClick = /List-Unsubscribe=One-Click/i.test(await req.text().catch(() => ''));
  try {
    const r = await resoudreJeton(jeton);
    if (!r) return oneClick ? new NextResponse('lien inconnu', { status: 404 }) : page('Lien de désinscription invalide', ['Écrivez à contact@major-ecn.fr : nous vous désinscrirons.'], { status: 404 });
    if (r.envoi.type === 'test') return oneClick ? new NextResponse('ok') : page('E-mail de test', ['Aucune désinscription n’est enregistrée pour un e-mail de test.']);
    await desinscrire(r, oneClick ? 'one_click' : 'lien_desinscription');
    if (oneClick) return new NextResponse('ok', { status: 200, headers: { 'Cache-Control': 'no-store' } });
    return page('Votre désinscription est confirmée', [
      'Vous ne recevrez plus nos relances ni nos e-mails d’information à cette adresse. Cette demande est définitive : nous ne vous réinscrirons pas automatiquement.',
      'Votre espace découverte reste accessible si vous souhaitez vous connecter.',
    ], { ton: 'succes' });
  } catch (e) {
    console.error('[d/u] POST', e instanceof Error ? e.message : e);
    return oneClick ? new NextResponse('erreur', { status: 503 }) : page('Désinscription non enregistrée', ['Un incident nous empêche d’enregistrer votre demande. Réessayez ou écrivez à contact@major-ecn.fr.'], { status: 503, ton: 'alerte' });
  }
}
