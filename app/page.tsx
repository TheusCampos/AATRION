'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FileText,
  Sparkles,
  Linkedin,
  Check,
  ArrowRight,
  Zap,
  Target,
  ShieldCheck,
  BarChart3,
  Globe2,
  Briefcase,
} from 'lucide-react';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { fadeUp, fadeIn, fadeDown, staggerContainer, hoverLift, scaleIn } from '@/lib/animations';

export default function HomePage() {
  const reduce = useReducedMotion();
  const motionProps = (variants: Parameters<typeof motion.div>[0]['variants']) =>
    reduce ? undefined : { initial: 'hidden', animate: 'visible', variants };

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-background bg-page-gradient">
      {/* === Header / Navbar (minimalista, flutuante) === */}
      <motion.header
        variants={reduce ? undefined : fadeDown}
        initial={reduce ? false : 'hidden'}
        animate={reduce ? false : 'visible'}
        className="sticky top-4 z-40 mx-auto w-full max-w-5xl px-4"
      >
        <div className="flex h-14 items-center justify-between rounded-2xl border border-border/60 bg-card/80 px-4 shadow-sm backdrop-blur-md">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Image src="/Logo-atrion.png" alt="ATRION" width={100} height={24} className="h-6 w-auto" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="/">Início</NavLink>
            <NavLink href="#features">Recursos</NavLink>
            <NavLink href="#pricing">Planos</NavLink>
            <NavLink href="#contato">Contato</NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <button
                  type="button"
                  className="hidden h-9 items-center justify-center rounded-full px-4 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground sm:inline-flex"
                >
                  Entrar
                </button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-medium text-background shadow-sm transition-transform hover:scale-[1.02] active:scale-95"
                >
                  Começar grátis <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-medium text-background shadow-sm transition-transform hover:scale-[1.02] active:scale-95"
              >
                Acessar Painel <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </SignedIn>
          </div>
        </div>
      </motion.header>

      {/* === Hero === */}
      <section className="container relative flex flex-col items-center justify-center gap-7 pt-20 pb-20 text-center md:pt-28">
        <motion.div
          {...motionProps(fadeUp)}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur"
        >
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          SaaS de currículos com IA · 100% em português
        </motion.div>

        <motion.h1
          {...motionProps(fadeUp)}
          className="max-w-4xl text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl lg:text-7xl"
        >
          Currículos que{' '}
          <span className="bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
            passam no ATS
          </span>{' '}
          e conquistam recrutadores.
        </motion.h1>

        <motion.p
          {...motionProps(fadeUp)}
          className="max-w-2xl text-pretty text-base text-muted-foreground md:text-lg"
        >
          Crie currículos em minutos, adapte para cada vaga com IA e audite seu
          LinkedIn — tudo em um só lugar, com templates profissionais prontos.
        </motion.p>

        <motion.div
          {...motionProps(fadeUp)}
          className="flex flex-col items-center gap-3 sm:flex-row"
        >
          <SignedOut>
            <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
              <motion.button
                {...hoverLift}
                type="button"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-shadow hover:shadow-xl hover:shadow-indigo-500/30"
              >
                Começar grátis
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </motion.button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <motion.button
                {...hoverLift}
                type="button"
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-600 px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-shadow hover:shadow-xl hover:shadow-indigo-500/30"
              >
                Ir para o Painel
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </motion.button>
            </Link>
          </SignedIn>
          <Link href="#pricing" className="inline-flex h-12 items-center px-2 text-sm font-medium text-muted-foreground hover:text-foreground">
            Ver planos →
          </Link>
        </motion.div>

        <motion.p
          {...motionProps(fadeIn)}
          className="text-xs text-muted-foreground"
        >
          Sem cartão · 3 currículos grátis · Cancele quando quiser
        </motion.p>

        {/* Visual decorativo */}
        <motion.div
          aria-hidden
          initial={reduce ? false : { opacity: 0, y: 30 }}
          animate={reduce ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 w-full max-w-5xl"
        >
          <HeroMockup />
        </motion.div>
      </section>

      {/* === Logos / Social proof (simbolico) === */}
      <motion.section
        {...motionProps(fadeIn)}
        className="container pb-16"
      >
        <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Usado por profissionais em mais de 12 áreas
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-muted-foreground">
          {['Tecnologia', 'Marketing', 'Direito', 'Saúde', 'Engenharia', 'Design', 'Vendas', 'Educação'].map(
            (label) => (
              <span key={label} className="opacity-70 hover:opacity-100 transition-opacity">
                {label}
              </span>
            )
          )}
        </div>
      </motion.section>

      {/* === Features === */}
      <section id="features" className="container scroll-mt-20 py-16 md:py-24">
        <motion.div
          {...motionProps(fadeUp)}
          className="mx-auto mb-12 max-w-2xl text-center"
        >
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Tudo que você precisa, nada do que você não precisa.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Foco em resultado: currículos que te levam para a próxima entrevista.
          </p>
        </motion.div>

        <motion.div
          {...motionProps(staggerContainer(0.08, 0.1))}
          className="grid gap-4 md:grid-cols-3"
        >
          {[
            {
              icon: <FileText className="h-5 w-5" />,
              title: 'Análise de currículo',
              desc: 'A IA avalia o currículo e mostra problemas, pontuação e melhorias detalhadas passo a passo.',
            },
            {
              icon: <Sparkles className="h-5 w-5" />,
              title: 'Adaptação por vaga',
              desc: 'Cole a descrição da vaga e a IA reescreve seu currículo, reordena habilidades e adiciona keywords.',
            },
            {
              icon: <Linkedin className="h-5 w-5" />,
              title: 'Auditoria LinkedIn',
              desc: 'Nota 0–100 do seu perfil, sugestões por seção, ideias de post e consistência com o currículo.',
            },
            {
              icon: <Target className="h-5 w-5" />,
              title: 'Score ATS objetivo',
              desc: 'Veja sua nota ATS, com correções e exemplos de antes/depois que você aplica em 1 clique.',
            },
            {
              icon: <Zap className="h-5 w-5" />,
              title: 'Velocidade real',
              desc: 'Sem travar. Sem tabs infinitas. Apenas o que importa para terminar em minutos.',
            },
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              title: 'Privacidade primeiro',
              desc: 'Seus dados ficam no seu banco. Você é dono do seu currículo, não a ferramenta.',
            },
          ].map((f) => (
            <motion.div key={f.title} variants={fadeUp} {...hoverLift}>
              <FeatureCard icon={f.icon} title={f.title} description={f.desc} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* === Pricing === */}
      <section id="pricing" className="container scroll-mt-20 py-16 md:py-24">
        <motion.div {...motionProps(fadeUp)} className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Planos simples
          </h2>
          <p className="mt-3 text-muted-foreground">
            Comece grátis. Faça upgrade quando precisar de mais.
          </p>
        </motion.div>

        <motion.div
          {...motionProps(staggerContainer(0.1, 0.1))}
          className="grid gap-4 md:grid-cols-3"
        >
          <Plan
            name="Free"
            price="R$ 0"
            features={['1 currículo ativo', 'Análise básica com pontuação e 3 sugestões', '3 templates', "Marca d'água discreta"]}
            cta="Começar grátis"
            href="/register"
          />
          <Plan
            name="Pro"
            price="R$ 19,90"
            suffix="/mês"
            highlight
            features={['10 currículos ativos', '10 análises completas', '10 adaptações para vagas', '3 auditorias LinkedIn', 'Suporte prioritário']}
            cta="Assinar Pro"
            href="/pricing"
          />
          <Plan
            name="Max"
            price="R$ 39,90"
            suffix="/mês"
            features={['30 currículos', '50 ações de IA completas', '10 auditorias LinkedIn', 'Acesso antecipado a recursos']}
            cta="Assinar Max"
            href="/pricing"
          />
        </motion.div>
      </section>

      {/* === CTA final === */}
      <section className="container py-16 md:py-24">
        <motion.div
          {...motionProps(scaleIn)}
          className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl border border-border bg-card p-8 text-center shadow-sm md:p-12"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/10 via-transparent to-fuchsia-500/10" />
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Pronto para a próxima entrevista?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
            Crie seu primeiro currículo com IA em menos de 5 minutos. Sem cartão de crédito.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <SignedOut>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <motion.button
                  {...hoverLift}
                  type="button"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background shadow-md"
                >
                  Começar grátis <ArrowRight className="h-4 w-4" />
                </motion.button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <motion.button
                  {...hoverLift}
                  type="button"
                  className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-6 text-sm font-semibold text-background shadow-md"
                >
                  Ir para o Painel <ArrowRight className="h-4 w-4" />
                </motion.button>
              </Link>
            </SignedIn>
            <Link
              href="#features"
              className="inline-flex h-12 items-center px-4 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Ver recursos
            </Link>
          </div>
        </motion.div>
      </section>

      <footer className="container border-t border-border/60 py-8">
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground md:flex-row">
          <p>© {new Date().getFullYear()} ATRION · Construído com Next.js, Tailwind, Framer Motion e Clerk.</p>
          <div className="flex items-center gap-4">
            <Link href="#contato" className="hover:text-foreground">Contato</Link>
            <Link href="/pricing" className="hover:text-foreground">Planos</Link>
            <SignedOut>
              <Link href="/login" className="hover:text-foreground">Entrar</Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="hover:text-foreground">Painel</Link>
            </SignedIn>
          </div>
        </div>
      </footer>
    </main>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </Link>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group h-full rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur transition-colors hover:border-border hover:bg-card">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/10 text-indigo-600 ring-1 ring-inset ring-indigo-500/20">
        {icon}
      </div>
      <h3 className="mb-2 text-base font-semibold tracking-tight">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function Plan({
  name,
  price,
  suffix,
  features,
  highlight = false,
  cta,
  href,
}: {
  name: string;
  price: string;
  suffix?: string;
  features: string[];
  highlight?: boolean;
  cta: string;
  href: string;
}) {
  return (
    <motion.div variants={fadeUp} {...hoverLift}>
      <div
        className={`relative flex flex-col h-full rounded-2xl border p-6 transition-colors ${highlight
            ? 'border-transparent bg-foreground text-background shadow-2xl shadow-indigo-500/20'
            : 'border-border/60 bg-card/70 text-foreground backdrop-blur'
          }`}
      >
        {highlight && (
          <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
            Mais popular
          </span>
        )}
        <div className={`mb-1 text-sm font-medium ${highlight ? 'text-background/70' : 'text-muted-foreground'}`}>{name}</div>
        <div className="mb-5 flex items-baseline gap-1">
          <span className="text-3xl font-bold tracking-tight">{price}</span>
          {suffix && <span className={`text-sm ${highlight ? 'text-background/60' : 'text-muted-foreground'}`}>{suffix}</span>}
        </div>
        <ul className="mb-6 flex-1 space-y-2.5 text-sm">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${highlight ? 'text-emerald-400' : 'text-indigo-500'}`} />
              <span className={highlight ? 'text-background/85' : 'text-foreground/80'}>{f}</span>
            </li>
          ))}
        </ul>
        <Link href={href} className={`mt-auto inline-flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold transition-colors ${highlight ? 'bg-background text-foreground hover:bg-background/90' : 'bg-foreground text-background hover:bg-foreground/90'}`}>
          {cta}
        </Link>
      </div>
    </motion.div>
  );
}

function HeroMockup() {
  return (
    <div className="relative mx-auto rounded-2xl border border-border/60 bg-card/80 p-3 shadow-2xl shadow-indigo-500/10 backdrop-blur">
      <div className="rounded-xl border border-border/60 bg-background">
        {/* Mockup "editor" - minimalista */}
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
          </div>
          <span className="ml-3 text-xs text-muted-foreground">currículo-marcos-souza.pdf</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">ATS Score</span>
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
              92 / 100
            </span>
          </div>
        </div>
        <div className="grid gap-4 p-6 md:grid-cols-3">
          <Stat icon={<BarChart3 className="h-3.5 w-3.5" />} label="Palavras-chave" value="14/15" />
          <Stat icon={<Globe2 className="h-3.5 w-3.5" />} label="Idiomas" value="2" />
          <Stat icon={<Briefcase className="h-3.5 w-3.5" />} label="Experiências" value="4" />
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600">
        {icon}
      </span>
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
