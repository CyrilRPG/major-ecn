/* eslint-disable @typescript-eslint/no-explicit-any */
import { ShieldCheck } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { EmptyState } from '@/components/empty-state';
import { AuditCorrigesPanel, type AuditRunView, type CollegeOption } from '@/components/admin/audit-corriges/audit-corriges-panel';
import { listerColleges, QCM_AUDIT_MODEL, QCM_AUDIT_MODEL_REDACTION, estTableAuditAbsente, MESSAGE_AUDIT_TABLE_ABSENTE, type AuditRun } from '@/lib/qcm-audit/serveur';

export const metadata = { title: 'Audit des corrigés' };
export const dynamic = 'force-dynamic';
/** L'estimation du passage « justifications » charge les questions d'un collège : plus que le délai par défaut. */
export const maxDuration = 300;

/**
 * « Audit des corrigés » — cohérence clé ↔ justification de toutes les
 * propositions QCM, par lots IA, avec relecture des constats.
 */
export default async function AuditCorrigesPage() {
  await requireAdmin();
  const admin = createAdminClient() as any;
  const [colleges, runsRes] = await Promise.all([
    listerColleges(),
    admin.from('qcm_audit_runs').select('*').order('created_at', { ascending: false }).limit(40),
  ]);
  const indisponible = estTableAuditAbsente(runsRes.error);
  if (runsRes.error && !indisponible) throw runsRes.error;

  const runs = (runsRes.data ?? []) as AuditRun[];
  // Constats encore ouverts par audit (une requête groupée).
  const ouverts = new Map<string, number>();
  if (runs.length > 0) {
    const { data } = await admin.from('qcm_audit_findings').select('run_id').eq('statut', 'ouvert').in('run_id', runs.map((r) => r.id)).limit(20000);
    for (const f of (data ?? []) as { run_id: string }[]) ouverts.set(f.run_id, (ouverts.get(f.run_id) ?? 0) + 1);
  }

  const parId = new Map(colleges.map((c) => [c.id, c]));
  const options: CollegeOption[] = colleges.map((c) => ({ id: c.id, nom: c.nom, parentNom: c.parentId ? parId.get(c.parentId)?.nom ?? null : null, nbCours: c.nbCours }));
  const vues: AuditRunView[] = runs.map((r) => ({
    id: r.id, collegeNom: r.college_nom, model: r.model, kind: r.kind ?? 'coherence', status: r.status,
    nbQuestions: r.nb_questions, nbItems: r.nb_items, nbRequetes: r.nb_requetes, nbConstats: r.nb_constats, nbOuverts: ouverts.get(r.id) ?? 0,
    coutEstimeUsd: r.cout_estime_usd == null ? null : Number(r.cout_estime_usd), coutUsd: Number(r.cout_usd),
    lotsTotal: r.batches.length, lotsRecoltes: r.batches.filter((b) => b.collected).length, restants: r.restants.length,
    createdAt: r.created_at, finishedAt: r.finished_at, error: r.error_message,
  }));

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 flex flex-col justify-between gap-3 border-b border-(--color-border) pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-(--color-ink-muted)">Administration · Pédagogie</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-(--color-ink)">Audit des corrigés</h1>
          <p className="mt-1 text-sm text-(--color-ink-soft)">Détecte les propositions dont la clé (vrai / faux) contredit leur propre justification, puis corrige-les une par une.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#EEF6FF] px-3 py-1.5 text-xs font-semibold text-[#1E4D8B]"><ShieldCheck className="h-4 w-4" /> Lecture : {QCM_AUDIT_MODEL} · Rédaction : {QCM_AUDIT_MODEL_REDACTION}</span>
      </header>
      {indisponible ? (
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface)"><EmptyState icon={ShieldCheck} title="Base de données à mettre à jour" description={MESSAGE_AUDIT_TABLE_ABSENTE} /></div>
      ) : (
        <AuditCorrigesPanel colleges={options} runs={vues} models={{ coherence: QCM_AUDIT_MODEL, justifications: QCM_AUDIT_MODEL_REDACTION }} />
      )}
    </main>
  );
}
