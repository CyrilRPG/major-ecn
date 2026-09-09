import { variantesAcceptees } from '@/lib/qcm/grade';
import { cn } from '@/lib/utils';

/**
 * Ligne discrète « Formulations également acceptées : v1 · v2 » sous la
 * réponse modèle d'une QROC. Ne rend rien s'il n'existe aucune variante :
 * l'élève ne voit que « Réponse attendue : <modèle> » dans le cas courant.
 */
export function VariantesAcceptees({ reponseAttendue, className }: { reponseAttendue: string | null | undefined; className?: string }) {
  const variantes = variantesAcceptees(reponseAttendue);
  if (variantes.length === 0) return null;
  return (
    <p className={cn('mt-1 text-xs leading-snug text-(--color-ink-soft)', className)}>
      <span className="font-medium">Formulations également acceptées : </span>
      {variantes.join(' · ')}
    </p>
  );
}
