'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toggleVisibility, moveAnnouncement } from './actions';

export function ToggleVisibilityForm({ id, visible, children }: { id: string; visible: boolean; children: React.ReactNode }) {
  const router = useRouter();
  const [, start] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        start(async () => {
          await toggleVisibility(id, visible);
          router.refresh();
        });
      }}
    >
      {children}
    </form>
  );
}

export function MoveBlockForm({ id, direction, children }: { id: string; direction: 'up' | 'down'; children: React.ReactNode }) {
  const router = useRouter();
  const [, start] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        start(async () => {
          await moveAnnouncement(id, direction);
          router.refresh();
        });
      }}
    >
      {children}
    </form>
  );
}
