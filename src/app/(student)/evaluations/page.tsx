import { CalendarClock, LineChart, ListChecks, TrendingUp } from 'lucide-react';
import { requireUser } from '@/lib/auth/require-role';
import { chargerEvaluations, nomsMatieres } from '@/lib/evaluations/historique';
import {
  evolutions, formatEvolution, formatPourcentage, pointsCourbe, pourEleve,
} from '@/lib/evaluations/historique-core';
import { HistoriqueEvaluations } from '@/components/evaluations/historique-evaluations';
import { HeroStat, StudentHero, StudentPage } from '@/components/student/ui/page-kit';

export const metadata = { title: 'Évaluations & progression' };
export const dynamic = 'force-dynamic';

/**
 * Évaluations & progression : toutes les évaluations notées de l'élève
 * (Check-up, épreuves blanches, interrogations, réévaluations, Parcours du
 * Major — et, sur demande, ses révisions transversales), chaque tentative
 * conservée, la courbe de progression et le détail de chacune. Une note
 * d'épreuve n'apparaît qu'une fois les résultats publiés.
 */
export default async function EvaluationsPage() {
  const { user } = await requireUser();
  const [toutes, noms] = await Promise.all([chargerEvaluations({ userId: user.id, entrainement: true }), nomsMatieres()]);
  const liste = toutes.map(pourEleve);

  const evals = liste.filter((e) => e.type !== 'entrainement');
  const points = pointsCourbe(evals, true);
  const derniere = points.at(-1) ?? null;
  const evo = evolutions(evals, true);
  const progression = derniere ? evo.get(derniere.cle) ?? null : null;
  const terminees = evals.filter((e) => e.statut === 'termine').length;

  // Noms des spécialités citées par les détails (pas tout le référentiel).
  const cles = new Set<string>();
  for (const e of liste) {
    for (const k of ['specialites', 'specialites_ratio'] as const) {
      const d = e.detail[k];
      if (d && typeof d === 'object') Object.keys(d).forEach((c) => cles.add(c));
    }
  }
  const matieres = Object.fromEntries([...cles].map((c) => [c, noms.get(c) ?? c]));

  return (
    <StudentPage>
      <StudentHero
        icon={LineChart}
        eyebrow="Piloter"
        title="Évaluations & progression"
        subtitle="Toutes vos évaluations au même endroit, dans l’ordre chronologique. Une nouvelle tentative ne remplace jamais la précédente : votre progression reste lisible du premier jour à l’EVC."
        aide="evaluations"
        stats={
          <>
            <HeroStat icon={ListChecks} value={terminees} label={terminees > 1 ? 'évaluations terminées' : 'évaluation terminée'} />
            <HeroStat icon={TrendingUp} value={derniere ? formatPourcentage(derniere.pourcentage) : '—'} label="dernier résultat" />
            <HeroStat icon={LineChart} value={progression === null ? '—' : formatEvolution(progression)} label="vs la précédente de même nature" />
            <HeroStat icon={CalendarClock} value={derniere ? new Date(derniere.date).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris', day: 'numeric', month: 'short' }) : '—'} label="dernière évaluation" />
          </>
        }
      />
      <HistoriqueEvaluations evaluations={liste} mode="eleve" matieres={matieres} />
    </StudentPage>
  );
}
