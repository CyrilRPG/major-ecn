'use client';

import * as React from 'react';
import { FORMULES, type Criteres, type FormuleCategorie, type ModeParticipants } from '@/lib/echanges/regles';
import { LIBELLE_MODE, type Specialite } from './commun';

/**
 * Champs « mode de participation + critères » (§172-182), partagés par le
 * formulaire de création et l'onglet Critères de la fiche. Composant
 * contrôlé : aucune écriture ici.
 */
export function ChampsCriteres({
  mode, criteres, specialites, onMode, onCriteres, desactive,
}: {
  mode: ModeParticipants;
  criteres: Criteres;
  specialites: Specialite[];
  onMode: (m: ModeParticipants) => void;
  onCriteres: (c: Criteres) => void;
  desactive?: boolean;
}) {
  const formules = criteres.formules ?? [];
  const voies = criteres.voies ?? [];
  const specs = criteres.specialites ?? [];
  const bascule = <T,>(liste: T[], v: T) => (liste.includes(v) ? liste.filter((x) => x !== v) : [...liste, v]);
  const sansCriteres = mode === 'manuel';

  return (
    <div className="space-y-4">
      <fieldset disabled={desactive}>
        <legend className="mb-2 text-[12.5px] font-medium text-(--color-ink-soft)">Mode de participation</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {(Object.keys(LIBELLE_MODE) as ModeParticipants[]).map((m) => (
            <label
              key={m}
              className={`flex cursor-pointer gap-2 rounded-xl border p-3 text-[13px] transition-colors ${mode === m ? 'border-(--color-primary) bg-(--color-primary-soft)' : 'border-(--color-border) bg-white hover:bg-(--color-surface-soft)'}`}
            >
              <input type="radio" name="mode-participants" className="mt-0.5 accent-(--color-primary)" checked={mode === m} onChange={() => onMode(m)} />
              <span>
                <span className="block font-medium text-(--color-ink)">{LIBELLE_MODE[m].titre}</span>
                <span className="block text-[12px] text-(--color-ink-soft)">{LIBELLE_MODE[m].aide}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset disabled={desactive || sansCriteres} className={sansCriteres ? 'opacity-50' : ''}>
        <legend className="mb-2 text-[12.5px] font-medium text-(--color-ink-soft)">
          Critères automatiques {sansCriteres && <span className="font-normal text-(--color-ink-muted)">— sans effet en liste manuelle</span>}
        </legend>
        <div className="grid gap-4 rounded-xl border border-(--color-border) bg-white p-3 sm:p-4 lg:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[12.5px] font-medium text-(--color-ink)">Formules <span className="font-normal text-(--color-ink-muted)">(aucune cochée = toutes les formules payantes)</span></p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {FORMULES.map((f) => (
                <label key={f.id} className="flex items-center gap-2 text-[13px] text-(--color-ink)">
                  <input
                    type="checkbox"
                    className="accent-(--color-primary)"
                    checked={formules.includes(f.id)}
                    onChange={() => onCriteres({ ...criteres, formules: bascule<FormuleCategorie>(formules, f.id) })}
                  />
                  {f.label}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-[12.5px] font-medium text-(--color-ink)">Voies <span className="font-normal text-(--color-ink-muted)">(aucune = toutes ; un élève sans voie passe)</span></p>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {(['interne', 'externe'] as const).map((v) => (
                <label key={v} className="flex items-center gap-2 text-[13px] text-(--color-ink)">
                  <input
                    type="checkbox"
                    className="accent-(--color-primary)"
                    checked={voies.includes(v)}
                    onChange={() => onCriteres({ ...criteres, voies: bascule(voies, v) })}
                  />
                  Voie {v}
                </label>
              ))}
            </div>
          </div>
          <div className="lg:col-span-2">
            <div className="mb-1.5 flex flex-wrap items-center gap-2">
              <p className="text-[12.5px] font-medium text-(--color-ink)">
                Spécialités <span className="font-normal text-(--color-ink-muted)">({specs.length === 0 ? 'aucune = toutes' : `${specs.length} sélectionnée${specs.length > 1 ? 's' : ''}`})</span>
              </p>
              {specs.length > 0 && (
                <button type="button" onClick={() => onCriteres({ ...criteres, specialites: [] })} className="text-[12px] font-medium text-(--color-primary) hover:underline">
                  Tout désélectionner
                </button>
              )}
            </div>
            <div className="grid max-h-56 gap-x-4 gap-y-1 overflow-y-auto rounded-lg border border-(--color-border) p-2 sm:grid-cols-2 xl:grid-cols-3">
              {specialites.map((s) => (
                <label key={s.id} className="flex items-center gap-2 rounded px-1 py-0.5 text-[13px] text-(--color-ink) hover:bg-(--color-surface-soft)">
                  <input
                    type="checkbox"
                    className="accent-(--color-primary)"
                    checked={specs.includes(s.id)}
                    onChange={() => onCriteres({ ...criteres, specialites: bascule(specs, s.id) })}
                  />
                  <span className="truncate">{s.nom}</span>
                </label>
              ))}
              {specialites.length === 0 && <p className="text-[12.5px] text-(--color-ink-muted)">Aucune spécialité disponible.</p>}
            </div>
          </div>
          <label className="flex items-start gap-2 text-[13px] text-(--color-ink) lg:col-span-2">
            <input
              type="checkbox"
              className="mt-0.5 accent-(--color-primary)"
              checked={criteres.inscritsActifs !== false}
              onChange={(e) => onCriteres({ ...criteres, inscritsActifs: e.target.checked })}
            />
            <span>
              Inscriptions actives uniquement
              <span className="block text-[12px] text-(--color-ink-soft)">Compte actif et accès non expiré. Un compte fermé n’accède de toute façon à aucune messagerie.</span>
            </span>
          </label>
        </div>
      </fieldset>
    </div>
  );
}
