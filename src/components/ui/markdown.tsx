'use client';

import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

const COMPONENTS: Components = {
  p: ({ children }) => (
    <p className="leading-relaxed [&:not(:first-child)]:mt-2">{children}</p>
  ),
  h1: ({ children }) => (
    <h1 className="mt-3 mb-1.5 text-base font-bold text-(--color-ink) first:mt-0">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-3 mb-1.5 text-[15px] font-bold text-(--color-ink) first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-2.5 mb-1 text-sm font-semibold text-(--color-ink) first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-2 mb-1 text-sm font-semibold text-(--color-ink) first:mt-0">{children}</h4>
  ),
  ul: ({ children }) => (
    <ul className="my-1.5 list-disc space-y-0.5 pl-5 marker:text-(--color-ink-muted)">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-1.5 list-decimal space-y-0.5 pl-5 marker:text-(--color-ink-muted)">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => (
    <strong className="font-semibold text-(--color-ink)">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-(--color-primary) bg-(--color-primary-soft) py-1 pl-3 pr-2 text-(--color-ink-soft) italic">
      {children}
    </blockquote>
  ),
  code: ({ children, className }) => {
    const isBlock = className?.includes('language-');
    if (isBlock) {
      return (
        <code className="block overflow-x-auto rounded-lg border border-(--color-border) bg-(--color-surface-soft) px-3 py-2 font-mono text-[12px] leading-relaxed text-(--color-ink)">
          {children}
        </code>
      );
    }
    return (
      <code className="rounded bg-(--color-surface-soft) px-1 py-0.5 font-mono text-[12px] text-(--color-ink)">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="my-2 overflow-x-auto">{children}</pre>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-(--color-primary) underline hover:opacity-80"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 border-(--color-border)" />,
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-left text-[13px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-(--color-border) bg-(--color-surface-soft) px-2 py-1 font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-(--color-border) px-2 py-1 align-top">{children}</td>
  ),
};

export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={cn('break-words', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={COMPONENTS}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
