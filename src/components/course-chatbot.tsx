'use client';

import { useRef, useState } from 'react';
import { ArrowUp, Bot, Loader2, ShieldCheck, Sparkles, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AskTeacherButton } from '@/components/student/ask-teacher-button';
import { Markdown } from '@/components/ui/markdown';

type Message = { role: 'user' | 'assistant'; content: string };

export function CourseChatbot({
  coursId,
  coursTitre,
  onClose,
}: {
  coursId: string;
  coursTitre: string;
  onClose?: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Salut 👋 — je suis là pour t'aider sur « ${coursTitre} ». Vas-y, balance ta question, je te réponds.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coursId, message: text }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      setMessages([
        ...next,
        { role: 'assistant', content: data.reply ?? data.error ?? 'Je n’ai pas pu répondre pour le moment.' },
      ]);
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Connexion impossible. Réessaie dans un instant.' }]);
    } finally {
      setLoading(false);
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }));
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="px-5 py-4 border-b border-(--color-border)">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-(--color-primary) text-white">
            <Bot className="h-4.5 w-4.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-(--color-ink) text-sm leading-tight">Assistant du cours</p>
            <p className="text-xs text-(--color-ink-muted)">Réponses limitées à ce cours</p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer l’assistant"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-soft) hover:bg-(--color-primary-soft) hover:text-(--color-accent) transition focus-ring shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-(--color-primary-soft) px-3 py-2 text-[11px] leading-relaxed text-(--color-ink-soft)">
          <ShieldCheck className="h-3.5 w-3.5 mt-0.5 shrink-0 text-(--color-accent)" />
          <span>
            Cet assistant s’appuie <strong className="text-(--color-ink)">uniquement</strong> sur les contenus
            pédagogiques de ce cours. Il ne fait pas de recherche extérieure.
          </span>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
        {messages.map((m, i) => {
          const isAssistant = m.role === 'assistant';
          const isFirst = i === 0;
          const lastAssistantIdx = (() => {
            for (let k = messages.length - 1; k >= 0; k--) if (messages[k].role === 'assistant') return k;
            return -1;
          })();
          const isLastAssistant = isAssistant && i === lastAssistantIdx;
          const conversationContext = messages
            .slice(0, i + 1)
            .map((mm) => `${mm.role === 'user' ? 'Étudiant' : 'IA'} : ${mm.content}`)
            .join('\n\n');
          return (
            <div key={i} className={cn('flex flex-col', m.role === 'user' ? 'items-end' : 'items-start')}>
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  m.role === 'user'
                    ? 'bg-(--color-primary) text-(--color-primary-fg) whitespace-pre-wrap'
                    : 'bg-(--color-surface-soft) border border-(--color-border) text-(--color-ink)',
                )}
              >
                {m.role === 'assistant' ? <Markdown>{m.content}</Markdown> : m.content}
              </div>
              {isAssistant && !isFirst && isLastAssistant && !loading && (
                <div className="mt-1.5 max-w-[85%]">
                  <AskTeacherButton coursId={coursId} aiContext={conversationContext} />
                </div>
              )}
            </div>
          );
        })}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-(--color-surface-soft) border border-(--color-border) px-3.5 py-2.5">
              <Loader2 className="h-4 w-4 animate-spin text-(--color-ink-muted)" />
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-(--color-border) p-3">
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder="Pose ta question sur ce cours…"
            className="w-full resize-none rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2.5 pr-11 text-sm text-(--color-ink) placeholder:text-(--color-ink-muted) focus-ring"
          />
          <button
            type="button"
            onClick={send}
            disabled={loading || !input.trim()}
            aria-label="Envoyer"
            className="absolute right-2 bottom-2 flex h-7 w-7 items-center justify-center rounded-lg bg-(--color-primary) text-white disabled:opacity-40 hover:opacity-90 transition focus-ring"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-[10px] text-(--color-ink-muted) flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Entrée pour envoyer, Maj+Entrée pour un retour à la ligne.
        </p>
      </div>
    </div>
  );
}
