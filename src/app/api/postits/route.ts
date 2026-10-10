import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getRequestUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  ErreurPostit, ajouterPlacement, ajouterTache, archiver, creerPostit, deplacer, ecrirePreferencesPostit,
  lireBibliotheque, lirePostit, lirePostitsCours, lirePostitsEmplacement, lirePreferencesPostit,
  modifierPostit, modifierTache, placer, resoudreEmplacement, restaurer, retirerPlacement, supprimer,
  supprimerTache, type Db,
} from '@/lib/postits/depot';
import { COULEURS, RAPPELS, contexteDeCle } from '@/lib/postits/regles';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * « Mes Post-it » (web : cookie ; app mobile : Bearer + X-Device-Id).
 *
 *  GET ?emplacement=<clé>[&postit=<id>] → notes actives de la page (+ la note
 *      demandée par « Ouvrir dans sa page » si elle n'y est pas placée)
 *  GET ?vue=bibliotheque               → toutes les notes (corbeille comprise)
 *  GET ?cours=<uuid>                   → notes d'un item, archivées comprises (§32)
 *  POST { action, … }                  → création, édition, placement, cycle de
 *      vie, tâches, préférences (cf. schéma `Action` ci-dessous)
 *
 * Toutes les lectures / écritures passent par le client de l'élève (RLS
 * propriétaire) ET sont bornées par son identifiant (lib/postits/depot).
 */

async function auth(req: Request) {
  const a = await getRequestUser(req);
  if (!a) return { erreur: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) };
  if (a.via === 'bearer') {
    const check = await assertDeviceSlot(a.user.id, req.headers.get(DEVICE_HEADER));
    if (!check.ok) return { erreur: check.response };
  }
  return { userId: a.user.id, db: a.supabase as unknown as Db };
}

function repondreErreur(e: unknown) {
  if (e instanceof ErreurPostit) return NextResponse.json({ error: e.message }, { status: e.status });
  console.error('[postits]', e);
  return NextResponse.json({ error: 'Opération impossible pour le moment.' }, { status: 500 });
}

const SANS_CACHE = { 'Cache-Control': 'private, no-store' };
const uuid = z.string().uuid();
const cle = z.string().min(1).max(200).refine((c) => contexteDeCle(c) != null, 'Emplacement inconnu');

export async function GET(req: Request) {
  const r = await auth(req);
  if ('erreur' in r) return r.erreur;
  const url = new URL(req.url);
  try {
    if (url.searchParams.get('vue') === 'bibliotheque') {
      const [postits, preferences] = await Promise.all([lireBibliotheque(r.db, r.userId), lirePreferencesPostit(r.db, r.userId)]);
      return NextResponse.json({ postits, preferences }, { headers: SANS_CACHE });
    }
    const cours = url.searchParams.get('cours');
    if (cours) {
      if (!uuid.safeParse(cours).success) return NextResponse.json({ error: 'Item invalide' }, { status: 400 });
      return NextResponse.json({ postits: await lirePostitsCours(r.db, r.userId, cours) }, { headers: SANS_CACHE });
    }
    const emplacement = cle.safeParse(url.searchParams.get('emplacement') ?? '');
    if (!emplacement.success) return NextResponse.json({ error: 'Emplacement invalide' }, { status: 400 });
    const [postits, contexte] = await Promise.all([
      lirePostitsEmplacement(r.db, r.userId, emplacement.data),
      resoudreEmplacement(r.db, createAdminClient() as unknown as Db, emplacement.data).catch(() => null),
    ]);
    // « Ouvrir dans sa page » (§28) : la note est montrée même si elle a été
    // déplacée ailleurs depuis (l'élève peut alors la reposer ici).
    let cible = null;
    const demande = url.searchParams.get('postit');
    if (demande && uuid.safeParse(demande).success && !postits.some((p) => p.id === demande)) {
      cible = await lirePostit(r.db, r.userId, demande).catch(() => null);
      if (cible?.statut === 'supprime') cible = null;
    }
    return NextResponse.json({ postits, contexte, cible }, { headers: SANS_CACHE });
  } catch (e) {
    return repondreErreur(e);
  }
}

const geometrie = {
  x: z.number().finite().optional(),
  y: z.number().finite().optional(),
  w: z.number().finite().optional(),
  h: z.number().finite().optional(),
};
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional();
const heure = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable().optional();
const rappels = z.array(z.enum(RAPPELS)).max(4).optional();
const taille = z.enum(['petit', 'moyen', 'grand', 'libre']);

const Action = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('creer'), emplacement: cle, chemin: z.string().max(500).optional(),
    titre: z.string().max(200).optional(), contenu: z.string().max(20000).optional(),
    couleur: z.enum(COULEURS).optional(), taille: taille.optional(), ...geometrie,
  }),
  z.object({
    action: z.literal('modifier'), id: uuid,
    titre: z.string().max(200).optional(), contenu: z.string().max(20000).optional(),
    couleur: z.enum(COULEURS).optional(), taille: taille.optional(),
  }),
  z.object({ action: z.literal('placer'), placementId: uuid, ...geometrie, z: z.number().int().optional(), reduit: z.boolean().optional(), taille: taille.optional() }),
  z.object({ action: z.literal('deplacer'), id: uuid, depuis: cle.nullable(), vers: cle }),
  z.object({ action: z.literal('afficherAussi'), id: uuid, vers: cle }),
  z.object({ action: z.literal('retirer'), id: uuid, emplacement: cle }),
  z.object({ action: z.literal('archiver'), id: uuid, taches: z.enum(['conserver', 'archiver']).default('conserver') }),
  z.object({ action: z.literal('restaurer'), id: uuid, vers: cle.nullable().optional() }),
  z.object({ action: z.literal('supprimer'), id: uuid }),
  z.object({ action: z.literal('tacheAjouter'), postitId: uuid, texte: z.string().min(1).max(500), date, heure, rappels }),
  z.object({
    action: z.literal('tacheModifier'), id: uuid,
    texte: z.string().min(1).max(500).optional(), fait: z.boolean().optional(), date, heure, rappels, ordre: z.number().int().optional(),
  }),
  z.object({ action: z.literal('tacheSupprimer'), id: uuid }),
  z.object({ action: z.literal('preferences'), rappelsActifs: z.boolean() }),
]);

export async function POST(req: Request) {
  const r = await auth(req);
  if ('erreur' in r) return r.erreur;
  const p = Action.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json({ error: p.error.issues[0]?.message ?? 'Requête invalide' }, { status: 400 });
  const a = p.data;
  const { db, userId } = r;
  const contenu = () => createAdminClient() as unknown as Db;
  try {
    switch (a.action) {
      case 'creer':
        return NextResponse.json({ postit: await creerPostit(db, contenu(), userId, {
          cle: a.emplacement, chemin: a.chemin, titre: a.titre, contenu: a.contenu, couleur: a.couleur, taille: a.taille,
          geometrie: { x: a.x, y: a.y, w: a.w, h: a.h },
        }) });
      case 'modifier':
        return NextResponse.json({ postit: await modifierPostit(db, userId, a.id, a) });
      case 'placer':
        await placer(db, userId, a.placementId, a);
        return NextResponse.json({ ok: true });
      case 'deplacer':
        return NextResponse.json({ postit: await deplacer(db, contenu(), userId, a.id, a.depuis, a.vers) });
      case 'afficherAussi':
        return NextResponse.json({ postit: await ajouterPlacement(db, contenu(), userId, a.id, a.vers) });
      case 'retirer':
        return NextResponse.json({ postit: await retirerPlacement(db, userId, a.id, a.emplacement) });
      case 'archiver':
        return NextResponse.json({ postit: await archiver(db, userId, a.id, a.taches) });
      case 'restaurer':
        return NextResponse.json({ postit: await restaurer(db, contenu(), userId, a.id, a.vers ?? null) });
      case 'supprimer':
        return NextResponse.json({ postit: await supprimer(db, userId, a.id) });
      case 'tacheAjouter':
        await ajouterTache(db, userId, a.postitId, { texte: a.texte, date: a.date, heure: a.heure, rappels: a.rappels });
        return NextResponse.json({ postit: await lirePostit(db, userId, a.postitId) });
      case 'tacheModifier': {
        const { action: _action, id, ...patch } = a;
        void _action;
        return NextResponse.json({ tache: await modifierTache(db, userId, id, patch) });
      }
      case 'tacheSupprimer':
        await supprimerTache(db, userId, a.id);
        return NextResponse.json({ ok: true });
      case 'preferences':
        return NextResponse.json({ preferences: await ecrirePreferencesPostit(db, userId, { rappelsActifs: a.rappelsActifs }) });
    }
  } catch (e) {
    return repondreErreur(e);
  }
}
