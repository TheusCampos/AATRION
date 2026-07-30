import Link from 'next/link';
import Image from 'next/image';
import { Check, ArrowRight, Sparkles, Linkedin, Instagram } from 'lucide-react';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import { PlanCard } from '@/components/pricing/PlanCard';
import { LandingMobileMenu } from '@/components/layout/LandingMobileMenu';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Planos · ATRION',
  description: 'Conheça os planos do ATRION e escolha o melhor para impulsionar sua carreira.',
};

export default async function PricingPage() {
  // Verifica se o usuário está logado (sem redirect — página pública)
  const user = await getCurrentUser();
  const isLoggedIn = !!user;
  const currentPlan = user?.plan ?? null;

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#F8FAFC] text-slate-900 selection:bg-blue-500/10 selection:text-blue-600">
      {/* Background grid pattern & decorative elements */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [-webkit-mask-image:polygon(0_0,100%_0,100%_100%,0_100%)] [mask-image:polygon(0_0,100%_0,100%_100%,0_100%)] opacity-40" />
      <div className="absolute top-20 left-10 -z-10 w-32 h-32 rotate-12 border border-blue-500/10 rounded-lg pointer-events-none" />
      <div className="absolute top-60 right-20 -z-10 w-24 h-24 -rotate-12 bg-blue-500/5 rounded-lg pointer-events-none" />

      {/* Header flutuante padronizado */}
      <header className="sticky top-4 z-40 mx-auto w-full max-w-6xl px-4 pt-4">
        <div className="flex h-16 items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-4 sm:px-6 shadow-sm backdrop-blur-md relative">
          <Link href="/" className="flex items-center gap-2 font-bold transition-opacity hover:opacity-95">
            <Image src="/Logo-atrion.png" alt="ATRION" width={110} height={26} className="h-6 w-auto" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <Link href="/" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              Início
            </Link>
            <Link href="/#templates" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              Templates
            </Link>
            <Link href="/#curriculo" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              Exemplo
            </Link>
            <Link href="/#features" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
              Recursos
            </Link>
            <Link href="/pricing" className="rounded-full px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50">
              Planos
            </Link>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <SignedOut>
              <Link
                href="/login"
                className="inline-flex h-10 items-center justify-center rounded-full px-3 sm:px-4 text-sm font-semibold text-slate-700 transition-colors hover:text-blue-600 hover:bg-slate-100 cursor-pointer"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-blue-600 px-4 sm:px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <span className="hidden sm:inline">Começar grátis</span>
                <span className="sm:hidden">Começar</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-blue-600 px-4 sm:px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:scale-[1.01] active:scale-95 cursor-pointer"
              >
                <span className="hidden sm:inline">Acessar Painel</span>
                <span className="sm:hidden">Painel</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </SignedIn>
            <LandingMobileMenu />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 pt-12 pb-12 md:pt-16 md:pb-16 text-center">
        <div className="mx-auto max-w-3xl flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-3 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" /> Investimento
          </span>
          <h1 className="text-balance font-sans text-4xl font-extrabold leading-[1.15] tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
            Escolha o plano ideal para{' '}
            <span
              className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
              style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              sua carreira
            </span>
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 md:text-lg">
            Comece grátis. Desbloqueie o poder total da inteligência artificial para conquistar sua próxima vaga.
          </p>

          {isLoggedIn && currentPlan && currentPlan !== 'FREE' && (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
              <Check className="h-4 w-4 text-emerald-600" />
              Você está no plano <strong className="font-bold">{currentPlan === 'PRO' ? 'Pro' : 'Max'}</strong> — gerencie em{' '}
              <Link href="/settings" className="font-semibold underline underline-offset-2 hover:text-emerald-800">
                Configurações
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Planos Principais Mensais */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="grid gap-6 md:grid-cols-3 items-stretch">
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
      </section>

      {/* Planos Semanais */}
      <section className="mx-auto max-w-6xl px-4 py-16 border-t border-slate-200/60">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Acesso Pontual</span>
          <h2 className="mt-2 font-sans text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Planos Semanais
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
            Acesso por 7 dias. Compre apenas o período que precisar, sem renovação automática.
          </p>
        </div>
        <div className="grid gap-6 max-w-4xl mx-auto md:grid-cols-2 items-stretch">
          <PlanCard
            name="Plano Semanal"
            price="R$ 9,90"
            suffix="/semana"
            description="Acesso completo aos recursos de auditoria por 7 dias"
            features={[
              '1 auditoria completa de LinkedIn/Currículo',
              'Pontuação ATS detalhada',
              'Diagnóstico de pontos fortes e fracos',
              'Palavras-chave recomendadas para o seu setor',
              'Sem renovação automática',
            ]}
            cta="Contratar Plano Semanal"
            href="/api/stripe/checkout?plan=UNIC"
            requiresAuth
            isLoggedIn={isLoggedIn}
          />
          <PlanCard
            name="Plano PC Max Semanal"
            price="R$ 14,90"
            suffix="/semana"
            description="Preparo absoluto para a vaga dos seus sonhos por 7 dias"
            features={[
              '1 adaptação de currículo para a vaga',
              '1 análise ATS completa',
              '1 carta de apresentação personalizada',
              '1 versão final otimizada para download',
              'Sem renovação automática',
            ]}
            cta="Contratar PC Max Semanal"
            href="/api/stripe/checkout?plan=CANDIDATURA"
            highlight
            requiresAuth
            isLoggedIn={isLoggedIn}
          />
        </div>
      </section>

      {/* Banner CTA Final */}
      <section className="py-16 md:py-20 bg-white border-t border-slate-200/60">
        <div className="mx-auto max-w-6xl px-4">
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-t from-blue-950 to-blue-600 p-8 md:p-12 text-white shadow-lg shadow-blue-500/10">
            <div className="absolute top-0 right-0 w-96 h-full bg-white/5 -skew-x-12 translate-x-10 pointer-events-none" />

            <div className="grid gap-8 md:grid-cols-12 md:items-center relative z-10">
              <div className="md:col-span-7 text-left">
                <h2 className="font-sans text-3xl font-extrabold tracking-tight md:text-4xl text-white">
                  Alavanque sua recolocação profissional agora
                </h2>
                <p className="mt-4 max-w-xl text-blue-100 text-sm leading-relaxed">
                  Crie seu primeiro currículo otimizado com nossa inteligência artificial em menos de 5 minutos. Rápido, profissional e gratuito.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <SignedOut>
                    <Link href="/register">
                      <button
                        type="button"
                        className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-6 text-xs font-bold text-blue-600 shadow-sm transition-all hover:bg-slate-50 cursor-pointer"
                      >
                        Cadastrar Grátis <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </Link>
                    <Link href="/login">
                      <button
                        type="button"
                        className="inline-flex h-11 items-center gap-1 rounded-full border border-white/30 px-5 text-xs font-bold text-white transition-colors hover:bg-white/10 cursor-pointer"
                      >
                        Entrar
                      </button>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <button
                        type="button"
                        className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-6 text-xs font-bold text-blue-600 shadow-sm transition-all hover:bg-slate-50 cursor-pointer"
                      >
                        Ir para o Painel <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </Link>
                  </SignedIn>
                  <Link
                    href="/#features"
                    className="inline-flex h-11 items-center px-4 text-xs font-bold text-blue-100 hover:text-white transition-colors"
                  >
                    Conhecer recursos
                  </Link>
                </div>
              </div>

              <div className="md:col-span-5 flex justify-center relative">
                <div className="w-full relative">
                  <Image
                    src="/dados_atrion.png"
                    alt="Gráficos e dados da plataforma ATRION"
                    width={400}
                    height={300}
                    className="w-full h-auto object-contain drop-shadow-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Padronizado */}
      <footer className="relative bg-gradient-to-t from-blue-950 to-blue-600 text-blue-100 py-16 overflow-hidden">
        <div className="absolute inset-0 z-0 select-none pointer-events-none opacity-30 flex items-center justify-center p-8 mix-blend-overlay">
          <Image
            src="/Logo-atrion-fundo.png"
            alt=""
            fill
            className="object-contain object-center"
          />
        </div>

        <div className="mx-auto max-w-6xl px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start gap-3">
              <Image src="/Logo-atrion-fundo.png" alt="ATRION" width={150} height={50} className="h-6 w-auto" />
              <p className="text-xs text-blue-200">
                Otimizando sua recolocação com inteligência artificial.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs font-medium text-white">
              <Link href="/#templates" className="hover:text-blue-200 transition-colors">Templates</Link>
              <Link href="/pricing" className="hover:text-blue-200 transition-colors">Planos</Link>
              <Link href="/termos" className="hover:text-blue-200 transition-colors">Termos</Link>
              <Link href="/privacidade" className="hover:text-blue-200 transition-colors">Privacidade</Link>
              <Link href="/#curriculo" className="hover:text-blue-200 transition-colors">Exemplo</Link>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-blue-400/30 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-blue-200">
            <p>© {new Date().getFullYear()} ATRION. Todos os direitos reservados.</p>

            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
