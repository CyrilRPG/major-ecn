/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { AuditFindingsList, type FiltreConstat, type FindingView } from '@/components/admin/audit-corriges/audit-findings-list';
import { lireRun } from '@/lib/qcm-audit/serveur';

export const dynamic = 'force-dynamic';

/** Relecture des constats d'UN audit. */
export default async function AuditRunPage({ params, searchParams }: { params: Promise<{ run: string }>; searchParams: Promise<{ filtre?: string }> }) {
  await requireAdmin();
  const { run: runId } = await params;
  const { filtre: f } = await searchParams;
  const filtre: FiltreConstat = f === 'traite' || f === 'all' ? f : 'ouvert';
  const run = await lireRun(runId).catch(() => null);
  if (!run) notFound();

  const admin = createAdminClient() as any;
  const { data, error } = await admin.from('qcm_audit_findings')
    .select('id, item_id, question_id, cours_id, lettre, is_correct_actuel, polarite_justification, gravite, motif, proposition, enonce_question, enonce_item, justification, statut, cours:cours_id(titre, matieres(nom, parent:parent_matiere_id(nom)))')
    .eq('run_id', runId)
    .order('gravite').order('created_at')
    .limit(5000);
  if (error) throw error;

  type Row = {
    id: string; item_id: string; question_id: string; cours_id: string | null; lettre: string; is_correct_actuel: boolean;
    polarite_justification: string; gravite: 'incoherent' | 'douteux' | 'justification'; motif: string | null; proposition: string | null; enonce_question: string | null;
    enonce_item: string; justification: string; statut: string;
    cours: { titre: string; matieres: { nom: string; parent: { nom: string } | null } | null } | null;
  };
  const toutes: FindingView[] = ((data ?? []) as Row[]).map((r) => ({
    id: r.id, itemId: r.item_id, questionId: r.question_id, coursId: r.cours_id,
    coursTitre: r.cours?.titre ?? 'Item inconnu',
    collegeNom: r.cours?.matieres?.parent?.nom ? `${r.cours.matieres.parent.nom} › ${r.cours.matieres.nom}` : (r.cours?.matieres?.nom ?? ''),
    lettre: r.lettre, isCorrectActuel: r.is_correct_actuel, polarite: r.polarite_justification, gravite: r.gravite, motif: r.motif, proposition: r.proposition,
    enonceQuestion: r.enonce_question ?? '', enonceItem: r.enonce_item, justification: r.justification, statut: r.statut,
  }));
  const compteurs: Record<FiltreConstat, number> = {
    ouvert: toutes.filter((x) => x.statut === 'ouvert').length,
    traite: toutes.filter((x) => x.statut !== 'ouvert').length,
    all: toutes.length,
  };
  const findings = filtre === 'all' ? toutes : toutes.filter((x) => (filtre === 'ouvert' ? x.statut === 'ouvert' : x.statut !== 'ouvert'));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <Link href="/admin/audit-corriges" className="inline-flex items-center gap-1.5 text-sm font-medium text-(--color-ink-soft) hover:text-(--color-ink)"><ArrowLeft className="h-4 w-4" /> Audits</Link>
      <header className="mb-6 mt-2 border-b border-(--color-border) pb-5">
        <p className="text-xs font-medium text-(--color-ink-muted)">Audit des corrigés · {run.college_nom ?? 'Toute la plateforme'} · {new Date(run.created_at).toLocaleString('fr-FR')}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-(--color-ink)">{run.nb_constats} {run.kind === 'justifications' ? 'rédaction' : 'constat'}{run.nb_constats > 1 ? 's' : ''} sur {run.nb_items.toLocaleString('fr-FR')} propositions{run.kind === 'justifications' ? ' à rédiger' : ''}</h1>
        <p className="mt-1 text-sm text-(--color-ink-soft)">
          {run.kind === 'justifications'
            ? 'Pour chaque proposition dont la justification était vide ou recopiée : le texte rédigé par le modèle, cohérent avec la clé. Appliquez-le, ou écartez-le.'
            : 'Pour chaque constat : la clé actuelle, la justification, et ce que le modèle y a lu. Décidez qui a raison ; « Inverser la clé » resynchronise aussi la réponse attendue de la question.'}
        </p>
      </header>
      <AuditFindingsList runId={runId} findings={findings} filtre={filtre} compteurs={compteurs} />
    </main>
  );
}
