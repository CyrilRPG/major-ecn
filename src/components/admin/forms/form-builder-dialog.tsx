'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, FileUp, GripVertical, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  FIELD_TYPES, FIELD_TYPE_LABEL, type FormField, type FieldType,
} from '@/lib/schemas/satisfaction';
import { createSatisfactionFormAction } from '@/app/admin/formulaires/actions';

const PROMOS = ['D2', 'D3', 'D4', 'PAE', 'Autre'] as const;
const OFFERS = [
  { value: 'essentiel', label: 'Essentiel' },
  { value: 'intensif', label: 'Intensif' },
  { value: 'approfondi', label: 'Approfondi' },
];

function makeKey(label: string, fallback: string): string {
  const slug = label
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 60);
  return slug || fallback;
}

export function FormBuilderDialog({ colleges }: { colleges: { id: string; nom: string }[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [intro, setIntro] = useState('');
  const [mandatory, setMandatory] = useState(false);
  const [active, setActive] = useState(true);
  const [targetPromo, setTargetPromo] = useState('');
  const [targetOffer, setTargetOffer] = useState('');
  const [targetCollege, setTargetCollege] = useState('');
  const [allowUpload, setAllowUpload] = useState(false);
  const [uploadLabel, setUploadLabel] = useState('Fichier à joindre');
  const [fields, setFields] = useState<FormField[]>([
    { key: 'avis', label: 'Votre avis', type: 'textarea', required: true },
  ]);

  const reset = () => {
    setTitle(''); setIntro(''); setMandatory(false); setActive(true);
    setTargetPromo(''); setTargetOffer(''); setTargetCollege('');
    setAllowUpload(false); setUploadLabel('Fichier à joindre');
    setFields([{ key: 'avis', label: 'Votre avis', type: 'textarea', required: true }]);
    setError(null);
  };

  const addField = () =>
    setFields((f) => [
      ...f,
      { key: `champ_${f.length + 1}`, label: '', type: 'text', required: false },
    ]);
  const removeField = (i: number) =>
    setFields((f) => f.filter((_, idx) => idx !== i));
  const updateField = (i: number, patch: Partial<FormField>) =>
    setFields((f) => f.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const submit = () => {
    setError(null);
    if (!title.trim()) return setError('Le titre est requis.');
    if (fields.length === 0) return setError('Ajoutez au moins un champ.');
    for (const f of fields) {
      if (!f.label.trim()) return setError('Tous les champs doivent avoir un libellé.');
      if (f.type === 'select') {
        const opts = (f.options ?? []).map((o) => o.trim()).filter(Boolean);
        if (opts.length < 2) {
          return setError(`Le champ « ${f.label} » doit avoir au moins 2 options.`);
        }
      }
    }
    // Normaliser les clés (uniques, slugifiées sur le label) + nettoyer les options
    const normalized = fields.map((f, i) => ({
      ...f,
      key: makeKey(f.label, `champ_${i + 1}`) + '_' + i,
      options: f.type === 'select' ? (f.options ?? []).map((o) => o.trim()).filter(Boolean) : undefined,
    }));

    start(async () => {
      const res = await createSatisfactionFormAction({
        title: title.trim(),
        intro_text: intro.trim() || undefined,
        mandatory,
        active,
        target_promo: targetPromo || undefined,
        target_offer: targetOffer || undefined,
        target_college: targetCollege || undefined,
        fields: normalized,
        allow_file_upload: allowUpload,
        file_upload_label: allowUpload ? uploadLabel.trim() : undefined,
      });
      if ('error' in res) {
        setError(res.error);
        return;
      }
      reset();
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="md">
          <Plus />
          Nouveau formulaire
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-(--color-primary)" />
            Créer un formulaire de satisfaction
          </DialogTitle>
          <DialogDescription>
            Personnalisez les champs et le ciblage. Si « obligatoire » est coché, les élèves ciblés
            devront le remplir avant d’accéder à la plateforme pédagogique.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* En-tête */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="sf_title">Titre du formulaire</Label>
              <Input id="sf_title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Bilan de mi-parcours" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sf_intro">Texte introductif (optionnel)</Label>
              <textarea
                id="sf_intro"
                value={intro}
                onChange={(e) => setIntro(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm outline-none focus:border-(--color-primary)"
                placeholder="Bonjour ! Merci de prendre 2 minutes pour partager votre retour…"
              />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={mandatory} onCheckedChange={(v) => setMandatory(!!v)} />
                Obligatoire pour accéder à la plateforme
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={active} onCheckedChange={(v) => setActive(!!v)} />
                Activer immédiatement
              </label>
            </div>
          </div>

          {/* Ciblage */}
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4">
            <p className="mb-3 text-sm font-semibold text-(--color-ink)">Ciblage</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Promotion</Label>
                <select
                  value={targetPromo}
                  onChange={(e) => setTargetPromo(e.target.value)}
                  className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 py-2 text-sm"
                >
                  <option value="">Toutes</option>
                  {PROMOS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Formule souscrite</Label>
                <select
                  value={targetOffer}
                  onChange={(e) => setTargetOffer(e.target.value)}
                  className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 py-2 text-sm"
                >
                  <option value="">Toutes</option>
                  {OFFERS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Collège ciblé</Label>
                <select
                  value={targetCollege}
                  onChange={(e) => setTargetCollege(e.target.value)}
                  className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-2.5 py-2 text-sm"
                >
                  <option value="">Tous les élèves</option>
                  <option value="all-access">Toute l’offre uniquement</option>
                  <optgroup label="Élèves ayant accès au collège">
                    {colleges.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                  </optgroup>
                </select>
              </div>
            </div>
          </div>

          {/* Champs */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-semibold text-(--color-ink)">Champs du formulaire</p>
              <Button type="button" size="sm" variant="outline" onClick={addField}>
                <Plus className="h-3.5 w-3.5" />
                Ajouter un champ
              </Button>
            </div>
            <ul className="space-y-2">
              {fields.map((f, i) => (
                <li key={i} className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3">
                  <div className="flex items-start gap-2">
                    <GripVertical className="mt-2 h-4 w-4 shrink-0 text-(--color-ink-muted)" />
                    <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_160px_auto]">
                      <Input
                        value={f.label}
                        onChange={(e) => updateField(i, { label: e.target.value })}
                        placeholder="Libellé de la question"
                      />
                      <select
                        value={f.type}
                        onChange={(e) => updateField(i, { type: e.target.value as FieldType, options: e.target.value === 'select' ? f.options ?? ['Option 1', 'Option 2'] : undefined })}
                        className="rounded-lg border border-(--color-border) bg-(--color-surface) px-2 py-2 text-sm"
                      >
                        {FIELD_TYPES.map((t) => <option key={t} value={t}>{FIELD_TYPE_LABEL[t]}</option>)}
                      </select>
                      <label className="inline-flex items-center gap-2 px-2 text-xs whitespace-nowrap">
                        <Checkbox checked={f.required} onCheckedChange={(v) => updateField(i, { required: !!v })} />
                        Obligatoire
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeField(i)}
                      className="rounded-lg p-1.5 text-(--color-ink-muted) hover:bg-(--color-danger)/10 hover:text-(--color-danger)"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {f.type === 'select' && (
                    <div className="mt-3 ml-6 space-y-1.5">
                      <Label className="text-xs">Options proposées</Label>
                      <ul className="space-y-1.5">
                        {(f.options ?? []).map((opt, oi) => (
                          <li key={oi} className="flex items-center gap-2">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-(--color-surface-soft) text-[11px] font-semibold text-(--color-ink-soft)">
                              {oi + 1}
                            </span>
                            <Input
                              value={opt}
                              onChange={(e) => {
                                const next = [...(f.options ?? [])];
                                next[oi] = e.target.value;
                                updateField(i, { options: next });
                              }}
                              placeholder={`Option ${oi + 1}`}
                              className="flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = (f.options ?? []).filter((_, idx) => idx !== oi);
                                updateField(i, { options: next });
                              }}
                              className="rounded-md p-1.5 text-(--color-ink-muted) hover:bg-(--color-danger)/10 hover:text-(--color-danger)"
                              aria-label="Supprimer cette option"
                              disabled={(f.options ?? []).length <= 1}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </li>
                        ))}
                      </ul>
                      <button
                        type="button"
                        onClick={() => updateField(i, { options: [...(f.options ?? []), ''] })}
                        className="ml-9 inline-flex items-center gap-1 rounded-md border border-dashed border-(--color-border) px-2 py-1 text-xs text-(--color-ink-soft) hover:border-(--color-primary) hover:text-(--color-primary)"
                      >
                        <Plus className="h-3 w-3" />
                        Ajouter une option
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Upload */}
          <div className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4">
            <label className="flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
              <Checkbox checked={allowUpload} onCheckedChange={(v) => setAllowUpload(!!v)} />
              <FileUp className="h-4 w-4 text-(--color-primary)" />
              Demander un upload de fichier
            </label>
            {allowUpload && (
              <div className="mt-3 space-y-1.5">
                <Label htmlFor="upl_label" className="text-xs">Libellé du champ fichier</Label>
                <Input id="upl_label" value={uploadLabel} onChange={(e) => setUploadLabel(e.target.value)} />
              </div>
            )}
          </div>

          {error && (
            <p className="rounded-lg bg-(--color-danger)/10 px-3 py-2 text-sm text-(--color-danger)">
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Annuler
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Plus />}
            Créer le formulaire
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
