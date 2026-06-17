import Link from 'next/link';
import { FileText, Github, BookOpen, Code, Sparkles, Linkedin, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export const metadata = {
  title: 'Documentação · ATRION',
  description: 'Documentação técnica e guias do ATRION',
};

const sections = [
  {
    icon: <FileText className="h-5 w-5" />,
    title: 'Documentação do Projeto',
    description: 'Visão geral, arquitetura, schema do banco e decisões técnicas.',
    href: '/docs',
    internal: true,
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    title: 'Guia do Usuário',
    description: 'Como criar currículos, importar arquivos e auditar seu LinkedIn.',
    href: '/docs',
    internal: true,
  },
  {
    icon: <Code className="h-5 w-5" />,
    title: 'API Reference',
    description: 'Endpoints REST, autenticação, rate limiting e exemplos.',
    href: '/docs',
    internal: true,
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    title: 'Roadmap',
    description: 'Veja o que está em desenvolvimento e o que vem por aí.',
    href: '/docs',
    internal: true,
  },
  {
    icon: <Linkedin className="h-5 w-5" />,
    title: 'Auditoria LinkedIn',
    description: 'Como funciona a análise heurística do seu perfil profissional.',
    href: '/docs',
    internal: true,
  },
  {
    icon: <Github className="h-5 w-5" />,
    title: 'Repositório',
    description: 'Código-fonte, issues e contribuição no GitHub.',
    href: 'https://github.com',
    internal: false,
  },
];

export default function DocsIndexPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="text-primary">ATRION</span>
        </Link>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Voltar ao início
        </Link>
      </header>

      <section className="container max-w-4xl py-16 md:py-24">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight md:text-5xl">
            Documentação
          </h1>
          <p className="mx-auto max-w-2xl text-balance text-lg text-muted-foreground">
            Tudo o que você precisa para entender, usar e contribuir com o ATRION.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {sections.map((s) => (
            <Link
              key={s.title}
              href={s.href}
              target={s.internal ? '_self' : '_blank'}
              rel={s.internal ? undefined : 'noreferrer'}
              className="block group"
            >
              <Card className="h-full p-6 transition-all hover:border-primary hover:shadow-md">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {s.icon}
                </div>
                <h3 className="mb-1 text-lg font-semibold flex items-center gap-2">
                  {s.title}
                  <ArrowRight className="h-4 w-4 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1" />
                </h3>
                <p className="text-sm text-muted-foreground">{s.description}</p>
              </Card>
            </Link>
          ))}
        </div>

        <Card className="mt-12 p-8 bg-secondary/20">
          <h2 className="mb-2 text-xl font-semibold">📁 Documentação interna</h2>
          <p className="text-sm text-muted-foreground">
            Toda a documentação técnica completa do projeto está disponível na pasta{' '}
            <code className="rounded bg-background px-1.5 py-0.5 text-xs font-mono">/docs</code>{ ' '}
            do repositório, incluindo arquitetura, fluxos, features e roadmap.
          </p>
        </Card>
      </section>
    </main>
  );
}
