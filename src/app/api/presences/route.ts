import { NextResponse } from 'next/server';
import { getRequestUser } from '@/lib/auth/bearer';
import { parseScope } from '@/lib/auth/permissions';
import { etatEmargement, evenementVisiblePourEleve, instantParis } from '@/lib/agenda/planning';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Garde-fou : une signature PNG raisonnable pèse quelques dizaines de Ko. */
const MAX_SIGNATURE_CHARS = 400_000;

/**
 * POST /api/presences — émarge la présence de l'utilisateur connecté à une
 * session Zoom (évènement plateforme), AVANT ouverture du lien.
 *
 * Body : { eventId: string, signaturePng?: string }
 *
 * Réponse : { ok, zoomUrl } — le lien de la visio n'est remis QU'ICI, jamais
 * dans les pages (28/09/2026). Sans signature, la route ne sert qu'à
 * redonner le lien d'une séance déjà émargée. Un élève n'émarge que les
 * séances qui le visent, et seulement d'une heure avant le début à trois
 * heures après la fin (heure de Paris).
 *
 * La signature manuscrite est obligatoire : c'est elle qui donne à
 * l'émargement Zoom la même valeur probatoire qu'un émargement de vidéo
 * plateforme. Le client n'ouvre le lien Zoom qu'une fois cette route en succès.
 *
 * Ré-émarger une session déjà signée ne remplace pas la signature d'origine :
 * la réponse est un succès, l'enregistrement initial est conservé.
 */
export async function POST(req: Request) {
  // Auth duale cookie OU Bearer, pour la même raison que /api/emargement : le
  // middleware ne rafraîchit pas la session ici, et un onglet resté ouvert
  // longtemps avant l'ouverture du lien Zoom présente un cookie périmé.
  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const user = auth.user;

  const body = (await req.json().catch(() => ({}))) as {
    eventId?: string;
    signaturePng?: string;
  };
  const eventId = (body.eventId ?? '').trim();
  if (!eventId) return NextResponse.json({ error: 'Évènement manquant' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = auth.supabase as any;

  const [{ data: ev }, { data: profile }] = await Promise.all([
    db.from('platform_events')
      .select('id, title, date, start_time, end_time, college, intervenant, zoom_url, required_offers, scope_type, scope_colleges, voies')
      .eq('id', eventId)
      .maybeSingle(),
    db.from('profiles').select('role, permission_scope').eq('id', user.id).maybeSingle(),
  ]);
  if (!ev) return NextResponse.json({ error: 'Évènement introuvable' }, { status: 404 });

  // Un élève n'émarge (et n'obtient le lien) que pour une séance qui le vise :
  // même règle que son agenda et son planning.
  if (profile?.role === 'student' && !evenementVisiblePourEleve(ev, parseScope(profile.permission_scope))) {
    return NextResponse.json({ error: 'Cette séance ne fait pas partie de votre formation.' }, { status: 403 });
  }
  const zoomUrl = typeof ev.zoom_url === 'string' && /^https?:\/\//i.test(ev.zoom_url.trim()) ? ev.zoom_url.trim() : null;

  // Déjà émargé : on ne réécrit pas la signature d'origine, on redonne le lien.
  const { data: existing } = await db
    .from('session_presences')
    .select('id, signature_png')
    .eq('user_id', user.id)
    .eq('event_id', eventId)
    .maybeSingle();
  if (existing?.signature_png) {
    return NextResponse.json({ ok: true, alreadySigned: true, zoomUrl });
  }

  const signature = body.signaturePng ?? '';
  if (!signature.startsWith('data:image/png;base64,')) {
    return NextResponse.json(
      { error: 'Signature manuscrite requise pour émarger cette session.' },
      { status: 400 },
    );
  }
  if (signature.length > MAX_SIGNATURE_CHARS) {
    return NextResponse.json({ error: 'Signature trop volumineuse' }, { status: 413 });
  }

  // Fenêtre d'émargement, en heure de Paris : 1 h avant le début → 3 h après
  // la fin. Sans elle, on pouvait « assister » à une séance trois semaines
  // avant ou deux mois après.
  const fenetre = etatEmargement(ev, instantParis());
  if (fenetre.etat !== 'ouvert') {
    return NextResponse.json(
      {
        error: fenetre.etat === 'avant'
          ? `L’émargement ouvre une heure avant le début de la séance${fenetre.ouverture ? ` (à ${fenetre.ouverture.heure.replace(':', ' h ')})` : ''}.`
          : 'Cette séance est terminée : l’émargement est clos.',
      },
      { status: 409 },
    );
  }

  const { error } = await db
    .from('session_presences')
    .upsert(
      {
        user_id: user.id,
        event_id: ev.id,
        event_title: ev.title,
        event_date: ev.date,
        start_time: ev.start_time,
        end_time: ev.end_time,
        college: ev.college,
        intervenant: ev.intervenant,
        signature_png: signature,
        marked_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,event_id' },
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, zoomUrl });
}
