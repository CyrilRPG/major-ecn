import 'server-only';
import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { canAccessCollege, canAccessCours, parseScope, type ContentAccess } from './permissions';
import { fetchContentAccessForScopeWith } from './formula-permissions';
import { getProfessorScope } from './prof-content-access';
import { canRead, type ContentType } from '@/lib/schemas/professor';
import { chargerReplays, type ReplayVideo } from '@/lib/videos/replays';
import { estOuverte } from '@/lib/videos/unlock';
import { aUneVideo } from '@/lib/videos/a-venir';
import { eleveAutorise, eleveExclu } from '@/lib/videos/audience';
import type { PermissionScope } from '@/types/domain';

/**
 * Contrôles d'accès des routes qui SERVENT un contenu de lecture d'un item
 * (PDF de fiche, fiche éclair, vidéo, URL de téléchargement hors ligne).
 *
 * Ces routes étaient appelées par l'application mobile en contournant les
 * gardes des pages web : la fiche complète était servie sans le droit
 * « fiche » de la formule, la fiche éclair sans « fiche éclair », et la
 * « première vidéo » de l'item sans filtre d'audience ni de déblocage (une
 * séance approfondie verrouillée devenait téléchargeable). On rejoue ici
 * EXACTEMENT les gardes des pages `(student)/cours/[cours]/…` et de leur
 * mise en page : collège (y compris `access_type = 'specific'`), item (liste
 * `cours` du scope et `cours.access_type`, garde de la page d'aperçu
 * `cours/[cours]`), matrice de la formule, lecture du professeur, audience de
 * la vidéo, déblocage. L'autorisation nominative d'une vidéo lève les gardes
 * collège/item, comme sur la page d'aperçu.
 *
 * Seule l'administration lève les verrous : un professeur garde sa formule
 * et son périmètre, comme sur le web.
 */

export type ContexteLecture = {
  userId: string;
  role: 'student' | 'professor' | 'admin';
  isAdmin: boolean;
  scope: PermissionScope;
  /** Droits de la formule ; `undefined` pour l'administration. */
  access: ContentAccess | undefined;
  permissionScope: unknown;
};

export async function contexteLecture(supabase: SupabaseClient, userId: string): Promise<ContexteLecture> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, permission_scope')
    .eq('id', userId)
    .maybeSingle();
  const p = profile as { role?: string | null; permission_scope?: unknown } | null;
  const role = p?.role === 'admin' ? 'admin' : p?.role === 'professor' ? 'professor' : 'student';
  const scope = parseScope(p?.permission_scope);
  const isAdmin = role === 'admin';
  return {
    userId,
    role,
    isAdmin,
    scope,
    access: isAdmin ? undefined : await fetchContentAccessForScopeWith(supabase, scope),
    permissionScope: p?.permission_scope ?? null,
  };
}

function refus(status: number, code: string, error: string) {
  return NextResponse.json({ code, error }, { status });
}

type CoursLecture = {
  id: string;
  matiere_id: string;
  /** `matieres.access_type` (collège). */
  accessType: 'all' | 'specific';
  /** `cours.access_type` (item). */
  coursAccessType: 'all' | 'specific';
};

async function lireCours(supabase: SupabaseClient, coursId: string): Promise<CoursLecture | NextResponse> {
  const { data, error } = await supabase
    .from('cours')
    .select('id, matiere_id, access_type, matieres(access_type)')
    .eq('id', coursId)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const c = data as {
    id: string;
    matiere_id: string;
    access_type?: string | null;
    matieres?: { access_type?: string | null } | null;
  } | null;
  if (!c) return refus(404, 'COURS_INTROUVABLE', 'Cours introuvable');
  return {
    id: c.id,
    matiere_id: c.matiere_id,
    accessType: c.matieres?.access_type === 'specific' ? 'specific' : 'all',
    coursAccessType: c.access_type === 'specific' ? 'specific' : 'all',
  };
}

/**
 * Item hors de la portée de l'utilisateur : garde « filtrage fin » de la page
 * d'aperçu `cours/[cours]` (liste `cours` du scope, item `specific`).
 */
function horsPorteeItem(ctx: ContexteLecture, cours: CoursLecture): boolean {
  return !ctx.isAdmin && !canAccessCours(ctx.scope, cours.matiere_id, cours.id, cours.coursAccessType);
}

/** Au moins une vidéo de l'item autorise nominativement l'élève (sans l'exclure). */
async function autoriseParUneVideo(supabase: SupabaseClient, coursId: string, userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('videos')
    .select('allowed_user_ids, denied_user_ids')
    .eq('cours_id', coursId);
  return ((data ?? []) as { allowed_user_ids?: string[] | null; denied_user_ids?: string[] | null }[])
    .some((v) => eleveAutorise(v, userId) && !eleveExclu(v, userId));
}

function refusItemHorsPortee() {
  return refus(403, 'COURS_NOT_IN_SCOPE', 'Cet item ne fait pas partie de votre accès.');
}

/** Lecture refusée à un professeur dont la portée n'ouvre pas ce type de contenu. */
function refusProfesseur(ctx: ContexteLecture, type: ContentType): boolean {
  return ctx.role === 'professor' && !canRead(getProfessorScope(ctx.permissionScope), type);
}

/**
 * Fiche complète (`fiche`) ou fiche éclair (`ficheExpress`) : pages
 * `cours/[cours]/fiche` et `cours/[cours]/fiche-express` + mise en page.
 * Renvoie la réponse de refus, ou `null` si la lecture est permise.
 */
export async function refusLectureFiche(
  supabase: SupabaseClient,
  userId: string,
  coursId: string,
  droit: 'fiche' | 'ficheExpress',
): Promise<NextResponse | null> {
  const ctx = await contexteLecture(supabase, userId);
  if (ctx.isAdmin) return null;
  const cours = await lireCours(supabase, coursId);
  if (cours instanceof NextResponse) return cours;
  if (!canAccessCollege(ctx.scope, cours.matiere_id, cours.accessType)) {
    return refus(403, 'COLLEGE_NOT_IN_SCOPE', 'Ce collège ne fait pas partie de votre accès.');
  }
  // Seulement si l'item est hors portée : la lecture des vidéos n'a lieu que
  // dans ce cas (l'autorisation nominative d'une vidéo ouvre l'aperçu web).
  if (horsPorteeItem(ctx, cours) && !(await autoriseParUneVideo(supabase, coursId, userId))) {
    return refusItemHorsPortee();
  }
  if (!ctx.access?.[droit]) {
    return refus(
      403,
      'CONTENT_NOT_IN_FORMULA',
      droit === 'fiche' ? 'Votre formule n’inclut pas la fiche de cours.' : 'Votre formule n’inclut pas la fiche éclair.',
    );
  }
  // La page « Fiche de cours » applique aussi la garde de lecture du professeur.
  if (droit === 'fiche' && refusProfesseur(ctx, 'fiche')) {
    return refus(403, 'CONTENT_NOT_IN_SCOPE', 'Votre portée ne comprend pas la lecture des fiches.');
  }
  return null;
}

/** Motif de fermeture d'une séance approfondie (même phrase que la page web). */
export function motifSeanceFermee(labelSeance: string | null | undefined): string {
  return labelSeance
    ? `Terminez « ${labelSeance} » pour débloquer cette vidéo.`
    : 'Terminez les séances du professeur de ce cours pour débloquer cette vidéo.';
}

/**
 * Vidéo d'un item servie à cet utilisateur : celle demandée (`videoId`), ou à
 * défaut la première séance REGARDABLE de la catégorie « cours » — ce que
 * montre la page vidéo web quand aucune séance n'est choisie.
 *
 * Contrôles, dans l'ordre des pages web :
 *  - collège (avec `access_type`) puis item (`canAccessCours`, avec
 *    `cours.access_type`), sauf autorisation nominative d'une vidéo ;
 *  - lecture du professeur pour les cours vidéo ;
 *  - audience de la vidéo (voies, formules, listes nominatives, droit de la
 *    formule en repli) — `chargerReplays`, le module de la page web ;
 *  - déblocage progressif des séances approfondies (`estOuverte`) ;
 *  - une séance à venir (sans source) n'a rien à servir.
 */
export async function resoudreVideoLecture(
  supabase: SupabaseClient,
  userId: string,
  coursId: string,
  videoId: string | null,
): Promise<{ video: ReplayVideo } | { refus: NextResponse }> {
  const ctx = await contexteLecture(supabase, userId);
  const cours = await lireCours(supabase, coursId);
  if (cours instanceof NextResponse) return { refus: cours };

  const replays = await chargerReplays(supabase, coursId, {
    userId,
    scope: ctx.scope,
    access: ctx.access,
    isAdmin: ctx.isAdmin,
  });
  if (!ctx.isAdmin && !canAccessCollege(ctx.scope, cours.matiere_id, cours.accessType) && !replays.autoriseParVideo) {
    return { refus: refus(403, 'COLLEGE_NOT_IN_SCOPE', 'Ce collège ne fait pas partie de votre accès.') };
  }
  if (horsPorteeItem(ctx, cours) && !replays.autoriseParVideo) {
    return { refus: refusItemHorsPortee() };
  }

  const toutes = [...replays.cours, ...replays.seance_approfondie];
  const video = videoId
    ? toutes.find((v) => v.id === videoId)
    : replays.cours.find((v) => aUneVideo(v));
  if (!video) {
    return { refus: refus(404, 'VIDEO_INTROUVABLE', 'Vidéo introuvable ou non accessible avec votre formule.') };
  }
  if (video.type === 'cours' && refusProfesseur(ctx, 'video')) {
    return { refus: refus(403, 'CONTENT_NOT_IN_SCOPE', 'Votre portée ne comprend pas la lecture des vidéos.') };
  }

  if (video.type === 'seance_approfondie' && !ctx.isAdmin) {
    // Déblocage : seules les séances du professeur de CET item comptent (page web).
    const { data: seances } = await supabase
      .from('qcm_series')
      .select('id, label')
      .eq('cours_id', coursId)
      .eq('type', 'seance');
    const liste = (seances ?? []) as { id: string; label: string | null }[];
    let terminees = new Set<string>();
    if (liste.length > 0) {
      const { data: sessions } = await supabase
        .from('qcm_sessions')
        .select('serie_id')
        .eq('user_id', userId)
        .in('serie_id', liste.map((s) => s.id))
        .not('finished_at', 'is', null);
      terminees = new Set(((sessions ?? []) as { serie_id: string }[]).map((s) => s.serie_id));
    }
    if (!estOuverte(video, terminees, false)) {
      const label = video.serie_id ? liste.find((s) => s.id === video.serie_id)?.label : null;
      return { refus: refus(403, 'SEANCE_VERROUILLEE', motifSeanceFermee(label)) };
    }
  }

  if (!aUneVideo(video)) {
    return { refus: refus(404, 'SEANCE_A_VENIR', 'Cette séance n’a pas encore eu lieu : la vidéo sera ajoutée après le direct.') };
  }
  return { video };
}
