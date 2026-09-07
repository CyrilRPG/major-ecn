'use client';

/**
 * Audit des corrigés — lancement (périmètre + estimation), suivi des audits
 * (soumission puis récolte par appels successifs), accès aux constats.
 */
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ChevronDown, Loader2, Play, RefreshCw, Search, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { fetchAuthentifie } from '@/lib/auth/fresh-token';
import { annulerAuditAction, creerAuditAction, estimerAuditAction } from '@/app/admin/audit-corriges/actions';

export type CollegeOption = { id: string; nom: string; parentNom: string | null; nbCours: number };
export type AuditKindOption = 'coherence' | 'justifications';
const KIND_LABEL: Record<AuditKindOption, string> = { coherence: 'Cohérence clé ↔ justification', justifications: 'Justifications vides ou recopiées (rédaction)' };
export type AuditRunView = {
  id: string; collegeNom: string | null; model: string; kind: AuditKindOption; status: string;
  nbQuestions: number; nbItems: number; nbRequetes: number; nbConstats: number; nbOuverts: number;
  coutEstimeUsd: number | null; coutUsd: number; lotsTotal: number; lotsRecoltes: number; restants: number;
  createdAt: string; finishedAt: string | null; error: string | null;
};

const STATUT: Record<string, { label: string; className: string }> = {
  preparation: { label: 'À lancer', className: 'bg-slate-100 text-slate-700' },
  en_cours: { label: 'En cours', className: 'bg-amber-100 text-amber-800' },
  termine: { label: 'Terminé', className: 'bg-green-100 text-green-800' },
  echec: { label: 'Échec', className: 'bg-red-100 text-red-800' },
  annule: { label: 'Annulé', className: 'bg-slate-100 text-slate-700' },
};
const usd = (n: number) => `${n.toFixed(2)} $`;

export function AuditCorrigesPanel({ colleges, runs, models }: { colleges: CollegeOption[]; runs: AuditRunView[]; models: Record<AuditKindOption, string> }) {
  const router = useRouter();
  const [collegeId, setCollegeId] = useState<string>('');
  const [kind, setKind] = useState<AuditKindOption>('coherence');
  const model = models[kind];
  const [estimation, setEstimation] = useState<{ nbQuestions: number; nbItems: number; coutUsd: number; partiel: boolean } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [etape, setEtape] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const estimer = () => {
    setErreur(null); setEstimation(null);
    start(async () => {
      const r = await estimerAuditAction({ collegeId: collegeId || null, kind });
      if (!r.ok) setErreur(r.error); else setEstimation(r);
    });
  };

  type Reponse = { ok?: boolean; error?: string; done?: boolean; status?: string; [k: string]: unknown };
  const n = (v: unknown) => Number(v ?? 0);
  const boucler = async (url: string, runId: string, libelle: (p: Reponse) => string): Promise<Reponse> => {
    for (let tour = 0; tour < 300; tour++) {
      const res = await fetchAuthentifie(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ runId }) });
      const payload = (await res.json().catch(() => null)) as Reponse | null;
      if (!res.ok || !payload?.ok) throw new Error(payload?.error ?? `Échec (code ${res.status}).`);
      router.refresh();
      if (payload.done) return payload;
      setEtape(libelle(payload));
    }
    throw new Error('Trop d’appels successifs : reprenez depuis la liste.');
  };

  const lancer = () => {
    if (!estimation) return;
    if (!confirm(`Lancer « ${KIND_LABEL[kind]} » sur ${estimation.nbQuestions.toLocaleString('fr-FR')} questions (${estimation.nbItems.toLocaleString('fr-FR')} propositions) ?\nCoût IA estimé : ${usd(estimation.coutUsd)} (${model}, tarif Batch).`)) return;
    setErreur(null);
    start(async () => {
      try {
        const cree = await creerAuditAction({ collegeId: collegeId || null, kind, coutEstimeUsd: estimation.coutUsd });
        if (!cree.ok) { setErreur(cree.error); return; }
        setEtape('Soumission des lots…');
        await boucler('/api/admin/audit-corriges/lancer', cree.runId, (p) => `Soumission : ${n(p.batches)} lot(s) créés, ${n(p.restants)} collège(s) restant(s)…`);
        setEstimation(null);
        router.refresh();
      } catch (e) {
        setErreur(e instanceof Error ? e.message : 'Lancement impossible.');
      } finally {
        setEtape(null);
      }
    });
  };

  const reprendre = (runId: string) => {
    setErreur(null);
    start(async () => {
      try {
        setEtape('Reprise de la soumission…');
        await boucler('/api/admin/audit-corriges/lancer', runId, (p) => `Soumission : ${n(p.restants)} collège(s) restant(s)…`);
      } catch (e) { setErreur(e instanceof Error ? e.message : 'Reprise impossible.'); } finally { setEtape(null); }
    });
  };

  const recolter = (runId: string) => {
    setErreur(null);
    start(async () => {
      try {
        setEtape('Récolte des lots terminés…');
        const p = await boucler('/api/admin/audit-corriges/recolter', runId, (p) => `Récolte : ${n(p.lotsTotal) - n(p.lotsRestants)}/${n(p.lotsTotal)} lots, ${n(p.nbConstats)} constat(s)…`);
        if (p.status !== 'termine') setEtape(null);
      } catch (e) { setErreur(e instanceof Error ? e.message : 'Récolte impossible.'); } finally { setEtape(null); }
    });
  };

  const annuler = (runId: string) => {
    if (!confirm('Annuler cet audit ? Les lots non récoltés seront annulés chez Anthropic.')) return;
    start(async () => { const r = await annulerAuditAction(runId); if (!r.ok) setErreur(r.error); else router.refresh(); });
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 shadow-(--shadow-soft)">
          <h2 className="text-sm font-semibold text-(--color-ink)">Nouvel audit</h2>
          <p className="mt-1 text-xs text-(--color-ink-muted)">
            Chaque question est relue par le modèle avec ses propositions, ses clés et ses justifications ; il relève celles dont la clé contredit la justification
            (en tenant compte des questions « quelles propositions sont fausses ? »). Les constats sont ensuite relus ici, un par un.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
            <label className="block text-xs font-medium text-(--color-ink-soft)">Type de passage
              <span className="relative mt-1 block">
                <select value={kind} onChange={(e) => { setKind(e.target.value as AuditKindOption); setEstimation(null); }} className="h-10 w-full appearance-none rounded-lg border border-(--color-border) bg-white px-3 pr-8 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)">
                  <option value="coherence">{KIND_LABEL.coherence}</option>
                  <option value="justifications">{KIND_LABEL.justifications}</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-3 h-4 w-4 text-(--color-ink-muted)" />
              </span>
            </label>
            <label className="block text-xs font-medium text-(--color-ink-soft)">Périmètre
              <span className="relative mt-1 block">
                <select value={collegeId} onChange={(e) => { setCollegeId(e.target.value); setEstimation(null); }} className="h-10 w-full appearance-none rounded-lg border border-(--color-border) bg-white px-3 pr-8 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)">
                  <option value="">Toute la plateforme ({colleges.length} collèges)</option>
                  {colleges.map((c) => <option key={c.id} value={c.id}>{c.parentNom ? `${c.parentNom} › ` : ''}{c.nom} · {c.nbCours} item{c.nbCours > 1 ? 's' : ''}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-3 h-4 w-4 text-(--color-ink-muted)" />
              </span>
            </label>
            <Button variant="outline" onClick={estimer} disabled={pending}><Search /> Estimer</Button>
          </div>
          {estimation && (
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#C9E6D5] bg-[#F3FBF6] p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[#124A2A]">
                <strong>{estimation.nbQuestions.toLocaleString('fr-FR')}</strong> questions · <strong>{estimation.nbItems.toLocaleString('fr-FR')}</strong> propositions{kind === 'justifications' ? ' à rédiger' : ''} ·
                coût IA estimé <strong>{usd(estimation.coutUsd)}</strong> <span className="text-xs text-[#38624A]">({model}, tarif Batch, résultats sous quelques heures{estimation.partiel ? ' · comptage interrompu par le délai : chiffres partiels, le coût réel sera calculé collège par collège' : ''})</span>
              </p>
              <Button onClick={lancer} disabled={pending}>{pending ? <Loader2 className="animate-spin" /> : <Play />} Lancer l’audit</Button>
            </div>
          )}
          {etape && <p className="mt-3 inline-flex items-center gap-2 text-xs text-(--color-ink-soft)"><Loader2 className="h-3.5 w-3.5 animate-spin" /> {etape}</p>}
          {erreur && <div role="alert" className="mt-4 flex gap-2 rounded-xl bg-[#FFF1F2] p-3 text-sm text-[#B4233C]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{erreur}</div>}
        </div>
        <aside className="h-fit rounded-2xl border border-(--color-border) bg-(--color-surface-soft) p-5 text-xs leading-5 text-(--color-ink-soft)">
          <p className="flex items-center gap-2 text-sm font-semibold text-(--color-ink)"><ShieldCheck className="h-4 w-4 text-[#16793C]" /> Ce que l’audit ne fait pas</p>
          <p className="mt-2">Il ne juge pas la médecine : il vérifie que clé et justification disent la même chose. Un constat n’est jamais appliqué tout seul — vous choisissez d’inverser la clé (la justification avait raison) ou de réécrire la justification dans l’éditeur.</p>
          <p className="mt-2">Le passage « justifications » cible les propositions dont la justification est vide ou recopiée de l’énoncé (7 771 recopiées et 7 384 vides au 06/09/2026, surtout dans les DP Gériatrie) : le modèle rédige une justification cohérente avec la clé, que vous appliquez une par une ou toutes d’un coup.</p>
          <p className="mt-2">La récolte est automatique toutes les 30 minutes ; le bouton « Récolter » sert à ne pas attendre.</p>
        </aside>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-(--color-ink)">Audits</h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
          {runs.length === 0 ? <p className="px-5 py-10 text-center text-sm text-(--color-ink-muted)">Aucun audit pour le moment.</p> : (
            <div className="divide-y divide-(--color-border)">
              {runs.map((r) => (
                <div key={r.id} className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-(--color-ink)">{r.collegeNom ?? 'Toute la plateforme'} <span className="ml-1 rounded-full bg-(--color-surface-soft) px-2 py-0.5 text-[11px] font-medium text-(--color-ink-soft)">{KIND_LABEL[r.kind]}</span></p>
                    <p className="text-xs text-(--color-ink-muted)">
                      {new Date(r.createdAt).toLocaleString('fr-FR')} · {r.model} · {r.nbQuestions.toLocaleString('fr-FR')} questions · {r.nbRequetes.toLocaleString('fr-FR')} requêtes
                      {r.status === 'en_cours' && <> · lots récoltés {r.lotsRecoltes}/{r.lotsTotal}{r.restants > 0 ? ` · ${r.restants} collège(s) à soumettre` : ''}</>}
                      {' · '}coût {usd(r.coutUsd)}{r.coutEstimeUsd != null ? ` (estimé ${usd(r.coutEstimeUsd)})` : ''}
                    </p>
                    {r.error && <p className="mt-1 text-xs text-[#B4233C]">{r.error}</p>}
                  </div>
                  <span className={cn('w-fit rounded-full px-2.5 py-1 text-xs font-semibold', STATUT[r.status]?.className)}>{STATUT[r.status]?.label ?? r.status}</span>
                  <span className="text-sm font-semibold tabular-nums text-(--color-ink)">{r.nbConstats} constat{r.nbConstats > 1 ? 's' : ''}{r.nbOuverts > 0 && <span className="ml-1 text-xs font-medium text-amber-700">({r.nbOuverts} à traiter)</span>}</span>
                  <div className="flex gap-2">
                    {r.nbConstats > 0 && <Button asChild size="sm"><Link href={`/admin/audit-corriges/${r.id}`}>{r.kind === 'justifications' ? 'Relire les rédactions' : 'Relire les constats'}</Link></Button>}
                    {(r.status === 'preparation' || (r.status === 'en_cours' && r.restants > 0)) && <Button size="sm" variant="outline" onClick={() => reprendre(r.id)} disabled={pending}><Play /> Soumettre</Button>}
                    {r.status === 'en_cours' && r.restants === 0 && <Button size="sm" variant="outline" onClick={() => recolter(r.id)} disabled={pending}><RefreshCw /> Récolter</Button>}
                    {(r.status === 'en_cours' || r.status === 'preparation') && <Button size="sm" variant="ghost" onClick={() => annuler(r.id)} disabled={pending} aria-label="Annuler"><X /></Button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
