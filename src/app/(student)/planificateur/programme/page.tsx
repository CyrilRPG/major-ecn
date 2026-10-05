import { redirect } from 'next/navigation';

/** Ancienne adresse du planificateur (avant la V4.1). */
export default function AncienneAdresse() {
  redirect('/planificateur/revisions');
}
