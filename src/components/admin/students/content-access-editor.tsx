'use client';

import { useMemo } from 'react';
import { RotateCcw } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { mergeAccess, type ContentAccess } from '@/lib/auth/permissions';
import { CONTENT_ACCESS_LABELS } from '@/lib/auth/formula-permissions';
import type { OfferId } from './college-access-picker';

const NO_ACCESS: ContentAccess = {
  fiche: false, ficheExpress: false, video: false, qcm: false, entrainement: false,
  seanceProf: false, flashcards: false, interrogation: false, seanceApprofondie: false,
  notes: false, parcoursMajor: false,
};

export type FormulaAccessMap = Record<OfferId, ContentAccess>;

export function ContentAccessEditor({
  formulaPermissions,
  selectedOffers,
  overrides,
  onChange,
}: {
  formulaPermissions: FormulaAccessMap;
  selectedOffers: OfferId[];
  overrides: Record<string, boolean> | null;
  onChange: (overrides: Record<string, boolean> | null) => void;
}) {
  const defaults = useMemo(() => {
    if (selectedOffers.length === 0) return NO_ACCESS;
    return selectedOffers
      .map((o) => formulaPermissions[o] ?? NO_ACCESS)
      .reduce(mergeAccess, NO_ACCESS);
  }, [selectedOffers, formulaPermissions]);

  const effective = useMemo(() => {
    const result = { ...defaults };
    if (overrides) {
      for (const [k, v] of Object.entries(overrides)) {
        if (k in result) {
          (result as Record<string, boolean>)[k] = v;
        }
      }
    }
    return result;
  }, [defaults, overrides]);

  const toggle = (key: keyof ContentAccess) => {
    const newValue = !effective[key];
    const isDefault = newValue === defaults[key];

    const next = { ...(overrides ?? {}) };
    if (isDefault) {
      delete next[key];
    } else {
      next[key] = newValue;
    }

    onChange(Object.keys(next).length > 0 ? next : null);
  };

  const hasOverrides = overrides && Object.keys(overrides).length > 0;

  return (
    <div className="rounded-xl border border-(--color-border) px-3 py-2.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-(--color-ink)">Permissions de contenu</p>
        {hasOverrides && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-[11px] text-(--color-ink-soft)"
            onClick={() => onChange(null)}
          >
            <RotateCcw className="h-3 w-3" />
            Défauts de la formule
          </Button>
        )}
      </div>
      <p className="text-[12px] text-(--color-ink-soft)">
        Par défaut, les permissions suivent la formule. Modifiez individuellement ci-dessous si nécessaire.
      </p>
      <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
        {CONTENT_ACCESS_LABELS.map(({ key, label }) => {
          const isOverridden = overrides != null && key in overrides;
          return (
            <label
              key={key}
              className={`flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 text-[13px] hover:bg-(--color-sand-100) ${
                isOverridden ? 'bg-(--color-primary-soft)/40' : ''
              }`}
            >
              <Checkbox
                checked={effective[key]}
                onCheckedChange={() => toggle(key)}
              />
              <span className="truncate text-(--color-ink)">
                {label}
              </span>
              {isOverridden && (
                <span className="ml-auto shrink-0 rounded-full bg-(--color-primary)/10 px-1.5 py-0.5 text-[10px] font-semibold text-(--color-primary)">
                  modifié
                </span>
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
