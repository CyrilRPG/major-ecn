'use client';

import * as React from 'react';
import { Ban, History, Link2Off, Loader2, MessageSquarePlus, Send, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatDateHeure, formatDuree, formatJour, jourParis, heureParis } from '@/lib/decouverte/dates';
import type { Evaluation } from '@/lib/decouverte/moteur';
import type { DroitsDecouverte } from '@/lib/decouverte/droits';
import { ORIGINE_LABEL, REGLE_ATTRIBUTION_LABEL, TYPE_COURT, TYPE_ENVOI_LABEL, dateEnvoi, type CandidatEtat, type EnvoiEtat, type OppositionEtat, type Parametres, type RegleAttribution, type TypeRelance } from '@/lib/decouverte/types';
import { API, appelJson, champ, Libelle, Message, StatutBadge } from './commun';
import type { DemandeDialog } from './envoi-dialog';

/**
 * Fiche candidat (cahier §3, §13, §25) : identité et données, statut et
 * prochaine action avec l'explication « pourquoi », relances R1/R2/R3,
 * timeline complète et non écrasable, notes internes datées, saisie d'une
 * relance déjà faite, relance manuelle (normale ou exceptionnelle confirmée),
 * opposition, révocation des liens.
 */

type Evenement = { id: number; envoi_id: string | null; type: string; survenu_at: string; acteur_nom: string | null; details: Record<string, unknown> };
type Fiche = {
  candidat: CandidatEtat; envois: EnvoiEtat[]; evaluation: Evaluation; evenements: Evenement[];
  liens: Array<{ id: string; envoi_id: string; expire_at: string; revoque_at: string | null; revoque_raison: string | null; nb_acces: number; dernier_usage_at: string | null; created_at: string }>;
  parametres: Parametres; oppositions: OppositionEtat[]; anterieure: { id: string; demande_at: string } | null; posterieures: Array<{ id: string; demande_at: string }>;
  droits: DroitsDecouverte;
  liensActifs?: number;
};

const LIBELLE_EVENEMENT: Record<string, string> = {
  demande: 'Demande d’Offre Découverte',
  nouvelle_demande: 'Nouvelle demande (compte déjà existant)',
  compte_cree: 'Compte créé',
  acces_initial: 'E-mail d’activation initial envoyé (J0)',
  envoi: 'E-mail envoyé',
  envoi_echec: 'Échec d’envoi',
  envoi_exclu: 'Exclu d’un envoi',
  relance_historique: 'Relance déjà faite (saisie / import)',
  relance_ancien_systeme: 'Relance de l’ancien système automatique',
  delivre: 'E-mail délivré',
  ouverture: 'Ouverture (indicative)',
  clic_cta: 'Clic « accéder à mon espace »',
  clic_video: 'Clic vidéo',
  acces_lien: 'Accès ouvert depuis le lien',
  renvoi_lien_demande: 'Nouveau lien demandé par le candidat',
  premiere_connexion: 'Première connexion',
  attribution: 'Attribution de la première connexion',
  desinscription: 'Désinscription / opposition',
  plainte: 'Signalé comme indésirable',
  bounce_hard: 'Rejet définitif (hard bounce)',
  bounce_soft: 'Rejet temporaire (soft bounce)',
  adresse_debloquee: 'Adresse corrigée : blocage levé',
  email_modifie: 'Adresse e-mail modifiée',
  compte_supprime: 'Compte supprimé',
  liens_revoques: 'Liens d’accès révoqués',
  note: 'Note interne',
};

function detailEvenement(e: Evenement, envois: EnvoiEtat[]): string {
  const d = e.details ?? {};
  const env = e.envoi_id ? envois.find((x) => x.id === e.envoi_id) : null;
  const t = (d.type as string | undefined) ?? (d.modele as string | undefined) ?? env?.type;
  const parts: string[] = [];
  if (t && ['envoi', 'envoi_echec', 'envoi_exclu', 'relance_historique', 'clic_cta', 'clic_video', 'ouverture', 'delivre', 'bounce_hard', 'bounce_soft', 'acces_lien', 'attribution'].includes(e.type)) parts.push(TYPE_COURT[t as TypeRelance] ?? t);
  if (e.type === 'envoi' && d.exceptionnel) parts.push('exceptionnelle');
  if (e.type === 'note' && typeof d.texte === 'string') parts.push(d.texte);
  if (typeof d.raison === 'string') parts.push(d.raison);
  if (typeof d.erreur === 'string') parts.push(d.erreur);
  if (typeof d.commentaire === 'string' && d.commentaire) parts.push(`« ${d.commentaire} »`);
  if (e.type === 'email_modifie') parts.push(`${d.ancien} → ${d.nouveau}`);
  if (e.type === 'attribution') {
    parts.push(String(d.motif ?? ''));
    if (typeof d.delai_connexion_sec === 'number') parts.push(`relance → connexion : ${formatDuree(d.delai_connexion_sec)}`);
  }
  if (e.type === 'premiere_connexion' && d.date_approchee) parts.push('date approchée');
  if (e.type === 'acces_initial' && d.date_approchee) parts.push('date approchée (reprise)');
  if (e.type === 'desinscription' && typeof d.source === 'string') parts.push(d.source.replace(/_/g, ' '));
  return parts.filter(Boolean).join(' · ');
}

export function FicheCandidat({ id, onFermer, onRelancer, onChange }: {
  id: string | null;
  onFermer: () => void;
  onRelancer: (d: DemandeDialog) => void;
  onChange: () => void;
}) {
  const [fiche, setFiche] = React.useState<Fiche | null>(null);
  const [erreur, setErreur] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [occupe, setOccupe] = React.useState(false);
  const [note, setNote] = React.useState('');
  const [hist, setHist] = React.useState({ type: 'R1', jour: jourParis(new Date()), heure: heureParis(new Date()), commentaire: '' });
  const [exc, setExc] = React.useState<TypeRelance>('R1');

  const charger = React.useCallback(async () => {
    if (!id) return;
    try {
      const f = await appelJson<Fiche>(`${API}/candidat/${id}`);
      const maintenant = Date.now();
      setFiche({ ...f, liensActifs: f.liens.filter((l) => !l.revoque_at && Date.parse(l.expire_at) > maintenant).length });
      setErreur(null);
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Fiche illisible');
    }
  }, [id]);
  // La fiche est remontée à chaque candidat (clé = identifiant) : aucun état à réinitialiser ici.
  React.useEffect(() => { void Promise.resolve().then(charger); }, [charger]);

  async function action(body: Record<string, unknown>, ok: string) {
    if (!id) return;
    setOccupe(true); setErreur(null); setInfo(null);
    try {
      await appelJson(`${API}/candidat/${id}`, { body });
      setInfo(ok);
      await charger();
      onChange();
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Action impossible');
    } finally {
      setOccupe(false);
    }
  }

  const c = fiche?.candidat, e = fiche?.evaluation, d = fiche?.droits;
  const nom = c ? [c.prenom, c.nom].filter(Boolean).join(' ') || c.email_actuel : '';
  const relances = (fiche?.envois ?? []).filter((x) => x.type !== 'test').sort((a, b) => dateEnvoi(a).localeCompare(dateEnvoi(b)));
  const attribuee = c?.relance_attribuee ? relances.find((x) => x.id === c.relance_attribuee) : null;
  const dueNormale = e && (e.statut === 'ROUGE' || (e.statut === 'VIOLET' && e.prochainType === 'ancien_acces' && e.echue));

  return (
    <Dialog open={!!id} onOpenChange={(o) => { if (!o) onFermer(); }}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">{nom || 'Fiche candidat'} {e && <StatutBadge statut={e.statut} />}</DialogTitle>
          <DialogDescription>{e ? `${e.email}${c?.telephone ? ` · ${c.telephone}` : ''}` : 'Chargement…'}</DialogDescription>
        </DialogHeader>
        <Message erreur={erreur} info={info} />
        {!fiche && !erreur && <p className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Chargement de la fiche…</p>}
        {fiche && c && e && d && (
          <div className="space-y-5">
            {/* Statut et prochaine action */}
            <section className="rounded-xl border border-(--color-border) bg-(--color-surface-soft) p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-(--color-ink)">Prochaine action : {e.prochaineAction}</p>
                {e.echeance && <p className="text-sm text-(--color-ink-soft)">Date : <strong>{formatJour(e.echeance)}</strong></p>}
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-(--color-ink-muted)">Pourquoi</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-(--color-ink-soft)">{e.pourquoi.map((p, i) => <li key={i}>{p}</li>)}</ul>
              {fiche.parametres.pause && <p className="mt-2 text-sm font-medium text-amber-700">Envois en pause (paramètre global) : aucune relance ne peut partir.</p>}
            </section>

            {/* Données */}
            <section>
              <h3 className="mb-2 text-sm font-semibold">Données du candidat</h3>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
                {([
                  ['Spécialité', c.specialite], ['Voie', c.voie], ['Origine de la demande', c.origine === 'formulaire_decouverte' ? 'Formulaire Offre Découverte' : c.origine],
                  ['Session EVC visée', c.session_evc], ['Pays', c.pays],
                  ['Demande', `${formatDateHeure(c.demande_at)}${(c.nb_demandes ?? 1) > 1 ? ` · ${c.nb_demandes} demandes (dernière le ${formatDateHeure(c.derniere_demande_at)})` : ''}`],
                  ['Création du compte', formatDateHeure(c.compte_cree_at)],
                  ['Accès initial (J0)', `${formatDateHeure(e.j0)}${c.acces_initial_approx ? ' (date approchée)' : ''}`],
                  ['Première connexion', e.connecteAt ? `${formatDateHeure(e.connecteAt)}${e.connexionApprochee ? ' (date approchée)' : ''}` : 'Jamais'],
                  ['Dernière connexion', formatDateHeure(c.derniere_connexion_at ?? c.auth_last_sign_in_at) || '—'],
                  ['Relance attribuée', attribuee ? `${TYPE_COURT[attribuee.type]} du ${formatDateHeure(dateEnvoi(attribuee))} · ${REGLE_ATTRIBUTION_LABEL[(c.regle_attribution_appliquee ?? 'dernier_clic') as RegleAttribution] ?? c.regle_attribution_appliquee}` : e.connecteAt ? (c.attribution_calculee_at ? 'Aucune (connexion sans relance dans la fenêtre)' : 'Calcul à la prochaine synchronisation') : '—'],
                  ['Délai relance → clic → connexion', attribuee ? `${c.delai_clic_sec !== null ? `${formatDuree(c.delai_clic_sec)} → ` : ''}${formatDuree(c.delai_connexion_sec)}` : '—'],
                  ['Désinscription / opposition', e.opposition ? `Oui, le ${formatDateHeure(e.opposition.created_at)}` : 'Non'],
                  ['Adresse bloquée', c.email_bloque_adresse ? `${c.email_bloque_adresse} (${c.email_bloque_raison ?? 'rejet définitif'})${e.bloque ? '' : ' — levée : l’adresse a changé'}` : 'Non'],
                  ['Compte', e.compteDetail ?? 'Actif, Offre Découverte'],
                ] as Array<[string, string | null]>).map(([k, v]) => (
                  <div key={k} className="flex gap-2"><dt className="w-44 shrink-0 text-(--color-ink-muted)">{k}</dt><dd className="min-w-0 text-(--color-ink)">{v || '—'}</dd></div>
                ))}
              </dl>
              {(fiche.anterieure || fiche.posterieures.length > 0) && (
                <p className="mt-2 text-xs text-(--color-ink-soft)">
                  {fiche.anterieure && <>Demande antérieure (compte supprimé) du {formatJour(fiche.anterieure.demande_at)}. </>}
                  {fiche.posterieures.length > 0 && <>Nouvelle demande rattachée du {fiche.posterieures.map((p) => formatJour(p.demande_at)).join(', ')}.</>}
                </p>
              )}
            </section>

            {/* Relances */}
            <section>
              <h3 className="mb-2 text-sm font-semibold">E-mails (R1 / R2 / R3, ancien accès, activation)</h3>
              <div className="overflow-x-auto rounded-lg border border-(--color-border)">
                <table className="w-full min-w-[720px] text-xs">
                  <thead className="bg-(--color-surface-soft) text-[10px] uppercase tracking-wide text-(--color-ink-muted)">
                    <tr><th className="px-2 py-1.5 text-left">Type</th><th className="px-2 py-1.5 text-left">Statut</th><th className="px-2 py-1.5 text-left">Date</th><th className="px-2 py-1.5 text-left">Origine</th><th className="px-2 py-1.5 text-left">Suivi</th><th className="px-2 py-1.5 text-left">Identifiant</th></tr>
                  </thead>
                  <tbody>
                    {relances.map((x) => (
                      <tr key={x.id} className="border-t border-(--color-border) align-top">
                        <td className="px-2 py-1.5"><strong>{TYPE_COURT[x.type]}</strong>{x.exceptionnel && <span className="ml-1 rounded bg-amber-100 px-1 text-[10px] text-amber-800">exceptionnelle</span>}{x.modele_version ? <span className="ml-1 text-(--color-ink-muted)">v{x.modele_version}</span> : null}</td>
                        <td className="px-2 py-1.5">{x.statut}{x.erreur && <p className="text-red-700">{x.erreur}</p>}</td>
                        <td className="whitespace-nowrap px-2 py-1.5">{formatDateHeure(dateEnvoi(x))}{x.date_approx ? ' ≈' : ''}</td>
                        <td className="px-2 py-1.5">{ORIGINE_LABEL[x.origine] ?? x.origine}{x.envoye_par_nom ? ` · ${x.envoye_par_nom}` : ''}{x.commentaire && <p className="text-(--color-ink-muted)">{x.commentaire}</p>}</td>
                        <td className="px-2 py-1.5 text-(--color-ink-soft)">
                          {[x.delivre_at && `délivré ${formatDateHeure(x.delivre_at)}`, x.ouvert_at && `ouvert ${formatDateHeure(x.ouvert_at)} (indicatif)`, x.clic_cta_at && `clic plateforme ${formatDateHeure(x.clic_cta_at)}`, x.clic_video_at && `clic vidéo ${formatDateHeure(x.clic_video_at)}`, x.bounce_at && `bounce ${x.bounce_type ?? ''}`, x.plainte_at && 'plainte', x.desinscrit_at && 'désinscription'].filter(Boolean).join(' · ') || '—'}
                        </td>
                        <td className="px-2 py-1.5 font-mono text-[10px] text-(--color-ink-muted)">{x.id.slice(0, 8)}</td>
                      </tr>
                    ))}
                    {relances.length === 0 && <tr><td colSpan={6} className="px-2 py-4 text-center text-(--color-ink-muted)">Aucun e-mail.</td></tr>}
                  </tbody>
                </table>
              </div>
              {fiche.liens.length > 0 && (
                <p className="mt-1 text-xs text-(--color-ink-muted)">{fiche.liensActifs ?? 0} lien(s) d’accès actif(s) sur {fiche.liens.length}.</p>
              )}
            </section>

            {/* Actions */}
            {d.rediger && (
              <section className="space-y-3 rounded-xl border border-(--color-border) p-4">
                <h3 className="text-sm font-semibold">Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" disabled={!dueNormale || fiche.parametres.pause} onClick={() => onRelancer({ type: 'individuel', candidatIds: [c.id] })}>
                    <Send /> Relancer maintenant{e.prochainType ? ` (${TYPE_COURT[e.prochainType]})` : ''}
                  </Button>
                  <span className="inline-flex items-center gap-1">
                    <select className={`${champ} h-9 w-36`} value={exc} onChange={(ev) => setExc(ev.target.value as TypeRelance)} aria-label="Modèle de la relance exceptionnelle">
                      {(['R1', 'R2', 'R3', 'ancien_acces'] as TypeRelance[]).map((t) => <option key={t} value={t}>{TYPE_COURT[t]}</option>)}
                    </select>
                    <Button size="sm" variant="outline" disabled={!!e.connecteAt || !!e.opposition || fiche.parametres.pause} onClick={() => onRelancer({ type: 'exceptionnel', candidatIds: [c.id], typeForce: exc })}>
                      <Zap /> Relance exceptionnelle
                    </Button>
                  </span>
                  <Button size="sm" variant="outline" disabled={occupe} onClick={() => { if (confirm('Révoquer tous les liens d’accès envoyés à ce candidat ?')) void action({ action: 'revoquer_liens' }, 'Liens révoqués.'); }}><Link2Off /> Révoquer les liens</Button>
                  {!e.opposition && (
                    <Button size="sm" variant="danger" disabled={occupe} onClick={() => { const m = prompt('Enregistrer une opposition DÉFINITIVE (aucune relance, aucune réintégration automatique). Motif :'); if (m !== null) void action({ action: 'opposition', commentaire: m }, 'Opposition enregistrée.'); }}><Ban /> Opposition</Button>
                  )}
                </div>

                <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_2fr_auto] sm:items-end">
                  <Libelle label="Relance déjà faite — type">
                    <select className={champ} value={hist.type} onChange={(ev) => setHist({ ...hist, type: ev.target.value })}>
                      <option value="R1">R1</option><option value="R2">R2</option><option value="R3">R3</option><option value="ancien_acces">Ancien accès</option><option value="ancienne_relance">Autre relance</option>
                    </select>
                  </Libelle>
                  <Libelle label="Date"><input type="date" className={champ} value={hist.jour} max={jourParis(new Date())} onChange={(ev) => setHist({ ...hist, jour: ev.target.value })} /></Libelle>
                  <Libelle label="Heure (Paris)"><input type="time" className={champ} value={hist.heure} onChange={(ev) => setHist({ ...hist, heure: ev.target.value })} /></Libelle>
                  <Libelle label="Commentaire"><input className={champ} value={hist.commentaire} maxLength={500} onChange={(ev) => setHist({ ...hist, commentaire: ev.target.value })} placeholder="ex. envoyée depuis Gmail" /></Libelle>
                  <Button size="sm" variant="secondary" disabled={occupe} onClick={() => void action({ action: 'historique', ...hist }, 'Relance enregistrée : prochaine action recalculée.')}><History /> Enregistrer</Button>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <Libelle label="Note interne (datée, non modifiable)" className="flex-1"><textarea className={`${champ} h-16 py-2`} value={note} maxLength={4000} onChange={(ev) => setNote(ev.target.value)} /></Libelle>
                  <Button size="sm" variant="secondary" disabled={occupe || !note.trim()} onClick={() => void action({ action: 'note', texte: note }, 'Note ajoutée.').then(() => setNote(''))}><MessageSquarePlus /> Ajouter la note</Button>
                </div>
              </section>
            )}

            {/* Timeline */}
            <section>
              <h3 className="mb-2 text-sm font-semibold">Timeline complète</h3>
              <ol className="relative space-y-2 border-l border-(--color-border) pl-4">
                {fiche.evenements.map((ev) => (
                  <li key={ev.id} className="relative text-sm">
                    <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border border-(--color-surface) bg-(--color-primary)" />
                    <p><span className="tabular-nums text-(--color-ink-muted)">{formatDateHeure(ev.survenu_at)}</span> — <strong>{LIBELLE_EVENEMENT[ev.type] ?? ev.type}</strong>{ev.acteur_nom ? <span className="text-(--color-ink-muted)"> · par {ev.acteur_nom}</span> : null}</p>
                    {detailEvenement(ev, fiche.envois) && <p className="text-xs text-(--color-ink-soft)">{detailEvenement(ev, fiche.envois)}</p>}
                  </li>
                ))}
                {fiche.evenements.length === 0 && <li className="text-sm text-(--color-ink-muted)">Aucun événement.</li>}
              </ol>
            </section>
            <p className="text-[11px] text-(--color-ink-muted)">Types d’e-mails : {Object.entries(TYPE_ENVOI_LABEL).filter(([k]) => k !== 'test').map(([, v]) => v).join(' · ')}. Les ouvertures ne sont qu’un indicateur ; clics et connexion font foi.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
