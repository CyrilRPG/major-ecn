'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Clock, Lock, Star, HelpCircle, Check } from 'lucide-react';
import { DiagIcon } from './icons';
import { ProfilQuestion2 } from './profil-question2';
import { QUESTIONS, type Answers } from '@/lib/diagnostic/scoring';

const RED = '#C0112E';
const RED_DEEP = '#8B0E22';
const NAVY = '#0F1F4D';
const INK = '#1F2937';
const INK_SOFT = '#52607A';

const GROUP_EMOJI: Record<string, string> = {
  'France': '🇫🇷',
  'Étranger': '🌍',
  'Autre situation': '•',
};

export function ProfilQuestions({
  initial,
  onComplete,
  onBack,
}: {
  initial?: Answers;
  onComplete: (answers: Answers) => void;
  onBack: () => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initial ?? {});
  const q = QUESTIONS[idx];
  const total = QUESTIONS.length;
  const current = answers[q.id];
  const last = idx === total - 1;
  const isMulti = q.multi === true;
  const selectedValues = current?.values ?? [];
  // Question répondue : valeur unique OU au moins une case cochée (choix multiple).
  const answered = isMulti ? selectedValues.length > 0 : !!current?.value;

  const select = (value: string) => {
    setAnswers((prev) => ({ ...prev, [q.id]: { value, detail: prev[q.id]?.detail } }));
  };
  const toggleMulti = (value: string) => {
    setAnswers((prev) => {
      const cur = prev[q.id]?.values ?? [];
      const nextVals = cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value];
      return { ...prev, [q.id]: { value: '', values: nextVals } };
    });
  };
  // Q2 adaptatif : pose ou efface la valeur selon l'avancement de la sélection.
  const setValue = (value: string | null) => {
    setAnswers((prev) => {
      const nextA = { ...prev };
      if (value) nextA[q.id] = { value };
      else delete nextA[q.id];
      return nextA;
    });
  };
  const setDetail = (detail: string) => {
    setAnswers((prev) => ({ ...prev, [q.id]: { value: prev[q.id]?.value ?? '', detail } }));
  };

  const next = () => {
    if (!answered) return;
    if (last) { onComplete(answers); return; }
    setIdx((v) => Math.min(total - 1, v + 1));
  };
  const prev = () => {
    if (idx === 0) { onBack(); return; }
    setIdx((v) => Math.max(0, v - 1));
  };

  // Regroupe les options par sous-groupe (Q2).
  const groups: { name?: string; options: typeof q.options }[] = [];
  for (const opt of q.options) {
    const gname = opt.group;
    let g = groups.find((x) => x.name === gname);
    if (!g) { g = { name: gname, options: [] }; groups.push(g); }
    g.options.push(opt);
  }

  return (
    <div className="w-full bg-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ===== Header ===== */}
      <div className="border-b border-black/8 px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <span className="text-[13px] font-black tracking-tight" style={{ color: NAVY }}>
            VOTRE <span style={{ color: RED }}>PROFIL EVC</span>
          </span>
          <span className="hidden items-center gap-1.5 text-[11px] font-bold text-green-700 sm:inline-flex">
            <ShieldCheck className="h-3.5 w-3.5" /> 100% confidentiel
          </span>
        </div>
        {/* Étapes — 11 au total : l'étape 1 est le formulaire d'infos (déjà complété). */}
        <div className="mx-auto mt-3 flex max-w-5xl items-center gap-1.5">
          {/* Étape 1 : infos (toujours cochée) */}
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full" style={{ background: RED, color: '#fff' }}>
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          {QUESTIONS.map((qq, i) => {
            const done = i < idx;
            const active = i === idx;
            return (
              <div key={qq.id} className="flex flex-1 items-center">
                <span className="h-[2px] flex-1" style={{ background: i <= idx ? RED : '#EEF1F6' }} />
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black transition-colors"
                  style={done || active ? { background: RED, color: '#fff' } : { background: '#EEF1F6', color: '#9AA1AE' }}
                >
                  {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 2}
                </span>
              </div>
            );
          })}
        </div>
        <p className="mx-auto mt-2 max-w-5xl text-center text-[11px] font-semibold" style={{ color: INK_SOFT }}>
          Étape {idx + 2} sur 11
        </p>
      </div>

      {/* ===== Corps ===== */}
      <div className="mx-auto grid max-w-5xl gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[1.7fr_1fr]">
        {/* Question */}
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider" style={{ color: RED }}>
            Question {q.index} / 11
          </p>
          <div className="mt-2 flex items-start gap-3">
            <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white" style={{ background: `linear-gradient(150deg, ${NAVY}, ${RED})` }}>
              <DiagIcon name={q.icon} className="h-5.5 w-5.5" strokeWidth={2.1} />
            </span>
            <h2 className="text-[17px] font-black leading-snug sm:text-[19px]" style={{ color: NAVY }}>
              {q.title}
            </h2>
          </div>
          {q.hint && <p className="mt-2 text-[12.5px]" style={{ color: INK_SOFT }}>{q.hint}</p>}

          {q.id === 'q2_activite' ? (
            <div className="mt-4">
              <ProfilQuestion2 value={current?.value} onChange={setValue} />
            </div>
          ) : (
          <div className="mt-4 space-y-4">
            {groups.map((g) => (
              <div key={g.name ?? 'default'}>
                {g.name && (
                  <p className="mb-2 text-[12px] font-black uppercase tracking-wide" style={{ color: NAVY }}>
                    {GROUP_EMOJI[g.name] ?? ''} {g.name}
                  </p>
                )}
                <div className="space-y-2">
                  {g.options.map((opt) => {
                    const active = isMulti ? selectedValues.includes(opt.value) : current?.value === opt.value;
                    return (
                      <div key={opt.value}>
                        <button
                          type="button"
                          onClick={() => (isMulti ? toggleMulti(opt.value) : select(opt.value))}
                          className="flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition-all"
                          style={{
                            borderColor: active ? RED : '#E7EAF0',
                            background: active ? '#FDF0F1' : '#fff',
                          }}
                        >
                          <span className="flex-1 text-[13.5px] font-semibold leading-snug" style={{ color: active ? RED_DEEP : INK }}>
                            {opt.label}
                          </span>
                          {isMulti ? (
                            <span
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2"
                              style={{ borderColor: active ? RED : '#CBD2DD', background: active ? RED : '#fff' }}
                            >
                              {active && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                            </span>
                          ) : (
                            <span
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2"
                              style={{ borderColor: active ? RED : '#CBD2DD' }}
                            >
                              {active && <span className="h-2.5 w-2.5 rounded-full" style={{ background: RED }} />}
                            </span>
                          )}
                        </button>
                        {active && opt.detailPlaceholder && (
                          <input
                            type="text"
                            value={current?.detail ?? ''}
                            onChange={(e) => setDetail(e.target.value)}
                            placeholder={opt.detailPlaceholder}
                            className="mt-2 w-full rounded-lg border px-3 py-2 text-[13px] outline-none focus:border-[#C0112E]"
                            style={{ borderColor: '#E7EAF0' }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-3">
          <div className="rounded-2xl border border-black/8 bg-[#FAFBFD] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider" style={{ color: RED }}>
              <HelpCircle className="h-3.5 w-3.5" /> À quoi sert cette question ?
            </p>
            <p className="mt-2 text-[12.5px] leading-relaxed" style={{ color: INK_SOFT }}>{q.why}</p>
          </div>
          <div className="flex items-start gap-2.5 rounded-2xl border border-black/8 bg-white p-3.5">
            <Clock className="mt-0.5 h-4 w-4 shrink-0" style={{ color: RED }} />
            <div>
              <p className="text-[12px] font-black" style={{ color: NAVY }}>Temps estimé</p>
              <p className="text-[11.5px]" style={{ color: INK_SOFT }}>Moins de 30 secondes</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 rounded-2xl border border-black/8 bg-white p-3.5">
            <Lock className="mt-0.5 h-4 w-4 shrink-0" style={{ color: RED }} />
            <div>
              <p className="text-[12px] font-black" style={{ color: NAVY }}>Confidentiel</p>
              <p className="text-[11.5px]" style={{ color: INK_SOFT }}>Vos réponses restent strictement confidentielles.</p>
            </div>
          </div>
          <div className="rounded-2xl border border-black/8 p-3.5" style={{ background: '#FFF7F8' }}>
            <p className="text-[12px] font-black" style={{ color: RED }}>La référence en préparation EVC</p>
            <p className="mt-1 text-[11.5px]" style={{ color: INK_SOFT }}>Des milliers de candidats accompagnés depuis plus de 15 ans.</p>
            <div className="mt-1.5 flex gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-3.5 w-3.5" style={{ color: '#FFC107' }} fill="#FFC107" />)}
            </div>
          </div>
        </aside>
      </div>

      {/* ===== Footer nav ===== */}
      <div className="border-t border-black/8 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <button
            type="button"
            onClick={prev}
            className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-bold transition-colors hover:bg-black/5"
            style={{ color: INK_SOFT }}
          >
            <ArrowLeft className="h-4 w-4" /> Précédent
          </button>
          <button
            type="button"
            onClick={next}
            disabled={!answered}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-[14px] font-extrabold text-white shadow-lg transition-transform enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: `linear-gradient(90deg, ${RED_DEEP}, ${RED})` }}
          >
            {last ? 'Terminer mon diagnostic' : 'Suivant'} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
