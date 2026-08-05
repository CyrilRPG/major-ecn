'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Markdown } from '@/components/ui/markdown';

export type AiQuestionRow = {
  id: string;
  user_pseudo: string | null;
  user_offer: string | null;
  cours_titre: string | null;
  user_question: string | null;
  ai_answer: string | null;
  created_at: string;
};

const OFFER_LABELS: Record<string, string> = {
  essentiel: 'Essentielle',
  intensif: 'Intensive',
  approfondi: 'Approfondi',
  decouverte: 'Découverte',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' à '
    + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function AiQuestionsTable({ rows }: { rows: AiQuestionRow[] }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) px-5 py-12 text-center text-sm text-(--color-ink-soft)">
        Aucune question IA enregistrée pour l'instant.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface)">
      {/* Header */}
      <div className="hidden grid-cols-[1fr_140px_180px_90px] gap-3 border-b border-(--color-border) bg-(--color-surface-soft) px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-(--color-ink-muted) sm:grid">
        <span>Élève / Cours</span>
        <span>Formule</span>
        <span>Date</span>
        <span className="text-right">Actions</span>
      </div>

      {rows.map((r) => {
        const isOpen = expanded.has(r.id);
        return (
          <div key={r.id} className="border-b border-(--color-border) last:border-b-0">
            {/* Row */}
            <div className="grid grid-cols-1 gap-1 px-4 py-3 sm:grid-cols-[1fr_140px_180px_90px] sm:items-center sm:gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-(--color-ink)">
                  {r.user_pseudo || 'Élève'}
                </p>
                <p className="truncate text-xs text-(--color-ink-muted)">
                  {r.cours_titre || '—'}
                </p>
              </div>
              <div>
                <span
                  className={cn(
                    'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
                    r.user_offer === 'approfondi' ? 'bg-purple-100 text-purple-700'
                      : r.user_offer === 'intensif' ? 'bg-blue-100 text-blue-700'
                      : r.user_offer === 'essentiel' ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-gray-100 text-gray-600',
                  )}
                >
                  {OFFER_LABELS[r.user_offer ?? ''] ?? r.user_offer ?? '—'}
                </span>
              </div>
              <p className="text-xs tabular-nums text-(--color-ink-soft)">
                {formatDate(r.created_at)}
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => toggle(r.id)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-(--color-primary) hover:bg-(--color-primary-soft) transition"
                >
                  Détails
                  {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Expanded details */}
            {isOpen && (
              <div className="border-t border-(--color-border) bg-(--color-surface-soft) px-4 py-4 space-y-3">
                {r.user_question && (
                  <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-3">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-(--color-ink-muted)">
                      <User className="h-3 w-3" /> Question de l'élève
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-(--color-ink)">
                      {r.user_question}
                    </p>
                  </div>
                )}
                {r.ai_answer && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3">
                    <div className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-600">
                      <Bot className="h-3 w-3" /> Réponse de l'IA
                    </div>
                    <div className="text-sm leading-relaxed text-(--color-ink) prose prose-sm max-w-none">
                      <Markdown>{r.ai_answer}</Markdown>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
