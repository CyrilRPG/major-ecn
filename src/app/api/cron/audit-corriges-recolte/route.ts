/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * GET /api/cron/audit-corriges-recolte — récolte automatique des audits de
 * corrigés en cours (toutes les 30 minutes, cf. vercel.json).
 *
 * Un Message Batch se termine en général en moins d'une heure ; sans ce cron,
 * il faudrait revenir cliquer « Récolter ». Même garde que les autres crons :
 * `Authorization: Bearer <CRON_SECRET>`.
 */
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { recolterRun, estTableAuditAbsente, type AuditRun } from '@/lib/qcm-audit/serveur';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const FENETRE_MS = 220_000;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET ?? process.env.CAMPAIGN_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  const debut = Date.now();
  const admin = createAdminClient() as any;
  const { data, error } = await admin.from('qcm_audit_runs').select('*').eq('status', 'en_cours').order('created_at');
  if (error) {
    if (estTableAuditAbsente(error)) return NextResponse.json({ skipped: 'table absente' });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const runs = (data ?? []) as AuditRun[];
  const resultats: Array<{ runId: string; status: string; nbConstats: number; error?: string }> = [];
  for (const run of runs) {
    if (Date.now() - debut > FENETRE_MS) break;
    try {
      const apres = await recolterRun(run, () => Date.now() - debut < FENETRE_MS);
      resultats.push({ runId: run.id, status: apres.status, nbConstats: apres.nb_constats });
    } catch (e) {
      resultats.push({ runId: run.id, status: run.status, nbConstats: run.nb_constats, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return NextResponse.json({ enCours: runs.length, resultats });
}
