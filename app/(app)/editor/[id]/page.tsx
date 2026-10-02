import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { emptyResumeContent } from '@/lib/validations/resume';
import { ResumeEditor } from '@/components/resume/ResumeEditor';

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ action?: string }>;

export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams?: SearchParams;
}) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const action = resolvedSearchParams?.action;

  const user = await getCurrentUser();
  if (!user) redirect('/login');

  if (id === 'new') {
    const { maxResumes } = user.limits;
    if (maxResumes !== -1) {
      const count = await prisma.resume.count({ where: { userId: user.id } });
      if (count >= maxResumes) {
        redirect('/dashboard?error=limit_reached');
      }
    }

    const created = await prisma.resume.create({
      data: {
        userId: user.id,
        title: 'Meu novo currículo',
        templateId: 'classic',
        content: JSON.stringify(emptyResumeContent()),
        colorScheme: 'blue',
      },
    });

    const redirectUrl = action ? `/editor/${created.id}?action=${action}` : `/editor/${created.id}`;
    redirect(redirectUrl);
  }

  const resume = await prisma.resume.findFirst({
    where: { id, userId: user.id },
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
      <Suspense fallback={<div className="flex h-[80vh] items-center justify-center text-muted-foreground">Carregando editor...</div>}>
        <ResumeEditor
          resumeId={resume.id}
          initialTitle={resume.title}
          initialContent={content}
          initialTemplateId={resume.templateId}
          initialColorScheme={resume.colorScheme}
          userPlan={user.plan}
          initialAction={action}
        />
      </Suspense>
    </div>
  );
}
