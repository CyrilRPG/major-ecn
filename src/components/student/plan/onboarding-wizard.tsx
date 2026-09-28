'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CalendarDays, GraduationCap, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AvailabilityFields, UnavailableDaysField } from './availability-form';
import { completeOnboardingAction } from '@/app/(student)/planificateur/actions';
import {
  DECLARED_LEVEL_LABEL, DEFAULT_AVAILABILITY, SPECIALTY_LEVELS, VOIE_FORMAT, VOIE_LABEL,
  type Availability, type DeclaredLevel, type Voie,
} from '@/lib/plan/types';
import { cn } from '@/lib/utils';

export type OnboardingSpecialty = { id: string; nom: string; items: number };
export type OnboardingCollege = { id: string; nom: string; items: number; examDate: string | null; specialties: OnboardingSpecialty[] };

type Step = 'disponibilites' | 'niveau';

const fmtLong = (day: string) => new Date(`${day}T12:00:00Z`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const daysUntil = (today: string, day: string) => Math.round((Date.UTC(+day.slice(0, 4), +day.slice(5, 7) - 1, +day.slice(8, 10)) - Date.UTC(+today.slice(0, 4), +today.slice(5, 7) - 1, +today.slice(8, 10))) / 86_400_000);

/**
 * Premier lancement (addendum §3). Le candidat renseigne UNIQUEMENT :
 *  - ses jours disponibles et son temps selon les jours ;
 *  - ses jours d'indisponibilité ;
 *  - son niveau estimé dans chaque spécialité : Faible / Moyen / Bon.
 * Sa voie (profil) et la date de l'EVC (plateforme) ne sont pas redemandées.
 * Aucun test diagnostique n'est imposé.
 */
export function OnboardingWizard({ colleges, voie, today }: { colleges: OnboardingCollege[]; voie: Voie | null; today: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('disponibilites');
  const [collegeId, setCollegeId] = useState(colleges[0]?.id ?? '');
  const [voieChoice, setVoieChoice] = useState<Voie | ''>(voie ?? '');
  const [examDate, setExamDate] = useState('');
  const [availability, setAvailability] = useState<Availability>(DEFAULT_AVAILABILITY);
  const [unavailable, setUnavailable] = useState<string[]>([]);
  const [levels, setLevels] = useState<Record<string, DeclaredLevel>>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const college = colleges.find((c) => c.id === collegeId) ?? null;
  const specialties = useMemo(() => college?.specialties ?? [], [college]);
  // Une date publiée déjà passée (fiche pas encore mise à jour) : le candidat peut indiquer la sienne.
  const publishedOk = !!college?.examDate && college.examDate > today;
  const exam = publishedOk ? college!.examDate : (examDate || null);
  const rated = specialties.filter((s) => levels[s.id]).length;
  const availabilityOk = Object.values(availability).some((v) => v > 0);
  const infoOk = !!college && !!exam && exam > today && (voie !== null || voieChoice !== '');

  function submit() {
    setError(null);
    start(async () => {
      const r = await completeOnboardingAction({
        specialite_id: collegeId, voie: (voie ?? voieChoice) || null, exam_date: publishedOk ? null : examDate || null,
        availability, unavailable_days: unavailable,
        specialty_levels: Object.fromEntries(specialties.map((s) => [s.id, levels[s.id] ?? 'moyen'])),
      });
      if (!r.ok) { setError(r.error); return; }
      router.replace('/planificateur');
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Ce que la plateforme sait déjà : rien à ressaisir */}
      <div className="grid gap-3 rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4 sm:grid-cols-3">
        <div>
          <p className="text-xs font-medium text-(--color-ink-muted)">Spécialité</p>
          {colleges.length > 1 ? (
            <select value={collegeId} onChange={(e) => { setCollegeId(e.target.value); setLevels({}); }} className="mt-1 h-9 w-full rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-2 text-sm text-(--color-ink)">
              {colleges.map((c) => <option key={c.id} value={c.id}>{c.nom} ({c.items} items)</option>)}
            </select>
          ) : <p className="mt-1 text-sm font-semibold text-(--color-ink)">{college?.nom} <span className="font-normal text-(--color-ink-soft)">· {college?.items} items</span></p>}
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium text-(--color-ink-muted)"><GraduationCap className="h-3.5 w-3.5" /> Voie d’EVC</p>
          {voie ? (
            <p className="mt-1 text-sm font-semibold text-(--color-ink)">{VOIE_LABEL[voie]} <span className="block text-xs font-normal text-(--color-ink-soft)">Préparation {VOIE_FORMAT[voie]}</span></p>
          ) : (
            <select value={voieChoice} onChange={(e) => setVoieChoice(e.target.value as Voie | '')} className="mt-1 h-9 w-full rounded-(--radius-button) border border-(--color-border) bg-(--color-surface) px-2 text-sm text-(--color-ink)">
              <option value="">Voie non renseignée — choisir</option><option value="interne">Voie interne (QCM)</option><option value="externe">Voie externe (rédactionnel)</option>
            </select>
          )}
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium text-(--color-ink-muted)"><CalendarDays className="h-3.5 w-3.5" /> Épreuve</p>
          {publishedOk && college?.examDate ? (
            <p className="mt-1 text-sm font-semibold capitalize text-(--color-ink)">{fmtLong(college.examDate)} <span className="block text-xs font-normal normal-case text-(--color-ink-soft)">Il reste {daysUntil(today, college.examDate)} jours</span></p>
          ) : (
            <>
              <Input type="date" value={examDate} min={today} onChange={(e) => setExamDate(e.target.value)} className="mt-1 h-9" aria-label="Date de l’épreuve (non encore publiée sur la plateforme)" />
              <span className="mt-1 block text-xs text-(--color-ink-muted)">{college?.examDate ? 'La date publiée est passée : indiquez la date de votre épreuve.' : 'Date pas encore publiée : indiquez-la.'}</span>
            </>
          )}
        </div>
      </div>

      <div className="rounded-(--radius-card) border border-(--color-border) bg-(--color-surface) p-4 sm:p-6">
        <ol className="mb-5 flex flex-wrap gap-2 text-xs">
          {(['disponibilites', 'niveau'] as Step[]).map((s, i) => (
            <li key={s} className={cn('rounded-full px-2.5 py-1', step === s ? 'bg-[#730d31] text-white' : 'bg-(--color-surface-soft) text-(--color-ink-soft)')}>
              {i + 1}. {s === 'disponibilites' ? 'Vos disponibilités' : 'Votre niveau par spécialité'}
            </li>
          ))}
        </ol>

        {step === 'disponibilites' && (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-(--color-ink)">Vos jours et votre temps disponibles</h2>
              <p className="text-sm text-(--color-ink-soft)">Cochez les jours où vous travaillez et le temps que vous pouvez y consacrer. Les durées sont indicatives : vous pourrez toujours travailler davantage.</p>
            </div>
            <AvailabilityFields value={availability} onChange={setAvailability} />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-(--color-ink)">Jours d’indisponibilité <span className="font-normal text-(--color-ink-muted)">(facultatif)</span></h3>
              <UnavailableDaysField value={unavailable} onChange={setUnavailable} min={today} max={exam ?? undefined} />
            </div>
            <div className="flex justify-end"><Button disabled={!availabilityOk || !infoOk} onClick={() => setStep('niveau')}>Continuer <ArrowRight /></Button></div>
            {(!infoOk || !availabilityOk) && (
              <p className="text-right text-xs text-(--color-ink-muted)">
                {!availabilityOk ? 'Cochez au moins un jour disponible.' : !exam ? 'Indiquez la date de l’épreuve.' : exam <= today ? 'La date de l’épreuve doit être postérieure à aujourd’hui.' : voie === null && voieChoice === '' ? 'Indiquez votre voie.' : 'Choisissez votre spécialité.'}
              </p>
            )}
          </div>
        )}

        {step === 'niveau' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-(--color-ink)">Votre niveau estimé dans chaque spécialité</h2>
                <p className="text-sm text-(--color-ink-soft)">Il sert uniquement à initialiser votre planning : vos résultats réels sur la plateforme prendront progressivement le relais. {rated}/{specialties.length} renseignées.</p>
              </div>
              <div className="flex flex-wrap gap-1 text-xs">
                {SPECIALTY_LEVELS.map((l) => (
                  <button key={l} type="button" onClick={() => setLevels(Object.fromEntries(specialties.map((s) => [s.id, levels[s.id] ?? l])))}
                    className="rounded-full border border-(--color-border) px-2 py-1 text-(--color-ink-soft) hover:text-(--color-ink)">Les autres : {DECLARED_LEVEL_LABEL[l]}</button>
                ))}
              </div>
            </div>
            <ul className="divide-y divide-(--color-border) rounded-lg border border-(--color-border)">
              {specialties.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-2 px-3 py-2.5 text-sm">
                  <span className="min-w-0 flex-1 text-(--color-ink)">{s.nom} <span className="text-xs text-(--color-ink-muted)">· {s.items} items</span></span>
                  <span className="flex gap-1" role="radiogroup" aria-label={s.nom}>
                    {SPECIALTY_LEVELS.map((l) => (
                      <button key={l} type="button" role="radio" aria-checked={levels[s.id] === l} onClick={() => setLevels({ ...levels, [s.id]: l })}
                        className={cn('min-w-[72px] rounded-full border px-3 py-1 text-xs font-medium', levels[s.id] === l ? 'border-[#730d31] bg-[#730d31] text-white' : 'border-(--color-border) text-(--color-ink-soft) hover:border-[#730d31]')}>
                        {DECLARED_LEVEL_LABEL[l]}
                      </button>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
            {error && <p className="text-sm text-(--color-danger)" role="alert">{error}</p>}
            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep('disponibilites')}><ArrowLeft /> Retour</Button>
              <Button disabled={pending || rated < specialties.length} onClick={submit}>{pending ? <Loader2 className="animate-spin" /> : <Sparkles />} Générer mon planning</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
