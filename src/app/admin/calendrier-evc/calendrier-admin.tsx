'use client';

import Image from 'next/image';
import { Fragment, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowUp, ChevronRight, Eye, EyeOff, Loader2, Plus, Save, Settings2 } from 'lucide-react';
import { isoVersSaisieParis, saisieParisVersIso } from '@/lib/annonces/concours';
import {
  epreuveCapture, etatBandeau, etatCompteur, etatInscriptionEvc, formatJour, jourParis, libelleJ,
} from '@/lib/evc-calendrier/dates';
import type { CalendrierEvc, EpreuveEvc, ReglagesEvc } from '@/lib/evc-calendrier/types';
import { BandeauEvc } from '@/components/marketing/home/home-countdown';
import { HeroCaptureCarte } from '@/components/marketing/home/hero-capture-carte';
import { basculerActif, enregistrerEpreuve, enregistrerReglages, reordonner } from './actions';

/**
 * Écran d'administration du Calendrier EVC : tableau éditable des épreuves
 * (ajout, modification, désactivation, ordre), réglages de session, et aperçu
 * EN DIRECT du bandeau de l'accueil et de la carte de la capture du hero, à une
 * date simulée — pour vérifier chaque état (J-N, veille, Jour J, calendrier à
 * paraître, inscriptions à venir / ouvertes / closes) avant qu'il n'arrive.
 * L'aperçu suit les brouillons non enregistrés.
 */

export type College = { id: string; nom: string };

const inputCls =
  'w-full rounded-md border border-(--color-border) bg-(--color-surface) px-2 py-1.5 text-sm text-(--color-ink) outline-none focus:border-(--color-primary)';
const labelCls = 'mb-1 block text-[11px] font-bold uppercase tracking-wider text-(--color-ink-muted)';

type Brouillon = {
  cle: string;
  id: string | null;
  session: number;
  slug: string;
  nom: string;
  date_epreuve: string;
  postes_interne: string;
  postes_externe: string;
  url_page: string;
  inscription_debut: string;
  inscription_fin: string;
  college_id: string;
  lieu: string;
  note: string;
  ordre: number;
  actif: boolean;
};

function versBrouillon(e: EpreuveEvc): Brouillon {
  return {
    cle: e.id, id: e.id, session: e.session, slug: e.slug, nom: e.nom, date_epreuve: e.date_epreuve ?? '',
    postes_interne: e.postes_interne == null ? '' : String(e.postes_interne),
    postes_externe: e.postes_externe == null ? '' : String(e.postes_externe),
    url_page: e.url_page ?? '', inscription_debut: isoVersSaisieParis(e.inscription_debut), inscription_fin: isoVersSaisieParis(e.inscription_fin),
    college_id: e.college_id ?? '', lieu: e.lieu, note: e.note ?? '', ordre: e.ordre, actif: e.actif,
  };
}

const nombre = (v: string) => (v.trim() === '' ? null : Number.isFinite(Number(v)) ? Math.max(0, Math.round(Number(v))) : null);

function versEpreuve(b: Brouillon): EpreuveEvc {
  return {
    id: b.id ?? b.cle, session: b.session, slug: b.slug, nom: b.nom || b.slug, date_epreuve: /^\d{4}-\d{2}-\d{2}$/.test(b.date_epreuve) ? b.date_epreuve : null,
    postes_interne: nombre(b.postes_interne), postes_externe: nombre(b.postes_externe), url_page: b.url_page || null,
    inscription_debut: b.inscription_debut ? saisieParisVersIso(b.inscription_debut) : null,
    inscription_fin: b.inscription_fin ? saisieParisVersIso(b.inscription_fin) : null,
    college_id: b.college_id || null, lieu: b.lieu || 'Espace Jean Monnet, Rungis', note: b.note || null, ordre: b.ordre, actif: b.actif,
  };
}

type BrouillonReglages = Omit<ReglagesEvc, 'prochaine_inscription_debut' | 'prochaine_inscription_fin' | 'postes_total_interne' | 'postes_total_externe' | 'source_postes'> & {
  prochaine_inscription_debut: string; prochaine_inscription_fin: string;
  postes_total_interne: string; postes_total_externe: string; source_postes: string;
};

function reglagesVersBrouillon(r: ReglagesEvc): BrouillonReglages {
  return {
    ...r,
    prochaine_inscription_debut: isoVersSaisieParis(r.prochaine_inscription_debut),
    prochaine_inscription_fin: isoVersSaisieParis(r.prochaine_inscription_fin),
    postes_total_interne: r.postes_total_interne == null ? '' : String(r.postes_total_interne),
    postes_total_externe: r.postes_total_externe == null ? '' : String(r.postes_total_externe),
    source_postes: r.source_postes ?? '',
  };
}

function brouillonVersReglages(b: BrouillonReglages): ReglagesEvc {
  return {
    ...b,
    prochaine_inscription_debut: b.prochaine_inscription_debut ? saisieParisVersIso(b.prochaine_inscription_debut) : null,
    prochaine_inscription_fin: b.prochaine_inscription_fin ? saisieParisVersIso(b.prochaine_inscription_fin) : null,
    postes_total_interne: nombre(b.postes_total_interne),
    postes_total_externe: nombre(b.postes_total_externe),
    source_postes: b.source_postes || null,
  };
}

const identique = (a: Brouillon, e: EpreuveEvc | undefined) => !!e && JSON.stringify({ ...a, cle: '' }) === JSON.stringify({ ...versBrouillon(e), cle: '' });

export function CalendrierAdmin({
  epreuves, reglages, colleges, rendu,
}: { epreuves: EpreuveEvc[]; reglages: ReglagesEvc; colleges: College[]; rendu: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [lignes, setLignes] = useState<Brouillon[]>(() => epreuves.map(versBrouillon));
  const [r, setR] = useState<BrouillonReglages>(() => reglagesVersBrouillon(reglages));
  const [ouverte, setOuverte] = useState<string | null>(null);
  const nouvelles = useRef(0);
  const [msg, setMsg] = useState<{ ok: boolean; texte: string } | null>(null);
  const [simulee, setSimulee] = useState(() => isoVersSaisieParis(new Date(rendu).toISOString()));
  const sessions = useMemo(() => {
    const s = new Set([reglages.session_en_cours, reglages.session_en_cours + 1, ...lignes.map((l) => l.session)]);
    return [...s].sort((a, b) => a - b);
  }, [lignes, reglages.session_en_cours]);
  const [session, setSession] = useState(reglages.session_en_cours);
  const parId = useMemo(() => new Map(epreuves.map((e) => [e.id, e])), [epreuves]);

  // Aperçu : brouillons compris.
  const calendrier: CalendrierEvc = useMemo(
    () => ({ epreuves: lignes.filter((l) => l.slug).map(versEpreuve), reglages: brouillonVersReglages(r), source: 'base' }),
    [lignes, r],
  );
  const instant = simulee ? Date.parse(saisieParisVersIso(simulee) ?? '') || rendu : rendu;

  const visibles = lignes.filter((l) => l.session === session).sort((a, b) => a.ordre - b.ordre);
  const maj = (cle: string, patch: Partial<Brouillon>) => { setLignes((ls) => ls.map((l) => (l.cle === cle ? { ...l, ...patch } : l))); setMsg(null); };

  const resultat = (res: { ok: boolean; error?: string }, texte: string) => {
    if (!res.ok) { setMsg({ ok: false, texte: res.error ?? 'Erreur.' }); return false; }
    setMsg({ ok: true, texte });
    router.refresh();
    return true;
  };

  const enregistrer = (b: Brouillon) => start(async () => {
    const res = await enregistrerEpreuve({
      id: b.id, session: b.session, slug: b.slug, nom: b.nom, date_epreuve: b.date_epreuve || null,
      postes_interne: nombre(b.postes_interne), postes_externe: nombre(b.postes_externe), url_page: b.url_page || null,
      inscription_debut: b.inscription_debut || null, inscription_fin: b.inscription_fin || null,
      college_id: b.college_id || null, lieu: b.lieu, note: b.note || null, ordre: b.ordre, actif: b.actif,
    });
    if (resultat(res, `« ${b.nom} » enregistrée.`) && 'id' in res && res.id) maj(b.cle, { id: res.id });
  });

  const ajouter = () => {
    const modele = visibles[0];
    nouvelles.current += 1;
    const cle = `nouvelle-${nouvelles.current}`;
    setLignes((ls) => [...ls, {
      cle, id: null, session, slug: '', nom: '', date_epreuve: '', postes_interne: '', postes_externe: '', url_page: '',
      inscription_debut: modele?.inscription_debut ?? '', inscription_fin: modele?.inscription_fin ?? '',
      college_id: '', lieu: 'Espace Jean Monnet, Rungis', note: '', ordre: (visibles.at(-1)?.ordre ?? 0) + 10, actif: true,
    }]);
    setOuverte(cle);
  };

  const deplacer = (cle: string, sens: -1 | 1) => {
    const ordre = visibles.map((l) => l.cle);
    const i = ordre.indexOf(cle);
    const j = i + sens;
    if (j < 0 || j >= ordre.length) return;
    [ordre[i], ordre[j]] = [ordre[j], ordre[i]];
    setLignes((ls) => ls.map((l) => (ordre.includes(l.cle) ? { ...l, ordre: (ordre.indexOf(l.cle) + 1) * 10 } : l)));
    const ids = ordre.map((c) => lignes.find((l) => l.cle === c)?.id).filter((x): x is string => !!x);
    if (ids.length === ordre.length) start(async () => { resultat(await reordonner(ids), 'Ordre enregistré.'); });
  };

  const actif = (b: Brouillon) => {
    if (!b.id) { maj(b.cle, { actif: !b.actif }); return; }
    start(async () => { if (resultat(await basculerActif(b.id!, !b.actif), b.actif ? `« ${b.nom} » désactivée.` : `« ${b.nom} » réactivée.`)) maj(b.cle, { actif: !b.actif }); });
  };

  const sauverReglages = () => start(async () => {
    resultat(await enregistrerReglages({
      session_en_cours: Number(r.session_en_cours), libelle: r.libelle,
      prochaine_inscription_debut: r.prochaine_inscription_debut || null, prochaine_inscription_fin: r.prochaine_inscription_fin || null,
      prochaine_session_publiee: r.prochaine_session_publiee, url_deroule: r.url_deroule, slug_capture_hero: r.slug_capture_hero,
      postes_total_interne: nombre(r.postes_total_interne), postes_total_externe: nombre(r.postes_total_externe), source_postes: r.source_postes || null,
    }), 'Réglages enregistrés.');
  });

  // Résumé textuel de l'aperçu (lisible sans regarder l'image).
  const capture = epreuveCapture(calendrier, instant);
  const compteur = etatCompteur(capture, instant);
  const bandeau = etatBandeau(calendrier, instant);
  const insc = capture ? etatInscriptionEvc(capture, calendrier.reglages, instant) : null;

  return (
    <div className="space-y-8">
      {msg && (
        <p className={`sticky top-2 z-20 rounded-lg px-3 py-2 text-sm font-bold shadow-sm ${msg.ok ? 'bg-[#E9F7EE] text-[#16793C]' : 'bg-[#FDECEC] text-[#B91C1C]'}`}>{msg.texte}</p>
      )}

      {/* ─────────── Aperçu en direct ─────────── */}
      <section className="space-y-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
        <div className="flex flex-wrap items-end gap-3">
          <h2 className="mr-auto flex items-center gap-2 text-base font-bold text-(--color-ink)"><Eye className="h-4 w-4 text-(--color-primary)" /> Aperçu de l’accueil</h2>
          <label className="text-xs text-(--color-ink-soft)">Simuler la date du (heure de Paris)
            <input type="datetime-local" value={simulee} onChange={(e) => setSimulee(e.target.value)} className={`${inputCls} mt-1`} />
          </label>
          <button type="button" onClick={() => setSimulee(isoVersSaisieParis(new Date().toISOString()))} className="rounded-md border border-(--color-border) px-3 py-1.5 text-sm font-semibold">
            Maintenant
          </button>
        </div>
        <p className="text-xs text-(--color-ink-muted)">
          Le {formatJour(jourParis(instant))} : bandeau <strong>{bandeau.etat === 'a_paraitre' ? `« Session ${bandeau.annee} : calendrier à paraître »` : bandeau.etat === 'jour_j' ? `Jour J (${bandeau.epreuves.map((e) => e.nom).join(', ')})` : `${libelleJ(bandeau.jours)} (${bandeau.epreuves.map((e) => e.nom).join(', ')})`}</strong>
          {' · '}capture <strong>{capture ? `${capture.nom} — ${compteur.etat === 'j_moins' ? libelleJ(compteur.jours) : compteur.etat === 'jour_j' ? 'Jour J' : 'compteur masqué'}` : 'aucune ligne pour la spécialité choisie'}</strong>
          {insc && <> · inscriptions <strong>{insc.etat === 'a_venir' ? `à venir (session ${insc.session})` : insc.etat === 'ouverte' ? `ouvertes (session ${insc.session})` : insc.etat === 'close' ? `closes (session ${insc.session})` : 'dates inconnues'}</strong></>}
        </p>
        <div className="overflow-hidden rounded-xl border border-(--color-border)">
          <BandeauEvc calendrier={calendrier} maintenant={instant} />
        </div>
        <div className="mx-auto max-w-3xl">
          <div className="relative aspect-[1504/914] w-full" style={{ containerType: 'inline-size' }}>
            <Image src="/homepage/hero-plateforme-docteur.png" alt="" fill sizes="768px" className="object-contain" />
            <HeroCaptureCarte calendrier={calendrier} maintenant={instant} />
          </div>
        </div>
      </section>

      {/* ─────────── Épreuves ─────────── */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="mr-auto">
            <h2 className="text-base font-bold text-(--color-ink)">Épreuves par spécialité</h2>
            <p className="mt-0.5 max-w-3xl text-xs text-(--color-ink-muted)">
              Une ligne par spécialité et par session. Tout ce qui affiche une date d’épreuve, une période d’inscription ou des
              postes la lit ici : bandeau et capture de l’accueil, section des postes, pages spécialités, fiches concours des
              élèves (collège relié) et planificateur. Une ligne désactivée disparaît partout.
            </p>
          </div>
          <label className="text-xs text-(--color-ink-soft)">Session
            <select value={session} onChange={(e) => setSession(Number(e.target.value))} className={`${inputCls} mt-1`}>
              {sessions.map((s) => <option key={s} value={s}>{s}{s === reglages.session_en_cours ? ' (en cours)' : ''}</option>)}
            </select>
          </label>
          <button type="button" onClick={ajouter} className="inline-flex items-center gap-2 rounded-lg bg-(--color-primary) px-3 py-2 text-sm font-bold text-white">
            <Plus className="h-4 w-4" /> Ajouter une spécialité
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-(--color-border) bg-(--color-surface)">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-(--color-border) text-left text-[11px] font-bold uppercase tracking-wider text-(--color-ink-muted)">
                <th className="px-2 py-2">Ordre</th>
                <th className="px-2 py-2">Spécialité</th>
                <th className="px-2 py-2">Date d’épreuve</th>
                <th className="px-2 py-2">Postes ext.</th>
                <th className="px-2 py-2">Postes int.</th>
                <th className="px-2 py-2">Collège relié</th>
                <th className="px-2 py-2">État</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {visibles.map((b, i) => {
                const modifiee = !b.id || !identique(b, parId.get(b.id));
                const open = ouverte === b.cle;
                return (
                  <Fragment key={b.cle}>
                    <tr className={`border-b border-(--color-border) align-top ${b.actif ? '' : 'opacity-55'}`}>
                      <td className="px-2 py-2">
                        <div className="flex gap-1">
                          <button type="button" disabled={pending || i === 0} onClick={() => deplacer(b.cle, -1)} className="rounded p-1 hover:bg-(--color-sand-100) disabled:opacity-30" aria-label="Monter"><ArrowUp className="h-4 w-4" /></button>
                          <button type="button" disabled={pending || i === visibles.length - 1} onClick={() => deplacer(b.cle, 1)} className="rounded p-1 hover:bg-(--color-sand-100) disabled:opacity-30" aria-label="Descendre"><ArrowDown className="h-4 w-4" /></button>
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <input value={b.nom} onChange={(e) => maj(b.cle, { nom: e.target.value })} className={inputCls} placeholder="Nom affiché" />
                        <input value={b.slug} onChange={(e) => maj(b.cle, { slug: e.target.value.trim().toLowerCase() })} className={`${inputCls} mt-1 font-mono text-xs`} placeholder="slug (ex. medecine-generale)" />
                      </td>
                      <td className="px-2 py-2">
                        <input type="date" value={b.date_epreuve} onChange={(e) => maj(b.cle, { date_epreuve: e.target.value })} className={inputCls} />
                        {b.date_epreuve && <span className="mt-1 block text-[11px] text-(--color-ink-muted)">{formatJour(b.date_epreuve)}</span>}
                      </td>
                      <td className="px-2 py-2"><input type="number" min={0} value={b.postes_externe} onChange={(e) => maj(b.cle, { postes_externe: e.target.value })} className={`${inputCls} w-20`} /></td>
                      <td className="px-2 py-2"><input type="number" min={0} value={b.postes_interne} onChange={(e) => maj(b.cle, { postes_interne: e.target.value })} className={`${inputCls} w-20`} /></td>
                      <td className="px-2 py-2">
                        <select value={b.college_id} onChange={(e) => maj(b.cle, { college_id: e.target.value })} className={inputCls}>
                          <option value="">— aucun —</option>
                          {colleges.map((c) => <option key={c.id} value={c.id}>{c.nom}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        <button type="button" disabled={pending} onClick={() => actif(b)} className="inline-flex items-center gap-1 rounded-full border border-(--color-border) px-2 py-1 text-xs font-bold">
                          {b.actif ? <><Eye className="h-3.5 w-3.5" /> Active</> : <><EyeOff className="h-3.5 w-3.5" /> Désactivée</>}
                        </button>
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center justify-end gap-1">
                          <button type="button" onClick={() => setOuverte(open ? null : b.cle)} className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-semibold text-(--color-ink-soft) hover:bg-(--color-sand-100)">
                            <ChevronRight className={`h-4 w-4 transition-transform ${open ? 'rotate-90' : ''}`} /> Détails
                          </button>
                          <button type="button" disabled={pending || !modifiee} onClick={() => enregistrer(b)} className="inline-flex items-center gap-1 rounded-md bg-(--color-primary) px-2.5 py-1.5 text-xs font-bold text-white disabled:opacity-35">
                            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Enregistrer
                          </button>
                        </div>
                      </td>
                    </tr>
                    {open && (
                      <tr className="border-b border-(--color-border) bg-(--color-sand-100)/40">
                        <td />
                        <td colSpan={7} className="px-2 py-3">
                          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            <label className="block"><span className={labelCls}>Inscriptions — ouverture (Paris)</span>
                              <input type="datetime-local" value={b.inscription_debut} onChange={(e) => maj(b.cle, { inscription_debut: e.target.value })} className={inputCls} />
                            </label>
                            <label className="block"><span className={labelCls}>Inscriptions — clôture (Paris)</span>
                              <input type="datetime-local" value={b.inscription_fin} onChange={(e) => maj(b.cle, { inscription_fin: e.target.value })} className={inputCls} />
                            </label>
                            <label className="block"><span className={labelCls}>Page de la spécialité</span>
                              <input value={b.url_page} onChange={(e) => maj(b.cle, { url_page: e.target.value })} className={inputCls} placeholder="/specialites/…" />
                            </label>
                            <label className="block"><span className={labelCls}>Lieu</span>
                              <input value={b.lieu} onChange={(e) => maj(b.cle, { lieu: e.target.value })} className={inputCls} />
                            </label>
                            <label className="block md:col-span-2"><span className={labelCls}>Mention sur l’accueil (facultatif)</span>
                              <input value={b.note} onChange={(e) => maj(b.cle, { note: e.target.value })} className={inputCls} placeholder="ex. Nouvelle spécialité 2026" />
                            </label>
                            <label className="block"><span className={labelCls}>Session</span>
                              <input type="number" value={b.session} onChange={(e) => maj(b.cle, { session: Number(e.target.value) || b.session })} className={inputCls} />
                            </label>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {visibles.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-sm text-(--color-ink-muted)">Aucune épreuve pour la session {session}. « Ajouter une spécialité » pour publier son calendrier.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ─────────── Réglages de session ─────────── */}
      <section className="space-y-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4">
        <h2 className="flex items-center gap-2 text-base font-bold text-(--color-ink)"><Settings2 className="h-4 w-4 text-(--color-primary)" /> Réglages de session</h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="block"><span className={labelCls}>Session en cours</span>
            <input type="number" value={r.session_en_cours} onChange={(e) => setR({ ...r, session_en_cours: Number(e.target.value) || r.session_en_cours })} className={inputCls} />
          </label>
          <label className="block"><span className={labelCls}>Libellé</span>
            <input value={r.libelle} onChange={(e) => setR({ ...r, libelle: e.target.value })} className={inputCls} />
          </label>
          <label className="block"><span className={labelCls}>Spécialité de la capture du hero</span>
            <select value={r.slug_capture_hero} onChange={(e) => setR({ ...r, slug_capture_hero: e.target.value })} className={inputCls}>
              {[...new Map(lignes.filter((l) => l.slug).map((l) => [l.slug, l.nom])).entries()].map(([slug, nom]) => <option key={slug} value={slug}>{nom}</option>)}
            </select>
          </label>
          <label className="block"><span className={labelCls}>Déroulé de la session en cours (lien)</span>
            <input value={r.url_deroule} onChange={(e) => setR({ ...r, url_deroule: e.target.value })} className={inputCls} />
          </label>
          <label className="block"><span className={labelCls}>Session suivante — inscriptions, ouverture</span>
            <input type="datetime-local" value={r.prochaine_inscription_debut} onChange={(e) => setR({ ...r, prochaine_inscription_debut: e.target.value })} className={inputCls} />
          </label>
          <label className="block"><span className={labelCls}>Session suivante — inscriptions, clôture</span>
            <input type="datetime-local" value={r.prochaine_inscription_fin} onChange={(e) => setR({ ...r, prochaine_inscription_fin: e.target.value })} className={inputCls} />
          </label>
          <label className="flex items-center gap-2 self-end pb-2 text-sm font-semibold text-(--color-ink)">
            <input type="checkbox" checked={r.prochaine_session_publiee} onChange={(e) => setR({ ...r, prochaine_session_publiee: e.target.checked })} />
            Calendrier de la session {Number(r.session_en_cours) + 1} publié
          </label>
          <div />
          <label className="block"><span className={labelCls}>Total postes voie externe</span>
            <input type="number" min={0} value={r.postes_total_externe} onChange={(e) => setR({ ...r, postes_total_externe: e.target.value })} className={inputCls} placeholder="somme des lignes si vide" />
          </label>
          <label className="block"><span className={labelCls}>Total postes voie interne</span>
            <input type="number" min={0} value={r.postes_total_interne} onChange={(e) => setR({ ...r, postes_total_interne: e.target.value })} className={inputCls} placeholder="somme des lignes si vide" />
          </label>
          <label className="block md:col-span-2"><span className={labelCls}>Source des postes</span>
            <input value={r.source_postes} onChange={(e) => setR({ ...r, source_postes: e.target.value })} className={inputCls} placeholder="Arrêté du 12 juin 2026" />
          </label>
        </div>
        <p className="text-[11px] text-(--color-ink-muted)">
          Après la dernière épreuve de la session, tant que le calendrier suivant n’est pas publié, le bandeau affiche
          « Session {Number(r.session_en_cours) + 1} : calendrier à paraître » et la capture masque son compteur. Cocher
          « publié » rend visibles les lignes de la session {Number(r.session_en_cours) + 1}. Après la clôture des inscriptions,
          la carte affiche la période de la session suivante si elle est renseignée.
        </p>
        <div className="flex justify-end">
          <button type="button" disabled={pending} onClick={sauverReglages} className="inline-flex items-center gap-2 rounded-lg bg-(--color-primary) px-4 py-2 text-sm font-bold text-white disabled:opacity-60">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Enregistrer les réglages
          </button>
        </div>
      </section>
    </div>
  );
}

