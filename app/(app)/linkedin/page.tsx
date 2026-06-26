import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Linkedin, ArrowLeft, History, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LinkedInAuditForm } from '@/components/forms/LinkedInAuditForm';

export const dynamic = 'force-dynamic';

export default async function LinkedInPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const isPro = user.plan === 'PRO' || user.plan === 'MAX';

  // Histórico recente (mostrar mesmo para FREE para que vejam o que perderam)
  const recent = isPro
    ? await prisma.linkedInAudit.findMany({
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
      })
    : [];

  // Usuário FREE: mostra card de upgrade em vez do formulário
  if (!isPro) {
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
              Analise profunda do seu perfil com IA — disponível no plano Pro
            </p>
          </div>
        </div>

        {/* Card de bloqueio */}
        <Card className="relative overflow-hidden rounded-3xl border border-indigo-200/60 bg-gradient-to-br from-indigo-50 via-white to-fuchsia-50 p-8 text-center shadow-md">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/5 via-transparent to-fuchsia-500/5" />
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Recurso exclusivo do plano Pro</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-600 leading-relaxed">
            A Auditoria de LinkedIn usa IA para analisar seu perfil profissional e gerar uma nota de 0 a 100
            com sugestões práticas para aumentar suas chances de ser recrutado.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3 max-w-lg mx-auto text-left">
            {[
              'Nota geral 0–100 do perfil',
              'Análise de headline, about e experiências',
              'Sugestões de posts para mais alcance',
              'Palavras-chave para recrutadores',
              'Diagnóstico de pontos fracos',
              'Dicas para cada seção do LinkedIn',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-slate-700">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/pricing">
              <Button variant="primary" className="gap-2 px-6">
                <Sparkles className="h-4 w-4" />
                Ver planos e assinar
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary">Voltar ao Dashboard</Button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Plano Pro a partir de R$ 19,90/mês · Cancele quando quiser
          </p>
        </Card>
      </div>
    );
  }

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
