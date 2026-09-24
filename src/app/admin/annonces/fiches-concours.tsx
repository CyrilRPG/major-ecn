'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarCheck, Check, ChevronRight, Copy, Loader2, Plus, Save, Search, Trash2, X } from 'lucide-react';
import {
  datesAVenir, etatInscription, isoVersSaisieParis, joursAvant, normaliserFiche, saisieParisVersIso,
  type FicheConcours,
} from '@/lib/annonces/concours';
import { enregistrerFiche, retirerFiche, type ChampFiche } from './actions';

export type Specialite = { id: string; nom: string };
export type LigneFiche = { id: string; nom: string; fiche: FicheConcours; heritee: boolean };

export const inputCls =
  'w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-primary)';
const labelCls = 'mb-1 block text-[11px] font-bold uppercase tracking-wider text-(--color-ink-muted)';

const SUGGESTIONS_DATES = ['Résultats d’admissibilité', 'Épreuve orale', 'Résultats définitifs', 'Choix de poste', 'Prise de fonctions'];

const CHAMPS: { key: ChampFiche; label: string }[] = [
  { key: 'date_epreuve', label: 'Date de l’épreuve' },
  { key: 'inscriptions', label: 'Inscriptions' },
  { key: 'dates', label: 'Calendrier' },
  { key: 'postes', label: 'Postes' },
  { key: 'lien', label: 'Lien' },
  { key: 'note', label: 'Note' },
];

function fmt(iso: string) {
  return new Date(iso.length === 10 ? `${iso}T12:00:00` : iso)
    .toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Europe/Paris' });
}

/** Résumé d'une fiche en une ligne de pastilles — ce que l'élève verra. */
function Resume({ f }: { f: FicheConcours }) {
  const insc = etatInscription(f);
  const dates = datesAVenir(f);
  const chips: string[] = [];
  chips.push(f.date_epreuve ? `J−${joursAvant(f.date_epreuve)} · ${fmt(f.date_epreuve)}` : 'Date d’épreuve à venir');
  if (insc?.etat === 'ouverte') chips.push('Inscriptions ouvertes');
  else if (insc?.etat === 'a_venir') chips.push(`Inscriptions le ${fmt(insc.debut)}`);
  else if (insc?.etat === 'close') chips.push('Inscriptions closes');
  else if (insc?.etat === 'texte') chips.push('Inscriptions (texte)');
  if (f.postes_externe || f.postes_interne) chips.push(`Postes ${f.postes_externe ?? '—'} ext. / ${f.postes_interne ?? '—'} int.`);
  if (dates.length) chips.push(`${dates.length} date${dates.length > 1 ? 's' : ''} à venir`);
  if (f.lien_label && f.lien_url) chips.push('Lien');
  return (
    <span className="flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <span key={c} className="rounded-full bg-(--color-sand-100) px-2 py-0.5 text-[11px] font-semibold text-(--color-ink-soft)">{c}</span>
      ))}
    </span>
  );
}

/* ───────────────────────── sélecteur de spécialités ───────────────────────── */

export function ChoixSpecialites({
  specialites, selection, onChange, exclure = [],
}: { specialites: Specialite[]; selection: string[]; onChange: (ids: string[]) => void; exclure?: string[] }) {
  const [q, setQ] = useState('');
  const options = specialites.filter((s) => !exclure.includes(s.id));
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const visibles = options.filter((s) => norm(s.nom).includes(norm(q)));
  const toutes = visibles.length > 0 && visibles.every((s) => selection.includes(s.id));
  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface)">
      <div className="flex items-center gap-2 border-b border-(--color-border) px-3 py-2">
        <Search className="h-4 w-4 text-(--color-ink-muted)" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une spécialité…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        <button
          type="button"
          onClick={() => onChange(toutes ? selection.filter((id) => !visibles.some((v) => v.id === id)) : Array.from(new Set([...selection, ...visibles.map((v) => v.id)])))}
          className="shrink-0 text-xs font-bold text-(--color-primary)"
        >
          {toutes ? 'Tout décocher' : 'Tout cocher'}
        </button>
      </div>
      <div className="grid max-h-56 gap-x-4 overflow-y-auto p-2 sm:grid-cols-2">
        {visibles.map((s) => (
          <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-(--color-sand-100)">
            <input
              type="checkbox"
              checked={selection.includes(s.id)}
              onChange={() => onChange(selection.includes(s.id) ? selection.filter((x) => x !== s.id) : [...selection, s.id])}
            />
            <span className="truncate">{s.nom}</span>
          </label>
        ))}
        {visibles.length === 0 && <p className="px-2 py-3 text-xs text-(--color-ink-muted)">Aucune spécialité.</p>}
      </div>
      {selection.length > 0 && (
        <p className="border-t border-(--color-border) px-3 py-1.5 text-[11px] text-(--color-ink-muted)">{selection.length} sélectionnée{selection.length > 1 ? 's' : ''}</p>
      )}
    </div>
  );
}

/* ───────────────────────── formulaire d'une fiche ───────────────────────── */

type Brouillon = {
  date_epreuve: string;
  inscription_debut: string;
  inscription_fin: string;
  inscription_texte: string;
  postes_externe: string;
  postes_interne: string;
  dates: { label: string; date: string }[];
  note: string;
  lien_label: string;
  lien_url: string;
};

function versBrouillon(f: FicheConcours): Brouillon {
  return {
    date_epreuve: f.date_epreuve?.slice(0, 10) ?? '',
    inscription_debut: isoVersSaisieParis(f.inscription_debut),
    inscription_fin: isoVersSaisieParis(f.inscription_fin),
    inscription_texte: f.inscription_texte ?? '',
    postes_externe: f.postes_externe ? String(f.postes_externe) : '',
    postes_interne: f.postes_interne ? String(f.postes_interne) : '',
    dates: f.dates.map((d) => ({ label: d.label, date: d.date.slice(0, 10) })),
    note: f.note ?? '',
    lien_label: f.lien_label ?? '',
    lien_url: f.lien_url ?? '',
  };
}

function depuisBrouillon(b: Brouillon): FicheConcours {
  return normaliserFiche({
    ...b,
    inscription_debut: b.inscription_debut ? saisieParisVersIso(b.inscription_debut) : null,
    inscription_fin: b.inscription_fin ? saisieParisVersIso(b.inscription_fin) : null,
  });
}

function FicheForm({
  initiale, specialites, collegeFixe, dejaRemplies, onFermer,
}: {
  initiale: FicheConcours;
  specialites: Specialite[];
  /** Édition d'une fiche existante ; absent = création pour une ou plusieurs spécialités. */
  collegeFixe?: Specialite;
  dejaRemplies: string[];
  onFermer: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [b, setB] = useState<Brouillon>(() => versBrouillon(initiale));
  const [cibles, setCibles] = useState<string[]>([]);
  const [copie, setCopie] = useState(false);
  const [champsCopie, setChampsCopie] = useState<ChampFiche[]>(['date_epreuve', 'inscriptions', 'dates']);
  const [msg, setMsg] = useState<{ ok: boolean; texte: string } | null>(null);

  const set = <K extends keyof Brouillon>(k: K, v: Brouillon[K]) => { setB((x) => ({ ...x, [k]: v })); setMsg(null); };

  const envoyer = (colleges: string[], champs?: ChampFiche[]) => {
    setMsg(null);
    start(async () => {
      const r = await enregistrerFiche({ colleges, fiche: depuisBrouillon(b), champs });
      if (!r.ok) { setMsg({ ok: false, texte: r.error }); return; }
      setMsg({ ok: true, texte: r.message ?? 'Enregistré.' });
      router.refresh();
      if (!collegeFixe) onFermer();
    });
  };

  return (
    <div className="space-y-5">
      {!collegeFixe && (
        <div>
          <span className={labelCls}>Spécialité(s) concernée(s)</span>
          <p className="mb-2 text-xs text-(--color-ink-muted)">
            Coche toutes les spécialités qui partagent ces informations : une fiche est créée pour chacune.
            {dejaRemplies.length > 0 && ' Les spécialités qui ont déjà une fiche ne sont pas proposées (modifie-les dans la liste).'}
          </p>
          <ChoixSpecialites specialites={specialites} selection={cibles} onChange={setCibles} exclure={dejaRemplies} />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block">
          <span className={labelCls}>Date de l’épreuve écrite</span>
          <input type="date" value={b.date_epreuve} onChange={(e) => set('date_epreuve', e.target.value)} className={inputCls} />
          <span className="mt-1 block text-[11px] text-(--color-ink-muted)">Alimente le compte à rebours J−X.</span>
        </label>
        <label className="block">
          <span className={labelCls}>Postes — voie externe</span>
          <input type="number" min={0} value={b.postes_externe} onChange={(e) => set('postes_externe', e.target.value)} className={inputCls} placeholder="ex. 35" />
        </label>
        <label className="block">
          <span className={labelCls}>Postes — voie interne</span>
          <input type="number" min={0} value={b.postes_interne} onChange={(e) => set('postes_interne', e.target.value)} className={inputCls} placeholder="ex. 89" />
        </label>
      </div>

      <div>
        <span className={labelCls}>Inscriptions (heure de Paris)</span>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-(--color-ink-soft)">Ouverture
            <input type="datetime-local" value={b.inscription_debut} onChange={(e) => set('inscription_debut', e.target.value)} className={inputCls} />
          </label>
          <label className="block text-xs text-(--color-ink-soft)">Clôture
            <input type="datetime-local" value={b.inscription_fin} onChange={(e) => set('inscription_fin', e.target.value)} className={inputCls} />
          </label>
        </div>
        <p className="mt-1 text-[11px] text-(--color-ink-muted)">L’élève voit « Ouverture le… », puis « Ouvertes jusqu’au… », et plus rien une fois closes.</p>
        {b.inscription_texte && (
          <label className="mt-2 block text-xs text-(--color-ink-soft)">Texte hérité de l’ancien bloc (affiché seulement sans dates)
            <input value={b.inscription_texte} onChange={(e) => set('inscription_texte', e.target.value)} className={inputCls} />
          </label>
        )}
      </div>

      <div>
        <span className={labelCls}>Calendrier (dates clés)</span>
        <div className="space-y-2">
          {b.dates.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={d.label} onChange={(e) => set('dates', b.dates.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className={inputCls} placeholder="Libellé (ex. Épreuve orale)" />
              <input type="date" value={d.date} onChange={(e) => set('dates', b.dates.map((x, j) => (j === i ? { ...x, date: e.target.value } : x)))} className={`${inputCls} max-w-44`} />
              <button type="button" onClick={() => set('dates', b.dates.filter((_, j) => j !== i))} className="rounded-md p-2 text-(--color-ink-soft) hover:bg-(--color-sand-100)" aria-label="Retirer cette date">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS_DATES.filter((s) => !b.dates.some((d) => d.label === s)).map((s) => (
            <button key={s} type="button" onClick={() => set('dates', [...b.dates, { label: s, date: '' }])} className="rounded-full border border-dashed border-(--color-border) px-2.5 py-1 text-[11px] font-semibold text-(--color-ink-soft) hover:border-(--color-primary) hover:text-(--color-primary)">
              + {s}
            </button>
          ))}
          <button type="button" onClick={() => set('dates', [...b.dates, { label: '', date: '' }])} className="rounded-full border border-dashed border-(--color-border) px-2.5 py-1 text-[11px] font-semibold text-(--color-ink-soft) hover:border-(--color-primary) hover:text-(--color-primary)">
            + Autre date
          </button>
        </div>
        <p className="mt-1 text-[11px] text-(--color-ink-muted)">Les dates passées disparaissent d’elles-mêmes chez l’élève.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Bouton — libellé (facultatif)</span>
          <input value={b.lien_label} onChange={(e) => set('lien_label', e.target.value)} className={inputCls} placeholder="ex. Accéder à mon espace CNG" />
        </label>
        <label className="block">
          <span className={labelCls}>Bouton — lien</span>
          <input value={b.lien_url} onChange={(e) => set('lien_url', e.target.value)} className={inputCls} placeholder="https://…" />
        </label>
      </div>

      <label className="block">
        <span className={labelCls}>Note (facultatif)</span>
        <textarea value={b.note} onChange={(e) => set('note', e.target.value)} rows={2} className={inputCls} placeholder="Une précision propre à cette spécialité." />
      </label>

      {collegeFixe && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-sand-100)/40">
          <button type="button" onClick={() => setCopie((v) => !v)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-bold text-(--color-ink)">
            <Copy className="h-4 w-4 text-(--color-primary)" /> Appliquer aussi à d’autres spécialités
            <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${copie ? 'rotate-90' : ''}`} />
          </button>
          {copie && (
            <div className="space-y-3 border-t border-(--color-border) p-3">
              <div className="flex flex-wrap gap-3">
                {CHAMPS.map((c) => (
                  <label key={c.key} className="flex items-center gap-1.5 text-xs font-semibold text-(--color-ink-soft)">
                    <input type="checkbox" checked={champsCopie.includes(c.key)} onChange={() => setChampsCopie((x) => (x.includes(c.key) ? x.filter((k) => k !== c.key) : [...x, c.key]))} />
                    {c.label}
                  </label>
                ))}
              </div>
              <p className="text-[11px] text-(--color-ink-muted)">Seules les rubriques cochées sont recopiées ; le reste de chaque fiche (ses postes, par exemple) est conservé.</p>
              <ChoixSpecialites specialites={specialites} selection={cibles} onChange={setCibles} exclure={[collegeFixe.id]} />
              <button
                type="button"
                disabled={pending || cibles.length === 0 || champsCopie.length === 0}
                onClick={() => envoyer(cibles, champsCopie)}
                className="inline-flex items-center gap-2 rounded-lg border border-(--color-primary) px-3 py-1.5 text-sm font-bold text-(--color-primary) disabled:opacity-50"
              >
                <Copy className="h-4 w-4" /> Appliquer à {cibles.length || '…'} spécialité{cibles.length > 1 ? 's' : ''}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-end gap-3">
        {msg && <span className={`text-xs font-bold ${msg.ok ? 'text-[#16793C]' : 'text-(--color-danger,#B91C1C)'}`}>{msg.texte}</span>}
        <button type="button" onClick={onFermer} className="rounded-lg px-3 py-2 text-sm font-semibold text-(--color-ink-soft) hover:bg-(--color-sand-100)">
          {collegeFixe ? 'Fermer' : 'Annuler'}
        </button>
        <button
          type="button"
          disabled={pending || (!collegeFixe && cibles.length === 0)}
          onClick={() => envoyer(collegeFixe ? [collegeFixe.id] : cibles)}
          className="inline-flex items-center gap-2 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-bold text-white shadow-sm disabled:opacity-60"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {collegeFixe ? 'Enregistrer' : `Créer ${cibles.length > 1 ? `${cibles.length} fiches` : 'la fiche'}`}
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── liste des fiches ───────────────────────── */

export function FichesConcours({ lignes, specialites }: { lignes: LigneFiche[]; specialites: Specialite[] }) {
  const router = useRouter();
  const [ouverte, setOuverte] = useState<string | null>(null);
  const [creation, setCreation] = useState(false);
  const [pending, start] = useTransition();
  const [q, setQ] = useState('');
  const remplies = useMemo(() => lignes.map((l) => l.id), [lignes]);
  const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const visibles = lignes.filter((l) => norm(l.nom).includes(norm(q)));

  const retirer = (l: LigneFiche) => {
    if (!confirm(`Retirer la fiche « ${l.nom} » ? Plus rien ne s’affichera pour cette spécialité.`)) return;
    start(async () => {
      const r = await retirerFiche(l.id);
      if (!r.ok) alert(r.error);
      router.refresh();
    });
  };

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold text-(--color-ink)">
            <CalendarCheck className="h-4 w-4 text-(--color-primary)" /> Concours par spécialité
            <span className="rounded-full bg-(--color-sand-100) px-2 py-0.5 text-[11px] font-bold text-(--color-ink-soft)">{lignes.length}</span>
          </h2>
          <p className="mt-0.5 max-w-2xl text-xs text-(--color-ink-muted)">
            Une seule fiche par spécialité : tu ne saisis que les dates et les chiffres. Compte à rebours, inscriptions,
            postes et calendrier sont mis en forme automatiquement, dans <strong>une seule carte</strong> chez les élèves
            de cette spécialité.
          </p>
        </div>
        <button type="button" onClick={() => { setCreation(true); setOuverte(null); }} className="inline-flex items-center gap-2 rounded-lg bg-(--color-primary) px-3 py-2 text-sm font-bold text-white shadow-sm">
          <Plus className="h-4 w-4" /> Nouvelle fiche
        </button>
      </div>

      {creation && (
        <div className="rounded-2xl border-2 border-(--color-primary)/30 bg-(--color-surface) p-4">
          <FicheForm initiale={normaliserFiche({})} specialites={specialites} dejaRemplies={remplies} onFermer={() => setCreation(false)} />
        </div>
      )}

      {lignes.length > 6 && (
        <div className="flex items-center gap-2 rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2">
          <Search className="h-4 w-4 text-(--color-ink-muted)" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer les fiches…" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
        </div>
      )}

      {lignes.length === 0 && !creation && (
        <div className="rounded-2xl border border-dashed border-(--color-border) bg-(--color-surface-soft) px-4 py-8 text-center text-sm text-(--color-ink-soft)">
          Aucune fiche. Clique sur « Nouvelle fiche » et coche les spécialités concernées.
        </div>
      )}

      {visibles.map((l) => {
        const open = ouverte === l.id;
        return (
          <div key={l.id} className="rounded-2xl border border-(--color-border) bg-(--color-surface)">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3">
              <button type="button" onClick={() => { setOuverte(open ? null : l.id); setCreation(false); }} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <ChevronRight className={`h-4 w-4 shrink-0 text-(--color-ink-soft) transition-transform ${open ? 'rotate-90' : ''}`} />
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-bold text-(--color-ink)">
                    {l.nom}
                    {l.heritee && <span className="rounded-full bg-[#FFEAD9] px-2 py-0.5 text-[10px] font-bold text-[#B45B00]">reprise des anciens blocs</span>}
                  </span>
                  <span className="mt-1 block"><Resume f={l.fiche} /></span>
                </span>
              </button>
              <button type="button" disabled={pending} onClick={() => retirer(l)} className="rounded-md p-1.5 text-(--color-ink-soft) hover:bg-(--color-sand-100)" aria-label={`Retirer la fiche ${l.nom}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            {open && (
              <div className="border-t border-(--color-border) p-4">
                <FicheForm initiale={l.fiche} specialites={specialites} collegeFixe={{ id: l.id, nom: l.nom }} dejaRemplies={remplies} onFermer={() => setOuverte(null)} />
              </div>
            )}
          </div>
        );
      })}
      {q && visibles.length === 0 && <p className="text-xs text-(--color-ink-muted)">Aucune fiche ne correspond.</p>}
      <p className="flex items-center gap-1.5 text-[11px] text-(--color-ink-muted)"><Check className="h-3 w-3" /> Au-delà de deux spécialités (accès intégral), l’élève voit une carte compacte « Vos épreuves » au lieu de plusieurs cartes.</p>
    </section>
  );
}
