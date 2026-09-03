/**
 * POST /api/client-errors — rapport d'une erreur survenue dans le navigateur
 * (envoyé par le filet de sécurité `app/error.tsx`).
 *
 * Avant cette route, l'écran « Cette page n'a pas pu s'afficher » était une
 * boîte noire : l'erreur restait dans la console de l'élève, et le support
 * n'avait ni la page, ni le message, ni le navigateur. Le rapport est écrit
 * dans les journaux Vercel (`console.error`, lisible immédiatement) et dans la
 * table `client_errors` quand elle existe (migration
 * `20260903150000_client_errors.sql`, à appliquer sur Supabase), pour garder
 * l'historique au-delà de la rétention des journaux.
 *
 * Anonyme et sans authentification : l'erreur peut survenir avant toute
 * session. Le corps est borné et ne contient que ce que le navigateur envoie.
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_BODY = 8_000;

type Rapport = {
  name?: unknown;
  message?: unknown;
  stack?: unknown;
  digest?: unknown;
  url?: unknown;
  userAgent?: unknown;
  autoReload?: unknown;
};

const texte = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : null);

export async function POST(req: Request) {
  let brut = '';
  try {
    brut = (await req.text()).slice(0, MAX_BODY);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  let r: Rapport = {};
  try {
    r = JSON.parse(brut) as Rapport;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const ligne = {
    name: texte(r.name, 120),
    message: texte(r.message, 500),
    stack: texte(r.stack, 2000),
    digest: texte(r.digest, 64),
    url: texte(r.url, 500),
    user_agent: texte(r.userAgent, 300),
    auto_reload: r.autoReload === true,
  };

  // Toujours dans les journaux Vercel : c'est ce qu'on lit en premier.
  console.error('[client-error]', JSON.stringify(ligne));

  // Puis en base, si la table existe (sinon on ne bloque rien).
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (createAdminClient() as any).from('client_errors').insert(ligne);
    if (error) console.warn('[client-error] table client_errors indisponible :', error.message);
  } catch {
    /* jamais bloquant */
  }

  return NextResponse.json({ ok: true });
}
