import Link from 'next/link';
import Image from 'next/image';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PlanCard } from '@/components/pricing/PlanCard';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'Planos · ATRION',
  description: 'Conheça os planos do ATRION e escolha o melhor para você',
};

export default async function PricingPage() {
  // Verifica se o usuário está logado (sem redirect — página pública)
  const user = await getCurrentUser();
  const isLoggedIn = !!user;
  const currentPlan = user?.plan ?? null;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background bg-page-gradient pb-24">
      {/* Navbar flutuante */}
      <header className="sticky top-4 z-40 mx-auto w-full max-w-5xl px-4 pt-4">
        <div className="flex h-14 items-center justify-between rounded-2xl border border-border/60 bg-card/85 px-4 shadow-sm backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Image src="/Logo-atrion.png" alt="ATRION" width={100} height={24} className="h-6 w-auto" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/" className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">Início</Link>
            <Link href="/#features" className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">Recursos</Link>
            <Link href="/pricing" className="rounded-full px-3 py-1.5 text-sm font-medium text-foreground bg-accent">Planos</Link>
            <Link href="/#contato" className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">Contato</Link>
          </nav>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Link href="/dashboard">
                <Button variant="primary" size="sm">Ir para o Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Entrar</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Começar grátis</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container flex flex-col items-center justify-center gap-4 py-16 text-center md:py-20">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Planos e Assinaturas
        </div>
        <h1 className="max-w-3xl text-balance text-4xl font-extrabold tracking-tight md:text-5xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
          Escolha o plano ideal para <span className="bg-gradient-to-r from-indigo-500 to-fuchsia-500 bg-clip-text text-transparent">sua carreira</span>
        </h1>
        <p className="max-w-2xl text-balance text-base text-muted-foreground">
          Comece grátis. Desbloqueie o poder total da inteligência artificial para conquistar sua próxima vaga.
        </p>
        {isLoggedIn && currentPlan && currentPlan !== 'FREE' && (
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <Check className="h-4 w-4" />
            Você está no plano {currentPlan === 'PRO' ? 'Pro' : 'Max'} — gerencie em{' '}
            <Link href="/settings" className="font-semibold underline underline-offset-2">Configurações</Link>
          </div>
        )}
      </section>

      {/* Planos principais */}
      <section className="container">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          <PlanCard
            name="Free"
            price="R$ 0"
            suffix="/para sempre"
            description="Perfeito para começar e testar"
            features={[
              '1 currículo ativo',
              '3 templates clássicos',
              'Análise básica com pontuação',
              '1 download em PDF por mês',
              "Marca d'água discreta",
            ]}
            cta={isLoggedIn && currentPlan === 'FREE' ? 'Plano atual' : 'Começar grátis'}
            href={isLoggedIn ? '/dashboard' : '/register'}
          />
          <PlanCard
            name="Pro Mensal"
            price="R$ 19,90"
            suffix="/mês"
            description="Acelere sua recolocação profissional"
            features={[
              'Até 10 currículos ativos',
              '10 análises completas por mês',
              '10 adaptações automáticas para vagas',
              '3 auditorias detalhadas do LinkedIn',
              'Todos os templates premium',
              'Downloads PDF ilimitados',
              "Sem marca d'água ATRION",
              'Suporte prioritário',
            ]}
            cta={isLoggedIn && currentPlan === 'PRO' ? 'Plano atual' : 'Assinar Pro'}
            href={isLoggedIn && currentPlan === 'PRO' ? '/settings' : '/api/stripe/checkout?plan=PRO'}
            highlight
            requiresAuth
            isLoggedIn={isLoggedIn}
          />
          <PlanCard
            name="Max Mensal"
            price="R$ 39,90"
            suffix="/mês"
            description="Máxima performance para sua carreira"
            features={[
              'Até 30 currículos ativos',
              '50 ações de IA por mês',
              '30 adaptações para vagas',
              '10 auditorias LinkedIn',
              'Análise ATS Avançada',
              'Comparação currículo × vaga',
              'Exportações ilimitadas',
              'Acesso antecipado a novos recursos',
            ]}
            cta={isLoggedIn && currentPlan === 'MAX' ? 'Plano atual' : 'Assinar Max'}
            href={isLoggedIn && currentPlan === 'MAX' ? '/settings' : '/api/stripe/checkout?plan=MAX'}
            requiresAuth
            isLoggedIn={isLoggedIn}
          />
        </div>

        {/* Compras avulsas */}
        <div className="mx-auto mt-20 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Pacotes Avulsos</h2>
            <p className="text-sm text-muted-foreground mt-2">Sem assinatura. Compre apenas o que precisar.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <PlanCard
              name="Auditoria Única"
              price="R$ 9,90"
              suffix="/avulso"
              description="Análise profunda e profissional"
              features={[
                '1 auditoria completa de LinkedIn/Currículo',
                'Pontuação ATS detalhada',
                'Diagnóstico de pontos fortes e fracos',
                'Palavras-chave recomendadas para o seu setor',
              ]}
              cta="Comprar Auditoria"
              href="/register?buy=audit"
            />
            <PlanCard
              name="Pacote Candidatura"
              price="R$ 14,90"
              suffix="/avulso"
              description="Preparo absoluto para a vaga dos seus sonhos"
              features={[
                '1 adaptação de currículo para a vaga',
                '1 análise ATS completa',
                '1 carta de apresentação personalizada',
                '1 versão final otimizada para download',
              ]}
              cta="Comprar Pacote"
              href="/register?buy=bundle"
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mt-20">
        <Card className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border/60 bg-card p-8 text-center shadow-md md:p-12">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/10 via-transparent to-fuchsia-500/10" />
          <h2 className="text-2xl font-bold">Pronto para a sua próxima entrevista?</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
            Crie seu primeiro currículo profissional com inteligência artificial em menos de 5 minutos.
          </p>
          <div className="mt-6 flex justify-center">
            <Link href={isLoggedIn ? '/dashboard' : '/register'}>
              <Button size="lg" className="gap-2">
                {isLoggedIn ? 'Ir para o Dashboard' : 'Criar minha conta grátis'}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Card>
      </section>

      <footer className="container mt-20 border-t border-border/60 pt-8 text-center text-xs text-muted-foreground">
        <p>ATRION · SaaS de currículos profissionais com IA + auditoria de LinkedIn</p>
      </footer>
    </main>
  );
}
