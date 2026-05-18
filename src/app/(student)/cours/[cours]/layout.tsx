import { createClient } from '@/lib/supabase/server';
import { CourseChatbotRail } from '@/components/course-chatbot-rail';

export default async function CoursLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ cours: string }>;
}) {
  const { cours: coursId } = await params;
  const supabase = await createClient();
  const { data: cours } = await supabase.from('cours').select('id, titre').eq('id', coursId).maybeSingle();

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 min-w-0">{children}</div>
      {cours && <CourseChatbotRail coursId={cours.id} coursTitre={cours.titre} />}
    </div>
  );
}
