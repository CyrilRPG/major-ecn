import { NextResponse } from 'next/server';
import { getCurrentUserAndProfile } from '@/lib/auth/get-profile';
import { getAccessInfo } from '@/lib/auth/access';
import { accesEquipeExpire } from '@/lib/auth/collaborateurs';
import { parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScope } from '@/lib/auth/formula-permissions';
import { canViewCoursContent } from '@/lib/auth/require-role';
import { getNavigatorTree, type NavCollege } from '@/lib/data/navigator';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export type ResultatRechercheFiche = {
  ficheId: string;
  coursId: string;
  coursTitre: string;
  college: string;
  extrait: string;
};

/**
 * Garde-fou de charge : la saisie est déjà différée côté client (300 ms) ;
 * au-delà de 40 recherches par minute pour un même compte, on refuse. Compteur
 * par instance (approximatif sur plusieurs instances, suffisant contre une
 * boucle).
 */
const FENETRE_MS = 60_000;
const MAX_PAR_FENETRE = 40;
const compteurs = new Map<string, { debut: number; n: number }>();
function tropDeRecherches(userId: string): boolean {
  const now = Date.now();
  if (compteurs.size > 5_000) {
    for (const [k, v] of compteurs) if (now - v.debut > FENETRE_MS) compteurs.delete(k);
  }
  const c = compteurs.get(userId);
  if (!c || now - c.debut > FENETRE_MS) {
    compteurs.set(userId, { debut: now, n: 1 });
    return false;
  }
  c.n += 1;
  return c.n > MAX_PAR_FENETRE;
}

/** Extrait lisible : coupé aux limites de mots, points de suspension. */
function nettoyerExtrait(brut: string): string {
  let t = brut.replace(/\s+/g, ' ').trim();
  const debut = t.indexOf(' ');
  if (debut > 0 && debut < 25) t = `… ${t.slice(debut + 1)}`;
  const fin = t.lastIndexOf(' ');
  if (fin > t.length - 25 && fin > 0) t = `${t.slice(0, fin)} …`;
  return t;
}

/**
 * GET /api/recherche/fiches?q=… — recherche par MOTS-CLÉS dans le texte des
 * fiches de cours (palette ⌘K « Dans les fiches »).
 *
 * L'index `fiches_recherche` n'est lisible que par le service-role : la route
 * calcule D'ABORD les items dont l'appelant peut lire la fiche (même arbre que
 * son menu de navigation, droit « fiche » de sa formule, blocs masqués,
 * périmètre d'un professeur), et ne cherche que dans ceux-là. Un extrait de
 * fiche n'est donc jamais renvoyé pour un item que l'élève ne peut pas ouvrir.
 */
export async function GET(req: Request) {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user || !profile) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (profile.is_active === false || accesEquipeExpire(profile)) {
    return NextResponse.json({ error: 'Compte désactivé' }, { status: 403 });
  }
  if (profile.role === 'student' && getAccessInfo(profile).expired) {
    return NextResponse.json({ error: 'Accès expiré' }, { status: 403 });
  }

  const q = (new URL(req.url).searchParams.get('q') ?? '').trim().slice(0, 120);
  if (q.replace(/[^\p{L}\p{N}]/gu, '').length < 3) return NextResponse.json({ resultats: [] });

  if (tropDeRecherches(user.id)) {
    return NextResponse.json({ error: 'Trop de recherches rapprochées — patientez quelques secondes.' }, { status: 429 });
  }

  const isAdmin = profile.role === 'admin';
  if (!isAdmin && profile.role !== 'professor' && profile.role !== 'student') return NextResponse.json({ resultats: [] });
  if (!isAdmin && profile.role === 'student') {
    const acces = await fetchContentAccessForScope(parseScope(profile.permission_scope));
    if (!acces.fiche) return NextResponse.json({ resultats: [] });
  }

  // Items accessibles (sous-collèges compris), avec une fiche.
  // Élève à formule payante : l'espace Découverte n'est plus dans son menu
  // (layout élève, 08/10/2026) — ses fiches ne sortent pas non plus ici.
  const payant = profile.role === 'student'
    && ['essentiel', 'intensif', 'approfondi'].includes(parseScope(profile.permission_scope).offer);
  const tree = (await getNavigatorTree(profile)).filter((c) => !payant || c.id !== 'col-decouverte');
  const items = new Map<string, { titre: string; college: string }>();
  const parcourir = (cols: NavCollege[]) => {
    for (const col of cols) {
      for (const c of col.cours) {
        if (!c.hasFiche) continue;
        if (profile.role === 'professor' && !canViewCoursContent(profile, 'fiche', col.id, c.id)) continue;
        items.set(c.id, { titre: c.titre, college: col.nom });
      }
      if (col.children) parcourir(col.children);
    }
  };
  parcourir(tree);
  if (items.size === 0) return NextResponse.json({ resultats: [] });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  let ids = [...items.keys()];
  if (!isAdmin) {
    // Bloc « Fiche » masqué par l'administration sur certains items.
    const { data: masques } = await admin.from('cours').select('id').in('id', ids).contains('hidden_blocks', ['fiche']);
    const exclus = new Set(((masques ?? []) as { id: string }[]).map((m) => m.id));
    if (exclus.size > 0) ids = ids.filter((id) => !exclus.has(id));
  }

  const { data, error } = await admin.rpc('rechercher_fiches', { p_q: q, p_cours_ids: ids, p_limite: 30 });
  if (error) {
    console.error('[recherche/fiches]', error.message);
    return NextResponse.json({ error: 'Recherche indisponible' }, { status: 500 });
  }

  // Une même fiche partagée entre plusieurs items : un résultat par item.
  const vus = new Set<string>();
  const resultats: ResultatRechercheFiche[] = [];
  for (const r of (data ?? []) as { fiche_id: string; cours_id: string; extrait: string }[]) {
    const item = items.get(r.cours_id);
    if (!item || vus.has(r.cours_id)) continue;
    vus.add(r.cours_id);
    resultats.push({ ficheId: r.fiche_id, coursId: r.cours_id, coursTitre: item.titre, college: item.college, extrait: nettoyerExtrait(r.extrait ?? '') });
    if (resultats.length >= 20) break;
  }
  return NextResponse.json({ resultats }, { headers: { 'Cache-Control': 'private, no-store' } });
}
