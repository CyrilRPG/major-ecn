import Image from "next/image";
import Link from "next/link";
import { AncreTunnel } from "./ancre-tunnel";
import { lienPaiement } from "@/lib/tunnel-inscription";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import faqPsychiatrie from "@/lib/data/faq-psychiatrie.json";
import faqRadiologie from "@/lib/data/faq-radiologie.json";
import {
  GAIN_TEMPS,
  PSY_FORMULES,
  PSY_METHODE,
  PSY_PROGRAMME,
  RADIO_FORMULES,
  RADIO_METHODE,
  RADIO_PROGRAMME,
  type SpecialtyKind,
} from "@/lib/data/psychiatrie-radiologie";
import styles from "./psychiatrie-radiologie.module.css";

function TexteFaq({ text }: { text: string }) {
  return text
    .split("**")
    .map((part, index) =>
      index % 2 ? <strong key={index}>{part}</strong> : part,
    );
}

function Liste({ items }: { items: string[] }) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function Voies({ psy }: { psy: boolean }) {
  return (
    <div className={styles.voies}>
      <div>
        <strong>Voie interne</strong>
        <span>{psy ? "QCM" : "Préparation au format QCM"}</span>
      </div>
      <div>
        <strong>Voie externe</strong>
        <span>
          {psy
            ? "Réponses rédactionnelles"
            : "Préparation aux QROC et réponses rédactionnelles"}
        </span>
      </div>
    </div>
  );
}

function Hero({ psy }: { psy: boolean }) {
  const spec = psy ? "psychiatrie" : "radiologie";
  return (
    <section
      className={`${styles.hero} ${psy ? styles.heroPsy : styles.heroRadio}`}
    >
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow}>EVC 2026</p>
        <h1>
          <span>Préparation EVC</span>
          {psy ? (
            "Psychiatrie"
          ) : (
            <>
              Radiologie &<br /> Imagerie médicale
            </>
          )}
        </h1>
        <p className={styles.heroDate}>
          {psy
            ? "10 décembre 2026 · 198 postes en voie externe"
            : "8 décembre 2026 · 72 postes en voie externe"}
        </p>
        {psy ? (
          <>
            <p className={styles.heroIntro}>
              Savoir quoi travailler. Savoir comment travailler.
              <br />
              Savoir comment répondre aux EVC de psychiatrie.
            </p>
            <Liste
              items={[
                "Les connaissances et situations cliniques essentielles",
                "Une méthodologie adaptée à votre voie",
                "+ de 2 000 questions, dossiers cliniques et annales corrigés",
                "Des psychiatres pour vous guider et répondre à vos questions",
              ]}
            />
          </>
        ) : (
          <>
            <p className={styles.heroIntro}>
              Une préparation complète et ciblée pour réussir
              <br className={styles.desktopBreak} /> les épreuves de radiologie,
              quelle que soit votre voie.
            </p>
            <Voies psy={false} />
          </>
        )}
        <div className={styles.actions}>
          <Link className={styles.button} href="#formules">
            Choisir ma formule
          </Link>
          <Link
            className={styles.outline}
            href={psy ? "#methode" : "#programme"}
          >
            {psy ? "Découvrir la préparation" : "Découvrir le programme"}
          </Link>
        </div>
        {psy ? (
          <Voies psy />
        ) : (
          <p className={styles.access}>
            Accès immédiat à la plateforme après inscription
          </p>
        )}
      </div>
      <div className={styles.heroVisual}>
        <Image
          src={`/specialites/${spec}/hero.webp`}
          alt={
            psy
              ? "Consultation de psychiatrie : échange entre une médecin et sa patiente"
              : "Radiologue analysant des examens d’imagerie médicale"
          }
          fill
          priority
          sizes="(max-width: 800px) 100vw, 58vw"
          className={styles.heroImage}
        />
        {!psy && (
          <p className={styles.liveBadge}>
            Cours en direct
            <br />& replays
          </p>
        )}
        <div className={styles.heroPanel}>
          {psy ? (
            <dl>
              <div>
                <dt>+ de 2 000 questions</dt>
                <dd>QCM · dossiers · entraînements</dd>
              </div>
              <div>
                <dt>Cours en direct & replays</dt>
                <dd>selon la formule</dd>
              </div>
              <div>
                <dt>Plateforme 24h/24 – 7j/7</dt>
              </div>
              <div>
                <dt>Réponses à vos questions</dt>
                <dd>par nos psychiatres</dd>
              </div>
            </dl>
          ) : (
            <Liste
              items={[
                "Enseignement par des radiologues experts",
                "Méthode adaptée à votre voie",
                "QCM, QROC, dossiers cliniques",
                "Annales corrigées",
                "Cours en direct & replays",
                "Plateforme disponible 24h/24 – 7j/7",
              ]}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function Session({ psy }: { psy: boolean }) {
  return (
    <aside className={styles.session} aria-label="Repères de la session 2026">
      <div>
        <span className={styles.eyebrow}>Votre prochaine échéance</span>
        <strong>
          <time dateTime={psy ? "2026-12-10" : "2026-12-08"}>
            {psy ? "10 décembre 2026" : "8 décembre 2026"}
          </time>
        </strong>
        <span>{psy ? "Jeudi" : "Mardi"} · Espace Jean-Monnet, Rungis</span>
      </div>
      <div>
        <strong>{psy ? "198" : "72"} postes</strong>
        <span>ouverts en voie externe · session 2026</span>
        <a
          href="https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054245644"
          target="_blank"
          rel="noreferrer"
        >
          Arrêté d’ouverture du concours ↗
        </a>
      </div>
      <Link href="#formules" className={styles.sessionCta}>
        Préparer cette échéance <span aria-hidden>→</span>
      </Link>
    </aside>
  );
}

function Reperes({ psy }: { psy: boolean }) {
  const items = psy
    ? [
        ["+ de 2 000", "questions en psychiatrie"],
        ["+ 9 000", "médecins accompagnés"],
        ["Depuis 2011", "une expérience historique de la préparation"],
        ["1 lauréate EVC psychiatrie", "Dr Monica Waitzfelder"],
      ]
    : [
        ["+9 000", "médecins accompagnés depuis 2011"],
        ["Toutes les spécialités EVC", "couvertes"],
        ["Des radiologues", "à vos côtés pour vous faire réussir"],
        ["Méthode éprouvée", "et adaptée à votre voie d’évaluation"],
      ];
  return (
    <div className={styles.reperes}>
      {items.map(([title, text]) => (
        <div key={title}>
          <strong>{title}</strong>
          <span>{text}</span>
        </div>
      ))}
    </div>
  );
}

function Methode({ psy }: { psy: boolean }) {
  return (
    <section id="methode" className={styles.section}>
      <h2 className={styles.sectionTitle}>
        {psy
          ? "Notre méthode : transformer le volume en performance"
          : "Une méthodologie claire pour réussir les EVC de radiologie"}
      </h2>
      <div className={`${styles.methode} ${psy ? styles.six : styles.five}`}>
        {(psy ? PSY_METHODE : RADIO_METHODE).map(([title, text], i) => (
          <article key={title}>
            <span className={styles.step} aria-hidden>
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      {psy && (
        <p className={styles.methodConclusion}>
          L’objectif n’est pas d’accumuler les questions, mais d’identifier ce
          qui n’est pas encore maîtrisé
          <br className={styles.desktopBreak} /> et de progresser de façon
          ciblée et efficace.
        </p>
      )}
    </section>
  );
}

function GainTemps({ psy }: { psy: boolean }) {
  return (
    <section id="gain-de-temps" className={`${styles.section} ${styles.gain}`}>
      <header>
        <p className={styles.eyebrow}>Gagnez en efficacité</p>
        <h2>
          {psy ? (
            <>
              Avec Major ECN, votre temps sert à réviser
              <span>pas à organiser vos révisions.</span>
            </>
          ) : (
            <>
              En radiologie, votre temps est précieux.
              <span>Dans votre préparation aussi.</span>
            </>
          )}
        </h2>
        <p>
          Ressources, priorités, entraînements et suivi sont déjà structurés
          pour vous permettre de vous concentrer sur l’essentiel :{" "}
          <strong>apprendre, vous entraîner et progresser.</strong>
        </p>
      </header>
      <div
        className={styles.tableWrap}
        role="region"
        aria-label="Comparaison du temps de préparation"
        tabIndex={0}
      >
        <table>
          <thead>
            <tr>
              <th scope="col">À organiser</th>
              <th scope="col">
                Seul<small>À faire par vous-même</small>
              </th>
              <th scope="col">
                Avec Major ECN<small>Déjà inclus dans votre préparation</small>
              </th>
              <th scope="col">
                Votre gain de temps<small>Avec Major ECN</small>
              </th>
            </tr>
          </thead>
          <tbody>
            {GAIN_TEMPS.map(([title, detail, seul, major, gain]) => (
              <tr key={title}>
                <th scope="row">
                  {title}
                  <small>{detail}</small>
                </th>
                <td>{seul}</td>
                <td>{major}</td>
                <td>{gain}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.gainCta}>
        <div>
          <h3>
            Concentrez-vous sur ce qui compte :
            <span>votre préparation aux EVC.</span>
          </h3>
          <p>
            Avec Major ECN, vous gagnez un temps précieux et vous avancez plus
            efficacement, avec un accompagnement spécialisé à chaque étape.
          </p>
        </div>
        <div>
          <Link
            href={psy ? "#programme" : "#formules"}
            className={styles.button}
          >
            Découvrir la préparation Major ECN <span aria-hidden>→</span>
          </Link>
          <p className={styles.signature}>
            Méthode <span>Entraînements</span> Suivi <span>Expertise</span>
          </p>
        </div>
      </div>
    </section>
  );
}

function Programme({ psy }: { psy: boolean }) {
  return (
    <section id="programme" className={styles.section}>
      {psy ? (
        <h2 className={styles.srOnly}>Le programme de psychiatrie</h2>
      ) : (
        <>
          <h2 className={styles.sectionTitle}>
            Au programme : les grands domaines de la radiologie
          </h2>
          <p className={styles.centerIntro}>
            Un programme structuré autour des principales situations cliniques,
            pathologies et techniques d’imagerie à maîtriser pour les EVC.
          </p>
        </>
      )}
      <div className={`${styles.programme} ${psy ? styles.four : styles.five}`}>
        {(psy ? PSY_PROGRAMME : RADIO_PROGRAMME).map((domain, i) => (
          <article key={domain.title}>
            <header>
              <span aria-hidden>{String(i + 1).padStart(2, "0")}</span>
              <h3>
                {i + 1}. {domain.title}
              </h3>
            </header>
            <Liste items={domain.items} />
          </article>
        ))}
      </div>
      {!psy && (
        <p className={styles.caption}>
          Aperçu non exhaustif du programme. Le contenu pédagogique est adapté
          aux exigences des EVC et peut évoluer selon les recommandations et
          référentiels.
        </p>
      )}
    </section>
  );
}

function TemoignagePsy() {
  return (
    <article className={styles.temoignage}>
      <h2>
        Elle a réussi les EVC de psychiatrie<span>avec Major ECN</span>
      </h2>
      <div className={styles.quoteRow}>
        <div className={styles.person}>
          <div className={styles.avatar} aria-hidden>
            MW
          </div>
          <strong>Dr Monica WAITZFELDER</strong>
          <span>Psychiatrie · Lauréate EVC 2021</span>
        </div>
        <blockquote>
          Après une première tentative en solo sans succès, la formation Major
          ECN m’a apporté la méthodologie qui a fait la différence.
        </blockquote>
      </div>
      <ul className={styles.quoteQualities}>
        {["Méthodologie", "Rapidité", "Connaissances ciblées", "Confiance"].map(
          (q) => (
            <li key={q}>{q}</li>
          ),
        )}
      </ul>
      <Link href="/temoignages/dr-monica-waitzfelder" className={styles.button}>
        Lire son témoignage complet <span aria-hidden>→</span>
      </Link>
    </article>
  );
}

function Accompagnement({ psy }: { psy: boolean }) {
  if (psy)
    return (
      <>
        <section
          className={`${styles.section} ${styles.duo}`}
          aria-label="Progression et témoignage"
        >
          <article className={styles.plateforme}>
            <h2>
              Votre préparation s’adapte
              <br />à votre progression.
            </h2>
            <Image
              src="/plateforme/laptop-phone-dashboard.png"
              alt="Tableau de bord de la préparation Major ECN sur ordinateur et mobile"
              width={1400}
              height={840}
              sizes="(max-width: 800px) 100vw, 50vw"
              className={styles.platformImage}
            />
            <div className={styles.platformSteps}>
              {[
                ["Travaillez", "Cours, fiches, connaissances clés"],
                ["Entraînez-vous", "+ de 2 000 questions, dossiers, annales"],
                ["Identifiez", "Erreurs et lacunes, résultats détaillés"],
                ["Consolidez", "Révisions ciblées et corrections"],
              ].map(([t, d]) => (
                <div key={t}>
                  <strong>{t}</strong>
                  <span>{d}</span>
                </div>
              ))}
            </div>
            <p>
              Vous savez ce que vous avez travaillé, ce que vous maîtrisez
              <br /> et ce qui nécessite encore votre attention.
            </p>
          </article>
          <TemoignagePsy />
        </section>
        <section className={`${styles.section} ${styles.teacherPsy}`}>
          <Image
            src="/specialites/psychiatrie/cours.webp"
            alt="Cours de psychiatrie consacré à l’évaluation du risque suicidaire"
            width={630}
            height={326}
            sizes="(max-width: 800px) 100vw, 36vw"
          />
          <div>
            <h2>
              Des psychiatres
              <br />à vos côtés jusqu’aux EVC
            </h2>
            <p>
              Une notion mal comprise ?<br />
              Une correction que vous ne comprenez pas ?<br />
              Un doute sur la législation ou une conduite à tenir ?
            </p>
            <h3>Posez vos questions.</h3>
            <p>
              Nos psychiatres vous accompagnent pour lever vos doutes,
              comprendre vos erreurs et avancer avec davantage de sérénité
              jusqu’aux EVC.
            </p>
          </div>
          <dl className={styles.teacherFeatures}>
            <div>
              <dt>Cours en direct</dt>
              <dd>et interactions</dd>
            </div>
            <div>
              <dt>Replays disponibles</dt>
              <dd>quand vous voulez</dd>
            </div>
            <div>
              <dt>Réponses à vos questions</dt>
              <dd>par nos psychiatres</dd>
            </div>
          </dl>
        </section>
      </>
    );
  return (
    <>
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Tout ce dont vous avez besoin pour réussir
        </h2>
        <ul className={styles.resources}>
          {[
            "Cours en direct et replays",
            "QCM, QROC, dossiers cliniques corrigés et expliqués",
            "Annales corrigées",
            "Fiches de cours et ressources pédagogiques",
            "Suivi de progression et statistiques détaillées",
            "Réponses à vos questions",
            "Plateforme disponible 24h/24 – 7j/7",
          ].map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
      <section
        className={`${styles.section} ${styles.duo}`}
        aria-label="Enseignement et témoignage"
      >
        <article className={styles.teacherRadio}>
          <h2>Des radiologues à vos côtés</h2>
          <p className={styles.centerIntro}>
            Cours en direct · Corrections · Méthodologie · Réponses à vos
            questions
          </p>
          <div>
            <Image
              src="/specialites/radiologie/cours.webp"
              alt="Cours de radiologie en direct avec analyse d’imagerie cérébrale"
              width={370}
              height={270}
              sizes="(max-width: 800px) 100vw, 25vw"
            />
            <Liste
              items={[
                "Enseignement assuré par des médecins spécialistes en radiologie et imagerie médicale",
                "Pédagogie éprouvée adaptée aux exigences des EVC",
                "Accompagnement humain pour répondre à vos difficultés et vous faire progresser",
              ]}
            />
          </div>
        </article>
        <article className={styles.temoignage}>
          <h2>Ils ont préparé les EVC avec Major ECN</h2>
          <blockquote>
            Une préparation complète, des cours clairs et des corrections très
            détaillées. Cette préparation m’a permis d’aborder les épreuves avec
            confiance.
          </blockquote>
          <p>Médecin EVC Radiologie – Voie externe</p>
          <Link href="/temoignages" className={styles.outline}>
            Voir tous les témoignages
          </Link>
        </article>
      </section>
    </>
  );
}

function Faq({ psy }: { psy: boolean }) {
  const entries = psy ? faqPsychiatrie : faqRadiologie;
  return (
    <section id="faq" className={`${styles.section} ${styles.faq}`}>
      <h2 className={styles.sectionTitle}>
        {psy
          ? "Foire aux questions"
          : "Questions fréquentes sur la préparation aux EVC de radiologie"}
      </h2>
      <div className={styles.faqGrid}>
        {[entries.slice(0, 7), entries.slice(7)].map((column, i) => (
          <div key={i}>
            {column.map(({ q, a }) => (
              <details key={q}>
                <summary>
                  {q}
                  <span aria-hidden>+</span>
                </summary>
                <div className={styles.answer}>
                  {a.split("\n\n").map((paragraph, n) => (
                    <p key={n}>
                      <TexteFaq text={paragraph} />
                    </p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function Formules({ psy }: { psy: boolean }) {
  const forms = psy ? PSY_FORMULES : RADIO_FORMULES;
  const specialty = psy ? "Psychiatrie" : "Radiologie et imagerie médicale";
  return (
    <section id="formules" className={`${styles.section} ${styles.formules}`}>
      <p className={styles.eyebrow}>Tarifs · Choisissez votre formule</p>
      <h2 className={styles.sectionTitle}>
        {psy
          ? "Quelle préparation correspond à votre situation ?"
          : "Quelle formule est faite pour vous ?"}
      </h2>
      <div className={styles.pricing}>
        {forms.map((f, i) => (
          <article
            key={f.name}
            className={i === 2 ? styles.featuredPrice : undefined}
          >
            {i === 2 && (
              <p className={styles.priceBadge}>
                {psy ? "La plus complète" : "Préparation la plus complète"}
              </p>
            )}
            <h3>{f.name}</h3>
            <p className={styles.priceSubtitle}>{f.subtitle}</p>
            <p className={styles.price}>
              {i === 2 && <small>À partir de</small>}
              {f.price}
            </p>
            {!psy && (
              <p className={styles.pricePeriod}>
                Accès pendant votre période de préparation
              </p>
            )}
            <Liste items={f.items} />
            <Link
              href={lienPaiement(f.href, specialty)}
              className={i === 2 ? styles.button : styles.outline}
            >
              Je choisis cette formule
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

function EditorialRadio() {
  return (
    <section className={`${styles.section} ${styles.editorial}`}>
      <div>
        <h2>Préparation EVC Radiologie et Imagerie médicale</h2>
        <p>
          La préparation Major ECN en radiologie est conçue pour former les
          médecins préparant les EVC en radiodiagnostic et imagerie médicale, en
          voie interne comme en voie externe. Elle associe un programme
          structuré couvrant les grands domaines de la spécialité, une
          méthodologie adaptée au format des épreuves, des QCM, QROC, dossiers
          cliniques et annales corrigées, ainsi qu’un accompagnement pédagogique
          tout au long de la préparation.
        </p>
        <p>
          L’objectif est de vous permettre d’identifier les connaissances
          prioritaires, de travailler les principales situations rencontrées en
          imagerie médicale et de vous entraîner selon les exigences propres à
          votre voie.
        </p>
      </div>
      <aside>
        Contenu pédagogique élaboré et relu par des médecins spécialistes en
        radiologie et imagerie médicale<p>Dernière mise à jour : mai 2026</p>
      </aside>
    </section>
  );
}

export function PsychiatrieRadiologiePage({ kind }: { kind: SpecialtyKind }) {
  const psy = kind === "psychiatrie";
  const name = psy ? "Psychiatrie" : "Radiologie & Imagerie médicale";
  const path = `/specialites/${psy ? "psychiatrie" : "radiologie-et-imagerie-medicale"}`;
  const faq = psy ? faqPsychiatrie : faqRadiologie;
  return (
    <div className={styles.page}>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Accueil", path: "/" },
            { name: "Spécialités", path: "/specialites" },
            { name, path },
          ]),
          faqSchema(faq.map(({ q, a }) => ({ q, a: a.replaceAll("**", "") }))),
        ]}
      />
      <AncreTunnel actif />
      <div className={styles.container}>
        <nav className={styles.breadcrumb} aria-label="Fil d’Ariane">
          <Link href="/">Accueil</Link>
          <span aria-hidden>›</span>
          <Link href="/specialites">Spécialités EVC</Link>
          <span aria-hidden>›</span>
          <span aria-current="page">{name}</span>
        </nav>
        <Hero psy={psy} />
        <Session psy={psy} />
        <Reperes psy={psy} />
        <Methode psy={psy} />
        {psy && <GainTemps psy />}
        <Programme psy={psy} />
        <Accompagnement psy={psy} />
        {/* Les instructions de la FAQ radiologie placent la preuve avant le prix. */}
        {psy ? (
          <>
            <Formules psy />
            <Faq psy />
          </>
        ) : (
          <>
            <Faq psy={false} />
            <GainTemps psy={false} />
            <Formules psy={false} />
            <EditorialRadio />
          </>
        )}
        <section className={styles.finalCta}>
          <div>
            <h2>Vous préparez les EVC de {kind} ?</h2>
            <p>
              {psy ? (
                <>
                  Choisissez une préparation complète, structurée et adaptée à
                  votre voie.
                  <br />
                  Et mettez toutes les chances de votre côté le jour J.
                </>
              ) : (
                <>
                  Trouvez la formule adaptée à votre voie et à votre niveau
                  <br />
                  de préparation et atteignez votre objectif.
                </>
              )}
            </p>
          </div>
          <Link href="#formules" className={styles.whiteButton}>
            {psy ? "Je choisis ma préparation" : "Je m’inscris maintenant"}{" "}
            <span aria-hidden>→</span>
          </Link>
        </section>
      </div>
    </div>
  );
}
