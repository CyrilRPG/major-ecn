import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireDecouverteRequest } from '@/lib/decouverte/acces';
import { envoyerTest } from '@/lib/decouverte/serveur';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

const Texte = z.string().max(2000);
const Corps = z.object({
  type: z.enum(['R1', 'R2', 'R3', 'ancien_acces', 'renvoi_lien']),
  email: z.string().trim().email('Adresse de test invalide'),
  surcharge: z.object({
    objet: Texte, preheader: Texte, surtitre: Texte, titre: Texte, paragraphes: z.array(Texte).max(8), cta: Texte, sousCta: Texte,
    ligneVideoIntro: Texte, ligneVideo: Texte, aideTitre: Texte, aideTexte: Texte, signature: Texte,
  }).partial().optional().nullable(),
});

/**
 * E-mail de test (§23) : vers l'adresse saisie, objet préfixé « [TEST] »,
 * liens de démonstration, AUCUN effet sur les candidats. Peut porter le
 * modèle en cours d'édition (non enregistré).
 */
export async function POST(req: Request) {
  const g = await requireDecouverteRequest(req, 'gerer');
  if (!g.ok) return g.error;
  const parsed = Corps.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Requête invalide' }, { status: 400 });
  try {
    const r = await envoyerTest({ acteur: g.acteur, type: parsed.data.type, email: parsed.data.email, surcharge: parsed.data.surcharge ?? null });
    if (r.statut === 'envoye' || r.statut === 'a_reprendre') return NextResponse.json({ ok: true, statut: r.statut });
    return NextResponse.json({ error: r.statut === 'exclu' ? r.raison : r.erreur }, { status: 502 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Erreur' }, { status: 400 });
  }
}
