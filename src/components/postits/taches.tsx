'use client';

import { useRef, useState } from 'react';
import { Bell, CalendarClock, Check, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LIBELLE_RAPPEL, RAPPELS, type Postit, type Rappel, type Tache } from '@/lib/postits/regles';
import { estEnRetard, libelleEcheance, reporter } from '@/lib/postits/agenda';
import { usePostits } from './etat';

/**
 * Tâches d'un Post-it (§23) : cocher barre la tâche — et elle seule (§29) ;
 * la petite icône calendrier ouvre, sur place, la date, l'heure facultative,
 * les rappels et le report (§37, §42, §45, §49). Tout s'enregistre aussitôt :
 * c'est la même ligne que lit l'agenda.
 */
export function ListeTaches({ postit, encre, lectureSeule, police }: { postit: Postit; encre: string; lectureSeule: boolean; police: string }) {
  const { appeler, majTache, enleverTache, aujourdHui } = usePostits();
  const [nouvelle, setNouvelle] = useState('');
  const [ouverte, setOuverte] = useState<string | null>(null);
  const champ = useRef<HTMLInputElement>(null);

  async function ajouter() {
    const texte = nouvelle.trim();
    if (!texte) return;
    setNouvelle('');
    await appeler({ action: 'tacheAjouter', postitId: postit.id, texte });
    champ.current?.focus();
  }

  async function modifier(t: Tache, patch: Partial<Pick<Tache, 'texte' | 'fait' | 'date' | 'heure' | 'rappels'>>) {
    majTache(postit.id, { ...t, ...patch });
    const r = await appeler({ action: 'tacheModifier', id: t.id, ...patch });
    if (r?.tache) majTache(postit.id, r.tache);
    else majTache(postit.id, t);
  }

  async function supprimer(t: Tache) {
    enleverTache(postit.id, t.id);
    const r = await appeler({ action: 'tacheSupprimer', id: t.id });
    if (!r) majTache(postit.id, t);
  }

  const maintenant = new Date();
  const present = { date: aujourdHui, heure: `${String(maintenant.getHours()).padStart(2, '0')}:${String(maintenant.getMinutes()).padStart(2, '0')}` };

  return (
    <div className="space-y-0.5">
      {postit.taches.map((t) => {
        const retard = estEnRetard(t, present);
        return (
          <div key={t.id} className="group/tache">
            <div className="flex items-start gap-1.5">
              <button
                type="button"
                role="checkbox"
                aria-checked={t.fait}
                aria-label={t.fait ? 'Marquer la tâche comme à faire' : 'Marquer la tâche comme terminée'}
                disabled={lectureSeule}
                onClick={() => modifier(t, { fait: !t.fait })}
                className="mt-[5px] grid h-[17px] w-[17px] shrink-0 place-items-center rounded-[5px] border-[1.5px] transition-colors disabled:cursor-default"
                style={{ borderColor: encre, background: t.fait ? encre : 'transparent' }}
              >
                {t.fait && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </button>
              <input
                defaultValue={t.texte}
                readOnly={lectureSeule}
                aria-label="Tâche"
                maxLength={500}
                onBlur={(e) => {
                  const v = e.currentTarget.value.trim();
                  if (v && v !== t.texte) void modifier(t, { texte: v });
                  else e.currentTarget.value = t.texte;
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                className={cn(police, 'min-w-0 flex-1 bg-transparent text-[19px] leading-[1.35] outline-none', t.fait && 'line-through opacity-55')}
                style={{ color: encre }}
              />
              {!lectureSeule && (
                <button
                  type="button"
                  onClick={() => setOuverte((o) => (o === t.id ? null : t.id))}
                  aria-label={t.date ? `Échéance : ${libelleEcheance(t.date, t.heure)}` : 'Ajouter une date'}
                  aria-expanded={ouverte === t.id}
                  title="Date, heure et rappel"
                  className={cn(
                    'mt-[3px] flex h-[22px] shrink-0 items-center gap-1 rounded-md px-1 text-[11px] font-semibold transition-opacity',
                    t.date ? 'bg-black/10' : 'opacity-40 hover:opacity-100 group-hover/tache:opacity-80',
                  )}
                  style={{ color: retard ? '#9B0F2C' : encre }}
                >
                  <CalendarClock className="h-3.5 w-3.5" />
                  {t.date && <span className="whitespace-nowrap">{libelleEcheance(t.date, t.heure, { court: true })}</span>}
                  {t.rappels.length > 0 && t.heure && <Bell className="h-3 w-3" />}
                </button>
              )}
              {lectureSeule && t.date && (
                <span className="mt-[5px] shrink-0 whitespace-nowrap text-[11px] font-semibold" style={{ color: encre }}>
                  {libelleEcheance(t.date, t.heure, { court: true })}
                </span>
              )}
              {!lectureSeule && (
                <button
                  type="button"
                  onClick={() => supprimer(t)}
                  aria-label="Supprimer la tâche"
                  className="mt-[4px] grid h-5 w-5 shrink-0 place-items-center rounded opacity-0 transition-opacity hover:bg-black/10 focus:opacity-100 group-hover/tache:opacity-60"
                  style={{ color: encre }}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            {ouverte === t.id && !lectureSeule && (
              <ReglageEcheance tache={t} encre={encre} aujourdHui={aujourdHui} onChange={(patch) => modifier(t, patch)} />
            )}
          </div>
        );
      })}
      {!lectureSeule && (
        <div className="flex items-center gap-1.5 pt-0.5">
          <Plus className="h-[17px] w-[17px] shrink-0 opacity-50" style={{ color: encre }} />
          <input
            ref={champ}
            value={nouvelle}
            onChange={(e) => setNouvelle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void ajouter(); } }}
            onBlur={() => void ajouter()}
            maxLength={500}
            placeholder="Ajouter une tâche"
            aria-label="Ajouter une tâche"
            className={cn(police, 'min-w-0 flex-1 bg-transparent text-[19px] leading-[1.35] outline-none placeholder:opacity-45')}
            style={{ color: encre }}
          />
        </div>
      )}
    </div>
  );
}

/** Réglage de l'échéance (§49) : enregistrement immédiat de chaque changement. */
function ReglageEcheance({
  tache, encre, aujourdHui, onChange,
}: {
  tache: Tache;
  encre: string;
  aujourdHui: string;
  onChange: (patch: Partial<Pick<Tache, 'date' | 'heure' | 'rappels'>>) => void;
}) {
  const champ = 'h-8 rounded-lg border border-black/15 bg-white/70 px-2 text-[12.5px] text-[#1F1720] outline-none focus:border-black/40';
  const basculer = (r: Rappel) => onChange({ rappels: tache.rappels.includes(r) ? tache.rappels.filter((x) => x !== r) : [...tache.rappels, r] });
  return (
    <div className="mb-1.5 ml-6 mt-1 space-y-2 rounded-xl bg-white/45 p-2.5 font-sans text-[12px] shadow-inner" style={{ color: encre }}>
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-0.5">
          <span className="text-[10.5px] font-semibold uppercase tracking-wide opacity-70">Date</span>
          <input type="date" className={champ} value={tache.date ?? ''} onChange={(e) => onChange({ date: e.target.value || null, ...(e.target.value ? {} : { heure: null }) })} />
        </label>
        <label className="flex flex-col gap-0.5">
          <span className="text-[10.5px] font-semibold uppercase tracking-wide opacity-70">Heure (facultatif)</span>
          <input
            type="time"
            className={champ}
            disabled={!tache.date}
            defaultValue={tache.heure ?? ''}
            key={`${tache.date}-${tache.heure}`}
            onBlur={(e) => { const v = e.target.value || null; if (v !== tache.heure) onChange({ heure: v }); }}
          />
        </label>
      </div>
      {tache.date && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10.5px] font-semibold uppercase tracking-wide opacity-70">Reporter</span>
          {[{ j: 1, l: '+1 jour' }, { j: 7, l: '+1 semaine' }].map(({ j, l }) => (
            <button key={j} type="button" onClick={() => onChange(reporter(tache, j, aujourdHui))} className="rounded-full bg-black/10 px-2 py-0.5 font-semibold hover:bg-black/20">
              {l}
            </button>
          ))}
          <button type="button" onClick={() => onChange({ date: null, heure: null })} className="ml-auto rounded-full px-2 py-0.5 font-semibold underline-offset-2 hover:underline">
            Retirer la date
          </button>
        </div>
      )}
      {tache.date && tache.heure && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10.5px] font-semibold uppercase tracking-wide opacity-70">Rappel</span>
          {RAPPELS.map((r) => {
            const actif = tache.rappels.includes(r);
            return (
              <button
                key={r}
                type="button"
                aria-pressed={actif}
                onClick={() => basculer(r)}
                className={cn('rounded-full px-2 py-0.5 font-semibold transition-colors', actif ? 'text-white' : 'bg-black/10 hover:bg-black/20')}
                style={actif ? { background: encre } : undefined}
              >
                {LIBELLE_RAPPEL[r]}
              </button>
            );
          })}
        </div>
      )}
      <p className="text-[11px] leading-snug opacity-70">
        {tache.date ? 'Cette tâche figure dans votre agenda.' : 'Datée, la tâche apparaîtra dans votre agenda.'}
      </p>
    </div>
  );
}
