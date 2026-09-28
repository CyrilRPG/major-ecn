/* eslint-disable @typescript-eslint/no-explicit-any -- `platform_events`, `user_agenda_events`
   et `session_presences` sont absentes de l'instantané curaté de `types/database.ts`. */
import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { parseScope } from '@/lib/auth/permissions';
import {
  ajouterJours, evenementVisiblePourEleve, instantParis, natureVisio, type EvenementPlateformeBrut,
} from '@/lib/agenda/planning';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/agenda — les séances de la plateforme qui visent l'élève,
 * SANS leur lien de visio. Pendant de la page web `(student)/agenda/page.tsx`.
 *
 * L'app lisait `platform_events.zoom_url` directement : le lien de chaque
 * séance arrivait sur l'appareil avant tout émargement. Comme sur le web, on
 * ne transmet que son existence (`visio`) ; le lien s'obtient après
 * émargement, par POST /api/presences.
 *
 * Réponse : {
 *   aujourdHui: 'AAAA-MM-JJ' (Paris),
 *   seances: { id, title, date, start_time, end_time, college, intervenant, notes, visio }[],
 *   emargees: string[]   // séances déjà émargées (signature enregistrée)
 * }
 * Fenêtre : −2 mois / +6 mois autour d'aujourd'hui (heure de Paris), comme le web.
 *
 * Les évènements PERSONNELS restent lus et écrits par l'app sous RLS
 * (`user_agenda_events`).
 */
export async function GET(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return check.response;

  const aujourdHui = instantParis().date;
  const debut = ajouterJours(aujourdHui, -60);
  const fin = ajouterJours(aujourdHui, 180);

  const db = auth.supabase as any;
  const [{ data: profile }, { data: seances, error }, { data: signees }] = await Promise.all([
    (createAdminClient() as any).from('profiles').select('role, permission_scope').eq('id', auth.user.id).maybeSingle(),
    db.from('platform_events')
      .select('id, title, date, start_time, end_time, college, intervenant, zoom_url, notes, required_offers, scope_type, scope_colleges, voies')
      .gte('date', debut).lte('date', fin)
      .order('date').order('start_time').order('id'),
    db.from('session_presences')
      .select('event_id')
      .eq('user_id', auth.user.id)
      .not('signature_png', 'is', null),
  ]);
  if (error) return NextResponse.json({ error: 'Agenda indisponible pour le moment.' }, { status: 503 });

  // Même ciblage que la page web et le planning de l'accueil : formules, voie,
  // spécialités. Le personnel voit ce que la RLS lui montre (vue élève web :
  // même filtre, appliqué à son propre périmètre).
  const scope = parseScope(profile?.permission_scope);
  const visibles = ((seances ?? []) as EvenementPlateformeBrut[])
    .filter((e) => evenementVisiblePourEleve(e, scope))
    .map((e) => ({
      id: e.id,
      title: e.title,
      date: e.date,
      start_time: e.start_time,
      end_time: e.end_time,
      college: e.college,
      intervenant: e.intervenant,
      notes: e.notes,
      visio: natureVisio(e.zoom_url),
    }));

  const emargees = ((signees ?? []) as { event_id: string | null }[])
    .map((r) => r.event_id)
    .filter((id): id is string => !!id);

  return NextResponse.json(
    { aujourdHui, seances: visibles, emargees },
    { headers: { 'Cache-Control': 'private, no-store' } },
  );
}
