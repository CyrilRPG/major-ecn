'use client';

/**
 * Affichage de secours d'une fiche quand le lecteur principal (pdf.js) ne peut
 * pas démarrer sur l'appareil de l'élève — navigateur trop ancien pour le
 * module worker, WebView exotique, extension bloquante… Plutôt qu'une page
 * d'erreur, on retombe sur la visionneuse NATIVE du navigateur dans une
 * iframe : le document reste consultable (il est de toute façon filigrané au
 * nom de l'élève, comme dans la vue partagée qui utilise déjà cette iframe).
 */
export default function PdfFallbackFrame({ src }: { src: string; zoom?: number }) {
  return (
    <iframe
      src={`${src}${src.includes('#') ? '' : '#toolbar=0&navpanes=0'}`}
      title="Fiche de cours"
      className="h-full w-full border-0 bg-slate-100"
    />
  );
}
