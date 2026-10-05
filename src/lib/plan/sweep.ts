import 'server-only';
import { listProfiles } from './db';
import { ensureFresh } from './engine';
import { activateDueMatrixVersions } from './matrix-versions';
import { migrateLegacyProfile } from './operations';

/**
 * Balayage horaire (vercel.json) : chaque candidat est traité quand sa journée
 * a changé (clôture à 04:00 dans SON fuseau, sortie du mode prioritaire à
 * 04:05), quand le moteur central a demandé un recalcul, ou quand son planning
 * a plus de 24 heures. Les profils d'avant la V4.1 sont migrés au passage. Les
 * plus anciens d'abord : si le temps manque, le passage suivant reprend.
 */
export async function runPlanSweep(now: Date = new Date(), opts: { budgetMs?: number } = {}): Promise<{ recalculated: number; migrated: number; remaining: number; versions: string[]; errors: string[] }> {
  const report = { recalculated: 0, migrated: 0, remaining: 0, versions: [] as string[], errors: [] as string[] };
  try { report.versions = await activateDueMatrixVersions(now, { force: true }); } catch (err) { report.errors.push(`versions : ${err instanceof Error ? err.message : String(err)}`); }
  const started = Date.now();
  const profiles = (await listProfiles({ onboarded: true }))
    .filter((p) => p.planner_status === 'actif' || p.planner_status === 'en_pause' || !p.v41_migrated_at)
    .sort((a, b) => (a.last_generated_at ?? '').localeCompare(b.last_generated_at ?? ''));
  for (const [i, p] of profiles.entries()) {
    if (Date.now() - started > (opts.budgetMs ?? 240_000)) { report.remaining = profiles.length - i; break; }
    try {
      if (!p.v41_migrated_at) { if (await migrateLegacyProfile(p.user_id)) report.migrated++; continue; }
      if (await ensureFresh(p.user_id, { now, trigger: 'balayage', maxAgeMs: 24 * 60 * 60_000 })) report.recalculated++;
    } catch (err) {
      report.errors.push(`${p.user_id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return report;
}
