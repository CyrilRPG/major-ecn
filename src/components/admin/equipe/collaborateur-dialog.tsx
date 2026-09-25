'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2, Plus, ShieldCheck, UserCog } from 'lucide-react';
import { fetchAvecJetonFrais } from '@/lib/auth/fresh-token';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CONTENT_TYPES, CONTENT_TYPE_LABEL, type ContentType } from '@/lib/schemas/professor';
import {
  DROIT_BLOG_LABEL, DROIT_CONTENU_LABEL, FORMULES, FORMULE_LABEL, MODULE_LABEL, PAGE_SECURITE, POPULATION_LABEL, ROLES_MODELES,
  accesOnglets, composerScope, modulesVides, pagesDuScope, perimetreVide, replierPerimetre,
  type Formule, type Modules, type Perimetre, type RoleModele,
} from '@/lib/auth/collaborateurs';

export type CollaborateurInitial = {
  userId: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  fonction: string | null;
  modele: RoleModele | null;
  modules: Modules;
  perimetre: Perimetre;
  mfa_obligatoire: boolean;
  /** YYYY-MM-DD ou null. */
  access_end: string | null;
  is_active: boolean;
};

const ROLES: RoleModele[] = ['commercial', 'gestionnaire_video', 'redacteur_blog', 'enseignant_relecteur', 'responsable_complet'];

/**
 * Création / modification d'un membre de l'équipe (cahier des charges
 * 18/09/2026) : identité, statut, date de fin, 2FA obligatoire, rôle modèle
 * (point de départ), puis les trois modules et leurs droits cumulables, et le
 * périmètre — spécialités, et formules à l'intérieur de chaque spécialité.
 */
export function CollaborateurDialog({
  mode,
  initial,
  colleges,
}: {
  mode: 'creer' | 'modifier';
  initial?: CollaborateurInitial;
  colleges: { id: string; nom: string; enfants?: { id: string; nom: string }[] }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const [firstName, setFirstName] = useState(initial?.first_name ?? '');
  const [lastName, setLastName] = useState(initial?.last_name ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [fonction, setFonction] = useState(initial?.fonction ?? '');
  const [modele, setModele] = useState<RoleModele | ''>(initial?.modele ?? '');
  const [modules, setModules] = useState<Modules>(initial?.modules ?? modulesVides());
  // Sous-collège → parent : un parent présent rend ses sous-collèges implicites.
  const parentDe = useMemo<Record<string, string>>(() => {
    const out: Record<string, string> = {};
    for (const c of colleges) for (const e of c.enfants ?? []) out[e.id] = c.id;
    return out;
  }, [colleges]);
  const nomsPlats = useMemo(() => new Map(colleges.flatMap((c) => [[c.id, c.nom] as const, ...(c.enfants ?? []).map((e) => [e.id, e.nom] as const)])), [colleges]);
  // Nouveau collaborateur : AUCUNE spécialité au départ. « Toutes les
  // spécialités » est un choix explicite — le défaut « toutes » avait ouvert
  // tous les collèges au monteur vidéo créé le 24/09/2026.
  const [perimetre, setPerimetre] = useState<Perimetre>(() => (initial?.perimetre ? replierPerimetre(initial.perimetre, parentDe) : perimetreVide()));
  const [mfa, setMfa] = useState(initial?.mfa_obligatoire ?? false);
  const [accessEnd, setAccessEnd] = useState(initial?.access_end ?? '');
  const [actif, setActif] = useState(initial?.is_active ?? true);

  const appliquerModele = (r: RoleModele | '') => {
    setModele(r);
    if (r) setModules(structuredClone(ROLES_MODELES[r].modules));
  };

  const toutesSpecialites = perimetre.specialites === 'toutes';
  const specialitesChoisies = useMemo<string[]>(
    () => (perimetre.specialites === 'toutes' ? [] : perimetre.specialites),
    [perimetre.specialites],
  );
  const lignesFormules = useMemo<{ cle: string; nom: string }[]>(
    () => (toutesSpecialites
      ? [{ cle: '*', nom: 'Toutes les spécialités' }]
      : specialitesChoisies.map((id) => ({ cle: id, nom: nomsPlats.get(id) ?? id }))),
    [toutesSpecialites, specialitesChoisies, nomsPlats],
  );
  const formulesDe = (cle: string): Formule[] => perimetre.formules[cle] ?? perimetre.formules['*'] ?? [...FORMULES];
  const basculerFormule = (cle: string, f: Formule) => {
    const actuelles = formulesDe(cle);
    const prochaines = actuelles.includes(f) ? actuelles.filter((x) => x !== f) : [...actuelles, f];
    setPerimetre((p) => ({ ...p, formules: { ...p.formules, [cle]: prochaines } }));
  };
  const basculerSpecialite = (id: string) => {
    setPerimetre((p) => {
      const liste = p.specialites === 'toutes' ? [] : p.specialites;
      // Cocher un parent rend ses sous-collèges implicites : on les retire.
      const prochaine = liste.includes(id)
        ? liste.filter((x) => x !== id)
        : [...liste.filter((x) => parentDe[x] !== id), id];
      return { ...p, specialites: prochaine };
    });
  };

  const majSuivi = (patch: Partial<Modules['suivi']>) => setModules((m) => ({ ...m, suivi: { ...m.suivi, ...patch } }));
  const majContenus = (patch: Partial<Modules['contenus']>) => setModules((m) => ({ ...m, contenus: { ...m.contenus, ...patch } }));
  const majBlog = (patch: Partial<Modules['blog']>) => setModules((m) => ({ ...m, blog: { ...m.blog, ...patch } }));
  const basculerType = (t: ContentType) => majContenus({
    types: modules.contenus.types.includes(t) ? modules.contenus.types.filter((x) => x !== t) : [...modules.contenus.types, t],
  });

  // Aperçu de ce que la personne verra réellement, calculé avec les mêmes
  // règles que les gardes du serveur (`accesOnglets`, `pagesDuScope`).
  const apercu = useMemo(() => {
    const scope = composerScope({ modules, perimetre });
    const acces = accesOnglets(scope);
    return {
      pages: pagesDuScope(scope).filter((pg) => pg.href !== PAGE_SECURITE).map((pg) => pg.label),
      questions: acces.qa,
    };
  }, [modules, perimetre]);
  const nbSpecialites = specialitesChoisies.length;

  const enregistrer = () => {
    setError(null); setInfo(null);
    if (!toutesSpecialites && specialitesChoisies.length === 0) { setError('Choisissez au moins une spécialité, ou « Toutes les spécialités ».'); return; }
    start(async () => {
      const commun = {
        fonction: fonction || null, modele: modele || null, modules, perimetre,
        mfa_obligatoire: mfa, access_end: accessEnd || null, is_active: actif,
      };
      const body = mode === 'creer'
        ? { ...commun, first_name: firstName, last_name: lastName, email, phone: phone || null }
        : { ...commun, userId: initial!.userId };
      const res = await fetchAvecJetonFrais('/api/admin/equipe', body);
      const j = (await res.json().catch(() => ({}))) as { error?: string; warning?: string };
      if (!res.ok) { setError(j.error ?? 'Enregistrement impossible.'); return; }
      if (j.warning) { setInfo(j.warning); router.refresh(); return; }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <>
      <Button size={mode === 'creer' ? 'md' : 'sm'} variant={mode === 'creer' ? 'primary' : 'outline'} onClick={() => setOpen(true)} className="gap-1.5">
        {mode === 'creer' ? <><Plus className="h-4 w-4" /> Nouveau collaborateur</> : <><UserCog className="h-3.5 w-3.5" /> Modifier</>}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{mode === 'creer' ? 'Nouveau collaborateur' : `Permissions de ${initial?.first_name ?? ''} ${initial?.last_name ?? ''}`}</DialogTitle>
            <DialogDescription>
              Une personne possède des permissions cumulables sur un périmètre précis — sans jamais devenir administrateur.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* ── Identité ── */}
            <section className="grid gap-3 sm:grid-cols-2">
              {mode === 'creer' ? (
                <>
                  <Champ label="Prénom"><input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={INPUT} /></Champ>
                  <Champ label="Nom"><input value={lastName} onChange={(e) => setLastName(e.target.value)} className={INPUT} /></Champ>
                  <Champ label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={INPUT} /></Champ>
                  <Champ label="Téléphone (facultatif)"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} /></Champ>
                </>
              ) : (
                <p className="text-sm text-(--color-ink-soft) sm:col-span-2">{initial?.email}</p>
              )}
              <Champ label="Fonction"><input value={fonction} onChange={(e) => setFonction(e.target.value)} placeholder="Commercial, monteur vidéo, rédacteur SEO…" className={INPUT} /></Champ>
              <Champ label="Fin d’accès (facultatif)"><input type="date" value={accessEnd} onChange={(e) => setAccessEnd(e.target.value)} className={INPUT} /></Champ>
              <div className="flex flex-wrap gap-4 sm:col-span-2">
                <Case coche={actif} onChange={setActif} label="Compte actif" aide="Décoché : la personne ne peut plus se connecter." />
                <Case coche={mfa} onChange={setMfa} label="Double authentification obligatoire" aide="La personne devra activer une application d’authentification avant d’entrer dans l’administration." />
              </div>
            </section>

            {/* ── Rôle modèle ── */}
            <section>
              <Champ label="Rôle modèle (point de départ)">
                <select value={modele} onChange={(e) => appliquerModele(e.target.value as RoleModele | '')} className={INPUT}>
                  <option value="">— Personnalisé —</option>
                  {ROLES.map((r) => <option key={r} value={r}>{ROLES_MODELES[r].label}</option>)}
                </select>
              </Champ>
              {modele && <p className="mt-1 text-xs text-(--color-ink-muted)">{ROLES_MODELES[modele].description} Vous pouvez ensuite ajuster chaque droit ci-dessous.</p>}
            </section>

            {/* ── Modules ── */}
            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-ink-muted)">Permissions (cumulables)</h3>

              <Bloc titre={MODULE_LABEL.suivi} actif={modules.suivi.actif} onActif={(v) => majSuivi({ actif: v })}>
                <Case coche={modules.suivi.rediger} onChange={(v) => majSuivi({ rediger: v })} label="Renseigner le suivi" aide="Comptes rendus d’appel, statut, prochaine relance." />
                <Case coche={modules.suivi.gerer} onChange={(v) => majSuivi({ gerer: v })} label="Gérer le module" aide="Campagnes, créneaux, alertes, réglages du suivi individuel." />
                <label className="block text-sm">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">Population visible</span>
                  <select value={modules.suivi.population} onChange={(e) => majSuivi({ population: e.target.value as Modules['suivi']['population'] })} className={INPUT}>
                    {(Object.keys(POPULATION_LABEL) as Modules['suivi']['population'][]).map((p) => <option key={p} value={p}>{POPULATION_LABEL[p]}</option>)}
                  </select>
                </label>
              </Bloc>

              <Bloc titre={MODULE_LABEL.contenus} actif={modules.contenus.actif} onActif={(v) => majContenus({ actif: v })}>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(['creer', 'modifier', 'publier', 'supprimer'] as const).map((d) => (
                    <Case key={d} coche={modules.contenus[d]} onChange={(v) => majContenus({ [d]: v })} label={DROIT_CONTENU_LABEL[d]} />
                  ))}
                </div>
                <div>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">Types de contenu concernés</span>
                  <div className="flex flex-wrap gap-2">
                    {CONTENT_TYPES.map((t) => (
                      <label key={t} className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold ${modules.contenus.types.includes(t) ? 'border-[#7C3AED] bg-[#F3EAFF] text-[#5B21B6]' : 'border-(--color-border) bg-white text-(--color-ink-soft)'}`}>
                        <input type="checkbox" className="sr-only" checked={modules.contenus.types.includes(t)} onChange={() => basculerType(t)} />
                        {CONTENT_TYPE_LABEL[t]}
                      </label>
                    ))}
                  </div>
                </div>
              </Bloc>

              <Bloc titre={MODULE_LABEL.blog} actif={modules.blog.actif} onActif={(v) => majBlog({ actif: v })}>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(['creer', 'modifier_siens', 'modifier_tous', 'publier', 'depublier', 'supprimer'] as const).map((d) => (
                    <Case key={d} coche={modules.blog[d]} onChange={(v) => majBlog({ [d]: v })} label={DROIT_BLOG_LABEL[d]} />
                  ))}
                </div>
                <p className="text-xs text-(--color-ink-muted)">Sans « Publier », les articles de la personne rejoignent la file « En attente de validation ».</p>
              </Bloc>
            </section>

            {/* ── Périmètre ── */}
            <section className="space-y-3">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-(--color-ink-muted)">Périmètre</h3>
              <div className="flex flex-wrap gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="radio" checked={!toutesSpecialites} onChange={() => setPerimetre((p) => ({ ...p, specialites: p.specialites === 'toutes' ? [] : p.specialites }))} /> Certaines spécialités</label>
                <label className="flex items-center gap-2"><input type="radio" checked={toutesSpecialites} onChange={() => setPerimetre((p) => ({ ...p, specialites: 'toutes' }))} /> Toutes les spécialités (y compris les futures)</label>
              </div>
              {toutesSpecialites ? (
                <p className="flex items-start gap-2 rounded-xl bg-[#FEF3E2] px-3 py-2 text-xs text-[#B26A00]">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  La personne verra tous les collèges, comme un administrateur, dans chacun des modules cochés ci-dessus. Ne choisissez ce périmètre que pour un responsable qui intervient réellement partout.
                </p>
              ) : (
                <p className="text-xs text-(--color-ink-muted)">
                  {nbSpecialites === 0
                    ? 'Cochez les spécialités sur lesquelles la personne intervient : elle ne verra que celles-ci.'
                    : `${nbSpecialites} spécialité${nbSpecialites > 1 ? 's' : ''} cochée${nbSpecialites > 1 ? 's' : ''} : la personne ne verra que ${nbSpecialites > 1 ? 'celles-ci' : 'celle-ci'}.`}
                </p>
              )}
              {!toutesSpecialites && (
                <div className="grid max-h-48 gap-1 overflow-y-auto rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-3 sm:grid-cols-2">
                  {colleges.map((c) => {
                    const parentCoche = specialitesChoisies.includes(c.id);
                    return (
                      <div key={c.id} className={c.enfants?.length ? 'sm:col-span-2' : undefined}>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={parentCoche} onChange={() => basculerSpecialite(c.id)} className="h-4 w-4" />
                          {c.nom}
                          {c.enfants?.length ? <span className="text-xs text-(--color-ink-muted)">({c.enfants.length} sous-collèges)</span> : null}
                        </label>
                        {c.enfants?.length ? (
                          <div className="ml-6 mt-1 grid gap-1 sm:grid-cols-2">
                            {c.enfants.map((e) => (
                              <label key={e.id} className={`flex items-center gap-2 text-xs ${parentCoche ? 'text-(--color-ink-muted)' : ''}`}>
                                <input
                                  type="checkbox"
                                  checked={parentCoche || specialitesChoisies.includes(e.id)}
                                  disabled={parentCoche}
                                  onChange={() => basculerSpecialite(e.id)}
                                  className="h-3.5 w-3.5"
                                  title={parentCoche ? 'Inclus avec le collège parent' : undefined}
                                />
                                {e.nom}
                              </label>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="overflow-x-auto rounded-xl border border-(--color-border)">
                <table className="w-full text-sm">
                  <thead className="bg-(--color-surface-soft) text-xs uppercase tracking-wide text-(--color-ink-muted)">
                    <tr>
                      <th className="px-3 py-2 text-left font-semibold">Formules autorisées</th>
                      {FORMULES.map((f) => <th key={f} className="px-3 py-2 text-center font-semibold">{FORMULE_LABEL[f]}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {lignesFormules.map((l) => (
                      <tr key={l.cle} className="border-t border-(--color-border)">
                        <td className="px-3 py-2 font-medium text-(--color-ink)">{l.nom}</td>
                        {FORMULES.map((f) => (
                          <td key={f} className="px-3 py-2 text-center">
                            <input type="checkbox" checked={formulesDe(l.cle).includes(f)} onChange={() => basculerFormule(l.cle, f)} className="h-4 w-4" aria-label={`${l.nom} — ${FORMULE_LABEL[f]}`} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ── Aperçu : ce que la personne verra ── */}
            <section className="rounded-xl border border-(--color-border) bg-white px-3 py-2.5 text-xs text-(--color-ink-soft)">
              <p className="mb-1 font-semibold uppercase tracking-wide text-(--color-ink-muted)">Ce que la personne verra</p>
              <p>
                <span className="font-semibold text-(--color-ink)">Pages : </span>
                {apercu.pages.length > 0 ? apercu.pages.join(' · ') : 'aucune (seulement la sécurité de son compte)'}
              </p>
              <p className="mt-0.5">
                <span className="font-semibold text-(--color-ink)">Questions des élèves : </span>
                {apercu.questions
                  ? `${toutesSpecialites ? 'reçues et visibles pour toutes les spécialités' : 'reçues et visibles pour les spécialités cochées seulement'} — avec le nom et le prénom de l’élève, jamais son adresse e-mail.`
                  : 'jamais — ni mail, ni page Questions / Réponses (réservé aux enseignants : fiches, QCM, DP, QROC, annales ou flashcards).'}
              </p>
              <p className="mt-0.5">
                <span className="font-semibold text-(--color-ink)">Collèges : </span>
                {toutesSpecialites ? 'tous' : nbSpecialites === 0 ? 'aucun pour l’instant' : specialitesChoisies.map((id) => nomsPlats.get(id) ?? id).join(', ')}
              </p>
            </section>

            <p className="flex items-start gap-2 rounded-xl bg-(--color-surface-soft) px-3 py-2 text-xs text-(--color-ink-soft)">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16793C]" />
              Quel que soit le cumul de permissions, paiements, facturation, configuration du site, création d’administrateurs et données sensibles restent réservés aux administrateurs.
            </p>

            {error && <p className="text-sm font-medium text-[#A91D2C]">{error}</p>}
            {info && <p className="rounded-xl bg-[#FEF3E2] px-3 py-2 text-sm text-[#B26A00]">{info}</p>}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Fermer</Button>
            <Button onClick={enregistrer} disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : null}
              {mode === 'creer' ? 'Créer et inviter' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

const INPUT = 'h-9 w-full rounded-lg border border-(--color-border) bg-white px-3 text-sm text-(--color-ink)';

function Case({ coche, onChange, label, aide }: { coche: boolean; onChange: (v: boolean) => void; label: string; aide?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-2 text-sm text-(--color-ink)">
      <input type="checkbox" checked={coche} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-(--color-border)" />
      <span><span className="font-medium">{label}</span>{aide && <span className="block text-xs text-(--color-ink-muted)">{aide}</span>}</span>
    </label>
  );
}

function Champ({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">{label}</span>
      {children}
    </label>
  );
}

function Bloc({ titre, actif, onActif, children }: { titre: string; actif: boolean; onActif: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border p-3 ${actif ? 'border-[#7C3AED]/40 bg-white' : 'border-(--color-border) bg-(--color-surface-soft)'}`}>
      <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-(--color-ink)">
        <input type="checkbox" checked={actif} onChange={(e) => onActif(e.target.checked)} className="h-4 w-4" />
        {titre}
      </label>
      {actif && <div className="mt-3 space-y-3 border-t border-(--color-border) pt-3">{children}</div>}
    </div>
  );
}
