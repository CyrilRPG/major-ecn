import type { Metadata } from "next";
import { PsychiatrieRadiologiePage } from "@/components/marketing/psychiatrie-radiologie-page";
import { JsonLd, breadcrumbSchema, faqSchema } from "@/components/seo/json-ld";
import faqRadiologie from "@/lib/data/faq-radiologie.json";

export const metadata: Metadata = {
  title: "Préparation EVC Radiologie et Imagerie médicale 2026",
  description:
    "Préparez les EVC de radiologie du 8 décembre 2026 : 72 postes en voie externe, dossiers avec iconographie, QCM, QROC, annales et cours Major ECN.",
  alternates: { canonical: "/specialites/radiologie-et-imagerie-medicale" },
  openGraph: {
    title: "Préparation EVC Radiologie 2026 — Major ECN",
    url: "/specialites/radiologie-et-imagerie-medicale",
    type: "website",
    locale: "fr_FR",
    images: [
      {
        url: "/specialites/radiologie/hero.webp",
        width: 1920,
        height: 1013,
        alt: "Préparation EVC Radiologie Major ECN",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/specialites/radiologie/hero.webp"],
  },
};

/** Le composant de page est un composant client : le JSON-LD est émis ici,
    côté serveur, comme sur les autres pages spécialité. */
export default function RadiologiePage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Accueil", path: "/" },
            { name: "Spécialités", path: "/specialites" },
            { name: "Radiologie & Imagerie médicale", path: "/specialites/radiologie-et-imagerie-medicale" },
          ]),
          faqSchema(faqRadiologie.map(({ q, a }) => ({ q, a: a.replaceAll("**", "") }))),
        ]}
      />
      <PsychiatrieRadiologiePage kind="radiologie" />
    </>
  );
}
