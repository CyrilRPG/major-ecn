import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireDecouverteRequest } from '@/lib/decouverte/acces';
import { CLE_RE, preparerOperation } from '@/lib/decouverte/serveur';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

const Corps = z.object({
  cle: z.string().regex(CLE_RE, 'Clé d’opération invalide'),
  candidatIds: z.array(z.string().regex(/^[0-9a-f-]{36}$/i)).min(1).max(5000),
  type: z.enum(['groupe', 'individuel', 'exceptionnel']),
  typeForce: z.enum(['R1', 'R2', 'R3', 'ancien_acces']).optional().nullable(),
  commentaire: z.string().trim().max(500).optional().nullable(),
});

/**
 * Préparation d'une opération d'envoi (§10, §12) : contrôle de chaque
 * candidat sur un état relu à l'instant, modèle choisi automatiquement,
 * ventilation calculée par le serveur pour la confirmation. Rien ne part ici.
 * Envoi groupé : droit « gérer » ; relance individuelle ou exceptionnelle :
 * droit « rédiger ».
 */
export async function POST(req: Request) {
  const parsed = Corps.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Requête invalide' }, { status: 400 });
  const b = parsed.data;
  const g = await requireDecouverteRequest(req, b.type === 'groupe' ? 'gerer' : 'rediger');
  if (!g.ok) return g.error;
  try {
    const prep = await preparerOperation({ acteur: g.acteur, cle: b.cle, candidatIds: b.candidatIds, type: b.type, typeForce: b.typeForce ?? null, commentaire: b.commentaire ?? null });
    return NextResponse.json(prep);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 400 });
  }
}
