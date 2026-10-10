import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { CATEGORIES, lirePreferences, serialiserPreferences, type CategorieNotif } from '@/lib/notifications/categories';

/**
 * « Mon compte → Préférences → Notifications » (web : cookie ; app : Bearer).
 * Les choix sont enregistrés côté serveur : identiques sur tous les appareils
 * et après une reconnexion.
 *
 *  GET → préférences (valeurs recommandées si jamais réglées)
 *  PUT → { appActif, emailActif, categories: { cle: { app, email, mode } } }
 */
export const dynamic = 'force-dynamic';

async function auth(req: Request) {
  const a = await getRequestUser(req);
  if (!a) return { erreur: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  if (a.via === 'bearer') {
    const check = await assertDeviceSlot(a.user.id, req.headers.get(DEVICE_HEADER));
    if (!check.ok) return { erreur: check.response };
  }
  return { userId: a.user.id };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = () => createAdminClient() as any;

export async function GET(req: Request) {
  const r = await auth(req);
  if ('erreur' in r) return r.erreur;
  const { data } = await db().from('notification_preferences').select('app_actif, email_actif, prefs, updated_at').eq('user_id', r.userId).maybeSingle();
  return NextResponse.json({ preferences: lirePreferences(data), enregistre: !!data }, { headers: { 'Cache-Control': 'private, no-store' } });
}

const Reglage = z.object({ app: z.boolean(), email: z.boolean(), mode: z.enum(['immediat', 'quotidien']) });
const Corps = z.object({
  appActif: z.boolean(),
  emailActif: z.boolean(),
  categories: z.record(z.string(), Reglage),
});

export async function PUT(req: Request) {
  const r = await auth(req);
  if ('erreur' in r) return r.erreur;
  const p = Corps.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json({ error: 'Préférences invalides' }, { status: 400 });
  const base = lirePreferences(null);
  base.appActif = p.data.appActif;
  base.emailActif = p.data.emailActif;
  for (const [cle, v] of Object.entries(p.data.categories)) {
    if ((CATEGORIES as string[]).includes(cle)) base.categories[cle as CategorieNotif] = v;
  }
  const { error } = await db().from('notification_preferences').upsert({
    user_id: r.userId, ...serialiserPreferences(base), updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, preferences: base });
}
