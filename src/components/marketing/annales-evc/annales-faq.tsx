'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { INK_MUTED, INK_SOFT, JAKARTA, MANROPE, NAVY, PINK_BG, RED } from '@/components/marketing/home/home-ui';

const BORDER = '#E6E4DF';

export type QuestionAnnales = { q: string; r: string };

/** Accordéon des questions sur les recueils (même dessin que la FAQ de l'accueil). */
export function AnnalesFaq({ questions }: { questions: QuestionAnnales[] }) {
  const [ouverte, setOuverte] = useState<number | null>(0);
  return (
    <ul className="space-y-2.5" style={{ fontFamily: JAKARTA }}>
      {questions.map((item, i) => {
        const open = ouverte === i;
        return (
          <li
            key={item.q}
            className="overflow-hidden rounded-2xl border bg-white transition-shadow"
            style={{ borderColor: BORDER, boxShadow: open ? '0 14px 34px -22px rgba(15,31,77,0.35)' : undefined }}
          >
            <button
              type="button"
              onClick={() => setOuverte(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center gap-3.5 px-4 py-4 text-left transition-colors hover:bg-[#FFF8F9] sm:px-5"
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[13px] font-black tabular-nums"
                style={{ background: open ? RED : PINK_BG, color: open ? 'white' : RED }}
              >
                {i + 1}
              </span>
              <span className="flex-1 text-[14.5px] font-extrabold sm:text-[15px]" style={{ color: open ? RED : NAVY }}>{item.q}</span>
              <ChevronDown className={'h-4.5 w-4.5 shrink-0 transition-transform duration-300 ' + (open ? 'rotate-180' : '')} style={{ color: open ? RED : INK_MUTED }} />
            </button>
            <div className={'grid transition-[grid-template-rows] duration-300 ease-out ' + (open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
              <div className="min-h-0 overflow-hidden">
                <p className="border-t px-5 pb-5 pt-4 text-[13.5px] leading-relaxed sm:pl-[4.25rem]" style={{ borderColor: BORDER, color: INK_SOFT, fontFamily: MANROPE, background: '#FAFBFD' }}>
                  {item.r}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
