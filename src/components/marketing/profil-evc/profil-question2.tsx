'use client';

import { useState } from 'react';
import { Globe, User, Check, RefreshCw, AlertTriangle, CalendarDays, ChevronDown, Info, Lightbulb } from 'lucide-react';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const INK = '#1F2937';
const INK_SOFT = '#52607A';

type Loc = 'fr' | 'et' | 'nex';
type Spe = 'oui' | 'non';

// Durées → valeurs d'option (identiques au barème de scoring.ts).
const FRANCE_DUR: { value: string; label: string }[] = [
  { value: 'fr_plus_3', label: 'Plus de 3 ans' },
  { value: 'fr_1_3', label: '1 à 3 ans' },
  { value: 'fr_6_12', label: '6 à 12 mois' },
  { value: 'fr_3_6', label: '3 à 6 mois' },
  { value: 'fr_1_3m', label: '1 à 3 mois' },
  { value: 'fr_moins_1m', label: 'Moins d’un mois' },
];
const ETRANGER_DUR: { value: string; label: string }[] = [
  { value: 'et_plus_5', label: 'Plus de 5 ans' },
  { value: 'et_3_5', label: '3 à 5 ans' },
  { value: 'et_1_3', label: '1 à 3 ans' },
  { value: 'et_6_12', label: '6 à 12 mois' },
  { value: 'et_moins_6', label: 'Moins de 6 mois' },
];
const FRANCE_VALUES = new Set(FRANCE_DUR.map((d) => d.value));
const ETRANGER_VALUES = new Set(ETRANGER_DUR.map((d) => d.value));

/** Drapeau français en SVG (les emojis drapeaux ne s'affichent pas sous Windows). */
function FrenchFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 3 2" className={className} preserveAspectRatio="none" aria-hidden>
      <rect width="1" height="2" x="0" fill="#0055A4" />
      <rect width="1" height="2" x="1" fill="#FFFFFF" />
      <rect width="1" height="2" x="2" fill="#EF4135" />
    </svg>
  );
}

/** Reconstruit l'état des sous-questions depuis la valeur d'option stockée. */
function decode(value: string | undefined): { loc: Loc | null; spe: Spe | null; dur: string | null } {
  if (!value) return { loc: null, spe: null, dur: null };
  if (value === 'nex') return { loc: 'nex', spe: null, dur: null };
  if (value === 'fr_autre_spe') return { loc: 'fr', spe: 'non', dur: null };
  if (FRANCE_VALUES.has(value)) return { loc: 'fr', spe: 'oui', dur: value };
  if (ETRANGER_VALUES.has(value)) return { loc: 'et', spe: 'oui', dur: value };
  return { loc: null, spe: null, dur: null };
}

/**
 * Question 2 « Où exercez-vous ? » — écran adaptatif à 3 niveaux (lieu → même
 * spécialité ? → durée), qui produit la même valeur d'option que le barème
 * historique (scoring.ts). `onChange(null)` tant que la sélection est incomplète.
 */
export function ProfilQuestion2({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (value: string | null) => void;
}) {
  const init = decode(value);
  const [loc, setLoc] = useState<Loc | null>(init.loc);
  const [spe, setSpe] = useState<Spe | null>(init.spe);
  const [dur, setDur] = useState<string | null>(init.dur);

  const pickLoc = (l: Loc) => {
    setLoc(l); setSpe(null); setDur(null);
    onChange(l === 'nex' ? 'nex' : null);
  };
  const pickSpe = (s: Spe) => {
    setSpe(s); setDur(null);
    onChange(s === 'non' ? 'fr_autre_spe' : null);
  };
  const pickDur = (v: string) => { setDur(v); onChange(v); };
  const switchTab = (l: 'fr' | 'et') => {
    if (l === loc) return;
    setLoc(l); setDur(null);
    onChange(null); // spécialité conservée (oui), durée à re-choisir
  };

  const durList = loc === 'et' ? ETRANGER_DUR : FRANCE_DUR;

  return (
    <div className="space-y-1">
      {/* ---- Q2 : lieu d'exercice ---- */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <LocCard
          active={loc === 'fr'} onClick={() => pickLoc('fr')}
          icon={<span className="h-8 w-8 overflow-hidden rounded-full shadow-sm ring-1 ring-black/5"><FrenchFlag className="h-full w-full" /></span>}
          title="En France" desc="Vous exercez actuellement en France."
        />
        <LocCard
          active={loc === 'et'} onClick={() => pickLoc('et')}
          icon={<Globe className="h-7 w-7" style={{ color: '#2563EB' }} />}
          title="À l’étranger" desc="Vous exercez actuellement à l’étranger."
        />
        <LocCard
          active={loc === 'nex'} onClick={() => pickLoc('nex')}
          icon={<User className="h-7 w-7" style={{ color: '#7A8399' }} />}
          title="Je n’exerce pas actuellement" desc="Vous n’exercez pas actuellement."
        />
      </div>
      <InfoTip icon={<Info className="h-3.5 w-3.5" style={{ color: NAVY }} />} text="La suite des questions s’adapte à votre réponse." />

      {/* ---- 2.1 : même spécialité ? ---- */}
      {(loc === 'fr' || loc === 'et') && (
        <>
          <Connector />
          <SubHeading n="2.1" title="Exercez-vous dans la spécialité que vous présenterez aux EVC ?" hint="Sélectionnez votre situation." />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => pickSpe('oui')} className="rounded-2xl border-2 p-4 text-center transition-all"
              style={{ borderColor: spe === 'oui' ? RED : '#E7EAF0', background: spe === 'oui' ? '#FDF0F1' : '#fff' }}>
              <span className="relative flex justify-center">
                <span className="absolute left-0 top-0 flex h-5 w-5 items-center justify-center rounded-full border-2" style={{ borderColor: spe === 'oui' ? RED : '#CBD2DD' }}>
                  {spe === 'oui' && <span className="h-2.5 w-2.5 rounded-full" style={{ background: RED }} />}
                </span>
                <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: '#E7F6EC' }}>
                  <Check className="h-7 w-7" style={{ color: '#16793C' }} strokeWidth={2.6} />
                </span>
              </span>
              <p className="mt-3 text-[14px] font-black" style={{ color: NAVY }}>Oui, dans ma spécialité</p>
              <p className="mt-1 text-[12px] leading-snug" style={{ color: INK_SOFT }}>J’exerce dans la même spécialité que celle présentée aux EVC.</p>
            </button>

            <button type="button" onClick={() => pickSpe('non')} className="rounded-2xl border-2 p-4 text-center transition-all"
              style={{ borderColor: spe === 'non' ? RED : '#E7EAF0', background: spe === 'non' ? '#FDF0F1' : '#fff' }}>
              <span className="relative flex justify-center">
                <span className="absolute left-0 top-0 flex h-5 w-5 items-center justify-center rounded-full border-2" style={{ borderColor: spe === 'non' ? RED : '#CBD2DD' }}>
                  {spe === 'non' && <span className="h-2.5 w-2.5 rounded-full" style={{ background: RED }} />}
                </span>
                <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: '#FEF0E4' }}>
                  <RefreshCw className="h-7 w-7" style={{ color: '#E8742C' }} strokeWidth={2.4} />
                </span>
              </span>
              <p className="mt-3 text-[14px] font-black" style={{ color: NAVY }}>Non, dans une autre spécialité</p>
              <p className="mt-1 text-[12px] leading-snug" style={{ color: INK_SOFT }}>J’exerce dans une spécialité différente de celle présentée aux EVC.</p>
              <div className="mt-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-left" style={{ borderColor: '#F5D7B8', background: '#FEF6EC' }}>
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" style={{ color: '#E8742C' }} />
                <p className="text-[11px] leading-snug" style={{ color: '#8A5A1E' }}>
                  <strong>Vous préparez les EVC dans une spécialité différente de votre spécialité d’exercice.</strong> Cette situation nécessite généralement une préparation plus spécifique et plus approfondie.
                </p>
              </div>
            </button>
          </div>
        </>
      )}

      {/* ---- 2.2 : durée d'exercice ---- */}
      {(loc === 'fr' || loc === 'et') && spe === 'oui' && (
        <>
          <Connector />
          <SubHeading n="2.2" title="Depuis combien de temps exercez-vous dans cette spécialité ?" hint="Sélectionnez la durée correspondant à votre exercice." />
          {/* Onglets France / Étranger (reflètent le lieu choisi) */}
          <div className="mt-1 grid grid-cols-2 overflow-hidden rounded-xl border" style={{ borderColor: '#E7EAF0' }}>
            <button type="button" onClick={() => switchTab('fr')}
              className="flex items-center justify-center gap-1.5 py-2.5 text-[12.5px] font-bold transition-colors"
              style={loc === 'fr' ? { color: RED, borderBottom: `2px solid ${RED}`, background: '#fff' } : { color: INK_SOFT, background: '#F6F7FB' }}>
              <span className="h-3 w-4 overflow-hidden rounded-[2px] ring-1 ring-black/5"><FrenchFlag className="h-full w-full" /></span> EN FRANCE
            </button>
            <button type="button" onClick={() => switchTab('et')}
              className="flex items-center justify-center gap-1.5 py-2.5 text-[12.5px] font-bold transition-colors"
              style={loc === 'et' ? { color: RED, borderBottom: `2px solid ${RED}`, background: '#fff' } : { color: INK_SOFT, background: '#F6F7FB' }}>
              <Globe className="h-3.5 w-3.5" /> À L’ÉTRANGER
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {durList.map((d) => {
              const active = dur === d.value;
              return (
                <button key={d.value} type="button" onClick={() => pickDur(d.value)}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 px-2 py-3 text-center transition-all"
                  style={{ borderColor: active ? RED : '#E7EAF0', background: active ? '#FDF0F1' : '#fff' }}>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border-2" style={{ borderColor: active ? RED : '#CBD2DD' }}>
                    {active && <span className="h-2.5 w-2.5 rounded-full" style={{ background: RED }} />}
                  </span>
                  <CalendarDays className="h-4.5 w-4.5" style={{ color: active ? RED : INK_SOFT }} />
                  <span className="text-[11.5px] font-bold leading-tight" style={{ color: active ? RED_DEEP : INK }}>{d.label}</span>
                </button>
              );
            })}
          </div>
          <InfoTip icon={<Lightbulb className="h-3.5 w-3.5" style={{ color: '#2563EB' }} />} text="La durée d’exercice influence votre niveau de mise à jour des connaissances et le type d’accompagnement le plus pertinent pour vous." tone="blue" />
        </>
      )}
    </div>
  );
}

function LocCard({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button type="button" onClick={onClick} className="relative rounded-2xl border-2 p-4 text-center transition-all"
      style={{ borderColor: active ? RED : '#E7EAF0', background: active ? '#FDF0F1' : '#fff' }}>
      <span className="absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2" style={{ borderColor: active ? RED : '#CBD2DD' }}>
        {active && <span className="h-2.5 w-2.5 rounded-full" style={{ background: RED }} />}
      </span>
      <span className="flex justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: '#F1F4FA' }}>{icon}</span>
      </span>
      <p className="mt-3 text-[14px] font-black leading-tight" style={{ color: NAVY }}>{title}</p>
      <p className="mt-1 text-[12px] leading-snug" style={{ color: INK_SOFT }}>{desc}</p>
    </button>
  );
}

function Connector() {
  return (
    <div className="flex justify-center py-1">
      <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: RED }}>
        <ChevronDown className="h-4 w-4 text-white" strokeWidth={2.6} />
      </span>
    </div>
  );
}

function SubHeading({ n, title, hint }: { n: string; title: string; hint: string }) {
  return (
    <div className="mb-2 flex items-start gap-2.5">
      <span className="flex h-7 shrink-0 items-center justify-center rounded-full px-2 text-[11px] font-black text-white" style={{ background: NAVY }}>{n}</span>
      <div>
        <p className="text-[14.5px] font-black leading-snug" style={{ color: NAVY }}>{title}</p>
        <p className="text-[12px]" style={{ color: INK_SOFT }}>{hint}</p>
      </div>
    </div>
  );
}

function InfoTip({ icon, text, tone = 'navy' }: { icon: React.ReactNode; text: string; tone?: 'navy' | 'blue' }) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-xl px-3 py-2" style={{ background: tone === 'blue' ? '#EEF4FF' : '#F4F6FB' }}>
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p className="text-[11.5px] leading-snug" style={{ color: INK_SOFT }}>{text}</p>
    </div>
  );
}
