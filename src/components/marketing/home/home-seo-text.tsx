import Link from 'next/link';
import type { ReactNode } from 'react';
import { CALENDRIER_ARTICLE } from './evc-calendrier-2026';
import { BORDER, INK_SOFT, JAKARTA, MANROPE, NAVY, RED } from './home-ui';
import {
  bornesSession, ecartJours, epreuveParSlug, epreuvesSession, etatInscriptionEvc, formatInstantParis, formatJour,
  nombreFr, totauxPostes,
} from '@/lib/evc-calendrier/dates';
import type { CalendrierEvc, EpreuveEvc } from '@/lib/evc-calendrier/types';

/* ============================================================
   TEXTE DE BAS DE PAGE — rédigé, pas du remplissage : la réforme
   voie interne / voie externe, les chiffres de la session 2026 et
   le déroulé du concours. Rendu côté serveur (pas de 'use client')
   pour être présent tel quel dans le HTML servi.

   Chiffres et dates : table `evc_calendrier` (et ses réglages), jamais
   écrits en dur — la prose se recompose si le calendrier change.
   ============================================================ */

/** « A, B et C » */
function liste(morceaux: ReactNode[]): ReactNode[] {
  return morceaux.flatMap((m, i) => (i === 0 ? [m] : [i === morceaux.length - 1 ? ' et ' : ', ', m]));
}

/** Nom inséré dans une phrase (« la pédiatrie », « l’oncologie », « la MIPIC »). */
function enPhrase(e: EpreuveEvc): string {
  if (e.slug === 'medecine-interne') return 'la MIPIC';
  const nom = `${e.nom.charAt(0).toLowerCase()}${e.nom.slice(1)}`;
  return /^[aeiouyàâéèêîôh]/i.test(nom) ? `l’${nom}` : `la ${nom}`;
}

/** « mercredi 17 juin 2026 » → « 17 juin 2026 » */
const sansJourSemaine = (jour: string) => jour.replace(/^\S+ /, '');

function N({ children }: { children: ReactNode }) {
  return <strong style={{ color: NAVY }}>{children}</strong>;
}

export function HomeSeoText({ calendrier, maintenant }: { calendrier: CalendrierEvc; maintenant: number }) {
  const session = calendrier.reglages.session_en_cours;
  const lignes = epreuvesSession(calendrier);
  const totaux = totauxPostes(calendrier);
  const bornes = bornesSession(lignes);
  const source = calendrier.reglages.source_postes;
  const sourceEnPhrase = source ? `${source.charAt(0).toLowerCase()}${source.slice(1)}` : null;

  // Postes de la voie externe, du plus au moins doté.
  const externe = lignes.filter((e) => (e.postes_externe ?? 0) > 0).sort((a, b) => b.postes_externe! - a.postes_externe!);
  const [premiere, seconde] = externe;
  const bas = externe.length > 4 ? externe.slice(-2) : [];
  const milieu = externe.slice(2, externe.length - bas.length);
  const deuxNouvelles = !!premiere && !!seconde
    && [premiere.slug, seconde.slug].sort().join() === ['medecine-interne', 'psychiatrie'].join();

  // Déroulé : ouverture, quelques jalons, clôture.
  const datees = lignes.filter((e) => e.date_epreuve);
  const ouvre = datees[0];
  const ferme = datees.length > 1 ? datees[datees.length - 1] : undefined;
  const jalons = ['psychiatrie', 'geriatrie', 'medecine-interne']
    .map((s) => epreuveParSlug(calendrier, s))
    .filter((e): e is EpreuveEvc => !!e?.date_epreuve && e.session === session && e.slug !== ouvre?.slug && e.slug !== ferme?.slug)
    .sort((a, b) => a.date_epreuve!.localeCompare(b.date_epreuve!));
  const semaines = bornes ? Math.floor(ecartJours(bornes.premiere, bornes.derniere) / 7) : 0;

  // Inscriptions : le temps du verbe suit l'état réel de la période de la session.
  const reference = epreuveParSlug(calendrier, calendrier.reglages.slug_capture_hero) ?? lignes[0];
  const insc = reference
    ? etatInscriptionEvc(reference, { session_en_cours: session, prochaine_inscription_debut: null, prochaine_inscription_fin: null }, maintenant)
    : null;
  const debutInsc = reference?.inscription_debut ? sansJourSemaine(formatInstantParis(reference.inscription_debut).jour) : null;
  const finInsc = reference?.inscription_fin ? sansJourSemaine(formatInstantParis(reference.inscription_fin).jour) : null;
  const verbeInsc = insc?.etat === 'close' ? 'se sont tenues' : insc?.etat === 'a_venir' ? 'se tiendront' : 'se tiennent';

  return (
    <section className="py-14 sm:py-16" style={{ fontFamily: JAKARTA, background: '#FBFBFD' }}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-[1.5rem] font-black leading-tight tracking-tight sm:text-[1.9rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
          Comprendre les EVC {session}&nbsp;: voie interne, voie externe et procédure d’autorisation d’exercice
        </h2>
        <span aria-hidden className="mt-4 block h-[2px] w-14" style={{ background: RED }} />

        <div className="mt-7 space-y-5 text-[14.5px] leading-relaxed" style={{ color: INK_SOFT, fontFamily: MANROPE }}>
          <p>
            Les <strong style={{ color: NAVY }}>Épreuves de Vérification des Connaissances (EVC)</strong> constituent
            le passage obligé de la <strong style={{ color: NAVY }}>procédure d’autorisation d’exercice (PAE)</strong> pour
            les praticiens à diplôme hors Union européenne. Organisées par le Centre national de gestion (CNG), elles
            décident, chaque année, de l’accès au plein exercice de la médecine en France. Depuis la session 2026, elles
            se présentent sous deux formes distinctes — la voie interne et la voie externe — dont les publics, les
            formats d’épreuve et les volumes de postes n’ont rien de commun. Choisir sa voie, puis sa spécialité, est
            devenu la première décision stratégique d’une préparation.
          </p>

          <h3 className="pt-3 text-[1.05rem] font-black tracking-tight" style={{ color: NAVY, fontFamily: JAKARTA }}>
            La voie interne&nbsp;: une épreuve unique de QCM pour les praticiens déjà en poste
          </h3>
          <p>
            La voie interne s’adresse aux praticiens à diplôme étranger qui exercent déjà en France depuis au moins deux
            ans en équivalent temps plein. Elle repose sur une <strong style={{ color: NAVY }}>épreuve unique de deux heures,
            entièrement composée de questions à choix multiples</strong> — questions à réponse unique et questions à réponses
            multiples. C’est la voie la plus dotée&nbsp;: <strong style={{ color: NAVY }}>{nombreFr(totaux.interne)} postes de médecins</strong> pour
            la session {session}. Cette abondance apparente ne doit pas tromper. L’épreuve ne teste pas la pratique
            quotidienne mais la capacité à répondre à des QCM calibrés sur les recommandations françaises en vigueur,
            dans un temps contraint et selon une logique de notation qui ne pardonne pas l’approximation. Chaque année,
            des praticiens expérimentés y échouent&nbsp;: non par méconnaissance médicale, mais parce qu’ils n’ont pas
            travaillé la construction et la correction d’un QCM d’EVC.{' '}
            <Link href="/blog/voie-interne-evc-logique-qcm" className="font-bold underline underline-offset-2" style={{ color: RED }}>
              Notre guide de la voie interne
            </Link>{' '}
            détaille cette logique.
          </p>

          <h3 className="pt-3 text-[1.05rem] font-black tracking-tight" style={{ color: NAVY, fontFamily: JAKARTA }}>
            La voie externe&nbsp;: deux épreuves rédactionnelles, {totaux.specialitesExterne} spécialités
          </h3>
          <p>
            La voie externe est ouverte à tous les candidats, sans condition d’exercice préalable en France. Elle
            comporte deux épreuves distinctes passées le même jour&nbsp;: l’<strong style={{ color: NAVY }}>EVCF</strong>,
            qui porte sur les connaissances fondamentales sous forme de questions à réponse ouverte et courte (QROC), et
            l’<strong style={{ color: NAVY }}>EVCP</strong>, consacrée aux connaissances pratiques à travers des dossiers
            cliniques — deux heures chacune. Le format change tout&nbsp;: il ne s’agit plus de reconnaître la bonne
            proposition mais de la produire, avec les mots-clés attendus, une réponse hiérarchisée et, lorsqu’ils
            s’appliquent, les éléments dont l’absence annule la question. La session {session} ouvre{' '}
            <strong style={{ color: NAVY }}>{nombreFr(totaux.externe)} postes de médecins répartis entre {totaux.specialitesExterne} spécialités</strong>
            {sourceEnPhrase ? <>, chiffres fixés par l’{sourceEnPhrase}</> : null}.
          </p>

          <h3 className="pt-3 text-[1.05rem] font-black tracking-tight" style={{ color: NAVY, fontFamily: JAKARTA }}>
            Où se situent les postes, et pourquoi leur nombre ne suffit pas
          </h3>
          <p>
            {premiere && seconde && (
              <>
                En voie externe, deux spécialités dominent nettement la session&nbsp;: {enPhrase(premiere)}{' '}
                avec <N>{premiere.postes_externe} postes</N> et {enPhrase(seconde)} avec <N>{seconde.postes_externe} postes</N>.{' '}
                {deuxNouvelles && (
                  <>
                    Toutes deux sont nouvelles en 2026 et accessibles sans diplôme de spécialité obtenu dans le pays
                    d’origine, ce qui ouvre une possibilité concrète à des généralistes exerçant depuis des années en
                    milieu hospitalier polyvalent ou en psychiatrie.{' '}
                  </>
                )}
              </>
            )}
            {milieu.length > 0 && (
              <>Viennent ensuite {liste(milieu.map((e, i) => <span key={e.slug}>{enPhrase(e)} ({e.postes_externe}{i === 0 ? ' postes' : ''})</span>))}.{' '}</>
            )}
            {bas.length > 0 && (
              <>En bas de tableau, {liste(bas.map((e) => <span key={e.slug}>{enPhrase(e)} ({e.postes_externe})</span>))} restent très étroites.{' '}</>
            )}
            Mais un nombre de
            postes élevé attire mécaniquement davantage de candidats&nbsp;: c’est le{' '}
            <Link href="/blog/evc-ratio-candidats-postes-choix-specialite-2026" className="font-bold underline underline-offset-2" style={{ color: RED }}>
              ratio candidats/postes
            </Link>{' '}
            qui détermine la sélectivité réelle, pas le volume brut.
          </p>

          <h3 className="pt-3 text-[1.05rem] font-black tracking-tight" style={{ color: NAVY, fontFamily: JAKARTA }}>
            Le calendrier de la session {session}
          </h3>
          <p>
            {debutInsc && finInsc && (
              <>
                Les inscriptions {verbeInsc} du {debutInsc} au {finInsc}, exclusivement en ligne sur cng.sante.fr, avec
                une règle stricte&nbsp;: une seule candidature, toute double inscription entraînant le rejet définitif
                des deux dossiers.{' '}
              </>
            )}
            {bornes && (
              <>
                Contrairement à une idée répandue, les épreuves ne se tiennent pas toutes le même mois&nbsp;: elles{' '}
                <N>s’étalent du {formatJour(bornes.premiere, { semaine: false })} au {formatJour(bornes.derniere, { semaine: false })}</N>,
                à l’Espace Jean Monnet de Rungis (Val-de-Marne), en présentiel uniquement.{' '}
              </>
            )}
            <N>Chaque spécialité a sa propre date</N>, la même pour les deux voies
            {ouvre && ferme ? (
              <>
                &nbsp;: {enPhrase(ouvre)} ouvre la session le {formatJour(ouvre.date_epreuve!, { semaine: false, annee: false })}
                {jalons.map((e) => <span key={e.slug}>, {enPhrase(e)} compose le {formatJour(e.date_epreuve!, { semaine: false, annee: false })}</span>)}
                {' '}et {enPhrase(ferme)} la ferme le {formatJour(ferme.date_epreuve!, { semaine: false })}.{' '}
                {semaines > 1 && <>Plus de {semaines} semaines séparent donc le premier candidat du dernier — autant de temps de préparation en plus ou en moins.{' '}</>}
              </>
            ) : '. '}
            Les candidats venant de l’étranger doivent anticiper visa et hébergement&nbsp;; les résultats et
            l’affectation interviennent au premier trimestre {session + 1}. Le{' '}
            <Link href={`/blog/${CALENDRIER_ARTICLE}`} className="font-bold underline underline-offset-2" style={{ color: RED }}>
              calendrier détaillé par spécialité
            </Link>{' '}
            donne la date de chaque épreuve, et le{' '}
            <Link href="/blog/calendrier-inscription-concours-pae-2026-cng" className="font-bold underline underline-offset-2" style={{ color: RED }}>
              calendrier d’inscription du CNG
            </Link>{' '}
            détaille les étapes du dossier.
          </p>

          <h3 className="pt-3 text-[1.05rem] font-black tracking-tight" style={{ color: NAVY, fontFamily: JAKARTA }}>
            Préparer les EVC avec Major ECN
          </h3>
          <p>
            Depuis 2011, Major ECN accompagne les praticiens à diplôme étranger dans cette préparation et a suivi plus
            de 9 000 médecins. Nos contenus sont construits voie par voie et spécialité par spécialité&nbsp;: banque de
            QCM et de QROC corrigés, cas cliniques et dossiers, annales EVC commentées, fiches de synthèse, flashcards,
            épreuves blanches dans les conditions du concours et suivi de progression. Les enseignements sont assurés
            par des praticiens hospitaliers, des chefs de clinique-assistants et des médecins spécialistes en exercice.
            L’objectif n’est pas d’accumuler du contenu, mais de vous permettre de déterminer ce qu’il faut réellement
            maîtriser, jusqu’où approfondir et comment restituer vos connaissances le jour de l’épreuve.
          </p>
        </div>

        <p className="mt-8 border-t pt-6 text-[12.5px] leading-relaxed" style={{ borderColor: BORDER, color: INK_SOFT, fontFamily: MANROPE }}>
          Chiffres de postes et calendrier issus des textes et publications officiels de la session {session}
          ({sourceEnPhrase ? `${sourceEnPhrase}, ` : ''}Centre national de gestion). Les modalités peuvent évoluer&nbsp;: reportez-vous toujours aux
          publications du CNG pour la version en vigueur.
        </p>
      </div>
    </section>
  );
}
