import 'server-only';
import { callClaude, extractJson, FAST_MODEL } from '@/lib/ai/anthropic';
import { THEMES } from '../analyse-regles';
import { CATEGORIES, CONTENUS_TYPES, GRAVITES, NATURES_COMMENTAIRE, SENTIMENTS } from '../types';
import { journaliser, lireParametres, qdb } from './base';
import { creerAlertes } from './alertes';

/**
 * Analyse des commentaires par intelligence artificielle (§15).
 *
 *   - le texte original n'est JAMAIS envoyé modifié ni réécrit en base ;
 *   - la classification produite remplace celle des règles, sauf si
 *     l'administration l'a corrigée (une correction humaine fait foi) ;
 *   - les thèmes restent pris dans le vocabulaire fermé (regroupements §16) ;
 *   - aucune donnée nominative n'est transmise (ni nom, ni e-mail : seulement
 *     le texte, la note et le contexte pédagogique).
 */

const CODES = CATEGORIES.flatMap((c) => c.sous.map((s) => `${c.cle}:${s.cle}`));

const SYSTEM = `Tu classes des commentaires de candidats sur une formation de préparation aux épreuves de vérification des connaissances (EVC) de médecine. Tu réponds UNIQUEMENT en JSON : un tableau d'objets, un par commentaire, dans l'ordre reçu.

Pour chaque commentaire :
- "id" : l'identifiant reçu
- "sentiment" : ${SENTIMENTS.join(' | ')} — un commentaire qui signale un problème est "negatif" (ou "mixte" s'il contient aussi un éloge), MÊME si la note est élevée
- "theme" : la clé du thème principal parmi la liste fournie, ou null si aucun ne convient
- "categories" : 0 à 3 codes parmi la liste fournie (le principal en premier)
- "sujet" : le sujet principal en 3 à 8 mots
- "gravite" : ${GRAVITES.join(' | ')} (critique = réclamation formelle, propos graves, demande de remboursement, mise en cause d'une personne)
- "demande_intervention" : true si le candidat demande explicitement une action, un contact ou une réponse
- "nature" : ${NATURES_COMMENTAIRE.join(' | ')} (assistance = problème technique ou d'accès à régler ; reclamation = insatisfaction formelle ou demande de résolution)
- "contenu_type" : ${CONTENUS_TYPES.join(' | ')} ou null — l'élément pédagogique précis visé, s'il y en a un
- "contenu_label" : la désignation du contenu visé telle qu'écrite (ex. « QCM 12 de cardiologie ») ou null

Thèmes (clé : libellé) :
${THEMES.map((t) => `${t.cle} : ${t.libelle}`).join('\n')}

Codes de catégories :
${CODES.join(', ')}`;

type Sortie = {
  id: string; sentiment: string; theme: string | null; categories: string[]; sujet: string | null; gravite: string;
  demande_intervention: boolean; nature: string; contenu_type: string | null; contenu_label: string | null;
};

type Commentaire = {
  id: string; reponse_id: string | null; question_id: string | null; texte: string; note_associee: number | null; famille: string; question_libelle: string | null;
  user_id: string | null; seance_id: string | null; enseignant_cle: string | null; enseignant_nom: string | null; sentiment: string | null; gravite: string | null;
};

export async function analyserCommentairesIA(max = 40): Promise<{ analyses: number; erreur?: string }> {
  const params = await lireParametres();
  if (!params.ia.actif || !process.env.ANTHROPIC_API_KEY) return { analyses: 0 };
  const db = qdb();
  const { data } = await db.from('qualite_commentaires')
    .select('id, reponse_id, question_id, texte, note_associee, famille, question_libelle, user_id, seance_id, enseignant_cle, enseignant_nom, sentiment, gravite')
    .is('analyse_ia_at', null).is('corrige_par', null).order('created_at').limit(max);
  const lot = (data ?? []) as Commentaire[];
  if (!lot.length) return { analyses: 0 };
  const entree = lot.map((c) => ({ id: c.id, questionnaire: c.famille, question: c.question_libelle, note_globale: c.note_associee, texte: c.texte.slice(0, 2000) }));
  const now = new Date().toISOString();
  let sorties: Sortie[];
  try {
    const r = await callClaude({ system: SYSTEM, cacheSystem: true, user: JSON.stringify(entree), model: FAST_MODEL, maxTokens: 6000, temperature: 0 });
    sorties = extractJson<Sortie[]>(r.text);
    if (!Array.isArray(sorties)) throw new Error('Réponse IA inattendue');
  } catch (err) {
    const msg = err instanceof Error ? err.message.slice(0, 300) : 'Erreur IA';
    // On marque l'échec pour ne pas reboucler indéfiniment sur le même lot ; les règles restent en place.
    await db.from('qualite_commentaires').update({ analyse_ia_at: now, analyse_ia_erreur: msg }).in('id', lot.map((c) => c.id));
    return { analyses: 0, erreur: msg };
  }
  const themes = new Map(THEMES.map((t) => [t.cle, t]));
  const parId = new Map(sorties.map((s) => [s.id, s]));
  const alertes = [];
  let n = 0;
  for (const c of lot) {
    const s = parId.get(c.id);
    if (!s) { await db.from('qualite_commentaires').update({ analyse_ia_at: now, analyse_ia_erreur: 'absent de la réponse IA' }).eq('id', c.id); continue; }
    const sentiment = (SENTIMENTS as readonly string[]).includes(s.sentiment) ? s.sentiment : c.sentiment;
    const gravite = (GRAVITES as readonly string[]).includes(s.gravite) ? s.gravite : c.gravite;
    const theme = s.theme && themes.has(s.theme) ? s.theme : null;
    const patch = {
      sentiment, gravite,
      theme_cle: theme, theme_libelle: theme ? themes.get(theme)!.libelle : null,
      categories: (Array.isArray(s.categories) ? s.categories : []).filter((x) => CODES.includes(x)).slice(0, 3),
      sujet: typeof s.sujet === 'string' ? s.sujet.slice(0, 120) : null,
      demande_intervention: !!s.demande_intervention,
      nature: (NATURES_COMMENTAIRE as readonly string[]).includes(s.nature) ? s.nature : 'remarque',
      contenu_type: s.contenu_type && (CONTENUS_TYPES as readonly string[]).includes(s.contenu_type) ? s.contenu_type : null,
      contenu_label: typeof s.contenu_label === 'string' ? s.contenu_label.slice(0, 200) : null,
      analyse_source: 'ia', analyse_ia_at: now, analyse_at: now, analyse_ia_erreur: null,
    };
    // `corrige_par is null` : une correction humaine survenue entre-temps n'est jamais écrasée.
    const { data: ok } = await db.from('qualite_commentaires').update(patch).eq('id', c.id).is('corrige_par', null).select('id');
    if (!ok?.length) continue;
    n++;
    // L'IA a vu un problème que les règles avaient manqué : alerte (dédupliquée avec celle des règles).
    if ((sentiment === 'negatif' || sentiment === 'mixte') && gravite !== 'faible' && c.reponse_id) {
      alertes.push({
        niveau: gravite === 'critique' ? 'critique' as const : 'vigilance' as const,
        type: 'commentaire_negatif' as const,
        cle: `commentaire:${c.reponse_id}:${c.question_id}`,
        titre: patch.nature === 'reclamation' ? 'Réclamation exprimée dans une enquête' : `Remarque négative${patch.theme_libelle ? ` : ${patch.theme_libelle.toLowerCase()}` : ''}`,
        detail: `« ${c.texte.slice(0, 200)} »`,
        user_id: c.user_id, seance_id: c.seance_id, enseignant_cle: c.enseignant_cle, enseignant_nom: c.enseignant_nom,
        reponse_id: c.reponse_id, commentaire_id: c.id, theme_cle: theme, contenu_type: patch.contenu_type, contenu_label: patch.contenu_label,
      });
    }
  }
  if (alertes.length) await creerAlertes(alertes);
  await journaliser({ objet_type: 'commentaire', action: 'analyse_ia', details: { n, lot: lot.length } });
  return { analyses: n };
}
