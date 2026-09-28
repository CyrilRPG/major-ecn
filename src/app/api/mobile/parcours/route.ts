/* eslint-disable @typescript-eslint/no-explicit-any -- `major_parcours*` sont absentes de
   l'instantané curaté de `types/database.ts`. */
import { NextResponse } from 'next/server';
import { getBearerUser, type RequestAuth } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasMedecineGeneraleAccess, parseScope } from '@/lib/auth/permissions';
import { fetchContentAccessForScopeWith } from '@/lib/auth/formula-permissions';
import { fetchCompletions, fetchParcoursByNumero, fetchParcoursList } from '@/lib/parcours/source';
import {
  computeScore10, computeStates, peutJouer, prochaineOuverture, scoreBand,
  type ParcoursLite,
} from '@/lib/parcours/parcours';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * /api/mobile/parcours — le Parcours du Major de l'app, sur les VRAIES tables
 * (`major_parcours`, `major_parcours_questions`, `major_parcours_completions`)
 * et avec les règles des pages web `(student)/parcours/**` et de
 * `submitParcoursAction`. L'app lisait des tables inexistantes
 * (`parcours_du_major*`) : l'écran était vide pour tout le monde, et ouvert à
 * tous.
 *
 * Accès : administrateur, ou élève dont la formule donne `parcoursMajor` ET qui
 * a accès à la Médecine générale. Sinon 403 `{ code: 'PARCOURS_FERME' }`.
 *
 * GET → { parcours: Noeud[], total, termines, maitrises, prochaine, aJour }
 *   Noeud = { id, numero, titre, sous_titre, available_at, etat, score, band }
 *   etat ∈ 'completed' | 'current' | 'locked_prev' | 'locked_date'
 * GET ?numero=N → { parcours, questions, deja, suivant }
 *   403 `{ code: 'PARCOURS_VERROUILLE' }` si le parcours n'est pas jouable
 *   (`peutJouer` : date passée et précédent terminé ; admin : toujours).
 *   Les questions portent leur corrigé, comme sur le web (le runner corrige
 *   question par question).
 * POST { parcours_id, answers } → { score, band }
 *   answers : { [question_id]: { selected?: string[]; self?: 'correct' | 'wrong'; text?: string } }
 *   La note est RECALCULÉE ici : QCM regradés d'après la base, QROC =
 *   auto-évaluation déclarée. Une complétion par (élève, parcours).
 */

async function contexte(req: Request): Promise<{ auth: RequestAuth; admin: boolean } | NextResponse> {
  const auth = await getBearerUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const check = await assertDeviceSlot(auth.user.id, req.headers.get(DEVICE_HEADER));
  if (!check.ok) return check.response;
  const { data: profile } = await (createAdminClient() as any)
    .from('profiles').select('role, permission_scope').eq('id', auth.user.id).maybeSingle();
  const admin = profile?.role === 'admin';
  if (!admin) {
    // Client de la requête Bearer : la version à cookie (`fetchContentAccessForScope`)
    // n'a pas de session dans l'app et lisait la config des formules en anonyme.
    const access = await fetchContentAccessForScopeWith(auth.supabase, parseScope(profile?.permission_scope));
    if (!access.parcoursMajor || !hasMedecineGeneraleAccess(profile?.permission_scope)) {
      return NextResponse.json(
        { error: 'Le Parcours du Major est réservé aux élèves de Médecine générale autorisés.', code: 'PARCOURS_FERME' },
        { status: 403 },
      );
    }
  }
  return { auth, admin };
}

function lite(rows: { id: string; numero: number; titre: string; sous_titre: string | null; available_at: string; active: boolean }[]): ParcoursLite[] {
  return rows.filter((p) => p.active).map((p) => ({
    id: p.id, numero: p.numero, titre: p.titre, sousTitre: p.sous_titre, availableAt: p.available_at,
  }));
}

export async function GET(req: Request) {
  const ctx = await contexte(req);
  if (ctx instanceof NextResponse) return ctx;
  const { auth, admin } = ctx;
  const sb = auth.supabase as any;
  const numeroParam = new URL(req.url).searchParams.get('numero');

  if (numeroParam !== null) {
    const numero = Number(numeroParam);
    if (!Number.isInteger(numero)) return NextResponse.json({ error: 'Parcours introuvable' }, { status: 404 });
    const loaded = await fetchParcoursByNumero(sb, numero);
    // Le repli statique (`static-…`) ne sert qu'à l'aperçu web sans base.
    if (!loaded || loaded.source !== 'db' || !loaded.parcours.active) {
      return NextResponse.json({ error: 'Parcours introuvable' }, { status: 404 });
    }
    const completions = await fetchCompletions(sb, auth.user.id);
    if (!admin) {
      const { rows } = await fetchParcoursList(sb);
      if (!peutJouer(lite(rows), completions, loaded.parcours.id, new Date(), false)) {
        return NextResponse.json({ error: 'Terminez le parcours précédent pour débloquer celui-ci.', code: 'PARCOURS_VERROUILLE' }, { status: 403 });
      }
    }
    const comp = completions.find((c) => c.parcoursId === loaded.parcours.id) ?? null;
    // Ordre = séquence du support, QCM compris : jamais de retri par section.
    const questions = loaded.questions.slice().sort((a, b) => a.ordre - b.ordre).map((q) => ({
      id: q.id,
      section: q.section,
      format: q.format,
      enonce_html: q.enonce_html ?? '',
      image_url: q.image_path || null,
      items: (q.items ?? []).map((it) => ({ lettre: it.lettre, texte: it.texte, correct: !!it.correct })),
      reponse_attendue: q.reponse_attendue,
      explication_html: q.explication_html,
    }));
    const p = loaded.parcours;
    return NextResponse.json({
      parcours: { id: p.id, numero: p.numero, titre: p.titre, sous_titre: p.sous_titre, intro_html: p.intro_html, vignette_html: p.vignette_html },
      questions,
      deja: comp ? { score: comp.score, band: comp.band } : null,
      suivant: numero < 42 ? numero + 1 : null,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  }

  const [{ rows, source }, completions] = await Promise.all([fetchParcoursList(sb), fetchCompletions(sb, auth.user.id)]);
  const now = new Date();
  const actifs = source === 'db' ? lite(rows) : [];
  // Même liste que la page web : les parcours ouverts (tous pour l'admin).
  const visibles = actifs.filter((p) => admin || new Date(p.availableAt).getTime() <= now.getTime());
  // États « élève » (cadenas, dates) pour tous — l'admin reste libre d'ouvrir.
  const states = computeStates(visibles, completions, now, false);
  const parcours = visibles.map((p) => {
    const st = states.get(p.id);
    return {
      id: p.id,
      numero: p.numero,
      titre: p.titre,
      sous_titre: p.sousTitre,
      available_at: p.availableAt,
      etat: st?.kind ?? 'locked_prev',
      score: st?.kind === 'completed' ? st.score : null,
      band: st?.kind === 'completed' ? st.band : null,
      jouable: admin || st?.kind === 'current' || st?.kind === 'completed',
    };
  });
  const ouverts = visibles.filter((p) => new Date(p.availableAt).getTime() <= now.getTime());
  const idsVisibles = new Set(visibles.map((p) => p.id));
  const faits = completions.filter((c) => idsVisibles.has(c.parcoursId));
  return NextResponse.json({
    parcours,
    total: visibles.length,
    termines: faits.length,
    maitrises: faits.filter((c) => c.band === 'maitrise').length,
    // Prochaine ouverture sur le catalogue complet : la liste n'affiche que
    // les parcours ouverts, mais l'élève à jour doit savoir quand revenir.
    prochaine: prochaineOuverture(actifs, now),
    aJour: ouverts.length > 0 && ouverts.every((p) => states.get(p.id)?.kind === 'completed'),
  }, { headers: { 'Cache-Control': 'private, no-store' } });
}

type Reponse = { selected?: unknown; self?: unknown; text?: unknown };

export async function POST(req: Request) {
  const ctx = await contexte(req);
  if (ctx instanceof NextResponse) return ctx;
  const { auth, admin } = ctx;
  const sb = auth.supabase as any;

  const body = await req.json().catch(() => ({})) as { parcours_id?: unknown; answers?: Record<string, Reponse> };
  const parcoursId = typeof body.parcours_id === 'string' ? body.parcours_id : '';
  if (!parcoursId || parcoursId.startsWith('static-')) return NextResponse.json({ error: 'Parcours introuvable' }, { status: 404 });

  // Jouable ? Même règle que la page du parcours : on n'enregistre pas la note
  // d'un parcours que l'élève ne peut pas ouvrir.
  const [{ rows }, completions] = await Promise.all([fetchParcoursList(sb), fetchCompletions(sb, auth.user.id)]);
  if (!rows.some((r) => r.id === parcoursId && r.active)) return NextResponse.json({ error: 'Parcours introuvable' }, { status: 404 });
  if (!admin && !peutJouer(lite(rows), completions, parcoursId, new Date(), false)) {
    return NextResponse.json({ error: 'Terminez le parcours précédent pour débloquer celui-ci.', code: 'PARCOURS_VERROUILLE' }, { status: 403 });
  }

  const { data: qRows, error } = await sb
    .from('major_parcours_questions')
    .select('id, format, items')
    .eq('parcours_id', parcoursId);
  const questions = (qRows ?? []) as { id: string; format: 'qcm' | 'qroc'; items: { lettre: string; correct?: boolean }[] | null }[];
  if (error || questions.length === 0) return NextResponse.json({ error: 'Parcours sans exercice.' }, { status: 400 });

  const answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
  const propres: Record<string, { selected?: string[]; self?: 'correct' | 'wrong'; text?: string }> = {};
  let correct = 0;
  for (const q of questions) {
    const a = answers[q.id];
    if (q.format === 'qcm') {
      const choisies = Array.isArray(a?.selected) ? a!.selected.filter((l): l is string => typeof l === 'string') : [];
      propres[q.id] = { selected: choisies };
      const bonnes = new Set((q.items ?? []).filter((it) => it.correct).map((it) => it.lettre));
      const set = new Set(choisies);
      if (bonnes.size === set.size && [...bonnes].every((l) => set.has(l))) correct++;
    } else {
      const self = a?.self === 'correct' ? 'correct' : 'wrong';
      propres[q.id] = { self, text: typeof a?.text === 'string' ? a.text.slice(0, 8000) : '' };
      if (self === 'correct') correct++;
    }
  }
  const score = computeScore10(correct, questions.length);
  const band = scoreBand(score);

  const { error: upErr } = await sb
    .from('major_parcours_completions')
    .upsert(
      { user_id: auth.user.id, parcours_id: parcoursId, score, band, answers: propres, completed_at: new Date().toISOString() },
      { onConflict: 'user_id,parcours_id' },
    );
  if (upErr) return NextResponse.json({ error: 'Note non enregistrée. Réessayez.' }, { status: 500 });
  return NextResponse.json({ score, band, correct, total: questions.length });
}
