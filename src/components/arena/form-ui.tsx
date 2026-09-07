'use client';

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { ARENA, BODY } from './arena-ui';

/** Champs de formulaire sur fond sombre — contrastes forts, lisibles au téléphone. */

const base =
  'w-full rounded-xl px-4 py-3 text-[15px] outline-none transition-[box-shadow,background-color] placeholder:text-[#5F6B85] focus:bg-white/[0.06]';
const baseStyle = { background: 'rgba(255,255,255,0.04)', boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}`, color: ARENA.text, fontFamily: BODY } as const;

export function Field({ label, hint, error, children, htmlFor }: { label: string; hint?: string; error?: string | null; children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-[12px] font-extrabold uppercase tracking-[0.14em]" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{label}</span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{hint}</span>}
      {error && <span className="mt-1.5 block text-xs font-bold" style={{ color: ARENA.redSoft, fontFamily: BODY }}>{error}</span>}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${base} ${props.className ?? ''}`} style={{ ...baseStyle, ...props.style }} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${base} min-h-[110px] ${props.className ?? ''}`} style={{ ...baseStyle, ...props.style }} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${base} appearance-none ${props.className ?? ''}`} style={{ ...baseStyle, ...props.style }}>
      {props.children}
    </select>
  );
}

export function CheckRow({ checked, onChange, children, required }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; required?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl p-3.5 transition-colors hover:bg-white/[0.03]" style={{ boxShadow: `inset 0 0 0 1px ${checked ? 'rgba(228,0,43,0.5)' : ARENA.line}` }}>
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md"
        style={{ background: checked ? ARENA.red : 'rgba(255,255,255,0.06)', boxShadow: `inset 0 0 0 1px ${checked ? ARENA.red : ARENA.lineStrong}` }}
        aria-hidden
      >
        {checked && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} required={required} />
      <span className="text-[13.5px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{children}</span>
    </label>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-xl px-4 py-3 text-[13.5px] font-bold" style={{ background: 'rgba(228,0,43,0.10)', boxShadow: 'inset 0 0 0 1px rgba(228,0,43,0.4)', color: ARENA.text, fontFamily: BODY }}>
      {children}
    </p>
  );
}
