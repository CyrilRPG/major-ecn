import { FormulePageContent } from '@/components/marketing/formule-page';
import { APPROFONDI_MIN_EUROS_FR } from '@/lib/stripe/approfondi';

export const metadata = {
  alternates: { canonical: '/formules/programme-approfondi' },
  title: 'Programme Approfondi - Major ECN',
  description: `Approfondissez votre preparation avec un accompagnement structure jusqu'aux EVC. Des ${APPROFONDI_MIN_EUROS_FR} euros.`,
};

export default function ProgrammeApprofondiPage() {
  return <FormulePageContent variant="approfondi" />;
}
