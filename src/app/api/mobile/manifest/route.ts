import { NextResponse } from 'next/server';
import { getBearerUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { assertAccessActive } from '@/lib/auth/access';
import { createAdminClient } from '@/lib/supabase/admin';
import { canAccessCollege, canAccessCours, parseScope, scopeOffers } from '@/lib/auth/permissions';
import { fetchContentAccessForScopeWith } from '@/lib/auth/formula-permissions';
import { videoVisible } from '@/lib/videos/audience';
import { buildLicense } from '@/lib/license/sign';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/manifest[?since=ISO] — inventaire du contenu téléchargeable,
 * borné aux droits de l'utilisateur (RLS voie/faculté + filtre collège/cours
 * applicatif + matrice de formule), avec deltas par `updated_at` (la migration
 * content_updated_at fait remonter toute modification enfant → cours).
 *
 * Sans `since` : inventaire complet. Avec `since` : seuls les cours modifiés
 * depuis, + `all_cours_ids` pour que l'app détecte les suppressions.
 * Renvoie aussi une licence fraîche + l'heure serveur (fenêtre de pointage).
 */
export async function GET(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  const deviceId = req.headers.get(DEVICE_HEADER);
  const check = await assertDeviceSlot(auth.user.id, deviceId);
  if (!check.ok) return check.response;

  const expiredRes = await assertAccessActive(auth.supabase, auth.user.id);
  if (expiredRes) return expiredRes;

  const sinceRaw = new URL(req.url).searchParams.get('since');
  const since = sinceRaw && !Number.isNaN(new Date(sinceRaw).getTime()) ? new Date(sinceRaw).toISOString() : null;

  const { data: profile } = await auth.supabase
    .from('profiles')
    .select('permission_scope, role')
    .eq('id', auth.user.id)
    .maybeSingle();
  const scope = parseScope(profile?.permission_scope);
  const isStaff = profile?.role === 'admin' || profile?.role === 'professor';
  const content = await fetchContentAccessForScopeWith(auth.supabase, scope);

  // Matieres + cours via le client RLS de l'utilisateur, puis filtre applicatif
  // collège/cours (la RLS 'college' laisse passer toute la faculté).
  const [{ data: matieresRaw }, { data: coursRaw }] = await Promise.all([
    auth.supabase
      .from('matieres')
      .select('id, nom, order_index, parent_matiere_id, color_hex, icon_key, access_type, min_offer, updated_at')
      .order('order_index'),
    auth.supabase
      .from('cours')
      .select('id, matiere_id, titre, description, order_index, access_type, updated_at')
      .order('order_index'),
  ]);

  type Mat = { id: string; access_type: string; [k: string]: unknown };
  type Cours = { id: string; matiere_id: string; access_type: string; updated_at: string; [k: string]: unknown };

  const matieres = ((matieresRaw ?? []) as unknown as Mat[])
    .filter((m) => isStaff || canAccessCollege(scope, m.id, m.access_type as 'all' | 'specific'));
  const matiereIds = new Set(matieres.map((m) => m.id));

  const allCours = ((coursRaw ?? []) as unknown as Cours[])
    .filter((c) => matiereIds.has(c.matiere_id))
    .filter((c) => isStaff || canAccessCours(scope, c.matiere_id, c.id, c.access_type as 'all' | 'specific'));
  const allCoursIds = allCours.map((c) => c.id);

  // Delta : seuls les cours touchés depuis `since` (le bubbling garantit que
  // toute modification de fiche/vidéo/série/question/flashcard touche le cours).
  const included = since ? allCours.filter((c) => c.updated_at > since) : allCours;
  const includedIds = included.map((c) => c.id);

  type ChildRow = { cours_id: string; [k: string]: unknown };
  let fiches: ChildRow[] = [];
  let videos: ChildRow[] = [];
  let series: ChildRow[] = [];
  let flashcardsCountByCours = new Map<string, number>();

  if (includedIds.length > 0) {
    const [f, v, s, fc] = await Promise.all([
      content.fiche
        // Un item peut porter plusieurs fiches : l'ordre garantit que c'est la
        // fiche principale qui est retenue ci-dessous.
        ? auth.supabase
            .from('fiches')
            .select('cours_id, pages, updated_at')
            .in('cours_id', includedIds)
            .order('order_index', { ascending: true })
            .order('created_at', { ascending: true })
        : Promise.resolve({ data: [] }),
      // `content.video` reste le droit global de la formule ; il ne suffit plus
      // à décider : une vidéo peut cibler explicitement d'autres formules. On
      // charge donc toujours, et on filtre par audience ci-dessous.
      auth.supabase
        .from('videos')
        .select('cours_id, bunny_video_id, storage_path, duration_seconds, voies, offers, denied_user_ids, updated_at')
        .in('cours_id', includedIds)
        .eq('type', 'cours')
        .order('order_index', { ascending: true }),
      auth.supabase
        .from('qcm_series')
        .select('id, cours_id, label, type, annee, duration_minutes, vignette, order_index, updated_at')
        .in('cours_id', includedIds)
        .order('order_index'),
      content.flashcards
        ? auth.supabase.from('flashcards').select('cours_id').in('cours_id', includedIds)
        : Promise.resolve({ data: [] }),
    ]);
    fiches = (f.data ?? []) as unknown as ChildRow[];
    videos = (v.data ?? []) as unknown as ChildRow[];
    series = (s.data ?? []) as unknown as ChildRow[];
    flashcardsCountByCours = ((fc.data ?? []) as unknown as ChildRow[]).reduce((m, r) => {
      m.set(r.cours_id, (m.get(r.cours_id) ?? 0) + 1);
      return m;
    }, new Map<string, number>());
  }

  // Première ligne rencontrée = fiche principale (la requête est ordonnée).
  const fichesByCours = new Map<string, ChildRow>();
  for (const r of fiches) if (!fichesByCours.has(r.cours_id)) fichesByCours.set(r.cours_id, r);
  // Audience portée par la vidéo (voies + formules). Le staff voit tout.
  const videosByCours = new Map<string, ChildRow>();
  for (const r of videos) {
    const visible = isStaff || videoVisible(
      r as { voies?: string[] | null; offers?: string[] | null; denied_user_ids?: string[] | null },
      { offres: scopeOffers(scope), voie: scope.voie ?? null, droitFormule: content.video, userId: auth.user.id },
    );
    if (visible && !videosByCours.has(r.cours_id)) videosByCours.set(r.cours_id, r);
  }
  const seriesByCours = new Map<string, ChildRow[]>();
  for (const s of series) {
    const list = seriesByCours.get(s.cours_id) ?? [];
    list.push(s);
    seriesByCours.set(s.cours_id, list);
  }

  const admin = createAdminClient();
  const { license, accessEnd, expired } = await buildLicense(admin, auth.user.id, deviceId as string);

  return NextResponse.json({
    server_time: new Date().toISOString(),
    license,
    access: { expired, access_end: accessEnd },
    content_access: content,
    since,
    all_cours_ids: allCoursIds,
    matieres,
    cours: included.map((c) => {
      const fiche = fichesByCours.get(c.id) ?? null;
      const video = videosByCours.get(c.id) ?? null;
      return {
        id: c.id,
        matiere_id: c.matiere_id,
        titre: c.titre,
        description: c.description,
        order_index: c.order_index,
        updated_at: c.updated_at,
        fiche: fiche ? { pages: fiche.pages, updated_at: fiche.updated_at } : null,
        video: video
          ? {
              bunny_video_id: video.bunny_video_id,
              has_storage_fallback: !!video.storage_path,
              duration_seconds: video.duration_seconds,
              updated_at: video.updated_at,
            }
          : null,
        qcm_series: seriesByCours.get(c.id) ?? [],
        flashcards_count: flashcardsCountByCours.get(c.id) ?? 0,
      };
    }),
  });
}
