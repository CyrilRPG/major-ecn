'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BarChart3, CalendarDays, Check, ChevronRight, Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, Lightbulb,
  ListChecks, Mail, MessageSquareWarning, Pencil, Sun, Target,
} from 'lucide-react';
import type { Cockpit } from '@/lib/cockpit/server/donnees';
import { enregistrerObjectif, basculerObjectif } from '@/app/admin/cockpit/actions-divers';
import { cn } from '@/lib/utils';
import { Carte, PageCockpit, Toast, useEtatSuivi, useMessage } from '../ui';
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
      <div className="mx-auto max-w-[1680px] space-y-4">
        {/* ─────────── En-tête : salutation, citation, date & météo, bandeau ─────────── */}
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.8fr)]">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-(--color-ink) sm:text-3xl">
              Bonjour {prenom} !
            </h1>
            <p className="mt-1 text-[15px] text-(--color-ink)">
              {c.urgentes === 0
                ? 'Tout est sous contrôle. Avançons ensemble pour la réussite de nos étudiants.'
                : `${c.urgentes} urgence${c.urgentes > 1 ? 's' : ''} à traiter aujourd’hui. Avançons ensemble pour la réussite de nos étudiants.`}
            </p>
            <ObjectifDuJour aujourdHui={donnees.aujourdHui} objectif={donnees.objectifJour} onMessage={setMessage} />
          </div>
          <blockquote className="hidden flex-col justify-center border-l border-(--color-border) px-5 xl:flex">
            <p className="text-[15px] italic leading-relaxed text-(--color-ink-soft)">« {citation} »</p>
            <footer className="mt-2 text-[12px] text-(--color-ink-soft)">Major ECN</footer>
          </blockquote>
          <div className="flex items-center gap-4 rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-3 xl:flex-col xl:items-start xl:justify-center xl:gap-2">
            <p className="flex items-center gap-2 text-[14px] font-medium capitalize text-(--color-ink)">
              <CalendarDays className="h-5 w-5 text-(--color-primary)" /> {dateLongue}
            </p>
            {meteo && (
              <p className="flex items-center gap-2 text-[15px] text-(--color-ink)">
                <IconeMeteo code={meteo.code} className="h-6 w-6 text-[#E9A23B]" />
                <span className="font-semibold">{meteo.temperature}°</span> Paris
              </p>
            )}
          </div>
        </div>

        {/* ─────────── Indicateurs ─────────── */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
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
    <div className="mt-3 flex min-w-0 items-center gap-2 rounded-xl border border-(--color-primary-soft) bg-(--color-primary-soft) px-3 py-2">
      <Target className="h-4 w-4 shrink-0 text-(--color-primary)" />
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-(--color-primary)">Ma priorité du jour</span>
      {edition ? (
        <form className="flex min-w-0 flex-1 items-center gap-2" onSubmit={(e) => { e.preventDefault(); enregistrer(); }}>
          <input autoFocus value={texte} onChange={(e) => setTexte(e.target.value)} maxLength={500}
            placeholder="Ex. Finaliser les dossiers prioritaires et relancer les intervenants en attente"
            className="min-w-0 flex-1 rounded-md border border-(--color-border) bg-white px-2 py-1 text-sm focus:border-(--color-primary) focus:outline-none" />
          <button type="submit" disabled={enCours} className="rounded-md bg-(--color-primary) px-2.5 py-1 text-[12px] font-medium text-white">OK</button>
        </form>
      ) : (
        <>
          {objectif ? (
            <button type="button" onClick={() => start(async () => { await basculerObjectif('jour', aujourdHui); router.refresh(); })}
              className={cn('min-w-0 flex-1 truncate text-left text-sm font-medium text-(--color-ink)', objectif.atteint && 'text-(--color-ink-soft) line-through')}
              title={objectif.atteint ? 'Objectif atteint — cliquer pour rouvrir' : 'Cliquer quand l’objectif est atteint'}>
              {objectif.atteint && <Check className="mr-1 inline h-4 w-4 text-[#1F7A3E]" />}
              {objectif.texte}
            </button>
          ) : (
            <button type="button" onClick={() => setEdition(true)} className="min-w-0 flex-1 truncate text-left text-sm text-(--color-ink-muted)">Fixer l’objectif principal de la journée…</button>
          )}
          <button type="button" aria-label="Modifier l’objectif du jour" onClick={() => setEdition(true)} className="grid h-6 w-6 shrink-0 place-items-center rounded text-(--color-primary) hover:bg-white">
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </>
      )}
    </div>
  );
}

const TONS_DETAIL = { rouge: 'text-[#C0262D]', vert: 'text-[#1F7A3E]', gris: 'text-(--color-ink-soft)' } as const;

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
    <Link href={href} className="group focus-ring rounded-2xl">
      <Carte className="flex h-full items-center gap-2.5 px-3 py-3 transition-shadow group-hover:shadow-md">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
          <Icone className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-2xl font-semibold leading-none text-(--color-primary)">{valeur}</span>
          <span className="mt-1 block text-[12.5px] leading-tight text-(--color-ink)">{libelle}</span>
          <span className={cn('mt-0.5 block truncate text-[12px] font-medium', TONS_DETAIL[ton])}>{detail}</span>
        </span>
        <ChevronRight className="hidden h-4 w-4 shrink-0 text-(--color-ink-muted) transition-transform group-hover:translate-x-0.5 2xl:block" />
      </Carte>
    </Link>
  );
}

function PiedCockpit() {
  return (
    <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-(--color-border) pb-2 pt-4 text-[12.5px] text-(--color-ink-soft)">
      <span className="font-semibold text-(--color-ink)">Major ECN</span>
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
