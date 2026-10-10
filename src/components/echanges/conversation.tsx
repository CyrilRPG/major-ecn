'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle, ArrowDown, ArrowLeft, Bell, BellOff, BookOpen, CheckSquare, Copy, Flag, Gavel, Library, Loader2,
  Megaphone, MessagesSquare, Pencil, Pin, PinOff, Reply, ScrollText, Search, Trash2, UserRound, Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MOTIFS_SIGNALEMENT } from '@/lib/echanges/moderation-textes';
import type {
  ChangementsDTO, ContexteDTO, DroitsDTO, EnseignantTagDTO, MessageDTO, PageMessagesDTO, ResultatRechercheDTO,
} from '@/lib/echanges/types';
import { api, ErreurApi, jourLisible, useTempsReel } from './api';
import { Composer, type EnvoiComposer } from './composer';
import { DialogueSanction, type TypeSanctionUI } from './dialogue-sanction';
import { Pastille } from './elements';
import { ActionFeuille, Feuille } from './feuille';
import { BulleMessage, type MessageAffiche } from './message';
import { PanneauBibliotheque, PanneauEpingles, PanneauRecherche } from './panneaux';

type InfoGroupe = {
  groupe: { id: string; nom: string; promotion: string | null; annee: number | null; specialiteId: string | null; specialiteNom: string | null; statut: string; topic: string; moderationPrealable: boolean; bibliotheque: boolean; membres: number };
  role: 'candidat' | 'enseignant' | 'equipe';
  droits: DroitsDTO;
  sourdine: boolean;
  enseignants: EnseignantTagDTO[];
  accueil: string;
  regles: string;
  reglesAAccepter: boolean;
  reglages: { reactions: string[]; editionMinutes: number; formats: string[]; tailleMaxMo: number; pjMax: number; longueurMax: number; marquerTraite: boolean };
};

function trier(l: MessageAffiche[]): MessageAffiche[] {
  return [...l].sort((a, b) => (a.createdAt < b.createdAt ? -1 : a.createdAt > b.createdAt ? 1 : a.id.localeCompare(b.id)));
}

function fusionner(actuels: MessageAffiche[], arrivees: MessageDTO[], retires: string[] = []): MessageAffiche[] {
  const parId = new Map(actuels.filter((m) => !retires.includes(m.id)).map((m) => [m.id, m]));
  for (const m of arrivees) parId.set(m.id, m);
  return trier([...parId.values()]);
}

export function Conversation({
  groupeId, canalInitial = 'discussion', autourInitial = null, contexteInitial = null, nonLusAnnonces = 0, nonLusDiscussion = 0, onRetour, onLu,
}: {
  groupeId: string;
  canalInitial?: 'discussion' | 'annonces';
  autourInitial?: string | null;
  contexteInitial?: ContexteDTO | null;
  nonLusAnnonces?: number;
  nonLusDiscussion?: number;
  onRetour?: () => void;
  onLu?: () => void;
}) {
  const router = useRouter();
  const [info, setInfo] = useState<InfoGroupe | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [canal, setCanal] = useState<'discussion' | 'annonces'>(canalInitial);
  const [messages, setMessages] = useState<MessageAffiche[]>([]);
  const [chargement, setChargement] = useState(true);
  const [plusAnciens, setPlusAnciens] = useState(false);
  const [plusRecents, setPlusRecents] = useState(false);
  const [premierNonLu, setPremierNonLu] = useState<string | null>(null);
  const [surligne, setSurligne] = useState<string | null>(null);
  const [reponseA, setReponseA] = useState<MessageAffiche | null>(null);
  const [edition, setEdition] = useState<MessageAffiche | null>(null);
  const [contexte, setContexte] = useState<ContexteDTO | null>(contexteInitial);
  const [actions, setActionsEtat] = useState<MessageAffiche | null>(null);
  const [actionsAt, setActionsAt] = useState(0);
  const setActions = useCallback((m: MessageAffiche | null) => { setActionsAt(Date.now()); setActionsEtat(m); }, []);
  const [pasALaFin, setPasALaFin] = useState(false);
  const [selection, setSelection] = useState(false);
  const [selectionnes, setSelectionnes] = useState<Set<string>>(new Set());
  const [confirmerSuppression, setConfirmerSuppression] = useState<string[] | null>(null);
  const [nouveauxEnBas, setNouveauxEnBas] = useState(0);
  const [panneau, setPanneau] = useState<null | 'epingles' | 'bibliotheque' | 'recherche' | 'menu' | 'regles'>(null);
  const [signalement, setSignalement] = useState<MessageAffiche | null>(null);
  const [sanction, setSanction] = useState<{ userId: string; nom: string; type: TypeSanctionUI } | null>(null);
  const [erreurEnvoi, setErreurEnvoi] = useState<string | null>(null);
  const [annoncesNonLues, setAnnoncesNonLues] = useState(nonLusAnnonces);
  const [discussionNonLus, setDiscussionNonLus] = useState(nonLusDiscussion);
  const [info2, setInfo2] = useState<string | null>(null);

  const flux = useRef<HTMLDivElement>(null);
  const curseur = useRef<string>('');
  const aLaFin = useRef(true);
  const scrollApres = useRef<'fin' | 'garder' | string | null>(null);
  const hauteurAvant = useRef(0);
  const synchroEnCours = useRef(false);
  const charge = useRef(false);

  /* ─────────────── Chargement ─────────────── */

  useEffect(() => {
    let vivant = true;
    api<InfoGroupe>(`/api/echanges/groupes/${groupeId}`)
      .then((i) => { if (vivant) { setInfo(i); if (i.reglesAAccepter) setPanneau('regles'); } })
      .catch((e) => { if (vivant) setErreur(e instanceof Error ? e.message : 'Conversation indisponible.'); });
    return () => { vivant = false; };
  }, [groupeId]);

  const charger = useCallback(async (c: 'discussion' | 'annonces', autour: string | null) => {
    setChargement(true);
    charge.current = false;
    try {
      const p = await api<PageMessagesDTO>(`/api/echanges/groupes/${groupeId}/messages?canal=${c}${autour ? `&autour=${autour}` : ''}`);
      setMessages(p.messages);
      setPlusAnciens(p.plusAnciens);
      setPlusRecents(p.plusRecents);
      setPremierNonLu(p.premierNonLu);
      curseur.current = p.curseur;
      scrollApres.current = autour ?? (p.premierNonLu ? `nonlu` : 'fin');
      if (autour) { setSurligne(autour); window.setTimeout(() => setSurligne(null), 2600); }
      setNouveauxEnBas(0);
      charge.current = true;
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Messages indisponibles.');
    } finally {
      setChargement(false);
    }
  }, [groupeId]);

  useEffect(() => {
    if (!info?.droits.lire) return;
    const t = window.setTimeout(() => void charger(canal, autourInitial), 0);
    return () => window.clearTimeout(t);
    // `autourInitial` ne sert qu'à l'ouverture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info?.droits.lire, canal, charger]);

  /* ─────────────── Défilement ─────────────── */

  useLayoutEffect(() => {
    const el = flux.current;
    const cible = scrollApres.current;
    if (!el || !cible) return;
    scrollApres.current = null;
    if (cible === 'fin') { el.scrollTop = el.scrollHeight; aLaFin.current = true; return; }
    if (cible === 'garder') { el.scrollTop = el.scrollHeight - hauteurAvant.current; return; }
    const noeud = cible === 'nonlu' ? document.getElementById('separateur-nonlu') : document.getElementById(`m-${cible}`);
    if (noeud) noeud.scrollIntoView({ block: cible === 'nonlu' ? 'start' : 'center' });
    else el.scrollTop = el.scrollHeight;
  }, [messages]);

  const surDefilement = () => {
    const el = flux.current;
    if (!el) return;
    aLaFin.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (pasALaFin === aLaFin.current) setPasALaFin(!aLaFin.current);
    if (aLaFin.current && nouveauxEnBas) setNouveauxEnBas(0);
    if (el.scrollTop < 160 && plusAnciens && !chargement && charge.current) void chargerPlusAnciens();
    if (aLaFin.current && plusRecents && !chargement) void chargerPlusRecents();
  };

  const chargerPlusAnciens = async () => {
    if (!messages.length) return;
    setChargement(true);
    try {
      const p = await api<PageMessagesDTO>(`/api/echanges/groupes/${groupeId}/messages?canal=${canal}&avant=${encodeURIComponent(messages[0].createdAt)}`);
      hauteurAvant.current = flux.current?.scrollHeight ?? 0;
      scrollApres.current = 'garder';
      setMessages((l) => fusionner(l, p.messages));
      setPlusAnciens(p.plusAnciens);
    } catch { /* on réessaiera au prochain défilement */ } finally { setChargement(false); }
  };

  const chargerPlusRecents = async () => {
    const dernier = messages.at(-1);
    if (!dernier) return;
    setChargement(true);
    try {
      const p = await api<PageMessagesDTO>(`/api/echanges/groupes/${groupeId}/messages?canal=${canal}&apres=${encodeURIComponent(dernier.createdAt)}`);
      setMessages((l) => fusionner(l, p.messages));
      setPlusRecents(p.plusRecents);
    } catch { /* idem */ } finally { setChargement(false); }
  };

  const allerALaFin = () => {
    if (plusRecents) { void charger(canal, null); return; }
    const el = flux.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    setNouveauxEnBas(0);
  };

  /* ─────────────── Synchronisation (temps réel + filet) ─────────────── */

  const synchroniser = useCallback(async () => {
    if (synchroEnCours.current || !charge.current) return;
    synchroEnCours.current = true;
    try {
      const c = await api<ChangementsDTO>(`/api/echanges/groupes/${groupeId}/changements?depuis=${encodeURIComponent(curseur.current)}`);
      curseur.current = c.curseur;
      const ici = c.messages.filter((m) => m.canal === canal);
      const ailleurs = c.messages.filter((m) => m.canal !== canal && !m.auteur.moi);
      if (ailleurs.length) {
        if (canal === 'discussion') setAnnoncesNonLues((n) => n + ailleurs.length);
        else setDiscussionNonLus((n) => n + ailleurs.length);
      }
      if (ici.length || c.retires.length) {
        setMessages((l) => {
          const connus = new Set(l.map((m) => m.id));
          const nouveaux = ici.filter((m) => !connus.has(m.id) && !m.auteur.moi);
          if (nouveaux.length && !aLaFin.current) setNouveauxEnBas((n) => n + nouveaux.length);
          if (aLaFin.current) scrollApres.current = 'fin';
          // Les messages en cours d'envoi restent jusqu'à la réponse du serveur.
          return fusionner(l, plusRecents ? ici.filter((m) => connus.has(m.id)) : ici, c.retires);
        });
      }
    } catch (e) {
      if (e instanceof ErreurApi && (e.status === 403 || e.status === 404)) setErreur(e.message);
    } finally {
      synchroEnCours.current = false;
    }
  }, [groupeId, canal, plusRecents]);

  useTempsReel(info?.droits.lire ? info.groupe.topic : null, synchroniser);

  /* ─────────────── Lecture (compteurs, reprise) ─────────────── */

  useEffect(() => {
    if (!info?.droits.lire || chargement) return;
    const dernier = [...messages].reverse().find((m) => !m.id.startsWith('tmp-'));
    if (!dernier) return;
    const t = window.setTimeout(() => {
      if (document.visibilityState !== 'visible' || !aLaFin.current || plusRecents) return;
      void api(`/api/echanges/groupes/${groupeId}/actions`, { method: 'POST', body: { action: 'lu', canal, jusqua: dernier.createdAt } })
        .then(() => { onLu?.(); if (canal === 'annonces') setAnnoncesNonLues(0); else setDiscussionNonLus(0); })
        .catch(() => undefined);
    }, 1200);
    return () => window.clearTimeout(t);
  }, [messages, canal, groupeId, info?.droits.lire, chargement, plusRecents, onLu, nouveauxEnBas]);

  /* ─────────────── Publication ─────────────── */

  const envoyer = async (e: EnvoiComposer): Promise<boolean> => {
    if (!info) return false;
    setErreurEnvoi(null);
    const clientId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    const temp: MessageAffiche = {
      id: `tmp-${clientId}`, groupeId, canal,
      auteur: { cle: 'moi', nom: 'Vous', type: info.role === 'equipe' ? 'equipe' : info.role, qualite: null, avatar: { mode: 'initiale', seed: null, initiale: 'V', url: null }, moi: true },
      contenu: e.contenu || null, createdAt: new Date().toISOString(), modifie: false, modifiableJusqua: null, supprimable: false, signalable: false,
      reponseA: reponseA ? { id: reponseA.id, auteur: reponseA.auteur.nom, extrait: (reponseA.contenu ?? '').slice(0, 120), disponible: true } : null,
      mentions: e.mentions.map((id) => ({ id, nom: info.enseignants.find((x) => x.id === id)?.prenom ?? '' })),
      reactions: [], pieces: [], epingle: null, important: e.important, accuseRequis: e.accuseLecture, accuse: false,
      statut: 'publie', attenteMotif: null, contexte, tags: [], envoi: 'en_cours',
    };
    scrollApres.current = 'fin';
    setMessages((l) => [...l, temp]);
    try {
      const r = await api<{ message: MessageDTO }>(`/api/echanges/groupes/${groupeId}/messages`, {
        method: 'POST',
        body: {
          canal, contenu: e.contenu, reponseA: reponseA?.id ?? null, mentions: e.mentions, pieces: e.pieces,
          contexte: contexte ? { type: contexte.type === 'cas' || contexte.type === 'qcm' || contexte.type === 'qroc' ? 'serie' : contexte.type, id: contexte.ressourceId } : null,
          clientId, important: e.important, accuseLecture: e.accuseLecture,
        },
      });
      setMessages((l) => fusionner(l.filter((m) => m.id !== temp.id), [r.message]));
      setReponseA(null);
      setContexte(null);
      if (r.message.statut === 'en_attente') setInfo2('Votre message sera visible de tous après vérification par l’équipe Major ECN.');
      return true;
    } catch (err) {
      setMessages((l) => l.filter((m) => m.id !== temp.id));
      setErreurEnvoi(err instanceof Error ? err.message : 'Message non envoyé.');
      if (err instanceof ErreurApi && err.code === 'REGLES') setPanneau('regles');
      return false;
    }
  };

  const modifier = async (id: string, contenu: string) => {
    const r = await api<{ message: MessageDTO }>(`/api/echanges/messages/${id}`, { method: 'PATCH', body: { contenu } });
    setMessages((l) => fusionner(l, [r.message]));
  };

  const reagir = async (m: MessageAffiche, emoji: string) => {
    setActions(null);
    // Mise à jour immédiate, confirmée par la synchronisation.
    setMessages((l) => l.map((x) => {
      if (x.id !== m.id) return x;
      const ex = x.reactions.find((r) => r.emoji === emoji);
      const reactions = ex
        ? x.reactions.map((r) => (r.emoji === emoji ? { ...r, n: r.n + (r.moi ? -1 : 1), moi: !r.moi } : r)).filter((r) => r.n > 0)
        : [...x.reactions, { emoji, n: 1, moi: true }];
      return { ...x, reactions };
    }));
    try { await api(`/api/echanges/messages/${m.id}`, { method: 'POST', body: { action: 'reaction', emoji } }); } catch (e) { setErreurEnvoi(e instanceof Error ? e.message : 'Réaction impossible.'); void synchroniser(); }
  };

  const supprimer = async (ids: string[]) => {
    setConfirmerSuppression(null);
    try {
      const r = await api<{ supprimes: string[] }>('/api/echanges/messages/supprimer', { method: 'POST', body: { groupeId, ids } });
      setMessages((l) => l.filter((m) => !r.supprimes.includes(m.id)));
      setSelection(false); setSelectionnes(new Set());
    } catch (e) {
      setErreurEnvoi(e instanceof Error ? e.message : 'Suppression impossible.');
    }
  };

  const epingler = async (m: MessageAffiche, epingle: boolean) => {
    setActions(null);
    try {
      await api(`/api/echanges/messages/${m.id}`, { method: 'POST', body: { action: 'epingle', epingle, avecQuestion: true } });
      void synchroniser();
    } catch (e) { setErreurEnvoi(e instanceof Error ? e.message : 'Action impossible.'); }
  };

  const verserBibliotheque = async (m: MessageAffiche) => {
    setActions(null);
    try {
      await api('/api/echanges/moderation', { method: 'POST', body: { action: 'bibliotheque', messageId: m.id, anonymiser: true } });
      setInfo2('Réponse ajoutée à la bibliothèque pédagogique permanente (question anonymisée).');
    } catch (e) { setErreurEnvoi(e instanceof Error ? e.message : 'Action impossible.'); }
  };

  const accuser = async (m: MessageAffiche) => {
    setMessages((l) => l.map((x) => (x.id === m.id ? { ...x, accuse: true } : x)));
    await api(`/api/echanges/messages/${m.id}`, { method: 'POST', body: { action: 'accuse' } }).catch(() => undefined);
  };

  const citer = (id: string) => {
    const n = document.getElementById(`m-${id}`);
    if (n) {
      n.scrollIntoView({ block: 'center', behavior: 'smooth' });
      setSurligne(id); window.setTimeout(() => setSurligne(null), 2200);
    } else {
      void charger(canal, id);
    }
  };

  const ouvrirResultat = (r: ResultatRechercheDTO) => {
    setPanneau(null);
    if (r.source === 'bibliotheque') { setPanneau('bibliotheque'); return; }
    if (r.groupeId === groupeId) {
      if (r.canal && r.canal !== canal) { setCanal(r.canal); window.setTimeout(() => void charger(r.canal!, r.id), 0); }
      else void charger(canal, r.id);
    } else if (r.groupeId) {
      router.push(`/echanges/${r.groupeId}?m=${r.id}${r.canal === 'annonces' ? '&canal=annonces' : ''}`);
    }
  };

  const basculerSelection = (id: string) => setSelectionnes((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  const changerCanal = (c: 'discussion' | 'annonces') => {
    if (c === canal) return;
    setReponseA(null); setEdition(null); setSelection(false); setSelectionnes(new Set());
    setMessages([]); setCanal(c);
  };

  const sourdine = async () => {
    if (!info) return;
    const v = !info.sourdine;
    setInfo({ ...info, sourdine: v });
    await api(`/api/echanges/groupes/${groupeId}/actions`, { method: 'POST', body: { action: 'sourdine', sourdine: v } }).catch(() => undefined);
  };

  const accepterRegles = async () => {
    await api(`/api/echanges/groupes/${groupeId}/actions`, { method: 'POST', body: { action: 'regles' } });
    if (info) setInfo({ ...info, reglesAAccepter: false });
    setPanneau(null);
  };

  const selectionnable = useCallback((m: MessageAffiche) => !m.id.startsWith('tmp-') && m.auteur.type !== 'systeme' && (m.auteur.moi || !!info?.droits.moderer), [info?.droits.moderer]);

  /* ─────────────── Rendu ─────────────── */

  const lignes = useMemo(() => {
    type Ligne = { type: 'jour'; cle: string; libelle: string } | { type: 'nonlu'; cle: string } | { type: 'msg'; m: MessageAffiche; groupe: boolean };
    const out: Ligne[] = [];
    let jourPrec = '';
    let prec: MessageAffiche | null = null;
    for (const m of messages) {
      const j = new Date(m.createdAt).toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' });
      if (j !== jourPrec) { out.push({ type: 'jour', cle: `j-${j}`, libelle: jourLisible(m.createdAt) }); jourPrec = j; prec = null; }
      if (premierNonLu && m.id === premierNonLu) { out.push({ type: 'nonlu', cle: 'nonlu' }); prec = null; }
      const groupe = !!prec && prec.auteur.cle === m.auteur.cle && prec.auteur.type !== 'systeme' && new Date(m.createdAt).getTime() - new Date(prec.createdAt).getTime() < 5 * 60_000;
      out.push({ type: 'msg', m, groupe });
      prec = m;
    }
    return out;
  }, [messages, premierNonLu]);

  if (erreur && !info) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
        <AlertCircle className="h-10 w-10 text-(--color-ink-muted)" />
        <p className="max-w-sm text-[15px] text-(--color-ink-soft)">{erreur}</p>
        <Link href="/echanges" className="rounded-xl bg-[#102C5F] px-4 py-2.5 text-sm font-bold text-white">Retour aux échanges</Link>
      </div>
    );
  }
  if (!info) return <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-(--color-ink-muted)" /></div>;

  const g = info.groupe;
  const estEquipe = info.role === 'equipe';
  const m = actions;
  const peutModifier = m && m.modifiableJusqua && new Date(m.modifiableJusqua).getTime() > actionsAt;

  return (
    <div className="flex h-full min-h-0 flex-col bg-(--color-surface-soft)">
      {/* En-tête */}
      <header className="flex items-center gap-2 border-b border-(--color-border) bg-(--color-surface) px-2 py-2 sm:px-3">
        {onRetour && (
          <button type="button" onClick={onRetour} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-(--color-surface-soft) lg:hidden" aria-label="Retour à la liste">
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-bold text-(--color-ink)">{g.nom}</h1>
          <p className="flex items-center gap-1.5 truncate text-[12px] text-(--color-ink-muted)">
            <Users className="h-3 w-3" /> {g.membres} participant{g.membres > 1 ? 's' : ''}
            {g.statut === 'cloturee' && <span className="rounded bg-amber-100 px-1.5 font-semibold text-amber-800">Clôturée</span>}
            {g.statut === 'archivee' && <span className="rounded bg-(--color-surface-sunken) px-1.5 font-semibold">Archivée</span>}
            {g.statut === 'brouillon' && <span className="rounded bg-(--color-surface-sunken) px-1.5 font-semibold">Brouillon</span>}
            {g.moderationPrealable && <span className="rounded bg-sky-100 px-1.5 font-semibold text-sky-800">Messages vérifiés</span>}
          </p>
        </div>
        <button type="button" onClick={() => setPanneau('recherche')} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-(--color-surface-soft)" aria-label="Rechercher dans les échanges"><Search className="h-5 w-5" /></button>
        <button type="button" onClick={() => setPanneau('epingles')} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-(--color-surface-soft)" aria-label="Réponses importantes"><Pin className="h-5 w-5" /></button>
        {g.bibliotheque && (
          <button type="button" onClick={() => setPanneau('bibliotheque')} className="hidden h-10 w-10 items-center justify-center rounded-full hover:bg-(--color-surface-soft) sm:flex" aria-label="Réponses des enseignants"><Library className="h-5 w-5" /></button>
        )}
        <button type="button" onClick={() => setPanneau('menu')} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-(--color-surface-soft)" aria-label="Options de la conversation"><ScrollText className="h-5 w-5" /></button>
      </header>

      {/* Canaux */}
      <div className="flex gap-1 border-b border-(--color-border) bg-(--color-surface) px-2 pb-2 pt-1.5 sm:px-3" role="tablist">
        {([['discussion', 'Échanges de ma promotion', MessagesSquare, discussionNonLus], ['annonces', 'Annonces Major ECN', Megaphone, annoncesNonLues]] as const).map(([c, lib, Ic, n]) => (
          <button key={c} type="button" role="tab" aria-selected={canal === c} onClick={() => changerCanal(c)}
            className={cn('flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-[13px] font-semibold transition-colors', canal === c ? 'bg-[#102C5F] text-white' : 'text-(--color-ink-soft) hover:bg-(--color-surface-soft)')}>
            <Ic className="h-4 w-4 shrink-0" />
            <span className="truncate">{c === 'discussion' ? <><span className="sm:hidden">Ma promotion</span><span className="hidden sm:inline">{lib}</span></> : <><span className="sm:hidden">Annonces</span><span className="hidden sm:inline">{lib}</span></>}</span>
            {canal !== c && <Pastille n={n} />}
          </button>
        ))}
      </div>

      {/* Flux */}
      <div className="relative min-h-0 flex-1">
        <div ref={flux} onScroll={surDefilement} className="h-full overflow-y-auto overscroll-contain pb-4" aria-live="polite" aria-busy={chargement}>
          {plusAnciens && (
            <div className="flex justify-center py-3">
              <button type="button" onClick={() => void chargerPlusAnciens()} className="rounded-full bg-(--color-surface) px-3 py-1.5 text-[12px] font-semibold text-(--color-ink-soft) shadow-sm">
                {chargement ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Messages précédents'}
              </button>
            </div>
          )}
          {!plusAnciens && !chargement && (
            <div className="mx-auto my-4 max-w-lg rounded-2xl border border-(--color-border) bg-(--color-surface) px-4 py-4 text-center">
              {canal === 'discussion' ? (
                <>
                  <p className="text-[15px] font-bold text-(--color-ink)">Bienvenue dans les échanges de votre promotion Major ECN.</p>
                  <p className="mt-2 whitespace-pre-line text-[13.5px] leading-relaxed text-(--color-ink-soft)">{info.accueil}</p>
                </>
              ) : (
                <>
                  <p className="text-[15px] font-bold text-(--color-ink)">📢 Annonces Major ECN</p>
                  <p className="mt-1 text-[13.5px] text-(--color-ink-soft)">Les informations officielles de votre promotion : changements d’horaire, nouveaux cours, replays, concours blancs.</p>
                </>
              )}
            </div>
          )}
          {lignes.map((l) => (l.type === 'jour'
            ? <div key={l.cle} className="sticky top-1 z-[1] my-2 flex justify-center"><span className="rounded-full bg-(--color-surface)/95 px-3 py-0.5 text-[11.5px] font-semibold capitalize text-(--color-ink-soft) shadow-sm backdrop-blur">{l.libelle}</span></div>
            : l.type === 'nonlu'
              ? <div key="nonlu" id="separateur-nonlu" className="my-3 flex items-center gap-2 px-4 text-[12px] font-bold text-[#E4002B]"><span className="h-px flex-1 bg-[#E4002B]/40" />Nouveaux messages depuis votre dernière visite<span className="h-px flex-1 bg-[#E4002B]/40" /></div>
              : (
                <BulleMessage
                  key={l.m.id}
                  m={l.m}
                  groupe={l.groupe}
                  surligne={surligne === l.m.id}
                  selection={selection}
                  selectionne={selectionnes.has(l.m.id)}
                  selectionnable={selectionnable(l.m)}
                  onSelection={basculerSelection}
                  onActions={setActions}
                  onRepondre={(x) => { setEdition(null); setReponseA(x); }}
                  onReagir={reagir}
                  onCiter={citer}
                  onAccuser={accuser}
                />
              )))}
          {chargement && messages.length === 0 && <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-(--color-ink-muted)" /></div>}
        </div>
        {(nouveauxEnBas > 0 || (pasALaFin && messages.length > 30) || plusRecents) && (
          <button type="button" onClick={allerALaFin} className="absolute bottom-3 right-3 flex h-11 items-center gap-1.5 rounded-full bg-(--color-surface) px-3 text-[13px] font-bold text-(--color-ink) shadow-(--shadow-lifted)" aria-label="Aller au dernier message">
            {nouveauxEnBas > 0 && <Pastille n={nouveauxEnBas} />}
            <ArrowDown className="h-4 w-4" />
          </button>
        )}
      </div>

      {info2 && (
        <div className="flex items-start gap-2 border-t border-sky-200 bg-sky-50 px-4 py-2 text-[12.5px] text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
          <span className="flex-1">{info2}</span><button type="button" onClick={() => setInfo2(null)} className="font-bold">OK</button>
        </div>
      )}
      {erreurEnvoi && (
        <div className="flex items-start gap-2 border-t border-[#E4002B]/30 bg-[#FFF5F6] px-4 py-2 text-[12.5px] font-semibold text-[#B00020] dark:bg-[#3A0A14] dark:text-[#FCA5A5]" role="alert">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span className="flex-1">{erreurEnvoi}</span><button type="button" onClick={() => setErreurEnvoi(null)} className="font-bold">OK</button>
        </div>
      )}

      {/* Barre de sélection multiple (§40, §135) ou zone de rédaction */}
      {selection ? (
        <div className="flex items-center gap-2 border-t border-(--color-border) bg-(--color-surface) px-3 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          <button type="button" onClick={() => { setSelection(false); setSelectionnes(new Set()); }} className="h-11 rounded-xl px-4 text-[14px] font-semibold text-(--color-ink-soft) hover:bg-(--color-surface-soft)">Annuler</button>
          <span className="flex-1 text-center text-[13px] font-semibold">{selectionnes.size} sélectionné{selectionnes.size > 1 ? 's' : ''}</span>
          <button type="button" disabled={selectionnes.size === 0} onClick={() => setConfirmerSuppression([...selectionnes])}
            className="flex h-11 items-center gap-1.5 rounded-xl bg-[#E4002B] px-4 text-[14px] font-bold text-white disabled:opacity-40">
            <Trash2 className="h-4 w-4" /> Supprimer
          </button>
        </div>
      ) : (
        <Composer
          groupeId={groupeId}
          canal={canal}
          droits={info.droits}
          enseignants={info.enseignants}
          reglages={info.reglages}
          estEquipe={estEquipe}
          reponseA={reponseA}
          onAnnulerReponse={() => setReponseA(null)}
          contexte={contexte}
          onRetirerContexte={() => setContexte(null)}
          edition={edition}
          onAnnulerEdition={() => setEdition(null)}
          onModifier={modifier}
          onEnvoyer={envoyer}
          onOuvrirResultat={ouvrirResultat}
          cleBrouillon={`echanges:brouillon:${groupeId}:${canal}`}
        />
      )}

      {/* Menu d'un message */}
      <Feuille ouvert={!!m} onFermer={() => setActions(null)} titre="Message">
        {m && (
          <div className="pb-1">
            {info.droits.reagir && m.statut === 'publie' && (
              <div className="flex justify-center gap-2 pb-2">
                {info.reglages.reactions.map((e) => (
                  <button key={e} type="button" onClick={() => void reagir(m, e)} className={cn('flex h-12 w-12 items-center justify-center rounded-full text-2xl hover:bg-(--color-surface-soft)', m.reactions.find((r) => r.emoji === e)?.moi && 'bg-(--color-primary-soft)')} aria-label={`Réagir ${e}`}>{e}</button>
                ))}
              </div>
            )}
            {(info.droits.repondre || (canal === 'annonces' && info.droits.publierAnnonce)) && m.statut === 'publie' && (
              <ActionFeuille icone={Reply} libelle="Répondre" onClick={() => { setEdition(null); setReponseA(m); setActions(null); }} />
            )}
            {m.contenu && <ActionFeuille icone={Copy} libelle="Copier le texte" onClick={() => { void navigator.clipboard?.writeText(m.contenu ?? ''); setActions(null); }} />}
            {peutModifier && <ActionFeuille icone={Pencil} libelle="Modifier" aide={`Possible jusqu’à ${new Date(m.modifiableJusqua!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`} onClick={() => { setReponseA(null); setEdition(m); setActions(null); }} />}
            {info.droits.epingler && m.statut === 'publie' && (
              m.epingle
                ? <ActionFeuille icone={PinOff} libelle="Désépingler" onClick={() => void epingler(m, false)} />
                : <ActionFeuille icone={Pin} libelle="Épingler comme réponse importante" aide={m.reponseA ? 'La question citée est conservée avec la réponse.' : undefined} onClick={() => void epingler(m, true)} />
            )}
            {estEquipe && info.droits.moderer && m.statut === 'publie' && m.contenu && m.auteur.type !== 'candidat' && (
              <ActionFeuille icone={BookOpen} libelle="Garder dans la bibliothèque pédagogique" aide="Réponse pédagogique permanente, question anonymisée." onClick={() => void verserBibliotheque(m)} />
            )}
            {m.supprimable && <ActionFeuille icone={Trash2} libelle={m.auteur.moi ? 'Supprimer' : 'Supprimer (modération)'} danger onClick={() => { setActions(null); setConfirmerSuppression([m.id]); }} />}
            <ActionFeuille icone={CheckSquare} libelle="Sélectionner des messages" onClick={() => { setSelection(true); setSelectionnes(selectionnable(m) ? new Set([m.id]) : new Set()); setActions(null); }} />
            {m.signalable && <ActionFeuille icone={Flag} libelle="Signaler à Major ECN" aide="Confidentiel : l’auteur ne saura pas qui a signalé." onClick={() => { setSignalement(m); setActions(null); }} />}
            {info.droits.moderer && m.moderation?.auteurProfilId && (
              <div className="mt-1 border-t border-(--color-border) pt-1">
                <p className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-wide text-(--color-ink-muted)">Modération</p>
                <ActionFeuille icone={UserRound} libelle="Fiche du candidat" onClick={() => router.push(`/admin/echanges/candidats/${m.moderation!.auteurProfilId}`)} />
                {(['avertissement', 'lecture_seule', 'suspension', 'exclusion'] as TypeSanctionUI[]).map((t) => (
                  <ActionFeuille key={t} icone={Gavel} libelle={{ avertissement: 'Avertir', lecture_seule: 'Mettre en lecture seule', suspension: 'Suspendre de la messagerie', exclusion: 'Exclure de la messagerie', restriction_tag: 'Retirer le tag' }[t]}
                    onClick={() => { setSanction({ userId: m.moderation!.auteurProfilId!, nom: m.auteur.nom, type: t }); setActions(null); }} />
                ))}
              </div>
            )}
          </div>
        )}
      </Feuille>

      {/* Confirmation de suppression */}
      <Feuille ouvert={!!confirmerSuppression} onFermer={() => setConfirmerSuppression(null)} titre={confirmerSuppression && confirmerSuppression.length > 1 ? `Supprimer ${confirmerSuppression.length} messages ?` : 'Supprimer ce message ?'}>
        <div className="space-y-3 px-2 pb-2 text-[14px] text-(--color-ink-soft)">
          <p>Le message disparaît de la conversation pour tous les participants.</p>
          <p className="text-[12.5px]">Une copie peut être conservée temporairement par l’administration Major ECN pour la sécurité et la modération, selon la politique de confidentialité ; elle est ensuite définitivement effacée.</p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setConfirmerSuppression(null)} className="h-11 flex-1 rounded-xl border border-(--color-border) font-semibold">Annuler</button>
            <button type="button" onClick={() => confirmerSuppression && void supprimer(confirmerSuppression)} className="h-11 flex-1 rounded-xl bg-[#E4002B] font-bold text-white">Supprimer</button>
          </div>
        </div>
      </Feuille>

      {/* Signalement (§55-56) */}
      <DialogueSignalement key={signalement?.id ?? 'aucun'} message={signalement} onFermer={() => setSignalement(null)} />

      {sanction && (
        <DialogueSanction ouvert onFermer={() => setSanction(null)} userId={sanction.userId} nom={sanction.nom} groupeId={groupeId} typeInitial={sanction.type} />
      )}

      {/* Menu de la conversation */}
      <Feuille ouvert={panneau === 'menu'} onFermer={() => setPanneau(null)} titre={g.nom}>
        {info.role === 'candidat' && (
          <ActionFeuille icone={info.sourdine ? Bell : BellOff} libelle={info.sourdine ? 'Réactiver les alertes de ce groupe' : 'Mettre ce groupe en sourdine'} aide="Les réponses à vos messages et les annonces importantes vous parviennent toujours." onClick={() => void sourdine()} />
        )}
        <ActionFeuille icone={CheckSquare} libelle="Sélectionner des messages" onClick={() => { setSelection(true); setPanneau(null); }} />
        {g.bibliotheque && <ActionFeuille icone={Library} libelle="Réponses des enseignants" onClick={() => setPanneau('bibliotheque')} />}
        <ActionFeuille icone={ScrollText} libelle="Règles de bonne conduite" onClick={() => setPanneau('regles')} />
        <Link href="/profil/notifications" className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] hover:bg-(--color-surface-soft)"><Bell className="h-5 w-5" />Mes notifications</Link>
        {estEquipe && <Link href={`/admin/echanges/groupes/${groupeId}`} className="flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] hover:bg-(--color-surface-soft)"><Gavel className="h-5 w-5" />Administrer ce groupe</Link>}
      </Feuille>

      {/* Règles (§110) */}
      <Feuille ouvert={panneau === 'regles'} onFermer={() => setPanneau(null)} titre="Règles de bonne conduite">
        <div className="space-y-3 px-2 pb-2">
          <p className="whitespace-pre-line text-[14px] leading-relaxed text-(--color-ink)">{info.regles}</p>
          {info.reglesAAccepter ? (
            <button type="button" onClick={() => void accepterRegles()} className="h-12 w-full rounded-xl bg-[#102C5F] font-bold text-white">J’ai lu et j’accepte ces règles</button>
          ) : (
            <button type="button" onClick={() => setPanneau(null)} className="h-11 w-full rounded-xl border border-(--color-border) font-semibold">Fermer</button>
          )}
        </div>
      </Feuille>

      <Feuille ouvert={panneau === 'epingles'} onFermer={() => setPanneau(null)} titre="📌 Réponses importantes" large>
        {panneau === 'epingles' && <PanneauEpingles groupeId={groupeId} enseignants={info.enseignants} onOuvrir={(id) => { setPanneau(null); if (canal !== 'discussion') setCanal('discussion'); void charger('discussion', id); }} />}
      </Feuille>
      <Feuille ouvert={panneau === 'bibliotheque'} onFermer={() => setPanneau(null)} titre="📚 Réponses des enseignants" large>
        {panneau === 'bibliotheque' && <PanneauBibliotheque />}
      </Feuille>
      <Feuille ouvert={panneau === 'recherche'} onFermer={() => setPanneau(null)} titre="🔎 Rechercher dans les échanges" large>
        {panneau === 'recherche' && <PanneauRecherche groupeId={groupeId} onOuvrir={ouvrirResultat} />}
      </Feuille>
    </div>
  );
}

function DialogueSignalement({ message, onFermer }: { message: MessageAffiche | null; onFermer: () => void }) {
  const [motif, setMotif] = useState(MOTIFS_SIGNALEMENT[0]);
  const [details, setDetails] = useState('');
  const [etat, setEtat] = useState<'saisie' | 'envoi' | 'fait'>('saisie');
  const [erreur, setErreur] = useState<string | null>(null);
  const envoyer = async () => {
    if (!message) return;
    setEtat('envoi');
    try {
      await api(`/api/echanges/messages/${message.id}`, { method: 'POST', body: { action: 'signaler', motif, details } });
      setEtat('fait');
    } catch (e) { setErreur(e instanceof Error ? e.message : 'Signalement impossible.'); setEtat('saisie'); }
  };
  return (
    <Feuille ouvert={!!message} onFermer={onFermer} titre="Signaler ce message">
      {etat === 'fait' ? (
        <div className="space-y-3 px-2 pb-2 text-[14px]">
          <p className="font-semibold">Merci, le message a été transmis à l’équipe Major ECN.</p>
          <p className="text-(--color-ink-soft)">Votre signalement est confidentiel : l’auteur ne sait pas qui l’a signalé.</p>
          <button type="button" onClick={onFermer} className="h-11 w-full rounded-xl bg-[#102C5F] font-bold text-white">Fermer</button>
        </div>
      ) : (
        <div className="space-y-3 px-2 pb-2 text-[14px]">
          <fieldset className="space-y-1">
            {MOTIFS_SIGNALEMENT.map((mo) => (
              <label key={mo} className="flex min-h-11 items-center gap-3 rounded-xl px-2 hover:bg-(--color-surface-soft)">
                <input type="radio" name="motif" checked={motif === mo} onChange={() => setMotif(mo)} className="h-4 w-4" /> {mo}
              </label>
            ))}
          </fieldset>
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={3} placeholder="Précisions (facultatif)" className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2" />
          {erreur && <p className="font-semibold text-[#E4002B]">{erreur}</p>}
          <button type="button" disabled={etat === 'envoi'} onClick={() => void envoyer()} className="h-12 w-full rounded-xl bg-[#E4002B] font-bold text-white disabled:opacity-50">Envoyer le signalement</button>
        </div>
      )}
    </Feuille>
  );
}
