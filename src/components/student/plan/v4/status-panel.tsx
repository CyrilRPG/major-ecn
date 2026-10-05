'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { PauseCircle, PowerOff, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlannerStatus } from '@/lib/plan/types';
import { reactivateAction, resumeAction } from '@/app/(student)/planificateur/actions';
import { planSerif } from './fonts';
import { Btn, ErrorText, fmtDay } from './today/dialogs';

const REASON: Record<string, string> = {
  epreuve_passee: 'La date de votre épreuve est passée.',
  programme_indisponible: 'Le programme de votre préparation est en cours de mise à jour.',
  acces_specialite: 'Votre formule ne donne plus accès à cette préparation.',
};

/**
 * Planificateur en pause, désactivé ou à reconfigurer (cahier « Alertes »
 * §16-§19) : le planning disparaît, le suivi pédagogique général continue ;
 * rien n'est perdu, la réactivation recalcule tout à partir d'aujourd'hui.
 */
export function StatusPanel({ status, pauseUntil, reason }: { status: PlannerStatus; pauseUntil: string | null; reason: string | null }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const act = (fn: () => Promise<{ ok: boolean; error?: string }>) => start(async () => {
    setError(null);
    const r = await fn();
    if (!r.ok) { setError(r.error ?? 'Erreur'); return; }
    router.refresh();
  });
  const Icon = status === 'en_pause' ? PauseCircle : status === 'desactive' ? PowerOff : Settings2;
  return (
    <section className="pl-card mt-[18px] flex flex-col items-start gap-3 px-[24px] py-[22px] sm:flex-row sm:items-center">
      <span className="grid h-[58px] w-[58px] shrink-0 place-items-center rounded-full bg-(--pl-rose-100) text-(--pl-bordeaux)"><Icon className="h-[30px] w-[30px]" strokeWidth={1.8} /></span>
      <div className="min-w-0 flex-1">
        <h2 className={cn(planSerif.className, 'text-[21px] font-bold text-(--pl-ink)')}>
          {status === 'en_pause' ? 'Votre planning est en pause' : status === 'desactive' ? 'Votre planificateur est désactivé' : 'Votre planificateur est à reconfigurer'}
        </h2>
        <p className="mt-1 text-[14.5px] leading-relaxed text-(--pl-text)">
          {status === 'en_pause' && <>Reprise automatique le {pauseUntil ? fmtDay(pauseUntil) : 'jour choisi'}. Aucun retard n’est créé pendant la pause et votre suivi pédagogique général continue.</>}
          {status === 'desactive' && <>Votre planning a disparu mais votre suivi pédagogique général continue, et toutes vos données sont conservées. À la réactivation, le programme est recalculé à partir d’aujourd’hui (jamais l’ancien calendrier).</>}
          {status === 'a_reconfigurer' && <>{(reason && REASON[reason]) ?? 'Votre planificateur doit être reconfiguré.'} Vos résultats et votre historique sont conservés.</>}
        </p>
        <ErrorText error={error} />
      </div>
      <div className="flex flex-wrap gap-2">
        {status === 'en_pause' && <Btn primary pending={pending} onClick={() => act(resumeAction)}>Reprendre maintenant</Btn>}
        {status === 'desactive' && <Btn primary pending={pending} onClick={() => act(reactivateAction)}>Réactiver mon planificateur</Btn>}
        {status === 'a_reconfigurer' && reason !== 'acces_specialite' && <Link href="/planificateur/objectifs" className="inline-flex h-[42px] items-center rounded-full bg-(--pl-pill) px-[18px] text-[14.5px] font-semibold text-white">Reconfigurer</Link>}
      </div>
    </section>
  );
}
