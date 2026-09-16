'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, InlineStatus, SectionCard } from '@/components/admin/suivi/ui';
import { saveConfigAction } from '@/app/admin/planificateur/actions';
import { DEFAULT_CONFIG, type PlanConfig } from '@/lib/plan/types';

/** Réglages du moteur (§8, §10, §14, §16, §22) — aucun coefficient codé en dur. */
export function PlanSettingsForm({ config }: { config: PlanConfig }) {
  const router = useRouter();
  const [c, setC] = useState<PlanConfig>(config);
  const [intervals, setIntervals] = useState(config.intervals_days.join(', '));
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const num = (v: string) => Number(v) || 0;
  const W = (k: keyof PlanConfig['weights'], label: string) => (
    <Field label={label}><Input type="number" min={0} max={100} value={c.weights[k]} onChange={(e) => setC({ ...c, weights: { ...c.weights, [k]: num(e.target.value) } })} /></Field>
  );
  const sum = Object.values(c.weights).reduce((a, b) => a + b, 0);

  function save() {
    setError(null); setStatus(null);
    start(async () => {
      const r = await saveConfigAction({ ...c, intervals_days: intervals.split(/[;,\s]+/).map(Number).filter((n) => n > 0) });
      if (!r.ok) { setError(r.error); return; }
      setC(r.config); setIntervals(r.config.intervals_days.join(', ')); setStatus('Réglages enregistrés — ils s’appliquent au prochain recalcul de chaque candidat.'); router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Coefficients du score de priorité (§8)" description={`Somme actuelle : ${sum} (normalisée). Ils ne sont jamais affichés aux candidats.`}>
        <div className="grid gap-4 md:grid-cols-3">
          {W('niveau', 'Poids du niveau du candidat')}{W('importance', 'Poids de l’importance')}{W('frequence', 'Poids de la fréquence aux EVC')}
          {W('recence', 'Poids de la récence')}{W('transversalite', 'Poids de la transversalité')}{W('proximite', 'Poids de la proximité du concours')}
        </div>
      </SectionCard>
      <SectionCard title="Seuils de maîtrise (§5, §14)">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Prérequis indispensable considéré acquis (%)"><Input type="number" min={0} max={100} value={c.thresholds.prerequis} onChange={(e) => setC({ ...c, thresholds: { ...c.thresholds, prerequis: num(e.target.value) } })} /></Field>
          <Field label="Item maîtrisé (%)"><Input type="number" min={0} max={100} value={c.thresholds.maitrise} onChange={(e) => setC({ ...c, thresholds: { ...c.thresholds, maitrise: num(e.target.value) } })} /></Field>
          <Field label="Résultat intermédiaire → consolidation (%)"><Input type="number" min={0} max={100} value={c.thresholds.consolidation} onChange={(e) => setC({ ...c, thresholds: { ...c.thresholds, consolidation: num(e.target.value) } })} /></Field>
        </div>
      </SectionCard>
      <SectionCard title="Répétition espacée (§16)" description="Intervalles en jours, du premier au dernier. Adaptés au résultat : ×1,5 après un excellent score, ÷2 après un échec.">
        <Field label="Intervalles (jours)"><Input value={intervals} onChange={(e) => setIntervals(e.target.value)} placeholder="7, 14, 30, 60" /></Field>
      </SectionCard>
      <SectionCard title="Séances et charge de travail (§10)">
        <div className="grid gap-4 md:grid-cols-5">
          <Field label="Séance min (min)"><Input type="number" min={10} max={240} value={c.session.min} onChange={(e) => setC({ ...c, session: { ...c.session, min: num(e.target.value) } })} /></Field>
          <Field label="Séance max (min)"><Input type="number" min={10} max={240} value={c.session.max} onChange={(e) => setC({ ...c, session: { ...c.session, max: num(e.target.value) } })} /></Field>
          <Field label="Évaluation (min)"><Input type="number" min={5} max={120} value={c.session.evaluation} onChange={(e) => setC({ ...c, session: { ...c.session, evaluation: num(e.target.value) } })} /></Field>
          <Field label="Réactivation (min)"><Input type="number" min={5} max={120} value={c.session.reactivation} onChange={(e) => setC({ ...c, session: { ...c.session, reactivation: num(e.target.value) } })} /></Field>
          <Field label="Révision finale (min)"><Input type="number" min={5} max={240} value={c.session.revision_finale} onChange={(e) => setC({ ...c, session: { ...c.session, revision_finale: num(e.target.value) } })} /></Field>
        </div>
        <p className="mt-4 mb-2 text-sm font-medium text-(--color-ink)">Volume → minutes de référence</p>
        <div className="grid gap-4 md:grid-cols-5">
          {(['1', '2', '3', '4', '5'] as const).map((k) => (
            <Field key={k} label={`Volume ${k}`}><Input type="number" min={5} max={3000} value={c.volume_minutes[k]} onChange={(e) => setC({ ...c, volume_minutes: { ...c.volume_minutes, [k]: num(e.target.value) } })} /></Field>
          ))}
        </div>
      </SectionCard>
      <SectionCard title="Horizon, évaluations, information">
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Jours de révisions finales" hint="Bornés à 15 % de l’horizon."><Input type="number" min={0} max={120} value={c.final_revision_days} onChange={(e) => setC({ ...c, final_revision_days: num(e.target.value) })} /></Field>
          <Field label="Rappel « épreuves proches » (jours)"><Input type="number" min={1} max={180} value={c.approach_days} onChange={(e) => setC({ ...c, approach_days: num(e.target.value) })} /></Field>
          <Field label="Questions par validation"><Input type="number" min={3} max={30} value={c.questions_per_validation} onChange={(e) => setC({ ...c, questions_per_validation: num(e.target.value) })} /></Field>
          <Field label="Tentatives QCM minimales (plateforme)"><Input type="number" min={1} max={100} value={c.min_attempts_platform} onChange={(e) => setC({ ...c, min_attempts_platform: num(e.target.value) })} /></Field>
          <Field label="Version du texte d’information" hint="Incrémentez si le texte change : l’acceptation est conservée par version."><Input type="number" min={1} value={c.consent_version} onChange={(e) => setC({ ...c, consent_version: num(e.target.value) })} /></Field>
        </div>
      </SectionCard>
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={pending} onClick={save}>{pending && <Loader2 className="animate-spin" />} Enregistrer</Button>
        <Button variant="ghost" disabled={pending} onClick={() => { setC(DEFAULT_CONFIG); setIntervals(DEFAULT_CONFIG.intervals_days.join(', ')); }}>Valeurs par défaut</Button>
        <InlineStatus error={error} status={status} />
      </div>
    </div>
  );
}
