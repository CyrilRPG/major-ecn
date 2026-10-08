'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Briefcase, CalendarClock, CalendarDays, Check, Crown, Eye, Film, GraduationCap,
  KeyRound, Loader2, Map as IconeCarte, MessagesSquare, Newspaper, PenLine, Pencil, Plus, ShieldCheck, SlidersHorizontal, UserRound, Users, Video, X,
} from 'lucide-react';
import { fetchAvecJetonFrais } from '@/lib/auth/fresh-token';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { CONTENT_TYPES, CONTENT_TYPE_LABEL, type ContentType } from '@/lib/schemas/professor';
import {
  DROIT_BLOG_LABEL, MODULE_LABEL, PAGE_SECURITE, POPULATION_LABEL, POSTE_LABEL, ROLES_MODELES, TYPES_PEDAGOGIQUES,
  accesOnglets, composerScope, estEnseignant, modulesVides, pagesDuScope, perimetreVide, posteDuScope, replierPerimetre,
  type Modules, type Perimetre, type RoleModele,
} from '@/lib/auth/collaborateurs';
import type { CollegeChoix } from '@/lib/equipe/selection-colleges';
import { Champ, INPUT, LigneInterrupteur, Pastille, Interrupteur } from './controles';
import { SelecteurSpecialites } from './selecteur-specialites';

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
  /** Professeur référent (questions des élèves + vidéos). */
  referent: boolean;
  /** YYYY-MM-DD ou null. */
  access_end: string | null;
  is_active: boolean;
};

type Onglet = 'profil' | 'droits' | 'specialites';
const ONGLETS: { cle: Onglet; titre: string; Icone: typeof UserRound }[] = [
  { cle: 'profil', titre: 'Profil', Icone: UserRound },
  { cle: 'droits', titre: 'Rôle & droits', Icone: SlidersHorizontal },
  { cle: 'specialites', titre: 'Spécialités', Icone: IconeCarte },
];

const ROLES: { cle: RoleModele; Icone: typeof UserRound }[] = [
  { cle: 'enseignant_relecteur', Icone: GraduationCap },
  { cle: 'gestionnaire_video', Icone: Film },
  { cle: 'commercial', Icone: Briefcase },
  { cle: 'redacteur_blog', Icone: PenLine },
  { cle: 'gestionnaire_agenda', Icone: CalendarDays },
  { cle: 'responsable_complet', Icone: Crown },
];

const DROITS_CONTENU: { cle: 'creer' | 'modifier' | 'publier' | 'supprimer'; label: string; aide: string }[] = [
  { cle: 'creer', label: 'Créer', aide: 'Déposer une vidéo, un replay, un support, un contenu…' },
  { cle: 'modifier', label: 'Modifier', aide: 'Titre, description, ordre, spécialité, formule…' },
  { cle: 'publier', label: 'Publier', aide: 'Sans ce droit, le dépôt reste « À valider ».' },
  { cle: 'supprimer', label: 'Supprimer', aide: 'Retirer définitivement un contenu.' },
];

const FONCTIONS = ['Enseignant', 'Enseignant référent', 'Monteur vidéo', 'Commercial', 'Rédacteur SEO', 'Responsable pédagogique'];

/** Date locale YYYY-MM-DD dans `mois` mois (jamais toISOString : décalage UTC). */
function dansMois(mois: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + mois);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const emailValide = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

/**
 * Création / modification d'un membre de l'équipe (cahier des charges
 * 18/09/2026, refonte du 05/10/2026) : trois onglets — profil (identité,
 * statut, fin d'accès, 2FA), rôle & droits (rôle modèle, professeur référent,
 * modules cumulables), spécialités (recherche, collèges et sous-collèges,
 * formules) — et, toujours visible, ce que la personne verra réellement,
 * calculé avec les règles des gardes du serveur.
 */
export function CollaborateurDialog({
  mode,
  initial,
  colleges,
}: {
  mode: 'creer' | 'modifier';
  initial?: CollaborateurInitial;
  colleges: CollegeChoix[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [onglet, setOnglet] = useState<Onglet>(mode === 'creer' ? 'profil' : 'droits');

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
  // Tout enseignant est référent par défaut ; l'administrateur décoche ici.
  const [referent, setReferent] = useState(initial?.referent ?? true);
  const [accessEnd, setAccessEnd] = useState(initial?.access_end ?? '');
  const [actif, setActif] = useState(initial?.is_active ?? true);

  const reinitialiser = () => {
    setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setFonction(''); setModele('');
    setModules(modulesVides()); setPerimetre(perimetreVide()); setMfa(false); setReferent(true);
    setAccessEnd(''); setActif(true); setOnglet('profil'); setError(null); setInfo(null);
  };

  const appliquerModele = (r: RoleModele | '') => {
    setModele(r);
    if (r) setModules(structuredClone(ROLES_MODELES[r].modules));
  };
  const majSuivi = (patch: Partial<Modules['suivi']>) => setModules((m) => ({ ...m, suivi: { ...m.suivi, ...patch } }));
  const majContenus = (patch: Partial<Modules['contenus']>) => setModules((m) => ({ ...m, contenus: { ...m.contenus, ...patch } }));
  const majBlog = (patch: Partial<Modules['blog']>) => setModules((m) => ({ ...m, blog: { ...m.blog, ...patch } }));
  const basculerType = (t: ContentType) => majContenus({
    types: modules.contenus.types.includes(t) ? modules.contenus.types.filter((x) => x !== t) : [...modules.contenus.types, t],
  });

  const toutesSpecialites = perimetre.specialites === 'toutes';
  const specialitesChoisies = perimetre.specialites === 'toutes' ? [] : perimetre.specialites;

  // Ce que la personne verra réellement : mêmes règles que les gardes du
  // serveur (`accesOnglets`, `pagesDuScope`, `posteDuScope`).
  const apercu = useMemo(() => {
    const scope = composerScope({ modules, perimetre, referent, modele: modele || null });
    const acces = accesOnglets(scope);
    return {
      pages: pagesDuScope(scope).filter((pg) => pg.href !== PAGE_SECURITE).map((pg) => pg.label),
      questions: acces.qa,
      videos: acces.videos,
      enseignant: estEnseignant(scope),
      poste: posteDuScope(scope),
    };
  }, [modules, perimetre, referent, modele]);

  // Validation par onglet : la pastille de l'onglet signale ce qui manque.
  const manqueProfil = mode === 'creer' && (!firstName.trim() || !lastName.trim() || !emailValide(email));
  const manqueSpecialites = !toutesSpecialites && specialitesChoisies.length === 0;
  // Spécialité limitée à des items sans aucun item coché : elle ne serait pas ouverte.
  const itemsManquants = toutesSpecialites ? [] : specialitesChoisies.filter((c) => perimetre.items?.[c]?.length === 0);
  const aCompleter: Record<Onglet, boolean> = { profil: manqueProfil, droits: false, specialites: manqueSpecialites || itemsManquants.length > 0 };

  const indexOnglet = ONGLETS.findIndex((o) => o.cle === onglet);
  const enregistrer = () => {
    setError(null); setInfo(null);
    if (manqueProfil) { setOnglet('profil'); setError('Renseignez le prénom, le nom et une adresse e-mail valide.'); return; }
    if (manqueSpecialites) { setOnglet('specialites'); setError('Choisissez au moins une spécialité, ou « Toutes les spécialités ».'); return; }
    if (itemsManquants.length > 0) { setOnglet('specialites'); setError('Cochez au moins un item dans chaque spécialité limitée à des items, ou rouvrez-la en entier.'); return; }
    start(async () => {
      const commun = {
        fonction: fonction || null, modele: modele || null, modules, perimetre,
        mfa_obligatoire: mfa, referent, access_end: accessEnd || null, is_active: actif,
      };
      const body = mode === 'creer'
        ? { ...commun, first_name: firstName, last_name: lastName, email, phone: phone || null }
        : { ...commun, userId: initial!.userId };
      const res = await fetchAvecJetonFrais('/api/admin/equipe', body);
      const j = (await res.json().catch(() => ({}))) as { error?: string; warning?: string };
      if (!res.ok) { setError(j.error ?? 'Enregistrement impossible.'); return; }
      if (j.warning) { setInfo(j.warning); router.refresh(); return; }
      setOpen(false);
      if (mode === 'creer') reinitialiser();
      router.refresh();
    });
  };

  const nomAffiche = mode === 'creer'
    ? ([firstName, lastName].filter(Boolean).join(' ') || 'Nouveau collaborateur')
    : ([initial?.first_name, initial?.last_name].filter(Boolean).join(' ') || initial?.email || 'Collaborateur');

  return (
    <>
      <Button size={mode === 'creer' ? 'md' : 'sm'} variant={mode === 'creer' ? 'primary' : 'outline'} onClick={() => setOpen(true)} className="gap-1.5">
        {mode === 'creer' ? <><Plus className="h-4 w-4" /> Nouveau collaborateur</> : <><Pencil className="h-3.5 w-3.5" /> Modifier</>}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[92vh] max-w-5xl flex-col gap-0 overflow-hidden p-0">
          {/* ── En-tête + onglets ── */}
          <div className="border-b border-(--color-border) px-6 pb-0 pt-5">
            <div className="flex items-center gap-3 pr-8">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-(--color-primary-soft) text-sm font-bold text-(--color-primary-deep)">
                {initiales(nomAffiche)}
              </span>
              <div className="min-w-0">
                <DialogTitle className="truncate">{mode === 'creer' ? 'Nouveau collaborateur' : `Permissions de ${nomAffiche}`}</DialogTitle>
                <DialogDescription className="truncate text-xs">
                  {mode === 'modifier' && initial?.email ? `${initial.email} · ` : ''}Des permissions cumulables sur un périmètre précis — jamais administrateur.
                </DialogDescription>
              </div>
            </div>
            <nav className="-mb-px mt-4 flex gap-1 overflow-x-auto" aria-label="Étapes">
              {ONGLETS.map((o, i) => (
                <button
                  key={o.cle}
                  type="button"
                  onClick={() => setOnglet(o.cle)}
                  aria-current={onglet === o.cle ? 'step' : undefined}
                  className={cn(
                    'relative flex shrink-0 items-center gap-2 border-b-2 px-3 pb-2.5 pt-1 text-sm font-semibold transition-colors',
                    onglet === o.cle ? 'border-(--color-primary) text-(--color-ink)' : 'border-transparent text-(--color-ink-muted) hover:text-(--color-ink)',
                  )}
                >
                  <span className={cn('flex h-5 w-5 items-center justify-center rounded-full text-[11px]', onglet === o.cle ? 'bg-(--color-primary) text-white' : 'bg-(--color-surface-soft) text-(--color-ink-soft)')}>
                    {i + 1}
                  </span>
                  {o.titre}
                  {aCompleter[o.cle] && <span className="h-1.5 w-1.5 rounded-full bg-[#E4002B]" aria-label="à compléter" />}
                </button>
              ))}
            </nav>
          </div>

          {/* ── Corps : onglet + résumé ── */}
          <div className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="min-h-0 overflow-y-auto px-6 py-5">
              {onglet === 'profil' && (
                <div className="space-y-6">
                  <Section titre="Identité" icone={<UserRound className="h-4 w-4" />}>
                    {mode === 'creer' ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Champ label="Prénom *"><input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={INPUT} autoComplete="off" /></Champ>
                        <Champ label="Nom *"><input value={lastName} onChange={(e) => setLastName(e.target.value)} className={INPUT} autoComplete="off" /></Champ>
                        <Champ label="E-mail *" aide="L’invitation à créer son mot de passe part à cette adresse.">
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={cn(INPUT, email && !emailValide(email) && 'border-[#E4002B]')} autoComplete="off" />
                        </Champ>
                        <Champ label="Téléphone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className={INPUT} autoComplete="off" /></Champ>
                      </div>
                    ) : (
                      <p className="rounded-xl bg-(--color-surface-soft) px-3 py-2.5 text-sm text-(--color-ink-soft)">{initial?.email}</p>
                    )}
                    <Champ label="Fonction" aide="Intitulé libre, affiché dans la liste et dans l’invitation.">
                      <input value={fonction} onChange={(e) => setFonction(e.target.value)} list="fonctions-equipe" placeholder="Enseignant, monteur vidéo, rédacteur SEO…" className={INPUT} />
                      <datalist id="fonctions-equipe">{FONCTIONS.map((f) => <option key={f} value={f} />)}</datalist>
                    </Champ>
                  </Section>

                  <Section titre="Accès" icone={<KeyRound className="h-4 w-4" />}>
                    <LigneInterrupteur titre="Compte actif" aide="Désactivé : la personne ne peut plus se connecter." actif={actif} onChange={setActif} />
                    <LigneInterrupteur titre="Double authentification obligatoire" aide="La personne active une application d’authentification avant d’entrer dans l’administration." actif={mfa} onChange={setMfa} />
                    <div>
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-(--color-ink)"><CalendarClock className="h-4 w-4 text-(--color-ink-muted)" /> Fin d’accès</p>
                      <p className="mt-0.5 text-xs text-(--color-ink-muted)">Pour un prestataire ou une mission limitée dans le temps.</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <input type="date" value={accessEnd} onChange={(e) => setAccessEnd(e.target.value)} className={cn(INPUT, 'w-auto')} aria-label="Date de fin d’accès" />
                        <Pastille taille="sm" coche={!accessEnd} onChange={() => setAccessEnd('')}>Sans fin</Pastille>
                        <Pastille taille="sm" coche={accessEnd === dansMois(3)} onChange={() => setAccessEnd(dansMois(3))}>3 mois</Pastille>
                        <Pastille taille="sm" coche={accessEnd === dansMois(6)} onChange={() => setAccessEnd(dansMois(6))}>6 mois</Pastille>
                        <Pastille taille="sm" coche={accessEnd === dansMois(12)} onChange={() => setAccessEnd(dansMois(12))}>1 an</Pastille>
                      </div>
                    </div>
                  </Section>
                </div>
              )}

              {onglet === 'droits' && (
                <div className="space-y-6">
                  <Section titre="Point de départ" icone={<SlidersHorizontal className="h-4 w-4" />} aide="Un rôle modèle pré-coche les droits ; ajustez-les ensuite librement.">
                    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                      {ROLES.map(({ cle, Icone }) => (
                        <CarteRole key={cle} actif={modele === cle} onClick={() => appliquerModele(cle)} Icone={Icone} titre={ROLES_MODELES[cle].label} description={ROLES_MODELES[cle].description} />
                      ))}
                      <CarteRole actif={modele === ''} onClick={() => appliquerModele('')} Icone={SlidersHorizontal} titre="Personnalisé" description="Aucun modèle : vous composez les droits vous-même, module par module." />
                    </div>
                  </Section>

                  {/* Professeur référent */}
                  <div className={cn(
                    'rounded-2xl border p-4 transition-colors',
                    !apercu.enseignant ? 'border-(--color-border) bg-(--color-surface-soft)' : referent ? 'border-[#16793C]/40 bg-[#F3FBF5]' : 'border-(--color-border) bg-(--color-surface)',
                  )}>
                    <LigneInterrupteur
                      icone={<GraduationCap className="h-4 w-4 text-[#16793C]" />}
                      titre="Professeur référent"
                      aide={apercu.enseignant
                        ? 'Sur ses spécialités : reçoit par mail et voit les questions des élèves, et dispose de l’onglet « Vidéos » pour déposer à l’avance une vidéo ou un support de cours. Désactivé : ni questions, ni vidéos.'
                        : 'Concerne les enseignants : activez « Vidéos & contenus pédagogiques » avec au moins un type pédagogique (fiches, QCM, DP, QROC, annales, flashcards).'}
                      actif={apercu.enseignant && referent}
                      onChange={setReferent}
                      disabled={!apercu.enseignant}
                    />
                  </div>

                  <Section titre="Modules (cumulables)" icone={<ShieldCheck className="h-4 w-4" />}>
                    <CarteModule Icone={BookOpen} titre={MODULE_LABEL.contenus} resume={resumeContenus(modules.contenus)} actif={modules.contenus.actif} onActif={(v) => majContenus({ actif: v })}>
                      <div>
                        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-(--color-ink-soft)">Types de contenu</span>
                          <span className="flex gap-2 text-[11px] font-semibold">
                            <button type="button" onClick={() => majContenus({ types: [...TYPES_PEDAGOGIQUES] })} className="text-(--color-primary-deep) hover:underline">Tous les types pédagogiques</button>
                            <button type="button" onClick={() => majContenus({ types: [...CONTENT_TYPES] })} className="text-(--color-primary-deep) hover:underline">Tout</button>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {CONTENT_TYPES.map((t) => <Pastille key={t} coche={modules.contenus.types.includes(t)} onChange={() => basculerType(t)}>{CONTENT_TYPE_LABEL[t]}</Pastille>)}
                        </div>
                      </div>
                      <div>
                        <span className="mb-1.5 block text-xs font-semibold text-(--color-ink-soft)">Droits</span>
                        <div className="flex flex-wrap gap-1.5">
                          {DROITS_CONTENU.map((d) => <Pastille key={d.cle} coche={modules.contenus[d.cle]} onChange={(v) => majContenus({ [d.cle]: v })} title={d.aide}>{d.label}</Pastille>)}
                        </div>
                        <p className="mt-1.5 text-[11px] text-(--color-ink-muted)">Sans « Publier », les dépôts de la personne passent « À valider ».</p>
                      </div>
                    </CarteModule>

                    <CarteModule Icone={Users} titre={MODULE_LABEL.suivi} resume={resumeSuivi(modules.suivi)} actif={modules.suivi.actif} onActif={(v) => majSuivi({ actif: v })}>
                      <div className="flex flex-wrap gap-1.5">
                        <Pastille coche={modules.suivi.rediger} onChange={(v) => majSuivi({ rediger: v })} title="Comptes rendus d’appel, statut, prochaine relance.">Renseigner le suivi</Pastille>
                        <Pastille coche={modules.suivi.gerer} onChange={(v) => majSuivi({ gerer: v })} title="Campagnes, créneaux, alertes, réglages du suivi individuel.">Gérer le module</Pastille>
                      </div>
                      <div>
                        <span className="mb-1.5 block text-xs font-semibold text-(--color-ink-soft)">Élèves visibles</span>
                        <div className="grid gap-1.5 sm:grid-cols-3" role="radiogroup" aria-label="Élèves visibles">
                          {(Object.keys(POPULATION_LABEL) as Modules['suivi']['population'][]).map((p) => (
                            <button
                              key={p}
                              type="button"
                              role="radio"
                              aria-checked={modules.suivi.population === p}
                              onClick={() => majSuivi({ population: p })}
                              className={cn(
                                'rounded-xl border px-3 py-2 text-left text-xs font-medium transition-colors',
                                modules.suivi.population === p ? 'border-(--color-primary) bg-(--color-primary-soft)/60 text-(--color-ink)' : 'border-(--color-border) text-(--color-ink-soft) hover:border-(--color-primary)/40',
                              )}
                            >
                              {POPULATION_LABEL[p]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </CarteModule>

                    <CarteModule Icone={Newspaper} titre={MODULE_LABEL.blog} resume={resumeBlog(modules.blog)} actif={modules.blog.actif} onActif={(v) => majBlog({ actif: v })}>
                      <div className="flex flex-wrap gap-1.5">
                        {(['creer', 'modifier_siens', 'modifier_tous', 'publier', 'depublier', 'supprimer'] as const).map((d) => (
                          <Pastille key={d} coche={modules.blog[d]} onChange={(v) => majBlog({ [d]: v })}>{DROIT_BLOG_LABEL[d]}</Pastille>
                        ))}
                      </div>
                      <p className="text-[11px] text-(--color-ink-muted)">Sans « Publier », les articles rejoignent la file « En attente de validation ».</p>
                    </CarteModule>

                    <CarteModule
                      Icone={CalendarDays}
                      titre={MODULE_LABEL.agenda}
                      resume={modules.agenda.actif ? 'Séances, liens de visio, informations élèves' : 'Fermé'}
                      actif={modules.agenda.actif}
                      onActif={(v) => setModules((m) => ({ ...m, agenda: { actif: v } }))}
                    >
                      <p className="text-[11px] text-(--color-ink-muted)">
                        Crée, modifie et supprime les évènements de l’agenda (cours en visio, ECOS…), y ajoute les liens Zoom et les informations pour les élèves, choisit formules, voies et spécialités.
                      </p>
                    </CarteModule>
                  </Section>
                </div>
              )}

              {onglet === 'specialites' && (
                <Section titre="Périmètre" icone={<IconeCarte className="h-4 w-4" />} aide="Les spécialités, puis les formules à l’intérieur de chacune. Un collège coché inclut tous ses sous-collèges.">
                  <SelecteurSpecialites colleges={colleges} perimetre={perimetre} onChange={setPerimetre} />
                </Section>
              )}

              {/* Résumé sous le formulaire sur petit écran */}
              <div className="mt-6 lg:hidden">
                <Resume apercu={apercu} referent={referent} toutes={toutesSpecialites} specialites={specialitesChoisies} nomsPlats={nomsPlats} fonction={fonction} actif={actif} mfa={mfa} accessEnd={accessEnd} />
              </div>
            </div>

            <aside className="hidden min-h-0 overflow-y-auto border-l border-(--color-border) bg-(--color-surface-soft) px-5 py-5 lg:block">
              <Resume apercu={apercu} referent={referent} toutes={toutesSpecialites} specialites={specialitesChoisies} nomsPlats={nomsPlats} fonction={fonction} actif={actif} mfa={mfa} accessEnd={accessEnd} />
            </aside>
          </div>

          {/* ── Pied ── */}
          <div className="flex flex-col gap-2 border-t border-(--color-border) bg-(--color-surface) px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-h-5 text-sm">
              {error && <p className="flex items-center gap-1.5 font-medium text-[#A91D2C]"><AlertTriangle className="h-4 w-4 shrink-0" /> {error}</p>}
              {info && <p className="rounded-xl bg-[#FEF3E2] px-3 py-2 text-[#B26A00]">{info}</p>}
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>Annuler</Button>
              {mode === 'creer' && indexOnglet > 0 && (
                <Button variant="outline" onClick={() => setOnglet(ONGLETS[indexOnglet - 1].cle)} disabled={pending} className="gap-1.5"><ArrowLeft className="h-4 w-4" /> Précédent</Button>
              )}
              {mode === 'creer' && indexOnglet < ONGLETS.length - 1 ? (
                <Button onClick={() => setOnglet(ONGLETS[indexOnglet + 1].cle)} className="gap-1.5">Continuer <ArrowRight className="h-4 w-4" /></Button>
              ) : (
                <Button onClick={enregistrer} disabled={pending} className="gap-1.5">
                  {pending ? <Loader2 className="animate-spin" /> : <Check className="h-4 w-4" />}
                  {mode === 'creer' ? 'Créer et inviter' : 'Enregistrer'}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ─────────────────────────────── morceaux ─────────────────────────────── */

function initiales(nom: string): string {
  const mots = nom.trim().split(/\s+/).filter(Boolean);
  return ((mots[0]?.[0] ?? '') + (mots[1]?.[0] ?? '')).toUpperCase() || '?';
}

function Section({ titre, icone, aide, children }: { titre: string; icone?: React.ReactNode; aide?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="flex items-center gap-2 text-sm font-bold text-(--color-ink)"><span className="text-(--color-ink-muted)">{icone}</span>{titre}</h3>
        {aide && <p className="mt-0.5 text-xs text-(--color-ink-muted)">{aide}</p>}
      </div>
      {children}
    </section>
  );
}

function CarteRole({ actif, onClick, Icone, titre, description }: { actif: boolean; onClick: () => void; Icone: typeof UserRound; titre: string; description: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      className={cn(
        'group flex items-start gap-3 rounded-2xl border p-3 text-left transition-colors focus-ring',
        actif ? 'border-(--color-primary) bg-(--color-primary-soft)/60 shadow-sm' : 'border-(--color-border) bg-(--color-surface) hover:border-(--color-primary)/40',
      )}
    >
      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', actif ? 'bg-(--color-primary) text-white' : 'bg-(--color-surface-soft) text-(--color-ink-soft) group-hover:text-(--color-primary)')}>
        <Icone className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-(--color-ink)">{titre}</span>
        <span className="mt-0.5 line-clamp-3 block text-[11px] leading-snug text-(--color-ink-muted)">{description}</span>
      </span>
    </button>
  );
}

function CarteModule({
  Icone, titre, resume, actif, onActif, children,
}: { Icone: typeof UserRound; titre: string; resume: string; actif: boolean; onActif: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <div className={cn('rounded-2xl border transition-colors', actif ? 'border-(--color-primary)/40 bg-(--color-surface)' : 'border-(--color-border) bg-(--color-surface-soft)')}>
      <div className="flex items-center gap-3 p-3.5">
        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', actif ? 'bg-(--color-primary-soft) text-(--color-primary)' : 'bg-(--color-surface) text-(--color-ink-muted)')}>
          <Icone className="h-4 w-4" />
        </span>
        <button type="button" onClick={() => onActif(!actif)} className="min-w-0 flex-1 text-left">
          <span className="block text-sm font-semibold text-(--color-ink)">{titre}</span>
          <span className="block truncate text-xs text-(--color-ink-muted)">{actif ? resume : 'Désactivé'}</span>
        </button>
        <Interrupteur actif={actif} onChange={onActif} label={titre} />
      </div>
      {actif && <div className="space-y-3 border-t border-(--color-border) px-3.5 py-3">{children}</div>}
    </div>
  );
}

function resumeContenus(c: Modules['contenus']): string {
  const droits = DROITS_CONTENU.filter((d) => c[d.cle]).map((d) => d.label.toLowerCase());
  return `${c.types.length} type${c.types.length > 1 ? 's' : ''} · ${droits.join(', ') || 'consultation seule'}`;
}
function resumeSuivi(s: Modules['suivi']): string {
  return [s.rediger ? 'renseigne' : 'consulte', s.gerer ? 'gère le module' : null].filter(Boolean).join(' · ');
}
function resumeBlog(b: Modules['blog']): string {
  return b.publier ? 'publie ses articles' : 'articles à valider';
}

function Resume({
  apercu, referent, toutes, specialites, nomsPlats, fonction, actif, mfa, accessEnd,
}: {
  apercu: { pages: string[]; questions: boolean; videos: boolean; enseignant: boolean; poste: keyof typeof POSTE_LABEL };
  referent: boolean; toutes: boolean; specialites: string[]; nomsPlats: Map<string, string>;
  fonction: string; actif: boolean; mfa: boolean; accessEnd: string;
}) {
  const noms = specialites.map((id) => nomsPlats.get(id) ?? id);
  return (
    <div className="space-y-4">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-(--color-ink-muted)"><Eye className="h-3.5 w-3.5" /> Ce que la personne verra</p>
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-[#E5F1FF] px-2 py-0.5 text-[11px] font-bold text-[#1E4D8B]">{POSTE_LABEL[apercu.poste]}</span>
        {apercu.enseignant && referent && <span className="inline-flex items-center gap-1 rounded-full bg-[#E7F6EC] px-2 py-0.5 text-[11px] font-bold text-[#16793C]"><GraduationCap className="h-3 w-3" /> Référent</span>}
        {fonction && <span className="text-xs text-(--color-ink-soft)">{fonction}</span>}
      </div>

      <ul className="space-y-2 text-xs">
        <LigneResume ok={apercu.questions} Icone={MessagesSquare} titre="Questions des élèves" detail={apercu.questions ? 'Reçues par mail et visibles, nom et prénom de l’élève' : apercu.enseignant ? 'Non : la case référent est désactivée' : 'Non (réservé aux professeurs référents)'} />
        <LigneResume ok={apercu.videos} Icone={Video} titre="Onglet Vidéos" detail={apercu.videos ? 'Dépôt de vidéos et de supports' : 'Fermé'} />
        <LigneResume ok={toutes || noms.length > 0} Icone={IconeCarte} titre="Spécialités" detail={toutes ? 'Toutes, y compris les futures' : noms.length === 0 ? 'Aucune pour l’instant' : `${noms.slice(0, 4).join(', ')}${noms.length > 4 ? ` +${noms.length - 4}` : ''}`} />
      </ul>

      <div>
        <p className="mb-1.5 text-[11px] font-semibold text-(--color-ink-soft)">Pages ouvertes</p>
        {apercu.pages.length === 0 ? (
          <p className="text-xs text-(--color-ink-muted)">Aucune (seulement la sécurité de son compte).</p>
        ) : (
          <div className="flex flex-wrap gap-1">
            {apercu.pages.map((p) => <span key={p} className="rounded-lg bg-(--color-surface) px-2 py-1 text-[11px] text-(--color-ink-soft) ring-1 ring-(--color-border)">{p}</span>)}
          </div>
        )}
      </div>

      <div className="space-y-1 text-[11px] text-(--color-ink-soft)">
        <p className="flex items-center gap-1.5">{actif ? <Check className="h-3 w-3 text-[#16793C]" /> : <X className="h-3 w-3 text-[#A91D2C]" />} {actif ? 'Compte actif' : 'Compte désactivé'}</p>
        <p className="flex items-center gap-1.5"><KeyRound className="h-3 w-3" /> {mfa ? '2FA obligatoire' : '2FA facultative'}</p>
        <p className="flex items-center gap-1.5"><CalendarClock className="h-3 w-3" /> {accessEnd ? `Accès jusqu’au ${new Date(`${accessEnd}T12:00:00`).toLocaleDateString('fr-FR')}` : 'Sans date de fin'}</p>
      </div>

      <p className="flex items-start gap-1.5 rounded-xl bg-(--color-surface) px-2.5 py-2 text-[11px] leading-snug text-(--color-ink-muted) ring-1 ring-(--color-border)">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#16793C]" />
        Paiements, facturation, configuration, création d’administrateurs et données sensibles restent réservés aux administrateurs.
      </p>
    </div>
  );
}

function LigneResume({ ok, Icone, titre, detail }: { ok: boolean; Icone: typeof UserRound; titre: string; detail: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full', ok ? 'bg-[#E7F6EC] text-[#16793C]' : 'bg-(--color-surface) text-(--color-ink-muted) ring-1 ring-(--color-border)')}>
        <Icone className="h-3 w-3" />
      </span>
      <span>
        <span className="block font-semibold text-(--color-ink)">{titre}</span>
        <span className="block text-(--color-ink-muted)">{detail}</span>
      </span>
    </li>
  );
}
