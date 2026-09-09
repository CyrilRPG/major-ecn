/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * POST /api/admin/import-exercices/analyse — analyse IA d'un import déjà
 * téléversé, PAR LOTS et REPRENABLE.
 *
 * POURQUOI UNE ROUTE, ET PLUS UNE ACTION SERVEUR (03/09/2026)
 * ----------------------------------------------------------
 * Vercel refuse un corps de requête au-delà de 4,5 Mo (413 avant exécution)
 * et coupe une fonction sans `maxDuration` bien avant la fin d'une extraction.
 * Le document est donc téléversé du navigateur vers Supabase Storage, et cette
 * route, qui porte son propre délai, ne reçoit qu'un identifiant.
 *
 * POURQUOI DES LOTS ET PLUSIEURS APPELS (06/09/2026)
 * -------------------------------------------------
 * Une seule requête IA sur un sujet de 160 pages ne rendait qu'une trentaine
 * de pages d'exercices. Le document est découpé en lots de quelques pages
 * (`planifierLots`), chaque lot est extrait séparément, et les résultats
 * partiels sont ÉCRITS dans `exercise_imports.result` au fur et à mesure :
 *  - un appel de cette route traite autant de lots que son délai le permet,
 *    puis répond `done: false` ; le navigateur rappelle jusqu'à `done: true` ;
 *  - une panne ou un délai dépassé ne perd que les lots en cours : la reprise
 *    (« Relancer ») ne rejoue que ce qui manque ;
 *  - un lot dont la réponse dépasse le budget de sortie est scindé en deux
 *    et rejoué, jusqu'à la page unique s'il le faut.
 * Aucune limite de taille de document n'est donc imposée par l'analyse,
 * seulement par le stockage (25 Mo).
 *
 * Sujet + corrigé séparés : si le corrigé est court, il accompagne chaque lot
 * du sujet (et il est mis en cache) ; sinon il est lui-même extrait par lots
 * (« corrections ») puis recollé aux questions par numéro d'exercice.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';
import {
  extraireLot, extraireCorrections, LotTropLongError, EXERCISE_IMPORT_MODEL,
  type ImportMode, type ImportVoie, type AppelUsage,
} from '@/lib/ai/exercise-import';
import {
  planifierLots, fusionnerLots, appliquerCorrections, validate,
  type Lot, type ExerciseImportResult, type CorrectionsResult,
} from '@/lib/ai/exercise-import-schema';
import { preparerDocument, contenuDuLot, type DocumentPrepare, type ImportFormat } from '@/lib/ai/exercise-import-documents';
import { lireVeritePdf, confronterALaSource, dedoublonnerParTexte } from '@/lib/ai/exercise-import-verite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** Plafond Vercel Pro. Le travail est découpé pour tenir dedans à chaque appel. */
export const maxDuration = 300;

/** On ne DÉMARRE plus de lot passé ce délai : un lot peut durer jusqu'à 210 s. */
const FENETRE_DEMARRAGE_MS = 80_000;
/** Lots traités de front. */
const CONCURRENCE = 4;
/** Au-delà, le corrigé séparé est extrait par lots plutôt que joint à chaque lot du sujet. */
const CORRIGE_INCLUS_MAX_PAGES = 24;
/** Un verrou plus vieux que cela est considéré comme abandonné (fonction coupée). */
const VERROU_MS = 6 * 60_000;

const Body = z.object({ id: z.string().uuid() });

type Strategie = 'combine' | 'corrige-inclus' | 'corrige-separe';

/** État d'avancement conservé dans `exercise_imports.result` pendant l'analyse. */
type Progression = {
  etape: 'analyse';
  plan: { nbPagesSujet: number; nbPagesCorrige: number | null; strategie: Strategie; lots: Lot[]; lotsCorrige: Lot[] };
  partiels: Record<string, ExerciseImportResult>;
  partielsCorrige: Record<string, CorrectionsResult>;
  erreurs: Record<string, string>;
  avertissementsDocs: string[];
  cout: { usd: number; input_tokens: number; output_tokens: number; appels: number };
  verrou: string | null;
  model: string;
};

const cle = (lot: Lot) => `${lot.coeurDebut}-${lot.coeurFin}`;
const libelle = (lot: Lot) => `Pages ${lot.coeurDebut}-${lot.coeurFin}`;

function estProgression(v: unknown): v is Progression {
  return !!v && typeof v === 'object' && (v as { etape?: string }).etape === 'analyse' && !!(v as Progression).plan;
}

/** Scinde un lot dont la réponse a débordé : deux moitiés de pages cœur. */
function scinder(lot: Lot): Lot[] | null {
  const n = lot.coeurFin - lot.coeurDebut + 1;
  if (n < 2) return null;
  const milieu = lot.coeurDebut + Math.ceil(n / 2) - 1;
  const r = lot.coeurDebut - lot.debut; // recouvrement d'origine
  const mk = (cd: number, cf: number, index: number): Lot => ({
    index, coeurDebut: cd, coeurFin: cf,
    debut: Math.max(1, cd - r), fin: Math.min(lot.fin + r, cf + r),
  });
  return [mk(lot.coeurDebut, milieu, lot.index), mk(milieu + 1, lot.coeurFin, lot.index)];
}

export async function POST(req: Request) {
  const guard = await requireAdminRequest(req);
  if (!guard.ok) return guard.error;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Import invalide.' }, { status: 400 });
  const { id } = parsed.data;
  const debutAppel = Date.now();

  const admin = createAdminClient();
  const a = admin as unknown as { from: (table: string) => any; storage: typeof admin.storage };

  const { data: row, error: readErr } = await a.from('exercise_imports')
    .select('id, cours_id, voie, format, source_mode, sujet_path, corrige_path, status, result, estimated_price_cents, cours(titre)')
    .eq('id', id).maybeSingle();
  if (readErr) return NextResponse.json({ ok: false, error: readErr.message }, { status: 500 });
  if (!row) return NextResponse.json({ ok: false, error: 'Import introuvable.' }, { status: 404 });
  if (!['draft', 'processing', 'failed'].includes(row.status)) {
    return NextResponse.json({ ok: false, error: 'Cet import a déjà été analysé.' }, { status: 409 });
  }

  // Verrou : deux onglets (ou un double clic) ne doivent pas payer deux fois
  // les mêmes lots. Un verrou périmé (fonction coupée) est repris.
  const existante: Progression | null = estProgression(row.result) ? row.result : null;
  if (existante?.verrou && Date.now() - new Date(existante.verrou).getTime() < VERROU_MS) {
    return NextResponse.json({ ok: false, error: 'Une analyse est déjà en cours pour cet import : patientez, elle reprend toute seule.' }, { status: 409 });
  }

  const sauvegarder = async (p: Progression, extra: Record<string, unknown> = {}) => {
    await a.from('exercise_imports').update({ result: p, updated_at: new Date().toISOString(), ...extra }).eq('id', id);
  };

  let progression: Progression | null = existante;
  try {
    await a.from('exercise_imports').update({ status: 'processing', error_message: null, updated_at: new Date().toISOString() }).eq('id', id);

    // ── Documents ──────────────────────────────────────────────────────────
    const format = row.format as ImportFormat;
    const telecharger = async (path: string, role: string) => {
      const { data, error } = await a.storage.from('exercise-imports').download(path);
      if (error || !data) throw new Error(`Document introuvable dans le stockage (${role}).`);
      return new Uint8Array(await data.arrayBuffer());
    };
    const mode = row.source_mode as ImportMode;
    const [sujet, corrige]: [DocumentPrepare, DocumentPrepare | null] = await Promise.all([
      telecharger(row.sujet_path, 'sujet').then((b) => preparerDocument(format, b)),
      mode === 'paired' && row.corrige_path
        ? telecharger(row.corrige_path, 'corrigé').then((b) => preparerDocument(format, b))
        : Promise.resolve(null),
    ]);
    if (mode === 'paired' && !corrige) throw new Error('Le corrigé séparé est introuvable dans le stockage.');

    // ── Plan (réutilisé à l'identique lors d'une reprise) ──────────────────
    if (!progression || progression.plan.nbPagesSujet !== sujet.nbPages) {
      const strategie: Strategie = !corrige ? 'combine'
        : corrige.nbPages <= CORRIGE_INCLUS_MAX_PAGES ? 'corrige-inclus' : 'corrige-separe';
      progression = {
        etape: 'analyse',
        plan: {
          nbPagesSujet: sujet.nbPages,
          nbPagesCorrige: corrige?.nbPages ?? null,
          strategie,
          lots: planifierLots(sujet.nbPages),
          lotsCorrige: strategie === 'corrige-separe' && corrige ? planifierLots(corrige.nbPages) : [],
        },
        partiels: {}, partielsCorrige: {}, erreurs: {},
        avertissementsDocs: [
          ...(sujet.kind === 'texte' ? sujet.avertissements : []),
          ...(corrige?.kind === 'texte' ? corrige.avertissements.map((w) => `Corrigé — ${w}`) : []),
        ],
        cout: { usd: 0, input_tokens: 0, output_tokens: 0, appels: 0 },
        verrou: null,
        model: EXERCISE_IMPORT_MODEL,
      };
    }
    const p: Progression = progression;
    p.verrou = new Date().toISOString();
    p.erreurs = {}; // une reprise redonne sa chance à chaque lot en échec
    await sauvegarder(p);

    const corrigeInclus = p.plan.strategie === 'corrige-inclus' && corrige
      ? await contenuDuLot(corrige, 1, corrige.nbPages)
      : null;

    const comptabiliser = (u: AppelUsage) => {
      p.cout.usd += u.usd; p.cout.input_tokens += u.usage.input_tokens; p.cout.output_tokens += u.usage.output_tokens; p.cout.appels += 1;
    };

    // ── File de travail : lots du sujet, puis lots du corrigé séparé ───────
    type Tache = { genre: 'sujet' | 'corrige'; lot: Lot };
    const aFaire: Tache[] = [
      ...p.plan.lots.filter((l) => !p.partiels[cle(l)]).map((lot) => ({ genre: 'sujet' as const, lot })),
      ...p.plan.lotsCorrige.filter((l) => !p.partielsCorrige[cle(l)]).map((lot) => ({ genre: 'corrige' as const, lot })),
    ];
    let peutDemarrer = () => Date.now() - debutAppel < FENETRE_DEMARRAGE_MS;

    const executer = async (t: Tache): Promise<void> => {
      const doc = t.genre === 'sujet' ? sujet : (corrige as DocumentPrepare);
      try {
        const contenu = await contenuDuLot(doc, t.lot.debut, t.lot.fin);
        if (t.genre === 'sujet') {
          const { result, usage } = await extraireLot({
            voie: row.voie as ImportVoie, mode, contenu, corrige: corrigeInclus, lot: t.lot, nbPagesTotal: doc.nbPages,
          });
          comptabiliser(usage);
          p.partiels[cle(t.lot)] = result;
        } else {
          const { result, usage } = await extraireCorrections({ contenu, lot: t.lot, nbPagesTotal: doc.nbPages });
          comptabiliser(usage);
          p.partielsCorrige[cle(t.lot)] = result;
        }
        await sauvegarder(p);
      } catch (e) {
        if (e instanceof LotTropLongError) {
          const moities = scinder(t.lot);
          if (moities) {
            // Le plan est réécrit : les deux moitiés remplacent le lot, et
            // sont traitées dès que possible (dans cet appel s'il reste du temps).
            const liste = t.genre === 'sujet' ? p.plan.lots : p.plan.lotsCorrige;
            const i = liste.findIndex((l) => cle(l) === cle(t.lot));
            if (i >= 0) liste.splice(i, 1, ...moities);
            p.avertissementsDocs.push(e.motif === 'delai'
              ? `${libelle(t.lot)} : analyse trop longue, lot scindé en deux et rejoué.`
              : `${libelle(t.lot)} : réponse trop longue, lot scindé en deux.`);
            await sauvegarder(p);
            aFaire.push(...moities.map((lot) => ({ genre: t.genre, lot })));
            return;
          }
          p.erreurs[cle(t.lot)] = e.motif === 'delai'
            ? `${libelle(t.lot)} : une seule page dépasse déjà le délai d'analyse, page ignorée.`
            : `${libelle(t.lot)} : une seule page dépasse le budget de sortie, page ignorée.`;
          await sauvegarder(p);
          return;
        }
        p.erreurs[cle(t.lot)] = e instanceof Error ? e.message : String(e);
        console.error('[import-exercices/analyse] lot en échec', { id, lot: cle(t.lot), message: p.erreurs[cle(t.lot)] });
        await sauvegarder(p);
      }
    };

    // Ouvriers : chacun prend la tâche suivante tant que la fenêtre de
    // démarrage est ouverte ; les tâches restantes attendront l'appel suivant.
    const ouvrier = async () => {
      while (aFaire.length > 0 && peutDemarrer()) {
        const t = aFaire.shift();
        if (!t) break;
        await executer(t);
      }
    };
    await Promise.all(Array.from({ length: CONCURRENCE }, ouvrier));
    peutDemarrer = () => false;

    const lotsTotal = p.plan.lots.length + p.plan.lotsCorrige.length;
    const lotsFaits = p.plan.lots.filter((l) => p.partiels[cle(l)]).length + p.plan.lotsCorrige.filter((l) => p.partielsCorrige[cle(l)]).length;
    const exercicesVus = Object.values(p.partiels).reduce((n, r) => n + (r.questions?.length ?? 0), 0);
    const enErreur = Object.keys(p.erreurs).length;

    // ── Pas fini : on rend la main, le navigateur rappellera ───────────────
    if (lotsFaits < lotsTotal) {
      p.verrou = null;
      if (enErreur > 0 && lotsFaits + enErreur >= lotsTotal) {
        // Tout ce qui pouvait être tenté l'a été : on s'arrête en échec
        // explicite, les lots réussis sont conservés pour la relance.
        const message = `${enErreur} lot(s) en échec sur ${lotsTotal} : ${Object.values(p.erreurs).slice(0, 2).join(' · ')} — relancez pour rejouer ces lots seulement.`;
        await sauvegarder(p, { status: 'failed', error_message: message });
        return NextResponse.json({ ok: false, error: message, progress: { lotsFaits, lotsTotal, exercices: exercicesVus, coutUsd: p.cout.usd } }, { status: 502 });
      }
      await sauvegarder(p);
      return NextResponse.json({ ok: true, id, done: false, progress: { lotsFaits, lotsTotal, exercices: exercicesVus, coutUsd: p.cout.usd } });
    }

    // ── Fini : fusion, corrigé, validation ─────────────────────────────────
    let fusion = fusionnerLots(p.plan.lots.map((l) => ({ ordre: l.coeurDebut, label: libelle(l), result: p.partiels[cle(l)] })));

    // Dédoublonnage de secours par le texte : la fusion se fie au numéro de
    // source, que les lots ne numérotent pas toujours pareil (« Sujet 1 - Q1 »
    // ici, « Session 3 – Sujet 1 – Q1 » là). Douze doublons étaient passés sur
    // l'import Pédiatrie du 08/09/2026.
    {
      const { questions, retirees } = dedoublonnerParTexte(fusion.questions);
      if (retirees > 0) {
        fusion = { ...fusion, questions, warnings: [...fusion.warnings, `${retirees} exercice(s) rendus en double par deux lots voisins, fusionné(s) sur le texte.`] };
      }
    }
    if (p.plan.strategie === 'corrige-separe') {
      const corrections: CorrectionsResult = {
        corrections: p.plan.lotsCorrige.flatMap((l) => p.partielsCorrige[cle(l)]?.corrections ?? []),
        warnings: p.plan.lotsCorrige.flatMap((l) => (p.partielsCorrige[cle(l)]?.warnings ?? []).map((w) => `${libelle(l)} : ${w}`)),
      };
      fusion = appliquerCorrections(fusion, corrections);
    }
    // Confrontation au document : dans ces supports le corrigé est porté par la
    // COULEUR (vert = proposition exacte). Il prime sur la lecture du modèle,
    // qui inversait 8,6 % des propositions sur l'import du 08/09/2026. La même
    // passe signale les exercices posés sur une page illustrée et rendus sans
    // document.
    if (format === 'pdf') {
      try {
        const brutSujet = await telecharger(row.sujet_path, 'sujet');
        const verite = await lireVeritePdf(brutSujet);
        const bilan = confronterALaSource(fusion.questions, verite);
        fusion.warnings = [...fusion.warnings, ...bilan.avertissements];
        if (verite.colore && bilan.corriges === 0) {
          fusion.warnings = [...fusion.warnings, 'Corrigé vérifié sur la couleur du document : aucun écart.'];
        }
      } catch (e) {
        fusion.warnings = [...fusion.warnings, `Le corrigé du document n'a pas pu être vérifié automatiquement : ${e instanceof Error ? e.message : 'erreur inconnue'}.`];
      }
    }
    fusion.warnings = [...p.avertissementsDocs, ...fusion.warnings];
    if (fusion.questions.length === 0) {
      const dit = fusion.warnings.filter(Boolean).slice(0, 3).join(' ');
      throw new Error(`Aucun exercice n'a été trouvé dans le document.${dit ? ' Analyse : ' + dit : ''}`);
    }
    const result = validate(fusion, row.voie as ImportVoie);
    const resultat = {
      ...result,
      meta: {
        model: p.model, lots: lotsTotal, pages: p.plan.nbPagesSujet, pagesCorrige: p.plan.nbPagesCorrige, strategie: p.plan.strategie,
        cout: p.cout,
      },
    };

    const { error } = await a.from('exercise_imports').update({
      status: 'ready', result: resultat, warnings: result.warnings, model: p.model,
      billed_price_cents: row.estimated_price_cents, processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) throw new Error(error.message);

    await logAudit({
      actor: { id: guard.auth.user.id, email: guard.auth.user.email ?? null, role: 'admin' } as any,
      action: 'create', entity: 'exercise_import', entityId: id,
      coursId: row.cours_id, coursTitre: row.cours?.titre,
      description: `Import d’exercices analysé : ${result.questions.length} exercice(s), ${lotsTotal} lot(s), ${p.plan.nbPagesSujet} page(s), ${p.cout.usd.toFixed(2)} $`,
    });

    return NextResponse.json({ ok: true, id, done: true, questions: result.questions.length, progress: { lotsFaits, lotsTotal, exercices: result.questions.length, coutUsd: p.cout.usd } });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Échec de l’analyse IA.';
    console.error('[import-exercices/analyse]', { id, message });
    if (progression) progression.verrou = null;
    await a.from('exercise_imports').update({
      status: 'failed', error_message: message, updated_at: new Date().toISOString(),
      ...(progression ? { result: progression } : {}),
    }).eq('id', id);
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }
}
