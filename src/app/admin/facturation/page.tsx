import { ClipboardList, FileText, Layers3, MessageSquare, Receipt } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/require-role';
import { createAdminClient } from '@/lib/supabase/admin';
import { BILLING_EUR, DECOUVERTE_COLLEGE_ID } from '@/lib/ai/cost';

export const metadata = { title: 'Facturation IA' };
export const dynamic = 'force-dynamic';

/**
 * Facturation IA — calculée EN DIRECT à partir du contenu réellement disponible
 * (et non d'un journal de générations) :
 *   - tous les QCM + DP d'un cours → 3 € · une fiche → 10 € · toutes les
 *     flashcards d'un cours → 5 € · une réponse de l'assistant IA → 0,10 €.
 *   - Cours du collège Découverte : seule la fiche est facturée.
 * Une ligne par cours facturé, en précisant le cours.
 */
export default async function AdminFacturationPage() {
  await requireAdmin();
  const admin = createAdminClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = admin as any;

  const [coursRes, fichesRes, flashRes, seriesRes, aiRes] = await Promise.all([
    a.from('cours').select('id, titre, matiere_id, matieres(nom)'),
    a.from('fiches').select('cours_id, storage_path, content_html'),
    a.from('flashcards').select('cours_id'),
    a.from('qcm_series').select('cours_id, type, qcm_questions(id)'),
    a.from('ai_generations').select('id', { count: 'exact', head: true }).eq('feature', 'assistant_chat'),
  ]);

  // Présence de contenu par cours.
  const ficheSet = new Set<string>();
  for (const f of fichesRes.data ?? []) if (f.storage_path || f.content_html) ficheSet.add(f.cours_id);
  const flashSet = new Set<string>();
  for (const f of flashRes.data ?? []) flashSet.add(f.cours_id);
  const qcmSet = new Set<string>();
  for (const s of seriesRes.data ?? []) {
    if (s.type === 'qcm' && (s.qcm_questions?.length ?? 0) > 0) qcmSet.add(s.cours_id);
  }

  type Item = { label: string; price: number; tone: 'fiche' | 'qcm' | 'flash' };
  type Line = { id: string; titre: string; matiere: string; decouverte: boolean; items: Item[]; subtotal: number };
  const lines: Line[] = [];
  for (const c of coursRes.data ?? []) {
    const decouverte = c.matiere_id === DECOUVERTE_COLLEGE_ID;
    const items: Item[] = [];
    if (ficheSet.has(c.id)) items.push({ label: 'Fiche', price: BILLING_EUR.fiche, tone: 'fiche' });
    if (!decouverte && qcmSet.has(c.id)) items.push({ label: 'QCM + DP', price: BILLING_EUR.qcm_per_course, tone: 'qcm' });
    if (!decouverte && flashSet.has(c.id)) items.push({ label: 'Flashcards', price: BILLING_EUR.flashcards_per_course, tone: 'flash' });
    const subtotal = items.reduce((s, i) => s + i.price, 0);
    if (subtotal > 0) {
      const matiere = (Array.isArray(c.matieres) ? c.matieres[0]?.nom : c.matieres?.nom) ?? '—';
      lines.push({ id: c.id, titre: c.titre, matiere, decouverte, items, subtotal });
    }
  }
  lines.sort((x, y) => x.matiere.localeCompare(y.matiere) || x.titre.localeCompare(y.titre));

  const aiResponses = aiRes.count ?? 0;
  const aiTotal = aiResponses * BILLING_EUR.ai_response;
  const contentTotal = lines.reduce((s, l) => s + l.subtotal, 0);
  const grandTotal = contentTotal + aiTotal;
  const eur = (n: number) => `${n.toFixed(2)} €`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-(--color-primary-soft) text-(--color-primary)">
          <Receipt className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-(--color-ink)">Facturation IA</h1>
          <p className="text-sm text-(--color-ink-soft)">
            Calcul en direct du contenu disponible : QCM + DP d’un cours 3 € · fiche 10 € · flashcards d’un cours 5 € ·
            réponse assistant IA 0,10 €. Cours Découverte : fiche seule.
          </p>
        </div>
      </header>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Kpi label="Total à régler" value={eur(grandTotal)} Icon={Receipt} primary />
        <Kpi label="Cours facturés" value={`${lines.length}`} Icon={FileText} />
        <Kpi label="Réponses IA" value={`${aiResponses} · ${eur(aiTotal)}`} Icon={MessageSquare} />
        <Kpi label="Contenu pédagogique" value={eur(contentTotal)} Icon={Layers3} />
      </div>

      {/* TABLE par cours */}
      <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
        {lines.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-(--color-ink-soft)">
            Aucun contenu facturable pour l’instant.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-(--color-surface-soft) text-xs uppercase tracking-wider text-(--color-ink-soft)">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Cours</th>
                  <th className="hidden px-4 py-3 text-left font-semibold sm:table-cell">Matière</th>
                  <th className="px-4 py-3 text-left font-semibold">Contenus facturés</th>
                  <th className="px-4 py-3 text-right font-semibold">Sous-total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--color-border)">
                {lines.map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-2.5">
                      <p className="truncate font-medium text-(--color-ink)">{l.titre}</p>
                      {l.decouverte && <span className="text-[11px] text-(--color-ink-muted)">Découverte · fiche seule</span>}
                    </td>
                    <td className="hidden px-4 py-2.5 text-(--color-ink-soft) sm:table-cell">{l.matiere}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {l.items.map((it) => (
                          <span
                            key={it.label}
                            className={
                              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ' +
                              (it.tone === 'fiche'
                                ? 'bg-[#EEF0F3] text-[#1C2E49]'
                                : it.tone === 'qcm'
                                ? 'bg-(--color-surface-soft) text-(--color-ink-soft) border border-(--color-border)'
                                : 'bg-(--color-primary-soft) text-(--color-primary)')
                            }
                          >
                            {it.tone === 'fiche' ? <FileText className="h-3 w-3" /> : it.tone === 'qcm' ? <ClipboardList className="h-3 w-3" /> : <Layers3 className="h-3 w-3" />}
                            {it.label} · {it.price} €
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-(--color-ink)">{eur(l.subtotal)}</td>
                  </tr>
                ))}
                {aiResponses > 0 && (
                  <tr className="bg-(--color-surface-soft)/50">
                    <td className="px-4 py-2.5">
                      <p className="font-medium text-(--color-ink)">Réponses de l’assistant IA</p>
                    </td>
                    <td className="hidden px-4 py-2.5 text-(--color-ink-soft) sm:table-cell">—</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1 rounded-full bg-(--color-primary-soft) px-2 py-0.5 text-[11px] font-semibold text-(--color-primary)">
                        <MessageSquare className="h-3 w-3" /> {aiResponses} réponse{aiResponses > 1 ? 's' : ''} · 0,10 €
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-semibold text-(--color-ink)">{eur(aiTotal)}</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-(--color-border) bg-(--color-surface-soft)">
                  <td className="px-4 py-3 font-bold text-(--color-ink)" colSpan={3}>Total à régler</td>
                  <td className="px-4 py-3 text-right tabular-nums text-base font-bold text-(--color-primary)">{eur(grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({
  label, value, Icon, primary = false,
}: { label: string; value: string; Icon: typeof Receipt; primary?: boolean }) {
  return (
    <div className={
      'relative overflow-hidden rounded-2xl border p-4 shadow-(--shadow-soft) ' +
      (primary ? 'border-(--color-primary)/30 bg-(--color-primary-soft)' : 'border-(--color-border) bg-(--color-surface)')
    }>
      <div className="flex items-start gap-3">
        <span className={
          'flex h-9 w-9 items-center justify-center rounded-xl ' +
          (primary ? 'bg-(--color-primary) text-white' : 'bg-(--color-primary-soft) text-(--color-primary)')
        }>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-(--color-ink-muted)">{label}</p>
          <p className="mt-0.5 font-display text-xl font-bold tracking-tight tabular-nums text-(--color-ink)">{value}</p>
        </div>
      </div>
    </div>
  );
}
