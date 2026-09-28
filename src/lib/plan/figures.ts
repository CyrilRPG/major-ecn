/**
 * Chiffres affichés par le message « temps de préparation limité » — module PUR
 * (partagé par les pages serveur, les actions et les composants client).
 */
export type TimeFigures = { daysLeft: number; avgMinutesPerDay: number; daysPerWeek: number; plannableMinutes: number };

export function figuresOf(summary: {
  daysLeft: number; avgMinutesPerAvailableDay?: number; availableDaysPerWeek?: number; totalAvailableMinutes: number;
}): TimeFigures {
  return {
    daysLeft: summary.daysLeft,
    avgMinutesPerDay: summary.avgMinutesPerAvailableDay ?? 0,
    daysPerWeek: summary.availableDaysPerWeek ?? 0,
    plannableMinutes: summary.totalAvailableMinutes,
  };
}
