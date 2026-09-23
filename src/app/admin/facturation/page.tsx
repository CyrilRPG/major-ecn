import { EDN_FACULTE_ID } from '@/lib/data/faculte';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient, createAdminClientToutesFacultes } from '@/lib/supabase/admin';
import { BILLING_EUR, GEN_FEATURE, IMAGERIE_COLLEGE_ID, ODONTOLOGIE_COLLEGE_ID, billingLinePrices } from '@/lib/ai/cost';
import { fetchAllRows } from '@/lib/supabase/fetch-all-pure';
import { FacturationDashboard, type ArticleBillingLine, type CourseLine, type ExerciseImportBillingLine } from '@/components/admin/facturation-dashboard';

export const metadata = { title: 'Facturation IA' };
export const dynamic = 'force-dynamic';

/** Facturation IA — calculé en direct sur le contenu disponible. */
export default async function AdminFacturationPage() {
  await requireAdmin();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;
  /*
    Facturation IA COMMUNE aux deux plateformes.

    Major Odontologie tourne sur le même projet Supabase et n'a pas de compte de
    facturation propre : ce qui y est produit par IA — import d'exercices, import
    d'articles de blog — est refacturé ici (arbitrage de Cyril, 11/09/2026).
    Ces deux lectures-là passent donc par un client NON cloisonné ; tout le reste
    de la page reste borné à Major ECN.
  */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toutes = createAdminClientToutesFacultes() as any;

  const [coursRes, aiRes, examCountRes, qrocCountRes, genExamRes, genInterroRes, importsRes, articlesRes, odontoRes, genArenaRes, imagerieRes] = await Promise.all([
    // Par tranches : PostgREST tronque en silence à 1 000 lignes, et la RPC en renvoie
    // davantage (1 067 au 23/09/2026 — 61 items facturables manquaient à la facture).
    fetchAllRows((de: number, a2: number) => a.rpc('admin_facturation_lines', { p_faculte_id: EDN_FACULTE_ID }).order('line_id').range(de, a2))
      .then((rows) => ({ data: rows })),
    a.from('ai_generations').select('id', { count: 'exact', head: true }).eq('feature', 'assistant_chat').eq('status', 'success'),
    // Épreuves blanches : facturées 1 c / épreuve + 0,5 c / QROC.
    a.from('mock_exams').select('id', { count: 'exact', head: true }).neq('status', 'archived').is('cours_id', null),
    a.from('mock_exam_questions').select('id', { count: 'exact', head: true }).eq('format', 'qroc'),
    // Générations IA facturées au forfait (uniquement les réussites).
    a.from('ai_generations').select('id', { count: 'exact', head: true }).eq('feature', GEN_FEATURE.epreuve).eq('status', 'success'),
    a.from('ai_generations').select('id', { count: 'exact', head: true }).eq('feature', GEN_FEATURE.interrogation).eq('status', 'success'),
    // Import d'exercices : seuls les imports PUBLIÉS sont facturés (arbitrage de Cyril, 11/09/2026).
    // Les deux facultés, Major Odontologie comprise — voir le commentaire ci-dessus.
    toutes.from('exercise_imports').select('id, title, billed_price_cents, result, created_at, faculte_id').eq('status', 'published').not('billed_price_cents', 'is', null),
    // Articles de blog importés par IA : forfait 2,50 € par génération réussie,
    // sur l'une ou l'autre plateforme.
    toutes.from('ai_generations').select('id, cours_titre, items_count, created_at, faculte_id').eq('feature', GEN_FEATURE.article).eq('status', 'success').order('created_at', { ascending: false }),
    // Collège Odontologie et ses sous-collèges : la RPC renvoie le nom du
    // sous-collège, la facture les regroupe sous le collège parent.
    a.from('matieres').select('id, nom').or(`id.eq.${ODONTOLOGIE_COLLEGE_ID},parent_matiere_id.eq.${ODONTOLOGIE_COLLEGE_ID}`),
    // EVC Arena : corrigés de manche rédigés par IA, forfait 1 € par document.
    a.from('ai_generations').select('id', { count: 'exact', head: true }).eq('feature', GEN_FEATURE.arenaCorrections).eq('status', 'success'),
    // Collège Imagerie médicale et ses sous-collèges : DP et questions isolées à 7 € l'item.
    a.from('matieres').select('id, nom').or(`id.eq.${IMAGERIE_COLLEGE_ID},parent_matiere_id.eq.${IMAGERIE_COLLEGE_ID}`),
  ]);
  const examsCount = examCountRes.count ?? 0;
  const qrocCount = qrocCountRes.count ?? 0;
  const generations = { epreuves: genExamRes.count ?? 0, interrogations: genInterroRes.count ?? 0, arena: genArenaRes.count ?? 0 };
  const odontoMatieres = (odontoRes.data ?? []) as { id: string; nom: string }[];
  const odontoNom = odontoMatieres.find((m) => m.id === ODONTOLOGIE_COLLEGE_ID)?.nom ?? 'Odontologie';
  const odontoSousColleges = new Set(odontoMatieres.filter((m) => m.id !== ODONTOLOGIE_COLLEGE_ID).map((m) => m.nom));
  const imagerieNoms = new Set(((imagerieRes.data ?? []) as { id: string; nom: string }[]).map((m) => m.nom));

  const lines: CourseLine[] = (coursRes.data ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c: any) => {
      const decouverte = !!c.is_decouverte || c.matiere_nom === 'Découverte';
      const matiere = (c.matiere_nom as string) ?? '—';
      // Odontologie : QCM / rédactionnel à 2,50 € le cours (voir BILLING_EUR).
      const odontologie = matiere === odontoNom || odontoSousColleges.has(matiere);
      const line = {
        is_mg: !!c.is_mg,
        is_decouverte: decouverte,
        is_odontologie: odontologie,
        // Imagerie médicale : DP et questions isolées à 7 € l'item (voir BILLING_EUR).
        is_imagerie: imagerieNoms.has(matiere),
        has_fiche: !!c.has_fiche,
        n_series: Number(c.n_series ?? 0),
        n_flash: Number(c.n_flash ?? 0),
      };
      const p = billingLinePrices(line);
      return {
        id: c.line_id as string,
        titre: c.titre as string,
        matiere: odontologie ? odontoNom : matiere,
        fichePrice: p.fiche,
        qcmPrice: p.qcm,
        flashPrice: p.flash,
        nSeries: line.n_series,
        nFlash: line.n_flash,
        isMg: line.is_mg,
        decouverte,
      };
    },
  );

  const aiResponses = aiRes.count ?? 0;
  /** Ligne produite sur l'autre plateforme : le libellé le dit, pour qu'une
   *  facture reste lisible une fois imprimée. */
  const marqueOdonto = (faculteId: string | null | undefined, titre: string) =>
    faculteId && faculteId !== EDN_FACULTE_ID ? `${titre} (Major Odonto)` : titre;

  const exerciseImports: ExerciseImportBillingLine[] = ((importsRes.data ?? []) as Array<{ id: string; title: string; billed_price_cents: number; result: { questions?: unknown[] } | null; created_at: string; faculte_id: string | null }>)
    .map((row) => ({ id: row.id, title: marqueOdonto(row.faculte_id, row.title), cents: row.billed_price_cents, questions: row.result?.questions?.length ?? 0, createdAt: row.created_at }));

  const articles: ArticleBillingLine[] = ((articlesRes.data ?? []) as Array<{ id: string; cours_titre: string | null; items_count: number | null; created_at: string; faculte_id: string | null }>)
    .map((row) => ({ id: row.id, title: marqueOdonto(row.faculte_id, row.cours_titre ?? 'Article sans titre'), blocks: row.items_count ?? 0, createdAt: row.created_at }));

  return (
    <FacturationDashboard
      lines={lines}
      aiResponses={aiResponses}
      epreuves={{ exams: examsCount, qroc: qrocCount }}
      generations={generations}
      exerciseImports={exerciseImports}
      articles={articles}
      tarifs={{
        fiche: BILLING_EUR.fiche,
        qcm: BILLING_EUR.qcm_per_course,
        flash: BILLING_EUR.flashcards_per_course,
        ia: BILLING_EUR.ai_response,
      }}
    />
  );
}
