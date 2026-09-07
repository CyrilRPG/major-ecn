import type { Metadata } from "next";
import { PsychiatrieRadiologiePage } from "@/components/marketing/psychiatrie-radiologie-page";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import faqPsychiatrie from "@/lib/data/faq-psychiatrie.json";

export const metadata: Metadata = {
  title: "Préparation EVC Psychiatrie 2026",
  description:
    "Préparez les EVC de psychiatrie du 10 décembre 2026 : 198 postes en voie externe, QCM, annales corrigées, cours et accompagnement Major ECN.",
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

/** Le composant de page est un composant client : le JSON-LD est émis ici,
    côté serveur, comme sur les autres pages spécialité. */
export default function PsychiatriePage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Accueil", path: "/" },
            { name: "Spécialités", path: "/specialites" },
            { name: "Psychiatrie", path: "/specialites/psychiatrie" },
          ]),
          faqSchema(faqPsychiatrie.map(({ q, a }) => ({ q, a: a.replaceAll("**", "") }))),
        ]}
      />
      <PsychiatrieRadiologiePage kind="psychiatrie" />
    </>
  );
}
