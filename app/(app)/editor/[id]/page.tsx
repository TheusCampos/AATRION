import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { emptyResumeContent } from '@/lib/validations/resume';
import { ResumeEditor } from '@/components/resume/ResumeEditor';

type Params = { id: string };
type SearchParams = { action?: string };

export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const action = searchParams?.action;

  if (params.id === 'new') {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/resumes`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Meu novo currículo' }),
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      redirect('/dashboard');
    }

    const data = await res.json();
    const createdId = data.resume?.id;
    if (!createdId) redirect('/dashboard');

    const redirectUrl = action ? `/editor/${createdId}?action=${action}` : `/editor/${createdId}`;
    redirect(redirectUrl);
  }

  const resume = await prisma.resume.findFirst({
    where: { id: params.id, userId: user.id },
  });

  if (!resume) redirect('/dashboard');

  let content;
  try {
    content = JSON.parse(resume.content);
  } catch {
    content = emptyResumeContent();
  }

  return (
    <div className="w-full">
      <ResumeEditor
        resumeId={resume.id}
        initialTitle={resume.title}
        initialContent={content}
        initialTemplateId={resume.templateId}
        initialColorScheme={resume.colorScheme}
        userPlan={user.plan}
        initialAction={action}
      />
    </div>
  );
}
