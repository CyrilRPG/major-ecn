import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getRequestUser } from '@/lib/auth/bearer';
import {
  enregistrerBrouillon, envoiDuCandidat, marquerAffiche, reporterBlocage, soumettre,
} from '@/lib/qualite/serveur/soumission';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Un questionnaire du candidat connecté : lecture (marqué « affiché »). */
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { id } = await params;
  const e = await envoiDuCandidat(auth.user.id, id);
  if (!e) return NextResponse.json({ error: 'Questionnaire introuvable' }, { status: 404 });
  await marquerAffiche(e);
  return NextResponse.json({
    id: e.id, famille: e.famille, titre: e.titre, intro: e.intro, questions: e.questions, statut: e.statut,
    obligatoire: e.obligatoire, contexte: e.contexte, brouillon: e.brouillon,
  });
}

/**
 * Actions du candidat : `brouillon` (réponses partielles), `soumettre`,
 * `reporter` (problème technique : blocage levé temporairement).
 * Un administrateur connecté « en tant que » l'élève ne répond jamais à sa place.
 */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  if (auth.via === 'cookie' && (await cookies()).has('impersonator_id')) {
    return NextResponse.json({ error: 'Vue « en tant que » : un administrateur ne répond pas à la place du candidat.' }, { status: 403 });
  }
  const { id } = await params;
  const e = await envoiDuCandidat(auth.user.id, id);
  if (!e) return NextResponse.json({ error: 'Questionnaire introuvable' }, { status: 404 });
  const body = await req.json().catch(() => ({})) as { action?: string; reponses?: Record<string, unknown>; motif?: string };
  const reponses = body.reponses && typeof body.reponses === 'object' ? body.reponses : {};
  if (body.action === 'brouillon') {
    const r = await enregistrerBrouillon(e, reponses);
    return NextResponse.json(r, { status: r.ok ? 200 : 400 });
  }
  if (body.action === 'reporter') {
    const motif = (body.motif ?? '').trim();
    if (motif.length < 3) return NextResponse.json({ ok: false, error: 'Décrivez le problème en quelques mots.' }, { status: 400 });
    const r = await reporterBlocage(e, motif);
    return NextResponse.json(r, { status: r.ok ? 200 : 400 });
  }
  if (body.action === 'soumettre') {
    const r = await soumettre(e, reponses, auth.via === 'bearer' ? 'app' : 'web');
    return NextResponse.json(r, { status: r.ok ? 200 : 400 });
  }
  return NextResponse.json({ error: 'Action inconnue' }, { status: 400 });
}
