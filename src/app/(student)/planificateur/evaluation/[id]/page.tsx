import { redirect } from 'next/navigation';

/** Ancienne évaluation du planificateur (avant la V4.1) : les activités se font désormais dans « Mon planning ». */
export default function AncienneEvaluation() {
  redirect('/planificateur');
}
