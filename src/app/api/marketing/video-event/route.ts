/**
 * POST /api/marketing/video-event — événement de la vidéo de présentation
 * (clic sur Play, lecture, paliers 25/50/75 %, fin, clic sur le bouton de fin,
 * inscription après visionnage). Alimente l'onglet « Vidéo de présentation »
 * de /admin/calendrier-evc.
 *
 * Route PUBLIQUE et anonyme : aucune donnée personnelle (visitor_id aléatoire
 * tiré par le navigateur), corps borné et validé par zod, insertion en
 * service-role (la table n'a aucune politique RLS ouverte). Limite de débit
 * simple, en mémoire de l'instance : largement suffisante pour décourager un
 * remplissage abusif, sans dépendance externe. Répond toujours vite, et le
 * client ignore la réponse : le suivi ne bloque jamais la lecture.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { EVENEMENTS_VIDEO, SOURCES_VIDEO, VISITEUR_RE } from '@/lib/marketing/video-evenements';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_CORPS = 2_000;

const Evenement = z.object({
  visitor_id: z.string().regex(VISITEUR_RE),
  event: z.enum(EVENEMENTS_VIDEO),
  source: z.enum(SOURCES_VIDEO).nullable().optional(),
  path: z.string().max(300).nullable().optional(),
});

/* Limite de débit : 40 événements par minute et par IP, 20 par visiteur. */
const FENETRE_MS = 60_000;
const compteurs = new Map<string, { debut: number; n: number }>();
function limiteAtteinte(cle: string, max: number, maintenant: number): boolean {
  const c = compteurs.get(cle);
  if (!c || maintenant - c.debut > FENETRE_MS) {
    compteurs.set(cle, { debut: maintenant, n: 1 });
    if (compteurs.size > 5_000) {
      for (const [k, v] of compteurs) if (maintenant - v.debut > FENETRE_MS) compteurs.delete(k);
    }
    return false;
  }
  c.n += 1;
  return c.n > max;
}

export async function POST(req: Request) {
  let brut = '';
  try {
    brut = (await req.text()).slice(0, MAX_CORPS);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  let json: unknown;
  try {
    json = JSON.parse(brut);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const p = Evenement.safeParse(json);
  if (!p.success) return NextResponse.json({ ok: false }, { status: 400 });

  const maintenant = Date.now();
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() || 'inconnue';
  if (limiteAtteinte(`ip:${ip}`, 40, maintenant) || limiteAtteinte(`v:${p.data.visitor_id}`, 20, maintenant)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  try {
    // Table absente des types générés.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (createAdminClient() as any).from('marketing_video_events').insert({
      visitor_id: p.data.visitor_id,
      event: p.data.event,
      source: p.data.source ?? null,
      path: p.data.path ?? null,
    });
    if (error) console.warn('[video-event] insertion impossible :', error.message);
  } catch (e) {
    console.warn('[video-event] insertion impossible :', e instanceof Error ? e.message : e);
  }
  return NextResponse.json({ ok: true });
}
