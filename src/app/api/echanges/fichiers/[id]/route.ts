import { NextResponse } from 'next/server';
import { db } from '@/lib/echanges/serveur/base';
import { accesGroupe } from '@/lib/echanges/serveur/acces';
import { urlTelechargement, valider } from '@/lib/echanges/serveur/fichiers';
import { authentifier, erreur, garde, groupeOuRefus, ok } from '@/lib/echanges/serveur/http';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

async function groupeDe(id: string): Promise<string | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await db().from('echanges_pieces_jointes').select('groupe_id').eq('id', id).maybeSingle();
  return data?.groupe_id ?? null;
}

/**
 * Ouverture d'une pièce jointe : accès au groupe revérifié À CHAQUE demande,
 * puis redirection vers une URL signée de 60 secondes (§70, §99). Une URL de
 * fichier conservée d'une ancienne session ne donne donc rien.
 */
export async function GET(req: Request, ctx: Ctx) {
  return garde('fichier-lecture', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    const { id } = await ctx.params;
    const groupeId = await groupeDe(id);
    const acces = groupeId ? await accesGroupe(a.acteur, groupeId) : null;
    const url = acces ? await urlTelechargement(a.acteur, acces, id, new URL(req.url).searchParams.get('telecharger') === '1') : null;
    if (!url) return erreur({ error: 'Fichier indisponible.', code: 'INTROUVABLE' }, 404);
    if (new URL(req.url).searchParams.get('format') === 'json') return ok({ url });
    return NextResponse.redirect(url, { status: 302, headers: { 'Cache-Control': 'private, no-store' } });
  });
}

/** Validation après téléversement : taille, type réel, contenu actif, coordonnées. */
export async function POST(req: Request, ctx: Ctx) {
  return garde('fichier-validation', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    const { id } = await ctx.params;
    const groupeId = await groupeDe(id);
    if (!groupeId) return erreur({ error: 'Fichier introuvable.', code: 'INTROUVABLE' });
    const g = await groupeOuRefus(a.acteur, groupeId);
    if ('reponse' in g) return g.reponse;
    const r = await valider(a.acteur, g.acces, id);
    return 'error' in r ? erreur(r) : ok(r);
  });
}
