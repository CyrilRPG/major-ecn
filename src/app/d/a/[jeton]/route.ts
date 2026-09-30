import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { siteUrl } from '@/lib/email/send';
import { chargerParametres, evenement, resoudreJeton, tracerClic, type LienResolu } from '@/lib/decouverte/serveur';
import { evaluerCandidat } from '@/lib/decouverte/moteur';
import { ENTETES_PAGE, pagePublique } from '@/lib/decouverte/pages';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * /d/a/<jeton> — parcours d'accès d'un e-mail de relance (cahier §19).
 *
 * GET : page légère « Bonjour <prénom>, votre espace découverte vous attend »
 * + bouton. Le clic plateforme est tracé (première fois horodatée sur
 * l'envoi). AUCUN lien GoTrue n'est généré ici : les scanners des messageries
 * suivent les liens en GET, ils consommeraient le jeton à usage unique et
 * fausseraient la « première connexion » ; un nouveau lien GoTrue invalide en
 * outre le précédent.
 *
 * POST (vrai clic humain sur le bouton) : génération À CET INSTANT du lien
 * Supabase (invitation, ou récupération si le compte est déjà confirmé),
 * vérification immédiate côté serveur — la session est posée dans les
 * cookies, comme le fait /auth/confirm — puis choix du mot de passe
 * (/auth/setup-password). Un seul clic pour le candidat.
 *
 * Lien expiré, révoqué ou invalide : page claire « Recevoir un nouveau lien
 * d'accès » (renvoi contrôlé, limité en fréquence, tracé) et « Se connecter ».
 * Candidat déjà connecté : redirection vers /login.
 */

type Etat =
  | { cas: 'invalide' }
  | { cas: 'test' }
  | { cas: 'connecte'; r: LienResolu }
  | { cas: 'inactif'; r: LienResolu }
  | { cas: 'expire'; r: LienResolu; raison: string }
  | { cas: 'ok'; r: LienResolu };

async function diagnostiquer(jeton: string): Promise<Etat> {
  const r = await resoudreJeton(jeton);
  if (!r) return { cas: 'invalide' };
  if (!r.candidat || !r.etat || r.envoi.type === 'test') return { cas: 'test' };
  const params = await chargerParametres();
  const ev = evaluerCandidat(r.candidat, r.etat.envois.filter((e) => e.candidat_id === r.candidat!.id), params, r.etat.oppositions, { maintenant: new Date() });
  if (ev.connecteAt) return { cas: 'connecte', r };
  if (ev.compte !== 'ok') return { cas: 'inactif', r };
  if (r.lien.revoque_at) return { cas: 'expire', r, raison: 'Ce lien d’accès a été désactivé.' };
  if (Date.parse(r.lien.expire_at) < Date.now()) return { cas: 'expire', r, raison: 'Ce lien d’accès a expiré.' };
  return { cas: 'ok', r };
}

function html(corps: string, status = 200) {
  return new NextResponse(corps, { status, headers: ENTETES_PAGE });
}

function pageInvalide() {
  return html(pagePublique({
    surtitre: 'Offre découverte', titre: 'Ce lien n’est pas valide',
    paragraphes: ['Le lien que vous avez suivi est incomplet ou n’existe pas.', 'Si vous avez déjà choisi votre mot de passe, connectez-vous directement. Sinon, répondez simplement à l’un de nos e-mails : nous vous renverrons un accès.'],
    boutons: [{ genre: 'lien', href: '/login', libelle: 'Se connecter' }],
  }), 404);
}

function pageExpiree(jeton: string, raison: string) {
  return html(pagePublique({
    surtitre: 'Offre découverte', titre: raison, ton: 'alerte',
    paragraphes: ['Pour votre sécurité, les liens d’accès sont temporaires. Votre espace découverte, lui, est toujours disponible.', 'Recevez un nouveau lien personnel à l’adresse de votre compte, ou connectez-vous si vous avez déjà choisi votre mot de passe.'],
    boutons: [
      { genre: 'formulaire', action: `/d/a/${jeton}/renvoyer`, libelle: 'Recevoir un nouveau lien d’accès' },
      { genre: 'lien', href: '/login', libelle: 'Se connecter', secondaire: true },
    ],
  }), 410);
}

function pageAcces(jeton: string, prenom: string | null) {
  const p = (prenom ?? '').trim();
  return html(pagePublique({
    surtitre: 'Offre découverte',
    titre: p ? `Bonjour ${p}, votre espace découverte vous attend` : 'Votre espace découverte vous attend',
    paragraphes: ['Votre accès à la plateforme Major ECN est prêt. Cliquez ci-dessous pour ouvrir votre espace et choisir votre mot de passe.'],
    boutons: [{ genre: 'formulaire', action: `/d/a/${jeton}`, libelle: 'Accéder à mon espace découverte' }],
    note: 'Cette étape protège votre compte : votre accès n’est ouvert qu’au moment où vous cliquez.',
  }));
}

function reponse(e: Etat, jeton: string) {
  switch (e.cas) {
    case 'invalide': return pageInvalide();
    case 'test': return html(pagePublique({ surtitre: 'E-mail de test', titre: 'Lien de démonstration', paragraphes: ['Ce lien provient d’un e-mail de test de l’administration : il n’ouvre aucun compte.'], boutons: [{ genre: 'lien', href: '/', libelle: 'Découvrir Major ECN' }] }));
    case 'connecte': return NextResponse.redirect(new URL('/login', siteUrl()), 303);
    case 'inactif': return html(pagePublique({ surtitre: 'Offre découverte', titre: 'Cet accès n’est plus actif', paragraphes: ['Votre accès découverte n’est plus disponible. Pour toute question, écrivez-nous à contact@major-ecn.fr.'], boutons: [{ genre: 'lien', href: '/contact', libelle: 'Nous contacter' }] }), 410);
    case 'expire': return pageExpiree(jeton, e.raison);
    case 'ok': return null;
  }
}

export async function GET(req: Request, ctx: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await ctx.params;
  try {
    const e = await diagnostiquer(jeton);
    if ('r' in e) await tracerClic(e.r, 'cta', req.headers.get('user-agent'));
    return reponse(e, jeton) ?? pageAcces(jeton, 'r' in e ? e.r.candidat?.prenom ?? null : null);
  } catch (err) {
    console.error('[d/a] GET', err instanceof Error ? err.message : err);
    return html(pagePublique({ titre: 'Service momentanément indisponible', paragraphes: ['Réessayez dans quelques instants.'], boutons: [{ genre: 'lien', href: `/d/a/${jeton}`, libelle: 'Réessayer' }] }), 503);
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ jeton: string }> }) {
  const { jeton } = await ctx.params;
  // Passerelles « à détonation » : `Sec-Fetch-User: ?1` n'accompagne qu'une
  // navigation déclenchée par un humain. Présent mais différent → on réaffiche
  // la page sans rien consommer (absent → on laisse passer, cf. /auth/confirm).
  const sfu = req.headers.get('sec-fetch-user');
  try {
    const e = await diagnostiquer(jeton);
    const autre = reponse(e, jeton);
    if (autre || e.cas !== 'ok') return autre ?? pageInvalide();
    const r = e.r;
    if (sfu !== null && sfu !== '?1') return pageAcces(jeton, r.candidat?.prenom ?? null);

    const c = r.candidat!;
    const email = (c.auth_email ?? c.email_actuel).trim();
    const base = siteUrl();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;
    let type: 'invite' | 'recovery' = 'invite';
    let lien = await admin.auth.admin.generateLink({ type: 'invite', email, options: { redirectTo: `${base}/auth/setup-password` } });
    if (lien.error || !lien.data?.properties?.hashed_token) {
      // Compte déjà confirmé : l'invitation est refusée par GoTrue → lien de récupération.
      type = 'recovery';
      lien = await admin.auth.admin.generateLink({ type: 'recovery', email, options: { redirectTo: `${base}/auth/setup-password` } });
    }
    const hash = lien.data?.properties?.hashed_token as string | undefined;
    if (lien.error || !hash) throw new Error(lien.error?.message ?? 'Lien Supabase non généré');

    await evenement({ candidatId: c.id, envoiId: r.envoi.id, type: 'acces_lien', details: { modele: r.envoi.type, lien: type } });
    await admin.from('decouverte_liens').update({ dernier_usage_at: new Date().toISOString() }).eq('id', r.lien.id);

    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: hash, type });
    if (error) {
      // Repli : la page de confirmation standard (même jeton, un clic de plus).
      return NextResponse.redirect(new URL(`/auth/confirm?token_hash=${encodeURIComponent(hash)}&type=${type}&next=${encodeURIComponent('/auth/setup-password')}`, base), 303);
    }
    return NextResponse.redirect(new URL('/auth/setup-password', base), 303);
  } catch (err) {
    console.error('[d/a] POST', err instanceof Error ? err.message : err);
    return pageExpiree(jeton, 'Votre accès n’a pas pu être ouvert');
  }
}
