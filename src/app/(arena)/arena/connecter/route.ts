import { NextResponse } from 'next/server';
import { arenaDb, getTournament } from '@/lib/arena/db';
import { hashToken, setSessionCookie } from '@/lib/arena/session';
import { siteUrl } from '@/lib/email/send';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Lien magique de connexion (valable une heure, usage unique). */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('t') ?? '';
  const base = siteUrl();
  if (!token) return NextResponse.redirect(`${base}/arena/connexion?erreur=lien`);
  const db = arenaDb();
  const { data: p } = await db.from('arena_participants').select('*').eq('login_token_hash', hashToken(token)).maybeSingle();
  if (!p || !p.login_token_expires_at || new Date(p.login_token_expires_at).getTime() < Date.now()) {
    return NextResponse.redirect(`${base}/arena/connexion?erreur=expire`);
  }
  const t = await getTournament(p.tournament_id);
  if (!t) return NextResponse.redirect(`${base}/arena/connexion?erreur=lien`);
  if (p.blocked_at) return NextResponse.redirect(`${base}/arena/${t.slug}?erreur=bloque`);
  await db.from('arena_participants').update({
    login_token_hash: null,
    login_token_expires_at: null,
    email_confirmed_at: p.email_confirmed_at ?? new Date().toISOString(),
    last_login_at: new Date().toISOString(),
  }).eq('id', p.id);
  await setSessionCookie(p.id, t.id);
  return NextResponse.redirect(`${base}/arena/${t.slug}/espace`);
}
