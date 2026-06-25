'use client';

import { useEffect, useState } from 'react';
import { Eye } from 'lucide-react';

export function BlogViewCounter({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const key = `blog-viewed-${slug}`;
    const alreadyCounted = sessionStorage.getItem(key);

    if (alreadyCounted) {
      fetch(`/api/blog/view?slug=${encodeURIComponent(slug)}`)
        .then((r) => r.json())
        .then((d) => setCount(d.count))
        .catch(() => {});
      return;
    }

    fetch('/api/blog/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    })
      .then((r) => r.json())
      .then((d) => {
        setCount(d.count);
        sessionStorage.setItem(key, '1');
      })
      .catch(() => {});
  }, [slug]);

  if (count == null) return null;

  return (
    <span className="inline-flex items-center gap-1.5">
      <Eye className="h-3.5 w-3.5" />
      {count.toLocaleString('fr-FR')} lecteurs
    </span>
  );
}
