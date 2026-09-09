'use client';

import { useFormStatus } from 'react-dom';
import { ArenaButton } from './arena-ui';

/** Évite les doubles validations et montre que l’ouverture de session est en cours. */
export function AccessSubmit({ children }: { children: string }) {
  const { pending } = useFormStatus();
  return <ArenaButton type="submit" size="lg" className="w-full" disabled={pending}>{pending ? 'Ouverture de votre espace…' : children}</ArenaButton>;
}
