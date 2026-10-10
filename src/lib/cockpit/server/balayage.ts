import 'server-only';
import { instantParis } from '@/lib/agenda/planning';
import { sendEmail, siteUrl } from '@/lib/email/send';
import { rappelTacheEmail } from '@/lib/email/cockpit';
import { estOuverte, libelleEcheance, prenomDe } from '../regles';
import { db, notifier } from './base';
import { reprendreEnvois } from './messagerie';

/**
 * Balayage du cockpit (cron toutes les 15 min) : rappels programmés,
 * échéances du jour regroupées en UNE notification (§10 : pas de saturation),
 * reprise des e-mails en échec sans doublon (C12, C15). Idempotent.
 */
export async function balayerCockpit(): Promise<{ rappels: number; echeances: number; envois: { repris: number; envoyes: number } }> {
  const d = db();
  const maintenant = new Date().toISOString();
  const aujourdHui = instantParis().date;

  // 1. Rappels échus.
  const { data: dus } = await d.from('cockpit_taches')
    .select('id, owner_id, assignee_id, titre, echeance, heure, statut')
    .lte('rappel_at', maintenant).is('rappel_envoye_at', null).is('archivee_at', null).limit(200);
  let rappels = 0;
  for (const t of (dus ?? []) as { id: string; owner_id: string; assignee_id: string | null; titre: string; echeance: string | null; heure: string | null; statut: string }[]) {
    // Marquer d'abord : un second balayage concurrent ne renvoie pas le rappel.
    const { data: pris } = await d.from('cockpit_taches').update({ rappel_envoye_at: maintenant })
      .eq('id', t.id).is('rappel_envoye_at', null).select('id').maybeSingle();
    if (!pris || !estOuverte(t.statut)) continue;
    rappels++;
    const lien = `/admin/cockpit/taches?t=${t.id}`;
    await notifier(d, { user_id: t.owner_id, genre: 'rappel', titre: `Rappel : ${t.titre}`, corps: libelleEcheance(t.echeance, aujourdHui, t.heure), lien, group_key: `rappel:${t.id}` });
    const { data: reglages } = await d.from('cockpit_reglages').select('email_rappels').eq('user_id', t.owner_id).maybeSingle();
    if (reglages?.email_rappels === false) continue;
    const { data: p } = await d.from('profiles').select('first_name, email').eq('id', t.owner_id).maybeSingle();
    if (!p?.email) continue;
    const mail = rappelTacheEmail({ prenom: prenomDe(p), titre: t.titre, echeance: t.echeance ? libelleEcheance(t.echeance, aujourdHui, t.heure) : null, lien: `${siteUrl()}${lien}` });
    await sendEmail({ to: p.email, subject: mail.subject, html: mail.html, text: mail.text, sansBcc: true, idempotencyKey: `cockpit-rappel-${t.id}-${maintenant.slice(0, 13)}`, timeoutMs: 15_000 })
      .catch((e) => console.error('[cockpit] rappel e-mail', e));
  }

  // 2. Échéances du jour : une seule notification par personne et par jour.
  const { data: echues } = await d.from('cockpit_taches')
    .select('owner_id, assignee_id')
    .eq('echeance', aujourdHui).in('statut', ['a_faire', 'en_cours', 'reportee', 'reponse_recue']).is('archivee_at', null).limit(5000);
  const parPersonne = new Map<string, number>();
  for (const t of (echues ?? []) as { owner_id: string; assignee_id: string | null }[]) {
    parPersonne.set(t.owner_id, (parPersonne.get(t.owner_id) ?? 0) + 1);
    if (t.assignee_id && t.assignee_id !== t.owner_id) parPersonne.set(t.assignee_id, (parPersonne.get(t.assignee_id) ?? 0) + 1);
  }
  let echeances = 0;
  for (const [userId, n] of parPersonne) {
    const { data: deja } = await d.from('cockpit_notifications').select('id').eq('user_id', userId).eq('group_key', `echeances:${aujourdHui}`).maybeSingle();
    if (deja) continue;
    echeances++;
    await notifier(d, {
      user_id: userId, genre: 'echeance',
      titre: n > 1 ? `${n} tâches arrivent à échéance aujourd’hui` : '1 tâche arrive à échéance aujourd’hui',
      lien: '/admin/cockpit/taches?vue=aujourdhui', group_key: `echeances:${aujourdHui}`,
    });
  }

  // 3. Reprise des e-mails en échec.
  const envois = await reprendreEnvois(d);
  return { rappels, echeances, envois };
}
