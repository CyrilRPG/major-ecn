'use server';

import { revalidatePath } from 'next/cache';
import { contexteCockpit } from '@/lib/cockpit/server/base';
import { chargerConversation } from '@/lib/cockpit/server/messagerie';

/**
 * Accusé de lecture « Lu dans la plateforme » (§7) : quand l'enseignant ouvre
 * le fil, les messages de l'administrateur sont marqués lus et sa
 * notification `message:<id>` passe en lue. Côté propriétaire, rien : les
 * réponses reçues se soldent par « Marquer comme traité ».
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function marquerLu(conversationId: string): Promise<{ ok: true; marques: number } | { ok: false; erreur: string }> {
  if (!UUID.test(conversationId)) return { ok: false, erreur: 'Conversation introuvable.' };
  const { moi, db: d } = await contexteCockpit();
  const acces = await chargerConversation(d, conversationId, moi);
  if (!acces) return { ok: false, erreur: 'Conversation introuvable.' };
  if (acces.role !== 'enseignant') return { ok: true, marques: 0 };

  const maintenant = new Date().toISOString();
  const { data } = await d
    .from('cockpit_messages')
    .update({ lu_at: maintenant })
    .eq('conversation_id', conversationId)
    .eq('sens', 'sortant')
    .eq('brouillon', false)
    .is('lu_at', null)
    .select('id');
  const { data: notifs } = await d
    .from('cockpit_notifications')
    .update({ lu_at: maintenant })
    .eq('user_id', moi.id)
    .eq('group_key', `message:${conversationId}`)
    .is('lu_at', null)
    .select('id');

  const marques = ((data ?? []) as unknown[]).length;
  if (marques > 0 || ((notifs ?? []) as unknown[]).length > 0) {
    revalidatePath('/admin/cockpit', 'layout');
  }
  return { ok: true, marques };
}
