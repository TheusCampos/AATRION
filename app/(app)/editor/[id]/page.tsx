import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { emptyResumeContent } from '@/lib/validations/resume';
import { ResumeEditor } from '@/components/resume/ResumeEditor';

type Params = { id: string };

export default async function EditorPage({ params }: { params: Params }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Rota "new" → cria currículo vazio e redireciona para o ID
  if (params.id === 'new') {
    const created = await prisma.resume.create({
      data: {
        userId: user.id,
        title: 'Meu novo currículo',
        content: JSON.stringify(emptyResumeContent()),
      },
    });
    redirect(`/editor/${created.id}`);
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
    <div className="-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 max-w-[1600px] mx-auto">
      <ResumeEditor
        resumeId={resume.id}
        initialTitle={resume.title}
        initialContent={content}
        initialTemplateId={resume.templateId}
        initialColorScheme={resume.colorScheme}
      />
    </div>
  );
}
