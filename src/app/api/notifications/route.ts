import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { categorieDuKind, lirePreferences, type CategorieNotif } from '@/lib/notifications/categories';

/**
 * Cloche de l'espace élève (web : cookie ; app : Bearer + X-Device-Id).
 *
 *  GET  → notifications des 30 derniers jours non fermées, + nombre de non lues
 *  POST { action: 'lues' }               → toutes marquées lues
 *  POST { action: 'fermer', id }         → une notification fermée
 *
 * Lectures et écritures toujours bornées à l'élève connecté.
 */
export const dynamic = 'force-dynamic';

const JOURS = 30;

async function auth(req: Request) {
  const a = await getRequestUser(req);
  if (!a) return { erreur: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  if (a.via === 'bearer') {
    const check = await assertDeviceSlot(a.user.id, req.headers.get(DEVICE_HEADER));
    if (!check.ok) return { erreur: check.response };
  }
  return { userId: a.user.id };
}

export async function GET(req: Request) {
  const r = await auth(req);
  if ('erreur' in r) return r.erreur;
  const depuis = new Date(Date.now() - JOURS * 86_400_000).toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = createAdminClient() as any;
  const [{ data, error }, { data: pref }] = await Promise.all([
    a.from('pedago_notifications')
      .select('id, kind, title, body, cta_label, cta_href, updated_at, displayed_at, payload')
      .eq('user_id', r.userId).is('dismissed_at', null).gte('updated_at', depuis)
      .order('updated_at', { ascending: false }).limit(60),
    a.from('notification_preferences').select('app_actif, email_actif, prefs').eq('user_id', r.userId).maybeSingle(),
  ]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Préférences « sur l'application » : une catégorie coupée n'apparaît pas
  // dans la cloche (les notifications du moteur pédagogique y sont écrites
  // directement). Les messages de l'équipe et les annonces « Important »
  // s'affichent toujours.
  const prefs = lirePreferences(pref);
  const notifications = ((data ?? []) as { kind: string; displayed_at: string | null; payload: { categorie?: CategorieNotif | null; prioritaire?: boolean } | null }[])
    .filter((n) => {
      if (n.payload?.prioritaire) return true;
      const cat = n.payload?.categorie ?? categorieDuKind(n.kind);
      if (!cat) return true;
      return prefs.appActif && prefs.categories[cat]?.app !== false;
    })
    .slice(0, 30)
    .map(({ payload, ...n }) => ({ ...n, categorie: payload?.categorie ?? categorieDuKind(n.kind) }));
  return NextResponse.json(
    { notifications, nonLues: notifications.filter((n) => !n.displayed_at).length },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}

const Corps = z.discriminatedUnion('action', [
  z.object({ action: z.literal('lues') }),
  z.object({ action: z.literal('fermer'), id: z.string().uuid() }),
]);

export async function POST(req: Request) {
  const r = await auth(req);
  if ('erreur' in r) return r.erreur;
  const p = Corps.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = (createAdminClient() as any).from('pedago_notifications');
  const maintenant = new Date().toISOString();
  const { error } = p.data.action === 'lues'
    ? await t.update({ displayed_at: maintenant }).eq('user_id', r.userId).is('displayed_at', null)
    : await t.update({ dismissed_at: maintenant }).eq('user_id', r.userId).eq('id', p.data.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
