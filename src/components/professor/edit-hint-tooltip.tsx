'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { X, Pencil } from 'lucide-react';

export function EditHintTooltip({
  contentType,
  message,
  children,
  align = 'center',
}: {
  contentType: 'fiche' | 'qcm' | 'flashcard';
  message: string;
  children: ReactNode;
  align?: 'center' | 'right';
}) {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const key = `major-ecn:edit-hint-${contentType}`;

  useEffect(() => {
    try { if (localStorage.getItem(key)) return; } catch { return; }
    const t = setTimeout(() => {
      setShow(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setMounted(true)));
    }, 800);
    return () => clearTimeout(t);
  }, [key]);

  const dismiss = useCallback(() => {
    setShow(false);
    setMounted(false);
    try { localStorage.setItem(key, '1'); } catch {}
  }, [key]);

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(dismiss, 8000);
    return () => clearTimeout(t);
  }, [show, dismiss]);

  const right = align === 'right';

  return (
    <div className="relative inline-flex">
      {children}
      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={dismiss} />
          <div
            className={`absolute top-full z-50 mt-3 w-56 sm:w-64 ${right ? 'right-0' : 'left-1/2'}`}
            style={{
              opacity: mounted ? 1 : 0,
              transform: `${right ? '' : 'translateX(-50%) '}translateY(${mounted ? '0px' : '6px'})`,
              transition: 'opacity 0.3s cubic-bezier(0.16,1,0.3,1), transform 0.3s cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            <div className={`absolute -top-1.5 ${right ? 'right-4' : 'left-1/2 -translate-x-1/2'}`}>
              <div className="h-3 w-3 rotate-45 rounded-[2px] bg-[#0F1F4D]" />
            </div>
            <div className="overflow-hidden rounded-xl bg-[#0F1F4D] shadow-2xl ring-1 ring-white/10">
              <div className="h-[3px] bg-gradient-to-r from-[#6B1A2A] via-[#C0112E] to-[#E8742C]" />
              <div className="flex items-start gap-2.5 px-3.5 py-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10">
                  <Pencil className="h-3.5 w-3.5 text-white" />
                </span>
                <p className="flex-1 text-[13px] leading-snug text-white/90">
                  {message}
                </p>
                <button
                  onClick={(e) => { e.stopPropagation(); dismiss(); }}
                  className="ml-0.5 shrink-0 rounded-md p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
