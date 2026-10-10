import 'server-only';
import { jourParis } from '@/lib/evc-calendrier/dates';
import { deciderInactivite } from '../inactivite';
import { moyenne, tauxParticipation } from '../indicateurs';
import { ACTION_INACTIVITE_LABEL, type Parametres } from '../parametres';
import { regrouper, type CommentaireRecurrence } from '../recurrence';
import { FAMILLE_LABEL, FAMILLES, type StatutEnvoi } from '../types';
import { journaliser, qdb, toutesLesLignes } from './base';
import { creerAlertes, type NouvelleAlerte } from './alertes';
import { chargerContextes, majEtatCandidat } from './candidats';
import { emailInactivite, notifier } from './communication';

/**
 * Surveillance continue (balayage) : inactivité (§12), récurrences (§16),
 * taux de réponse insuffisants (§25), dégradation progressive (§21).
 */

export type BilanInactivite = { evalues: number; paliers: number; emails: number; reinitialises: number; simulation?: { userId: string; action: string; jours: number }[] };

/**
 * `simuler` : calcule sans rien écrire ni envoyer (aperçu « qui serait contacté »
 * dans les paramètres, avant d'activer le module).
 */
export async function surveillerInactivite(params: Parametres, opts: { now?: number; simuler?: boolean } = {}): Promise<BilanInactivite> {
  const now = opts.now ?? Date.now();
  const bilan: BilanInactivite = { evalues: 0, paliers: 0, emails: 0, reinitialises: 0, simulation: opts.simuler ? [] : undefined };
  if (!opts.simuler && (!params.actif || !params.inactivite.actif)) return bilan;
  const db = qdb();
  const activites = await toutesLesLignes<{ user_id: string; last_activity: string | null }>((f, t) =>
    db.rpc('admin_activity_snapshot').order('user_id').range(f, t));
  const derniere = new Map(activites.map((a) => [a.user_id, a.last_activity]));
  const ctxs = Array.from((await chargerContextes({ now })).values()).filter((c) => !c.decouverte && c.actif);
  const aujourdHui = jourParis(now);
  let emails = 0;
  for (const c of ctxs) {
    bilan.evalues++;
    const act = derniere.get(c.userId) ?? null;
    const termine = (c.finFormation && c.finFormation < aujourdHui) || (c.derniereEpreuve && c.derniereEpreuve < aujourdHui) || false;
    const d = deciderInactivite(
      { derniereActivite: act, debutFormation: c.debutFormation, palierActuel: c.etat.inactivite_palier, palierAt: c.etat.inactivite_palier_at },
      params.inactivite, now,
      { pause: c.enPause, termine: !!termine, decouverte: c.decouverte, exclu: c.excluRelances },
    );
    if (opts.simuler) {
      if (d.type === 'palier') bilan.simulation!.push({ userId: c.userId, action: d.action, jours: d.jours });
      continue;
    }
    if (act !== c.etat.derniere_activite_at && d.type === 'rien') await majEtatCandidat(c.userId, { derniere_activite_at: act });
    if (d.type === 'reinitialiser') {
      await majEtatCandidat(c.userId, { derniere_activite_at: act, inactivite_palier: 0, inactivite_palier_at: null });
      await journaliser({ objet_type: 'inactivite', objet_id: c.userId, action: 'reprise_activite', user_id: c.userId });
      bilan.reinitialises++;
      continue;
    }
    if (d.type !== 'palier') continue;
    const veutEmail = d.action !== 'signalement' && !!c.email;
    if (veutEmail && emails >= params.inactivite.max_emails_par_passage) continue; // repris au passage suivant
    const iso = new Date(now).toISOString();
    const cle = `${c.userId}-${d.palier}-${(act ?? c.debutFormation ?? '').slice(0, 10)}`;
    let emailOk = false;
    if (veutEmail) {
      const r = await emailInactivite({ userId: c.userId, to: c.email as string, prenom: c.prenom, action: d.action, jours: d.jours, progression: c.etat.progression_pedago, cle });
      emailOk = r.ok;
      if (r.ok) emails++;
    }
    if (d.action !== 'signalement') {
      await notifier([{
        userId: c.userId, groupKey: 'qualite:inactivite', kind: 'inactivite',
        titre: d.action === 'accompagnement' ? 'Un accompagnement individuel vous est proposé' : 'Votre préparation vous attend',
        corps: `Aucune activité depuis ${d.jours} jours.`, ctaLabel: 'Reprendre', ctaHref: '/accueil',
      }]);
    }
    await db.from('qualite_interventions').insert({
      user_id: c.userId, type: 'relance', statut: 'realisee', realisee_at: iso, signale_at: iso,
      action: `${ACTION_INACTIVITE_LABEL[d.action]} (inactivité de ${d.jours} jours)${veutEmail ? (emailOk ? ' — e-mail envoyé' : ' — e-mail en échec') : ''}`,
      traite_par_nom: 'Traitement automatique',
    });
    if (d.action === 'signalement' || d.action === 'accompagnement') {
      await creerAlertes([{
        niveau: 'vigilance', type: 'inactivite', cle: `inactivite:${cle}`, user_id: c.userId,
        titre: `${d.jours} jours sans activité pédagogique`,
        detail: d.action === 'accompagnement' ? "Proposition d'accompagnement individuel envoyée au candidat : prendre contact." : 'Signalement au suivi administratif.',
      }]);
      const { data: ex } = await db.from('qualite_difficultes').select('id').eq('user_id', c.userId).eq('cle_dedup', 'inactivite').in('statut', ['ouverte', 'en_cours']).maybeSingle();
      if (ex) await db.from('qualite_difficultes').update({ niveau: d.action === 'accompagnement' ? 'prioritaire' : 'persistante', derniere_at: iso, updated_at: iso }).eq('id', (ex as { id: string }).id);
      else await db.from('qualite_difficultes').insert({ user_id: c.userId, source: 'inactivite', categorie: 'engagement', libelle: 'Inactivité prolongée', cle_dedup: 'inactivite', niveau: d.action === 'accompagnement' ? 'prioritaire' : 'persistante', detail: `${d.jours} jours sans activité` });
    }
    await majEtatCandidat(c.userId, { derniere_activite_at: act, inactivite_palier: d.palier, inactivite_palier_at: iso });
    await journaliser({ objet_type: 'inactivite', objet_id: c.userId, action: d.action, user_id: c.userId, details: { jours: d.jours, palier: d.palier, ignores: d.ignores, email: veutEmail ? emailOk : null } });
    bilan.paliers++;
  }
  bilan.emails = emails;
  return bilan;
}

export async function detecterRecurrences(params: Parametres, now = Date.now()): Promise<number> {
  const db = qdb();
  const depuis = new Date(now - Math.max(params.alertes.recurrence_jours, 90) * 86_400_000).toISOString();
  const coms = await toutesLesLignes<CommentaireRecurrence>((f, t) => db.from('qualite_commentaires')
    .select('id, user_id, theme_cle, sentiment, created_at, enseignant_cle, enseignant_nom, contenu_id, contenu_label, seance_id')
    .gte('created_at', depuis).in('sentiment', ['negatif', 'mixte']).not('theme_cle', 'is', null).order('id').range(f, t));
  const groupes = regrouper(coms, { now, seuil: params.alertes.recurrence_seuil, fenetreJours: params.alertes.recurrence_jours });
  const mois = jourParis(now).slice(0, 7);
  const alertes: NouvelleAlerte[] = groupes.filter((g) => g.depasseSeuil).map((g) => ({
    niveau: 'recurrence', type: 'recurrence', cle: `recurrence:${g.cle}:${mois}`,
    titre: `${g.themeLibelle}${g.cibleLabel ? ` — ${g.cibleLabel}` : ''} : ${g.candidatsFenetre} candidats en ${params.alertes.recurrence_jours} jours`,
    detail: `${g.commentaires.length} remarque(s), ${g.seances.length} séance(s) concernée(s), du ${g.premier.slice(0, 10)} au ${g.dernier.slice(0, 10)}.`,
    theme_cle: g.themeCle,
    enseignant_cle: g.portee === 'enseignant' ? g.cible : null, enseignant_nom: g.portee === 'enseignant' ? g.cibleLabel : null,
    contenu_id: g.portee === 'contenu' ? g.cible : null, contenu_label: g.portee === 'contenu' ? g.cibleLabel : null,
    donnees: { groupe: g.cle, commentaires: g.commentaires.slice(0, 200), seances: g.seances, evolution: g.evolution },
  }));
  return (await creerAlertes(alertes)).length;
}

export async function surveillerTauxEtDegradations(params: Parametres, now = Date.now()): Promise<number> {
  const db = qdb();
  const depuis = new Date(now - 30 * 86_400_000).toISOString();
  const envois = await toutesLesLignes<{ famille: string; statut: StatutEnvoi }>((f, t) => db.from('qualite_envois')
    .select('famille, statut').gte('programme_pour', depuis).lte('programme_pour', new Date(now - 3 * 86_400_000).toISOString()).order('id').range(f, t));
  const semaine = jourParis(now - ((new Date(now).getUTCDay() + 6) % 7) * 86_400_000);
  const alertes: NouvelleAlerte[] = [];
  for (const fam of FAMILLES) {
    const t = tauxParticipation(envois.filter((e) => e.famille === fam));
    if (t.total >= params.alertes.taux_reponse_effectif_min && t.pct !== null && t.pct < params.alertes.taux_reponse_min) {
      alertes.push({
        niveau: 'vigilance', type: 'taux_reponse', cle: `taux:${fam}:${semaine}`,
        titre: `Taux de réponse insuffisant : ${FAMILLE_LABEL[fam]} (${t.pct} %)`,
        detail: `${t.n} réponse(s) sur ${t.total} questionnaire(s) attendu(s) sur 30 jours (seuil ${params.alertes.taux_reponse_min} %).`,
        donnees: { famille: fam, ...t },
      });
    }
  }
  // Dégradation progressive : moyenne d'un enseignant sur 30 j en baisse d'au moins 0,5 point vs les 30 j précédents.
  const reps = await toutesLesLignes<{ enseignant_cle: string | null; enseignant_nom: string | null; note_globale: number | null; soumis_at: string }>((f, t) => db.from('qualite_reponses')
    .select('enseignant_cle, enseignant_nom, note_globale, soumis_at').eq('famille', 'HOT').not('enseignant_cle', 'is', null)
    .gte('soumis_at', new Date(now - 60 * 86_400_000).toISOString()).order('id').range(f, t));
  const parEns = new Map<string, typeof reps>();
  for (const r of reps) (parEns.get(r.enseignant_cle as string) ?? parEns.set(r.enseignant_cle as string, []).get(r.enseignant_cle as string)!).push(r);
  const mois = jourParis(now).slice(0, 7);
  for (const [cle, lignes] of parEns) {
    const recent = moyenne(lignes.filter((l) => l.soumis_at >= depuis).map((l) => l.note_globale));
    const avant = moyenne(lignes.filter((l) => l.soumis_at < depuis).map((l) => l.note_globale));
    if (recent.n >= 5 && avant.n >= 5 && recent.moyenne !== null && avant.moyenne !== null && avant.moyenne - recent.moyenne >= 0.5) {
      alertes.push({
        niveau: 'vigilance', type: 'degradation', cle: `degradation:${cle}:${mois}`, enseignant_cle: cle, enseignant_nom: lignes[0].enseignant_nom,
        titre: `Baisse des notes : ${lignes[0].enseignant_nom ?? cle} (${avant.moyenne} → ${recent.moyenne})`,
        detail: `Moyenne des 30 derniers jours (${recent.n} réponses) contre les 30 jours précédents (${avant.n} réponses).`,
      });
    }
  }
  return (await creerAlertes(alertes)).length;
}
