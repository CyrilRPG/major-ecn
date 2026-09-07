/**
 * Audit des corrigés QCM — règles PURES : construction des requêtes soumises
 * par lots au modèle, lecture de ses réponses, estimation du coût.
 *
 * Ce que l'on cherche : une proposition dont la clé (`is_correct`) contredit
 * ce que sa justification affirme, EN TENANT COMPTE du sens de la question
 * (« quelles propositions sont fausses ? » inverse la lecture). C'est la
 * défaillance signalée par un élève le 06/09/2026 (DP Gériatrie 8, item D :
 * clé « faux », justification qui démontre le vrai) et retrouvée sur dix
 * autres propositions par le seul examen des justifications commençant par
 * « Vrai » / « Faux ». Les 316 000 autres n'ont pas de marqueur : il faut les
 * lire, ce que fait le modèle, question par question.
 */

export const QCM_AUDIT_MODEL_DEFAUT = 'claude-haiku-4-5';
/** Questions par requête : assez pour amortir le prompt, assez peu pour une
 *  lecture attentive et une réponse courte. */
export const QUESTIONS_PAR_REQUETE = 8;
/** Requêtes par Message Batch : loin du plafond (100 000) pour garder des
 *  corps de requête raisonnables et une récolte par morceaux. */
export const REQUETES_PAR_BATCH = 2_000;

export type ItemAudite = { id: string; lettre: string; enonce: string; is_correct: boolean; justification: string };
export type QuestionAuditee = {
  id: string;
  cours_id: string | null;
  college_id: string | null;
  enonce: string;
  items: ItemAudite[];
};

export type Constat = {
  item_id: string;
  polarite_justification: 'vrai' | 'faux' | 'indeterminee';
  gravite: 'incoherent' | 'douteux';
  motif: string;
};

/* ─────────── Texte ─────────── */

export function texteBrut(html: string | null | undefined, max: number): string {
  const t = String(html ?? '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

/* ─────────── Schéma de sortie ─────────── */

export const constatsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['constats'],
  properties: {
    constats: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['item_id', 'polarite_justification', 'gravite', 'motif'],
        properties: {
          item_id: { type: 'string' },
          polarite_justification: { type: 'string', enum: ['vrai', 'faux', 'indeterminee'] },
          gravite: { type: 'string', enum: ['incoherent', 'douteux'] },
          motif: { type: 'string' },
        },
      },
    },
  },
} as const;

/* ─────────── Prompt ─────────── */

export const SYSTEM_AUDIT = `Tu relis des QCM médicaux (préparation aux EVC) pour détecter les propositions dont la CLÉ contredit la JUSTIFICATION.

Pour chaque question tu reçois : l'énoncé, puis chaque proposition avec sa lettre, son identifiant, sa clé (VRAI = proposition à cocher, FAUX = proposition à ne pas cocher) et sa justification.

RÈGLES DE LECTURE
1. Détermine d'abord le sens de la question. « Quelles propositions sont exactes ? » : la clé VRAI doit correspondre à une justification qui confirme la proposition. « Quelles propositions sont FAUSSES / inexactes ? » ou « quelle réponse est fausse ? » : la clé VRAI désigne alors une proposition FAUSSE, et une justification qui commence par « Faux » est COHÉRENTE avec une clé VRAI.
2. \`polarite_justification\` : ce que la justification affirme sur la proposition, indépendamment de la clé — 'vrai' si elle la confirme, 'faux' si elle la réfute, 'indeterminee' si elle ne tranche pas (vide, hors sujet, simple rappel de cours).
3. Signale UNIQUEMENT :
   - 'incoherent' : la justification tranche clairement, et dans le sens opposé à la clé (en tenant compte du sens de la question). Exemple : clé FAUX, question « propositions exactes ? », justification « Un BNP > 100 pg/mL est en faveur d'une insuffisance cardiaque, il permet de distinguer… » → incohérent.
   - 'douteux' : la justification semble contredire la clé mais reste ambiguë, ou mélange visiblement des phrases qui concernent une autre proposition. À utiliser avec parcimonie.
   Ne signale PAS une justification vide, ni une proposition dont clé et justification concordent, même si tu n'es pas d'accord médicalement : tu contrôles la cohérence interne, pas la médecine.
4. \`item_id\` : recopie EXACTEMENT l'identifiant fourni. \`motif\` : une phrase courte, en français, qui cite le passage décisif de la justification.
5. Aucun constat → \`{"constats": []}\`. Réponds uniquement par le JSON demandé.`;

/** Corps utilisateur d'une requête : N questions formatées de façon compacte. */
export function formaterQuestions(questions: QuestionAuditee[]): string {
  return questions.map((q, i) => {
    const lignes = q.items.map((it) =>
      `  ${it.lettre} [id=${it.id}] clé=${it.is_correct ? 'VRAI' : 'FAUX'} — ${texteBrut(it.enonce, 300)}\n     justification : ${texteBrut(it.justification, 500) || '(vide)'}`);
    return `### Question ${i + 1} (${q.id})\n${texteBrut(q.enonce, 700)}\n${lignes.join('\n')}`;
  }).join('\n\n');
}

export type RequeteBatch = {
  custom_id: string;
  params: {
    model: string;
    max_tokens: number;
    system: string;
    messages: Array<{ role: 'user'; content: string }>;
    output_config: { format: { type: 'json_schema'; schema: Record<string, unknown> } };
  };
};

/** Découpe les questions en requêtes prêtes pour `messages.batches.create`. */
export function construireRequetes(questions: QuestionAuditee[], model: string, prefixe: string): RequeteBatch[] {
  const utiles = questions.filter((q) => q.items.length > 0);
  const requetes: RequeteBatch[] = [];
  for (let i = 0; i < utiles.length; i += QUESTIONS_PAR_REQUETE) {
    const groupe = utiles.slice(i, i + QUESTIONS_PAR_REQUETE);
    requetes.push({
      custom_id: `${prefixe}-${requetes.length}`,
      params: {
        model,
        max_tokens: 4_000,
        system: SYSTEM_AUDIT,
        messages: [{ role: 'user', content: formaterQuestions(groupe) }],
        output_config: { format: { type: 'json_schema', schema: constatsSchema as unknown as Record<string, unknown> } },
      },
    });
  }
  return requetes;
}

/** Regroupe les requêtes par Message Batch. */
export function decouperEnBatches<T>(requetes: T[], taille = REQUETES_PAR_BATCH): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < requetes.length; i += taille) out.push(requetes.slice(i, i + taille));
  return out;
}

/* ─────────── Lecture des réponses ─────────── */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Constats valides d'une réponse (JSON conforme au schéma) ; le reste est ignoré. */
export function lireConstats(texte: string): Constat[] {
  let brut: unknown;
  try { brut = JSON.parse(texte); } catch { return []; }
  const liste = (brut as { constats?: unknown })?.constats;
  if (!Array.isArray(liste)) return [];
  const vus = new Set<string>();
  const out: Constat[] = [];
  for (const c of liste as Array<Record<string, unknown>>) {
    const id = String(c.item_id ?? '').trim().toLowerCase();
    if (!UUID.test(id) || vus.has(id)) continue;
    const polarite = c.polarite_justification;
    const gravite = c.gravite;
    if (polarite !== 'vrai' && polarite !== 'faux' && polarite !== 'indeterminee') continue;
    if (gravite !== 'incoherent' && gravite !== 'douteux') continue;
    vus.add(id);
    out.push({ item_id: id, polarite_justification: polarite, gravite, motif: String(c.motif ?? '').slice(0, 500) });
  }
  return out;
}

/* ─────────── Estimation ─────────── */

/** Tarifs USD par million de tokens, PRIX BATCH (moitié du tarif standard). */
const TARIF_BATCH: Record<string, { in: number; out: number }> = {
  'claude-haiku-4-5': { in: 0.5, out: 2.5 },
  'claude-sonnet-5': { in: 1, out: 5 },
  'claude-opus-5': { in: 2.5, out: 12.5 },
};

/**
 * Estimation avant lancement. Repères mesurés sur la base : ~150 tokens par
 * énoncé, ~110 par proposition (énoncé + justification + identifiant), ~600 de
 * consigne par requête ; en sortie, une réponse vide (~40 tokens) pour la
 * plupart des requêtes et ~60 tokens par constat (≈ 3 % des propositions).
 */
export function estimerCoutUsd(nbQuestions: number, nbItems: number, model: string): number {
  const tarif = TARIF_BATCH[model] ?? TARIF_BATCH['claude-haiku-4-5'];
  const requetes = Math.ceil(nbQuestions / QUESTIONS_PAR_REQUETE);
  const input = nbQuestions * 150 + nbItems * 110 + requetes * 600;
  const output = requetes * 40 + Math.round(nbItems * 0.03) * 60;
  return (input / 1_000_000) * tarif.in + (output / 1_000_000) * tarif.out;
}

/* ═══════════════ Passage « justifications » : rédaction des justifications vides ou recopiées ═══════════════ */

export type AuditKind = 'coherence' | 'justifications';
export const QCM_AUDIT_MODEL_REDACTION_DEFAUT = 'claude-sonnet-5';
/** Questions par requête de rédaction : les réponses sont longues (une justification par proposition). */
export const QUESTIONS_PAR_REQUETE_REDACTION = 4;

const normaliserTexte = (s: string | null | undefined) => texteBrut(s, 100_000).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/**
 * Une justification « à rédiger » est vide, ou n'est que la recopie de
 * l'énoncé de la proposition (défaut de génération mesuré le 06/09/2026 :
 * 7 771 propositions recopiées, 7 384 vides).
 */
export function justificationARediger(item: Pick<ItemAudite, 'enonce' | 'justification'>): boolean {
  const j = normaliserTexte(item.justification);
  if (!j) return true;
  return j === normaliserTexte(item.enonce);
}

/** Questions ayant au moins une proposition à rédiger. */
export function questionsARediger(questions: QuestionAuditee[]): QuestionAuditee[] {
  return questions.filter((q) => q.items.some(justificationARediger));
}

export const justificationsSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['justifications'],
  properties: {
    justifications: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['item_id', 'justification'],
        properties: { item_id: { type: 'string' }, justification: { type: 'string' } },
      },
    },
  },
} as const;

export const SYSTEM_REDACTION = `Tu rédiges les justifications manquantes de QCM médicaux (préparation aux EVC, niveau externat/internat français, recommandations HAS et sociétés savantes françaises).

Pour chaque question tu reçois l'énoncé (souvent un dossier progressif : vignette clinique + nouvel élément), puis chaque proposition avec sa lettre, son identifiant, sa clé (VRAI = à cocher, FAUX = à ne pas cocher) et, le cas échéant, sa justification existante. Certaines propositions sont marquées « À RÉDIGER » : leur justification est vide ou n'est que la recopie de la proposition.

RÈGLES
1. Rédige UNIQUEMENT les justifications des propositions marquées « À RÉDIGER », une par identifiant, sans rien changer aux autres.
2. La justification doit être COHÉRENTE avec la clé fournie : commence par « Vrai : » si la clé est VRAI, par « Faux : » si la clé est FAUX (si la question demande les propositions FAUSSES, la clé VRAI désigne une proposition fausse : commence alors par « Faux : » en expliquant pourquoi c'est la bonne réponse à cocher). Ne remets jamais la clé en cause ; si elle te paraît médicalement discutable, rédige la meilleure justification possible dans son sens, en restant factuel.
3. Deux à quatre phrases, précises et concrètes (seuils chiffrés, mécanisme, référence à la recommandation quand elle existe), reliées au cas clinique de l'énoncé. Pas de formule creuse, pas de répétition de la proposition.
4. Français soigné, accents corrects, aucune balise HTML.
5. Réponds uniquement par le JSON demandé.`;

export function formaterQuestionsRedaction(questions: QuestionAuditee[]): string {
  return questions.map((q, i) => {
    const lignes = q.items.map((it) => {
      const aRediger = justificationARediger(it);
      return `  ${it.lettre} [id=${it.id}] clé=${it.is_correct ? 'VRAI' : 'FAUX'} — ${texteBrut(it.enonce, 300)}`
        + (aRediger ? '\n     → À RÉDIGER' : `\n     justification existante : ${texteBrut(it.justification, 300)}`);
    });
    return `### Question ${i + 1} (${q.id})\n${texteBrut(q.enonce, 1200)}\n${lignes.join('\n')}`;
  }).join('\n\n');
}

export function construireRequetesRedaction(questions: QuestionAuditee[], model: string, prefixe: string): RequeteBatch[] {
  const utiles = questionsARediger(questions);
  const requetes: RequeteBatch[] = [];
  for (let i = 0; i < utiles.length; i += QUESTIONS_PAR_REQUETE_REDACTION) {
    const groupe = utiles.slice(i, i + QUESTIONS_PAR_REQUETE_REDACTION);
    requetes.push({
      custom_id: `${prefixe}-r${requetes.length}`,
      params: {
        model,
        max_tokens: 8_000,
        system: SYSTEM_REDACTION,
        messages: [{ role: 'user', content: formaterQuestionsRedaction(groupe) }],
        output_config: { format: { type: 'json_schema', schema: justificationsSchema as unknown as Record<string, unknown> } },
      },
    });
  }
  return requetes;
}

export type Proposition = { item_id: string; justification: string };

/** Propositions de justification valides d'une réponse ; texte borné, identifiants UUID uniques. */
export function lireJustifications(texte: string): Proposition[] {
  let brut: unknown;
  try { brut = JSON.parse(texte); } catch { return []; }
  const liste = (brut as { justifications?: unknown })?.justifications;
  if (!Array.isArray(liste)) return [];
  const vus = new Set<string>();
  const out: Proposition[] = [];
  for (const p of liste as Array<Record<string, unknown>>) {
    const id = String(p.item_id ?? '').trim().toLowerCase();
    const j = String(p.justification ?? '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (!UUID.test(id) || vus.has(id) || j.length < 20) continue;
    vus.add(id);
    out.push({ item_id: id, justification: j.slice(0, 2000) });
  }
  return out;
}

/** Estimation du passage de rédaction : ~700 tokens d'entrée par question, ~120 tokens de sortie par justification. */
export function estimerCoutRedactionUsd(nbQuestions: number, nbItemsARediger: number, model: string): number {
  const tarif = TARIF_BATCH[model] ?? TARIF_BATCH['claude-sonnet-5'];
  const requetes = Math.ceil(nbQuestions / QUESTIONS_PAR_REQUETE_REDACTION);
  const input = nbQuestions * 700 + requetes * 700;
  const output = nbItemsARediger * 120 + requetes * 30;
  return (input / 1_000_000) * tarif.in + (output / 1_000_000) * tarif.out;
}
