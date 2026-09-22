import type { Metadata } from "next";
import { PsychiatrieRadiologiePage, type GuideLie } from "@/components/marketing/psychiatrie-radiologie-page";
import { JsonLd, breadcrumbSchema, courseSchema, faqSchema } from "@/components/seo/json-ld";
import faqPsychiatrie from "@/lib/data/faq-psychiatrie.json";
import { getPublishedArticles } from "@/lib/data/blog-articles";
import { getDbPublishedArticles } from "@/lib/data/blog-db";
import { PSY_ARTICLES_CLUSTER, PSY_FORMULES, PSY_PROGRAMME } from "@/lib/data/psychiatrie-radiologie";

export const metadata: Metadata = {
  title: "Préparation EVC Psychiatrie 2026",
  description:
    "Préparez les EVC de psychiatrie du 10 décembre 2026 : 450 postes en voie interne, 198 en voie externe. Programme, QCM, annales corrigées et accompagnement Major ECN.",
  alternates: { canonical: "/specialites/psychiatrie" },
  openGraph: {
    title: "Préparation EVC Psychiatrie 2026 — Major ECN",
    url: "/specialites/psychiatrie",
    type: "website",
    locale: "fr_FR",
    images: [
      {
        url: "/specialites/psychiatrie/hero.webp",
        width: 1920,
        height: 1280,
        alt: "Préparation EVC Psychiatrie Major ECN",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/specialites/psychiatrie/hero.webp"],
  },
};

/** La liste des articles liés suit les publications du blog. */
export const revalidate = 300;

/** « 2 095 € » → 2095. */
const prixEnEuros = (prix: string) => Number(prix.replace(/\D/g, ""));

/** Articles du cluster psychiatrie réellement publiés, statiques ou créés en base. */
async function guidesPublies(): Promise<GuideLie[]> {
  const publies = new Map(
    [...getPublishedArticles(), ...(await getDbPublishedArticles())].map((a) => [a.slug, a]),
  );
  return PSY_ARTICLES_CLUSTER.flatMap((slug) => {
    const a = publies.get(slug);
    return a ? [{ slug, title: a.title, excerpt: a.excerpt }] : [];
  });
}

/** Le composant de page est un composant client : le JSON-LD est émis ici,
    côté serveur, comme sur les autres pages spécialité. */
export default async function PsychiatriePage() {
  const guides = await guidesPublies();
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Accueil", path: "/" },
            { name: "Spécialités", path: "/specialites" },
            { name: "Psychiatrie", path: "/specialites/psychiatrie" },
          ]),
          courseSchema({
            name: "Préparation EVC Psychiatrie 2026",
            description:
              "Préparation aux épreuves de vérification des connaissances (EVC) de psychiatrie, voie interne (QCM) et voie externe (réponses rédactionnelles).",
            path: "/specialites/psychiatrie",
            about: PSY_PROGRAMME.map((axe) => axe.titre),
            offers: PSY_FORMULES.map((f) => ({
              name: `Formule ${f.nom}`,
              price: prixEnEuros(f.prix),
              path: "/specialites/psychiatrie#formules",
              aPartirDe: Boolean(f.prefixe),
            })),
          }),
          faqSchema(faqPsychiatrie.map(({ q, a }) => ({ q, a: a.replaceAll("**", "") }))),
        ]}
      />
      <PsychiatrieRadiologiePage kind="psychiatrie" guides={guides} />
    </>
  );
}
