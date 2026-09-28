'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, InlineStatus, SectionCard } from '@/components/admin/suivi/ui';
import { saveConfigAction } from '@/app/admin/planificateur/actions';
import {
  DEFAULT_CONFIG, MATRIX_CRITERIA, MATRIX_CRITERIA_LABEL, VOIE_LABEL,
  type MatrixCriteria, type MatrixLevel, type PlanConfig, type Voie,
} from '@/lib/plan/types';

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

  const VW = (voie: Voie, k: keyof MatrixCriteria) => (
    <Field key={`${voie}-${k}`} label={MATRIX_CRITERIA_LABEL[k]}>
      <Input type="number" min={0} max={100} value={c.voie_weights[voie][k]} onChange={(e) => setC({ ...c, voie_weights: { ...c.voie_weights, [voie]: { ...c.voie_weights[voie], [k]: num(e.target.value) } } })} />
    </Field>
  );

  return (
    <div className="space-y-6">
      <SectionCard title="Matrice MG 2026 : pondération par voie" description="Score de voie /100 = Σ poids × critère (0–5) / (5 × Σ poids). Une seule matrice, deux profils : les items ne sont jamais dupliqués ni supprimés selon la voie.">
        {(['interne', 'externe'] as Voie[]).map((v) => (
          <div key={v} className="mb-4">
            <p className="mb-2 text-sm font-medium text-(--color-ink)">{VOIE_LABEL[v]} <span className="font-normal text-(--color-ink-soft)">· somme {MATRIX_CRITERIA.reduce((n, k) => n + c.voie_weights[v][k], 0)}</span></p>
            <div className="grid gap-4 md:grid-cols-6">{MATRIX_CRITERIA.map((k) => VW(v, k))}</div>
          </div>
        ))}
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="P1 à partir de (score /100)"><Input type="number" min={0} max={100} value={c.levels.p1} onChange={(e) => setC({ ...c, levels: { ...c.levels, p1: num(e.target.value) } })} /></Field>
          <Field label="P2 à partir de"><Input type="number" min={0} max={100} value={c.levels.p2} onChange={(e) => setC({ ...c, levels: { ...c.levels, p2: num(e.target.value) } })} /></Field>
          <Field label="P3 à partir de" hint="En dessous : P4, « priorité secondaire actuellement » — jamais « à ne pas travailler »."><Input type="number" min={0} max={100} value={c.levels.p3} onChange={(e) => setC({ ...c, levels: { ...c.levels, p3: num(e.target.value) } })} /></Field>
        </div>
      </SectionCard>
      <SectionCard title="Ordre de travail et couverture" description="Ordre = matrice + manque de maîtrise + proximité de l’épreuve. Première couverture de tout le programme, puis approfondissement des items prioritaires ou mal maîtrisés.">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Poids de la matrice"><Input type="number" min={0} max={100} value={c.priority_mix.matrice} onChange={(e) => setC({ ...c, priority_mix: { ...c.priority_mix, matrice: num(e.target.value) } })} /></Field>
          <Field label="Poids du manque de maîtrise"><Input type="number" min={0} max={100} value={c.priority_mix.niveau} onChange={(e) => setC({ ...c, priority_mix: { ...c.priority_mix, niveau: num(e.target.value) } })} /></Field>
          <Field label="Poids de la proximité"><Input type="number" min={0} max={100} value={c.priority_mix.proximite} onChange={(e) => setC({ ...c, priority_mix: { ...c.priority_mix, proximite: num(e.target.value) } })} /></Field>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-6">
          <Field label="Part « première couverture »" hint="0,1 à 1"><Input type="number" step={0.05} min={0.1} max={1} value={c.coverage.first_pass_share} onChange={(e) => setC({ ...c, coverage: { ...c.coverage, first_pass_share: Number(e.target.value) || 0 } })} /></Field>
          {(['P1', 'P2', 'P3', 'P4'] as MatrixLevel[]).map((l) => (
            <Field key={l} label={`Profondeur ${l}`} hint="× temps de référence"><Input type="number" step={0.05} min={0.1} max={5} value={c.coverage.depth[l]} onChange={(e) => setC({ ...c, coverage: { ...c.coverage, depth: { ...c.coverage.depth, [l]: Number(e.target.value) || 0 } } })} /></Field>
          ))}
          <Field label="Réactivations : part max d’une journée" hint="Pendant la première couverture"><Input type="number" step={0.05} min={0.05} max={1} value={c.reactivation_max_share} onChange={(e) => setC({ ...c, reactivation_max_share: Number(e.target.value) || 0 })} /></Field>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <Field label="Niveau déclaré « Faible » (%)"><Input type="number" min={0} max={100} value={c.declared_scores.faible} onChange={(e) => setC({ ...c, declared_scores: { ...c.declared_scores, faible: num(e.target.value) } })} /></Field>
          <Field label="« Moyen » (%)"><Input type="number" min={0} max={100} value={c.declared_scores.moyen} onChange={(e) => setC({ ...c, declared_scores: { ...c.declared_scores, moyen: num(e.target.value) } })} /></Field>
          <Field label="« Bon » (%)"><Input type="number" min={0} max={100} value={c.declared_scores.aise} onChange={(e) => setC({ ...c, declared_scores: { ...c.declared_scores, aise: num(e.target.value) } })} /></Field>
          <Field label="Séance d’entraînement (min)" hint="Une fois tout programmé"><Input type="number" min={10} max={120} value={c.entrainement_minutes} onChange={(e) => setC({ ...c, entrainement_minutes: num(e.target.value) })} /></Field>
        </div>
      </SectionCard>
      <SectionCard title="Rythme réel (vitesse ET résultats)" description="Rapide et bon → plus de contenu ; rapide mais résultats insuffisants → pas d’augmentation ; lent → durées allongées sans pénalité.">
        <div className="grid gap-4 md:grid-cols-6">
          <Field label="Mesures minimales"><Input type="number" min={1} max={50} value={c.pace.min_samples} onChange={(e) => setC({ ...c, pace: { ...c.pace, min_samples: num(e.target.value) } })} /></Field>
          <Field label="Pleine valeur à"><Input type="number" min={1} max={100} value={c.pace.full_weight_samples} onChange={(e) => setC({ ...c, pace: { ...c.pace, full_weight_samples: num(e.target.value) } })} /></Field>
          <Field label="Bons résultats ≥ (%)"><Input type="number" min={0} max={100} value={c.pace.good_result} onChange={(e) => setC({ ...c, pace: { ...c.pace, good_result: num(e.target.value) } })} /></Field>
          <Field label="Résultats insuffisants < (%)"><Input type="number" min={0} max={100} value={c.pace.poor_result} onChange={(e) => setC({ ...c, pace: { ...c.pace, poor_result: num(e.target.value) } })} /></Field>
          <Field label="Facteur min"><Input type="number" step={0.05} min={0.2} max={1} value={c.pace.min_factor} onChange={(e) => setC({ ...c, pace: { ...c.pace, min_factor: Number(e.target.value) || 0 } })} /></Field>
          <Field label="Facteur max"><Input type="number" step={0.05} min={1} max={3} value={c.pace.max_factor} onChange={(e) => setC({ ...c, pace: { ...c.pace, max_factor: Number(e.target.value) || 0 } })} /></Field>
        </div>
      </SectionCard>
      <SectionCard title="Coefficients des items hors matrice (§8)" description={`Somme actuelle : ${sum} (normalisée). Ils ne sont jamais affichés aux candidats.`}>
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
