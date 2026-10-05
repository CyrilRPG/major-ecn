'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, InlineStatus, NativeSelect } from '@/components/admin/suivi/ui';
import { saveItemAction, type ItemInput } from '@/app/admin/planificateur/actions';
import { MATRIX_CRITERIA, MATRIX_CRITERIA_LABEL, type MatrixCriteria } from '@/lib/plan/config';
import { parseOccurrences } from '@/lib/plan/import';
import type { PlanItem } from '@/lib/plan/types';

export type CoursOption = { id: string; titre: string; matiere_id: string };

/**
 * Création / édition d'un item de la matrice (§3, §4, §9.5, §34) : critères
 * de la matrice maître, niveaux P1–P4 par voie, pertinence 2026 distincte de
 * l'historique, notions incontournables, hard_priority (back-office seul),
 * domaine et ordre d'affichage (structure variable).
 */
export function ItemForm({ item, colleges, cours, domains, defaultCollege }: {
  item: PlanItem | null; colleges: { id: string; nom: string; parent: string | null }[]; cours: CoursOption[]; domains: { id: string; label: string }[]; defaultCollege?: string;
}) {
  const router = useRouter();
  const crit = (item?.criteres ?? {}) as Partial<MatrixCriteria>;
  const [f, setF] = useState({
    specialite_id: item?.specialite_id ?? defaultCollege ?? colleges[0]?.id ?? '', cours_id: item?.cours_id ?? '', code: item?.code ?? '', nom_item: item?.nom_item ?? '',
    volume: String(item?.volume ?? 3), temps_reference: item?.temps_reference ? String(item.temps_reference) : '', annees: (item?.annees_occurrence ?? []).join('; '),
    recence: item?.recence ? String(item.recence) : '', actif: item?.actif ?? true, notes: item?.notes ?? '',
    domain_id: item?.domain_id ?? '', display_order: item?.display_order != null ? String(item.display_order) : '',
    priorite_interne: item?.priorite_interne ?? '', priorite_externe: item?.priorite_externe ?? '',
    criteres: Object.fromEntries(MATRIX_CRITERIA.map((k) => [k, crit[k] !== undefined ? String(crit[k]) : ''])) as Record<keyof MatrixCriteria, string>,
    pertinence_2026: item?.pertinence_2026 != null ? String(item.pertinence_2026) : '', pertinence_2026_active: !!item?.pertinence_2026_active,
    incontournables: (item?.notions_incontournables ?? []).join('\n'), difficulte: item?.difficulte ? String(item.difficulte) : '', besoin: item?.besoin_entrainement ? String(item.besoin_entrainement) : '',
    hard: !!item?.hard_priority,
    occurrences: (item?.occurrence_details ?? []).map((o) => [o.annee, o.type, o.poids].filter((x) => x !== null && x !== undefined && x !== '').join(' ')).join(' ; '),
  });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [override, setOverride] = useState(false);
  const [pending, start] = useTransition();
  const coursOfSpe = cours.filter((c) => c.matiere_id === f.specialite_id || colleges.some((col) => col.parent === f.specialite_id && col.id === c.matiere_id));
  const critComplete = MATRIX_CRITERIA.every((k) => f.criteres[k] !== '');

  function submit() {
    setError(null); setStatus(null);
    const input: ItemInput & { hard_priority: boolean } = {
      specialite_id: f.specialite_id, cours_id: f.cours_id || null, code: f.code || null, nom_item: f.nom_item, volume: Number(f.volume),
      temps_reference: f.temps_reference ? Number(f.temps_reference) : null,
      // Les années de l'historique détaillé complètent la liste des années (une seule source de vérité).
      annees_occurrence: Array.from(new Set([...f.annees.split(/[;,\s]+/).map((x) => Number(x)), ...parseOccurrences(f.occurrences).map((o) => o.annee)]))
        .filter((n) => Number.isInteger(n) && n >= 1990 && n <= 2100),
      occurrence_details: parseOccurrences(f.occurrences),
      recence: f.recence ? Number(f.recence) : null, actif: f.actif, notes: f.notes || null,
      domain_id: f.domain_id || null, display_order: f.display_order ? Number(f.display_order) : null,
      priorite_interne: (f.priorite_interne || null) as ItemInput['priorite_interne'], priorite_externe: (f.priorite_externe || null) as ItemInput['priorite_externe'],
      criteres: critComplete ? Object.fromEntries(MATRIX_CRITERIA.map((k) => [k, Number(f.criteres[k])])) as MatrixCriteria : (item?.criteres as MatrixCriteria | null) ?? null,
      pertinence_2026: f.pertinence_2026 ? Number(f.pertinence_2026) : null, pertinence_2026_active: f.pertinence_2026_active,
      notions_incontournables: f.incontournables.split('\n').map((x) => x.trim()).filter(Boolean),
      difficulte: f.difficulte ? Number(f.difficulte) : null, besoin_entrainement: f.besoin ? Number(f.besoin) : null, hard_priority: f.hard,
    };
    start(async () => {
      const r = await saveItemAction(item?.id ?? null, input, override);
      if (!r.ok) { setError(r.error); return; }
      setStatus(r.warning ?? 'Enregistré.');
      if (!item) router.push(`/admin/planificateur/items/${r.id}`); else router.refresh();
    });
  }
  const sel = (value: string, on: (v: string) => void, opts: [string, string][]) => (
    <NativeSelect value={value} onChange={(e) => on(e.target.value)}>{opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</NativeSelect>
  );
  const one5: [string, string][] = [['', '—'], ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']];
  const lv: [string, string][] = [['', 'Déduit du score'], ['P1', 'P1 — indispensable'], ['P2', 'P2 — important'], ['P3', 'P3 — complémentaire'], ['P4', 'P4 — couverture si capacité']];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Field label="Nom de l’item" className="md:col-span-2"><Input value={f.nom_item} onChange={(e) => setF({ ...f, nom_item: e.target.value })} /></Field>
      <Field label="Code (facultatif)"><Input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} /></Field>
      <Field label="Spécialité (collège)">
        <NativeSelect value={f.specialite_id} onChange={(e) => setF({ ...f, specialite_id: e.target.value, cours_id: '' })}>
          {colleges.map((c) => <option key={c.id} value={c.id}>{c.parent ? '— ' : ''}{c.nom}</option>)}
        </NativeSelect>
      </Field>
      <Field label="Cours de la plateforme relié" hint="Sans cours relié, l’item n’est jamais proposé à l’élève." className="md:col-span-2">
        <NativeSelect value={f.cours_id} onChange={(e) => setF({ ...f, cours_id: e.target.value })}>
          <option value="">Aucun</option>{coursOfSpe.map((c) => <option key={c.id} value={c.id}>{c.titre}</option>)}
        </NativeSelect>
      </Field>
      <Field label="Domaine (structure hiérarchique)" hint={domains.length === 0 ? 'Préparation en structure plate : pas de domaine.' : undefined}>
        {sel(f.domain_id, (v) => setF({ ...f, domain_id: v }), [['', domains.length === 0 ? 'Sans objet' : 'Aucun'], ...domains.map((d) => [d.id, d.label] as [string, string])])}
      </Field>
      <Field label="Ordre d’affichage"><Input type="number" min={0} value={f.display_order} onChange={(e) => setF({ ...f, display_order: e.target.value })} /></Field>
      <Field label="Actif">{sel(f.actif ? '1' : '0', (v) => setF({ ...f, actif: v === '1' }), [['1', 'Oui'], ['0', 'Désactivé (hors planning)']])}</Field>
      <Field label="Niveau voie interne">{sel(f.priorite_interne, (v) => setF({ ...f, priorite_interne: v }), lv)}</Field>
      <Field label="Niveau voie externe">{sel(f.priorite_externe, (v) => setF({ ...f, priorite_externe: v }), lv)}</Field>
      <Field label="hard_priority" hint="Garantie de planification (§9.5) — back-office seul. Alerte au-delà de 5 % des items, blocage au-delà de 10 %.">
        {sel(f.hard ? '1' : '0', (v) => setF({ ...f, hard: v === '1' }), [['0', 'Non'], ['1', 'Oui']])}
      </Field>
      <fieldset className="grid gap-3 rounded-lg border border-(--color-border) p-3 md:col-span-3 md:grid-cols-6">
        <legend className="px-1 text-xs font-semibold text-(--color-ink-soft)">Critères de la matrice maître (0–5)</legend>
        {MATRIX_CRITERIA.map((k) => (
          <Field key={k} label={MATRIX_CRITERIA_LABEL[k]}><Input type="number" min={0} max={5} step={0.5} value={f.criteres[k]} onChange={(e) => setF({ ...f, criteres: { ...f.criteres, [k]: e.target.value } })} /></Field>
        ))}
      </fieldset>
      <Field label="Pertinence 2026 (0–5)" hint="Distincte de l’historique : un nouvel item peut être prioritaire sans annales."><Input type="number" min={0} max={5} step={0.5} value={f.pertinence_2026} onChange={(e) => setF({ ...f, pertinence_2026: e.target.value })} /></Field>
      <Field label="Pertinence 2026 active">{sel(f.pertinence_2026_active ? '1' : '0', (v) => setF({ ...f, pertinence_2026_active: v === '1' }), [['0', 'Non'], ['1', 'Oui']])}</Field>
      <Field label="Temps de référence (min)" hint="Vide = déduit du volume."><Input type="number" min={5} max={3000} value={f.temps_reference} onChange={(e) => setF({ ...f, temps_reference: e.target.value })} /></Field>
      <Field label="Charge relative (1–5)">{sel(f.volume, (v) => setF({ ...f, volume: v }), one5.slice(1))}</Field>
      <Field label="Difficulté (1–5)">{sel(f.difficulte, (v) => setF({ ...f, difficulte: v }), one5)}</Field>
      <Field label="Besoin d’entraînement (1–5)">{sel(f.besoin, (v) => setF({ ...f, besoin: v }), one5)}</Field>
      <Field label="Années d’occurrence aux EVC" hint="Séparées par « ; »"><Input value={f.annees} onChange={(e) => setF({ ...f, annees: e.target.value })} placeholder="2021; 2023" /></Field>
      <Field label="Historique détaillé (type et poids)" hint="« 2019 DP 2 ; 2023 QCM » : année, type, poids facultatif." className="md:col-span-2"><Input value={f.occurrences} onChange={(e) => setF({ ...f, occurrences: e.target.value })} placeholder="2019 DP 2 ; 2023 QCM" /></Field>
      <Field label="Récence (1–5)" hint="Vide = déduite des années.">{sel(f.recence, (v) => setF({ ...f, recence: v }), [['', 'Automatique'], ...one5.slice(1)])}</Field>
      <Field label="Notions incontournables" hint="Une par ligne : privilégiées en mode prioritaire." className="md:col-span-3"><Textarea rows={3} value={f.incontournables} onChange={(e) => setF({ ...f, incontournables: e.target.value })} /></Field>
      <Field label="Notes internes" className="md:col-span-3"><Textarea rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
      <div className="flex flex-wrap items-center gap-3 md:col-span-3">
        <Button disabled={pending || !f.nom_item.trim()} onClick={submit}>{pending && <Loader2 className="animate-spin" />} {item ? 'Enregistrer' : 'Créer l’item'}</Button>
        {error && /dérogation/.test(error) && (
          <label className="flex items-center gap-2 text-sm text-(--color-ink)"><input type="checkbox" checked={override} onChange={(e) => setOverride(e.target.checked)} className="h-4 w-4" />Je confirme la dérogation administrateur</label>
        )}
        <InlineStatus error={error} status={status} />
      </div>
    </div>
  );
}
