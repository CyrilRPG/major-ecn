import Link from 'next/link';
import { BarreFiltres, BoutonAction, Carte, EnTete, Pastille, TauxTexte, Vide } from '@/components/admin/qualite/ui';
import { DownloadButton } from '@/components/admin/suivi/ui';
import { estAnalysable, THEMES } from '@/lib/qualite/analyse-regles';
import { filtresVersQuery, lireFiltres } from '@/lib/qualite/filtres';
import { defsFiltres } from '@/lib/qualite/filtres-ui';
import { dateFr } from '@/lib/qualite/format';
import { tauxCommentairesNegatifs, tauxSignalementTheme } from '@/lib/qualite/indicateurs';
import { chargerCommentaires, chargerReponses, groupesRecurrence, nomsCandidats, optionsFiltres } from '@/lib/qualite/serveur/admin';
import {
  CONTENU_TYPE_LABEL, CONTENUS_TYPES, FAMILLE_LABEL, GRAVITE_LABEL, GRAVITES, libelleCategorie, NATURE_COMMENTAIRE_LABEL, NATURES_COMMENTAIRE,
  SENTIMENT_LABEL, SENTIMENTS, type Famille, type Gravite, type NatureCommentaire, type Sentiment,
} from '@/lib/qualite/types';
import { corrigerCommentaireAction, creerActionAction, creerVerificationAction, requalifierReclamationAction } from '../actions';

export const dynamic = 'force-dynamic';

/** Base unique des remarques (§14-§17) et problèmes récurrents (§16). */
export default async function RemarquesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const f = lireFiltres(sp);
  const vue = sp.vue === 'recurrences' ? 'recurrences' : 'liste';
  const focusId = typeof sp.commentaire === 'string' ? sp.commentaire : null;
  const [commentairesTous, opts, reponses] = await Promise.all([chargerCommentaires(focusId ? { ...f, du: null, au: null } : f), optionsFiltres(), chargerReponses({ ...f, sentiment: null, gravite: null, theme: null, categorie: null, q: null })]);
  const commentaires = focusId ? commentairesTous.filter((c) => c.id === focusId) : commentairesTous;
  const groupes = vue === 'recurrences' ? await groupesRecurrence(f) : [];
  const noms = await nomsCandidats(commentaires.slice(0, 300).map((c) => c.user_id ?? ''));
  const repondants = new Set(reponses.map((r) => r.user_id).filter((x): x is string => !!x));
  const themesSignales = THEMES.map((t) => ({ t, taux: tauxSignalementTheme(t.cle, commentaires, repondants) })).filter((x) => x.taux.n > 0).sort((a, b) => b.taux.n - a.taux.n);
  const optTheme = THEMES.map((t) => ({ v: t.cle, l: t.libelle }));
  const lienVue = (v: string) => `/admin/qualite/remarques${filtresVersQuery(f, { vue: v === 'liste' ? null : v })}`;
  return (
    <>
      <EnTete
        titre="Remarques des candidats"
        description="Tous les commentaires libres des enquêtes, avec leur texte original (jamais modifié) et leur classification automatique, corrigeable. Un commentaire négatif reste négatif même avec une note élevée."
        action={<DownloadButton href={`/api/admin/qualite/export${filtresVersQuery(f, { type: 'commentaires', format: 'xlsx' })}`} filename="remarques.xlsx" label="Exporter (Excel)" />}
      />
      <BarreFiltres filtres={defsFiltres(opts, ['du', 'au', 'famille', 'college', 'voie', 'promotion', 'enseignant', 'categorie', 'theme', 'sentiment', 'gravite', 'q'])} />
      <div className="mb-4 flex gap-2 text-sm">
        <Link href={lienVue('liste')} className={vue === 'liste' ? 'font-semibold text-(--color-primary)' : 'text-(--color-ink-soft)'}>Liste ({commentaires.length})</Link>
        <span className="text-(--color-ink-muted)">·</span>
        <Link href={lienVue('recurrences')} className={vue === 'recurrences' ? 'font-semibold text-(--color-primary)' : 'text-(--color-ink-soft)'}>Problèmes récurrents</Link>
      </div>
      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <Carte titre="Taux de commentaires négatifs" description="Réponses avec au moins un commentaire négatif ou mixte / réponses avec un commentaire analysable.">
          <p className="text-lg"><TauxTexte t={tauxCommentairesNegatifs(commentaires, estAnalysable)} inverse /></p>
        </Carte>
        <Carte titre="Taux de signalement par thème" description="Candidats distincts ayant signalé le thème / candidats ayant répondu.">
          {themesSignales.length === 0 ? <Vide>—</Vide> : (
            <ul className="flex max-h-40 flex-col gap-1 overflow-y-auto text-sm">
              {themesSignales.map(({ t, taux }) => <li key={t.cle} className="flex justify-between gap-2"><Link href={`/admin/qualite/remarques${filtresVersQuery({ ...f, theme: t.cle })}`} className="hover:underline">{t.libelle}</Link><TauxTexte t={taux} /></li>)}
            </ul>
          )}
        </Carte>
      </div>

      {vue === 'recurrences' ? (
        <Carte titre="Regroupements par thème" description="Global, par enseignant et par contenu. Seuil d'alerte : voir Paramètres.">
          {groupes.length === 0 ? <Vide>Aucune remarque négative classée par thème.</Vide> : (
            <ul className="divide-y divide-(--color-border) text-sm">
              {groupes.slice(0, 80).map((g) => (
                <li key={g.cle} className="flex flex-wrap items-start justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium">{g.themeLibelle}{g.cibleLabel ? <span className="text-(--color-ink-soft)"> — {g.portee === 'enseignant' ? 'enseignant' : 'contenu'} : {g.cibleLabel}</span> : <span className="text-(--color-ink-muted)"> (toutes séances)</span>}</p>
                    <p className="text-xs text-(--color-ink-muted)">{g.candidats} candidat(s) distinct(s) · {g.commentaires.length} remarque(s) · {g.seances.length} séance(s) · du {dateFr(g.premier)} au {dateFr(g.dernier)}</p>
                    <p className="text-xs text-(--color-ink-muted)">Évolution hebdomadaire : {g.evolution.map((e) => e.n).join(' · ')}</p>
                    <Link className="text-xs text-(--color-primary) hover:underline" href={`/admin/qualite/remarques${filtresVersQuery({ ...f, theme: g.themeCle, enseignant: g.portee === 'enseignant' ? g.cible : f.enseignant })}`}>Voir les remarques à l’origine du regroupement</Link>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {g.depasseSeuil ? <Pastille ton="recurrence">Seuil atteint ({g.candidatsFenetre})</Pastille> : <Pastille ton="neutre">{g.candidatsFenetre} sur la fenêtre</Pastille>}
                    <BoutonAction label="Action corrective" variant="ghost" action={creerActionAction} champs={[
                      { nom: 'titre', label: 'Titre', requis: true, defaut: g.themeLibelle + (g.cibleLabel ? ` — ${g.cibleLabel}` : '') },
                      { nom: 'probleme', label: 'Problème constaté', type: 'long', requis: true, defaut: `${g.candidats} candidats ont signalé « ${g.themeLibelle.toLowerCase()} » (${g.commentaires.length} remarques).` },
                      { nom: 'cible_type', label: 'Cible', type: 'select', requis: true, defaut: g.portee === 'global' ? 'theme' : g.portee, options: [{ v: 'theme', l: 'Thème' }, { v: 'enseignant', l: 'Enseignant' }, { v: 'contenu', l: 'Contenu' }] },
                      { nom: 'cible_cle', label: 'Clé de la cible', defaut: g.cible ?? g.themeCle },
                      { nom: 'cible_label', label: 'Libellé de la cible', defaut: g.cibleLabel ?? g.themeLibelle },
                      { nom: 'theme_cle', label: 'Thème', type: 'select', defaut: g.themeCle, options: optTheme },
                      { nom: 'commentaires', label: 'Remarques liées (identifiants)', defaut: g.commentaires.slice(0, 100).join(',') },
                      { nom: 'echeance', label: 'Échéance', type: 'date' },
                    ]} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Carte>
      ) : (
        <Carte titre={`${commentaires.length} remarque(s)`}>
          {commentaires.length === 0 ? <Vide>Aucune remarque pour ces filtres.</Vide> : (
            <ul className="divide-y divide-(--color-border)">
              {commentaires.slice(0, 300).map((c) => (
                <li key={c.id} className="py-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-wrap text-sm text-(--color-ink)">« {c.texte} »</p>
                      <p className="mt-1 text-xs text-(--color-ink-muted)">
                        {c.user_id ? <Link href={`/admin/qualite/candidats/${c.user_id}`} className="hover:underline">{noms.get(c.user_id)?.nom ?? 'Candidat'}</Link> : 'Candidat supprimé'}
                        {' · '}{FAMILLE_LABEL[c.famille as Famille] ?? c.famille} · {c.question_libelle}{c.note_associee ? ` · note ${c.note_associee}/5` : ''}{c.enseignant_nom ? ` · ${c.enseignant_nom}` : ''} · {dateFr(c.created_at, true)}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {c.sentiment && <Pastille ton={c.sentiment}>{SENTIMENT_LABEL[c.sentiment as Sentiment]}</Pastille>}
                        {c.gravite && c.gravite !== 'faible' && <Pastille ton={c.gravite === 'critique' ? 'critique' : 'vigilance'}>{GRAVITE_LABEL[c.gravite as Gravite]}</Pastille>}
                        {c.theme_libelle && <Pastille ton="recurrence">{c.theme_libelle}</Pastille>}
                        {c.categories.map((k) => <Pastille key={k} ton="neutre">{libelleCategorie(k)}</Pastille>)}
                        {c.nature !== 'remarque' && <Pastille ton="critique">{NATURE_COMMENTAIRE_LABEL[c.nature as NatureCommentaire]}</Pastille>}
                        {c.contenu_type && <Pastille ton="neutre">{CONTENU_TYPE_LABEL[c.contenu_type as keyof typeof CONTENU_TYPE_LABEL]}{c.contenu_label ? ` : ${c.contenu_label}` : ''}</Pastille>}
                        {c.demande_intervention && <Pastille ton="vigilance">Demande d’intervention</Pastille>}
                        <span className="text-[11px] text-(--color-ink-muted)">classé par {c.analyse_source === 'manuel' ? 'l’administration' : c.analyse_source === 'ia' ? 'l’IA' : 'les règles'}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <BoutonAction label="Corriger" variant="ghost" action={corrigerCommentaireAction.bind(null, c.id)} champs={[
                        { nom: 'sentiment', label: 'Sentiment', type: 'select', defaut: c.sentiment ?? '', options: SENTIMENTS.map((s) => ({ v: s, l: SENTIMENT_LABEL[s] })) },
                        { nom: 'theme_cle', label: 'Thème', type: 'select', defaut: c.theme_cle ?? '', options: optTheme },
                        { nom: 'categories', label: 'Catégories (codes séparés par des virgules)', defaut: c.categories.join(',') },
                        { nom: 'gravite', label: 'Gravité', type: 'select', defaut: c.gravite ?? '', options: GRAVITES.map((g) => ({ v: g, l: GRAVITE_LABEL[g] })) },
                        { nom: 'nature', label: 'Nature', type: 'select', requis: true, defaut: c.nature, options: NATURES_COMMENTAIRE.map((n) => ({ v: n, l: NATURE_COMMENTAIRE_LABEL[n] })) },
                        { nom: 'contenu_type', label: 'Contenu concerné', type: 'select', defaut: c.contenu_type ?? '', options: CONTENUS_TYPES.map((t) => ({ v: t, l: CONTENU_TYPE_LABEL[t] })) },
                        { nom: 'contenu_label', label: 'Désignation du contenu', defaut: c.contenu_label ?? '' },
                        { nom: 'contenu_id', label: 'Identifiant du contenu (facultatif)', defaut: c.contenu_id ?? '' },
                      ]} />
                      {!c.reclamation_id && <BoutonAction label="Réclamation" variant="ghost" action={requalifierReclamationAction.bind(null, c.id)} champs={[
                        { nom: 'sujet', label: 'Sujet', defaut: c.texte.slice(0, 100) },
                        { nom: 'priorite', label: 'Priorité', type: 'select', requis: true, defaut: 'normale', options: [{ v: 'basse', l: 'Basse' }, { v: 'normale', l: 'Normale' }, { v: 'haute', l: 'Haute' }, { v: 'urgente', l: 'Urgente' }] },
                        { nom: 'motif', label: 'Motif de la requalification', type: 'long' },
                      ]} />}
                      {c.reclamation_id && <Link href={`/admin/qualite/reclamations?id=${c.reclamation_id}`} className="self-center text-xs text-(--color-primary)">Réclamation</Link>}
                      <BoutonAction label="Vérifier le contenu" variant="ghost" action={creerVerificationAction} champs={[
                        { nom: 'nature', label: 'Nature', type: 'select', requis: true, defaut: c.theme_cle === 'contenu_non_actualise' ? 'actualisation' : 'erreur', options: [{ v: 'erreur', l: 'Erreur signalée' }, { v: 'actualisation', l: 'Actualisation scientifique' }, { v: 'imprecision', l: 'Imprécision' }, { v: 'autre', l: 'Autre' }] },
                        { nom: 'contenu_type', label: 'Type de contenu', type: 'select', requis: true, defaut: c.contenu_type ?? 'autre', options: CONTENUS_TYPES.map((t) => ({ v: t, l: CONTENU_TYPE_LABEL[t] })) },
                        { nom: 'contenu_label', label: 'Contenu concerné', requis: true, defaut: c.contenu_label ?? '' },
                        { nom: 'demande', label: 'Nature de la demande', type: 'long', requis: true, defaut: c.texte },
                        { nom: 'source_citee', label: 'Recommandation ou source citée' },
                        { nom: 'responsable_nom', label: 'Relecteur responsable' },
                        { nom: 'commentaires', label: 'Remarques liées', defaut: c.id },
                      ]} />
                      <BoutonAction label="Action" variant="ghost" action={creerActionAction} champs={[
                        { nom: 'titre', label: 'Titre', requis: true, defaut: c.theme_libelle ?? c.texte.slice(0, 80) },
                        { nom: 'probleme', label: 'Problème constaté', type: 'long', requis: true, defaut: c.texte },
                        { nom: 'cible_type', label: 'Cible', type: 'select', requis: true, defaut: c.enseignant_cle ? 'enseignant' : 'global', options: [{ v: 'enseignant', l: 'Enseignant' }, { v: 'seance', l: 'Séance' }, { v: 'contenu', l: 'Contenu' }, { v: 'theme', l: 'Thème' }, { v: 'plateforme', l: 'Plateforme' }, { v: 'organisation', l: 'Organisation' }, { v: 'global', l: 'Global' }] },
                        { nom: 'cible_cle', label: 'Clé de la cible', defaut: c.enseignant_cle ?? '' },
                        { nom: 'cible_label', label: 'Libellé de la cible', defaut: c.enseignant_nom ?? '' },
                        { nom: 'theme_cle', label: 'Thème', type: 'select', defaut: c.theme_cle ?? '', options: optTheme },
                        { nom: 'commentaire_id', label: 'Remarque liée', defaut: c.id },
                      ]} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {commentaires.length > 300 && <p className="mt-2 text-xs text-(--color-ink-muted)">300 premières affichées ; affinez les filtres ou exportez.</p>}
        </Carte>
      )}
    </>
  );
}
