'use client';

import { useState } from 'react';
import { AlertTriangle, BookOpen, Brain, ChevronDown, FileText, ImageIcon, Lightbulb, Star } from 'lucide-react';
import type { PriveFiche } from '@/lib/data/prive-courses';

function md(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="rounded bg-gray-100 px-1 py-0.5 text-[12px]">$1</code>')
    .replace(/\n/g, '<br/>');
}

const KIND_STYLES: Record<string, { bg: string; border: string; icon: typeof Star; label: string }> = {
  a_retenir: { bg: '#FEF3C7', border: '#F59E0B', icon: Star, label: 'A retenir' },
  piege: { bg: '#FEE2E2', border: '#EF4444', icon: AlertTriangle, label: 'Piege' },
  mnemo: { bg: '#EDE9FE', border: '#8B5CF6', icon: Brain, label: 'Mnemo' },
};

function FicheImage({ src, alt }: { src: string; alt?: string }) {
  return (
    <figure className="my-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <img src={src} alt={alt ?? ''} className="w-full object-contain" loading="lazy" />
      {alt && (
        <figcaption className="flex items-center gap-1.5 border-t border-gray-100 px-4 py-2 text-[12px] text-gray-500">
          <ImageIcon className="h-3 w-3 shrink-0" />
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

function FicheRow({ row }: { row: { concept: string; detail_md: string; kind: string; image_url?: string } }) {
  const style = KIND_STYLES[row.kind];

  if (style) {
    const Icon = style.icon;
    return (
      <div
        className="my-3 rounded-xl border-l-4 px-5 py-4"
        style={{ background: style.bg, borderColor: style.border }}
      >
        <div className="mb-1 flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider" style={{ color: style.border }}>
          <Icon className="h-3.5 w-3.5" />
          {style.label}
        </div>
        <div
          className="text-[14px] leading-relaxed text-gray-800"
          dangerouslySetInnerHTML={{ __html: md(row.detail_md) }}
        />
        {row.image_url && <FicheImage src={row.image_url} />}
      </div>
    );
  }

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <div className="grid grid-cols-[180px_1fr]">
        <div className="border-r border-gray-100 bg-gray-50/50 px-4 py-3 text-[13px] font-semibold text-gray-700">
          <span dangerouslySetInnerHTML={{ __html: md(row.concept) }} />
        </div>
        <div
          className="px-4 py-3 text-[13px] leading-relaxed text-gray-600"
          dangerouslySetInnerHTML={{ __html: md(row.detail_md) }}
        />
      </div>
      {row.image_url && (
        <div className="px-4 pb-3">
          <FicheImage src={row.image_url} />
        </div>
      )}
    </div>
  );
}

export function PriveFicheViewer({ fiche, titre }: { fiche: PriveFiche; titre: string }) {
  const [expandedParts, setExpandedParts] = useState<Set<string>>(() => new Set(fiche.parties.map((p) => p.numero)));

  function togglePart(numero: string) {
    setExpandedParts((prev) => {
      const next = new Set(prev);
      if (next.has(numero)) next.delete(numero); else next.add(numero);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C0112E]/10">
          <FileText className="h-5 w-5 text-[#C0112E]" />
        </div>
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#C0112E]">Fiche de cours</p>
          <h1 className="text-[22px] font-extrabold tracking-tight text-[#0F1F4D]">{titre}</h1>
        </div>
      </div>

      {/* Table of contents */}
      <nav className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#C0112E]" />
          <p className="text-[13px] font-bold uppercase tracking-wider text-[#0F1F4D]">Sommaire</p>
        </div>
        <ol className="space-y-1.5">
          {fiche.parties.map((p) => (
            <li key={p.numero}>
              <button
                onClick={() => {
                  const el = document.getElementById(`partie-${p.numero}`);
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="flex items-center gap-2 text-[14px] font-medium text-[#0F1F4D] transition-colors hover:text-[#C0112E]"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#C0112E]/10 text-[11px] font-bold text-[#C0112E]">
                  {p.numero}
                </span>
                {p.titre}
              </button>
              {p.sous_parties.length > 0 && (
                <ol className="ml-7 mt-1 space-y-0.5">
                  {p.sous_parties.map((sp, i) => (
                    <li key={i}>
                      <button
                        onClick={() => {
                          const el = document.getElementById(`sp-${p.numero}-${i}`);
                          el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="text-[13px] text-gray-500 transition-colors hover:text-[#C0112E] hover:underline"
                      >
                        {sp.titre}
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Content */}
      {fiche.parties.map((p) => {
        const isExpanded = expandedParts.has(p.numero);
        return (
          <section key={p.numero} id={`partie-${p.numero}`} className="mb-6">
            <button
              onClick={() => togglePart(p.numero)}
              className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 bg-white px-5 py-4 text-left shadow-sm transition-all hover:shadow-md"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#C0112E] text-[14px] font-bold text-white">
                {p.numero}
              </span>
              <span className="flex-1 text-[16px] font-bold text-[#0F1F4D]">{p.titre}</span>
              <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {isExpanded && (
              <div className="mt-3 space-y-4 border-l-2 border-[#C0112E]/20 pl-4">
                {p.image_url && <FicheImage src={p.image_url} alt={p.titre} />}
                {p.sous_parties.map((sp, spIdx) => (
                  <div key={spIdx} id={`sp-${p.numero}-${spIdx}`} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                    <div className="border-b border-gray-200 bg-[#FAFBFE] px-5 py-3">
                      <h3 className="text-[15px] font-bold text-[#0F1F4D]">{sp.titre}</h3>
                    </div>
                    <div>
                      {sp.rows.map((row, rIdx) => (
                        <FicheRow key={rIdx} row={row} />
                      ))}
                      {sp.image_url && (
                        <div className="px-4 pb-4">
                          <FicheImage src={sp.image_url} alt={sp.titre} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      {/* Points cles */}
      {fiche.points_cles.length > 0 && (
        <section className="mt-8 rounded-2xl border-2 border-[#C0112E] bg-[#FFF5F6] p-6">
          <h2 className="mb-4 flex items-center gap-2 text-[16px] font-extrabold text-[#C0112E]">
            <Lightbulb className="h-5 w-5" />
            Points cles
          </h2>
          <ul className="space-y-2">
            {fiche.points_cles.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-[14px] text-gray-700">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C0112E]" />
                <span dangerouslySetInnerHTML={{ __html: md(pt) }} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Chiffres cles */}
      {fiche.chiffres_cles && (
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-[16px] font-extrabold text-[#0F1F4D]">{fiche.chiffres_cles.titre}</h2>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: md(fiche.chiffres_cles.markdown) }}
          />
        </section>
      )}
    </div>
  );
}
