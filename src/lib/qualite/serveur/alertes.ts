import 'server-only';
import { siteUrl } from '@/lib/email/send';
import type { NiveauAlerte, TypeAlerte } from '../types';
import { journaliser, lireParametres, qdb } from './base';
import { emailAlertesDirection } from './communication';

/**
 * Alertes (§21) : création dédupliquée (clé unique), e-mail immédiat à la
 * direction pour les alertes critiques (paramétrable), récapitulatif
 * quotidien des alertes de vigilance et de récurrence.
 */

export type NouvelleAlerte = {
  niveau: NiveauAlerte;
  type: TypeAlerte;
  titre: string;
  detail?: string | null;
  cle: string;
  user_id?: string | null;
  seance_id?: string | null;
  enseignant_cle?: string | null;
  enseignant_nom?: string | null;
  contenu_type?: string | null;
  contenu_id?: string | null;
  contenu_label?: string | null;
  theme_cle?: string | null;
  reponse_id?: string | null;
  commentaire_id?: string | null;
  donnees?: Record<string, unknown>;
};

/** Crée les alertes absentes ; renvoie celles réellement créées. */
export async function creerAlertes(alertes: NouvelleAlerte[]): Promise<{ id: string; niveau: NiveauAlerte; titre: string; detail: string | null; user_id: string | null }[]> {
  if (!alertes.length) return [];
  const rows = alertes.map((a) => ({
    niveau: a.niveau, type: a.type, titre: a.titre.slice(0, 300), detail: a.detail ?? null, cle_dedup: a.cle,
    user_id: a.user_id ?? null, seance_id: a.seance_id ?? null, enseignant_cle: a.enseignant_cle ?? null, enseignant_nom: a.enseignant_nom ?? null,
    contenu_type: a.contenu_type ?? null, contenu_id: a.contenu_id ?? null, contenu_label: a.contenu_label ?? null, theme_cle: a.theme_cle ?? null,
    reponse_id: a.reponse_id ?? null, commentaire_id: a.commentaire_id ?? null, donnees: a.donnees ?? {},
  }));
  const { data, error } = await qdb().from('qualite_alertes')
    .upsert(rows, { onConflict: 'cle_dedup', ignoreDuplicates: true })
    .select('id, niveau, titre, detail, user_id, type');
  if (error) { console.error('[qualite] alertes :', error.message); return []; }
  const crees = (data ?? []) as { id: string; niveau: NiveauAlerte; titre: string; detail: string | null; user_id: string | null; type: string }[];
  if (crees.length) {
    await journaliser(crees.map((a) => ({ objet_type: 'alerte', objet_id: a.id, action: 'creee', user_id: a.user_id, details: { niveau: a.niveau, type: a.type } })));
  }
  return crees;
}

/** E-mail immédiat des alertes critiques non encore envoyées. */
export async function envoyerAlertesCritiques(): Promise<number> {
  const params = await lireParametres();
  if (!params.alertes.email_critique || !params.alertes.destinataires.length) return 0;
  const db = qdb();
  const { data } = await db.from('qualite_alertes').select('id, titre, detail, created_at')
    .eq('niveau', 'critique').is('email_envoye_at', null).eq('statut', 'nouvelle').order('created_at').limit(50);
  const lignes = (data ?? []) as { id: string; titre: string; detail: string | null; created_at: string }[];
  if (!lignes.length) return 0;
  const r = await emailAlertesDirection({
    to: params.alertes.destinataires,
    sujet: lignes.length > 1 ? `${lignes.length} alertes qualité critiques` : `Alerte qualité critique : ${lignes[0].titre}`,
    lignes: lignes.map((l) => ({ titre: l.titre, detail: l.detail, lien: `${siteUrl()}/admin/qualite/alertes?id=${l.id}` })),
    cle: `critiques-${lignes.map((l) => l.id).join('').slice(0, 64)}-${lignes.length}`,
  });
  if (!r.ok) { console.error('[qualite] e-mail critique :', 'error' in r ? r.error : ''); return 0; }
  await db.from('qualite_alertes').update({ email_envoye_at: new Date().toISOString() }).in('id', lignes.map((l) => l.id));
  await journaliser({ objet_type: 'alerte', action: 'email_direction', details: { ids: lignes.map((l) => l.id), destinataires: params.alertes.destinataires.length } });
  return lignes.length;
}

/** Récapitulatif quotidien (vigilance + récurrence), une fois par jour à partir de 7 h (Paris). */
export async function envoyerRecapitulatif(jour: string): Promise<number> {
  const params = await lireParametres();
  if (!params.alertes.recap_vigilance || !params.alertes.destinataires.length) return 0;
  const db = qdb();
  const { data } = await db.from('qualite_alertes').select('id, titre, detail, niveau')
    .in('niveau', ['vigilance', 'recurrence']).is('recap_at', null).in('statut', ['nouvelle', 'en_cours']).order('created_at').limit(200);
  const lignes = (data ?? []) as { id: string; titre: string; detail: string | null; niveau: string }[];
  if (!lignes.length) return 0;
  const r = await emailAlertesDirection({
    to: params.alertes.destinataires,
    sujet: `Qualité : ${lignes.length} alerte(s) de vigilance à examiner`,
    lignes: lignes.map((l) => ({ titre: `${l.niveau === 'recurrence' ? '[Récurrence] ' : ''}${l.titre}`, detail: l.detail, lien: `${siteUrl()}/admin/qualite/alertes?id=${l.id}` })),
    cle: `recap-${jour}`,
  });
  if (!r.ok) return 0;
  await db.from('qualite_alertes').update({ recap_at: new Date().toISOString() }).in('id', lignes.map((l) => l.id));
  await journaliser({ objet_type: 'alerte', action: 'recapitulatif_quotidien', details: { jour, n: lignes.length } });
  return lignes.length;
}
