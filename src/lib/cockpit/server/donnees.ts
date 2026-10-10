import 'server-only';
import { instantParis } from '@/lib/agenda/planning';
import {
  AMELIORATION_OUVERTE, ajouterJoursIso, comparerTaches, estOuverte, estUrgente, lundiDe, nomComplet,
  premierDuMois, RECLAMATION_OUVERTE, tauxDeReponse,
} from '../regles';
import { FACULTE, profilsParIds, type Db, type Moi } from './base';
import { tachesVisibles, type TacheVisible } from './taches';
import { conversationsDe, type Conversation } from './messagerie';

/* ------------------------------------------------------------------ */
/* Agenda unifié : rendez-vous, cours plateforme, échéances, rdv suivi  */
/* ------------------------------------------------------------------ */

export type GenreAgenda = 'cours' | 'reunion' | 'echeance' | 'autre';

export type ElementAgenda = {
  id: string;
  source: 'rdv' | 'cours' | 'tache' | 'suivi';
  genre: GenreAgenda;
  /** Sous-type pour l'icône : visio, appel, document, équipe, ordinateur. */
  icone: 'visio' | 'appel' | 'document' | 'equipe' | 'ordinateur' | 'cours' | 'tache';
  titre: string;
  sousTitre: string | null;
  date: string;
  debut: string | null;
  fin: string | null;
  lienVisio: string | null;
  href: string | null;
  /** Tâche : déplaçable par glisser-déposer. */
  tacheId?: string;
  terminee?: boolean;
};

const HEURE = (iso: string) =>
  new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
const JOUR = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' }); // AAAA-MM-JJ

export type RdvLigne = {
  id: string; owner_id: string; titre: string; genre: string; debut: string; fin: string | null;
  personne_type: string | null; personne_id: string | null; personne_label: string | null; objet: string | null;
  lieu: string | null; lien_visio: string | null; coordonnees: string | null; notes: string | null;
  documents: { label: string; url: string }[]; tache_suivi_id: string | null; created_at: string;
};

export const COLONNES_RDV =
  'id, owner_id, titre, genre, debut, fin, personne_type, personne_id, personne_label, objet, lieu, lien_visio, coordonnees, notes, documents, tache_suivi_id, created_at';

function iconeRdv(r: RdvLigne): ElementAgenda['icone'] {
  if (r.lien_visio) return 'visio';
  if (r.genre === 'appel') return 'appel';
  if (r.genre === 'reunion') return 'equipe';
  if (r.genre === 'echeance') return 'document';
  return 'ordinateur';
}

/** Tous les éléments d'agenda de l'utilisateur entre deux dates (incluses). */
export async function agendaEntre(d: Db, moi: Moi, debut: string, fin: string, taches: TacheVisible[], voitCours: boolean): Promise<ElementAgenda[]> {
  const debutIso = new Date(`${ajouterJoursIso(debut, -1)}T00:00:00Z`).toISOString();
  const finIso = new Date(`${ajouterJoursIso(fin, 1)}T23:59:59Z`).toISOString();
  const [rdv, cours, suivi] = await Promise.all([
    d.from('cockpit_rdv').select(COLONNES_RDV).eq('owner_id', moi.id).gte('debut', debutIso).lte('debut', finIso).order('debut').limit(1000),
    voitCours
      ? d.from('platform_events').select('id, title, date, start_time, end_time, college, intervenant, zoom_url')
        .eq('faculte_id', FACULTE).gte('date', debut).lte('date', fin).order('date').order('start_time').limit(1000)
      : Promise.resolve({ data: [] }),
    d.from('suivi_appointments').select('id, user_id, starts_at, ends_at, status')
      .eq('staff_user_id', moi.id).gte('starts_at', debutIso).lte('starts_at', finIso).in('status', ['planned', 'postponed']).limit(500),
  ]);

  const elements: ElementAgenda[] = [];
  for (const r of (rdv.data ?? []) as RdvLigne[]) {
    const date = JOUR(r.debut);
    if (date < debut || date > fin) continue;
    elements.push({
      id: `rdv:${r.id}`, source: 'rdv',
      genre: r.genre === 'reunion' || r.genre === 'rendez_vous' || r.genre === 'appel' ? 'reunion' : r.genre === 'echeance' ? 'echeance' : 'autre',
      icone: iconeRdv(r), titre: r.titre,
      sousTitre: [r.personne_label, r.objet].filter(Boolean).join(' · ') || (r.lien_visio ? 'Visio' : r.lieu),
      date, debut: HEURE(r.debut), fin: r.fin ? HEURE(r.fin) : null, lienVisio: r.lien_visio,
      href: `/admin/cockpit/agenda?rdv=${r.id}`,
    });
  }
  for (const c of (cours.data ?? []) as { id: string; title: string; date: string; start_time: string | null; end_time: string | null; intervenant: string | null; zoom_url: string | null }[]) {
    elements.push({
      id: `cours:${c.id}`, source: 'cours', genre: 'cours', icone: 'cours', titre: c.title,
      sousTitre: c.intervenant, date: c.date, debut: c.start_time?.slice(0, 5) ?? null, fin: c.end_time?.slice(0, 5) ?? null,
      lienVisio: c.zoom_url, href: '/admin/agenda',
    });
  }
  const suivis = (suivi.data ?? []) as { id: string; user_id: string; starts_at: string; ends_at: string }[];
  if (suivis.length > 0) {
    const profils = await profilsParIds(d, suivis.map((s) => s.user_id));
    for (const s of suivis) {
      const date = JOUR(s.starts_at);
      if (date < debut || date > fin) continue;
      elements.push({
        id: `suivi:${s.id}`, source: 'suivi', genre: 'reunion', icone: 'appel',
        titre: `Entretien de suivi — ${nomComplet(profils.get(s.user_id)) || 'candidat'}`, sousTitre: 'Suivi pédagogique',
        date, debut: HEURE(s.starts_at), fin: HEURE(s.ends_at), lienVisio: null, href: `/admin/suivi/candidats/${s.user_id}`,
      });
    }
  }
  for (const t of taches) {
    if (!t.echeance || t.echeance < debut || t.echeance > fin || t.statut === 'annulee') continue;
    elements.push({
      id: `tache:${t.id}`, source: 'tache', genre: 'echeance', icone: 'tache', titre: t.titre,
      sousTitre: t.lien_label ?? null, date: t.echeance, debut: t.heure?.slice(0, 5) ?? null, fin: null, lienVisio: null,
      href: `/admin/cockpit/taches?t=${t.id}`, tacheId: t.id, terminee: t.statut === 'terminee',
    });
  }
  return elements.sort((a, b) => (a.date + (a.debut ?? '99:99')).localeCompare(b.date + (b.debut ?? '99:99')));
}

/* ------------------------------------------------------------------ */
/* Tableau de bord                                                     */
/* ------------------------------------------------------------------ */

type MsgCourt = { sens: string; corps: string; created_at: string; envoye_at: string | null; traite_at: string | null; lu_at: string | null; auteur_id: string | null };

export type AttenteReponse = {
  conversationId: string;
  interlocuteur: string;
  type: 'enseignant' | 'eleve' | 'client';
  sujet: string;
  depuis: string;
  tacheId: string | null;
};

export type DernierMessage = {
  conversationId: string;
  auteur: string;
  type: 'enseignant' | 'eleve' | 'client' | 'administration';
  sujet: string;
  apercu: string;
  date: string;
  nonTraites: number;
};

export type ReclamationResume = {
  id: string; candidat_id: string | null; candidat_label: string; specialite: string | null; sujet: string;
  categorie: string; statut: string; priorite: string; created_at: string; amelioration_id: string | null; a_recontacter: boolean;
};

export type AmeliorationResume = {
  id: string; numero: number; titre: string; module: string | null; priorite: string; statut: string;
  echeance: string | null; candidats: number;
};

export type Cockpit = {
  aujourdHui: string;
  objectifJour: { texte: string; atteint: boolean } | null;
  taches: TacheVisible[];
  priorites: (TacheVisible & { suggeree: boolean })[];
  compteurs: {
    aFaire: number; urgentes: number; terminees: number; enAttente: number; reponsesRecues: number;
    rdvAujourdhui: number; prochainRdv: { titre: string; date: string; heure: string | null } | null;
    attente: { total: number; enseignants: number; clients: number };
    reclamations: { ouvertes: number; urgentes: number; aRecontacter: number };
    ameliorations: { ouvertes: number; enCours: number; aValider: number };
    demandes: { ouvertes: number; urgentes: number; comptables: number };
    tauxReponse: number | null;
    tauxReponsePrecedent: number | null;
  };
  agenda: ElementAgenda[];
  attente: AttenteReponse[];
  messages: DernierMessage[];
  reclamations: ReclamationResume[];
  ameliorations: AmeliorationResume[];
};

export async function chargerCockpit(d: Db, moi: Moi, voitCours: boolean): Promise<Cockpit> {
  const aujourdHui = instantParis().date;
  const debutMois = premierDuMois(aujourdHui);
  const finAgenda = ajouterJoursIso(debutMois, 45);
  const debutAgenda = ajouterJoursIso(lundiDe(debutMois), 0);

  const [taches, conversations, objectif] = await Promise.all([
    tachesVisibles(d, moi.id),
    conversationsDe(d, moi),
    d.from('cockpit_objectifs').select('texte, atteint').eq('owner_id', moi.id).eq('periode', 'jour').eq('debut', aujourdHui).maybeSingle(),
  ]);

  const ouvertes = taches.filter((t) => estOuverte(t.statut));
  const agenda = await agendaEntre(d, moi, debutAgenda < aujourdHui ? debutAgenda : aujourdHui, finAgenda, taches, voitCours);

  // « Mes 3 priorités du jour » : épinglées d'abord (rang), complétées par les plus urgentes.
  const epinglees = ouvertes
    .filter((t) => t.priorite_jour === aujourdHui && t.rang_priorite)
    .sort((a, b) => (a.rang_priorite ?? 9) - (b.rang_priorite ?? 9))
    .map((t) => ({ ...t, suggeree: false }));
  const candidates = ouvertes
    .filter((t) => !epinglees.some((e) => e.id === t.id) && (estUrgente(t, aujourdHui) || (t.echeance !== null && t.echeance <= aujourdHui)))
    .sort(comparerTaches)
    .map((t) => ({ ...t, suggeree: true }));
  const priorites = [...epinglees, ...candidates].slice(0, 3);

  // Messagerie : attentes de réponse et derniers messages reçus.
  const proprietaires = conversations.filter((c) => c.role === 'proprietaire' && !c.archivee_at);
  const ids = conversations.map((c) => c.id);
  const messagesParConv = new Map<string, MsgCourt[]>();
  for (let i = 0; i < ids.length; i += 150) {
    const { data } = await d.from('cockpit_messages')
      .select('conversation_id, sens, corps, created_at, envoye_at, traite_at, lu_at, auteur_id')
      .in('conversation_id', ids.slice(i, i + 150)).eq('brouillon', false)
      .order('created_at', { ascending: true }).limit(5000);
    for (const m of (data ?? []) as (MsgCourt & { conversation_id: string })[]) {
      const l = messagesParConv.get(m.conversation_id) ?? [];
      l.push(m);
      messagesParConv.set(m.conversation_id, l);
    }
  }

  const attente: AttenteReponse[] = [];
  for (const c of proprietaires) {
    const ms = messagesParConv.get(c.id) ?? [];
    const dernier = ms[ms.length - 1];
    if (dernier && dernier.sens === 'sortant') {
      attente.push({ conversationId: c.id, interlocuteur: c.interlocuteur_label, type: c.interlocuteur_type, sujet: c.sujet, depuis: dernier.created_at, tacheId: c.tache_id });
    }
  }
  attente.sort((a, b) => (a.depuis < b.depuis ? -1 : 1));

  const messages: DernierMessage[] = [];
  for (const c of conversations) {
    const ms = messagesParConv.get(c.id) ?? [];
    // Pour le propriétaire : messages entrants ; pour l'enseignant : messages de l'administration.
    const recus = ms.filter((m) => (c.role === 'proprietaire' ? m.sens === 'entrant' : m.sens === 'sortant'));
    const dernier = recus[recus.length - 1];
    if (!dernier) continue;
    messages.push({
      conversationId: c.id,
      auteur: c.role === 'proprietaire' ? c.interlocuteur_label : 'Administration Major ECN',
      type: c.role === 'proprietaire' ? c.interlocuteur_type : 'administration',
      sujet: c.sujet,
      apercu: dernier.corps.slice(0, 120),
      date: dernier.created_at,
      nonTraites: c.role === 'proprietaire' ? recus.filter((m) => !m.traite_at).length : recus.filter((m) => !m.lu_at).length,
    });
  }
  messages.sort((a, b) => (a.date < b.date ? 1 : -1));

  // Taux de réponse : messages envoyés sur 30 jours suivis d'une réponse dans le même fil.
  const taux = (debut: string, fin: string) => {
    let envoyes = 0;
    let repondus = 0;
    for (const c of proprietaires) {
      const ms = messagesParConv.get(c.id) ?? [];
      ms.forEach((m, i) => {
        if (m.sens !== 'sortant' || m.created_at < debut || m.created_at >= fin) return;
        envoyes++;
        if (ms.slice(i + 1).some((n) => n.sens === 'entrant')) repondus++;
      });
    }
    return tauxDeReponse(envoyes, repondus);
  };
  const maintenant = Date.now();
  const j30 = new Date(maintenant - 30 * 86_400_000).toISOString();
  const j60 = new Date(maintenant - 60 * 86_400_000).toISOString();
  const tauxReponse = taux(j30, new Date(maintenant + 60_000).toISOString());
  const tauxReponsePrecedent = taux(j60, j30);

  // Réclamations, améliorations, demandes (dossiers d'équipe).
  const [recl, amel, dem] = await Promise.all([
    moi.estAdmin
      ? d.from('cockpit_reclamations').select('id, candidat_id, candidat_label, specialite, sujet, categorie, statut, priorite, created_at, amelioration_id, a_recontacter')
        .eq('faculte_id', FACULTE).order('created_at', { ascending: false }).limit(500)
      : d.from('cockpit_reclamations').select('id, candidat_id, candidat_label, specialite, sujet, categorie, statut, priorite, created_at, amelioration_id, a_recontacter')
        .eq('faculte_id', FACULTE).or(`created_by.eq.${moi.id},assignee_id.eq.${moi.id}`).order('created_at', { ascending: false }).limit(500),
    moi.estAdmin
      ? d.from('cockpit_ameliorations').select('id, numero, titre, module, priorite, statut, echeance').eq('faculte_id', FACULTE).order('created_at', { ascending: false }).limit(300)
      : d.from('cockpit_ameliorations').select('id, numero, titre, module, priorite, statut, echeance').eq('faculte_id', FACULTE)
        .or(`responsable_id.eq.${moi.id},created_by.eq.${moi.id}`).limit(300),
    moi.estAdmin
      ? d.from('cockpit_demandes').select('id, statut, priorite, nature, echeance').eq('faculte_id', FACULTE).neq('statut', 'terminee').limit(2000)
      : d.from('cockpit_demandes').select('id, statut, priorite, nature, echeance').eq('faculte_id', FACULTE).neq('statut', 'terminee')
        .or(`created_by.eq.${moi.id},assignee_id.eq.${moi.id}`).limit(2000),
  ]);
  const reclamationsToutes = (recl.data ?? []) as ReclamationResume[];
  const ameliorationsToutes = (amel.data ?? []) as Omit<AmeliorationResume, 'candidats'>[];
  const demandes = (dem.data ?? []) as { statut: string; priorite: string; nature: string; echeance: string | null }[];

  const candidatsParAmelioration = new Map<string, Set<string>>();
  for (const r of reclamationsToutes) {
    if (!r.amelioration_id) continue;
    const s = candidatsParAmelioration.get(r.amelioration_id) ?? new Set<string>();
    s.add(r.candidat_id ?? `label:${r.candidat_label}`);
    candidatsParAmelioration.set(r.amelioration_id, s);
  }
  const ameliorations = ameliorationsToutes
    .map((a) => ({ ...a, candidats: candidatsParAmelioration.get(a.id)?.size ?? 0 }))
    .filter((a) => AMELIORATION_OUVERTE(a.statut));

  const rdvAujourdhui = agenda.filter((e) => e.date === aujourdHui && e.source !== 'tache' && e.source !== 'cours');
  const prochain = agenda.find((e) => e.source !== 'tache' && e.source !== 'cours' && (e.date > aujourdHui || (e.date === aujourdHui && (e.debut ?? '00:00') >= instantParis().heure)));

  const reclOuvertes = reclamationsToutes.filter((r) => RECLAMATION_OUVERTE(r.statut));

  return {
    aujourdHui,
    objectifJour: objectif.data ? { texte: objectif.data.texte, atteint: objectif.data.atteint } : null,
    taches,
    priorites,
    compteurs: {
      aFaire: ouvertes.length,
      urgentes: ouvertes.filter((t) => estUrgente(t, aujourdHui)).length,
      terminees: taches.filter((t) => t.statut === 'terminee' && t.terminee_at && t.terminee_at.slice(0, 10) >= ajouterJoursIso(aujourdHui, -7)).length,
      enAttente: ouvertes.filter((t) => t.statut === 'attente_reponse').length,
      reponsesRecues: ouvertes.filter((t) => t.statut === 'reponse_recue').length,
      rdvAujourdhui: rdvAujourdhui.length,
      prochainRdv: prochain ? { titre: prochain.titre, date: prochain.date, heure: prochain.debut } : null,
      attente: {
        total: attente.length,
        enseignants: attente.filter((a) => a.type === 'enseignant').length,
        clients: attente.filter((a) => a.type !== 'enseignant').length,
      },
      reclamations: {
        ouvertes: reclOuvertes.length,
        urgentes: reclOuvertes.filter((r) => r.priorite === 'urgente' || r.priorite === 'haute').length,
        aRecontacter: reclamationsToutes.filter((r) => r.a_recontacter).length,
      },
      ameliorations: {
        ouvertes: ameliorations.length,
        enCours: ameliorations.filter((a) => a.statut === 'en_cours').length,
        aValider: ameliorations.filter((a) => a.statut === 'a_valider').length,
      },
      demandes: {
        ouvertes: demandes.length,
        urgentes: demandes.filter((x) => x.priorite === 'urgente' || x.priorite === 'haute' || (x.echeance !== null && x.echeance < aujourdHui)).length,
        comptables: demandes.filter((x) => x.nature === 'comptable').length,
      },
      tauxReponse,
      tauxReponsePrecedent,
    },
    agenda,
    attente,
    messages: messages.slice(0, 12),
    reclamations: reclamationsToutes.slice(0, 8),
    ameliorations: ameliorations.slice(0, 8),
  };
}

/** Pastilles du menu (requêtes de comptage légères, à chaque navigation admin). */
export async function pastillesMenu(d: Db, moi: Moi): Promise<{ taches: number; messages: number; reclamations: number; demandes: number; notifications: number }> {
  const ouverts = ['a_faire', 'en_cours', 'attente_reponse', 'reponse_recue', 'reportee'];
  const [t1, t2, convs, recl, dem, notif] = await Promise.all([
    d.from('cockpit_taches').select('id', { count: 'exact', head: true }).eq('owner_id', moi.id).is('archivee_at', null).in('statut', ouverts),
    d.from('cockpit_taches').select('id', { count: 'exact', head: true }).eq('assignee_id', moi.id).neq('owner_id', moi.id).is('archivee_at', null).in('statut', ouverts),
    d.from('cockpit_conversations').select('id, owner_id').or(`owner_id.eq.${moi.id},interlocuteur_id.eq.${moi.id}`).limit(1000),
    moi.estAdmin
      ? d.from('cockpit_reclamations').select('id', { count: 'exact', head: true }).eq('faculte_id', FACULTE).not('statut', 'in', '(resolu,cloturee)')
      : d.from('cockpit_reclamations').select('id', { count: 'exact', head: true }).eq('faculte_id', FACULTE).not('statut', 'in', '(resolu,cloturee)')
        .or(`created_by.eq.${moi.id},assignee_id.eq.${moi.id}`),
    moi.estAdmin
      ? d.from('cockpit_demandes').select('id', { count: 'exact', head: true }).eq('faculte_id', FACULTE).neq('statut', 'terminee')
      : d.from('cockpit_demandes').select('id', { count: 'exact', head: true }).eq('faculte_id', FACULTE).neq('statut', 'terminee')
        .or(`created_by.eq.${moi.id},assignee_id.eq.${moi.id}`),
    d.from('cockpit_notifications').select('id', { count: 'exact', head: true }).eq('user_id', moi.id).is('lu_at', null),
  ]);
  let messages = 0;
  const lignes = (convs.data ?? []) as Pick<Conversation, 'id' | 'owner_id'>[];
  const miennes = lignes.filter((c) => c.owner_id === moi.id).map((c) => c.id);
  const commeEnseignant = lignes.filter((c) => c.owner_id !== moi.id).map((c) => c.id);
  if (miennes.length > 0) {
    const { count } = await d.from('cockpit_messages').select('id', { count: 'exact', head: true })
      .in('conversation_id', miennes.slice(0, 300)).eq('sens', 'entrant').is('traite_at', null).eq('brouillon', false);
    messages += count ?? 0;
  }
  if (commeEnseignant.length > 0) {
    const { count } = await d.from('cockpit_messages').select('id', { count: 'exact', head: true })
      .in('conversation_id', commeEnseignant.slice(0, 300)).eq('sens', 'sortant').is('lu_at', null).eq('brouillon', false);
    messages += count ?? 0;
  }
  return {
    taches: (t1.count ?? 0) + (t2.count ?? 0),
    messages,
    reclamations: recl.count ?? 0,
    demandes: dem.count ?? 0,
    notifications: notif.count ?? 0,
  };
}

/** Météo de Paris (Open-Meteo, sans clé), mise en cache 30 min ; null si indisponible. */
export async function meteoParis(): Promise<{ temperature: number; code: number } | null> {
  try {
    const r = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=48.8566&longitude=2.3522&current=temperature_2m,weather_code&timezone=Europe%2FParis',
      { next: { revalidate: 1800 }, signal: AbortSignal.timeout(2500) },
    );
    if (!r.ok) return null;
    const j = (await r.json()) as { current?: { temperature_2m?: number; weather_code?: number } };
    if (typeof j.current?.temperature_2m !== 'number') return null;
    return { temperature: Math.round(j.current.temperature_2m), code: j.current.weather_code ?? 0 };
  } catch {
    return null;
  }
}
