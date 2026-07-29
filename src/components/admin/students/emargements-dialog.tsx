'use client';

/**
 * Consultation des feuilles d'émargement d'un élève depuis la liste élèves.
 *
 * Deux origines dans une seule vue : les vidéos visionnées sur la plateforme
 * (vidéo du cours ou séance approfondie, avec signature manuscrite) et les
 * sessions Zoom en direct. Un filtre permet de n'afficher que l'une ou l'autre.
 *
 * Les émargements dus mais non signés sont mis en évidence : c'est ce qui
 * manquerait à un dossier de formation.
 */
import { useCallback, useMemo, useState } from 'react';
import { Download, FileSignature, Loader2, MonitorPlay, TriangleAlert, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Source = 'plateforme' | 'zoom';

type Row = {
  id: string;
  source: Source;
  typeLabel: string;
  college: string | null;
  titre: string;
  date: string | null;
  requiredAt: string | null;
  signed: boolean;
  signaturePng: string | null;
  watchedRatio: number | null;
  intervenant: string | null;
};

type Payload = {
  counts: { total: number; plateforme: number; zoom: number; pending: number };
  rows: Row[];
};

type Filter = 'tous' | Source;

function fmt(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

export function EmargementsDialog({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('tous');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/emargements/${studentId}`);
      const json = (await res.json()) as Payload & { error?: string };
      if (!res.ok) throw new Error(json.error ?? 'Chargement impossible');
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chargement impossible');
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  const rows = useMemo(
    () => (data?.rows ?? []).filter((r) => filter === 'tous' || r.source === filter),
    [data, filter],
  );

  const filters: { key: Filter; label: string; n?: number }[] = [
    { key: 'tous', label: 'Tous', n: data?.counts.total },
    { key: 'plateforme', label: 'Vidéos plateforme', n: data?.counts.plateforme },
    { key: 'zoom', label: 'Zoom', n: data?.counts.zoom },
  ];

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1 px-2 text-xs font-bold"
        title="Voir les feuilles d'émargement de cet élève"
        onClick={() => { setOpen(true); if (!data && !loading) void load(); }}
      >
        <FileSignature className="h-3.5 w-3.5" />
        <span className="hidden lg:inline">Émargements</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Feuilles d’émargement — {studentName}</DialogTitle>
            <DialogDescription>
              {data
                ? `${data.counts.total} émargement${data.counts.total > 1 ? 's' : ''} · ${data.counts.plateforme} plateforme · ${data.counts.zoom} Zoom${data.counts.pending > 0 ? ` · ${data.counts.pending} non signé${data.counts.pending > 1 ? 's' : ''}` : ''}`
                : 'Chargement…'}
            </DialogDescription>
          </DialogHeader>

          {data && data.counts.total > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`rounded-lg border px-2.5 py-1.5 text-[12px] font-bold transition-colors ${
                    filter === f.key
                      ? 'border-(--color-primary) bg-(--color-primary)/10 text-(--color-primary)'
                      : 'border-(--color-border) text-(--color-ink-soft) hover:text-(--color-ink)'
                  }`}
                >
                  {f.label}{typeof f.n === 'number' ? ` (${f.n})` : ''}
                </button>
              ))}
            </div>
          )}

          {loading && (
            <p className="flex items-center gap-2 py-6 text-sm text-(--color-ink-soft)">
              <Loader2 className="h-4 w-4 animate-spin" /> Chargement…
            </p>
          )}
          {error && <p className="py-4 text-sm font-semibold text-(--color-danger)">{error}</p>}

          {data && data.counts.total === 0 && (
            <p className="py-6 text-sm text-(--color-ink-soft)">
              Aucun émargement : cet élève n’a commencé aucune vidéo et n’a rejoint aucune session Zoom.
            </p>
          )}

          {data && data.counts.total > 0 && rows.length === 0 && (
            <p className="py-6 text-sm text-(--color-ink-soft)">
              Aucun émargement pour ce filtre.
            </p>
          )}

          {rows.length > 0 && (
            <>
              <div className="space-y-2.5">
                {rows.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border p-3"
                    style={{ borderColor: r.signed ? 'var(--color-border)' : '#F5C86B' }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span
                            className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold"
                            style={
                              r.source === 'zoom'
                                ? { background: '#E7F0FF', color: '#1E40AF' }
                                : { background: '#F3EAFF', color: '#7C3AED' }
                            }
                          >
                            {r.source === 'zoom'
                              ? <Video className="h-3 w-3" />
                              : <MonitorPlay className="h-3 w-3" />}
                            {r.typeLabel}
                          </span>
                          {r.college && (
                            <span
                              className="rounded-md px-1.5 py-0.5 text-[11px] font-semibold"
                              style={{ background: '#F1F4F9', color: '#0F1F4D' }}
                            >
                              {r.college}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 truncate text-[13.5px] font-bold text-(--color-ink)">
                          {r.titre}
                        </p>

                        {r.source === 'plateforme' ? (
                          <>
                            <p className="mt-0.5 text-[12px] text-(--color-ink-soft)">
                              Vu le {fmt(r.requiredAt)}
                              {r.watchedRatio != null && ` · ${Math.round(r.watchedRatio * 100)} % de la vidéo`}
                            </p>
                            <p className="text-[12px] text-(--color-ink-soft)">
                              {r.signed
                                ? <>Signé le <strong>{fmt(r.date)}</strong></>
                                : (
                                  <span className="inline-flex items-center gap-1 font-bold" style={{ color: '#B26A00' }}>
                                    <TriangleAlert className="h-3.5 w-3.5" /> Non signé
                                  </span>
                                )}
                            </p>
                          </>
                        ) : (
                          <p className="mt-0.5 text-[12px] text-(--color-ink-soft)">
                            Émargé le <strong>{fmt(r.date)}</strong>
                            {r.intervenant && ` · ${r.intervenant}`}
                          </p>
                        )}
                      </div>

                      {r.signaturePng && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.signaturePng}
                          alt={`Signature — ${r.titre}`}
                          className="h-16 w-32 shrink-0 rounded-lg border bg-white object-contain"
                          style={{ borderColor: 'var(--color-border)' }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={`/api/admin/emargements/${studentId}?format=csv${filter === 'tous' ? '' : `&source=${filter}`}`}
                className="mt-2 inline-flex items-center gap-1.5 self-start rounded-lg border border-(--color-border) px-3 py-2 text-xs font-bold text-(--color-ink-soft) hover:text-(--color-ink)"
              >
                <Download className="h-3.5 w-3.5" />
                Exporter en CSV{filter === 'tous' ? '' : ` (${filter === 'zoom' ? 'Zoom' : 'plateforme'})`}
              </a>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
