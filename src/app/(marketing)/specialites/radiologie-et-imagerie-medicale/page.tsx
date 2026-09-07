import type { Metadata } from "next";
import { PsychiatrieRadiologiePage } from "@/components/marketing/psychiatrie-radiologie-page";

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

export default function RadiologiePage() {
  return <PsychiatrieRadiologiePage kind="radiologie" />;
}
