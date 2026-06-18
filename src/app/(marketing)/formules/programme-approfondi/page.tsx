import { FormulePageContent } from '@/components/marketing/formule-page';

export const metadata = {
  alternates: { canonical: '/formules/programme-approfondi' },
  title: 'Programme Approfondi - Major ECN',
  description: 'Approfondissez votre preparation avec un accompagnement structure jusqu\'aux EVC. A partir de 2 395 euros.',
};

export default function ProgrammeApprofondiPage() {
  return <FormulePageContent variant="approfondi" />;
}
