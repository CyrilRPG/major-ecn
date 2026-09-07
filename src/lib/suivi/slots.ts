/**
 * Génération de créneaux (§6) — module PUR.
 *
 * Depuis une plage (jours de la semaine × heures de début/fin) sur une
 * période, on découpe des créneaux de `slotMinutes`, séparés par un temps
 * tampon optionnel. Les heures sont lues en heure de Paris et rendues en UTC.
 */
import { addDays, isoWeekday, zonedToUtc, type DayKey } from './format';

export type GenerateSlotsInput = {
  /** Premier jour (inclus), 'YYYY-MM-DD'. */
  from: DayKey;
  /** Dernier jour (inclus), 'YYYY-MM-DD'. */
  to: DayKey;
  /** Jours ISO retenus : 1 = lundi … 7 = dimanche. */
  days: number[];
  /** « 09:00 » */
  startTime: string;
  /** « 12:00 » (exclu : un créneau doit se terminer au plus tard à cette heure). */
  endTime: string;
  slotMinutes: number;
  bufferMinutes?: number;
  /** Jours précis à exclure (fériés, indisponibilités). */
  excludeDays?: DayKey[];
};

export type GeneratedSlot = { starts_at: string; ends_at: string; day: DayKey };

function minutesOf(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + (m ?? 0);
}

const pad = (n: number) => String(n).padStart(2, '0');
function timeOf(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** Nombre de créneaux qui tiennent dans une plage (utile pour l'aperçu). */
export function slotsPerDay(startTime: string, endTime: string, slotMinutes: number, bufferMinutes = 0): number {
  const span = minutesOf(endTime) - minutesOf(startTime);
  if (span <= 0 || slotMinutes <= 0) return 0;
  // n créneaux occupent n*slot + (n-1)*buffer minutes.
  return Math.floor((span + bufferMinutes) / (slotMinutes + bufferMinutes));
}

export function generateSlots(input: GenerateSlotsInput): GeneratedSlot[] {
  const { from, to, days, startTime, endTime, slotMinutes } = input;
  const buffer = Math.max(0, input.bufferMinutes ?? 0);
  if (!from || !to || from > to || slotMinutes <= 0) return [];
  const wanted = new Set(days);
  const excluded = new Set(input.excludeDays ?? []);
  const perDay = slotsPerDay(startTime, endTime, slotMinutes, buffer);
  if (perDay === 0) return [];
  const startMin = minutesOf(startTime);

  const out: GeneratedSlot[] = [];
  // Borne de sécurité : 2 ans de génération maximum.
  for (let day = from, i = 0; day <= to && i < 731; day = addDays(day, 1), i++) {
    if (!wanted.has(isoWeekday(day)) || excluded.has(day)) continue;
    for (let k = 0; k < perDay; k++) {
      const s = startMin + k * (slotMinutes + buffer);
      const e = s + slotMinutes;
      out.push({
        day,
        starts_at: zonedToUtc(day, timeOf(s)).toISOString(),
        ends_at: zonedToUtc(day, timeOf(e)).toISOString(),
      });
    }
  }
  return out;
}

/** Créneau disponible tel que présenté au candidat (jamais d'identité). */
export type AvailableSlot = {
  id: string;
  starts_at: string;
  ends_at: string;
  campaign_id: string | null;
  remaining: number;
};

/** Regroupe des créneaux par jour (clé jour Paris) en gardant l'ordre. */
export function groupByDay<T extends { starts_at: string }>(slots: T[], dayKeyOf: (iso: string) => DayKey): { day: DayKey; slots: T[] }[] {
  const map = new Map<DayKey, T[]>();
  for (const s of [...slots].sort((a, b) => a.starts_at.localeCompare(b.starts_at))) {
    const k = dayKeyOf(s.starts_at);
    const list = map.get(k) ?? [];
    list.push(s);
    map.set(k, list);
  }
  return Array.from(map.entries()).map(([day, list]) => ({ day, slots: list }));
}
