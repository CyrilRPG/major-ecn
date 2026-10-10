'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { creerTache, modifierTache, type TacheInput } from '@/app/admin/cockpit/actions-taches';
import { enregistrerNote, enregistrerRdv, rechercherPersonnes, type Personne, type RdvInput } from '@/app/admin/cockpit/actions-divers';
import {
  CATEGORIES_DEFAUT, GENRES_RDV, GENRE_RDV_LABEL, PRIORITES, PRIORITE_LABEL, RECURRENCES, RECURRENCE_LABEL, STATUTS_TACHE,
  STATUT_TACHE_LABEL, libelleCategorie,
} from '@/lib/cockpit/regles';
import { Bouton, champ, Libelle, useEtatSuivi } from './ui';

export type Membre = { id: string; nom: string };

/* ------------------------------------------------------------------ */
/* Sélecteur de personne (base Major ECN)                               */
/* ------------------------------------------------------------------ */

export function ChoixPersonne({
  type, valeur, onChange, placeholder,
}: {
  type: 'eleve' | 'enseignant' | 'equipe';
  valeur: { id: string | null; nom: string };
  onChange: (v: { id: string | null; nom: string; email?: string | null }) => void;
  placeholder?: string;
}) {
  const [q, setQ] = useEtatSuivi(valeur.nom);
  const [res, setRes] = React.useState<Personne[]>([]);
  const [ouvert, setOuvert] = React.useState(false);
  React.useEffect(() => {
    if (!ouvert) return;
    const t = setTimeout(async () => setRes(await rechercherPersonnes(q, type)), 220);
    return () => clearTimeout(t);
  }, [q, type, ouvert]);
  return (
    <div className="relative">
      <input
        className={champ}
        value={q}
        placeholder={placeholder ?? 'Rechercher dans la base Major ECN…'}
        onFocus={() => setOuvert(true)}
        onBlur={() => setTimeout(() => setOuvert(false), 150)}
        onChange={(e) => {
          setQ(e.target.value);
          onChange({ id: null, nom: e.target.value });
        }}
      />
      {valeur.id && <span className="pointer-events-none absolute right-3 top-2.5 text-[11px] font-medium text-[#1F7A3E]">✓ fiche reliée</span>}
      {ouvert && res.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-(--color-border) bg-white py-1 shadow-lg">
          {res.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="flex w-full flex-col px-3 py-1.5 text-left hover:bg-(--color-primary-soft)"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange({ id: p.id, nom: p.nom, email: p.email });
                  setQ(p.nom);
                  setOuvert(false);
                }}
              >
                <span className="text-sm text-(--color-ink)">{p.nom}</span>
                {p.email && <span className="text-[11.5px] text-(--color-ink-muted)">{p.email}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tâche : création rapide (titre seul) puis fiche détaillée facultative */
/* ------------------------------------------------------------------ */

export function FormulaireTache({
  initial, id, membres, onFini,
}: {
  initial?: Partial<TacheInput> & { statut?: string };
  id?: string;
  membres: Membre[];
  onFini?: (id: string) => void;
}) {
  const router = useRouter();
  const [v, setV] = React.useState<TacheInput>({
    titre: '', priorite: 'normale', categorie: 'administration', recurrence: 'aucune', ...initial,
    // Le rappel est saisi en heure locale (datetime-local), stocké en ISO.
    rappel_at: initial?.rappel_at ? versLocal(initial.rappel_at as string) : undefined,
  } as TacheInput);
  const [detail, setDetail] = React.useState(!!id || !!initial?.description || !!initial?.lien_type);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, start] = React.useTransition();
  const maj = (patch: Partial<TacheInput>) => setV((x) => ({ ...x, ...patch }));
  const [categorieLibre, setCategorieLibre] = React.useState(
    !!initial?.categorie && !(CATEGORIES_DEFAUT as readonly string[]).includes(initial.categorie) && initial.categorie !== 'client',
  );

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);
    start(async () => {
      const charge = { ...v, rappel_at: v.rappel_at ? new Date(v.rappel_at as string).toISOString() : '' };
      const r = id ? await modifierTache(id, charge) : await creerTache(charge);
      if (!r.ok) return setErreur(r.erreur);
      router.refresh();
      onFini?.(id ?? r.data!.id);
    });
  };

  return (
    <form onSubmit={soumettre} className="space-y-3">
      <div>
        <Libelle htmlFor="t-titre">Titre</Libelle>
        <input id="t-titre" autoFocus className={champ} value={v.titre} onChange={(e) => maj({ titre: e.target.value })} placeholder="Ex. Relancer Thomas — relecture cardiologie" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <Libelle>Échéance</Libelle>
          <input type="date" className={champ} value={(v.echeance as string) ?? ''} onChange={(e) => maj({ echeance: e.target.value })} />
        </div>
        <div>
          <Libelle aide="(facultatif)">Heure</Libelle>
          <input type="time" className={champ} value={((v.heure as string) ?? '').slice(0, 5)} onChange={(e) => maj({ heure: e.target.value })} />
        </div>
        <div>
          <Libelle>Priorité</Libelle>
          <select className={champ} value={v.priorite} onChange={(e) => maj({ priorite: e.target.value as TacheInput['priorite'] })}>
            {PRIORITES.map((p) => <option key={p} value={p}>{PRIORITE_LABEL[p]}</option>)}
          </select>
        </div>
      </div>
      {!detail && (
        <button type="button" onClick={() => setDetail(true)} className="text-[13px] font-medium text-(--color-primary) hover:underline">
          + Fiche détaillée (description, catégorie, rappel, récurrence, affectation…)
        </button>
      )}
      {detail && (
        <div className="space-y-3 rounded-xl bg-(--color-surface-soft) p-3">
          <div>
            <Libelle>Description</Libelle>
            <textarea rows={3} className={champ} value={(v.description as string) ?? ''} onChange={(e) => maj({ description: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Libelle>Catégorie</Libelle>
              {categorieLibre ? (
                <input className={champ} value={v.categorie ?? ''} onChange={(e) => maj({ categorie: e.target.value })} placeholder="Catégorie personnalisée" />
              ) : (
                <select
                  className={champ}
                  value={v.categorie}
                  onChange={(e) => (e.target.value === '__libre' ? (setCategorieLibre(true), maj({ categorie: '' })) : maj({ categorie: e.target.value }))}
                >
                  {[...CATEGORIES_DEFAUT, 'client'].map((c) => <option key={c} value={c}>{libelleCategorie(c)}</option>)}
                  <option value="__libre">Autre (personnalisée)…</option>
                </select>
              )}
            </div>
            <div>
              <Libelle>Statut</Libelle>
              <select className={champ} value={(v.statut as string) ?? 'a_faire'} onChange={(e) => maj({ statut: e.target.value as TacheInput['statut'] })}>
                {STATUTS_TACHE.map((s) => <option key={s} value={s}>{STATUT_TACHE_LABEL[s]}</option>)}
              </select>
            </div>
            <div>
              <Libelle>Rappel</Libelle>
              <input type="datetime-local" className={champ} value={(v.rappel_at as string)?.slice(0, 16) ?? ''} onChange={(e) => maj({ rappel_at: e.target.value })} />
            </div>
            <div>
              <Libelle>Récurrence</Libelle>
              <select className={champ} value={v.recurrence} onChange={(e) => maj({ recurrence: e.target.value as TacheInput['recurrence'] })}>
                {RECURRENCES.map((r) => <option key={r} value={r}>{RECURRENCE_LABEL[r]}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Libelle aide="(reste propriétaire de la tâche)">Attribuer à un collaborateur</Libelle>
              <select className={champ} value={(v.assignee_id as string) ?? ''} onChange={(e) => maj({ assignee_id: e.target.value })}>
                <option value="">Moi seulement (tâche privée)</option>
                {membres.map((m) => <option key={m.id} value={m.id}>{m.nom}</option>)}
              </select>
            </div>
          </div>
          {v.lien_label && (
            <p className="text-[12.5px] text-(--color-ink-soft)">Lien interne : <strong className="text-(--color-ink)">{v.lien_label}</strong></p>
          )}
          <div>
            <Libelle>Notes</Libelle>
            <textarea rows={2} className={champ} value={(v.notes as string) ?? ''} onChange={(e) => maj({ notes: e.target.value })} />
          </div>
        </div>
      )}
      {erreur && <p className="text-sm text-[#B42318]">{erreur}</p>}
      <div className="flex items-center justify-between gap-2 pt-1">
        <p className="text-[12px] text-(--color-ink-muted)">Privée par défaut : visible de vous seul{v.assignee_id ? ' et de la personne affectée' : ''}.</p>
        <Bouton type="submit" enCours={enCours}>{id ? 'Enregistrer' : 'Créer la tâche'}</Bouton>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Rendez-vous                                                         */
/* ------------------------------------------------------------------ */

function versLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function FormulaireRdv({
  initial, id, onFini,
}: {
  initial?: Partial<RdvInput>;
  id?: string;
  onFini?: (id: string) => void;
}) {
  const router = useRouter();
  const maintenant = new Date();
  maintenant.setMinutes(0, 0, 0);
  maintenant.setHours(maintenant.getHours() + 1);
  const [v, setV] = React.useState({
    titre: initial?.titre ?? '',
    genre: initial?.genre ?? 'rendez_vous',
    debut: versLocal(initial?.debut ?? maintenant.toISOString()),
    fin: versLocal(initial?.fin ?? new Date(maintenant.getTime() + 3_600_000).toISOString()),
    personne_type: (initial?.personne_type as string) ?? '',
    personne_id: (initial?.personne_id as string | null | undefined) ?? null,
    personne_label: initial?.personne_label ?? '',
    objet: initial?.objet ?? '',
    lieu: initial?.lieu ?? '',
    lien_visio: (initial?.lien_visio as string) ?? '',
    coordonnees: initial?.coordonnees ?? '',
    notes: initial?.notes ?? '',
    documents: initial?.documents ?? [],
  });
  const [doc, setDoc] = React.useState({ label: '', url: '' });
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, start] = React.useTransition();
  const maj = (p: Partial<typeof v>) => setV((x) => ({ ...x, ...p }));

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    setErreur(null);
    if (!v.debut) return setErreur('Indiquez la date et l’heure.');
    start(async () => {
      const r = await enregistrerRdv({
        ...v,
        genre: v.genre as RdvInput['genre'],
        debut: new Date(v.debut).toISOString(),
        fin: v.fin ? new Date(v.fin).toISOString() : '',
        personne_type: (v.personne_type || '') as RdvInput['personne_type'],
        personne_id: v.personne_id ?? '',
      }, id);
      if (!r.ok) return setErreur(r.erreur);
      router.refresh();
      onFini?.(r.data!.id);
    });
  };

  return (
    <form onSubmit={soumettre} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
        <div>
          <Libelle>Objet du rendez-vous</Libelle>
          <input autoFocus className={champ} value={v.titre} onChange={(e) => maj({ titre: e.target.value })} placeholder="Ex. Point avec le Pr Dubois" />
        </div>
        <div>
          <Libelle>Type</Libelle>
          <select className={champ} value={v.genre} onChange={(e) => maj({ genre: e.target.value as typeof v.genre })}>
            {GENRES_RDV.map((g) => <option key={g} value={g}>{GENRE_RDV_LABEL[g]}</option>)}
          </select>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Libelle>Début</Libelle>
          <input type="datetime-local" className={champ} value={v.debut} onChange={(e) => maj({ debut: e.target.value })} />
        </div>
        <div>
          <Libelle>Fin</Libelle>
          <input type="datetime-local" className={champ} value={v.fin} onChange={(e) => maj({ fin: e.target.value })} />
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[160px_1fr]">
        <div>
          <Libelle>Personne concernée</Libelle>
          <select className={champ} value={v.personne_type} onChange={(e) => maj({ personne_type: e.target.value, personne_id: null })}>
            <option value="">—</option>
            <option value="enseignant">Enseignant</option>
            <option value="eleve">Élève / candidat</option>
            <option value="client">Client</option>
            <option value="externe">Externe</option>
          </select>
        </div>
        <div>
          <Libelle>&nbsp;</Libelle>
          {v.personne_type === 'enseignant' || v.personne_type === 'eleve' ? (
            <ChoixPersonne
              type={v.personne_type === 'enseignant' ? 'enseignant' : 'eleve'}
              valeur={{ id: v.personne_id, nom: v.personne_label ?? '' }}
              onChange={(p) => maj({ personne_id: p.id, personne_label: p.nom })}
            />
          ) : (
            <input className={champ} value={v.personne_label ?? ''} onChange={(e) => maj({ personne_label: e.target.value })} placeholder="Nom" />
          )}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Libelle>Lien Zoom / visio</Libelle>
          <input className={champ} value={v.lien_visio} onChange={(e) => maj({ lien_visio: e.target.value })} placeholder="https://…" />
        </div>
        <div>
          <Libelle>Lieu ou coordonnées utiles</Libelle>
          <input className={champ} value={v.coordonnees ?? ''} onChange={(e) => maj({ coordonnees: e.target.value })} placeholder="Téléphone, adresse…" />
        </div>
      </div>
      <div>
        <Libelle>Ordre du jour / notes</Libelle>
        <textarea rows={3} className={champ} value={v.notes ?? ''} onChange={(e) => maj({ notes: e.target.value })} />
      </div>
      <div>
        <Libelle aide="(liens)">Documents</Libelle>
        {v.documents.length > 0 && (
          <ul className="mb-2 space-y-1 text-[13px]">
            {v.documents.map((d, i) => (
              <li key={i} className="flex items-center gap-2">
                <a href={d.url} target="_blank" rel="noopener" className="text-(--color-primary) underline">{d.label}</a>
                <button type="button" className="text-(--color-ink-muted) hover:text-[#B42318]" onClick={() => maj({ documents: v.documents.filter((_, j) => j !== i) })}>Retirer</button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <input className={champ} value={doc.label} onChange={(e) => setDoc({ ...doc, label: e.target.value })} placeholder="Intitulé" />
          <input className={champ} value={doc.url} onChange={(e) => setDoc({ ...doc, url: e.target.value })} placeholder="https://…" />
          <Bouton type="button" variante="contour" taille="md" onClick={() => {
            if (!doc.label.trim() || !/^https?:\/\//.test(doc.url.trim())) return;
            maj({ documents: [...v.documents, { label: doc.label.trim(), url: doc.url.trim() }] });
            setDoc({ label: '', url: '' });
          }}>Ajouter</Bouton>
        </div>
      </div>
      {erreur && <p className="text-sm text-[#B42318]">{erreur}</p>}
      <div className="flex justify-end">
        <Bouton type="submit" enCours={enCours}>{id ? 'Enregistrer' : 'Ajouter le rendez-vous'}</Bouton>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Note personnelle                                                    */
/* ------------------------------------------------------------------ */

export function FormulaireNote({ initial, id, onFini }: { initial?: string; id?: string; onFini?: () => void }) {
  const router = useRouter();
  const [texte, setTexte] = React.useState(initial ?? '');
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [enCours, start] = React.useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await enregistrerNote(texte, id);
          if (!r.ok) return setErreur(r.erreur);
          router.refresh();
          onFini?.();
        });
      }}
      className="space-y-3"
    >
      <textarea autoFocus rows={6} className={champ} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Votre note… (strictement personnelle)" />
      {erreur && <p className="text-sm text-[#B42318]">{erreur}</p>}
      <div className="flex justify-end">
        <Bouton type="submit" enCours={enCours}>Enregistrer la note</Bouton>
      </div>
    </form>
  );
}
