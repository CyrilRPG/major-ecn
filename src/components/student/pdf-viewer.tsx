'use client';

import { useState, useTransition } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export function PdfViewer({ src, coursId, initiallyRead }: { src: string; coursId: string; initiallyRead: boolean }) {
  const [read, setRead] = useState(initiallyRead);
  const [pending, start] = useTransition();
  const markRead = () => {
    start(async () => {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      await supabase.from('course_progress').upsert(
        { user_id: data.user.id, cours_id: coursId, fiche_read: true, last_seen_at: new Date().toISOString() },
        { onConflict: 'user_id,cours_id' },
      );
      setRead(true);
    });
  };

  return (
    <div className="surface-card overflow-hidden p-0">
      <div className="flex items-center justify-between gap-3 border-b border-(--color-border) px-5 py-3 bg-(--color-surface-soft)">
        <p className="text-sm text-(--color-ink-soft)">Utilise la molette pour zoomer.</p>
        <Button size="sm" variant={read ? 'secondary' : 'primary'} onClick={markRead} disabled={pending || read}>
          {pending ? <Loader2 className="animate-spin" /> : <Check />}
          {read ? 'Marquée comme lue' : 'Marquer comme lue'}
        </Button>
      </div>
      <iframe
        src={`${src}#view=FitH`}
        title="Fiche de cours"
        className="w-full h-[80vh] bg-slate-50 dark:bg-slate-900"
      />
    </div>
  );
}
