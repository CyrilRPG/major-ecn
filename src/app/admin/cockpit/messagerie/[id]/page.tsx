import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { contexteCockpit, profilsParIds } from '@/lib/cockpit/server/base';
import { chargerConversation, COLONNES_MESSAGE, type Message } from '@/lib/cockpit/server/messagerie';
import { chargerTache } from '@/lib/cockpit/server/taches';
import { ENVOI_MAX_TENTATIVES, nomComplet, peut } from '@/lib/cockpit/regles';
import { FilConversation } from '@/components/admin/cockpit/messagerie/fil-conversation';
import {
  dateLongue, jjmmaaaa,
  type ConversationFil, type EtatEnvoi, type MessageFil, type PieceFil, type TacheFil,
} from '@/components/admin/cockpit/messagerie/types';

export const metadata: Metadata = { title: 'Conversation · Messagerie' };
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type LigneEnvoi = {
  message_id: string;
  canal: 'email' | 'push';
  role: 'destinataire' | 'copie_proprietaire';
  statut: EtatEnvoi;
  derniere_erreur: string | null;
  tentatives: number;
};

/**
 * Fil d'une conversation privée (§5, §7, §8). Lien profond conservé après
 * connexion (C14). Toute absence de droit répond « introuvable » : aucune
 * fuite, même de l'existence du fil.
 */
export default async function PageConversation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { moi, db: d } = await contexteCockpit();
  const acces = await chargerConversation(d, id, moi);
  if (!acces) notFound();
  const { conv, role } = acces;
  const proprietaire = role === 'proprietaire';

  const { data: lignes } = await d
    .from('cockpit_messages')
    .select(COLONNES_MESSAGE)
    .eq('conversation_id', conv.id)
    .order('created_at', { ascending: true })
    .limit(1000);
  const tous = (lignes ?? []) as Message[];
  // L'enseignant ne voit jamais les brouillons de l'administrateur.
  const publies = tous.filter((m) => !m.brouillon);
  const brouillons = proprietaire ? tous.filter((m) => m.brouillon) : [];
  const brouillon = brouillons[brouillons.length - 1] ?? null;
  const ids = publies.map((m) => m.id);

  const [piecesRes, envoisRes, profils, tacheAcces] = await Promise.all([
    ids.length > 0
      ? d.from('cockpit_pieces_jointes').select('id, message_id, nom, taille, mime').in('message_id', ids).order('created_at')
      : Promise.resolve({ data: [] }),
    ids.length > 0 && proprietaire
      ? d.from('cockpit_envois').select('message_id, canal, role, statut, derniere_erreur, tentatives').in('message_id', ids)
      : Promise.resolve({ data: [] }),
    profilsParIds(d, [conv.owner_id, conv.interlocuteur_id, ...publies.map((m) => m.auteur_id)]),
    conv.tache_id ? chargerTache(d, conv.tache_id, moi.id) : Promise.resolve(null),
  ]);

  const piecesPar = new Map<string, PieceFil[]>();
  for (const p of (piecesRes.data ?? []) as (PieceFil & { message_id: string })[]) {
    const l = piecesPar.get(p.message_id) ?? [];
    l.push({ id: p.id, nom: p.nom, taille: Number(p.taille), mime: p.mime });
    piecesPar.set(p.message_id, l);
  }
  const envoisPar = new Map<string, LigneEnvoi[]>();
  for (const e of (envoisRes.data ?? []) as LigneEnvoi[]) {
    const l = envoisPar.get(e.message_id) ?? [];
    l.push(e);
    envoisPar.set(e.message_id, l);
  }

  const nomProprietaire = nomComplet(profils.get(conv.owner_id)) || 'Administration Major ECN';
  const nomInterlocuteur = conv.interlocuteur_label;

  const messages: MessageFil[] = publies.map((m, i) => {
    const deMoi = (m.sens === 'sortant') === proprietaire;
    const envois = envoisPar.get(m.id) ?? [];
    // Message sortant : e-mail au destinataire. Réponse : copie e-mail au propriétaire.
    const roleEmail = m.sens === 'sortant' ? 'destinataire' : 'copie_proprietaire';
    const email = envois.find((e) => e.canal === 'email' && e.role === roleEmail) ?? null;
    const push = envois.find((e) => e.canal === 'push') ?? null;
    const auteurProfil = m.auteur_id ? profils.get(m.auteur_id) : undefined;
    const auteur = deMoi
      ? 'Vous'
      : m.sens === 'sortant'
        ? nomComplet(auteurProfil) || nomProprietaire
        : nomComplet(auteurProfil) || nomInterlocuteur;
    const reponseRecue = publies.slice(i + 1).some((s) => s.sens !== m.sens);
    return {
      id: m.id,
      deMoi,
      sens: m.sens,
      auteur,
      corps: m.corps,
      quand: dateLongue(m.envoye_at ?? m.created_at),
      redigeAvecIa: proprietaire && m.redige_avec_ia,
      saisieManuelle: m.saisie_manuelle,
      luLe: m.lu_at ? dateLongue(m.lu_at) : null,
      traite: !!m.traite_at,
      reponseRecue,
      pieces: piecesPar.get(m.id) ?? [],
      email: email
        ? { statut: email.statut, erreur: email.derniere_erreur, nouvelEssai: email.statut === 'echec' && email.tentatives < ENVOI_MAX_TENTATIVES }
        : null,
      push: push?.statut ?? null,
    };
  });

  const conversation: ConversationFil = {
    id: conv.id,
    role,
    sujet: conv.sujet,
    mission: conv.mission,
    interlocuteur: nomInterlocuteur,
    interlocuteurType: conv.interlocuteur_type,
    interlocuteurEmail: proprietaire && conv.interlocuteur_type !== 'enseignant' ? conv.interlocuteur_email : null,
    proprietaire: proprietaire ? null : nomProprietaire,
    // Suivi et archivage : classements privés du propriétaire.
    suivie: proprietaire && conv.suivie,
    archivee: proprietaire && !!conv.archivee_at,
    creeLe: dateLongue(conv.created_at),
  };

  const tache: TacheFil | null = tacheAcces
    ? {
      id: tacheAcces.tache.id,
      titre: tacheAcces.tache.titre,
      statut: tacheAcces.tache.statut,
      echeance: tacheAcces.tache.echeance,
      echeanceLabel: tacheAcces.tache.echeance ? jjmmaaaa(tacheAcces.tache.echeance) : 'Sans échéance',
      peutModifier: peut(tacheAcces.niveau, 'modification'),
    }
    : null;

  return (
    <FilConversation
      key={conv.id}
      conversation={conversation}
      messages={messages}
      tache={tache}
      brouillon={brouillon ? { id: brouillon.id, corps: brouillon.corps } : null}
    />
  );
}
