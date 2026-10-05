'use client';

import { useRouter } from 'next/navigation';
import { useMemo, useState, useSyncExternalStore, useTransition } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EMPTY_PREFERENCES, type Preferences } from '@/lib/plan/model';
import type { OnboardingData } from '@/lib/plan/operations';
import { CONSENT_CHECKBOX, DEFAULT_AVAILABILITY, FIRST_PLAN_BUTTON, FIRST_PLAN_TEXT, FIRST_PLAN_TITLE, type Availability, type Voie } from '@/lib/plan/types';
import { completeOnboardingAction, updatePreferencesAction, updateSelfAssessmentAction } from '@/app/(student)/planificateur/actions';
import { planSerif } from '../fonts';
import { ErrorText } from '../today/dialogs';

const noSubscribe = () => () => {};
function detectTimezone(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris'; } catch { return 'Europe/Paris'; }
}
import { AvailabilityStep } from './availability';
import { LevelsStep, PrecisionChoice, PrecisionStep, type LevelsValue } from './levels';
import { PreferencesStep } from './preferences';

type Step = 'preparation' | 'disponibilites' | 'niveau' | 'precision-choix' | 'precision' | 'preferences' | 'engagement';
const STEP_TITLE: Record<Step, string> = {
  preparation: 'Votre préparation',
  disponibilites: 'Vos disponibilités',
  niveau: 'Votre niveau, en quelques clics',
  'precision-choix': 'Préciser votre niveau item par item ?',
  precision: 'Précisez vos items',
  preferences: 'Vos préférences',
  engagement: FIRST_PLAN_TITLE,
};

/**
 * Premier lancement (§5, cible : moins de 5 minutes) — ou modification de
 * l'auto-évaluation / des préférences. La structure (domaines puis items, ou
 * liste directe d'items) vient de la matrice de chaque préparation.
 */
export function OnboardingWizard({ data, today, mode = 'create' }: { data: OnboardingData; today: string; mode?: 'create' | 'levels' | 'preferences' }) {
  const router = useRouter();
  const cur = data.current;
  const [prepId, setPrepId] = useState<string>(cur?.specialite_id && data.preparations.some((p) => p.id === cur.specialite_id) ? cur.specialite_id : data.preparations[0]?.id ?? '');
  const prep = data.preparations.find((p) => p.id === prepId) ?? null;
  const [voie, setVoie] = useState<Voie | null>(data.voie ?? cur?.voie ?? null);
  const [examDate, setExamDate] = useState<string>(cur?.exam_date ?? '');
  const [availability, setAvailability] = useState<Availability>(cur?.availability ?? DEFAULT_AVAILABILITY);
  const [unavailable, setUnavailable] = useState<string[]>(cur?.unavailable_days ?? []);
  const [timezone, setTimezone] = useState<string | null>(cur?.timezone ?? null);
  const [levels, setLevels] = useState<LevelsValue>({ global: cur?.global ?? null, domains: cur?.domains ?? {}, items: cur?.items ?? {}, precision: cur?.precision ?? false });
  const [prefs, setPrefs] = useState<Preferences>(cur?.preferences ?? EMPTY_PREFERENCES);
  const [consent, setConsent] = useState(false);
  const [precisionWanted, setPrecisionWanted] = useState(mode === 'levels');
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  // Fuseau du navigateur proposé par défaut (inconnu au rendu serveur) ; le candidat peut le modifier.
  const browserTimezone = useSyncExternalStore(noSubscribe, detectTimezone, () => null);
  const effectiveTimezone = timezone ?? browserTimezone;

  const needPrepStep = mode === 'create' && (data.preparations.length > 1 || !data.voie || (prep !== null && !prep.examDate));
  const steps = useMemo<Step[]>(() => {
    if (mode === 'preferences') return ['preferences'];
    if (mode === 'levels') return ['niveau', 'precision'];
    return [...(needPrepStep ? ['preparation' as Step] : []), 'disponibilites', 'niveau', 'precision-choix', ...(precisionWanted ? ['precision' as Step] : []), 'preferences', 'engagement'];
  }, [mode, needPrepStep, precisionWanted]);
  const [i, setI] = useState(0);
  const step = steps[Math.min(i, steps.length - 1)];
  const last = i >= steps.length - 1;

  const validate = (s: Step): string | null => {
    if (s === 'preparation') {
      if (!prep) return 'Choisissez votre préparation.';
      if (!voie && !data.voie) return 'Indiquez votre voie.';
      if (!prep.examDate && (!examDate || examDate <= today)) return 'Indiquez la date de votre épreuve (à venir).';
    }
    if (s === 'disponibilites' && Object.values(availability).every((v) => v === 0)) return 'Indiquez au moins un jour disponible.';
    if (s === 'engagement' && !consent) return 'Cochez la case pour confirmer.';
    return null;
  };
  const go = (d: 1 | -1) => {
    setError(null);
    if (d === 1) { const e = validate(step); if (e) { setError(e); return; } }
    setI((x) => Math.max(0, Math.min(steps.length - 1, x + d)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const finish = () => start(async () => {
    setError(null);
    const e = validate(step);
    if (e) { setError(e); return; }
    if (mode === 'levels') {
      const r = await updateSelfAssessmentAction({ ...levels, precision: true });
      if (!r.ok) { setError(r.error); return; }
      router.push('/planificateur/revisions');
      return;
    }
    if (mode === 'preferences') {
      const r = await updatePreferencesAction(prefs);
      if (!r.ok) { setError(r.error); return; }
      router.push('/planificateur/objectifs');
      return;
    }
    const r = await completeOnboardingAction({
      specialite_id: prepId, voie: data.voie ?? voie, exam_date: prep?.examDate ? null : examDate || null, availability, unavailable_days: unavailable, timezone: effectiveTimezone,
      global: prep?.structure === 'FLAT' ? levels.global : null, domains: prep?.structure === 'HIERARCHICAL' ? levels.domains : {}, items: precisionWanted ? levels.items : {},
      precision: precisionWanted && Object.keys(levels.items).length > 0, preferences: prefs, consent,
    });
    if (!r.ok) { setError(r.error); return; }
    router.push('/planificateur');
    router.refresh();
  });

  if (!prep) return <p className="pl-card mt-6 px-6 py-5 text-[15px]">Aucune préparation n’est encore ouverte au planificateur pour votre formule.</p>;
  return (
    <div className="mx-auto mt-[18px] max-w-[980px]">
      {mode === 'create' && (
        <ol className="mb-4 flex flex-wrap gap-1.5" aria-label="Étapes">
          {steps.map((s, k) => <li key={s} className={cn('h-[6px] flex-1 rounded-full', k <= i ? 'bg-(--pl-crimson)' : 'bg-(--pl-rose-100)')} aria-current={k === i ? 'step' : undefined}><span className="sr-only">{STEP_TITLE[s]}</span></li>)}
        </ol>
      )}
      <section className="pl-card px-[22px] py-[22px] sm:px-[30px]">
        <h2 className={cn(planSerif.className, 'text-[24px] font-bold text-(--pl-ink)')}>{STEP_TITLE[step]}</h2>
        <div className="mt-4">
          {step === 'preparation' && (
            <div className="space-y-4">
              {data.preparations.length > 1 && (
                <div className="flex flex-wrap gap-2">{data.preparations.map((p) => (
                  <button key={p.id} type="button" aria-pressed={p.id === prepId} onClick={() => setPrepId(p.id)} className={cn('rounded-full border px-4 py-2 text-[14.5px]', p.id === prepId ? 'border-(--pl-pill) bg-(--pl-pill) font-semibold text-white' : 'border-(--pl-card-border)')}>{p.label}</button>
                ))}</div>
              )}
              {!data.voie && (
                <div className="flex flex-wrap items-center gap-2"><span className="text-[14.5px] font-semibold text-(--pl-ink)">Votre voie :</span>
                  {(['interne', 'externe'] as Voie[]).map((v) => <button key={v} type="button" aria-pressed={voie === v} onClick={() => setVoie(v)} className={cn('rounded-full border px-4 py-1.5 text-[14px]', voie === v ? 'border-(--pl-pill) bg-(--pl-pill) font-semibold text-white' : 'border-(--pl-card-border)')}>{v === 'interne' ? 'Voie interne (QCM)' : 'Voie externe (rédactionnel)'}</button>)}
                </div>
              )}
              {prep.examDate ? <p className="text-[14.5px] text-(--pl-text)">Date de l’épreuve : <strong>{prep.examDate.split('-').reverse().join('/')}</strong> (calendrier officiel).</p> : (
                <label className="block text-[14.5px] font-semibold text-(--pl-ink)">Date de votre épreuve
                  <input type="date" min={today} value={examDate} onChange={(e) => setExamDate(e.target.value)} className="mt-1 block h-[40px] rounded-[10px] border border-(--pl-card-border) bg-(--pl-card) px-3 text-[14.5px] font-normal" />
                </label>
              )}
            </div>
          )}
          {step === 'disponibilites' && <AvailabilityStep availability={availability} onAvailability={setAvailability} unavailable={unavailable} onUnavailable={setUnavailable} timezone={effectiveTimezone} onTimezone={setTimezone} today={today} />}
          {step === 'niveau' && (
            <>
              <p className="mb-4 text-[14.5px] text-(--pl-text)">{prep.structure === 'HIERARCHICAL' ? 'Indiquez votre niveau dans chaque spécialité : il devient une estimation de départ pour tous ses items. Vos résultats réels prendront ensuite le dessus.' : `Indiquez votre niveau global en ${prep.label} : il devient une estimation de départ pour tous les items. Vos résultats réels prendront ensuite le dessus.`}</p>
              <LevelsStep prep={prep} value={levels} onChange={setLevels} />
            </>
          )}
          {step === 'precision-choix' && <PrecisionChoice onYes={() => { setPrecisionWanted(true); setI((x) => x + 1); }} onNo={() => { setPrecisionWanted(false); setLevels((l) => ({ ...l, items: {}, precision: false })); setI((x) => x + 1); }} />}
          {step === 'precision' && <PrecisionStep prep={prep} value={levels} onChange={setLevels} />}
          {step === 'preferences' && <PreferencesStep prep={prep} value={prefs} onChange={setPrefs} />}
          {step === 'engagement' && (
            <div className="space-y-3 text-[14.8px] leading-[22px] text-(--pl-text)">
              {FIRST_PLAN_TEXT.map((t, k) => <p key={k} className={cn(k === 2 && 'flex gap-3 rounded-[12px] bg-[#fff9ee] px-4 py-3 dark:bg-[#231b10]')}>{k === 2 && <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-[#8a5a14]" />}<span>{t}</span></p>)}
              <label className="mt-2 flex cursor-pointer items-start gap-3 rounded-[12px] border border-(--pl-rose-200) bg-(--pl-rose-50) px-4 py-3 text-(--pl-ink)">
                <input type="checkbox" className="mt-1 h-4 w-4 accent-[#850016]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span>{CONSENT_CHECKBOX}</span>
              </label>
            </div>
          )}
        </div>
        <div className="mt-5"><ErrorText error={error} /></div>
        {step !== 'precision-choix' && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
            {i > 0 ? <button type="button" onClick={() => go(-1)} className="inline-flex items-center gap-1.5 text-[14.5px] font-semibold text-(--pl-bordeaux)"><ArrowLeft className="h-4 w-4" />Retour</button> : <span />}
            {last ? (
              <button type="button" onClick={finish} disabled={pending} className="inline-flex h-[46px] items-center gap-2 rounded-full bg-(--pl-pill) px-[22px] text-[15.5px] font-semibold text-white hover:brightness-110 disabled:opacity-60">
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}{mode === 'create' ? FIRST_PLAN_BUTTON : 'Enregistrer'}
              </button>
            ) : (
              <button type="button" onClick={() => go(1)} className="inline-flex h-[44px] items-center gap-1.5 rounded-full bg-(--pl-pill) px-[20px] text-[15px] font-semibold text-white hover:brightness-110">Continuer<ArrowRight className="h-4 w-4" /></button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
