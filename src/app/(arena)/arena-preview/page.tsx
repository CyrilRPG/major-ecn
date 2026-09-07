import { redirect } from 'next/navigation';

/**
 * L'ancienne maquette non répertoriée est remplacée par le tournoi de
 * démonstration réel (visible du personnel connecté à l'administration).
 */
export default function ArenaPreviewPage() {
  redirect('/arena/demo-medecine-interne');
}
