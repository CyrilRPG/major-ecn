'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CopyButton({
  text,
  label = 'Copier',
  className,
  variant = 'outline',
}: {
  text: string;
  label?: string;
  className?: string;
  variant?: 'outline' | 'primary';
}) {
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard not available — silently fail */
    }
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
        variant === 'primary'
          ? 'bg-(--color-primary) text-white hover:bg-(--color-primary-deep)'
          : 'border border-(--color-border) bg-(--color-surface) text-(--color-ink) hover:border-(--color-primary)/40',
        copied && 'text-(--color-success)',
        className,
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copié' : label}
    </button>
  );
}
