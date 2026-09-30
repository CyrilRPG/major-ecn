import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireDecouverteRequest } from '@/lib/decouverte/acces';
import { ajouterNote, chargerFiche, oppositionAdmin, revoquerLiens, saisirHistorique } from '@/lib/decouverte/serveur';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

const UUID = /^[0-9a-f-]{36}$/i;

/** Fiche candidat : identité, statut + « pourquoi », envois, timeline complète, liens. */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireDecouverteRequest(req, 'consulter');
  if (!g.ok) return g.error;
  const { id } = await ctx.params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 });
  try {
    return NextResponse.json({ ...(await chargerFiche(id)), droits: g.droits }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 404 });
  }
}

const Action = z.discriminatedUnion('action', [
  z.object({ action: z.literal('note'), texte: z.string().trim().min(1).max(4000) }),
  z.object({
    action: z.literal('historique'),
    type: z.enum(['R1', 'R2', 'R3', 'ancien_acces', 'ancienne_relance']),
    jour: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    heure: z.string().regex(/^\d{2}:\d{2}$/),
    commentaire: z.string().trim().max(500).optional().nullable(),
  }),
  z.object({ action: z.literal('opposition'), commentaire: z.string().trim().max(500).optional().nullable() }),
  z.object({ action: z.literal('revoquer_liens') }),
]);

/** Actions de rédaction sur la fiche (droit « rédiger ») — toutes tracées dans la timeline. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const g = await requireDecouverteRequest(req, 'rediger');
  if (!g.ok) return g.error;
  const { id } = await ctx.params;
  if (!UUID.test(id)) return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 });
  const parsed = Action.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Requête invalide' }, { status: 400 });
  const a = parsed.data;
  try {
    switch (a.action) {
      case 'note':
        await ajouterNote(g.acteur, id, a.texte);
        return NextResponse.json({ ok: true });
      case 'historique': {
        const r = await saisirHistorique({ acteur: g.acteur, candidatId: id, type: a.type, jour: a.jour, heure: a.heure, commentaire: a.commentaire ?? null, origine: 'manuel' });
        return r.ok ? NextResponse.json({ ok: true, envoiId: r.envoiId }) : NextResponse.json({ error: r.erreur }, { status: 409 });
      }
      case 'opposition':
        await oppositionAdmin(g.acteur, id, a.commentaire ?? null);
        return NextResponse.json({ ok: true });
      case 'revoquer_liens':
        return NextResponse.json({ ok: true, revoques: await revoquerLiens(g.acteur, id) });
    }
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 400 });
  }
}
