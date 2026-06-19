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

  // SEC-004: Criação de currículo agora passa pela API para respeitar limites do plano.
  // Antes, fazia prisma.resume.create() diretamente, bypassando maxResumes.
  if (params.id === 'new') {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/resumes`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Meu novo currículo' }),
        // Forward cookies for auth in SSR context
        cache: 'no-store',
      }
    );

    if (!res.ok) {
      // Se falhou (ex: limite do plano atingido), redireciona para o dashboard
      redirect('/dashboard');
    }

    const data = await res.json();
    const createdId = data.resume?.id;
    if (!createdId) redirect('/dashboard');

    const redirectUrl = action ? `/editor/${createdId}?action=${action}` : `/editor/${createdId}`;
    redirect(redirectUrl);
  }

  // Carrega currículo existente
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
