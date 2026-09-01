import Link from 'next/link';
import { BORDER, INK_SOFT, JAKARTA, MANROPE, NAVY, RED } from './home-ui';

/* ============================================================
   TEXTE DE BAS DE PAGE — rédigé, pas du remplissage : la réforme
   voie interne / voie externe, les chiffres de la session 2026 et
   le déroulé du concours. Rendu côté serveur (pas de 'use client')
   pour être présent tel quel dans le HTML servi.
   ============================================================ */

export function HomeSeoText() {
  return (
    <section className="py-14 sm:py-16" style={{ fontFamily: JAKARTA, background: '#FBFBFD' }}>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h2 className="text-[1.5rem] font-black leading-tight tracking-tight sm:text-[1.9rem]" style={{ color: NAVY, letterSpacing: '-0.02em' }}>
          Comprendre les EVC 2026&nbsp;: voie interne, voie externe et procédure d’autorisation d’exercice
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
            multiples. C’est la voie la plus dotée&nbsp;: <strong style={{ color: NAVY }}>2 896 postes de médecins</strong> pour
            la session 2026. Cette abondance apparente ne doit pas tromper. L’épreuve ne teste pas la pratique
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
            La voie externe&nbsp;: deux épreuves rédactionnelles, treize spécialités
          </h3>
          <p>
            La voie externe est ouverte à tous les candidats, sans condition d’exercice préalable en France. Elle
            comporte deux épreuves distinctes passées le même jour&nbsp;: l’<strong style={{ color: NAVY }}>EVCF</strong>,
            qui porte sur les connaissances fondamentales sous forme de questions à réponse ouverte et courte (QROC), et
            l’<strong style={{ color: NAVY }}>EVCP</strong>, consacrée aux connaissances pratiques à travers des dossiers
            cliniques — deux heures chacune. Le format change tout&nbsp;: il ne s’agit plus de reconnaître la bonne
            proposition mais de la produire, avec les mots-clés attendus, une réponse hiérarchisée et, lorsqu’ils
            s’appliquent, les éléments dont l’absence annule la question. La session 2026 ouvre{' '}
            <strong style={{ color: NAVY }}>1 003 postes de médecins répartis entre treize spécialités</strong>, chiffres
            fixés par l’arrêté du 12 juin 2026.
          </p>

          <h3 className="pt-3 text-[1.05rem] font-black tracking-tight" style={{ color: NAVY, fontFamily: JAKARTA }}>
            Où se situent les postes, et pourquoi leur nombre ne suffit pas
          </h3>
          <p>
            En voie externe, deux spécialités dominent nettement la session&nbsp;: la{' '}
            <strong style={{ color: NAVY }}>médecine interne polyvalente et immunologie clinique (MIPIC)</strong> avec
            213 postes et la <strong style={{ color: NAVY }}>psychiatrie</strong> avec 198 postes. Toutes deux sont
            nouvelles en 2026 et accessibles sans diplôme de spécialité obtenu dans le pays d’origine, ce qui ouvre une
            possibilité concrète à des généralistes exerçant depuis des années en milieu hospitalier polyvalent ou en
            psychiatrie. Viennent ensuite la gériatrie (110 postes), la pédiatrie (75), la médecine d’urgence et la
            radiologie (72 chacune), l’anesthésie-réanimation (64) et la médecine et santé au travail (61). En bas de
            tableau, la médecine cardiovasculaire (20) et la pneumologie (17) restent très étroites. Mais un nombre de
            postes élevé attire mécaniquement davantage de candidats&nbsp;: c’est le{' '}
            <Link href="/blog/evc-ratio-candidats-postes-choix-specialite-2026" className="font-bold underline underline-offset-2" style={{ color: RED }}>
              ratio candidats/postes
            </Link>{' '}
            qui détermine la sélectivité réelle, pas le volume brut.
          </p>

          <h3 className="pt-3 text-[1.05rem] font-black tracking-tight" style={{ color: NAVY, fontFamily: JAKARTA }}>
            Le calendrier de la session 2026
          </h3>
          <p>
            Les inscriptions se sont tenues du 17 juin au 16 juillet 2026, exclusivement en ligne sur cng.sante.fr, avec
            une règle stricte&nbsp;: une seule candidature, toute double inscription entraînant le rejet définitif des
            deux dossiers. Les épreuves se déroulent à partir de{' '}
            <strong style={{ color: NAVY }}>novembre 2026 à l’Espace Jean Monnet de Rungis</strong> (Val-de-Marne), en
            présentiel uniquement — les candidats venant de l’étranger doivent anticiper visa et hébergement. Les
            résultats et l’affectation interviennent au premier trimestre 2027. Le{' '}
            <Link href="/blog/calendrier-inscription-concours-pae-2026-cng" className="font-bold underline underline-offset-2" style={{ color: RED }}>
              calendrier complet du CNG
            </Link>{' '}
            détaille chaque étape.
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
          Chiffres de postes et calendrier issus des textes et publications officiels de la session 2026 (arrêté du
          12 juin 2026, Centre national de gestion). Les modalités peuvent évoluer&nbsp;: reportez-vous toujours aux
          publications du CNG pour la version en vigueur.
        </p>
      </div>
    </section>
  );
}
