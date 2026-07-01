import { redirect } from 'next/navigation';

/**
 * L'onglet « Leads Méthodologie » a fusionné avec « Leads Diagnostic » dans un
 * onglet unique « Leads » (/admin/leads). On redirige l'ancienne URL.
 */
export default function LeadsMethodologieRedirect() {
  redirect('/admin/leads');
}
