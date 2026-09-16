'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { AvailabilityFields } from './availability-form';
import { completeOnboardingAction } from '@/app/(student)/planificateur/actions';
import {
  CONSENT_CHECKBOX, CONSENT_TEXT, CONSENT_TITLE, DECLARED_LEVELS, DECLARED_LEVEL_LABEL, DEFAULT_AVAILABILITY,
  type Availability, type DeclaredLevel,
} from '@/lib/plan/types';
import { cn } from '@/lib/utils';

export type OnboardingCollege = { id: string; nom: string; items: { id: string; name: string; group: string }[] };

type Step = 'info' | 'consent' | 'availability' | 'levels' | 'done';

/**
 * Onboarding (§3 + complément §2) : informations, information obligatoire,
 * disponibilités, auto-évaluation rapide item par item (Faible / Moyen /
 * À l'aise / Je ne sais pas) — puis planning immédiat (§11).
 */
export function OnboardingWizard({ colleges, defaultVoie, today }: { colleges: OnboardingCollege[]; defaultVoie: 'interne' | 'externe' | null; today: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('info');
  const [collegeId, setCollegeId] = useState(colleges[0]?.id ?? '');
  const [voie, setVoie] = useState<'interne' | 'externe' | ''>(defaultVoie ?? '');
  const [examDate, setExamDate] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [consent, setConsent] = useState(false);
  const [availability, setAvailability] = useState<Availability>(DEFAULT_AVAILABILITY);
  const [levels, setLevels] = useState<Record<string, DeclaredLevel>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const college = colleges.find((c) => c.id === collegeId) ?? null;
  const items = useMemo(() => college?.items ?? [], [college]);
  const rated = items.filter((i) => levels[i.id]).length;
  const groups = useMemo(() => {
    const m = new Map<string, OnboardingCollege['items']>();
    for (const i of items) m.set(i.group, [...(m.get(i.group) ?? []), i]);
    return Array.from(m.entries());
  }, [items]);

  const setAll = (l: DeclaredLevel) => setLevels(Object.fromEntries(items.map((i) => [i.id, levels[i.id] ?? l])));

  function submit() {
    setError(null);
    start(async () => {
      const r = await completeOnboardingAction({
        specialite_id: collegeId, voie: voie || null, exam_date: examDate, start_date: startDate, availability,
        levels: Object.fromEntries(items.map((i) => [i.id, levels[i.id] ?? 'inconnu'])), consent: consent as true,
      });
      if (!r.ok) { setError(r.error); return; }
      setStep('done');
      router.push('/planificateur');
      router.refresh();
    });
  }

  const Steps = (
    <ol className="mb-5 flex flex-wrap gap-2 text-xs">
      {(['info', 'consent', 'availability', 'levels'] as Step[]).map((s, i) => (
        <li key={s} className={cn('rounded-full px-2.5 py-1', step === s ? 'bg-(--color-primary) text-(--color-primary-fg)' : 'bg-(--color-surface-soft) text-(--color-ink-soft)')}>
          {i + 1}. {s === 'info' ? 'Informations' : s === 'consent' ? 'Information' : s === 'availability' ? 'Disponibilités' : 'Niveau initial'}
        </li>
      ))}
    </ol>
  );

  return (
    <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4 sm:p-6">
      {Steps}
      {step === 'info' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-(--color-ink)">Votre préparation</h2>
          <label className="flex flex-col gap-1.5 text-sm"><span className="font-medium text-(--color-ink)">Spécialité</span>
            <select value={collegeId} onChange={(e) => { setCollegeId(e.target.value); setLevels({}); }} className="h-11 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-ink)">
              {colleges.map((c) => <option key={c.id} value={c.id}>{c.nom} ({c.items.length} items)</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm"><span className="font-medium text-(--color-ink)">Voie de concours</span>
            <select value={voie} onChange={(e) => setVoie(e.target.value as 'interne' | 'externe' | '')} className="h-11 rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-3 text-sm text-(--color-ink)">
              <option value="">Non précisée</option><option value="interne">Voie interne (QCM)</option><option value="externe">Voie externe (rédactionnel)</option>
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-sm"><span className="font-medium text-(--color-ink)">Date des épreuves</span><Input type="date" value={examDate} min={today} onChange={(e) => setExamDate(e.target.value)} /></label>
            <label className="flex flex-col gap-1.5 text-sm"><span className="font-medium text-(--color-ink)">Début de préparation</span><Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></label>
          </div>
          <div className="flex justify-end"><Button disabled={!collegeId || !examDate || examDate <= today} onClick={() => setStep('consent')}>Continuer <ArrowRight /></Button></div>
          {examDate && examDate <= today && <p className="text-xs text-(--color-danger)">La date des épreuves doit être postérieure à aujourd’hui.</p>}
        </div>
      )}

      {step === 'consent' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-(--color-ink)">{CONSENT_TITLE}</h2>
          {CONSENT_TEXT.map((p, i) => <p key={i} className="text-sm text-(--color-ink-soft)">{p}</p>)}
          <label className="flex items-start gap-3 rounded-lg border border-(--color-border) p-3 text-sm text-(--color-ink)">
            <Checkbox checked={consent} onCheckedChange={(v) => setConsent(!!v)} className="mt-0.5" />
            <span>{CONSENT_CHECKBOX}</span>
          </label>
          <div className="flex justify-between"><Button variant="ghost" onClick={() => setStep('info')}><ArrowLeft /> Retour</Button><Button disabled={!consent} onClick={() => setStep('availability')}>Continuer <ArrowRight /></Button></div>
        </div>
      )}

      {step === 'availability' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-(--color-ink)">Vos disponibilités</h2>
          <p className="text-sm text-(--color-ink-soft)">Temps de travail disponible par jour. Vous pourrez les modifier à tout moment.</p>
          <AvailabilityFields value={availability} onChange={setAvailability} />
          <div className="flex justify-between"><Button variant="ghost" onClick={() => setStep('consent')}><ArrowLeft /> Retour</Button><Button disabled={Object.values(availability).every((v) => v === 0)} onClick={() => setStep('levels')}>Continuer <ArrowRight /></Button></div>
        </div>
      )}

      {step === 'levels' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold text-(--color-ink)">Votre niveau initial</h2>
              <p className="text-sm text-(--color-ink-soft)">Une auto-évaluation rapide, item par item — pas de test de plusieurs centaines de questions. {rated}/{items.length} renseignés ; les items non renseignés sont pris « Je ne sais pas ».</p>
            </div>
            <div className="flex flex-wrap gap-1 text-xs">
              {DECLARED_LEVELS.map((l) => <button key={l} type="button" onClick={() => setAll(l)} className="rounded-full border border-(--color-border) px-2 py-1 text-(--color-ink-soft) hover:text-(--color-ink)">Tout le reste : {DECLARED_LEVEL_LABEL[l]}</button>)}
            </div>
          </div>
          <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-1">
            {groups.map(([group, list]) => (
              <div key={group}>
                {groups.length > 1 && <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">{group}</p>}
                <ul className="divide-y divide-(--color-border) rounded-lg border border-(--color-border)">
                  {list.map((i) => (
                    <li key={i.id} className="flex flex-wrap items-center gap-2 px-3 py-2 text-sm">
                      <span className="min-w-0 flex-1 text-(--color-ink)">{i.name}</span>
                      <span className="flex flex-wrap gap-1" role="radiogroup" aria-label={i.name}>
                        {DECLARED_LEVELS.map((l) => (
                          <button key={l} type="button" role="radio" aria-checked={levels[i.id] === l} onClick={() => setLevels({ ...levels, [i.id]: l })}
                            className={cn('rounded-full border px-2.5 py-1 text-xs', levels[i.id] === l ? 'border-(--color-primary) bg-(--color-primary) text-(--color-primary-fg)' : 'border-(--color-border) text-(--color-ink-soft) hover:border-(--color-primary)')}>
                            {DECLARED_LEVEL_LABEL[l]}
                          </button>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {error && <p className="text-sm text-(--color-danger)" role="alert">{error}</p>}
          <div className="flex justify-between">
            <Button variant="ghost" onClick={() => setStep('availability')}><ArrowLeft /> Retour</Button>
            <Button disabled={pending} onClick={submit}>{pending ? <Loader2 className="animate-spin" /> : <Sparkles />} Générer mon planning</Button>
          </div>
        </div>
      )}

      {step === 'done' && <p className="text-sm text-(--color-ink-soft)">Planning généré, redirection…</p>}
    </div>
  );
}
