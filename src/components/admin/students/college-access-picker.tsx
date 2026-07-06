'use client';

import { Stethoscope } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

/** Collège « Médecine générale » (parent). Ses sous-matières (col-mg-*) sont
 *  les spécialités accordables individuellement. */
export const MG_COLLEGE_ID = 'col-medecine-generale';

export type College = { id: string; nom: string; parentId?: string | null };
export type Voie = 'interne' | 'externe';

export type AccessValue = {
  permissionType: 'all' | 'college';
  /** Liste finale des collèges accordés : collèges de premier niveau + (si MG)
   *  le parent col-medecine-generale + les spécialités MG choisies. */
  colleges: string[];
  voie: Voie | null;
};

/**
 * Sélecteur d'accès partagé (création + édition d'élève). Distingue clairement
 * les VRAIS collèges (Cardiologie, Pédiatrie…) des spécialités de Médecine
 * générale (sous-collèges). Cocher « Médecine générale » révèle la voie de
 * concours + les spécialités (toutes cochées par défaut).
 */
export function CollegeAccessPicker({
  colleges,
  value,
  onChange,
}: {
  colleges: College[];
  value: AccessValue;
  onChange: (v: AccessValue) => void;
}) {
  const topColleges = colleges.filter((c) => !c.parentId);
  const mgSpecialties = colleges.filter((c) => c.parentId === MG_COLLEGE_ID);
  const allSpecialtyIds = mgSpecialties.map((s) => s.id);
  const specialtySet = new Set(allSpecialtyIds);

  const selectedSet = new Set(value.colleges);
  const mgSelected = selectedSet.has(MG_COLLEGE_ID);

  const setColleges = (next: string[], extra?: Partial<AccessValue>) =>
    onChange({ ...value, colleges: next, ...extra });

  const toggleTop = (id: string, checked: boolean) => {
    const s = new Set(value.colleges);
    if (id === MG_COLLEGE_ID) {
      if (checked) {
        s.add(MG_COLLEGE_ID);
        allSpecialtyIds.forEach((x) => s.add(x)); // par défaut, toutes les spécialités
      } else {
        s.delete(MG_COLLEGE_ID);
        allSpecialtyIds.forEach((x) => s.delete(x));
      }
      setColleges(Array.from(s));
      return;
    }
    if (checked) s.add(id); else s.delete(id);
    setColleges(Array.from(s));
  };

  const toggleSpecialty = (id: string, checked: boolean) => {
    const s = new Set(value.colleges);
    if (checked) s.add(id); else s.delete(id);
    setColleges(Array.from(s));
  };

  const setAllSpecialties = (all: boolean) => {
    const s = new Set(value.colleges);
    if (all) allSpecialtyIds.forEach((x) => s.add(x));
    else allSpecialtyIds.forEach((x) => s.delete(x));
    setColleges(Array.from(s));
  };

  return (
    <div className="space-y-2">
      <Label>Accès aux collèges</Label>
      <RadioGroup
        value={value.permissionType}
        onValueChange={(v) => onChange({ ...value, permissionType: v as 'all' | 'college' })}
      >
        <label className="flex items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-surface-soft)">
          <RadioGroupItem value="all" />
          <span className="text-sm">Toute l’offre (tous les collèges)</span>
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-surface-soft)">
          <RadioGroupItem value="college" />
          <span className="text-sm">Collèges spécifiques</span>
        </label>
      </RadioGroup>

      {/* Voie de concours — TOUJOURS affichée et obligatoire, quelle que soit
          l'offre/le collège. Détermine le type d'entraînement accessible. */}
      <div className="space-y-1.5 rounded-xl border-2 border-(--color-primary)/30 bg-(--color-primary-soft)/40 p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
          <Stethoscope className="h-4 w-4 text-(--color-primary)" />
          Voie de concours
        </div>
        <p className="text-xs text-(--color-ink-soft)">
          <strong>Interne</strong> = QCM / DP · <strong>Externe</strong> = QROC / DP-QROC.
          Jamais les deux, quelle que soit la spécialité.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { value: 'interne', label: 'Voie interne (QCM / DP)' },
            { value: 'externe', label: 'Voie externe (QROC / DP-QROC)' },
          ] as const).map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${value.voie === opt.value ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border)'}`}
            >
              <input
                type="radio"
                name="voie"
                checked={value.voie === opt.value}
                onChange={() => onChange({ ...value, voie: opt.value })}
                className="h-4 w-4 accent-(--color-primary)"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {value.permissionType === 'college' && (
        <>
          <div className="ml-1 mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {topColleges.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={selectedSet.has(c.id)}
                  onCheckedChange={(v) => toggleTop(c.id, !!v)}
                />
                {c.nom}
              </label>
            ))}
          </div>

          {/* Médecine générale : voie + spécialités */}
          {mgSelected && (
            <div className="space-y-3 rounded-xl border-2 border-(--color-primary)/30 bg-(--color-primary-soft)/40 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-(--color-ink)">
                <Stethoscope className="h-4 w-4 text-(--color-primary)" />
                Médecine générale
              </div>

              <div className="space-y-1.5">
                <Label>Voie de concours</Label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    { value: 'interne', label: 'Voie interne (QCM / DP)' },
                    { value: 'externe', label: 'Voie externe (QROC / Révisions)' },
                  ] as const).map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm ${value.voie === opt.value ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border)'}`}
                    >
                      <input
                        type="radio"
                        name="mg-voie"
                        checked={value.voie === opt.value}
                        onChange={() => onChange({ ...value, voie: opt.value })}
                        className="h-4 w-4 accent-(--color-primary)"
                      />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>

              {mgSpecialties.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label>Spécialités accordées</Label>
                    <div className="flex gap-2 text-[11px] font-semibold">
                      <button type="button" className="text-(--color-primary) hover:underline" onClick={() => setAllSpecialties(true)}>Tout cocher</button>
                      <span className="text-(--color-ink-muted)">·</span>
                      <button type="button" className="text-(--color-ink-soft) hover:underline" onClick={() => setAllSpecialties(false)}>Tout décocher</button>
                    </div>
                  </div>
                  <p className="text-xs text-(--color-ink-soft)">
                    Par défaut, <strong>toutes</strong> les spécialités sont accordées.
                  </p>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {mgSpecialties.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 text-[13px]">
                        <Checkbox
                          checked={selectedSet.has(s.id)}
                          onCheckedChange={(v) => toggleSpecialty(s.id, !!v)}
                        />
                        {s.nom}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** Formule (offre) : options rendues depuis la Config Permissions. */
export function OfferPicker({
  offers,
  value,
  onChange,
}: {
  offers: { id: 'essentiel' | 'intensif' | 'approfondi'; label: string; unlocks: string[] }[];
  value: string;
  onChange: (v: 'essentiel' | 'intensif' | 'approfondi') => void;
}) {
  return (
    <div className="space-y-2">
      <Label>Formule souscrite</Label>
      <p className="text-xs text-(--color-ink-soft)">
        Contenus débloqués selon la <strong>Config Permissions</strong>.
      </p>
      <RadioGroup value={value} onValueChange={(v) => onChange(v as 'essentiel' | 'intensif' | 'approfondi')}>
        {offers.map((o) => (
          <label
            key={o.id}
            className="flex items-start gap-3 rounded-xl border border-(--color-border) px-3 py-2.5 cursor-pointer hover:bg-(--color-surface-soft) has-[:checked]:border-(--color-primary) has-[:checked]:bg-(--color-primary-soft)/40"
          >
            <RadioGroupItem value={o.id} className="mt-0.5" />
            <span className="text-sm">
              <span className="font-semibold text-(--color-ink)">{o.label}</span>
              {o.unlocks.length > 0 && (
                <span className="mt-0.5 block text-xs text-(--color-ink-soft)">{o.unlocks.join(' · ')}</span>
              )}
            </span>
          </label>
        ))}
      </RadioGroup>
    </div>
  );
}
