'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { deletePost } from './actions';

export function DeletePostButton({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      title="Supprimer"
      disabled={pending}
      onClick={() => {
        if (!window.confirm(`Supprimer définitivement « ${title || 'cet article'} » ?`)) return;
        start(async () => {
          await deletePost(id);
          router.refresh();
        });
      }}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-ink-muted) hover:bg-[#FDE7E9] hover:text-[#C0001F] disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  );
}
