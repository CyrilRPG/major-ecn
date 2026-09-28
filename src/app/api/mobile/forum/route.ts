/* eslint-disable @typescript-eslint/no-explicit-any -- `forum_*` et les colonnes récentes de
   `profiles` sont absentes de l'instantané curaté de `types/database.ts`. */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getBearerUser, type RequestAuth } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { fetchAllRows } from '@/lib/supabase/fetch-all';
import { canAccessCollege, canAccessCours, parseScope } from '@/lib/auth/permissions';
import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { generatePseudo } from '@/lib/auth/pseudo';
import { effectiveSeed, platformAvatarUrl } from '@/lib/avatar';
import { ELEVE_SANS_NOM, identityContext, identityFromProfile } from '@/lib/admin/student-identity';
import { notifyProfessorsOfNewQuestion, notifyTeamOfForumReport } from '@/lib/forum/notifications';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * /api/mobile/forum — le forum de l'app, pendant de `(student)/forum/page.tsx`
 * et de ses actions (`askQuestionAction`, `addReplyAction`).
 *
 * L'app écrivait directement dans `forum_questions` : le nom RÉEL de l'élève
 * partait en pseudo public, aucun enseignant n'était prévenu, et la liste des
 * cours n'était pas filtrée par les droits. Tout passe désormais ici.
 *
 * GET → {
 *   role,
 *   questions: Fil[]   // publiques + celles de l'élève, plus récentes d'abord
 *   colleges: { id, nom, cours: { id, titre }[] }[]  // pour « Poser une question »
 * }
 * Un Fil n'expose ni l'identifiant ni le nom réel d'un élève : pseudo, avatar,
 * et `mine` (c'est l'élève connecté).
 *
 * POST { action: 'ask', body, cours_id? }            → { ok, id }
 * POST { action: 'reply', question_id, body }        → { ok }
 * POST { action: 'report', question_id, cible, cible_id?, motif? } → { ok }
 *   Signalement (règle Apple 1.2) : l'équipe est prévenue par e-mail.
 */

async function contexte(req: Request) {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return check.response;
  const { data: profile } = await (createAdminClient() as any)
    .from('profiles')
    .select('id, role, pseudo, first_name, last_name, email, promotion, permission_scope')
    .eq('id', auth.user.id)
    .maybeSingle();
  if (!profile) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
  return { auth, profile };
}

type Profil = {
  id: string; role: 'student' | 'professor' | 'admin'; pseudo: string | null;
  first_name: string | null; last_name: string | null; email: string | null;
  promotion: string | null; permission_scope: unknown;
};

/** Pseudo public de l'élève : le sien, sinon un pseudo discret — JAMAIS son nom. */
function pseudoEleve(p: Profil): string {
  return (p.pseudo ?? '').trim() || generatePseudo(p.first_name ?? '', p.last_name ?? '', p.promotion ?? 'X');
}

const SELECT_FIL = 'id, body, created_at, student_id, student_pseudo, cours_id, cours_titre, matiere_nom, matiere_id, is_public, status, forum_answers(id, body, created_at, professor_id, professor_name), forum_replies(id, body, created_at, author_id, author_role, author_name)';

type Ligne = {
  id: string; body: string; created_at: string; student_id: string; student_pseudo: string | null;
  cours_id: string | null; cours_titre: string | null; matiere_nom: string | null; matiere_id: string | null;
  is_public: boolean; status: string | null;
  forum_answers: { id: string; body: string; created_at: string; professor_id: string | null; professor_name: string | null }[] | null;
  forum_replies: { id: string; body: string; created_at: string; author_id: string | null; author_role: string; author_name: string | null }[] | null;
};

export async function GET(req: Request) {
  const ctx = await contexte(req);
  if (ctx instanceof NextResponse) return ctx;
  const { auth } = ctx;
  const profile = ctx.profile as Profil;
  const db = auth.supabase as any;

  // Questions : publiques + celles de l'élève (RLS de l'élève, comme la page
  // web). Lues par tranches : aucune limite silencieuse.
  const [publiques, miennes] = await Promise.all([
    fetchAllRows<Ligne>((from, to) => db.from('forum_questions').select(SELECT_FIL)
      .eq('is_public', true).order('created_at', { ascending: false }).order('id').range(from, to)),
    profile.role === 'student'
      ? fetchAllRows<Ligne>((from, to) => db.from('forum_questions').select(SELECT_FIL)
        .eq('student_id', auth.user.id).order('created_at', { ascending: false }).order('id').range(from, to))
      : Promise.resolve([] as Ligne[]),
  ]).catch(() => [null, null] as const);
  if (!publiques || !miennes) return NextResponse.json({ error: 'Forum indisponible pour le moment.' }, { status: 503 });
  const parId = new Map<string, Ligne>();
  for (const l of [...publiques, ...miennes]) parId.set(l.id, l);
  const lignes = [...parId.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));

  // Avatars des seuls auteurs déjà visibles — aucun autre champ de profil.
  const auteurs = [...new Set(lignes.flatMap((l) => [
    l.student_id,
    ...(l.forum_answers ?? []).map((a) => a.professor_id),
    ...(l.forum_replies ?? []).map((r) => r.author_id),
  ]).filter((id): id is string => !!id))];
  const admin = createAdminClient() as any;
  const graines = new Map<string, string | null>();
  for (let i = 0; i < auteurs.length; i += 200) {
    const { data } = await admin.from('profiles').select('id, avatar_seed').in('id', auteurs.slice(i, i + 200));
    for (const row of (data ?? []) as { id: string; avatar_seed: string | null }[]) graines.set(row.id, row.avatar_seed);
  }
  const avatar = (id: string | null) => (id ? new URL(platformAvatarUrl(effectiveSeed(id, graines.get(id) ?? null)), req.url).href : null);

  const questions = lignes.map((l) => ({
    id: l.id,
    body: l.body,
    created_at: l.created_at,
    pseudo: l.student_pseudo || 'Élève',
    avatar_url: avatar(l.student_id),
    mine: l.student_id === auth.user.id,
    cours_id: l.cours_id,
    cours_titre: l.cours_titre,
    matiere_id: l.matiere_id,
    matiere_nom: l.matiere_nom,
    is_public: l.is_public,
    status: l.status,
    answers: (l.forum_answers ?? [])
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((a) => ({ id: a.id, body: a.body, created_at: a.created_at, author: a.professor_name || 'Équipe Major ECN', avatar_url: avatar(a.professor_id) })),
    replies: (l.forum_replies ?? [])
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
      .map((r) => ({
        id: r.id, body: r.body, created_at: r.created_at, author_role: r.author_role,
        author: r.author_name || (r.author_role === 'student' ? 'Élève' : 'Équipe Major ECN'),
        avatar_url: avatar(r.author_id), mine: r.author_id === auth.user.id,
      })),
  }));

  // Collèges et cours proposés pour une question : ceux de la faculté Major
  // ECN que l'élève a le droit d'ouvrir — même filtre que la page web.
  let colleges: { id: string; nom: string; cours: { id: string; titre: string }[] }[] = [];
  if (profile.role === 'student') {
    const { data: fac } = await db
      .from('facultes')
      .select('semestres(matieres(id, nom, order_index, cours(id, titre, order_index)))')
      .eq('id', EDN_FACULTE_ID)
      .maybeSingle();
    type Mat = { id: string; nom: string; order_index: number | null; cours?: { id: string; titre: string; order_index: number | null }[] | null };
    const scope = parseScope(profile.permission_scope);
    colleges = (((fac as { semestres?: { matieres?: Mat[] }[] } | null)?.semestres ?? []).flatMap((s) => s.matieres ?? []))
      .filter((m) => canAccessCollege(scope, m.id))
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
      .map((m) => ({
        id: m.id,
        nom: m.nom,
        cours: (m.cours ?? [])
          .filter((c) => canAccessCours(scope, m.id, c.id))
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
          .map((c) => ({ id: c.id, titre: c.titre })),
      }))
      .filter((m) => m.cours.length > 0);
  }

  return NextResponse.json({ role: profile.role, questions, colleges }, { headers: { 'Cache-Control': 'private, no-store' } });
}

const PostSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('ask'), body: z.string(), cours_id: z.string().max(120).nullish() }),
  z.object({ action: z.literal('reply'), question_id: z.string().uuid(), body: z.string() }),
  z.object({
    action: z.literal('report'),
    question_id: z.string().uuid(),
    cible: z.enum(['question', 'reponse', 'relance']),
    cible_id: z.string().uuid().nullish(),
    motif: z.string().max(500).nullish(),
  }),
]);

async function poser(auth: RequestAuth, profile: Profil, texte: string, coursId: string | null) {
  const body = texte.trim();
  if (body.length < 8) return NextResponse.json({ error: 'Formulez une question d’au moins 8 caractères.' }, { status: 400 });
  if (body.length > 4000) return NextResponse.json({ error: 'Question trop longue (4000 caractères max).' }, { status: 400 });
  if (profile.role === 'professor') {
    return NextResponse.json({ error: 'Les professeurs ne posent pas de questions sur le forum — ils y répondent.' }, { status: 403 });
  }
  const db = auth.supabase as any;

  let coursTitre: string | null = null;
  let matiereId: string | null = null;
  let matiereNom: string | null = null;
  if (coursId) {
    const { data: c } = await db.from('cours').select('id, titre, matiere_id, matieres(id, nom)').eq('id', coursId).maybeSingle();
    const scope = parseScope(profile.permission_scope);
    // Un cours hors des droits de l'élève n'est pas proposé : il ne se force pas.
    if (!c || (profile.role === 'student' && (!canAccessCollege(scope, c.matiere_id) || !canAccessCours(scope, c.matiere_id, c.id)))) {
      return NextResponse.json({ error: 'Cours indisponible.' }, { status: 400 });
    }
    coursTitre = c.titre;
    matiereId = c.matiere_id;
    matiereNom = (c as { matieres?: { nom?: string } }).matieres?.nom ?? null;
  }

  const pseudo = pseudoEleve(profile);
  const { data, error } = await db
    .from('forum_questions')
    .insert({
      student_id: auth.user.id,
      student_pseudo: pseudo,
      cours_id: coursId,
      matiere_id: matiereId,
      cours_titre: coursTitre,
      matiere_nom: matiereNom,
      body,
      ai_context: null,
    })
    .select('id')
    .single();
  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Impossible d’envoyer la question.' }, { status: 500 });

  // Enseignants du collège (ou de la spécialité de l'élève), comme le web.
  // Attendu avant de répondre : une fonction serverless peut être gelée dès
  // la réponse envoyée.
  const identite = identityFromProfile({
    id: auth.user.id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    email: profile.email ?? auth.user.email ?? null,
    permission_scope: profile.permission_scope,
  });
  await notifyProfessorsOfNewQuestion({
    questionId: data.id,
    matiereId,
    eleveScope: profile.permission_scope,
    studentPseudo: pseudo,
    studentName: identite.name === ELEVE_SANS_NOM ? pseudo : identite.name,
    studentContext: identityContext(identite),
    coursTitre,
    matiereNom,
    body,
  }).catch(() => { /* best-effort, ne bloque jamais la création */ });

  return NextResponse.json({ ok: true, id: data.id });
}

export async function POST(req: Request) {
  const ctx = await contexte(req);
  if (ctx instanceof NextResponse) return ctx;
  const { auth } = ctx;
  const profile = ctx.profile as Profil;

  const parsed = PostSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides.' }, { status: 400 });
  const input = parsed.data;

  if (input.action === 'ask') return poser(auth, profile, input.body, input.cours_id ?? null);

  const db = auth.supabase as any;
  // La question doit être lisible par l'élève (RLS : publique ou la sienne).
  const { data: q } = await db
    .from('forum_questions')
    .select('id, student_id, student_pseudo, body, forum_answers(id, body, professor_name), forum_replies(id, body, author_name)')
    .eq('id', input.question_id)
    .maybeSingle();
  if (!q) return NextResponse.json({ error: 'Question introuvable.' }, { status: 404 });

  if (input.action === 'reply') {
    const body = input.body.trim();
    if (body.length < 1) return NextResponse.json({ error: 'Réponse trop courte.' }, { status: 400 });
    if (body.length > 8000) return NextResponse.json({ error: 'Réponse trop longue.' }, { status: 400 });
    // L'élève ne relance que SES discussions (web : addReplyAction).
    if (profile.role === 'student' && q.student_id !== auth.user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez répondre que dans vos propres discussions.' }, { status: 403 });
    }
    if (profile.role === 'professor') {
      return NextResponse.json({ error: 'Répondez depuis l’espace enseignant du site.' }, { status: 403 });
    }
    const authorName = profile.role === 'student'
      ? pseudoEleve(profile)
      : ((profile.pseudo ?? '').trim() || [profile.first_name, profile.last_name].filter(Boolean).join(' ').trim() || 'Équipe Major ECN');
    const { error } = await db.from('forum_replies').insert({
      question_id: input.question_id,
      author_id: auth.user.id,
      author_role: profile.role,
      author_name: authorName,
      body,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // ── Signalement ──
  const cible = input.cible;
  let extrait: string = q.body;
  let auteur: string = q.student_pseudo || 'Élève';
  if (cible === 'reponse') {
    const a = ((q.forum_answers ?? []) as { id: string; body: string; professor_name: string | null }[]).find((x) => x.id === input.cible_id);
    if (!a) return NextResponse.json({ error: 'Réponse introuvable.' }, { status: 404 });
    extrait = a.body; auteur = a.professor_name || 'Équipe Major ECN';
  } else if (cible === 'relance') {
    const r = ((q.forum_replies ?? []) as { id: string; body: string; author_name: string | null }[]).find((x) => x.id === input.cible_id);
    if (!r) return NextResponse.json({ error: 'Message introuvable.' }, { status: 404 });
    extrait = r.body; auteur = r.author_name || 'Élève';
  }
  const envoye = await notifyTeamOfForumReport({
    questionId: input.question_id,
    cible,
    extrait,
    auteurAffiche: auteur,
    signalePar: profile.role === 'student' ? pseudoEleve(profile) : (profile.pseudo ?? profile.role),
    motif: (input.motif ?? '').trim(),
  });
  if (!envoye) return NextResponse.json({ error: 'Signalement non transmis. Réessayez dans un instant.' }, { status: 502 });
  return NextResponse.json({ ok: true });
}
