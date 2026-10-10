'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import { BookOpen, ClipboardCheck, FileSearch, FileText, Layers3, Loader2, MonitorPlay, Search, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavCollege } from '@/lib/data/navigator';

type Kind = 'cours' | 'college' | 'fiche' | 'video' | 'qcm' | 'flashcards';

/** « Nom d'item » : titres (filtrés localement) ; « Mots-clés » : texte des fiches (serveur). */
type Mode = 'titre' | 'mots';

type Flat = {
  id: string;
  href: string;
  label: string;
  hint: string;
  kind: Kind;
};

type ResultatFiche = {
  ficheId: string;
  coursId: string;
  coursTitre: string;
  college: string;
  extrait: string;
};

const CONTENT_TYPES = [
  { kind: 'fiche' as const, label: 'Fiche', flag: 'hasFiche' as const, seg: 'fiche' },
  { kind: 'video' as const, label: 'Vidéo', flag: 'hasVideo' as const, seg: 'video' },
  { kind: 'qcm' as const, label: 'DP · QI', flag: 'hasQcm' as const, seg: 'qcm' },
  { kind: 'flashcards' as const, label: 'Flashcards', flag: 'hasFlashcards' as const, seg: 'flashcards' },
] as const;

const ICON: Record<Kind, typeof BookOpen> = {
  college: BookOpen,
  cours: Layers3,
  fiche: FileText,
  video: MonitorPlay,
  qcm: ClipboardCheck,
  flashcards: Zap,
};

const GROUP_LABEL: Record<Kind, string> = {
  cours: 'Items',
  college: 'Collèges',
  fiche: 'Fiches de cours',
  video: 'Vidéos',
  qcm: 'DP · QI',
  flashcards: 'Flashcards',
};

const FILTER_OPTIONS: { kind: Kind | 'all'; label: string }[] = [
  { kind: 'all', label: 'Tous' },
  { kind: 'fiche', label: 'Fiches' },
  { kind: 'video', label: 'Vidéos' },
  { kind: 'qcm', label: 'DP · QI' },
  { kind: 'flashcards', label: 'Flashcards' },
];

/** Minuscules sans accents — même pliage que l'index SQL (`recherche_plier`). */
function plier(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Met en gras, dans l'extrait, les mots de la recherche (préfixes, sans accents). */
function Surligne({ texte, q }: { texte: string; q: string }) {
  const mots = plier(q).split(/[^a-z0-9]+/).filter((m) => m.length >= 2);
  if (mots.length === 0) return <>{texte}</>;
  // `plier` conserve la longueur pour les lettres françaises usuelles : les
  // positions trouvées dans le texte plié valent dans le texte d'origine.
  const plie = plier(texte);
  if (plie.length !== texte.length) return <>{texte}</>;
  const re = new RegExp(mots.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'g');
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of plie.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) parts.push(texte.slice(last, i));
    parts.push(<mark key={i} className="rounded bg-amber-100 px-0.5 text-inherit">{texte.slice(i, i + m[0].length)}</mark>);
    last = i + m[0].length;
  }
  parts.push(texte.slice(last));
  return <>{parts}</>;
}

export function CommandPalette({
  tree,
  open,
  onOpenChange,
}: {
  tree: NavCollege[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Kind | 'all'>('all');
  const [mode, setMode] = useState<Mode>('titre');
  const [query, setQuery] = useState('');
  // Dernière réponse du serveur, ÉTIQUETÉE par la requête qui l'a produite :
  // « en cours » se déduit de l'écart avec la saisie (pas d'état à synchroniser).
  const [reponse, setReponse] = useState<{ q: string; resultats: ResultatFiche[]; erreur: string | null } | null>(null);

  const items = useMemo<Flat[]>(() => {
    const out: Flat[] = [];
    // Sous-collèges compris (spécialités de Médecine générale…) : seuls les
    // items DIRECTS des collèges étaient proposés jusqu'ici.
    const ajouter = (cols: NavCollege[]) => {
      for (const col of cols) {
        out.push({ id: col.id, href: `/matieres/${col.id}`, label: col.nom, hint: 'Collège', kind: 'college' });
        for (const c of col.cours) {
          out.push({ id: c.id, href: `/cours/${c.id}`, label: c.titre, hint: col.nom, kind: 'cours' });
          for (const ct of CONTENT_TYPES) {
            if (c[ct.flag]) {
              out.push({
                id: `${c.id}-${ct.kind}`,
                href: `/cours/${c.id}/${ct.seg}`,
                label: `${ct.label} · ${c.titre}`,
                hint: col.nom,
                kind: ct.kind,
              });
            }
          }
        }
        if (col.children) ajouter(col.children);
      }
    };
    ajouter(tree);
    // Un item partagé entre deux collèges n'apparaît qu'une fois par type.
    const vus = new Set<string>();
    return out.filter((i) => {
      const k = `${i.kind}-${i.id}`;
      if (vus.has(k)) return false;
      vus.add(k);
      return true;
    });
  }, [tree]);

  const filteredItems = useMemo(() => {
    if (filter === 'all') return items;
    return items.filter((i) => i.kind === filter);
  }, [items, filter]);

  const qMots = query.trim();
  const assezLong = qMots.replace(/[^\p{L}\p{N}]/gu, '').length >= 3;
  const aJour = reponse !== null && reponse.q === qMots;
  const chargement = mode === 'mots' && assezLong && !aJour;
  const resultats = aJour ? reponse.resultats : [];
  const erreur = aJour ? reponse.erreur : null;

  // Recherche dans le texte des fiches : différée (300 ms) et annulable.
  useEffect(() => {
    if (!open || mode !== 'mots' || !assezLong) return;
    const ctrl = new AbortController();
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/recherche/fiches?q=${encodeURIComponent(qMots)}`, { signal: ctrl.signal, cache: 'no-store' });
        const j = (await res.json().catch(() => ({}))) as { resultats?: ResultatFiche[]; error?: string };
        if (!res.ok) throw new Error(j.error ?? 'Recherche indisponible');
        setReponse({ q: qMots, resultats: j.resultats ?? [], erreur: null });
      } catch (e) {
        if ((e as Error).name === 'AbortError') return;
        setReponse({ q: qMots, resultats: [], erreur: (e as Error).message || 'Recherche indisponible' });
      }
    }, 300);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [open, mode, qMots, assezLong]);

  const fermer = () => {
    onOpenChange(false);
    setFilter('all');
    setQuery('');
    setReponse(null);
  };

  const go = (href: string) => {
    fermer();
    router.push(href);
  };

  if (!open) return null;

  const ORDER: Kind[] = filter === 'all'
    ? ['cours', 'fiche', 'video', 'qcm', 'flashcards', 'college']
    : [filter];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/40 p-4 pt-[12vh]"
      onClick={fermer}
    >
      <Command
        label="Recherche globale"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-(--shadow-lifted)"
        onClick={(e) => e.stopPropagation()}
        // En mode « mots-clés », le serveur a déjà trié par pertinence : cmdk
        // ne doit ni filtrer ni réordonner.
        shouldFilter={mode === 'titre'}
        loop
      >
        <div className="flex items-center gap-2 border-b border-(--color-border) px-4">
          <Search className="h-4 w-4 text-(--color-ink-muted)" />
          <Command.Input
            autoFocus
            value={query}
            onValueChange={setQuery}
            placeholder={mode === 'titre' ? 'Rechercher un item, une fiche, une vidéo…' : 'Mots-clés contenus dans les fiches (ex. « Kawasaki »)…'}
            className="h-12 w-full bg-transparent text-sm text-(--color-ink) outline-none placeholder:text-(--color-ink-muted)"
          />
          {mode === 'mots' && chargement && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-(--color-ink-muted)" />}
          <kbd className="hidden rounded border border-(--color-border) px-1.5 py-0.5 text-[10px] text-(--color-ink-muted) sm:block">
            Esc
          </kbd>
        </div>

        {/* Mode de recherche */}
        <div className="flex items-center gap-2 border-b border-(--color-border) px-4 py-2">
          <div role="tablist" aria-label="Type de recherche" className="flex rounded-lg bg-(--color-sand-100) p-0.5">
            {([
              { key: 'titre' as const, label: 'Nom d’item', Icon: Layers3 },
              { key: 'mots' as const, label: 'Mots-clés', Icon: FileSearch },
            ]).map(({ key, label, Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={mode === key}
                onClick={() => setMode(key)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors',
                  mode === key ? 'bg-(--color-surface) text-(--color-ink) shadow-sm' : 'text-(--color-ink-soft) hover:text-(--color-ink)',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
          {mode === 'mots' && (
            <span className="truncate text-[11px] text-(--color-ink-muted)">Dans le texte des fiches de cours</span>
          )}
        </div>

        {/* Filter chips */}
        {mode === 'titre' && (
          <div className="flex gap-1.5 overflow-x-auto border-b border-(--color-border) px-4 py-2">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.kind}
                type="button"
                onClick={() => setFilter(f.kind)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition-colors',
                  filter === f.kind
                    ? 'bg-(--color-primary) text-white'
                    : 'bg-(--color-sand-100) text-(--color-ink-soft) hover:bg-(--color-sand-200)',
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        <Command.List className="max-h-[50vh] overflow-y-auto p-2">
          {mode === 'titre' ? (
            <>
              <Command.Empty className="px-3 py-8 text-center text-sm text-(--color-ink-muted)">
                Aucun résultat.
              </Command.Empty>
              {ORDER.map((kind) => {
                const group = filteredItems.filter((i) => i.kind === kind);
                if (group.length === 0) return null;
                const Icon = ICON[kind];
                return (
                  <Command.Group
                    key={kind}
                    heading={GROUP_LABEL[kind]}
                    className="px-1 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-ink-muted) [&_[cmdk-group-items]]:mt-1"
                  >
                    {group.map((i) => (
                      <Command.Item
                        key={`${kind}-${i.id}`}
                        value={`${i.label} ${i.hint}`}
                        onSelect={() => go(i.href)}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-(--color-ink) data-[selected=true]:bg-(--color-primary) data-[selected=true]:text-white"
                      >
                        <Icon className="h-4 w-4 shrink-0 opacity-70" />
                        <span className="flex-1 truncate font-normal normal-case tracking-normal">{i.label}</span>
                        <span className="truncate text-xs opacity-60 normal-case tracking-normal">{i.hint}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                );
              })}
            </>
          ) : (
            <>
              {!assezLong ? (
                <p className="px-3 py-8 text-center text-sm text-(--color-ink-muted)">
                  Tapez au moins 3 caractères : les fiches de cours qui contiennent ces mots s’affichent ici.
                </p>
              ) : erreur ? (
                <p className="px-3 py-8 text-center text-sm text-(--color-danger)">{erreur}</p>
              ) : !chargement && resultats.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-(--color-ink-muted)">Aucune fiche ne contient ces mots.</p>
              ) : (
                <Command.Group
                  heading={chargement && resultats.length === 0 ? 'Recherche…' : `Fiches de cours · ${resultats.length}`}
                  className="px-1 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-(--color-ink-muted) [&_[cmdk-group-items]]:mt-1"
                >
                  {resultats.map((r) => (
                    <Command.Item
                      key={`${r.coursId}-${r.ficheId}`}
                      value={`${r.coursId}-${r.ficheId}`}
                      onSelect={() => go(`/cours/${r.coursId}/fiche?doc=${r.ficheId}`)}
                      className="group flex cursor-pointer items-start gap-3 rounded-lg px-3 py-2 text-sm text-(--color-ink) data-[selected=true]:bg-(--color-primary-soft)"
                    >
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
                      <span className="min-w-0 flex-1 normal-case tracking-normal">
                        <span className="flex items-baseline gap-2">
                          <span className="truncate font-semibold">{r.coursTitre}</span>
                          <span className="truncate text-xs text-(--color-ink-muted)">{r.college}</span>
                        </span>
                        <span className="mt-0.5 line-clamp-2 text-xs font-normal text-(--color-ink-soft)">
                          <Surligne texte={r.extrait} q={qMots} />
                        </span>
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </>
          )}
        </Command.List>
      </Command>
    </div>
  );
}
