import { z } from 'zod';
import { db } from '@/lib/echanges/serveur/base';
import { accesGroupe, REFUS } from '@/lib/echanges/serveur/acces';
import { accuserLecture, epingler, modifier, reagir, signaler, supprimer, visible, COLONNES_MESSAGE, type MessageRow } from '@/lib/echanges/serveur/messages';
import { authentifier, erreur, garde, lireJson, ok } from '@/lib/echanges/serveur/http';

export const dynamic = 'force-dynamic';

type Ctx = { params: Promise<{ id: string }> };

async function charger(req: Request, ctx: Ctx) {
  const a = await authentifier(req);
  if ('reponse' in a) return a;
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { reponse: erreur({ error: 'Message introuvable.', code: 'INTROUVABLE' }) };
  const { data } = await db().from('echanges_messages').select(COLONNES_MESSAGE).eq('id', id).maybeSingle();
  const m = data as MessageRow | null;
  if (!m) return { reponse: erreur({ error: 'Cette question n’est plus disponible.', code: 'INTROUVABLE' }) };
  const acces = await accesGroupe(a.acteur, m.groupe_id);
  if (!acces || !acces.droits.lire) return { reponse: erreur(REFUS, 404) };
  return { acteur: a.acteur, acces, m };
}

/**
 * Lien direct (e-mail « Répondre à la question », notification) : où se
 * trouve le message ? Un message supprimé répond sobrement « n'est plus
 * disponible » (§75), sans rien exposer d'autre.
 */
export async function GET(req: Request, ctx: Ctx) {
  return garde('message', async () => {
    const r = await charger(req, ctx);
    if ('reponse' in r) return r.reponse;
    if (!visible(r.m, r.acteur, r.acces)) return erreur({ error: 'Cette question n’est plus disponible.', code: 'INTROUVABLE' });
    return ok({ groupeId: r.m.groupe_id, canal: r.m.canal, id: r.m.id });
  });
}

/** Modification de son message (fenêtre paramétrée, §73). */
export async function PATCH(req: Request, ctx: Ctx) {
  return garde('modification', async () => {
    const r = await charger(req, ctx);
    if ('reponse' in r) return r.reponse;
    const b = await lireJson<{ contenu?: string }>(req);
    const res = await modifier(r.acteur, r.acces, r.m.id, String(b.contenu ?? ''));
    return 'error' in res ? erreur(res) : ok(res);
  });
}

/** Suppression d'un message (le sien ; tout message pour l'équipe qui modère). */
export async function DELETE(req: Request, ctx: Ctx) {
  return garde('suppression', async () => {
    const r = await charger(req, ctx);
    if ('reponse' in r) return r.reponse;
    const res = await supprimer(r.acteur, r.acces, [r.m.id]);
    return 'error' in res ? erreur(res) : ok(res);
  });
}

const Action = z.discriminatedUnion('action', [
  z.object({ action: z.literal('reaction'), emoji: z.string().min(1).max(16) }),
  z.object({ action: z.literal('epingle'), epingle: z.boolean(), avecQuestion: z.boolean().optional() }),
  z.object({ action: z.literal('signaler'), motif: z.string().max(80), details: z.string().max(1000).nullish() }),
  z.object({ action: z.literal('accuse') }),
]);

/** Réaction, épinglage, signalement, accusé de lecture d'une annonce. */
export async function POST(req: Request, ctx: Ctx) {
  return garde('message-action', async () => {
    const r = await charger(req, ctx);
    if ('reponse' in r) return r.reponse;
    const p = Action.safeParse(await lireJson(req));
    if (!p.success) return erreur({ error: 'Requête invalide.', code: 'INVALIDE' });
    const d = p.data;
    const res = d.action === 'reaction'
      ? await reagir(r.acteur, r.acces, r.m.id, d.emoji)
      : d.action === 'epingle'
        ? await epingler(r.acteur, r.acces, r.m.id, { epingle: d.epingle, avecQuestion: d.avecQuestion })
        : d.action === 'signaler'
          ? await signaler(r.acteur, r.acces, r.m.id, d.motif, d.details ?? null)
          : await accuserLecture(r.acteur, r.acces, r.m.id);
    return 'error' in res ? erreur(res) : ok(res);
  });
}
