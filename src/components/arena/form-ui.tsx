'use client';

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { Check, X } from 'lucide-react';
import { ARENA, BODY } from './arena-ui';

/** Champs de formulaire sur fond sombre (maquettes) — contrastes forts, lisibles au téléphone. */

const base =
  'w-full rounded-lg px-4 py-3 text-[15px] outline-none transition-[box-shadow,background-color] placeholder:text-[#5F6874] focus:bg-white/[0.05]';
const baseStyle = { background: ARENA.raised, boxShadow: `inset 0 0 0 1px ${ARENA.lineStrong}`, color: ARENA.text, fontFamily: BODY } as const;

export type FieldStatus = 'ok' | 'error' | null;

export function Field({
  label, hint, error, ok, children, htmlFor, required,
}: { label: string; hint?: string; error?: string | null; ok?: string | null; children: ReactNode; htmlFor?: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-[12px] font-semibold" style={{ color: ARENA.textSoft, fontFamily: BODY }}>
        {label}{required && <span style={{ color: ARENA.redSoft }}> *</span>}
      </span>
      {children}
      {hint && !error && !ok && <span className="mt-1.5 block text-xs" style={{ color: ARENA.textMuted, fontFamily: BODY }}>{hint}</span>}
      {ok && !error && <span className="mt-1.5 block text-xs font-semibold" style={{ color: ARENA.ok, fontFamily: BODY }}>{ok}</span>}
      {error && <span className="mt-1.5 block text-xs font-semibold" style={{ color: ARENA.redSoft, fontFamily: BODY }}>{error}</span>}
    </label>
  );
}

export function TextInput({ status, ...props }: InputHTMLAttributes<HTMLInputElement> & { status?: FieldStatus }) {
  const ring = status === 'ok' ? `inset 0 0 0 1.5px ${ARENA.ok}` : status === 'error' ? `inset 0 0 0 1.5px ${ARENA.red}` : baseStyle.boxShadow;
  return (
    <span className="relative block">
      <input {...props} className={`${base} ${status ? 'pr-11' : ''} ${props.className ?? ''}`} style={{ ...baseStyle, boxShadow: ring, ...props.style }} />
      {status === 'ok' && <Check className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: ARENA.ok }} strokeWidth={3} />}
      {status === 'error' && <X className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: ARENA.redSoft }} strokeWidth={3} />}
    </span>
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${base} min-h-[110px] ${props.className ?? ''}`} style={{ ...baseStyle, ...props.style }} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block">
      <select {...props} className={`${base} appearance-none pr-10 ${props.className ?? ''}`} style={{ ...baseStyle, ...props.style }}>
        {props.children}
      </select>
      <svg aria-hidden className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2" viewBox="0 0 16 16" style={{ color: ARENA.textMuted }}>
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export function CheckRow({ checked, onChange, children, required }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; required?: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg p-3.5 transition-colors hover:bg-white/[0.03]" style={{ background: ARENA.raised, boxShadow: `inset 0 0 0 1px ${checked ? 'rgba(228,0,43,0.6)' : ARENA.line}` }}>
      <span
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded"
        style={{ background: checked ? ARENA.red : 'rgba(255,255,255,0.06)', boxShadow: `inset 0 0 0 1.5px ${checked ? ARENA.red : ARENA.lineStrong}` }}
        aria-hidden
      >
        {checked && <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6.5l2.5 2.5L10 3.5" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} required={required} />
      <span className="text-[13.5px] leading-relaxed" style={{ color: ARENA.textSoft, fontFamily: BODY }}>{children}</span>
    </label>
  );
}

export function FormError({ children }: { children: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-lg px-4 py-3 text-[13.5px] font-semibold" style={{ background: 'rgba(228,0,43,0.10)', boxShadow: 'inset 0 0 0 1px rgba(228,0,43,0.45)', color: ARENA.text, fontFamily: BODY }}>
      {children}
    </p>
  );
}
