'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Archive, CheckCheck, Clock, FilePen, Inbox, ListTodo, Loader2, MailWarning, MessagesSquare, Plus, Search, Send,
  SlidersHorizontal, Star, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, Bouton, Carte, champ, EntetePage, Etiquette, Libelle, PageCockpit, Toast, useMessage } from '@/components/admin/cockpit/ui';
import { FormulaireRelance } from './formulaire-relance';
import { PastilleEtat } from './pastilles';
import {
  BOITES, BOITE_LABEL, FILTRES_STATUT, FILTRE_STATUT_LABEL, TYPE_INTERLOCUTEUR_LABEL,
  type Boite, type CompteursBoites, type FiltresListe, type InitialRelance, type Interlocuteur, type ResumeConversation,
} from './types';

const ICONE_BOITE: Record<Boite, React.ComponentType<{ className?: string }>> = {
  reception: Inbox,
  envoyes: Send,
  brouillons: FilePen,
  suivies: Star,
  archivees: Archive,
  toutes: MessagesSquare,
};

const VIDE_BOITE: Record<Boite, string> = {
  reception: 'Aucune réponse reçue pour l’instant.',
  envoyes: 'Aucun message envoyé.',
  brouillons: 'Aucun brouillon en cours.',
  suivies: 'Aucune conversation suivie.',
  archivees: 'Aucune conversation archivée.',
  toutes: 'Aucune conversation.',
};

function lienListe(f: FiltresListe, patch: Partial<FiltresListe> = {}): string {
  const v = { ...f, ...patch };
  const p = new URLSearchParams();
  if (v.boite !== 'reception') p.set('boite', v.boite);
  if (v.q) p.set('q', v.q);
  if (v.avec) p.set('avec', v.avec);
  if (v.mission) p.set('mission', v.mission);
  if (v.du) p.set('du', v.du);
  if (v.au) p.set('au', v.au);
  if (v.statut) p.set('statut', v.statut);
  const s = p.toString();
  return `/admin/cockpit/messagerie${s ? `?${s}` : ''}`;
}

export function ListeConversations({
  conversations,
  compteurs,
  filtres,
  interlocuteurs,
  initialRelance,
  ouvrirNouveau,
}: {
  conversations: ResumeConversation[];
  compteurs: CompteursBoites;
  filtres: FiltresListe;
  interlocuteurs: Interlocuteur[];
  initialRelance: InitialRelance | null;
  ouvrirNouveau: boolean;
}) {
  const router = useRouter();
  const [enCours, demarrer] = React.useTransition();
  const [nouveau, setNouveau] = React.useState(ouvrirNouveau);
  const [message, setMessage] = useMessage();
  const filtresAvances = !!(filtres.avec || filtres.mission || filtres.du || filtres.au || filtres.statut);
  const [voirFiltres, setVoirFiltres] = React.useState(filtresAvances);
  const filtresActifs = filtresAvances || !!filtres.q;

  const aller = (patch: Partial<FiltresListe>) => demarrer(() => router.replace(lienListe(filtres, patch), { scroll: false }));

  function fermerNouveau(ouvert: boolean) {
    setNouveau(ouvert);
    // Les paramètres ?ecrire= / ?tache= ne doivent pas rouvrir la fenêtre au rafraîchissement.
    if (!ouvert && ouvrirNouveau) router.replace(lienListe(filtres), { scroll: false });
  }

  return (
    <PageCockpit>
      <EntetePage
        titre="Messagerie"
        sousTitre="Échanges privés avec les enseignants, élèves et clients. Distincte du forum des élèves : seuls vous et votre interlocuteur voyez un fil."
        actions={(
          <Bouton onClick={() => setNouveau(true)}>
            <Plus /> Nouveau message
          </Bouton>
        )}
      />

      <div className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)]">
        {/* Boîtes */}
        <nav aria-label="Boîtes de la messagerie" className="min-w-0">
          <ul className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0">
            {BOITES.map((b) => {
              const Icone = ICONE_BOITE[b];
              const actif = filtres.boite === b;
              const n = compteurs[b];
              return (
                <li key={b} className="shrink-0">
                  <Link
                    href={lienListe(filtres, { boite: b })}
                    scroll={false}
                    aria-current={actif ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-[13.5px] transition-colors focus-ring',
                      actif
                        ? 'bg-(--color-primary) font-semibold text-white shadow-sm'
                        : 'bg-white/70 text-(--color-ink) ring-1 ring-(--color-border) hover:bg-white lg:bg-transparent lg:ring-0 lg:hover:bg-white/80',
                    )}
                  >
                    <Icone className={cn('h-4 w-4 shrink-0', actif ? 'text-white' : 'text-(--color-primary)')} />
                    <span>{BOITE_LABEL[b]}</span>
                    {n > 0 && (
                      <span
                        className={cn(
                          'ml-auto min-w-[22px] rounded-full px-1.5 text-center text-[11.5px] font-semibold leading-5',
                          actif ? 'bg-white/20 text-white' : b === 'reception' ? 'bg-(--color-primary) text-white' : 'bg-[#F3EEF0] text-(--color-ink-soft)',
                        )}
                        title={b === 'reception' ? 'Fils avec une réponse à traiter ou un message non lu' : undefined}
                      >
                        {n}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Carte className="overflow-hidden">
          {/* Recherche et filtres */}
          <form
            key={JSON.stringify(filtres)}
            className="border-b border-(--color-border) p-3 sm:p-4"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              aller({
                q: String(fd.get('q') ?? '').trim(),
                mission: fd.has('mission') ? String(fd.get('mission') ?? '').trim() : filtres.mission,
              });
            }}
          >
            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-ink-muted)" />
                <input
                  name="q"
                  type="search"
                  defaultValue={filtres.q}
                  placeholder="Mot-clé : sujet, interlocuteur, contenu d’un message…"
                  className={cn(champ, 'pl-9')}
                  aria-label="Rechercher dans la messagerie"
                />
              </div>
              <Bouton type="submit" variante="contour" className="hidden sm:inline-flex">Rechercher</Bouton>
              <Bouton
                type="button"
                variante={voirFiltres ? 'doux' : 'fantome'}
                onClick={() => setVoirFiltres((v) => !v)}
                aria-expanded={voirFiltres}
                aria-label="Filtres"
              >
                <SlidersHorizontal /> <span className="hidden sm:inline">Filtres</span>
              </Bouton>
            </div>

            {voirFiltres && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <div className="xl:col-span-1">
                  <Libelle htmlFor="filtre-avec">Interlocuteur</Libelle>
                  <select id="filtre-avec" className={champ} defaultValue={filtres.avec} onChange={(e) => aller({ avec: e.target.value })}>
                    <option value="">Tous</option>
                    {interlocuteurs.map((i) => <option key={i.cle} value={i.cle}>{i.label}</option>)}
                  </select>
                </div>
                <div>
                  <Libelle htmlFor="filtre-mission">Mission</Libelle>
                  <input id="filtre-mission" name="mission" className={champ} defaultValue={filtres.mission} placeholder="Ex. chapitre 12" />
                </div>
                <div>
                  <Libelle htmlFor="filtre-du">Du</Libelle>
                  <input id="filtre-du" type="date" className={champ} defaultValue={filtres.du} onChange={(e) => aller({ du: e.target.value })} />
                </div>
                <div>
                  <Libelle htmlFor="filtre-au">Au</Libelle>
                  <input id="filtre-au" type="date" className={champ} defaultValue={filtres.au} onChange={(e) => aller({ au: e.target.value })} />
                </div>
                <div>
                  <Libelle htmlFor="filtre-statut">Statut</Libelle>
                  <select
                    id="filtre-statut"
                    className={champ}
                    defaultValue={filtres.statut}
                    onChange={(e) => aller({ statut: e.target.value as FiltresListe['statut'] })}
                  >
                    <option value="">Tous</option>
                    {FILTRES_STATUT.map((s) => <option key={s} value={s}>{FILTRE_STATUT_LABEL[s]}</option>)}
                  </select>
                </div>
              </div>
            )}

            {filtresActifs && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[12.5px] text-(--color-ink-soft)">
                <span>{conversations.length} conversation{conversations.length > 1 ? 's' : ''} trouvée{conversations.length > 1 ? 's' : ''}</span>
                <button
                  type="button"
                  onClick={() => aller({ q: '', avec: '', mission: '', du: '', au: '', statut: '' })}
                  className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 font-medium text-(--color-primary) hover:bg-(--color-primary-soft) focus-ring"
                >
                  <X className="h-3.5 w-3.5" /> Effacer les filtres
                </button>
              </div>
            )}
          </form>

          {/* Fils */}
          <div className={cn('relative transition-opacity', enCours && 'opacity-60')}>
            {enCours && <Loader2 className="absolute right-4 top-3 h-4 w-4 animate-spin text-(--color-primary)" aria-hidden />}
            {conversations.length === 0 ? (
              <div className="grid place-items-center gap-3 px-6 py-14 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary)">
                  <MessagesSquare className="h-5 w-5" />
                </span>
                <p className="text-sm text-(--color-ink-soft)">{filtresActifs ? 'Aucune conversation ne correspond à ces critères.' : VIDE_BOITE[filtres.boite]}</p>
                {!filtresActifs && (
                  <Bouton variante="doux" taille="sm" onClick={() => setNouveau(true)}><Plus /> Écrire un message</Bouton>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-(--color-border)">
                {conversations.map((c) => <LigneConversation key={c.id} c={c} boite={filtres.boite} />)}
              </ul>
            )}
          </div>
        </Carte>
      </div>

      <Dialog open={nouveau} onOpenChange={fermerNouveau}>
        <DialogContent className="max-w-xl bg-(--color-surface)">
          <DialogHeader>
            <DialogTitle className="text-[22px] text-(--color-ink)">Nouveau message</DialogTitle>
            <DialogDescription>Choisissez le destinataire et le sujet : le fil s’ouvre, vous y rédigez le message.</DialogDescription>
          </DialogHeader>
          <FormulaireRelance
            initial={initialRelance ?? undefined}
            onFini={() => { setNouveau(false); setMessage('Conversation ouverte.'); }}
          />
        </DialogContent>
      </Dialog>
      <Toast message={message} />
    </PageCockpit>
  );
}

function LigneConversation({ c, boite }: { c: ResumeConversation; boite: Boite }) {
  const aTraiter = c.aTraiter > 0;
  const enAttente = c.dernierDeMoi === true && !aTraiter;
  return (
    <li>
      <Link
        href={`/admin/cockpit/messagerie/${c.id}`}
        className={cn(
          'group flex gap-3 px-3 py-3.5 transition-colors hover:bg-(--color-surface-soft) focus-ring sm:px-5',
          aTraiter && 'bg-(--color-surface-soft)',
        )}
      >
        <div className="relative">
          <Avatar nom={c.interlocuteur} taille={40} />
          {aTraiter && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-(--color-primary)" aria-hidden />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className={cn('truncate text-[14px] text-(--color-ink)', aTraiter ? 'font-semibold' : 'font-medium')}>{c.interlocuteur}</span>
            <span className="hidden shrink-0 text-[11.5px] text-(--color-ink-muted) sm:inline">{TYPE_INTERLOCUTEUR_LABEL[c.interlocuteurType]}</span>
            <span className="ml-auto shrink-0 text-[12px] text-(--color-ink-muted)" title={c.quandComplet}>{c.quand}</span>
          </div>
          <p className={cn('truncate text-[13.5px]', aTraiter ? 'font-semibold text-(--color-ink)' : 'text-(--color-ink)')}>
            {c.sujet}
            {c.mission && c.mission !== c.sujet && <span className="font-normal text-(--color-ink-muted)"> · {c.mission}</span>}
          </p>
          {boite === 'brouillons' && c.brouillon ? (
            <p className="truncate text-[13px] text-[#B45309]">Brouillon : <span className="text-(--color-ink-soft)">{c.brouillon}</span></p>
          ) : (
            <p className="truncate text-[13px] text-(--color-ink-soft)">
              {c.apercu ? <>{c.dernierDeMoi && <span className="text-(--color-ink-muted)">Vous : </span>}{c.apercu}</> : <span className="italic text-(--color-ink-muted)">Aucun message pour l’instant</span>}
            </p>
          )}
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {c.role === 'enseignant' && <Etiquette ton="violet" className="text-[11px]">Vous êtes destinataire</Etiquette>}
            {aTraiter && (
              <PastilleEtat ton="bordeaux">
                {c.role === 'proprietaire'
                  ? `${c.aTraiter} réponse${c.aTraiter > 1 ? 's' : ''} à traiter`
                  : `${c.aTraiter} non lu${c.aTraiter > 1 ? 's' : ''}`}
              </PastilleEtat>
            )}
            {c.echec && <PastilleEtat ton="rouge" icone={MailWarning}>Échec d’envoi</PastilleEtat>}
            {!c.echec && c.etatDernierEmail === 'en_file' && <PastilleEtat ton="orange" icone={Clock}>E-mail en file</PastilleEtat>}
            {enAttente && c.role === 'proprietaire' && (
              c.luDernier
                ? <PastilleEtat ton="bleu" icone={CheckCheck}>Lu · en attente de réponse</PastilleEtat>
                : <PastilleEtat ton="gris">En attente de réponse</PastilleEtat>
            )}
            {c.brouillon && boite !== 'brouillons' && <PastilleEtat ton="orange" icone={FilePen}>Brouillon</PastilleEtat>}
            {c.tacheId && c.role === 'proprietaire' && <PastilleEtat ton="gris" icone={ListTodo}>Tâche liée</PastilleEtat>}
            {c.role === 'proprietaire' && c.suivie && boite !== 'suivies' && (
              <Star className="h-3.5 w-3.5 fill-[#C2570C] text-[#C2570C]" aria-label="Conversation suivie" />
            )}
            {c.archivee && boite !== 'archivees' && <PastilleEtat ton="gris" icone={Archive}>Archivée</PastilleEtat>}
          </div>
        </div>
      </Link>
    </li>
  );
}
