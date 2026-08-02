'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, FileText, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { setFichePdfAction } from '@/app/admin/contenu/[cours]/fiche-pdf-actions';

/**
 * Dépôt d'une fiche déjà au format PDF. Le fichier part directement du
 * navigateur vers le bucket `fiches` ; l'action serveur n'enregistre ensuite
 * que la référence, après contrôle des droits.
 *
 * Contrairement à la fiche HTML (convertie puis modifiable dans l'éditeur), un
 * PDF déposé n'est PAS éditable en ligne : c'est dit explicitement à
 * l'administrateur avant l'envoi.
 */
export function FichePdfUpload({
  coursId,
  existePdf,
}: {
  coursId: string;
  /** Une fiche PDF est déjà en place pour cet item. */
  existePdf: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  function envoyer(file: File) {
    setError(null);
    setOk(false);
    start(async () => {
      const supabase = createClient();
      const safe = file.name.replace(/[^\w.\-]+/g, '_').slice(-80);
      const path = `${coursId}/${Date.now()}-${safe}`;
      const { error: upErr } = await supabase.storage.from('fiches').upload(path, file, {
        upsert: false,
        contentType: file.type || 'application/pdf',
      });
      if (upErr) return setError(upErr.message);

      const res = await setFichePdfAction({ coursId, path, fileName: file.name });
      if ('error' in res) return setError(res.error);
      setOk(true);
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4">
      <p className="flex items-center gap-2 text-[13px] font-semibold text-(--color-ink)">
        <FileText className="h-4 w-4 text-(--color-primary)" />
        Déposer une fiche déjà au format PDF
      </p>
      <p className="mt-1 flex items-start gap-1.5 text-[12px] leading-relaxed text-(--color-ink-soft)">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Une fiche déposée en PDF <strong className="text-(--color-ink)">ne sera pas éditable en
          ligne</strong> : pour la modifier, il faudra redéposer un nouveau fichier. Elle est servie
          aux élèves filigranée à leur nom, comme les autres fiches. Si une version éditable existe
          déjà pour cet item, c’est ce PDF qui sera affiché.
        </span>
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) envoyer(f);
          e.target.value = '';
        }}
      />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => inputRef.current?.click()}>
          {pending ? <Loader2 className="animate-spin" /> : ok ? <CheckCircle2 /> : <FileText />}
          {pending ? 'Envoi…' : existePdf ? 'Remplacer le PDF' : 'Choisir un PDF'}
        </Button>
        {ok && <span className="text-xs font-semibold text-emerald-600">Fiche PDF enregistrée</span>}
        {error && <span className="text-xs font-medium text-red-600">{error}</span>}
      </div>
    </div>
  );
}
