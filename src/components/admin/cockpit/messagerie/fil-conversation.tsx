'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Archive, ArchiveRestore, ArrowLeft, CalendarClock, Check, CheckCheck, Clock, Download, Eye, ListTodo, Mail, MailCheck,
  MailWarning, MessageSquarePlus, Paperclip, Reply, Smartphone, Sparkles, Star, TriangleAlert, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  archiverConversation, consignerReponse, lienPieceJointe, marquerTraite, suggererSuite, suivreConversation,
} from '@/app/admin/cockpit/actions-messagerie';
import { modifierTache } from '@/app/admin/cockpit/actions-taches';
import { marquerLu } from '@/app/admin/cockpit/messagerie/actions-lecture';
import {
  Avatar, Bouton, Carte, champ, Etiquette, PageCockpit, PastilleStatut, Toast, useMessage,
} from '@/components/admin/cockpit/ui';
import { Composeur } from './composeur';
import { MentionDiscrete, PastilleEtat } from './pastilles';
import {
  jjmm, jjmmaaaa, tailleLisible, TYPE_INTERLOCUTEUR_LABEL,
  type ConversationFil, type MessageFil, type PieceFil, type TacheFil,
} from './types';

type Suggestion =
  | { etat: 'charge' }
  | { etat: 'ok'; texte: string; date: string | null; tacheId: string | null }
  | { etat: 'erreur'; erreur: string };

export function FilConversation({
  conversation: c,
  messages,
  tache,
  brouillon,
}: {
  conversation: ConversationFil;
  messages: MessageFil[];
  tache: TacheFil | null;
  brouillon: { id: string; corps: string } | null;
}) {
  const router = useRouter();
  const proprietaire = c.role === 'proprietaire';
  const [message, setMessage] = useMessage();
  const [action, setAction] = React.useState<string | null>(null);
  const [suggestions, setSuggestions] = React.useState<Record<string, Suggestion>>({});
  const [aConfirmer, setAConfirmer] = React.useState<{ tacheId: string; date: string } | null>(null);
  const [confirmation, setConfirmation] = React.useState(false);
  const [consigner, setConsigner] = React.useState(false);
  const fin = React.useRef<HTMLDivElement>(null);
  const luDemande = React.useRef(false);

  const nonTraites = proprietaire ? messages.filter((m) => m.sens === 'entrant' && !m.traite).length : 0;
  const nonLusEnseignant = !proprietaire && messages.some((m) => m.sens === 'sortant' && !m.luLe);

  // Vue enseignant : ouvrir le fil vaut lecture des messages de l'administrateur.
  React.useEffect(() => {
    if (!nonLusEnseignant || luDemande.current) return;
    luDemande.current = true;
    void marquerLu(c.id).catch(() => undefined);
  }, [nonLusEnseignant, c.id]);

  // Fil long : on arrive sur les derniers échanges.
  React.useEffect(() => {
    if (messages.length > 2) fin.current?.scrollIntoView({ block: 'end' });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- au premier affichage seulement
  }, []);

  async function executer(cle: string, f: () => Promise<{ ok: true } | { ok: false; erreur: string }>, succes: string) {
    if (action) return;
    setAction(cle);
    try {
      const r = await f();
      setMessage(r.ok ? succes : r.erreur);
      if (r.ok) router.refresh();
    } catch {
      setMessage('Connexion interrompue. Réessayez.');
    } finally {
      setAction(null);
    }
  }

  async function suggerer(messageId: string) {
    setSuggestions((s) => ({ ...s, [messageId]: { etat: 'charge' } }));
    try {
      const r = await suggererSuite(messageId);
      setSuggestions((s) => ({
        ...s,
        [messageId]: r.ok && r.data
          ? { etat: 'ok', texte: r.data.texte, date: r.data.date, tacheId: r.data.tacheId }
          : { etat: 'erreur', erreur: r.ok ? 'Aucune suggestion.' : r.erreur },
      }));
    } catch {
      setSuggestions((s) => ({ ...s, [messageId]: { etat: 'erreur', erreur: 'L’assistant IA est indisponible pour le moment.' } }));
    }
  }

  async function deplacerEcheance() {
    if (!aConfirmer || confirmation) return;
    setConfirmation(true);
    try {
      const r = await modifierTache(aConfirmer.tacheId, { echeance: aConfirmer.date });
      if (!r.ok) {
        setMessage(r.erreur);
        return;
      }
      setMessage(`Échéance déplacée au ${jjmm(aConfirmer.date)}.`);
      setAConfirmer(null);
      router.refresh();
    } catch {
      setMessage('Connexion interrompue. L’échéance n’a pas été modifiée.');
    } finally {
      setConfirmation(false);
    }
  }

  return (
    <PageCockpit>
      <Link
        href="/admin/cockpit/messagerie"
        className="mb-3 inline-flex items-center gap-1.5 rounded-md text-[13px] font-medium text-(--color-primary) hover:underline focus-ring"
      >
        <ArrowLeft className="h-4 w-4" /> Messagerie
      </Link>

      {/* En-tête du fil */}
      <Carte className="mb-5 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar nom={proprietaire ? c.interlocuteur : c.proprietaire ?? 'Major ECN'} taille={48} />
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 text-[13px] text-(--color-ink-soft)">
              <span className="font-medium text-(--color-ink)">{proprietaire ? c.interlocuteur : c.proprietaire}</span>
              <Etiquette ton={proprietaire ? 'bordeaux' : 'violet'} className="text-[11px]">
                {proprietaire ? TYPE_INTERLOCUTEUR_LABEL[c.interlocuteurType] : 'Administration Major ECN'}
              </Etiquette>
              {c.archivee && proprietaire && <Etiquette ton="gris" className="text-[11px]">Archivée</Etiquette>}
            </p>
            <h1 className="mt-1 break-words text-[24px] font-semibold leading-tight tracking-tight text-(--color-ink) sm:text-[28px]">
              {c.sujet}
            </h1>
            {c.mission && c.mission !== c.sujet && <p className="mt-1 max-w-3xl text-sm text-(--color-ink-soft)">{c.mission}</p>}
          </div>
          {proprietaire && (
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              {nonTraites > 0 && (
                <Bouton
                  taille="sm"
                  onClick={() => executer('traite', () => marquerTraite(c.id), 'Réponses marquées comme traitées.')}
                  enCours={action === 'traite'}
                >
                  <CheckCheck /> Marquer comme traité
                </Bouton>
              )}
              {c.interlocuteurType !== 'enseignant' && (
                <Bouton taille="sm" variante="contour" onClick={() => setConsigner(true)}>
                  <MessageSquarePlus /> Consigner une réponse reçue
                </Bouton>
              )}
              <Bouton
                taille="sm"
                variante="fantome"
                onClick={() => executer('suivre', () => suivreConversation(c.id, !c.suivie), c.suivie ? 'Conversation retirée des suivies.' : 'Conversation suivie.')}
                enCours={action === 'suivre'}
                aria-pressed={c.suivie}
              >
                <Star className={cn(c.suivie && 'fill-[#C2570C] text-[#C2570C]')} /> {c.suivie ? 'Suivie' : 'Suivre'}
              </Bouton>
              <Bouton
                taille="sm"
                variante="fantome"
                onClick={() => executer('archive', () => archiverConversation(c.id, !c.archivee), c.archivee ? 'Conversation désarchivée.' : 'Conversation archivée.')}
                enCours={action === 'archive'}
              >
                {c.archivee ? <><ArchiveRestore /> Désarchiver</> : <><Archive /> Archiver</>}
              </Bouton>
            </div>
          )}
        </div>
      </Carte>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
        {/* Fil */}
        <div className="min-w-0">
          {messages.length === 0 ? (
            <Carte className="mb-5 grid place-items-center gap-2 px-6 py-10 text-center">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-(--color-primary-soft) text-(--color-primary)">
                <Mail className="h-5 w-5" />
              </span>
              <p className="text-sm text-(--color-ink-soft)">
                {proprietaire ? 'Aucun message pour l’instant. Rédigez le premier ci-dessous.' : 'Aucun message pour l’instant.'}
              </p>
            </Carte>
          ) : (
            <ol className="mb-5 grid gap-5" aria-label="Messages du fil">
              {messages.map((m) => (
                <BulleMessage
                  key={m.id}
                  m={m}
                  conversation={c}
                  suggestion={suggestions[m.id]}
                  onSuggerer={() => suggerer(m.id)}
                  onIgnorer={() => setSuggestions((s) => Object.fromEntries(Object.entries(s).filter(([k]) => k !== m.id)))}
                  onDeplacer={(tacheId, date) => setAConfirmer({ tacheId, date })}
                  peutDeplacer={!!tache?.peutModifier}
                  onMessage={setMessage}
                />
              ))}
            </ol>
          )}
          <div ref={fin} />

          {c.archivee && proprietaire && (
            <p className="mb-2 text-[12.5px] text-(--color-ink-muted)">Conversation archivée : un nouvel envoi la fera revenir dans vos boîtes.</p>
          )}
          <Composeur
            conversationId={c.id}
            role={c.role}
            destinataire={proprietaire ? c.interlocuteur : c.proprietaire ?? undefined}
            brouillon={brouillon}
            tacheId={tache?.id ?? null}
            onMessage={setMessage}
          />
          <p className="mt-2 px-1 text-[11.5px] text-(--color-ink-muted)">
            {proprietaire
              ? c.interlocuteurType === 'enseignant'
                ? 'Le message est enregistré dans ce fil, puis envoyé par e-mail à l’enseignant avec un lien vers la plateforme.'
                : 'Le message est enregistré dans ce fil, puis envoyé par e-mail. Les réponses reçues hors plateforme peuvent y être consignées.'
              : 'Votre réponse est enregistrée dans ce fil et transmise à l’administration.'}
          </p>
        </div>

        {/* Contexte */}
        <aside className="order-first grid content-start gap-4 xl:order-none">
          {tache && (
            <Carte className="p-4">
              <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-(--color-primary)">
                <ListTodo className="h-3.5 w-3.5" /> Tâche liée
              </p>
              <Link href={`/admin/cockpit/taches?t=${tache.id}`} className="block rounded-md text-[14px] font-medium text-(--color-ink) hover:text-(--color-primary) hover:underline focus-ring">
                {tache.titre}
              </Link>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[12.5px] text-(--color-ink-soft)">
                <PastilleStatut statut={tache.statut} />
                <span className="inline-flex items-center gap-1"><CalendarClock className="h-3.5 w-3.5" /> {tache.echeanceLabel}</span>
              </div>
            </Carte>
          )}
          <Carte className="p-4 text-[13px]">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-(--color-primary)">Conversation</p>
            <dl className="grid gap-2">
              <div>
                <dt className="text-[11.5px] text-(--color-ink-muted)">{proprietaire ? 'Interlocuteur' : 'Écrit par'}</dt>
                <dd className="text-(--color-ink)">{proprietaire ? c.interlocuteur : c.proprietaire}</dd>
              </div>
              {c.interlocuteurEmail && (
                <div>
                  <dt className="text-[11.5px] text-(--color-ink-muted)">Adresse e-mail</dt>
                  <dd className="break-all text-(--color-ink)">{c.interlocuteurEmail}</dd>
                </div>
              )}
              <div>
                <dt className="text-[11.5px] text-(--color-ink-muted)">Ouverte le</dt>
                <dd className="text-(--color-ink)">{c.creeLe}</dd>
              </div>
              <div>
                <dt className="text-[11.5px] text-(--color-ink-muted)">Messages</dt>
                <dd className="text-(--color-ink)">{messages.length}</dd>
              </div>
            </dl>
            <p className="mt-3 border-t border-(--color-border) pt-3 text-[11.5px] leading-relaxed text-(--color-ink-muted)">
              Fil privé : visible de vous et de votre interlocuteur uniquement, distinct du forum des élèves.
            </p>
          </Carte>
        </aside>
      </div>

      {/* §9 — confirmation explicite avant de déplacer l'échéance */}
      <Dialog open={!!aConfirmer} onOpenChange={(o) => { if (!o && !confirmation) setAConfirmer(null); }}>
        <DialogContent className="max-w-md bg-(--color-surface)">
          <DialogHeader>
            <DialogTitle className="text-(--color-ink)">Déplacer l’échéance ?</DialogTitle>
            <DialogDescription>
              {aConfirmer && (
                <>
                  La tâche {tache ? <>« {tache.titre} » </> : null}
                  {tache?.echeance ? <>passera du {jjmmaaaa(tache.echeance)} au {jjmmaaaa(aConfirmer.date)}.</> : <>aura pour échéance le {jjmmaaaa(aConfirmer.date)}.</>}
                  {' '}Rien n’est modifié sans votre confirmation.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Bouton variante="fantome" onClick={() => setAConfirmer(null)} disabled={confirmation}>Annuler</Bouton>
            <Bouton onClick={deplacerEcheance} enCours={confirmation}><CalendarClock /> Confirmer</Bouton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {proprietaire && (
        <DialogueConsigner
          ouvert={consigner}
          onOuvert={setConsigner}
          conversationId={c.id}
          interlocuteur={c.interlocuteur}
          onFait={(m) => { setMessage(m); router.refresh(); }}
        />
      )}
      <Toast message={message} />
    </PageCockpit>
  );
}

/* ------------------------------------------------------------------ */

function BulleMessage({
  m, conversation: c, suggestion, onSuggerer, onIgnorer, onDeplacer, peutDeplacer, onMessage,
}: {
  m: MessageFil;
  conversation: ConversationFil;
  suggestion: Suggestion | undefined;
  onSuggerer: () => void;
  onIgnorer: () => void;
  onDeplacer: (tacheId: string, date: string) => void;
  peutDeplacer: boolean;
  onMessage: (m: string) => void;
}) {
  const proprietaire = c.role === 'proprietaire';
  return (
    <li className={cn('flex gap-3', m.deMoi && 'flex-row-reverse')}>
      {!m.deMoi && <Avatar nom={m.auteur} taille={34} className="mt-1 hidden sm:grid" />}
      <div className={cn('flex min-w-0 max-w-full flex-col sm:max-w-[min(720px,85%)]', m.deMoi ? 'items-end' : 'items-start')}>
        <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 px-1 text-[12px] text-(--color-ink-muted)">
          <span className="font-medium text-(--color-ink-soft)">{m.auteur}</span>
          <span>{m.quand}</span>
          {m.redigeAvecIa && <span className="inline-flex items-center gap-0.5"><Sparkles className="h-3 w-3" /> rédigé avec l’IA</span>}
          {m.saisieManuelle && <span>· consignée manuellement</span>}
        </div>
        <div
          className={cn(
            'w-full rounded-2xl px-4 py-3 text-[14.5px] leading-relaxed text-(--color-ink)',
            m.deMoi
              ? 'rounded-tr-md bg-(--color-primary-soft)'
              : 'rounded-tl-md border border-(--color-border) bg-white shadow-[0_1px_2px_rgba(60,20,30,0.04)]',
          )}
        >
          <p className="whitespace-pre-wrap break-words">{m.corps}</p>
          {m.pieces.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {m.pieces.map((p) => <PieceJointe key={p.id} p={p} onMessage={onMessage} />)}
            </ul>
          )}
        </div>

        <EtatsMessage m={m} conversation={c} />

        {proprietaire && m.sens === 'entrant' && (
          <div className="mt-2 w-full">
            {!suggestion && (
              <button
                type="button"
                onClick={onSuggerer}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[12.5px] font-medium text-(--color-primary) hover:bg-(--color-primary-soft) focus-ring"
              >
                <Sparkles className="h-3.5 w-3.5" /> Suggérer une suite
              </button>
            )}
            {suggestion?.etat === 'charge' && (
              <p className="inline-flex items-center gap-1.5 px-2 py-1 text-[12.5px] text-(--color-ink-muted)">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Analyse de la réponse…
              </p>
            )}
            {suggestion?.etat === 'erreur' && (
              <p className="flex items-center gap-2 rounded-lg bg-[#FFF3E0] px-3 py-2 text-[12.5px] text-[#B45309]">
                <TriangleAlert className="h-3.5 w-3.5 shrink-0" /> {suggestion.erreur}
                <button type="button" onClick={onIgnorer} className="ml-auto rounded p-0.5 hover:bg-black/5 focus-ring" aria-label="Fermer"><X className="h-3.5 w-3.5" /></button>
              </p>
            )}
            {suggestion?.etat === 'ok' && (
              <div className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) px-3 py-2.5 text-[13px] text-(--color-ink)">
                <p className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-(--color-primary)" />
                  <span className="flex-1">{suggestion.texte}</span>
                  <button type="button" onClick={onIgnorer} className="rounded p-0.5 text-(--color-ink-muted) hover:bg-black/5 hover:text-(--color-ink) focus-ring" aria-label="Ignorer la suggestion">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </p>
                {suggestion.date && (
                  <div className="mt-2 flex flex-wrap items-center gap-2 pl-5">
                    {suggestion.tacheId && peutDeplacer ? (
                      <Bouton taille="xs" variante="doux" onClick={() => onDeplacer(suggestion.tacheId!, suggestion.date!)}>
                        <CalendarClock /> Déplacer l’échéance au {jjmm(suggestion.date)}
                      </Bouton>
                    ) : (
                      <span className="text-[12px] text-(--color-ink-muted)">
                        {suggestion.tacheId ? 'Vous ne pouvez pas modifier la tâche liée.' : 'Aucune tâche n’est liée à ce fil.'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </li>
  );
}

/** Statuts DISTINCTS d'un message (§7) : enregistrement, e-mail, lecture, réponse, push. */
function EtatsMessage({ m, conversation: c }: { m: MessageFil; conversation: ConversationFil }) {
  const proprietaire = c.role === 'proprietaire';
  const etats: React.ReactNode[] = [];

  if (proprietaire && m.sens === 'sortant') {
    etats.push(<PastilleEtat key="int" ton="vert" icone={Check}>Message interne enregistré</PastilleEtat>);
    if (m.email?.statut === 'en_file') etats.push(<PastilleEtat key="em" ton="orange" icone={Clock}>E-mail en file</PastilleEtat>);
    if (m.email?.statut === 'envoye') etats.push(<PastilleEtat key="em" ton="vert" icone={MailCheck}>E-mail envoyé</PastilleEtat>);
    if (m.email?.statut === 'echec') etats.push(<PastilleEtat key="em" ton="rouge" icone={MailWarning}>Échec</PastilleEtat>);
    if (m.email?.statut === 'non_disponible') etats.push(<PastilleEtat key="em" ton="gris">E-mail non disponible</PastilleEtat>);
    if (m.luLe) etats.push(<PastilleEtat key="lu" ton="bleu" icone={Eye} title={`Lu le ${m.luLe}`}>Lu dans la plateforme</PastilleEtat>);
    if (m.reponseRecue) etats.push(<PastilleEtat key="rep" ton="violet" icone={Reply}>Réponse reçue</PastilleEtat>);
    if (m.push === 'non_disponible') etats.push(<MentionDiscrete key="push" icone={Smartphone} title="Aucune notification push n’est raccordée à ce compte.">Push non disponible</MentionDiscrete>);
  } else if (proprietaire && m.sens === 'entrant') {
    etats.push(m.traite
      ? <PastilleEtat key="tr" ton="vert" icone={Check}>Traité</PastilleEtat>
      : <PastilleEtat key="tr" ton="orange">À traiter</PastilleEtat>);
    if (m.email?.statut === 'envoye') etats.push(<MentionDiscrete key="cp" icone={MailCheck}>Copie e-mail envoyée</MentionDiscrete>);
    if (m.email?.statut === 'en_file') etats.push(<MentionDiscrete key="cp" icone={Clock}>Copie e-mail en file</MentionDiscrete>);
    if (m.email?.statut === 'echec') etats.push(<MentionDiscrete key="cp" icone={MailWarning} title={m.email.erreur ?? undefined}>Échec de la copie e-mail</MentionDiscrete>);
    if (m.push === 'non_disponible') etats.push(<MentionDiscrete key="push" icone={Smartphone}>Push non disponible</MentionDiscrete>);
  } else if (m.deMoi) {
    etats.push(<PastilleEtat key="int" ton="vert" icone={Check}>Message enregistré</PastilleEtat>);
    if (m.reponseRecue) etats.push(<PastilleEtat key="rep" ton="violet" icone={Reply}>Réponse reçue</PastilleEtat>);
  }

  if (etats.length === 0) return null;
  const echec = proprietaire && m.sens === 'sortant' && m.email?.statut === 'echec';
  return (
    <div className={cn('mt-1.5 flex w-full flex-col gap-1.5', m.deMoi ? 'items-end' : 'items-start')}>
      <div className={cn('flex flex-wrap items-center gap-1.5 px-1', m.deMoi && 'justify-end')}>{etats}</div>
      {echec && m.email && (
        <p role="status" className="max-w-full rounded-lg border border-[#F5C2C0] bg-(--color-primary-soft) px-3 py-2 text-[12.5px] leading-relaxed text-[#912018]">
          <span className="font-semibold">L’e-mail n’est pas parti.</span>
          {m.email.erreur && <> Motif : {m.email.erreur}</>}
          <br />
          <span className="text-(--color-ink-soft)">
            Le message reste enregistré dans Major ECN
            {c.interlocuteurType === 'enseignant' ? ', visible par l’enseignant dans sa messagerie' : ''}.{' '}
            {m.email.nouvelEssai ? 'Un nouvel essai automatique est prévu.' : 'Plus de nouvel essai automatique : prévenez le destinataire par un autre moyen si besoin.'}
          </span>
        </p>
      )}
    </div>
  );
}

function PieceJointe({ p, onMessage }: { p: PieceFil; onMessage: (m: string) => void }) {
  const [enCours, setEnCours] = React.useState(false);
  async function ouvrir() {
    if (enCours) return;
    setEnCours(true);
    try {
      const r = await lienPieceJointe(p.id);
      if (!r.ok || !r.data) {
        onMessage(r.ok ? 'Lien indisponible.' : r.erreur);
        return;
      }
      window.open(r.data.url, '_blank', 'noopener,noreferrer');
    } catch {
      onMessage('Connexion interrompue.');
    } finally {
      setEnCours(false);
    }
  }
  return (
    <li>
      <button
        type="button"
        onClick={ouvrir}
        disabled={enCours}
        className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-(--color-border) bg-white/80 px-2.5 py-1.5 text-[12.5px] text-(--color-ink) hover:border-(--color-primary) hover:text-(--color-primary) focus-ring disabled:opacity-60"
      >
        <Paperclip className="h-3.5 w-3.5 shrink-0" />
        <span className="max-w-[220px] truncate">{p.nom}</span>
        <span className="text-(--color-ink-muted)">{tailleLisible(p.taille)}</span>
        <Download className="h-3.5 w-3.5 shrink-0 opacity-60" />
      </button>
    </li>
  );
}

/* ------------------------------------------------------------------ */

function DialogueConsigner({
  ouvert, onOuvert, conversationId, interlocuteur, onFait,
}: {
  ouvert: boolean;
  onOuvert: (o: boolean) => void;
  conversationId: string;
  interlocuteur: string;
  onFait: (message: string) => void;
}) {
  const [texte, setTexte] = React.useState('');
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, setEnCours] = React.useState(false);

  async function valider() {
    if (enCours) return;
    if (!texte.trim()) {
      setErreur('Saisissez la réponse reçue.');
      return;
    }
    setEnCours(true);
    setErreur(null);
    try {
      const r = await consignerReponse(conversationId, texte);
      if (!r.ok) {
        setErreur(r.erreur);
        return;
      }
      setTexte('');
      onOuvert(false);
      onFait('Réponse consignée dans le fil.');
    } catch {
      setErreur('Connexion interrompue. Réessayez.');
    } finally {
      setEnCours(false);
    }
  }

  return (
    <Dialog open={ouvert} onOpenChange={(o) => { if (!enCours) onOuvert(o); }}>
      <DialogContent className="max-w-lg bg-(--color-surface)">
        <DialogHeader>
          <DialogTitle className="text-(--color-ink)">Consigner une réponse reçue</DialogTitle>
          <DialogDescription>
            Réponse de {interlocuteur} reçue hors plateforme (e-mail, téléphone…). Elle est ajoutée au fil et la tâche liée passe en « Réponse reçue ».
          </DialogDescription>
        </DialogHeader>
        <textarea
          className={cn(champ, 'min-h-[160px] resize-y')}
          value={texte}
          onChange={(e) => { setTexte(e.target.value); setErreur(null); }}
          maxLength={20000}
          placeholder="Collez ou résumez la réponse reçue…"
          aria-label="Réponse reçue"
        />
        {erreur && <p role="alert" className="rounded-lg bg-[#FCE4E4] px-3 py-2 text-sm text-[#B42318]">{erreur}</p>}
        <DialogFooter>
          <Bouton variante="fantome" onClick={() => onOuvert(false)} disabled={enCours}>Annuler</Bouton>
          <Bouton onClick={valider} enCours={enCours}><MessageSquarePlus /> Consigner</Bouton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
