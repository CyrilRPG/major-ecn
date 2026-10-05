import 'server-only';
import { candidateContext } from './candidate';
import { insertEvents, moteurDb, withUserLock } from './db';
import { processPending } from './ingest';

/**
 * Reconstruction de l'état d'items à partir de l'historique des signaux
 * (neutralisation d'une évaluation, correction d'un rattachement d'item…).
 *
 * L'historique n'est jamais effacé (I§42) : les signaux restent, ceux qui
 * doivent être ignorés sont marqués « rejected » par l'appelant. Ici, l'état
 * courant des items est remis à zéro, leurs besoins actifs et réactivations
 * programmées sont clos (« superseded » / « cancelled »), puis les signaux
 * traités sont rejoués dans l'ordre chronologique.
 */
export async function rebuildItems(userId: string, itemIds: string[], reason: string): Promise<void> {
  if (itemIds.length === 0) return;
  const run = await withUserLock(userId, async () => {
    const db = moteurDb();
    for (let i = 0; i < itemIds.length; i += 150) {
      const chunk = itemIds.slice(i, i + 150);
      await db.from('candidate_item_state').delete().eq('user_id', userId).in('item_id', chunk);
      await db.from('candidate_active_need').update({ state: 'superseded', closed_at: new Date().toISOString(), close_reason: `reconstruction : ${reason}` })
        .eq('user_id', userId).eq('state', 'active').in('item_id', chunk);
      await db.from('candidate_review_schedule').update({ status: 'cancelled', completed_at: new Date().toISOString(), result: `reconstruction : ${reason}` })
        .eq('user_id', userId).eq('status', 'scheduled').in('item_id', chunk);
      await db.from('pedago_signals').update({ status: 'pending', processed_at: null }).eq('user_id', userId).eq('status', 'processed').in('item_id', chunk);
    }
    const ctx = await candidateContext(userId);
    // Plusieurs passes : processPending traite au plus 2 000 signaux à la fois.
    for (let pass = 0; pass < 20; pass++) {
      const n = await processPending(userId, { examDate: ctx?.examDate ?? null, plannerActive: !!ctx?.plannerActive });
      if (n === 0) break;
    }
    await insertEvents([{ event_key: `rebuild:${userId}:${reason}:${Date.now()}`, user_id: userId, event_type: 'ITEMS_REBUILT', detail: { reason, items: itemIds.length } }]);
  }, { wait: true, seconds: 300 });
  if (!run.ran) throw new Error('Reconstruction impossible : un traitement est déjà en cours pour ce candidat.');
}
