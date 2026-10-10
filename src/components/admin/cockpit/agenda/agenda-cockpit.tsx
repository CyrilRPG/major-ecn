'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CalendarPlus, Check, ChevronLeft, ChevronRight, ExternalLink, ListPlus, MapPin, Paperclip, Pencil, Phone, Trash2, User, Video } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ElementAgenda, RdvLigne } from '@/lib/cockpit/server/donnees';
import { deplacerTache } from '@/app/admin/cockpit/actions-taches';
import { basculerObjectif, enregistrerObjectif, supprimerRdv, tacheSuiviRdv } from '@/app/admin/cockpit/actions-divers';
import { ajouterJoursIso, GENRE_RDV_LABEL, lundiDe, premierDuMois } from '@/lib/cockpit/regles';
import { cn } from '@/lib/utils';
import { useActionsCockpit } from '../actions-globales';
import { FormulaireRdv } from '../formulaires';
import { COULEUR_GENRE, LIBELLE_GENRE } from '../accueil/bloc-agenda';
import { Bouton, Carte, EntetePage, Toast, useEtatSuivi, useMessage } from '../ui';

type Vue = 'jour' | 'semaine' | 'mois';
type Objectif = { periode: 'semaine' | 'mois'; debut: string; texte: string; atteint: boolean };

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function titreJour(iso: string, opts: Intl.DateTimeFormatOptions) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('fr-FR', { ...opts, timeZone: 'UTC' });
}

export function AgendaCockpit({
  elements, rdvs, aujourdHui, jourInitial, vueInitiale, rdvOuvert, objectifs,
}: {
  elements: ElementAgenda[];
  rdvs: RdvLigne[];
  aujourdHui: string;
  jourInitial: string;
  vueInitiale: Vue;
  rdvOuvert: string | null;
  objectifs: Objectif[];
}) {
  const router = useRouter();
  const { ouvrir } = useActionsCockpit();
  const [vue, setVue] = React.useState<Vue>(vueInitiale);
  const [jour, setJour] = useEtatSuivi(jourInitial);
  const [rdvId, setRdvId] = React.useState<string | null>(rdvOuvert);
  const [edition, setEdition] = React.useState(false);
  const [message, setMessage] = useMessage();
  const [survol, setSurvol] = React.useState<string | null>(null);
  const [deplacements, setDeplacements] = React.useState<Record<string, string>>({});
  const [, start] = React.useTransition();

  const charge = { min: lundiDe(premierDuMois(jourInitial)), max: ajouterJoursIso(lundiDe(premierDuMois(jourInitial)), 41) };
  const aller = (j: string) => {
    if (j < charge.min || j > charge.max) router.push(`/admin/cockpit/agenda?jour=${j}&vue=${vue}`);
    else setJour(j);
  };
  const pas = (sens: -1 | 1) => {
    if (vue === 'jour') return aller(ajouterJoursIso(jour, sens));
    if (vue === 'semaine') return aller(ajouterJoursIso(jour, 7 * sens));
    const [y, m] = jour.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1 + sens, 1));
    aller(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-01`);
  };

  const els = elements.map((e) => (e.tacheId && deplacements[e.tacheId] ? { ...e, date: deplacements[e.tacheId] } : e));
  const parJour = React.useMemo(() => {
    const m = new Map<string, ElementAgenda[]>();
    for (const e of els) m.set(e.date, [...(m.get(e.date) ?? []), e]);
    return m;
  }, [els]);

  const deposer = (j: string, e: React.DragEvent) => {
    e.preventDefault();
    setSurvol(null);
    const id = e.dataTransfer.getData('text/cockpit-tache');
    if (!id) return;
    setDeplacements((d) => ({ ...d, [id]: j }));
    start(async () => {
      const r = await deplacerTache(id, j);
      if (!r.ok) {
        setDeplacements((d) => { const c = { ...d }; delete c[id]; return c; });
        setMessage(r.erreur);
      } else setMessage(`Tâche déplacée au ${titreJour(j, { weekday: 'long', day: 'numeric', month: 'long' })}.`);
      router.refresh();
    });
  };
  const cible = (j: string) => ({
    onDragOver: (e: React.DragEvent) => { if (e.dataTransfer.types.includes('text/cockpit-tache')) { e.preventDefault(); setSurvol(j); } },
    onDragLeave: () => setSurvol((s) => (s === j ? null : s)),
    onDrop: (e: React.DragEvent) => deposer(j, e),
  });

  const rdv = rdvId ? rdvs.find((r) => r.id === rdvId) ?? null : null;
  const lundi = lundiDe(jour);
  const titre = vue === 'jour'
    ? titreJour(jour, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : vue === 'semaine'
      ? `Semaine du ${titreJour(lundi, { day: 'numeric', month: 'long' })} au ${titreJour(ajouterJoursIso(lundi, 6), { day: 'numeric', month: 'long', year: 'numeric' })}`
      : titreJour(jour, { month: 'long', year: 'numeric' });

  const ouvrirElement = (e: ElementAgenda) => {
    if (e.source === 'rdv') { setRdvId(e.id.slice(4)); setEdition(false); return; }
    if (e.href) router.push(e.href);
  };

  return (
    <div className="mx-auto max-w-[1500px]">
      <EntetePage
        titre="Mon agenda"
        sousTitre="Rendez-vous, échéances, cours et entretiens. Faites glisser une tâche d’un jour à l’autre pour la déplacer."
        actions={
          <>
            <Bouton variante="contour" onClick={() => ouvrir('tache', { echeance: vue === 'jour' ? jour : undefined })}><ListPlus /> Tâche / échéance</Bouton>
            <Bouton onClick={() => ouvrir('rdv', vue === 'jour' && jour !== aujourdHui ? { debut: new Date(`${jour}T09:00:00`).toISOString() } : undefined)}><CalendarPlus /> Rendez-vous</Bouton>
          </>
        }
      />

      <Objectifs objectifs={objectifs} lundi={lundi} mois={premierDuMois(jour)} onMessage={setMessage} />

      <Carte className="mt-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-(--color-border) px-3 py-3 sm:px-4">
          <div className="flex items-center gap-1">
            <button type="button" aria-label="Précédent" onClick={() => pas(-1)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-(--color-surface-soft)"><ChevronLeft className="h-5 w-5" /></button>
            <button type="button" onClick={() => aller(aujourdHui)} className="h-9 rounded-lg border border-(--color-border) px-3 text-[13px] font-medium text-(--color-primary) hover:bg-(--color-primary-soft)">Aujourd’hui</button>
            <button type="button" aria-label="Suivant" onClick={() => pas(1)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-(--color-surface-soft)"><ChevronRight className="h-5 w-5" /></button>
          </div>
          <h2 className="text-[19px] font-semibold first-letter:uppercase text-(--color-ink)">{titre}</h2>
          <div className="ml-auto grid grid-cols-3 gap-1 rounded-xl bg-(--color-surface-soft) p-1">
            {(['jour', 'semaine', 'mois'] as const).map((v) => (
              <button key={v} type="button" onClick={() => setVue(v)} className={cn('rounded-lg px-3 py-1.5 text-[13px] font-medium', vue === v ? 'bg-(--color-primary) text-white' : 'text-(--color-ink-soft) hover:bg-white')}>
                {v === 'jour' ? 'Aujourd’hui' : v === 'semaine' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-4 py-2 text-[12px] text-(--color-ink-soft)">
          {(Object.keys(COULEUR_GENRE) as (keyof typeof COULEUR_GENRE)[]).map((g) => (
            <span key={g} className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COULEUR_GENRE[g] }} />{LIBELLE_GENRE[g]}</span>
          ))}
        </div>

        {vue === 'jour' && (
          <div className="px-4 pb-4" {...cible(jour)}>
            <ListeJour elements={parJour.get(jour) ?? []} onOuvrir={ouvrirElement} survol={survol === jour} />
          </div>
        )}

        {vue === 'semaine' && (
          <div className="grid grid-cols-1 gap-px bg-(--color-border) md:grid-cols-7">
            {Array.from({ length: 7 }, (_, i) => ajouterJoursIso(lundi, i)).map((j, i) => (
              <div key={j} {...cible(j)} className={cn('min-h-[180px] bg-(--color-surface) p-2 md:min-h-[420px]', survol === j && 'bg-(--color-primary-soft) ring-2 ring-inset ring-(--color-primary)/40')}>
                <button type="button" onClick={() => { setJour(j); setVue('jour'); }} className="mb-2 flex w-full items-baseline gap-1.5 text-left">
                  <span className="text-[12px] font-medium uppercase text-(--color-ink-soft)">{JOURS[i].slice(0, 3)}</span>
                  <span className={cn('grid h-7 w-7 place-items-center rounded-full text-[14px] font-semibold', j === aujourdHui ? 'bg-(--color-primary) text-white' : 'text-(--color-ink)')}>{Number(j.slice(8))}</span>
                </button>
                <ul className="space-y-1.5">
                  {(parJour.get(j) ?? []).map((e) => <Pastille key={e.id} e={e} onOuvrir={ouvrirElement} />)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {vue === 'mois' && (
          <div className="overflow-x-auto">
            <div className="grid min-w-[700px] grid-cols-7 gap-px bg-(--color-border)">
              {JOURS.map((j) => <div key={j} className="bg-(--color-surface-soft) py-1.5 text-center text-[12px] font-medium text-(--color-ink-soft)">{j.slice(0, 3)}</div>)}
              {Array.from({ length: 42 }, (_, i) => ajouterJoursIso(lundiDe(premierDuMois(jour)), i)).map((j) => {
                const es = parJour.get(j) ?? [];
                const hors = j.slice(0, 7) !== jour.slice(0, 7);
                return (
                  <div key={j} {...cible(j)} className={cn('min-h-[104px] bg-(--color-surface) p-1.5', hors && 'bg-(--color-surface-soft) opacity-60', survol === j && 'bg-(--color-primary-soft) ring-2 ring-inset ring-(--color-primary)/40')}>
                    <button type="button" onClick={() => { setJour(j); setVue('jour'); }} className={cn('mb-1 grid h-6 w-6 place-items-center rounded-full text-[12px]', j === aujourdHui ? 'bg-(--color-primary) font-semibold text-white' : 'text-(--color-ink) hover:bg-(--color-surface-soft)')}>
                      {Number(j.slice(8))}
                    </button>
                    <ul className="space-y-1">
                      {es.slice(0, 3).map((e) => <Pastille key={e.id} e={e} onOuvrir={ouvrirElement} compacte />)}
                      {es.length > 3 && <li><button type="button" onClick={() => { setJour(j); setVue('jour'); }} className="text-[11px] font-medium text-(--color-primary)">+ {es.length - 3} autre(s)</button></li>}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Carte>

      <Dialog open={!!rdv} onOpenChange={(o) => { if (!o) { setRdvId(null); setEdition(false); } }}>
        <DialogContent className="max-h-[92dvh] max-w-2xl overflow-y-auto">
          {rdv && (edition ? (
            <>
              <DialogHeader><DialogTitle>Modifier le rendez-vous</DialogTitle></DialogHeader>
              <FormulaireRdv id={rdv.id} initial={{ ...rdv, genre: rdv.genre as never, personne_type: (rdv.personne_type ?? '') as never }} onFini={() => { setEdition(false); setMessage('Rendez-vous enregistré.'); router.refresh(); }} />
            </>
          ) : (
            <FicheRdv
              rdv={rdv}
              onModifier={() => setEdition(true)}
              onSupprimer={() => start(async () => { await supprimerRdv(rdv.id); setRdvId(null); setMessage('Rendez-vous supprimé.'); router.refresh(); })}
              onSuivi={() => start(async () => {
                const r = await tacheSuiviRdv(rdv.id);
                if (!r.ok) return setMessage(r.erreur);
                router.push(`/admin/cockpit/taches?t=${r.data!.tacheId}`);
              })}
            />
          ))}
        </DialogContent>
      </Dialog>
      <Toast message={message} />
    </div>
  );
}

function Pastille({ e, onOuvrir, compacte }: { e: ElementAgenda; onOuvrir: (e: ElementAgenda) => void; compacte?: boolean }) {
  const deplacable = !!e.tacheId && !e.terminee;
  return (
    <li>
      <button
        type="button"
        draggable={deplacable}
        onDragStart={(ev) => { if (e.tacheId) { ev.dataTransfer.setData('text/cockpit-tache', e.tacheId); ev.dataTransfer.effectAllowed = 'move'; } }}
        onClick={() => onOuvrir(e)}
        title={deplacable ? 'Glisser pour déplacer cette tâche' : e.titre}
        className={cn('block w-full rounded-md border-l-[3px] bg-(--color-surface-soft) px-1.5 py-1 text-left hover:bg-(--color-surface-soft)', deplacable && 'cursor-grab active:cursor-grabbing')}
        style={{ borderLeftColor: COULEUR_GENRE[e.genre] }}
      >
        <span className={cn('block truncate font-medium text-(--color-ink)', compacte ? 'text-[11px]' : 'text-[12.5px]', e.terminee && 'text-(--color-ink-muted) line-through')}>
          {e.debut && <span className="mr-1 tabular-nums text-(--color-ink-soft)">{e.debut}</span>}
          {e.titre}
        </span>
        {!compacte && e.sousTitre && <span className="block truncate text-[11px] text-(--color-ink-soft)">{e.sousTitre}</span>}
      </button>
    </li>
  );
}

function ListeJour({ elements, onOuvrir, survol }: { elements: ElementAgenda[]; onOuvrir: (e: ElementAgenda) => void; survol: boolean }) {
  if (elements.length === 0) {
    return <p className={cn('rounded-xl border border-dashed border-(--color-border) py-10 text-center text-sm text-(--color-ink-muted)', survol && 'bg-(--color-primary-soft)')}>Rien de prévu ce jour-là.</p>;
  }
  return (
    <ul className={cn('divide-y divide-(--color-border) rounded-xl', survol && 'bg-(--color-primary-soft)')}>
      {elements.map((e) => (
        <li key={e.id} className="flex items-center gap-3 py-2.5">
          <span className="w-[104px] shrink-0 text-[13px] tabular-nums text-(--color-ink-soft)">{e.debut ? `${e.debut}${e.fin ? ` – ${e.fin}` : ''}` : 'Journée'}</span>
          <span className="h-3 w-3 shrink-0 rounded-full border-[2.5px]" style={{ borderColor: COULEUR_GENRE[e.genre] }} />
          <button type="button" onClick={() => onOuvrir(e)} className="min-w-0 flex-1 text-left">
            <span className={cn('block truncate text-[14px] font-semibold text-(--color-ink)', e.terminee && 'text-(--color-ink-muted) line-through')}>{e.titre}</span>
            {e.sousTitre && <span className="block truncate text-[12.5px] text-(--color-ink-soft)">{e.sousTitre}</span>}
          </button>
          {e.lienVisio && <a href={e.lienVisio} target="_blank" rel="noopener" className="inline-flex items-center gap-1 rounded-md bg-[#EEF4FD] px-2 py-1 text-[12px] font-medium text-[#2F5DA8]"><Video className="h-3.5 w-3.5" /> Rejoindre</a>}
        </li>
      ))}
    </ul>
  );
}

function FicheRdv({ rdv, onModifier, onSupprimer, onSuivi }: { rdv: RdvLigne; onModifier: () => void; onSupprimer: () => void; onSuivi: () => void }) {
  const debut = new Date(rdv.debut);
  const quand = `${debut.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${debut.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}${rdv.fin ? ` – ${new Date(rdv.fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : ''}`;
  return (
    <>
      <DialogHeader>
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-(--color-primary)">{GENRE_RDV_LABEL[rdv.genre] ?? rdv.genre}</p>
        <DialogTitle className="text-xl">{rdv.titre}</DialogTitle>
        <DialogDescription className="first-letter:uppercase">{quand}</DialogDescription>
      </DialogHeader>
      <dl className="space-y-2 text-[13.5px] text-(--color-ink)">
        {rdv.personne_label && (
          <div className="flex gap-2"><User className="h-4 w-4 shrink-0 text-(--color-primary)" />
            {rdv.personne_type === 'eleve' && rdv.personne_id
              ? <Link className="text-(--color-primary) underline" href={`/admin/suivi/candidats/${rdv.personne_id}`}>{rdv.personne_label}</Link>
              : rdv.personne_label}
          </div>
        )}
        {rdv.objet && <p className="whitespace-pre-wrap">{rdv.objet}</p>}
        {rdv.lien_visio && <div className="flex gap-2"><Video className="h-4 w-4 shrink-0 text-(--color-primary)" /><a href={rdv.lien_visio} target="_blank" rel="noopener" className="break-all text-[#2F5DA8] underline">{rdv.lien_visio}</a></div>}
        {rdv.coordonnees && <div className="flex gap-2"><Phone className="h-4 w-4 shrink-0 text-(--color-primary)" />{rdv.coordonnees}</div>}
        {rdv.lieu && <div className="flex gap-2"><MapPin className="h-4 w-4 shrink-0 text-(--color-primary)" />{rdv.lieu}</div>}
        {rdv.documents.length > 0 && (
          <div className="flex gap-2"><Paperclip className="h-4 w-4 shrink-0 text-(--color-primary)" />
            <ul>{rdv.documents.map((d, i) => <li key={i}><a href={d.url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-(--color-primary) underline">{d.label}<ExternalLink className="h-3 w-3" /></a></li>)}</ul>
          </div>
        )}
        {rdv.notes && <div className="rounded-lg bg-(--color-surface-soft) p-3 whitespace-pre-wrap">{rdv.notes}</div>}
      </dl>
      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <Bouton variante="fantome" onClick={onSupprimer}><Trash2 /> Supprimer</Bouton>
        <Bouton variante="contour" onClick={onModifier}><Pencil /> Modifier</Bouton>
        <Bouton onClick={onSuivi}><ListPlus /> {rdv.tache_suivi_id ? 'Voir la tâche de suivi' : 'Créer une tâche de suivi'}</Bouton>
      </div>
    </>
  );
}

function Objectifs({ objectifs, lundi, mois, onMessage }: { objectifs: Objectif[]; lundi: string; mois: string; onMessage: (m: string) => void }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <ObjectifPeriode periode="semaine" debut={lundi} libelle="Objectif de la semaine" objectif={objectifs.find((o) => o.periode === 'semaine' && o.debut === lundi)} onMessage={onMessage} />
      <ObjectifPeriode periode="mois" debut={mois} libelle="Objectif du mois" objectif={objectifs.find((o) => o.periode === 'mois' && o.debut === mois)} onMessage={onMessage} />
    </div>
  );
}

function ObjectifPeriode({ periode, debut, libelle, objectif, onMessage }: { periode: 'semaine' | 'mois'; debut: string; libelle: string; objectif?: Objectif; onMessage: (m: string) => void }) {
  const router = useRouter();
  const [texte, setTexte] = useEtatSuivi(objectif?.texte ?? '', `${objectif?.texte ?? ''}|${debut}`);
  const [edition, setEdition] = React.useState(false);
  const [, start] = React.useTransition();
  return (
    <Carte className="flex items-center gap-3 px-4 py-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-(--color-primary)">{libelle}</span>
      {edition ? (
        <form className="flex flex-1 gap-2" onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await enregistrerObjectif(periode, debut, texte); onMessage(r.ok ? 'Objectif enregistré.' : r.erreur); setEdition(false); router.refresh(); }); }}>
          <input autoFocus className="min-w-0 flex-1 rounded-md border border-(--color-border) px-2 py-1 text-sm" value={texte} onChange={(e) => setTexte(e.target.value)} maxLength={500} />
          <Bouton taille="sm" type="submit">OK</Bouton>
        </form>
      ) : (
        <>
          <button type="button" className={cn('min-w-0 flex-1 truncate text-left text-sm', objectif ? 'text-(--color-ink)' : 'text-(--color-ink-muted)', objectif?.atteint && 'line-through')} onClick={() => setEdition(true)}>
            {objectif?.texte ?? 'Définir un objectif…'}
          </button>
          {objectif && (
            <button type="button" title={objectif.atteint ? 'Rouvrir' : 'Marquer comme atteint'} onClick={() => start(async () => { await basculerObjectif(periode, debut); router.refresh(); })}
              className={cn('grid h-7 w-7 place-items-center rounded-full border', objectif.atteint ? 'border-[#1F7A3E] bg-[#E6F4EA] text-[#1F7A3E]' : 'border-(--color-border) text-(--color-ink-muted)')}>
              <Check className="h-4 w-4" />
            </button>
          )}
        </>
      )}
    </Carte>
  );
}
