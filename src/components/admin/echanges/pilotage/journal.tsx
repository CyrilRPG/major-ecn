'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Clock, Filter, ScrollText, Server } from 'lucide-react';
import { Bouton, Carte, champ, EnteteCarte, Etiquette, Libelle, Vide } from '@/components/admin/cockpit/ui';
import type { LigneAudit } from '@/lib/echanges/serveur/admin';
import type { ActionAudit, SourceJournal } from '@/lib/echanges/serveur/base';
import { cn } from '@/lib/utils';
import {
  ACTIONS_AUDIT, duree, LIBELLE_ACTION, LIBELLE_ROLE, LIBELLE_SOURCE, PERIODES, SOURCES_JOURNAL, type CronAffiche,
} from './commun';

/**
 * Journal des Échanges : onglet « Journal d'audit » (actions sensibles,
 * immuable) et onglet « Journal technique » (observabilité + tâches
 * planifiées). Filtres dans l'adresse ; les détails JSON se déplient ligne
 * par ligne (élément <details>, sans état).
 */

export type FiltresJournal = { onglet: 'audit' | 'technique'; action: string; groupe: string; periode: string; niveau: string; source: string };
type LigneAuditAffichee = LigneAudit & { quand: string };
type LigneTechnique = { id: string; createdAt: string; niveau: string; source: string; message: string; details: Record<string, unknown>; quand: string };
type CronJournal = CronAffiche & { resultat: Record<string, unknown> | null };

const CHEMIN = '/admin/echanges/journal';

function adresse(f: Partial<FiltresJournal>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `${CHEMIN}?${s}` : CHEMIN;
}

const TON_NIVEAU: Record<string, 'gris' | 'orange' | 'bordeaux'> = { info: 'gris', alerte: 'orange', erreur: 'bordeaux' };
const LIBELLE_NIVEAU_JOURNAL: Record<string, string> = { info: 'Info', alerte: 'Alerte', erreur: 'Erreur' };

/** Famille d'une action, pour la couleur de l'étiquette. */
function tonAction(action: string): 'bleu' | 'vert' | 'orange' | 'gris' | 'violet' | 'bordeaux' {
  if (/^(sanction|participant_exclusion_forcee|rgpd_effacement|suppression_moderation|refus_message|purge)$/.test(action)) return 'bordeaux';
  if (/^(levee_sanction|reintegration|restauration|validation_message|blocage_liberation)$/.test(action)) return 'vert';
  if (/^(parametres_modification|staff_modification|rgpd_export|export_donnees)$/.test(action)) return 'violet';
  if (/^(groupe_|criteres_|participant)/.test(action)) return 'bleu';
  if (/^(signalement_|tag_|annonce_)/.test(action)) return 'orange';
  return 'gris';
}

export function JournalEchanges({ filtres, groupes, audit, technique, crons }: {
  filtres: FiltresJournal;
  groupes: { id: string; nom: string }[];
  audit: LigneAuditAffichee[] | null;
  technique: LigneTechnique[] | null;
  crons: CronJournal[] | null;
}) {
  const router = useRouter();
  const [enCours, start] = React.useTransition();

  const appliquer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const f: Partial<FiltresJournal> = { onglet: filtres.onglet === 'technique' ? 'technique' : undefined };
    for (const k of ['action', 'groupe', 'periode', 'niveau', 'source'] as const) {
      const v = d.get(k);
      if (typeof v === 'string' && v) f[k] = v;
    }
    start(() => router.push(adresse(f)));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-xl bg-(--color-surface-soft) p-1 sm:inline-flex" role="tablist" aria-label="Journaux">
        {([['audit', 'Journal d’audit', ScrollText], ['technique', 'Journal technique', Server]] as const).map(([v, l, Icone]) => (
          <Link
            key={v} href={adresse({ onglet: v === 'technique' ? 'technique' : undefined })} role="tab" aria-selected={filtres.onglet === v}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[13.5px] font-medium transition-colors sm:flex-none',
              filtres.onglet === v ? 'bg-white text-(--color-primary) shadow-sm' : 'text-(--color-ink-soft) hover:text-(--color-ink)',
            )}
          >
            <Icone className="h-4 w-4" /> {l}
          </Link>
        ))}
      </div>

      <Carte>
        <EnteteCarte icone={Filter} titre="Filtres" />
        <form key={adresse(filtres)} onSubmit={appliquer} className="grid gap-3 px-4 pb-4 sm:grid-cols-2 sm:px-5 lg:grid-cols-4">
          {filtres.onglet === 'audit' ? (
            <>
              <div>
                <Libelle htmlFor="j-action">Action</Libelle>
                <select id="j-action" name="action" defaultValue={filtres.action} className={champ}>
                  <option value="">Toutes les actions</option>
                  {[...ACTIONS_AUDIT].sort((x, y) => LIBELLE_ACTION[x].localeCompare(LIBELLE_ACTION[y], 'fr')).map((x) => <option key={x} value={x}>{LIBELLE_ACTION[x]}</option>)}
                </select>
              </div>
              <div>
                <Libelle htmlFor="j-groupe">Promotion</Libelle>
                <select id="j-groupe" name="groupe" defaultValue={filtres.groupe} className={champ}>
                  <option value="">Toutes</option>
                  {groupes.map((g) => <option key={g.id} value={g.id}>{g.nom}</option>)}
                </select>
              </div>
              <div>
                <Libelle htmlFor="j-periode">Période</Libelle>
                <select id="j-periode" name="periode" defaultValue={filtres.periode} className={champ}>
                  {PERIODES.map((p) => <option key={p.v} value={p.v}>{p.l}</option>)}
                </select>
              </div>
            </>
          ) : (
            <>
              <div>
                <Libelle htmlFor="j-niveau">Niveau</Libelle>
                <select id="j-niveau" name="niveau" defaultValue={filtres.niveau} className={champ}>
                  <option value="">Tous</option>
                  <option value="erreur">Erreurs</option>
                  <option value="alerte">Alertes</option>
                  <option value="info">Informations</option>
                </select>
              </div>
              <div>
                <Libelle htmlFor="j-source">Source</Libelle>
                <select id="j-source" name="source" defaultValue={filtres.source} className={champ}>
                  <option value="">Toutes</option>
                  {SOURCES_JOURNAL.map((s) => <option key={s} value={s}>{LIBELLE_SOURCE[s]}</option>)}
                </select>
              </div>
            </>
          )}
          <div className="flex items-end gap-2">
            <Bouton type="submit" enCours={enCours}>Appliquer</Bouton>
            <Link href={adresse({ onglet: filtres.onglet === 'technique' ? 'technique' : undefined })} className="inline-flex h-10 items-center rounded-(--radius-button) px-3 text-sm font-medium text-(--color-ink-soft) hover:bg-(--color-surface-soft) hover:text-(--color-ink)">
              Réinitialiser
            </Link>
          </div>
        </form>
      </Carte>

      {audit && <JournalAudit lignes={audit} />}
      {crons && <TachesPlanifiees crons={crons} />}
      {technique && <JournalTechnique lignes={technique} />}
    </div>
  );
}

function Details({ valeur }: { valeur: Record<string, unknown> }) {
  if (!valeur || Object.keys(valeur).length === 0) return <span className="text-(--color-ink-muted)">—</span>;
  const apercu = Object.keys(valeur).slice(0, 3).join(', ') + (Object.keys(valeur).length > 3 ? '…' : '');
  return (
    <details className="group max-w-full">
      <summary className="cursor-pointer select-none text-[12.5px] text-(--color-primary) hover:underline">
        <span className="group-open:hidden">Voir ({apercu})</span>
        <span className="hidden group-open:inline">Masquer</span>
      </summary>
      <pre className="mt-1.5 max-h-80 max-w-full overflow-auto whitespace-pre-wrap break-all rounded-lg bg-(--color-surface-soft) p-2.5 font-mono text-[11.5px] leading-relaxed text-(--color-ink)">
        {JSON.stringify(valeur, null, 2)}
      </pre>
    </details>
  );
}

function JournalAudit({ lignes }: { lignes: LigneAuditAffichee[] }) {
  return (
    <Carte>
      <EnteteCarte
        icone={ScrollText} titre="Journal d’audit" compteur={lignes.length}
        badge={<span className="text-[12.5px] text-(--color-ink-muted)">Immuable · {lignes.length >= 1000 ? '1 000 plus récentes' : 'plus récentes en premier'}</span>}
      />
      {lignes.length === 0 ? (
        <Vide>Aucune action sur cette période.</Vide>
      ) : (
        <ul className="divide-y divide-(--color-border) px-4 pb-4 sm:px-5">
          {lignes.map((l) => (
            <li key={l.id} className="grid gap-x-4 gap-y-1 py-2.5 text-[13px] md:grid-cols-[150px_minmax(0,220px)_minmax(0,1fr)_minmax(0,1.2fr)]">
              <span className="whitespace-nowrap text-(--color-ink-muted)">{l.quand}</span>
              <span><Etiquette ton={tonAction(l.action)}>{LIBELLE_ACTION[l.action as ActionAudit] ?? l.action}</Etiquette></span>
              <span className="min-w-0">
                <span className="text-(--color-ink)">{l.acteur}</span>
                {l.acteurRole && <span className="text-(--color-ink-muted)"> · {LIBELLE_ROLE[l.acteurRole] ?? l.acteurRole}</span>}
                {(l.cible || l.groupe) && (
                  <span className="block text-[12.5px] text-(--color-ink-soft)">
                    {l.cible && <>→ {l.cible}</>}
                    {l.cible && l.groupe && ' · '}
                    {l.groupe && <>Promotion : {l.groupe}</>}
                  </span>
                )}
              </span>
              <span className="min-w-0"><Details valeur={l.details} /></span>
            </li>
          ))}
        </ul>
      )}
    </Carte>
  );
}

function TachesPlanifiees({ crons }: { crons: CronJournal[] }) {
  return (
    <Carte>
      <EnteteCarte icone={Clock} titre="Tâches planifiées" badge={<span className="text-[12.5px] text-(--color-ink-muted)">toutes les 5 min · alerte au-delà de 30 min sans passage</span>} />
      <ul className="divide-y divide-(--color-border) px-4 pb-4 sm:px-5">
        {crons.map((c) => (
          <li key={c.nom} className="flex flex-wrap items-start gap-x-3 gap-y-1 py-2.5 text-[13px]">
            {c.enRetard
              ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B42318]" aria-label="En retard" />
              : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" aria-label="À l’heure" />}
            <div className="min-w-0 flex-1 basis-60">
              <p className="font-medium text-(--color-ink)">{c.libelle} <code className="ml-1 text-[11.5px] font-normal text-(--color-ink-muted)">{c.nom}</code></p>
              <p className={cn('text-[12.5px]', c.enRetard ? 'text-[#B42318]' : 'text-(--color-ink-soft)')}>
                {c.dernier === '—' ? 'Aucun passage enregistré' : `Dernier passage ${c.dernier} (${c.ilYa})`} · durée {duree(c.dureeMs)}
              </p>
            </div>
            <div className="min-w-0 basis-full sm:basis-auto sm:max-w-[50%]">{c.resultat && <Details valeur={c.resultat} />}</div>
          </li>
        ))}
      </ul>
    </Carte>
  );
}

function JournalTechnique({ lignes }: { lignes: LigneTechnique[] }) {
  return (
    <Carte>
      <EnteteCarte icone={Server} titre="Journal technique" compteur={lignes.length} badge={<span className="text-[12.5px] text-(--color-ink-muted)">500 entrées au plus</span>} />
      {lignes.length === 0 ? (
        <Vide>Aucune entrée.</Vide>
      ) : (
        <ul className="divide-y divide-(--color-border) px-4 pb-4 sm:px-5">
          {lignes.map((l) => (
            <li key={l.id} className="grid gap-x-4 gap-y-1 py-2.5 text-[13px] md:grid-cols-[150px_150px_minmax(0,1.4fr)_minmax(0,1fr)]">
              <span className="whitespace-nowrap text-(--color-ink-muted)">{l.quand}</span>
              <span className="flex flex-wrap items-start gap-1">
                <Etiquette ton={TON_NIVEAU[l.niveau] ?? 'gris'}>{LIBELLE_NIVEAU_JOURNAL[l.niveau] ?? l.niveau}</Etiquette>
                <Etiquette ton="gris">{LIBELLE_SOURCE[l.source as SourceJournal] ?? l.source}</Etiquette>
              </span>
              <span className={cn('min-w-0 break-words', l.niveau === 'erreur' ? 'text-[#B42318]' : 'text-(--color-ink)')}>{l.message}</span>
              <span className="min-w-0"><Details valeur={l.details} /></span>
            </li>
          ))}
        </ul>
      )}
    </Carte>
  );
}
