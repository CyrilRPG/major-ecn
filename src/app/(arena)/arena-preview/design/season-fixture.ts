import { buildTournamentCard, groupTournamentCards, type CardSource } from '@/lib/arena/tournament-cards';
import type { SpaceRoundView } from '@/components/arena/space-progress';

/** Saison fictive de la maquette 15_06_19 : un tournoi ouvert (manche 3), un à venir, trois terminés. */
export function seasonFixture(now = new Date()) {
  const h = (hours: number) => new Date(now.getTime() + hours * 3_600_000).toISOString();
  const rounds = (open: boolean) => [1, 2, 3].map((number) => ({
    number, theme: ['Vascularites et maladies systémiques', 'Syndromes inflammatoires, auto-immunité et infections', 'Hémopathies, anémies et médecine interne polyvalente'][number - 1],
    opens_at: open ? h(number === 3 ? -4 : -200 + number * 24) : h(-900 + number * 48), closes_at: open ? h(number === 3 ? 19.65 : -190 + number * 24) : h(-890 + number * 48), duration_minutes: null,
  }));
  const base = (id: string, specialty: string, status: CardSource['status'], open = false): CardSource => ({
    id, slug: `demo-${id}`, title: `EVC Arena — ${specialty}`, specialty, specialty_id: null, status,
    questions_per_round: 20, seconds_per_question: 60, rounds: rounds(open),
  });
  const sources: CardSource[] = [
    base('mi-2026', 'Médecine interne polyvalente', 'round_open', true),
    { ...base('cardio', 'Cardiologie', 'scheduled'), rounds: [{ number: 1, theme: 'Insuffisance cardiaque', opens_at: h(24 * 12 + 5), closes_at: h(24 * 13), duration_minutes: null }] },
    base('mi-demo', 'Médecine interne polyvalente', 'finished'),
    base('neuro', 'Neurologie', 'finished'),
    base('radio', 'Radiologie', 'finished'),
  ];
  const groups = groupTournamentCards(sources.map((s) => buildTournamentCard(s, { now, isPublic: true })));
  const editions = { 'demo-mi-2026': '2026', 'demo-cardio': '2026', 'demo-mi-demo': '2026', 'demo-neuro': '2026', 'demo-radio': '2026' };
  return { groups, editions };
}

/** Espace pendant le tournoi : manche 1 jouée et publiée, manche 2 ouverte, manche 3 à venir. */
export function spaceFixture(now = new Date()): SpaceRoundView[] {
  const h = (hours: number) => new Date(now.getTime() + hours * 3_600_000).toISOString();
  return [
    { number: 1, theme: 'Vascularites et maladies systémiques', opensAt: '2026-09-07T10:53:00Z', closesAt: '2026-09-14T10:53:00Z', state: 'closed', questionCount: 12, played: { score: 8.4, max: 12, seconds: 702, truncated: false }, inProgress: false, correctionsAllowed: true },
    { number: 2, theme: 'Syndromes inflammatoires, auto-immunité et infections', opensAt: h(-1), closesAt: h(30), state: 'open', questionCount: 20, played: null, inProgress: false, correctionsAllowed: false },
    { number: 3, theme: 'Hémopathies, anémies et médecine interne polyvalente', opensAt: h(24 * 9), closesAt: null, state: 'upcoming', questionCount: 20, played: null, inProgress: false, correctionsAllowed: false },
  ];
}
