import 'server-only';
import { isRecentlySeen, signalStrength } from '@/lib/moteur/signal';
import type { PedagoSignal } from '@/lib/moteur/types';
import { getOrchestratorConfig, moteurDb } from '@/lib/moteur/server/db';
import { ingestSignals } from '@/lib/moteur/server/ingest';
import { rebuildItems } from '@/lib/moteur/server/rebuild';
import { candidateContext } from '@/lib/moteur/server/candidate';
import type { QuestionRow, SessionRow } from './service';

/**
 * Check-up → profil (I§16) :
 *  - QRU correcte ou QRM = 1 : signal positif FORT ; QRM = 0,5 : partiel ;
 *    QRM = 0,2 ou 0 : incorrect ;
 *  - question récemment vue (fenêtre d'anti-répétition) : faible ; annale :
 *    intermédiaire au plus ;
 *  - QROC : source faible (checkup_qroc_self_assessed), seulement APRÈS
 *    l'auto-correction ; les QCM alimentent le profil dès la soumission ;
 *  - une question jamais affichée (temps écoulé avant d'y arriver) compte 0
 *    dans le score mais n'est pas un signal de maîtrise ;
 *  - Check-up abandonné : aucun signal ; neutralisé : aucune statistique.
 */
export async function emitCheckupSignals(userId: string, s: Pick<SessionRow, 'id' | 'status'>, questions: QuestionRow[], opts: { qcmOnly?: boolean; qrocOnly?: boolean }): Promise<void> {
  if (s.status === 'abandoned' || s.status === 'cancelled_technical') return;
  const config = await getOrchestratorConfig();
  const signals: Partial<PedagoSignal>[] = [];
  const strengthByPosition = new Map<number, string>();
  const at = new Date().toISOString();
  for (const q of questions) {
    const isQroc = q.question_type === 'QROC';
    if (opts.qcmOnly && isQroc) continue;
    if (opts.qrocOnly && !isQroc) continue;
    if (!q.result) continue; // QROC rédigée encore non auto-corrigée : rien (jamais un zéro d'office)
    const displayed = !!q.presented_at || !!q.answer || !!q.locked_at;
    if (!displayed) continue;
    const lastSeen = q.seen_before && q.days_since_last_seen !== null ? new Date(Date.now() - q.days_since_last_seen * 86_400_000).toISOString() : null;
    const recentlySeen = isRecentlySeen(lastSeen, at, config.recent_seen_days);
    const strength = signalStrength({ source: 'checkup', contentSource: q.content_source, recentlySeen, selfAssessed: isQroc });
    const result = q.result === 'correct' ? 'positive' : q.result === 'partial' ? 'partial' : 'incorrect';
    strengthByPosition.set(q.position, strength ?? '');
    signals.push({
      signal_id: `checkup:${s.id}:${q.position}`, candidate_id: userId, item_id: q.item_id, source: 'checkup', content_source: q.content_source,
      source_strength: strength, result_type: result,
      need_type: q.item_id ? (result === 'incorrect' ? 'review' : result === 'partial' ? 'consolidate' : 'none') : 'none',
      created_at: at, expires_at: null, origin_activity_id: `checkup:${s.id}`, origin_question_id: q.canonical_question_id, estimated_duration_minutes: null,
      metadata: {
        question_id: q.question_id, type: q.question_type, points: q.points, ...(q.origin === 'vide' || (!q.answer && !isQroc) ? { unanswered: true } : {}),
        ...(recentlySeen ? { recently_seen: true } : {}), ...(isQroc ? { self_assessed: true, source_detail: 'checkup_qroc_self_assessed' } : {}), ...(q.content_source === 'evc_annale' && q.annale_year ? { annale_year: q.annale_year } : {}),
      },
    });
  }
  const ctx = await candidateContext(userId);
  if (signals.length > 0) {
    await ingestSignals(userId, signals, {
      examDate: ctx?.examDate ?? null, plannerActive: !!ctx?.plannerActive,
      activityCompleted: !opts.qcmOnly, activityLabel: 'EVC Check-up',
    });
  }
  const db = moteurDb();
  for (const [position, strength] of strengthByPosition) await db.from('checkup_questions').update({ signal_strength: strength || null }).eq('session_id', s.id).eq('position', position);
  await db.from('checkup_sessions').update(opts.qcmOnly ? { qcm_signals_emitted_at: at } : { signals_emitted_at: at, ...(opts.qrocOnly ? {} : { qcm_signals_emitted_at: at }) }).eq('id', s.id);
}

/** Neutralisation (§32) : les signaux de l'évaluation sont rejetés et les items concernés reconstruits sans eux. */
export async function neutralizeSignals(userId: string, sessionId: string): Promise<void> {
  const db = moteurDb();
  const { data } = await db.from('pedago_signals').select('signal_id, item_id').eq('user_id', userId).eq('origin_activity_id', `checkup:${sessionId}`);
  const rows = (data ?? []) as { signal_id: string; item_id: string | null }[];
  if (rows.length === 0) return;
  await db.from('pedago_signals').update({ status: 'rejected', error: 'Check-up neutralisé (incident technique)' }).eq('user_id', userId).eq('origin_activity_id', `checkup:${sessionId}`);
  const items = Array.from(new Set(rows.map((r) => r.item_id).filter((x): x is string => !!x)));
  if (items.length > 0) await rebuildItems(userId, items, `checkup:${sessionId}`);
}
