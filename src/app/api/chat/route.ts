import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { assertAccessActive } from '@/lib/auth/access';
import { getRequestUser } from '@/lib/auth/bearer';
import { assertDeviceSlot, DEVICE_HEADER } from '@/lib/auth/device';
import { callClaude, FAST_MODEL } from '@/lib/ai/anthropic';

/**
 * Assistant Q&R borné au cours.
 *
 * Stratégie (simple, robuste, sans dépendance vector store) :
 *  1. Récupère TOUT le contenu pédagogique du cours :
 *     - le texte extrait de la fiche (source de référence prioritaire)
 *     - les flashcards (recto / verso)
 *     - les items QCM avec leur justification
 *     - les annales (rangées par type)
 *  2. Envoie ce contexte (capé en taille) à Haiku 4.5 avec un prompt
 *     qui le positionne comme un médecin enseignant.
 *  3. L'IA répond naturellement, en privilégiant TOUJOURS la fiche
 *     quand elle est présente. Pas de citation de source côté élève.
 *
 * Pourquoi on a abandonné le RAG embeddings : la table `cours_chunks`
 * est vide pour la quasi-totalité des cours en production, ce qui
 * faisait abstention systématique. Tant que le pipeline d'indexation
 * RAG n'est pas relancé en masse, on utilise le contenu brut.
 */

// Abstention conservée uniquement comme garde-fou technique (cours vide,
// erreur API…). Le prompt principal interdit explicitement à Claude
// d'utiliser ce genre de formulation.
const ABSTENTION =
  "Je n'ai pas réussi à formuler la réponse — réessayez ou passez par le " +
  'forum pour qu\'un professeur puisse vous répondre.';

const SYSTEM_PROMPT = `Tu es un médecin enseignant qui aide un étudiant
en médecine à réviser pour les EVC. Tu réponds à TOUTES ses questions
comme un prof en face à face : direct, clair, structuré.

Ta posture
──────────
- Tu RÉPONDS TOUJOURS. Pas d'abstention, pas de « je n'ai pas la réponse »,
  pas de « pose ta question sur le forum ». Tu es un médecin enseignant,
  tu connais ton métier.
- La fiche du cours qu'on te fournit est ta source de référence prioritaire
  pour tout ce qu'elle couvre — utilise-la comme appui quand c'est pertinent.
- Pour tout ce que la fiche ne couvre pas explicitement (questions de
  physiopathologie, de pharmacologie, de raisonnement clinique, lien avec
  d'autres items, comparaison entre pathologies…), utilise tes
  connaissances médicales générales SANS HÉSITER. Tu réponds comme un
  prof à un externe.
- Reste 100 % cohérent avec ce que dit la fiche quand le sujet la touche.
  Ne CONTREDIS jamais la fiche.

Règles de style
───────────────
1. Ne mentionne JAMAIS la source de l'information. Pas de « d'après la
   fiche », « le QCM précise », « selon les extraits ». La réponse vient
   de ton expertise, point.
2. Pas de méta-langage type « voici ce que je sais », « je peux te dire ».
   Tu rentres direct dans le sujet.
3. Format adapté à la question : court (3-5 lignes) pour une définition,
   structuré en puces ou paragraphes pour un raisonnement, un tableau
   markdown comparatif si l'élève demande une comparaison entre entités
   nosologiques.
4. Vocabulaire médical assumé : termes propres à l'EVC (items, rangs A/B),
   sigles classiques (HAS, EFR, BPCO, DEP, ECBU…), tournures de prof.
5. Pas d'avis médical sur un cas réel : si l'élève parle d'un patient
   précis, rappelle en une phrase que c'est un outil de révision et
   redirige vers une consultation.`;

async function logUsage(args: {
  coursId: string;
  feature: 'assistant_chat';
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  model: string;
  status: 'success' | 'failed' | 'abstention';
}) {
  const admin = createAdminClient();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('ai_generations').insert({
      admin_id: null,
      cours_id: args.coursId,
      kind: 'flashcards',
      feature: args.feature,
      items_count: 1,
      input_tokens: args.inputTokens,
      output_tokens: args.outputTokens,
      cost_usd: args.costUsd,
      price_eur: 0,
      status: args.status,
      model: args.model,
    });
  } catch { /* logging best-effort */ }
}

// Tarif Haiku 4.5 ($/1M tokens)
const HAIKU_IN = 0.80 / 1_000_000;
const HAIKU_OUT = 4.00 / 1_000_000;
const haikuCost = (u: { input_tokens: number; output_tokens: number }) =>
  u.input_tokens * HAIKU_IN + u.output_tokens * HAIKU_OUT;

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)),
  ]);
}

/** Cap dur sur la taille du contexte envoyé à Claude (en caractères, ≈ 4×
 *  en tokens). 60 000 ≈ 15 k tokens, large pour Haiku. */
const MAX_CONTEXT_CHARS = 60_000;

/** Tronque proprement à la fin d'une phrase (point/saut de ligne). */
function trim(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastPeriod = Math.max(cut.lastIndexOf('.'), cut.lastIndexOf('\n'));
  return (lastPeriod > max * 0.7 ? cut.slice(0, lastPeriod + 1) : cut) + '\n[…]';
}

export async function POST(req: Request) {
  // Auth duale : cookie (web) ou Bearer (app mobile, avec contrôle d'appareil).
  const auth = await getRequestUser(req);
  if (!auth) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { supabase, user } = auth;
  if (auth.via === 'bearer') {
    const check = await assertDeviceSlot(user.id, req.headers.get(DEVICE_HEADER));
    if (!check.ok) return check.response;
  }

  const expiredRes = await assertAccessActive(supabase, user.id);
  if (expiredRes) return expiredRes;

  const { coursId, message } = (await req.json().catch(() => ({}))) as {
    coursId?: string; message?: string;
  };
  if (!coursId || !message?.trim()) {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  }
  if (message.length > 2000) {
    return NextResponse.json({ error: 'Question trop longue (max 2000 caractères).' }, { status: 400 });
  }

  const { data: cours } = await supabase
    .from('cours')
    .select('id, titre')
    .eq('id', coursId)
    .maybeSingle();
  if (!cours) {
    return NextResponse.json({ error: 'Cours introuvable.' }, { status: 404 });
  }

  // Pas de clé Claude côté serveur (variable d'environnement Vercel
  // ANTHROPIC_API_KEY manquante) → message explicite pour l'admin, pas
  // une fausse abstention pédagogique.
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      reply:
        "⚙️ Configuration incomplète : la clé d'API Claude n'est pas " +
        "définie sur le serveur (ANTHROPIC_API_KEY). Préviens l'équipe " +
        'technique pour qu\'elle l\'ajoute dans les variables ' +
        'd\'environnement Vercel.',
      mode: 'no_api_key',
    });
  }

  // 1) Récupère tout le contenu pédagogique du cours
  const [
    { data: fiche },
    { data: flashcards },
    { data: qcmItems },
  ] = await Promise.all([
    supabase
      .from('fiches')
      .select('extracted_text')
      .eq('cours_id', coursId)
      .maybeSingle(),
    supabase
      .from('flashcards')
      .select('recto, verso')
      .eq('cours_id', coursId)
      .limit(150),
    supabase
      .from('qcm_items')
      .select('enonce, justification, qcm_questions!inner(enonce, qcm_series!inner(cours_id))')
      .eq('qcm_questions.qcm_series.cours_id', coursId)
      .limit(400),
  ]);

  // 2) Construit le bloc contexte. La fiche passe EN PREMIER avec un
  //    budget de caractères généreux (40 k), puis QCM (15 k), puis
  //    flashcards (5 k). Si le total dépasse MAX_CONTEXT_CHARS, on coupe.
  const blocks: string[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ficheText = (fiche as any)?.extracted_text as string | null;
  if (ficheText?.trim()) {
    blocks.push('### Fiche de cours\n' + trim(ficheText.trim(), 40_000));
  }
  type QcmRow = { enonce: string; justification: string | null; qcm_questions: { enonce: string } };
  const qcmLines: string[] = [];
  for (const it of (qcmItems ?? []) as QcmRow[]) {
    const just = it.justification?.trim();
    if (!just) continue;
    qcmLines.push(`Q : ${it.qcm_questions.enonce}\nR : ${it.enonce}\n→ ${just}`);
  }
  if (qcmLines.length > 0) {
    blocks.push('### Cas cliniques et QCM corrigés\n' + trim(qcmLines.join('\n\n'), 15_000));
  }
  const fcLines: string[] = [];
  for (const f of flashcards ?? []) {
    fcLines.push(`• ${f.recto} → ${f.verso}`);
  }
  if (fcLines.length > 0) {
    blocks.push('### Points clés (flashcards)\n' + trim(fcLines.join('\n'), 5_000));
  }

  const contextBlock = trim(blocks.join('\n\n'), MAX_CONTEXT_CHARS);

  // Aucun contenu pédagogique → on prévient l'utilisateur (cas rare :
  // cours créé sans fiche/QCM/flashcards).
  if (contextBlock.length < 50) {
    await logUsage({
      coursId, feature: 'assistant_chat',
      inputTokens: 0, outputTokens: 0, costUsd: 0, model: FAST_MODEL,
      status: 'abstention',
    });
    return NextResponse.json({
      reply:
        "Ce cours n'a pas encore de contenu pédagogique indexé. Posez votre " +
        'question sur le forum pour qu\'un professeur puisse vous répondre.',
      mode: 'no_content',
    });
  }

  // 3) Appel Haiku 4.5. maxTokens à 1200 pour autoriser des explications
  //    de raisonnement, et temp 0.4 pour un ton vivant sans dérive.
  let result;
  try {
    result = await withTimeout(
      callClaude({
        model: FAST_MODEL,
        maxTokens: 1200,
        temperature: 0.4,
        cacheSystem: true,
        system: SYSTEM_PROMPT,
        user:
          `Cours en cours de révision : « ${cours.titre} ».\n\n` +
          `Voici le contenu pédagogique de référence pour ce cours :\n\n` +
          contextBlock +
          `\n\n---\n\n` +
          `Question de l'élève : ${message.trim()}\n\n` +
          `Réponds-lui directement, comme un prof. ` +
          `Appuie-toi sur la fiche quand c'est pertinent, et complète ` +
          `librement avec tes connaissances médicales pour le reste. ` +
          `TU DOIS RÉPONDRE — pas d'abstention.`,
      }),
      20_000,
    );
  } catch (e) {
    await logUsage({
      coursId, feature: 'assistant_chat',
      inputTokens: 0, outputTokens: 0, costUsd: 0, model: FAST_MODEL,
      status: 'failed',
    });
    return NextResponse.json(
      { error: 'IA indisponible : ' + (e as Error).message },
      { status: 502 },
    );
  }

  const answer = result.text.trim();
  const cost = haikuCost(result.usage);

  await logUsage({
    coursId, feature: 'assistant_chat',
    inputTokens: result.usage.input_tokens,
    outputTokens: result.usage.output_tokens,
    costUsd: cost,
    model: result.model,
    status: 'success',
  });

  return NextResponse.json({
    reply: answer,
    mode: 'direct_context',
  });
}
