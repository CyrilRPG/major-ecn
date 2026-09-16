'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Field, InlineStatus, NativeSelect } from '@/components/admin/suivi/ui';
import { saveItemAction, type ItemInput } from '@/app/admin/planificateur/actions';
import type { PlanItem } from '@/lib/plan/types';

export type CoursOption = { id: string; titre: string; matiere_id: string };

/** Création / édition d'un item de la matrice (§4, §22). */
export function ItemForm({ item, colleges, cours, defaultCollege }: {
  item: PlanItem | null; colleges: { id: string; nom: string; parent: string | null }[]; cours: CoursOption[]; defaultCollege?: string;
}) {
  const router = useRouter();
  const [f, setF] = useState({
    specialite_id: item?.specialite_id ?? defaultCollege ?? colleges[0]?.id ?? '', cours_id: item?.cours_id ?? '', code: item?.code ?? '', nom_item: item?.nom_item ?? '',
    importance: String(item?.importance ?? 3), volume: String(item?.volume ?? 3), temps_reference: item?.temps_reference ? String(item.temps_reference) : '',
    transversalite: String(item?.transversalite ?? 1), frequence_annales: String(item?.frequence_annales ?? 0), annees: (item?.annees_occurrence ?? []).join('; '),
    recence: item?.recence ? String(item.recence) : '', actif: item?.actif ?? true, priorite_forcee: item?.priorite_forcee ? String(item.priorite_forcee) : '', notes: item?.notes ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const coursOfSpe = cours.filter((c) => c.matiere_id === f.specialite_id || colleges.some((col) => col.parent === f.specialite_id && col.id === c.matiere_id));
  const one5 = (v: string) => Number(v);

  function submit() {
    setError(null); setStatus(null);
    const input: ItemInput = {
      specialite_id: f.specialite_id, cours_id: f.cours_id || null, code: f.code || null, nom_item: f.nom_item,
      importance: one5(f.importance), volume: one5(f.volume), temps_reference: f.temps_reference ? Number(f.temps_reference) : null,
      transversalite: one5(f.transversalite), frequence_annales: Number(f.frequence_annales) || 0,
      annees_occurrence: f.annees.split(/[;,\s]+/).map((x) => Number(x)).filter((n) => Number.isInteger(n) && n >= 1990 && n <= 2100),
      recence: f.recence ? Number(f.recence) : null, actif: f.actif, priorite_forcee: f.priorite_forcee ? Number(f.priorite_forcee) : null, notes: f.notes || null,
    };
    start(async () => {
      const r = await saveItemAction(item?.id ?? null, input);
      if (!r.ok) { setError(r.error); return; }
      setStatus('Enregistré.');
      if (!item) router.push(`/admin/planificateur/items/${r.id}`); else router.refresh();
    });
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Field label="Nom de l’item" className="md:col-span-2"><Input value={f.nom_item} onChange={(e) => setF({ ...f, nom_item: e.target.value })} /></Field>
      <Field label="Code (facultatif)"><Input value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} placeholder="Ex. CARD-01" /></Field>
      <Field label="Spécialité (collège)">
        <NativeSelect value={f.specialite_id} onChange={(e) => setF({ ...f, specialite_id: e.target.value, cours_id: '' })}>
          {colleges.map((c) => <option key={c.id} value={c.id}>{c.parent ? '— ' : ''}{c.nom}</option>)}
        </NativeSelect>
      </Field>
      <Field label="Cours de la plateforme relié" hint="Permet évaluations, QCM et prise en compte de la progression réelle." className="md:col-span-2">
        <NativeSelect value={f.cours_id} onChange={(e) => setF({ ...f, cours_id: e.target.value })}>
          <option value="">Aucun</option>{coursOfSpe.map((c) => <option key={c.id} value={c.id}>{c.titre}</option>)}
        </NativeSelect>
      </Field>
      {(['importance', 'volume', 'transversalite'] as const).map((k) => (
        <Field key={k} label={k === 'importance' ? 'Importance (1–5)' : k === 'volume' ? 'Volume (1–5)' : 'Transversalité (1–5)'}>
          <NativeSelect value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })}>{[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v}</option>)}</NativeSelect>
        </Field>
      ))}
      <Field label="Temps de référence (min)" hint="Vide = déduit du volume (réglages)."><Input type="number" min={5} max={3000} value={f.temps_reference} onChange={(e) => setF({ ...f, temps_reference: e.target.value })} /></Field>
      <Field label="Fréquence aux annales"><Input type="number" min={0} value={f.frequence_annales} onChange={(e) => setF({ ...f, frequence_annales: e.target.value })} /></Field>
      <Field label="Années d’occurrence" hint="Séparées par « ; »"><Input value={f.annees} onChange={(e) => setF({ ...f, annees: e.target.value })} placeholder="2021; 2023; 2025" /></Field>
      <Field label="Récence (1–5)" hint="Vide = déduite des années.">
        <NativeSelect value={f.recence} onChange={(e) => setF({ ...f, recence: e.target.value })}><option value="">Automatique</option>{[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v}</option>)}</NativeSelect>
      </Field>
      <Field label="Priorité forcée (exceptionnel)" hint="Remplace le score calculé : 5 = très élevée … 1 = secondaire.">
        <NativeSelect value={f.priorite_forcee} onChange={(e) => setF({ ...f, priorite_forcee: e.target.value })}><option value="">Aucune</option>{[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{v}</option>)}</NativeSelect>
      </Field>
      <Field label="Actif"><NativeSelect value={f.actif ? '1' : '0'} onChange={(e) => setF({ ...f, actif: e.target.value === '1' })}><option value="1">Oui</option><option value="0">Désactivé (hors planning)</option></NativeSelect></Field>
      <Field label="Notes internes" className="md:col-span-3"><Textarea rows={2} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
      <div className="flex items-center gap-3 md:col-span-3">
        <Button disabled={pending || !f.nom_item.trim()} onClick={submit}>{pending && <Loader2 className="animate-spin" />} {item ? 'Enregistrer' : 'Créer l’item'}</Button>
        <InlineStatus error={error} status={status} />
      </div>
    </div>
  );
}
