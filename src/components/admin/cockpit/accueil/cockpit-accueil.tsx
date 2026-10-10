'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart3, CalendarDays, Check, ChevronRight, Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Lightbulb,
  ListChecks, Mail, MessageSquareWarning, Pencil, Sparkles, Sun, Target,
} from 'lucide-react';
import type { Cockpit } from '@/lib/cockpit/server/donnees';
import { enregistrerObjectif, basculerObjectif } from '@/app/admin/cockpit/actions-divers';
import { cn } from '@/lib/utils';
import { DEGRADE, NUIT, PageCockpit, Toast, useEtatSuivi, useMessage } from '../ui';
import { BlocPriorites } from './bloc-priorites';
import { BlocAgenda, BlocCalendrier } from './bloc-agenda';
import { BlocTachesSemaine } from './bloc-taches';
import { BlocAttente, BlocMessages } from './bloc-echanges';
import { BlocAmeliorations, BlocReclamations } from './bloc-qualite';
import { BlocAssistant } from './bloc-assistant';

const CITATIONS = [
  'Ce sont les petites actions bien organisées qui font les grands projets.',
  'Une priorité claire vaut mieux que dix urgences subies.',
  'Chaque réponse rapide est une promesse tenue envers nos étudiants.',
  'L’excellence est un art que l’on n’atteint que par l’exercice constant.',
  'Organiser aujourd’hui, c’est libérer du temps pour l’essentiel demain.',
  'Un problème signalé est une occasion de faire mieux pour tous.',
  'La régularité bat l’intensité : avançons pas à pas.',
];

function IconeMeteo({ code, className }: { code: number; className?: string }) {
  const I = code === 0 ? Sun : code <= 3 ? CloudSun : code <= 48 ? CloudFog : code <= 67 || (code >= 80 && code <= 82) ? CloudRain : code <= 77 || code === 85 || code === 86 ? CloudSnow : code >= 95 ? CloudLightning : Cloud;
  return <I className={className} />;
}

export function CockpitAccueil({
  donnees, meteo, prenom, estAdmin,
}: {
  donnees: Cockpit;
  meteo: { temperature: number; code: number } | null;
  prenom: string;
  estAdmin: boolean;
}) {
  const [message, setMessage] = useMessage();
  const [jour, setJour] = React.useState(donnees.aujourdHui);
  const c = donnees.compteurs;
  const [y, m, d] = donnees.aujourdHui.split('-').map(Number);
  const dateLongue = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const citation = CITATIONS[(y * 372 + m * 31 + d) % CITATIONS.length];
  const delta = c.tauxReponse !== null && c.tauxReponsePrecedent !== null ? c.tauxReponse - c.tauxReponsePrecedent : null;

  return (
    <PageCockpit className="lg:px-6">
      <div className="mx-auto max-w-[1680px] space-y-5">
        {/* ─────────── Bandeau : salutation, objectif, citation, date & météo, indicateurs ───────────
            Même vocabulaire que les grandes cartes de l'administration (Facturation IA) :
            fond nuit, verre dépoli, chiffres en police d'affichage, dégradé signature. */}
        <section className={cn('relative overflow-hidden rounded-[2rem] p-5 text-white shadow-(--shadow-lifted) sm:p-7', NUIT)}>
          <span aria-hidden className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-[#E4002B]/30 blur-3xl" />
          <span aria-hidden className="pointer-events-none absolute -bottom-40 left-1/3 h-80 w-80 rounded-full bg-[#F97316]/20 blur-3xl" />
          <span aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.07)_1px,transparent_0)] [background-size:22px_22px]" />

          <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium capitalize text-white/85 ring-1 ring-white/10">
                  <CalendarDays className="h-3.5 w-3.5" /> {dateLongue}
                </span>
                {meteo && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white/85 ring-1 ring-white/10">
                    <IconeMeteo code={meteo.code} className="h-3.5 w-3.5 text-[#FCD34D]" /> {meteo.temperature}° · Paris
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70 ring-1 ring-white/10">
                  <Sparkles className="h-3.5 w-3.5" /> Mon cockpit
                </span>
              </div>
              <h1 className="mt-4 font-display text-[34px] font-semibold leading-[1.05] tracking-tight sm:text-[44px]">
                Bonjour{' '}
                <span className="bg-[linear-gradient(90deg,#FF5A6E_0%,#F97316_100%)] bg-clip-text text-transparent">{prenom}</span> !
              </h1>
              <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-white/70">
                {c.urgentes === 0
                  ? 'Tout est sous contrôle. Avançons ensemble pour la réussite de nos étudiants.'
                  : `${c.urgentes} urgence${c.urgentes > 1 ? 's' : ''} à traiter aujourd’hui. Avançons ensemble pour la réussite de nos étudiants.`}
              </p>
              <ObjectifDuJour aujourdHui={donnees.aujourdHui} objectif={donnees.objectifJour} onMessage={setMessage} />
            </div>
            <blockquote className="relative hidden flex-col justify-center rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 xl:flex">
              <span aria-hidden className="absolute left-4 top-1 font-display text-[88px] leading-none text-white/10">“</span>
              <p className="relative font-display text-[19px] italic leading-snug text-white/90">{citation}</p>
              <footer className="relative mt-3 flex items-center gap-2 text-[12px] font-medium uppercase tracking-[0.14em] text-white/55">
                <span className={cn('h-px w-6', DEGRADE)} /> Major ECN
              </footer>
            </blockquote>
          </div>

          {/* Indicateurs */}
          <div className="relative mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <Indicateur href="/admin/cockpit/taches" Icone={ListChecks} valeur={c.aFaire} libelle="Tâches à faire"
            detail={c.urgentes > 0 ? `${c.urgentes} urgente${c.urgentes > 1 ? 's' : ''}` : 'Aucune urgence'} ton={c.urgentes > 0 ? 'rouge' : 'gris'} />
          <Indicateur href="/admin/cockpit/agenda" Icone={CalendarDays} valeur={c.rdvAujourdhui} libelle="Rendez-vous aujourd’hui"
            detail={c.prochainRdv ? `Prochain : ${c.prochainRdv.date === donnees.aujourdHui ? '' : `${c.prochainRdv.date.slice(8)}/${c.prochainRdv.date.slice(5, 7)} `}${c.prochainRdv.heure ?? ''}` : 'Aucun à venir'} ton="gris" />
          <Indicateur href="/admin/cockpit/messagerie?boite=envoyes" Icone={Mail} valeur={c.attente.total} libelle="En attente de réponse"
            detail={c.attente.total > 0 ? `${c.attente.enseignants} enseignant${c.attente.enseignants > 1 ? 's' : ''} · ${c.attente.clients} client${c.attente.clients > 1 ? 's' : ''}` : 'Rien en attente'} ton={c.attente.total > 0 ? 'rouge' : 'gris'} />
          <Indicateur href="/admin/cockpit/reclamations" Icone={MessageSquareWarning} valeur={c.reclamations.ouvertes} libelle="Réclamations clients"
            detail={c.reclamations.urgentes > 0 ? `${c.reclamations.urgentes} urgente${c.reclamations.urgentes > 1 ? 's' : ''}` : `${c.demandes.ouvertes} demande${c.demandes.ouvertes > 1 ? 's' : ''} client${c.demandes.ouvertes > 1 ? 's' : ''}`} ton={c.reclamations.urgentes > 0 ? 'rouge' : 'gris'} />
          <Indicateur href="/admin/cockpit/reclamations?vue=ameliorations" Icone={Lightbulb} valeur={c.ameliorations.ouvertes} libelle="Améliorations à piloter"
            detail={`${c.ameliorations.enCours} en cours`} ton="vert" />
          <Indicateur href="/admin/cockpit/messagerie" Icone={BarChart3} valeur={c.tauxReponse === null ? '—' : `${c.tauxReponse} %`} libelle="Taux de réponse"
            detail={delta === null ? 'Sur 30 jours' : `(${delta >= 0 ? '+' : ''}${delta} % ce mois-ci)`} ton={delta !== null && delta < 0 ? 'rouge' : 'vert'} />
          </div>
        </section>

        {/* ─────────── Priorités · Agenda · Calendrier ─────────── */}
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-12">
          <BlocPriorites className="xl:col-span-5" priorites={donnees.priorites} urgentes={c.urgentes} aujourdHui={donnees.aujourdHui} onMessage={setMessage} />
          <BlocAgenda className="xl:col-span-4" elements={donnees.agenda} aujourdHui={donnees.aujourdHui} jour={jour} onJour={setJour} />
          <BlocCalendrier className="lg:col-span-2 xl:col-span-3" elements={donnees.agenda} aujourdHui={donnees.aujourdHui} jour={jour} onJour={setJour} />
        </div>

        {/* ─────────── Tâches · Attentes · Messages ─────────── */}
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <BlocTachesSemaine taches={donnees.taches} aujourdHui={donnees.aujourdHui} priorites={donnees.priorites.filter((p) => !p.suggeree).map((p) => p.id)} onMessage={setMessage} />
          <BlocAttente attente={donnees.attente} />
          <BlocMessages messages={donnees.messages} className="lg:col-span-2 xl:col-span-1" />
        </div>

        {/* ─────────── Réclamations · Améliorations · Assistant IA ─────────── */}
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {estAdmin && <BlocReclamations reclamations={donnees.reclamations} ouvertes={c.reclamations.ouvertes} aRecontacter={c.reclamations.aRecontacter} />}
          {estAdmin && <BlocAmeliorations ameliorations={donnees.ameliorations} total={c.ameliorations.ouvertes} aValider={c.ameliorations.aValider} />}
          <BlocAssistant reclamations={donnees.reclamations} ameliorations={donnees.ameliorations} className={cn(estAdmin ? 'lg:col-span-2 xl:col-span-1' : 'lg:col-span-2 xl:col-span-3')} />
        </div>

        <PiedCockpit />
      </div>
      <Toast message={message} />
    </PageCockpit>
  );
}

function ObjectifDuJour({ aujourdHui, objectif, onMessage }: { aujourdHui: string; objectif: Cockpit['objectifJour']; onMessage: (m: string) => void }) {
  const router = useRouter();
  const [edition, setEdition] = React.useState(false);
  const [texte, setTexte] = useEtatSuivi(objectif?.texte ?? '');
  const [enCours, start] = React.useTransition();
  const enregistrer = () => start(async () => {
    const r = await enregistrerObjectif('jour', aujourdHui, texte);
    onMessage(r.ok ? 'Objectif du jour enregistré.' : r.erreur);
    setEdition(false);
    router.refresh();
  });
  return (
    <div className="mt-5 flex min-w-0 items-center gap-3 rounded-2xl bg-white/[0.07] px-4 py-3 ring-1 ring-white/12 backdrop-blur-sm">
      <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white shadow-[0_8px_18px_-8px_rgba(228,0,43,0.8)]', DEGRADE)}>
        <Target className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/55">Ma priorité du jour</p>
        {edition ? (
          <form className="mt-1 flex min-w-0 items-center gap-2" onSubmit={(e) => { e.preventDefault(); enregistrer(); }}>
            <input autoFocus value={texte} onChange={(e) => setTexte(e.target.value)} maxLength={500}
              placeholder="Ex. Finaliser les dossiers prioritaires et relancer les intervenants en attente"
              className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-sm text-white placeholder:text-white/40 focus:border-white/50 focus:outline-none" />
            <button type="submit" disabled={enCours} className={cn('rounded-lg px-3 py-1.5 text-[12.5px] font-semibold text-white', DEGRADE)}>Enregistrer</button>
          </form>
        ) : objectif ? (
          <button type="button" onClick={() => start(async () => { await basculerObjectif('jour', aujourdHui); router.refresh(); })}
            className={cn('mt-0.5 block w-full truncate text-left text-[15px] font-medium text-white', objectif.atteint && 'text-white/50 line-through')}
            title={objectif.atteint ? 'Objectif atteint — cliquer pour rouvrir' : 'Cliquer quand l’objectif est atteint'}>
            {objectif.atteint && <Check className="mr-1 inline h-4 w-4 text-[#86EFAC]" />}
            {objectif.texte}
          </button>
        ) : (
          <button type="button" onClick={() => setEdition(true)} className="mt-0.5 block w-full truncate text-left text-[15px] text-white/50 hover:text-white/80">
            Fixer l’objectif principal de la journée…
          </button>
        )}
      </div>
      {!edition && (
        <button type="button" aria-label="Modifier l’objectif du jour" onClick={() => setEdition(true)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/70 hover:bg-white/10 hover:text-white">
          <Pencil className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

const TONS_DETAIL = { rouge: 'text-[#FCA5A5]', vert: 'text-[#86EFAC]', gris: 'text-white/55' } as const;

function Indicateur({
  href, Icone, valeur, libelle, detail, ton,
}: {
  href: string;
  Icone: React.ComponentType<{ className?: string }>;
  valeur: number | string;
  libelle: string;
  detail: string;
  ton: keyof typeof TONS_DETAIL;
}) {
  return (
    <Link
      href={href}
      className="group relative flex min-w-0 flex-col gap-3 overflow-hidden rounded-2xl bg-white/[0.06] p-4 ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/[0.1] hover:ring-white/20 focus-ring"
    >
      <span className="flex items-center justify-between">
        <span className={cn('grid h-10 w-10 place-items-center rounded-xl text-white shadow-[0_8px_18px_-8px_rgba(228,0,43,0.85)]', DEGRADE)}>
          <Icone className="h-5 w-5" />
        </span>
        <ChevronRight className="h-4 w-4 text-white/35 transition-all group-hover:translate-x-0.5 group-hover:text-white/80" />
      </span>
      <span className="min-w-0">
        <span className="block font-display text-[30px] font-bold leading-none tabular-nums tracking-tight">{valeur}</span>
        <span className="mt-1.5 block text-[13px] font-medium leading-tight text-white/85">{libelle}</span>
        <span className={cn('mt-1 block truncate text-[12px] font-medium', TONS_DETAIL[ton])}>{detail}</span>
      </span>
    </Link>
  );
}

function PiedCockpit() {
  return (
    <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-(--color-border) bg-(--color-surface) px-5 py-3.5 text-[12.5px] text-(--color-ink-soft) shadow-(--shadow-soft)">
      <span className="font-display text-[15px] font-semibold text-(--color-ink)">Major ECN</span>
      <span>15 ans d’expertise</span>
      <span aria-hidden>•</span>
      <span>Plus de 9 000 candidats accompagnés</span>
      <span aria-hidden>•</span>
      <span>Des praticiens hospitaliers à vos côtés</span>
      <span className="ml-auto flex items-center gap-3">
        <a href="mailto:contact@major-ecn.fr" className="hover:text-(--color-primary)">Contact support</a>
        <span aria-hidden>|</span>
        <span>Version 2.0</span>
      </span>
    </footer>
  );
}
