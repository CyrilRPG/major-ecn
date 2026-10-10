import type { Metadata } from 'next';
import { contexteCockpit, type Db } from '@/lib/cockpit/server/base';
import { conversationsDe } from '@/lib/cockpit/server/messagerie';
import { chargerTache } from '@/lib/cockpit/server/taches';
import { nomComplet, peut } from '@/lib/cockpit/regles';
import { ListeConversations } from '@/components/admin/cockpit/messagerie/liste-conversations';
import {
  BOITES, dateCourte, dateLongue, estBoite, estFiltreStatut, jourParis, normaliser,
  type Boite, type CompteursBoites, type EtatEnvoi, type FiltresListe, type InitialRelance, type Interlocuteur,
  type ResumeConversation,
} from '@/components/admin/cockpit/messagerie/types';

export const metadata: Metadata = { title: 'Messagerie · Mon cockpit' };
export const dynamic = 'force-dynamic';

type Search = Record<string, string | string[] | undefined>;
const un = (v: string | string[] | undefined) => ((Array.isArray(v) ? v[0] : v) ?? '').trim();
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const JOUR = /^\d{4}-\d{2}-\d{2}$/;

type LigneMessage = {
  id: string;
  conversation_id: string;
  sens: 'sortant' | 'entrant';
  corps: string;
  brouillon: boolean;
  lu_at: string | null;
  traite_at: string | null;
  created_at: string;
};
type LigneEnvoi = { message_id: string; canal: 'email' | 'push'; role: 'destinataire' | 'copie_proprietaire'; statut: EtatEnvoi };

/** Tous les messages des fils, par paquets (le plafond PostgREST est de 1 000 lignes). */
async function messagesDe(d: Db, ids: string[]): Promise<LigneMessage[]> {
  const sortie: LigneMessage[] = [];
  for (let i = 0; i < ids.length; i += 100) {
    const paquet = ids.slice(i, i + 100);
    for (let debut = 0; ; debut += 1000) {
      const { data } = await d
        .from('cockpit_messages')
        .select('id, conversation_id, sens, corps, brouillon, lu_at, traite_at, created_at')
        .in('conversation_id', paquet)
        .order('created_at', { ascending: true })
        .range(debut, debut + 999);
      const lignes = (data ?? []) as LigneMessage[];
      sortie.push(...lignes);
      if (lignes.length < 1000) break;
    }
  }
  return sortie;
}

async function envoisDe(d: Db, messageIds: string[]): Promise<LigneEnvoi[]> {
  const sortie: LigneEnvoi[] = [];
  for (let i = 0; i < messageIds.length; i += 200) {
    const { data } = await d
      .from('cockpit_envois')
      .select('message_id, canal, role, statut')
      .in('message_id', messageIds.slice(i, i + 200));
    sortie.push(...((data ?? []) as LigneEnvoi[]));
  }
  return sortie;
}

/** Préremplissage du « Nouveau message » depuis `?ecrire=<profil>` ou `?tache=<id>`. */
async function preremplissage(d: Db, moiId: string, ecrire: string, tache: string): Promise<InitialRelance | null> {
  if (tache && UUID.test(tache)) {
    const acces = await chargerTache(d, tache, moiId);
    if (acces && peut(acces.niveau, 'modification')) {
      const t = acces.tache;
      const initial: InitialRelance = { sujet: t.titre, mission: t.titre, tacheId: t.id };
      if (t.lien_type === 'enseignant' && t.lien_id && UUID.test(t.lien_id)) {
        initial.type = 'enseignant';
        initial.personneId = t.lien_id;
        initial.personneLabel = t.lien_label ?? undefined;
      } else if (t.lien_type === 'eleve' && t.lien_id && UUID.test(t.lien_id)) {
        const { data: p } = await d.from('profiles').select('id, first_name, last_name, email').eq('id', t.lien_id).maybeSingle();
        initial.type = 'eleve';
        initial.personneId = t.lien_id;
        initial.personneLabel = (p && nomComplet(p)) || t.lien_label || undefined;
        initial.email = p?.email ?? undefined;
      }
      return initial;
    }
  }
  if (ecrire && UUID.test(ecrire)) {
    const { data: p } = await d.from('profiles').select('id, role, first_name, last_name, email').eq('id', ecrire).maybeSingle();
    if (p && (p.role === 'professor' || p.role === 'admin')) {
      return { type: 'enseignant', personneId: p.id, personneLabel: nomComplet(p) || p.email || 'Enseignant' };
    }
  }
  return null;
}

/** Messagerie administrative privée (§5) : boîtes, historique et recherche. */
export default async function PageMessagerie({ searchParams }: { searchParams: Promise<Search> }) {
  const sp = await searchParams;
  const { moi, db: d } = await contexteCockpit();

  const filtres: FiltresListe = {
    boite: estBoite(un(sp.boite)) ? (un(sp.boite) as Boite) : 'reception',
    q: un(sp.q).slice(0, 200),
    avec: un(sp.avec).slice(0, 300),
    mission: un(sp.mission).slice(0, 200),
    du: JOUR.test(un(sp.du)) ? un(sp.du) : '',
    au: JOUR.test(un(sp.au)) ? un(sp.au) : '',
    statut: estFiltreStatut(un(sp.statut)) ? (un(sp.statut) as FiltresListe['statut']) : '',
  };

  const [convs, initial] = await Promise.all([
    conversationsDe(d, moi),
    preremplissage(d, moi.id, un(sp.ecrire), un(sp.tache)),
  ]);
  const roleDe = new Map(convs.map((c) => [c.id, c.role]));
  const tous = await messagesDe(d, convs.map((c) => c.id));
  // Un enseignant ne voit jamais les brouillons de l'administrateur.
  const messages = tous.filter((m) => !m.brouillon || roleDe.get(m.conversation_id) === 'proprietaire');

  const parConv = new Map<string, LigneMessage[]>();
  for (const m of messages) {
    const l = parConv.get(m.conversation_id) ?? [];
    l.push(m);
    parConv.set(m.conversation_id, l);
  }

  // États d'envoi des messages du propriétaire (e-mail au destinataire).
  const sortantsProprietaire = messages.filter((m) => !m.brouillon && m.sens === 'sortant' && roleDe.get(m.conversation_id) === 'proprietaire');
  const envois = await envoisDe(d, sortantsProprietaire.map((m) => m.id));
  const emailDe = new Map<string, EtatEnvoi>();
  for (const e of envois) if (e.canal === 'email' && e.role === 'destinataire') emailDe.set(e.message_id, e.statut);

  const maintenant = new Date();
  // Index de recherche, gardé hors des données envoyées au navigateur.
  const index = new Map<string, { texte: string; jour: string; avecCle: string }>();
  const resumes: ResumeConversation[] = convs.map((c) => {
    const liste = parConv.get(c.id) ?? [];
    const publies = liste.filter((m) => !m.brouillon);
    const deMoi = (m: LigneMessage) => (m.sens === 'sortant') === (c.role === 'proprietaire');
    const dernier = publies[publies.length - 1] ?? null;
    const brouillons = liste.filter((m) => m.brouillon);
    const brouillon = brouillons[brouillons.length - 1] ?? null;
    const aTraiter = c.role === 'proprietaire'
      ? publies.filter((m) => m.sens === 'entrant' && !m.traite_at).length
      : publies.filter((m) => m.sens === 'sortant' && !m.lu_at).length;
    const mesSortants = c.role === 'proprietaire' ? publies.filter((m) => m.sens === 'sortant') : [];
    const dernierSortant = mesSortants[mesSortants.length - 1] ?? null;
    index.set(c.id, {
      texte: normaliser([c.sujet, c.mission, c.interlocuteur_label, c.interlocuteur_email, ...liste.map((m) => m.corps)].join(' \n ')),
      jour: jourParis(c.dernier_message_at),
      avecCle: c.interlocuteur_id ?? `@${(c.interlocuteur_email ?? c.interlocuteur_label).toLowerCase()}`,
    });
    return {
      id: c.id,
      role: c.role,
      sujet: c.sujet,
      mission: c.mission,
      interlocuteur: c.interlocuteur_label,
      interlocuteurType: c.interlocuteur_type,
      tacheId: c.tache_id,
      // Suivi et archivage sont des classements privés du propriétaire.
      suivie: c.role === 'proprietaire' && c.suivie,
      archivee: c.role === 'proprietaire' && !!c.archivee_at,
      quand: dateCourte(c.dernier_message_at, maintenant),
      quandComplet: dateLongue(c.dernier_message_at),
      apercu: dernier ? dernier.corps.replace(/\s+/g, ' ').slice(0, 180) : null,
      dernierDeMoi: dernier ? deMoi(dernier) : null,
      aTraiter,
      brouillon: brouillon ? brouillon.corps.replace(/\s+/g, ' ').slice(0, 140) : null,
      etatDernierEmail: dernierSortant ? emailDe.get(dernierSortant.id) ?? null : null,
      echec: mesSortants.some((m) => emailDe.get(m.id) === 'echec'),
      luDernier: !!dernierSortant?.lu_at,
    };
  });

  // Appartenance aux boîtes. L'archivage est un classement du propriétaire :
  // il ne retire rien de la vue de l'enseignant.
  const archiveePourMoi = (r: ResumeConversation) => r.role === 'proprietaire' && r.archivee;
  const dansBoite: Record<Boite, (r: ResumeConversation) => boolean> = {
    reception: (r) => !archiveePourMoi(r) && (parConv.get(r.id) ?? []).some((m) => !m.brouillon && (m.sens === 'sortant') !== (r.role === 'proprietaire')),
    envoyes: (r) => !archiveePourMoi(r) && (parConv.get(r.id) ?? []).some((m) => !m.brouillon && (m.sens === 'sortant') === (r.role === 'proprietaire')),
    brouillons: (r) => r.role === 'proprietaire' && !r.archivee && (!!r.brouillon || !(parConv.get(r.id) ?? []).some((m) => !m.brouillon)),
    suivies: (r) => r.role === 'proprietaire' && !r.archivee && r.suivie,
    archivees: (r) => archiveePourMoi(r),
    toutes: () => true,
  };
  const compteurs = Object.fromEntries(BOITES.map((b) => [
    b,
    // Réception : nombre de fils à traiter ; autres boîtes : nombre de fils.
    b === 'reception' ? resumes.filter((r) => dansBoite.reception(r) && r.aTraiter > 0).length : resumes.filter(dansBoite[b]).length,
  ])) as CompteursBoites;

  // Interlocuteurs connus (filtre « avec »).
  const interlocuteurs = new Map<string, Interlocuteur>();
  for (const r of resumes) {
    const cle = index.get(r.id)!.avecCle;
    if (!interlocuteurs.has(cle)) interlocuteurs.set(cle, { cle, label: r.interlocuteur });
  }

  const q = normaliser(filtres.q);
  const mission = normaliser(filtres.mission);
  const visibles = resumes.filter((r) => {
    const ix = index.get(r.id)!;
    if (!dansBoite[filtres.boite](r)) return false;
    if (q && !q.split(/\s+/).every((mot) => ix.texte.includes(mot))) return false;
    if (mission && !normaliser(`${r.mission ?? ''} ${r.sujet}`).includes(mission)) return false;
    if (filtres.avec && ix.avecCle !== filtres.avec) return false;
    if (filtres.du && ix.jour < filtres.du) return false;
    if (filtres.au && ix.jour > filtres.au) return false;
    if (filtres.statut === 'a_traiter' && r.aTraiter === 0) return false;
    if (filtres.statut === 'attente' && !(r.dernierDeMoi === true)) return false;
    if (filtres.statut === 'echec' && !r.echec) return false;
    if (filtres.statut === 'brouillon' && !r.brouillon) return false;
    return true;
  });

  return (
    <ListeConversations
      conversations={visibles}
      compteurs={compteurs}
      filtres={filtres}
      interlocuteurs={[...interlocuteurs.values()].sort((a, b) => a.label.localeCompare(b.label, 'fr'))}
      initialRelance={initial}
      ouvrirNouveau={!!initial || un(sp.nouveau) === '1'}
    />
  );
}
