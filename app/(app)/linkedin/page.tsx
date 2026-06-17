import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Linkedin, ArrowLeft, History, Sparkles } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { LinkedInAuditForm } from '@/components/forms/LinkedInAuditForm';

export default async function LinkedInPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  // Histórico recente
  const recent = await prisma.linkedInAudit.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      overallScore: true,
      area: true,
      targetJob: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Linkedin className="h-7 w-7 text-primary" />
            Auditoria de LinkedIn
          </h1>
          <p className="mt-1 text-muted-foreground">
            Cole o texto do seu perfil e receba uma nota 0–100 com sugestões práticas
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div>
          <LinkedInAuditForm />
        </div>

        <div className="space-y-4">
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">O que avaliamos</h2>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Headline (título profissional)</li>
              <li>• Seção &quot;Sobre&quot; / About</li>
              <li>• Experiências (datas, bullet points, números)</li>
              <li>• Habilidades técnicas detectadas</li>
              <li>• Formação e certificações</li>
              <li>• Projetos e portfólio</li>
              <li>• Consistência com a vaga-alvo</li>
            </ul>
          </Card>

          {recent.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <History className="h-4 w-4 text-primary" />
                <h2 className="font-semibold">Auditorias recentes</h2>
              </div>
              <ul className="space-y-2">
                {recent.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/linkedin/${a.id}`}
                      className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {a.area || a.targetJob || 'Perfil geral'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(a.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span
                        className={`ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          a.overallScore >= 70
                            ? 'bg-green-100 text-green-800'
                            : a.overallScore >= 50
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {a.overallScore}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
