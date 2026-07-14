'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createExam } from '@/app/admin/epreuves-blanches/actions';

export function NewExamButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const create = () => {
    start(async () => {
      const res = await createExam({ title: 'Nouvelle épreuve' });
      if (res.ok) router.push(`/admin/epreuves-blanches/${res.id}`);
    });
  };
  return (
    <Button onClick={create} disabled={pending} size="md">
      {pending ? <Loader2 className="animate-spin" /> : <Plus />}
      Nouvelle épreuve
    </Button>
  );
}
