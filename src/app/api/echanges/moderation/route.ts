import { z } from 'zod';
import {
  appliquerSanction, effacementRgpd, exportRgpd, leverSanction, libererBlocage, refuserMessages, reintegrer,
  restaurerMessages, traiterSignalement, validerMessages,
} from '@/lib/echanges/serveur/moderation';
import { reaffecter } from '@/lib/echanges/serveur/questions';
import { transformerEnPermanente } from '@/lib/echanges/serveur/bibliotheque';
import { authentifier, erreur, garde, lireJson, ok } from '@/lib/echanges/serveur/http';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const uuid = z.string().uuid();
const Action = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('sanction'), userId: uuid, groupeId: uuid.nullish(),
    type: z.enum(['avertissement', 'lecture_seule', 'suspension', 'exclusion', 'restriction_tag']),
    motif: z.string().max(500).nullish(), messageEleve: z.string().max(2000).nullish(),
    dureeHeures: z.number().int().positive().max(24 * 366).nullish(), jusqua: z.string().max(40).nullish(),
    notifierApp: z.boolean().default(true), notifierEmail: z.boolean().default(false),
  }),
  z.object({ action: z.literal('reintegrer'), userId: uuid, groupeId: uuid.nullish(), motif: z.string().max(500).nullish() }),
  z.object({ action: z.literal('lever'), sanctionId: uuid, motif: z.string().max(500).nullish() }),
  z.object({ action: z.literal('signalement'), id: uuid, statut: z.enum(['traite', 'sans_suite', 'a_examiner']), note: z.string().max(1000).nullish() }),
  z.object({ action: z.literal('valider'), ids: z.array(uuid).min(1).max(200) }),
  z.object({ action: z.literal('refuser'), ids: z.array(uuid).min(1).max(200), motif: z.string().max(500).nullish() }),
  z.object({ action: z.literal('liberer'), id: uuid }),
  z.object({ action: z.literal('restaurer'), ids: z.array(uuid).min(1).max(200) }),
  z.object({ action: z.literal('reaffecter'), tagId: uuid, affectationId: uuid }),
  z.object({ action: z.literal('bibliotheque'), messageId: uuid, anonymiser: z.boolean().default(true) }),
  z.object({ action: z.literal('rgpd_export'), userId: uuid }),
  z.object({ action: z.literal('rgpd_effacement'), userId: uuid, confirmation: z.literal('EFFACER') }),
]);

/**
 * Modération — depuis le menu « ⋯ » d'un message (§48) comme depuis le
 * back-office. Chaque action revérifie le niveau de la personne (§102-103).
 */
export async function POST(req: Request) {
  return garde('moderation', async () => {
    const a = await authentifier(req);
    if ('reponse' in a) return a.reponse;
    if (a.acteur.niveau === null) return erreur({ error: 'Action réservée à l’administration.', code: 'DROITS' }, 403);
    const p = Action.safeParse(await lireJson(req));
    if (!p.success) return erreur({ error: p.error.issues[0]?.message ?? 'Requête invalide.', code: 'INVALIDE' });
    const d = p.data;
    const ac = a.acteur;
    const r = d.action === 'sanction'
      ? await appliquerSanction(ac, { userId: d.userId, groupeId: d.groupeId ?? null, type: d.type, motif: d.motif ?? null, messageEleve: d.messageEleve ?? null, dureeHeures: d.dureeHeures ?? null, jusqua: d.jusqua ?? null, notifierApp: d.notifierApp, notifierEmail: d.notifierEmail })
      : d.action === 'reintegrer' ? await reintegrer(ac, d.userId, d.groupeId ?? null, d.motif ?? null)
      : d.action === 'lever' ? await leverSanction(ac, d.sanctionId, d.motif ?? null)
      : d.action === 'signalement' ? await traiterSignalement(ac, d.id, d.statut, d.note ?? null)
      : d.action === 'valider' ? await validerMessages(ac, d.ids)
      : d.action === 'refuser' ? await refuserMessages(ac, d.ids, d.motif ?? null)
      : d.action === 'liberer' ? await libererBlocage(ac, d.id)
      : d.action === 'restaurer' ? await restaurerMessages(ac, d.ids)
      : d.action === 'reaffecter' ? await reaffecter(ac, d.tagId, d.affectationId)
      : d.action === 'bibliotheque' ? await transformerEnPermanente(ac, d.messageId, { anonymiser: d.anonymiser })
      : d.action === 'rgpd_export' ? await exportRgpd(ac, d.userId)
      : await effacementRgpd(ac, d.userId);
    return 'error' in r && typeof r.error === 'string' && !('ok' in r) ? erreur(r as { error: string }) : ok(r);
  });
}
