import 'server-only';

import Anthropic from '@anthropic-ai/sdk';
import { usageToUsd } from '@/lib/ai/cost';
import type { AnthropicUsage } from '@/lib/ai/anthropic';
import {
  SCHEMA_REPONSE, jourDeLaSemaine, type EvenementExistant, type ReponseModele, type SpecialiteCatalogue,
} from './import-ia-regles';

/**
 * Import IA de l'agenda — appel du modèle.
 *
 * Chaque tour est SANS ÉTAT côté API : on renvoie le texte de l'admin, les
 * échanges (questions / réponses / demandes de modification) et la dernière
 * proposition, plutôt qu'une conversation multi-tours. La requête reste petite
 * et aucun bloc de raisonnement n'a à être rejoué.
 *
 * Coût maîtrisé :
 *  - effort `low` par défaut (AGENDA_IMPORT_EFFORT) : la tâche est une lecture
 *    de texte court ; la fiabilité vient des contrôles déterministes de
 *    `import-ia-regles.ts` (jour de la semaine, doublons, catalogue) ;
 *  - consignes + catalogue + agenda existant dans le `system`, mis en cache :
 *    les tours suivants d'un même import les relisent à 10 % du tarif ;
 *  - sortie JSON imposée (structured outputs) : jamais de relance pour une
 *    réponse mal formée.
 */

export const AGENDA_IMPORT_MODEL = 'claude-opus-5-5';
const EFFORTS = ['low', 'medium', 'high', 'xhigh', 'max'] as const;
type Effort = (typeof EFFORTS)[number];
const effortEnv = process.env.AGENDA_IMPORT_EFFORT?.trim();
const EFFORT: Effort = (EFFORTS as readonly string[]).includes(effortEnv ?? '') ? (effortEnv as Effort) : 'low';
const MAX_TOKENS = 16_000;
const DELAI_MS = 100_000;

export type Echange =
  | { genre: 'reponses'; questions: { question: string; reponse: string }[] }
  | { genre: 'modification'; consigne: string };

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (client) return client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY n’est pas configurée côté serveur.');
  client = new Anthropic({ apiKey, maxRetries: 1, timeout: DELAI_MS });
  return client;
}

const CONSIGNES = `Tu aides l'équipe de Major ECN (préparation aux ECN/EDN de médecine) à saisir les séances de cours en direct dans l'agenda de la plateforme. L'administrateur colle un texte libre (programme d'un intervenant, mail, liste…) ; tu le transformes en séances, champ par champ.

RÈGLE ABSOLUE : tu n'inventes rien. Dès que tu n'es pas certain à 100 % d'une valeur, tu poses une question au lieu de deviner.

Champs d'une séance :
- titre : le sujet de la séance, tel qu'écrit (corrige seulement les fautes évidentes). Ne répète pas la spécialité ni l'intervenant dans le titre.
- date : AAAA-MM-JJ. Quand l'année n'est pas écrite, prends la prochaine occurrence à partir d'aujourd'hui (une séance de janvier écrite en octobre est l'année suivante). Recopie dans jour_ecrit le jour de la semaine tel qu'il est écrit (« mercredi »), ou null. Vérifie toi-même la cohérence jour/date avec le calendrier fourni ; en cas de contradiction, demande.
- debut / fin : HH:MM. Un horaire commun (« 20h - 22h pour chaque séance ») s'applique à toutes les séances concernées. Pas d'horaire du tout → demande.
- intervenant : tel qu'écrit (« Dr Jean Michel »), null s'il n'y en a pas.
- spécialités : UNIQUEMENT des identifiants du catalogue ci-dessous (champ specialites), ou toutes_specialites = true si la séance concerne tout le monde (et seulement si le texte le dit). Un synonyme sans ambiguïté est accepté (« Radiologie » = Imagerie médicale, « Gynéco » = Gynécologie-obstétrique). Si deux entrées du catalogue peuvent convenir (ex. « Pédiatrie » et « MG · Pédiatrie », « Gynécologie-obstétrique » et « Gynécologie médicale »), ou si le nom ne correspond à rien, demande.
- formules (essentiel / intensif / approfondi) et voies (interne = QCM/DP, externe = QROC/DP-QROC) : qui verra la séance. Si le texte ne le dit pas, demande — en proposant comme choix ce qui a été fait pour les séances déjà programmées de la même spécialité ou du même intervenant (voir l'agenda existant).
- notes : informations utiles aux élèves présentes dans le texte (salle, matériel, « concours blanc : venir avec… »), sinon null.

Questions :
- Regroupe : une seule question pour plusieurs séances quand la réponse est la même (« Quelles formules pour les 3 séances de Radiologie ? »).
- Une question = un point précis, en français simple, avec des choix cliquables quand c'est possible (multiple = true si plusieurs choix peuvent se cumuler, ex. formules ou voies). Les choix de formules s'écrivent « Essentiel », « Intensif », « Approfondi » ; les voies « Interne », « Externe ».
- Pas de question sur ce qui est certain, ni sur un champ facultatif absent (intervenant, notes).

Réponse :
- statut = "questions" s'il reste au moins un doute : remplis questions, et mets dans seances ce que tu as déjà compris (laisse vide un champ incertain : liste vide ou null).
- statut = "proposition" quand tout est certain : questions = [], seances complètes.
- resume : une ou deux phrases pour l'administrateur (ce que tu as compris, ou ce qui bloque).
- ref : un identifiant court et stable par séance (s1, s2…), conservé d'un tour à l'autre.
- Quand l'administrateur demande une modification, applique-la à la proposition actuelle et renvoie la liste COMPLÈTE des séances (pas seulement celles modifiées). Il peut aussi demander d'ajouter ou de retirer des séances.
- L'agenda existant sert de contexte (habitudes, doublons) : n'y touche pas, ne le recopie pas.`;

function ligneExistant(e: EvenementExistant): string {
  const h = e.start_time ? `${e.start_time.slice(0, 5)}-${e.end_time?.slice(0, 5) ?? '?'}` : 'journée';
  const spe = e.scope_type === 'college' ? (e.scope_colleges ?? []).join(',') || '—' : 'toutes';
  return `${e.date} ${h} | ${e.title.trim()} | ${e.intervenant?.trim() || '—'} | ${spe} | ${(e.required_offers ?? []).join(',')} | ${(e.voies ?? []).join(',')}`;
}

/** Calendrier des 15 prochains mois : le modèle n'a pas à calculer les jours. */
function calendrier(aujourdHui: string): string {
  const [a, m] = aujourdHui.split('-').map(Number);
  const lignes: string[] = [];
  for (let i = 0; i < 15; i++) {
    const annee = a + Math.floor((m - 1 + i) / 12);
    const mois = ((m - 1 + i) % 12) + 1;
    const cle = `${annee}-${String(mois).padStart(2, '0')}-01`;
    const nom = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(annee, mois - 1, 1)));
    lignes.push(`${nom} : le 1er est un ${jourDeLaSemaine(cle)}`);
  }
  return lignes.join('\n');
}

function construireSysteme(ctx: { aujourdHui: string; catalogue: SpecialiteCatalogue[]; existants: EvenementExistant[] }): string {
  return [
    CONSIGNES,
    `<catalogue_specialites>\n${ctx.catalogue.map((s) => `${s.id} = ${s.nom}`).join('\n')}\n</catalogue_specialites>`,
    `<aujourdhui>${ctx.aujourdHui} (${jourDeLaSemaine(ctx.aujourdHui)})</aujourdhui>`,
    `<calendrier>\n${calendrier(ctx.aujourdHui)}\n</calendrier>`,
    `<agenda_existant format="date horaire | titre | intervenant | spécialités | formules | voies">\n${ctx.existants.map(ligneExistant).join('\n') || '(vide)'}\n</agenda_existant>`,
  ].join('\n\n');
}

function construireDemande(texte: string, echanges: Echange[], proposition: unknown[] | null): string {
  const parties = [`<texte_administrateur>\n${texte}\n</texte_administrateur>`];
  if (echanges.length) {
    const lignes = echanges.map((e, i) => (e.genre === 'reponses'
      ? `${i + 1}. Réponses de l'administrateur à tes questions :\n${e.questions.map((q) => `   - ${q.question} → ${q.reponse || '(sans réponse)'}`).join('\n')}`
      : `${i + 1}. Modification demandée par l'administrateur : ${e.consigne}`));
    parties.push(`<echanges>\n${lignes.join('\n')}\n</echanges>`);
  }
  if (proposition?.length) parties.push(`<proposition_actuelle>\n${JSON.stringify(proposition)}\n</proposition_actuelle>`);
  parties.push(echanges.length
    ? 'Tiens compte de TOUS les échanges ci-dessus (le dernier prime en cas de contradiction) et renvoie la réponse à jour.'
    : 'Analyse ce texte et renvoie ta réponse.');
  return parties.join('\n\n');
}

export type ResultatAppel = { reponse: ReponseModele; usd: number; usage: AnthropicUsage; model: string };

/** Un tour d'analyse. Lève une Error au message lisible par l'administrateur. */
export async function appelerImportAgenda(args: {
  texte: string;
  echanges: Echange[];
  proposition: unknown[] | null;
  aujourdHui: string;
  catalogue: SpecialiteCatalogue[];
  existants: EvenementExistant[];
}): Promise<ResultatAppel> {
  const c = getClient();
  let message;
  try {
    message = await c.beta.messages.create({
      model: AGENDA_IMPORT_MODEL,
      max_tokens: MAX_TOKENS,
      // Repli serveur si le modèle décline (classifieurs) : la requête est
      // rejouée sur le modèle recommandé, dans le même appel.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: [{ type: 'text', text: construireSysteme(args), cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: construireDemande(args.texte, args.echanges, args.proposition) }],
      output_config: { effort: EFFORT, format: { type: 'json_schema', schema: SCHEMA_REPONSE as unknown as Record<string, unknown> } },
    });
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError) throw new Error('Clé Anthropic refusée : vérifiez ANTHROPIC_API_KEY.');
    if (e instanceof Anthropic.RateLimitError) throw new Error('Service IA momentanément saturé : réessayez dans une minute.');
    if (e instanceof Anthropic.APIConnectionTimeoutError) throw new Error('L’IA a mis trop de temps à répondre : réessayez.');
    if (e instanceof Anthropic.BadRequestError) throw new Error(`Requête refusée par le service IA : ${e.message.slice(0, 200)}`);
    if (e instanceof Anthropic.APIError) throw new Error(`Service IA indisponible (${e.status ?? 'réseau'}) : réessayez.`);
    throw e;
  }

  const usage: AnthropicUsage = {
    input_tokens: message.usage.input_tokens,
    output_tokens: message.usage.output_tokens,
    cache_creation_input_tokens: message.usage.cache_creation_input_tokens ?? undefined,
    cache_read_input_tokens: message.usage.cache_read_input_tokens ?? undefined,
  };
  const usd = usageToUsd(usage, message.model);

  if (message.stop_reason === 'refusal') throw Object.assign(new Error('L’IA a refusé de traiter ce texte. Reformulez-le.'), { usd, usage, model: message.model });
  if (message.stop_reason === 'max_tokens') throw Object.assign(new Error('Texte trop long pour un seul import : découpez-le.'), { usd, usage, model: message.model });

  const texte = message.content.flatMap((b) => (b.type === 'text' ? [b.text] : [])).join('');
  let reponse: ReponseModele;
  try {
    reponse = JSON.parse(texte) as ReponseModele;
  } catch {
    throw Object.assign(new Error('Réponse de l’IA illisible : réessayez.'), { usd, usage, model: message.model });
  }
  return { reponse, usd, usage, model: message.model };
}
