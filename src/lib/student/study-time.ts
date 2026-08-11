export type StudyTimeRow = { total_seconds: number | null };

/**
 * Date du lundi (ISO) de la semaine UTC contenant `date`.
 *
 * `platform_time_tracking.session_date` est alimenté avec une date UTC. Les
 * lectures doivent donc utiliser la même convention pour ne pas exclure une
 * journée aux changements de fuseau.
 */
export function startOfUtcIsoWeek(date = new Date()): string {
  const monday = new Date(date);
  const daysSinceMonday = (monday.getUTCDay() + 6) % 7;
  monday.setUTCDate(monday.getUTCDate() - daysSinceMonday);
  return monday.toISOString().slice(0, 10);
}

export function sumTrackedSeconds(rows: StudyTimeRow[] | null | undefined): number {
  return (rows ?? []).reduce((sum, row) => sum + Math.max(0, row.total_seconds ?? 0), 0);
}
