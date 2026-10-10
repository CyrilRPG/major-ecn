import 'server-only';
import { sendEmail, siteUrl, INTERNAL_NOTIFY_EMAILS } from '@/lib/email/send';
import {
  alerteInterneEmail, annonceImportanteEmail, messageModerationEmail, questionAdresseeEmail, questionEnAttenteEmail,
} from '@/lib/email/echanges';
import { nomEleve } from '../regles';
import { db, environnement, extrait, journaliser, parametres } from './base';
import { identitesDe } from './identites';

/**
 * Boîte d'envoi des e-mails du module (table `echanges_emails`, CDC §87-88).
 *
 *  · chaque e-mail a une clé unique (`tag:<id>:initial`, `tag:<id>:relance`…) :
 *    double clic, retry serveur, job rejoué → jamais deux e-mails ;
 *  · la réservation est atomique (`echanges_emails_reserver`, SKIP LOCKED) et
 *    la clé est aussi transmise à Resend comme clé d'idempotence ;
 *  · le contenu est construit AU MOMENT de l'envoi : une question supprimée
 *    ou déjà traitée annule l'e-mail (R12, R39) ;
 *  · statut technique : envoyee | echec (après 5 tentatives) | annulee |
 *    simulee (hors production, §143). Un échec n'est jamais présenté comme un
 *    envoi réussi (§87, R42).
 */

const MAX_TENTATIVES = 5;
const ATTENTES_MIN = [1, 5, 15, 60, 180];

type LigneEmail = {
  id: string; cle: string; type: string; tag_id: string | null; groupe_id: string | null;
  destinataire_id: string | null; destinataire_email: string | null; donnees: Record<string, unknown>; tentatives: number;
};

type Contenu = { to: string[]; subject: string; html: string; text: string } | { annuler: string };

export function lienMessage(messageId: string): string {
  return `${siteUrl()}/echanges/m/${messageId}`;
}

async function contenuTag(e: LigneEmail): Promise<Contenu> {
  const { data: t } = await db().from('echanges_tags')
    .select('id, message_id, groupe_id, affectation_id, enseignant_id, eleve_id, statut, tag_at')
    .eq('id', e.tag_id).maybeSingle();
  if (!t) return { annuler: 'Question introuvable' };
  if (e.type !== 'tag_reaffectation' && t.statut !== 'en_attente') return { annuler: 'Question déjà traitée ou annulée' };
  const [{ data: m }, { data: g }, prm] = await Promise.all([
    db().from('echanges_messages').select('id, contenu, contexte, supprime_at').eq('id', t.message_id).maybeSingle(),
    db().from('echanges_groupes').select('nom, promotion, specialite_nom, statut').eq('id', t.groupe_id).maybeSingle(),
    parametres(),
  ]);
  if (!m || m.supprime_at) return { annuler: 'Question supprimée par son auteur' };
  if (!g) return { annuler: 'Groupe introuvable' };
  const lien = lienMessage(m.id);

  if (e.type === 'tag_escalade' || e.type === 'tag_reaffectation') {
    const ids = await identitesDe([t.enseignant_id]);
    const ens = ids.get(t.enseignant_id)?.prenom_public ?? 'Enseignant';
    const r = alerteInterneEmail({
      sujet: e.type === 'tag_escalade' ? 'Major ECN — Question sans réponse (escalade)' : 'Major ECN — Question à réaffecter',
      titre: e.type === 'tag_escalade' ? `Question toujours sans réponse après ${prm.escalade_heures} h` : 'Un enseignant a été retiré : question en attente',
      lignes: [['Groupe', g.nom], ['Enseignant', ens], ['Posée le', new Date(t.tag_at).toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })]],
      texte: m.contenu,
      lien: `${siteUrl()}/admin/echanges/questions`,
      bouton: 'Ouvrir les questions enseignants',
    });
    return { to: INTERNAL_NOTIFY_EMAILS, ...r };
  }

  // Destinataire : l'enseignant tagué, s'il est toujours autorisé dans ce groupe.
  const { data: aff } = await db().from('echanges_enseignants')
    .select('id, actif, email_notification').eq('groupe_id', t.groupe_id).eq('user_id', t.enseignant_id).maybeSingle();
  if (!aff || !aff.actif) return { annuler: 'Enseignant retiré du groupe' };
  const [{ data: prof }, ids, { data: eleve }] = await Promise.all([
    db().from('profiles').select('email, is_active').eq('id', t.enseignant_id).maybeSingle(),
    identitesDe([t.enseignant_id]),
    t.eleve_id ? db().from('profiles').select('first_name, last_name, pseudo').eq('id', t.eleve_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  if (!prof || prof.is_active === false) return { annuler: 'Compte enseignant inactif' };
  const to = (aff.email_notification || prof.email || '').trim();
  if (!to.includes('@')) return { annuler: 'Adresse de notification absente' };
  const prenom = ids.get(t.enseignant_id)?.prenom_public ?? '';
  const ctx = m.contexte as { titre?: string } | null;
  if (e.type === 'tag_relance') {
    return { to: [to], ...questionEnAttenteEmail({ prenomEnseignant: prenom, heures: prm.relance_heures, groupe: g.nom, promotion: g.promotion, question: m.contenu ?? '', lien }) };
  }
  return {
    to: [to],
    ...questionAdresseeEmail({
      prenomEnseignant: prenom,
      formation: g.specialite_nom,
      promotion: g.promotion,
      groupe: g.nom,
      eleve: eleve ? nomEleve(eleve, prm.affichage_eleves) : 'Candidat',
      question: m.contenu ?? '',
      contexte: ctx?.titre ?? null,
      lien,
    }),
  };
}

async function contenu(e: LigneEmail): Promise<Contenu> {
  if (e.type.startsWith('tag_')) return contenuTag(e);
  const d = e.donnees ?? {};
  if (e.type === 'avertissement' || e.type === 'sanction' || e.type === 'annonce_importante') {
    if (!e.destinataire_id) return { annuler: 'Destinataire absent' };
    const { data: p } = await db().from('profiles').select('email, first_name, is_active').eq('id', e.destinataire_id).maybeSingle();
    if (!p?.email || p.is_active === false) return { annuler: 'Compte inactif ou sans adresse' };
    if (e.type === 'annonce_importante') {
      return { to: [p.email], ...annonceImportanteEmail({ prenom: p.first_name, groupe: String(d.groupe ?? 'votre promotion'), message: String(d.message ?? ''), lien: String(d.lien ?? `${siteUrl()}/echanges`) }) };
    }
    return { to: [p.email], ...messageModerationEmail({ prenom: p.first_name, titre: String(d.titre ?? 'Message de l’équipe'), message: String(d.message ?? ''), lien: `${siteUrl()}/echanges` }) };
  }
  if (e.type === 'archivage_alerte' || e.type === 'blocage_alerte') {
    const r = alerteInterneEmail({
      sujet: String(d.sujet ?? 'Major ECN — Échanges'),
      titre: String(d.titre ?? 'Information'),
      lignes: (Array.isArray(d.lignes) ? d.lignes : []) as [string, string][],
      texte: (d.texte as string | null) ?? null,
      lien: String(d.lien ?? `${siteUrl()}/admin/echanges`),
      bouton: String(d.bouton ?? 'Ouvrir le back-office'),
    });
    return { to: INTERNAL_NOTIFY_EMAILS, ...r };
  }
  return { annuler: `Type inconnu : ${e.type}` };
}

async function marquer(id: string, champs: Record<string, unknown>) {
  await db().from('echanges_emails').update({ ...champs, verrou_at: null }).eq('id', id);
}

export type BilanBoite = { envoyes: number; simules: number; annules: number; echecs: number; reportes: number };

/** Traite la boîte d'envoi (cron toutes les 5 min, et juste après une publication). */
export async function traiterBoite(limite = 50): Promise<BilanBoite> {
  const bilan: BilanBoite = { envoyes: 0, simules: 0, annules: 0, echecs: 0, reportes: 0 };
  const { data, error } = await db().rpc('echanges_emails_reserver', { p_limite: limite });
  if (error) {
    await journaliser('erreur', 'email', 'Réservation des e-mails impossible', { erreur: error.message });
    return bilan;
  }
  const env = environnement();
  for (const e of (data ?? []) as LigneEmail[]) {
    let c: Contenu;
    try {
      c = await contenu(e);
    } catch (err) {
      c = { annuler: '' };
      await reporter(e, `Construction impossible : ${String(err)}`, bilan);
      continue;
    }
    if ('annuler' in c) {
      await marquer(e.id, { statut: 'annulee', derniere_erreur: c.annuler });
      bilan.annules += 1;
      continue;
    }
    let to = c.to;
    let subject = c.subject;
    if (env !== 'production') {
      const redirection = (process.env.ECHANGES_EMAIL_REDIRECT ?? '').trim();
      if (!redirection) {
        await marquer(e.id, { statut: 'simulee', envoyee_at: new Date().toISOString(), destinataire_email: to.join(', '), derniere_erreur: `Environnement ${env} : envoi simulé` });
        bilan.simules += 1;
        continue;
      }
      to = [redirection];
      subject = `[TEST ${env}] ${subject}`;
    }
    const res = await sendEmail({ to, subject, html: c.html, text: c.text, idempotencyKey: `echanges-${e.cle}`, sansBcc: true })
      .catch((err) => ({ ok: false as const, error: String(err) }));
    if (res.ok) {
      await marquer(e.id, { statut: 'envoyee', envoyee_at: new Date().toISOString(), fournisseur_id: res.id, destinataire_email: to.join(', '), derniere_erreur: null });
      bilan.envoyes += 1;
    } else {
      await reporter(e, res.error, bilan);
    }
  }
  return bilan;
}

async function reporter(e: LigneEmail, erreur: string, bilan: BilanBoite) {
  if (e.tentatives >= MAX_TENTATIVES) {
    await marquer(e.id, { statut: 'echec', derniere_erreur: extrait(erreur, 400) });
    bilan.echecs += 1;
    await journaliser('erreur', 'email', `E-mail en échec définitif (${e.type})`, { cle: e.cle, erreur: extrait(erreur, 300) });
    return;
  }
  const minutes = ATTENTES_MIN[Math.min(e.tentatives, ATTENTES_MIN.length - 1)];
  await marquer(e.id, { prochaine_tentative_at: new Date(Date.now() + minutes * 60_000).toISOString(), derniere_erreur: extrait(erreur, 400) });
  bilan.reportes += 1;
  await journaliser('alerte', 'email', `E-mail reporté (${e.type}, tentative ${e.tentatives})`, { cle: e.cle, erreur: extrait(erreur, 300) });
}

/** Met un e-mail en file (idempotent par clé). */
export async function enfiler(e: { cle: string; type: string; tagId?: string | null; groupeId?: string | null; destinataireId?: string | null; donnees?: Record<string, unknown> }) {
  const { error } = await db().from('echanges_emails').upsert({
    cle: e.cle, type: e.type, tag_id: e.tagId ?? null, groupe_id: e.groupeId ?? null,
    destinataire_id: e.destinataireId ?? null, donnees: e.donnees ?? {},
  }, { onConflict: 'cle', ignoreDuplicates: true });
  if (error) await journaliser('erreur', 'email', 'Mise en file impossible', { cle: e.cle, erreur: error.message });
}
