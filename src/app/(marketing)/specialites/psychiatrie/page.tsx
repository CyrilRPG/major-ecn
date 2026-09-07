import type { Metadata } from "next";
import { PsychiatrieRadiologiePage } from "@/components/marketing/psychiatrie-radiologie-page";

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

export default function PsychiatriePage() {
  return <PsychiatrieRadiologiePage kind="psychiatrie" />;
}
