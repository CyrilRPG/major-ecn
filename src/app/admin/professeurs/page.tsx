import { redirect } from 'next/navigation';

/**
 * Les professeurs sont désormais gérés avec tout le personnel dans
 * « Équipe & Permissions » (cahier des charges 18/09/2026) : un seul écran,
 * un seul moteur de permissions. L'ancienne adresse y renvoie.
 */
export default function ProfessorsPage() {
  redirect('/admin/equipe');
}
