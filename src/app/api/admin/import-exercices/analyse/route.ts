/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * POST /api/admin/import-exercices/analyse — analyse d'un import déjà
 * téléversé, en ÉTAPES REPRENABLES.
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
 * un appel traite ce que son délai permet puis répond `done: false`, le
 * navigateur rappelle jusqu'à `done: true`.
 *
 * POURQUOI DES ÉTAPES (10/09/2026)
 * -------------------------------
 * Le client avait perdu confiance : corrigés faux, questions manquantes,
 * images perdues, avertissements jamais montrés, lot en échec qui bloquait
 * tout. Le travail après les lots est maintenant découpé lui aussi, chaque
 * étape persistée dans `result.etape` (cf. `exercise-import-pipeline.ts`) :
 *   analyse → verification → images → relance → finalisation → `ready`.
 * Toute la logique est dans le module pur ; ici : stockage, modèle, temps,
 * persistance. Toute exception d'étape → `status: 'failed'` avec un message
 * français ; « Relancer » reprend à l'étape persistée.
 */
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminRequest } from '@/lib/auth/api-guard';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAudit } from '@/lib/audit/log';
import {
  extraireLot, extraireCorrections, LotTropLongError, EXERCISE_IMPORT_MODEL, EXERCISE_IMPORT_EFFORT,
  type ImportMode, type ImportVoie, type AppelUsage,
} from '@/lib/ai/exercise-import';
import { planifierLots, type Lot } from '@/lib/ai/exercise-import-schema';
import { preparerDocument, contenuDuLot, type DocumentPrepare, type ImportFormat } from '@/lib/ai/exercise-import-documents';
import {
  lireVeritePdf, lireVeritePdfParPlages, lireCorrigeSepare, versCorrectionsResult, veriteEnErreur, type VeritePdf,
} from '@/lib/ai/exercise-import-verite';
import { extraireImagesPdf, televerserImagesImport } from '@/lib/ai/exercise-import-images';
import {
  assemblerEtVerifier, cle, consigneRelance, estProgression, facturerImportCents, finaliser, libelle, marquerLotEnEchec,
  planifierRelance, scinder, MAX_TENTATIVES_LOT,
  type EtatImages, type EtatRelance, type PartielLot, type Progression, type Strategie, type Verification,
} from '@/lib/ai/exercise-import-pipeline';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
/** Plafond Vercel Pro. Le travail est découpé pour tenir dedans à chaque appel. */
export const maxDuration = 300;

/** On ne DÉMARRE plus de lot passé ce délai : un lot peut durer jusqu'à 210 s. */
const FENETRE_DEMARRAGE_MS = 80_000;
/** Une étape suivante n'est enchaînée dans le même appel que si celui-ci est encore jeune. */
const FENETRE_ENCHAINEMENT_MS = 25_000;
/** Budget d'extraction d'images par appel (le téléversement s'y ajoute). */
const BUDGET_IMAGES_MS = 60_000;
/** Lots traités de front. */
const CONCURRENCE = 4;
/** Au-delà, le corrigé séparé est extrait par lots plutôt que joint à chaque lot du sujet. */
const CORRIGE_INCLUS_MAX_PAGES = 24;
/** Au-delà, la vérité du PDF est lue par plages de 40 pages. */
const VERITE_PAR_PLAGES_AU_DELA = 60;
/** Un verrou plus vieux que cela est considéré comme abandonné (fonction coupée). */
const VERROU_MS = 6 * 60_000;

const Body = z.object({ id: z.string().uuid() });

type Progres = { etape: string; lotsFaits: number; lotsTotal: number; exercices: number; coutUsd: number; detail?: string };

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
    const voie = row.voie as ImportVoie;
    const [sujetBrut, corrigeBrut] = await Promise.all([
      telecharger(row.sujet_path, 'sujet'),
      mode === 'paired' && row.corrige_path ? telecharger(row.corrige_path, 'corrigé') : Promise.resolve(null),
    ]);
    const sujet: DocumentPrepare = await preparerDocument(format, sujetBrut);
    const corrige: DocumentPrepare | null = corrigeBrut ? await preparerDocument(format, corrigeBrut) : null;
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
        partiels: {}, partielsCorrige: {}, erreurs: {}, tentatives: {},
        avertissementsDocs: [
          ...(sujet.kind === 'texte' ? sujet.avertissements : []),
          ...(corrige?.kind === 'texte' ? corrige.avertissements.map((w) => `Corrigé — ${w}`) : []),
        ],
        cout: { usd: 0, input_tokens: 0, output_tokens: 0, appels: 0 },
        verrou: null,
        model: EXERCISE_IMPORT_MODEL,
        effort: EXERCISE_IMPORT_EFFORT,
      };
    }
    const p: Progression = progression;
    // Lignes écrites avant le 10/09/2026 : champs ajoutés depuis.
    p.tentatives ??= {}; p.effort ??= EXERCISE_IMPORT_EFFORT; p.etape ??= 'analyse';
    p.verrou = new Date().toISOString();
    p.erreurs = {}; // une reprise redonne sa chance à chaque lot en échec
    await sauvegarder(p);

    const comptabiliser = (u: AppelUsage) => {
      p.cout.usd += u.usd; p.cout.input_tokens += u.usage.input_tokens; p.cout.output_tokens += u.usage.output_tokens; p.cout.appels += 1;
    };
    const lotsTotal = () => p.plan.lots.length + p.plan.lotsCorrige.length;
    const lotsFaits = () => p.plan.lots.filter((l) => p.partiels[cle(l)]).length + p.plan.lotsCorrige.filter((l) => p.partielsCorrige[cle(l)]).length;
    const exercicesVus = () => Object.values(p.partiels).reduce((n, r) => n + (r.questions?.length ?? 0), 0);
    const progres = (detail?: string): Progres => ({ etape: p.etape, lotsFaits: lotsFaits(), lotsTotal: lotsTotal(), exercices: p.verification?.questions.length ?? exercicesVus(), coutUsd: p.cout.usd, ...(detail ? { detail } : {}) });
    const rendreLaMain = async (detail?: string) => {
      p.verrou = null;
      await sauvegarder(p);
      return NextResponse.json({ ok: true, id, done: false, progress: progres(detail) });
    };
    const peutEnchainer = () => Date.now() - debutAppel < FENETRE_ENCHAINEMENT_MS;

    /* ─────────── Exécution d'un lot (sujet, corrigé, relance) ─────────── */

    type Tache = { genre: 'sujet' | 'corrige' | 'relance'; lot: Lot };
    const corrigeInclus = p.plan.strategie === 'corrige-inclus' && corrige ? await contenuDuLot(corrige, 1, corrige.nbPages) : null;

    const executerLots = async (aFaire: Tache[], options: { partielsRelance?: Record<string, PartielLot>; lotsRelance?: Lot[]; attendus?: Record<string, string[]> } = {}) => {
      let peutDemarrer = () => Date.now() - debutAppel < FENETRE_DEMARRAGE_MS;
      /** Abandon d'un lot : partiel vide, l'import aboutit. Seul un lot du SUJET rend sa plage bloquante. */
      const abandonner = (t: Tache, motif: string) => {
        const k = cle(t.lot);
        if (t.genre === 'corrige') p.partielsCorrige[k] = { corrections: [], warnings: [`${libelle(t.lot)} du corrigé non lues : ${motif}`] };
        else if (t.genre === 'relance') (options.partielsRelance ?? {})[k] = { questions: [], warnings: [`Relance des pages ${t.lot.coeurDebut}-${t.lot.coeurFin} sans résultat : ${motif}`], echec: true };
        else marquerLotEnEchec(p.partiels, t.lot, motif);
      };
      const executer = async (t: Tache): Promise<void> => {
        const doc = t.genre === 'corrige' ? (corrige as DocumentPrepare) : sujet;
        const k = cle(t.lot);
        const cibleRelance = t.genre === 'relance';
        const liste = t.genre === 'sujet' ? p.plan.lots : t.genre === 'corrige' ? p.plan.lotsCorrige : (options.lotsRelance ?? []);
        const partiels = t.genre === 'sujet' ? p.partiels : cibleRelance ? (options.partielsRelance ?? {}) : null;
        try {
          const contenu = await contenuDuLot(doc, t.lot.debut, t.lot.fin);
          if (t.genre === 'corrige') {
            const { result, usage } = await extraireCorrections({ contenu, lot: t.lot, nbPagesTotal: doc.nbPages });
            comptabiliser(usage);
            p.partielsCorrige[k] = result;
          } else {
            const { result, usage } = await extraireLot({
              voie, mode, contenu, corrige: corrigeInclus, lot: t.lot, nbPagesTotal: doc.nbPages,
              ...(cibleRelance ? { effort: 'xhigh' as const, consigneSupplementaire: consigneRelance(options.attendus?.[k] ?? []) } : {}),
            });
            comptabiliser(usage);
            (partiels as Record<string, PartielLot>)[k] = result;
          }
          await sauvegarder(p);
        } catch (e) {
          if (e instanceof LotTropLongError) {
            const moities = scinder(t.lot);
            if (moities) {
              // Le plan est réécrit : les deux moitiés remplacent le lot, et
              // sont traitées dès que possible (dans cet appel s'il reste du temps).
              const i = liste.findIndex((l) => cle(l) === k);
              if (i >= 0) liste.splice(i, 1, ...moities);
              if (cibleRelance && options.attendus) { for (const m of moities) options.attendus[cle(m)] = options.attendus[k] ?? []; delete options.attendus[k]; }
              p.avertissementsDocs.push(e.motif === 'delai'
                ? `${libelle(t.lot)} : analyse trop longue, lot scindé en deux et rejoué.`
                : `${libelle(t.lot)} : réponse trop longue, lot scindé en deux.`);
              await sauvegarder(p);
              aFaire.push(...moities.map((lot) => ({ genre: t.genre, lot })));
              return;
            }
            // Une seule page dépasse déjà : on abandonne la page, l'import
            // aboutira et la plage sera un écart bloquant.
            const motif = e.motif === 'delai' ? 'une seule page dépasse déjà le délai d’analyse.' : 'une seule page dépasse déjà le budget de sortie du modèle.';
            abandonner(t, motif);
            await sauvegarder(p);
            return;
          }
          const message = e instanceof Error ? e.message : String(e);
          // Configuration en cause : inutile d'insister lot par lot.
          if (/^Clé Anthropic|ANTHROPIC_API_KEY/.test(message)) throw e;
          console.error('[import-exercices/analyse] lot en échec', { id, genre: t.genre, lot: k, message });
          const kt = `${t.genre}:${k}`;
          p.tentatives[kt] = (p.tentatives[kt] ?? 0) + 1;
          const limite = cibleRelance ? 1 : MAX_TENTATIVES_LOT;
          if (p.tentatives[kt] >= limite) {
            abandonner(t, `${message} (${p.tentatives[kt]} tentative(s)).`);
          } else {
            p.erreurs[kt] = message;
          }
          await sauvegarder(p);
        }
      };
      const ouvrier = async () => {
        while (aFaire.length > 0 && peutDemarrer()) {
          const t = aFaire.shift();
          if (!t) break;
          await executer(t);
        }
      };
      await Promise.all(Array.from({ length: CONCURRENCE }, ouvrier));
      peutDemarrer = () => false;
    };

    /* ─────────── Vérification (vérité du PDF, corrigé séparé, confrontation) ─────────── */

    const lireVerite = async (): Promise<VeritePdf> => {
      if (sujet.kind !== 'pdf') return veriteEnErreur('document texte (Word ou TXT) : la couleur du corrigé et la position des figures ne sont pas lisibles');
      return sujet.nbPages > VERITE_PAR_PLAGES_AU_DELA ? lireVeritePdfParPlages(sujetBrut, 40) : lireVeritePdf(sujetBrut);
    };
    const verifier = async (): Promise<Verification> => {
      const verite = await lireVerite();
      let corrigeSepare: Parameters<typeof assemblerEtVerifier>[0]['corrigeSepare'] = null;
      if (mode === 'paired' && corrigeBrut && corrige?.kind === 'pdf') {
        const lu = await lireCorrigeSepare(corrigeBrut);
        corrigeSepare = {
          corrections: versCorrectionsResult(lu),
          resume: { statut: lu.statut, origine: lu.origine, nbNumeros: Object.keys(lu.lettresJustes).length, avertissements: lu.avertissements },
        };
      }
      return assemblerEtVerifier({
        plan: p.plan, partiels: p.partiels, partielsCorrige: p.partielsCorrige, relance: p.relance ?? null,
        corrigeSepare, verite, voie, avertissementsDocs: p.avertissementsDocs, erreurs: p.erreurs,
      });
    };

    /* ─────────── Boucle d'étapes ─────────── */

    for (;;) {
      if (p.etape === 'analyse') {
        const aFaire: Tache[] = [
          ...p.plan.lots.filter((l) => !p.partiels[cle(l)]).map((lot) => ({ genre: 'sujet' as const, lot })),
          ...p.plan.lotsCorrige.filter((l) => !p.partielsCorrige[cle(l)]).map((lot) => ({ genre: 'corrige' as const, lot })),
        ];
        await executerLots(aFaire);
        if (lotsFaits() < lotsTotal()) {
          const enErreur = Object.keys(p.erreurs).length;
          return rendreLaMain(enErreur ? `${enErreur} lot(s) à rejouer : ${Object.values(p.erreurs)[0]}` : undefined);
        }
        p.etape = 'verification';
        await sauvegarder(p);
        if (!peutEnchainer()) return rendreLaMain();
      }

      if (p.etape === 'verification') {
        p.verification = await verifier();
        p.etape = 'images';
        await sauvegarder(p);
        if (!peutEnchainer()) return rendreLaMain();
      }

      if (p.etape === 'images') {
        if (sujet.kind === 'pdf') {
          const etat: EtatImages = p.images ?? { numPages: sujet.nbPages, pageSuivante: 1, images: [], signaturesDecor: [], dureeMs: 0, appels: 0 };
          p.images = etat;
          if (etat.pageSuivante !== null && !etat.erreur) {
            try {
              const r = await extraireImagesPdf(sujetBrut, {
                pages: [etat.pageSuivante, sujet.nbPages], budgetMs: BUDGET_IMAGES_MS,
                exclureSha1: etat.images.map((i) => i.sha1), decorConnu: etat.signaturesDecor,
              });
              const envoyees = await televerserImagesImport(id, r.images);
              etat.images.push(...envoyees.map((im) => ({ page: im.page, indice: im.indice, yDebut: im.yDebut, yFin: im.yFin, largeurPx: im.largeurPx, hauteurPx: im.hauteurPx, url: im.url, chemin: im.chemin, sha1: im.sha1 })));
              etat.signaturesDecor = [...new Set([...etat.signaturesDecor, ...r.signaturesDecor])];
              etat.pageSuivante = r.pageSuivante; etat.dureeMs += r.dureeMs; etat.appels += 1;
            } catch (e) {
              // Les images ne bloquent jamais l'import : l'échec est rapporté (alerte à relire).
              etat.erreur = e instanceof Error ? e.message : String(e);
              console.error('[import-exercices/analyse] images', { id, message: etat.erreur });
            }
            await sauvegarder(p);
            if (etat.pageSuivante !== null && !etat.erreur) return rendreLaMain(`images : page ${etat.pageSuivante}/${sujet.nbPages}`);
          }
        }
        p.etape = 'relance';
        await sauvegarder(p);
        if (!peutEnchainer()) return rendreLaMain();
      }

      if (p.etape === 'relance') {
        const v = p.verification;
        if (!v) { p.etape = 'verification'; continue; }
        if (!p.relance) {
          const plan = (v.verite.statut === 'colore' || v.verite.statut === 'non-colore')
            ? planifierRelance(v.rapport.ecarts, p.plan.nbPagesSujet)
            : { lots: [], attendus: {}, motifs: [] };
          const relance: EtatRelance = { lots: plan.lots, attendus: plan.attendus, partiels: {}, faite: plan.lots.length === 0, motifs: plan.motifs };
          p.relance = relance;
          if (relance.motifs.length) p.avertissementsDocs.push(...relance.motifs);
          await sauvegarder(p);
        }
        const relance = p.relance;
        if (!relance.faite) {
          const aFaire: Tache[] = relance.lots.filter((l) => !relance.partiels[cle(l)]).map((lot) => ({ genre: 'relance' as const, lot }));
          await executerLots(aFaire, { partielsRelance: relance.partiels, lotsRelance: relance.lots, attendus: relance.attendus });
          if (relance.lots.some((l) => !relance.partiels[cle(l)])) {
            const enErreur = Object.keys(p.erreurs).length;
            return rendreLaMain(`relance : ${relance.lots.filter((l) => relance.partiels[cle(l)]).length}/${relance.lots.length} lot(s)${enErreur ? ' · à rejouer' : ''}`);
          }
          // Nouvelle vérification avec les lots de relance fusionnés.
          relance.faite = true;
          p.verification = await verifier();
        }
        p.etape = 'finalisation';
        await sauvegarder(p);
        if (!peutEnchainer()) return rendreLaMain();
      }

      if (p.etape === 'finalisation') {
        const v = p.verification;
        if (!v) { p.etape = 'verification'; continue; }
        const resultat = finaliser({ progression: p, verification: v, images: p.images ?? null });
        const billed = facturerImportCents(row.estimated_price_cents, p.cout.usd);
        const { error } = await a.from('exercise_imports').update({
          status: 'ready', result: resultat, warnings: resultat.warnings, model: p.model,
          billed_price_cents: billed, processed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(), error_message: null,
        }).eq('id', id);
        if (error) throw new Error(error.message);

        await logAudit({
          actor: { id: guard.auth.user.id, email: guard.auth.user.email ?? null, role: 'admin' } as any,
          action: 'create', entity: 'exercise_import', entityId: id,
          coursId: row.cours_id, coursTitre: row.cours?.titre,
          description: `Import d’exercices analysé : ${resultat.questions.length} exercice(s), verdict ${resultat.fiabilite.verdict}, ${lotsTotal()} lot(s)${resultat.meta.relances.lots ? ` + ${resultat.meta.relances.lots} relance(s)` : ''}, ${p.plan.nbPagesSujet} page(s), ${resultat.fiabilite.imagesRattachees} image(s), ${p.cout.usd.toFixed(2)} $`,
        });

        return NextResponse.json({
          ok: true, id, done: true, questions: resultat.questions.length, verdict: resultat.fiabilite.verdict,
          progress: { etape: 'ready', lotsFaits: lotsFaits(), lotsTotal: lotsTotal(), exercices: resultat.questions.length, coutUsd: p.cout.usd },
        });
      }
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Échec de l’analyse.';
    console.error('[import-exercices/analyse]', { id, etape: progression?.etape, message });
    if (progression) progression.verrou = null;
    const etape = progression?.etape ? ` (étape : ${progression.etape})` : '';
    await a.from('exercise_imports').update({
      status: 'failed', error_message: `${message}${etape} — relancez l’import, il reprend à cette étape.`, updated_at: new Date().toISOString(),
      ...(progression ? { result: progression } : {}),
    }).eq('id', id);
    return NextResponse.json({ ok: false, error: `${message}${etape}` }, { status: 502 });
  }
}
