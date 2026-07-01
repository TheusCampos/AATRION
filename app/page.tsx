'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FileText,
  Linkedin,
  Check,
  ArrowRight,
  Zap,
  Target,
  ShieldCheck,
  Instagram,
  Crosshair,
} from 'lucide-react';
import { SignInButton, SignUpButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { fadeUp, fadeIn, fadeDown, staggerContainer, hoverLift, scaleIn } from '@/lib/animations';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
const ResumeCardPreview = dynamic(
  () => import('@/components/resume/ResumeCardPreview').then(m => m.ResumeCardPreview),
  { ssr: false, loading: () => <div className="h-40 w-full bg-slate-100 rounded-lg animate-pulse" /> }
);
const Resume3DShowcase = dynamic(
  () => import('@/components/resume/Resume3DShowcase').then(mod => mod.Resume3DShowcase),
  { ssr: false }
);
import type { ResumeContent } from '@/lib/validations/resume';

const DUMMY_CONTENT: ResumeContent = {
  personal: {
    name: "Nome Completo",
    jobTitle: "Cargo Profissional",
    email: "[EMAIL_ADDRESS]",
    phone: "(65) 99999-9999",
    location: "Cuiabá, MT",
    linkedin: "linkedin.com/in/nome",
    github: "",
    website: "",
    summary: "Resumo profissional direto ao ponto destacando suas principais habilidades, experiências relevantes e objetivos de carreira. Ideal para causar uma boa primeira impressão.",
    photo: "",
  },
  experience: [
    {
      id: "1",
      company: "Empresa Exemplo S.A.",
      role: "Cargo Principal",
      start: "2021-01",
      end: "",
      current: true,
      description: "• Liderança e execução de projetos estratégicos.\n• Colaboração em equipes multidisciplinares.\n• Foco em entrega de resultados e qualidade.",
    }
  ],
  education: [
    {
      id: "1",
      institution: "Universidade Global",
      course: "Bacharelado Completo",
      level: "Graduação",
      start: "2014-02",
      end: "2017-12",
    }
  ],
  skills: [
    { id: "1", name: "Habilidade Técnica 1", level: "advanced" },
    { id: "2", name: "Habilidade Técnica 2", level: "advanced" },
    { id: "3", name: "Liderança", level: "intermediate" }
  ],
  projects: [],
  languages: [],
  certifications: []
};

import { LandingMobileMenu } from '@/components/layout/LandingMobileMenu';

export default function HomePage() {
  const reduce = useReducedMotion();
  const [selectedTemplate, setSelectedTemplate] = useState<'modern' | 'classic' | 'creative' | 'sidebar'>('modern');
  // mounted garante que animações só aplicam no cliente confirmado
  // Evita elementos presos em opacity:0 quando framer-motion nao dispara
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Animações apenas quando montado no cliente — fallback: sem animação (conteúdo visível)
  const motionProps = (variants: Parameters<typeof motion.div>[0]['variants']) => {
    if (!mounted || reduce) return undefined;
    return { initial: 'hidden', animate: 'visible', variants };
  };



  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#F8FAFC] text-slate-900 selection:bg-blue-500/10 selection:text-blue-600">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [-webkit-mask-image:polygon(0_0,100%_0,100%_100%,0_100%)] [mask-image:polygon(0_0,100%_0,100%_100%,0_100%)] opacity-40" />
      <div
        className="absolute top-20 left-10 -z-10 w-32 h-32 rotate-12 border border-blue-500/10 rounded-lg pointer-events-none"
      />
      <div
        className="absolute top-60 right-20 -z-10 w-24 h-24 -rotate-12 bg-blue-500/5 rounded-lg pointer-events-none"
      />
      <motion.header
        variants={mounted && !reduce ? fadeDown : undefined}
        initial={mounted && !reduce ? 'hidden' : false}
        animate={mounted && !reduce ? 'visible' : false}
        className="sticky top-4 z-40 mx-auto w-full max-w-6xl px-4"
      >
        <div className="flex h-16 items-center justify-between rounded-2xl border border-slate-200/80 bg-white/80 px-4 sm:px-6 shadow-sm backdrop-blur-md relative">
          <Link href="/" className="flex items-center gap-2 font-bold transition-opacity hover:opacity-95">
            <Image src="/Logo-atrion.png" alt="ATRION" width={110} height={26} className="h-6 w-auto" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="/">Início</NavLink>
            <NavLink href="/#templates">Templates</NavLink>
            <NavLink href="/#curriculo">Exemplo</NavLink>
            <NavLink href="/#features">Recursos</NavLink>
            <NavLink href="/#pricing">Planos</NavLink>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <button
                  type="button"
                  className="hidden h-10 items-center justify-center rounded-full px-4 text-sm font-semibold text-slate-700 transition-colors hover:text-slate-950 sm:inline-flex"
                >
                  Entrar
                </button>
              </SignInButton>
              <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full bg-blue-600 px-4 sm:px-5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:scale-[1.01] active:scale-95 cursor-pointer"
                >
                  <span className="hidden sm:inline">Começar grátis</span>
                  <span className="sm:hidden">Começar</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </SignUpButton>
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
      </motion.header>

      <section className="mx-auto max-w-6xl px-4 pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">

          <div className="flex flex-col items-start text-left lg:col-span-5">
            <motion.h1
              {...motionProps(fadeUp)}
              className="text-balance font-sans text-4xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl md:text-6xl"
            >
              Crie currículos que{' '}
              <span
                className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
              >
                passam no ATS
              </span>{' '}
              e se destaque.
            </motion.h1>

            <motion.p
              {...motionProps(fadeUp)}
              className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-slate-600 md:text-lg"
            >
              Crie um currículo profissional em poucos minutos, com ajuda da IA, e aumente suas chances de chamar atenção dos recrutadores.
            </motion.p>

            <motion.div
              {...motionProps(fadeUp)}
              className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center w-full sm:w-auto"
            >
              <SignedOut>
                <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                  <motion.button
                    {...hoverLift}
                    type="button"
                    className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Criar Currículo Grátis
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <motion.button
                    {...hoverLift}
                    type="button"
                    className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-colors w-full cursor-pointer"
                  >
                    Ir para o Painel
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </Link>
              </SignedIn>
              <Link href="#templates" className="inline-flex h-12 items-center justify-center px-4 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">
                Ver templates
              </Link>
            </motion.div>

            <motion.p
              {...motionProps(fadeIn)}
              className="mt-4 text-xs text-slate-500"
            >
              Sem cartão de crédito · 1 currículo grátis · Exportação de PDF com marca d&apos;água
            </motion.p>
          </div>

          <div className="lg:col-span-7 flex justify-center lg:justify-end">
            <motion.div
              initial={mounted && !reduce ? { opacity: 0, scale: 0.98, x: 15 } : false}
              animate={mounted && !reduce ? { opacity: 1, scale: 1, x: 0 } : false}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[640px]"
            >
              <div>
                <Image
                  src="/home.png"
                  alt="Interface do Gerador de Currículos ATRION"
                  width={640}
                  height={480}
                  priority
                  className="w-full h-auto object-contain"
                />
              </div>
            </motion.div>
          </div>

        </div>
      </section>

      <section id="curriculo" className="relative border-y border-slate-200/60 bg-slate-50 py-20 md:py-24 overflow-hidden">
        <div
          className="absolute top-10 left-10 w-64 h-64 border-2 border-blue-100 rotate-45 pointer-events-none opacity-50"
        />
        <div
          className="absolute bottom-10 right-20 w-48 h-48 bg-indigo-50 rotate-12 pointer-events-none"
        />

        <div className="mx-auto max-w-6xl px-4 relative">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">

            <div className="lg:col-span-5 flex flex-col items-start">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-600">ATS Performance</span>
              <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                O resultado final que abre portas de emprego
              </h2>
              <p className="mt-4 text-slate-600 leading-relaxed text-sm">
                Seu currículo é gerado com base nas regras mais estritas que os sistemas de recrutamento (ATS) e recrutadores estão usando agora. Visual limpo, hierarquia clara e leitura facilitada.
              </p>

              <motion.div
                initial={mounted && !reduce ? 'hidden' : false}
                whileInView={mounted && !reduce ? 'visible' : undefined}
                viewport={{ once: true, amount: 0 }}
                variants={staggerContainer(0.15)}
                className="mt-8 space-y-5 w-full"
              >
                {[
                  { title: 'Otimização com Palavras-chave', text: 'Atraia a atenção dos recrutadores e passe pelos filtros de IA.' },
                  { title: 'Formatos Aprovados por Recrutadores', text: 'Layouts limpos e compatíveis com os critérios de grandes empresas e consultorias.' },
                  { title: 'Score de Qualidade em Tempo Real', text: 'Entenda o desempenho do seu currículo e melhore antes de enviar.' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    variants={fadeUp}
                    className="flex gap-4 group cursor-default"
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm shadow-blue-500/10">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-none">{item.title}</h4>
                      <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            <div className="lg:col-span-7 relative">
              <motion.div
                initial={mounted && !reduce ? { opacity: 0, x: 20 } : false}
                whileInView={mounted && !reduce ? { opacity: 1, x: 0 } : undefined}
                viewport={{ once: true, amount: 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full"
              >
                <div>
                  <Image
                    src="/sobre_atrion.png"
                    alt="Plataforma ATRION - Performance ATS"
                    width={800}
                    height={600}
                    className="w-full h-auto object-contain drop-shadow-xl"
                  />
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      <section id="templates" className="relative bg-white py-20 md:py-24 overflow-hidden">
        <div
          className="absolute -left-20 top-40 w-96 h-96 border border-slate-100 rotate-[30deg] pointer-events-none"
        />
        <div
          className="absolute right-10 bottom-20 w-32 h-32 bg-blue-50/50 rotate-45 pointer-events-none"
        />

        <div className="mx-auto max-w-6xl px-4 relative z-10">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Templates Profissionais</span>
            <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Modelos projetados para cada objetivo de carreira
            </h2>
            <p className="mt-3 text-slate-500 text-sm max-w-xl mx-auto">
              Escolha entre templates otimizados e 100% compatíveis com ATS. Desenhos modernos que comunicam profissionalismo e facilitam a leitura dos recrutadores.
            </p>
          </div>

          <motion.div
            initial={mounted && !reduce ? 'hidden' : false}
            whileInView={mounted && !reduce ? 'visible' : undefined}
            viewport={{ once: true, amount: 0 }}
            variants={fadeUp}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            <div
              onClick={() => setSelectedTemplate('modern')}
              className={`group flex flex-col justify-between h-full rounded-2xl border p-5 bg-white cursor-pointer transition-all duration-300 ${selectedTemplate === 'modern'
                ? 'border-blue-600 shadow-md shadow-blue-500/5 ring-1 ring-blue-600/10'
                : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
            >
              <div>
                <div className="rounded-lg overflow-hidden border border-slate-100 mb-4 bg-slate-50 relative">
                  <ResumeCardPreview content={DUMMY_CONTENT} templateId="modern" className="h-40" />
                </div>

                <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                  Moderno
                  <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">Mais usado</span>
                </h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Design contemporâneo e limpo, ideal para quase todas as áreas profissionais.
                </p>
              </div>
              <button
                type="button"
                className={`mt-4 w-full h-8 text-xs font-bold rounded-lg transition-colors cursor-pointer ${selectedTemplate === 'modern' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                Selecionar
              </button>
            </div>

            <div
              onClick={() => setSelectedTemplate('classic')}
              className={`group flex flex-col justify-between h-full rounded-2xl border p-5 bg-white cursor-pointer transition-all duration-300 ${selectedTemplate === 'classic'
                ? 'border-blue-600 shadow-md shadow-blue-500/5 ring-1 ring-blue-600/10'
                : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
            >
              <div>
                <div className="rounded-lg overflow-hidden border border-slate-100 mb-4 bg-slate-50 relative">
                  <ResumeCardPreview content={DUMMY_CONTENT} templateId="classic" className="h-40" />
                </div>

                <h3 className="font-bold text-slate-900 text-sm">Clássico</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Estilo tradicional e elegante, perfeito para áreas corporativas e posições executivas.
                </p>
              </div>
              <button
                type="button"
                className={`mt-4 w-full h-8 text-xs font-bold rounded-lg transition-colors cursor-pointer ${selectedTemplate === 'classic' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                Selecionar
              </button>
            </div>

            <div
              onClick={() => setSelectedTemplate('creative')}
              className={`group flex flex-col justify-between h-full rounded-2xl border p-5 bg-white cursor-pointer transition-all duration-300 ${selectedTemplate === 'creative'
                ? 'border-blue-600 shadow-md shadow-blue-500/5 ring-1 ring-blue-600/10'
                : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
            >
              <div>
                <div className="rounded-lg overflow-hidden border border-slate-100 mb-4 bg-slate-50 relative">
                  <ResumeCardPreview content={DUMMY_CONTENT} templateId="creative" className="h-40" />
                </div>

                <h3 className="font-bold text-slate-900 text-sm">Criativo</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Destaque sua personalidade com um layout moderno e equilibrado.
                </p>
              </div>
              <button
                type="button"
                className={`mt-4 w-full h-8 text-xs font-bold rounded-lg transition-colors cursor-pointer ${selectedTemplate === 'creative' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                Selecionar
              </button>
            </div>

            <div
              onClick={() => setSelectedTemplate('sidebar')}
              className={`group flex flex-col justify-between h-full rounded-2xl border p-5 bg-white cursor-pointer transition-all duration-300 ${selectedTemplate === 'sidebar'
                ? 'border-blue-600 shadow-md shadow-blue-500/5 ring-1 ring-blue-600/10'
                : 'border-slate-200 hover:border-slate-300 shadow-sm'
                }`}
            >
              <div>
                <div className="rounded-lg overflow-hidden border border-slate-100 mb-4 bg-slate-50 relative">
                  <ResumeCardPreview content={DUMMY_CONTENT} templateId="blue-right-sidebar" className="h-40" />
                </div>

                <h3 className="font-bold text-slate-900 text-sm">Lateral</h3>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Organização em duas colunas para destacar habilidades e informações-chave.
                </p>
              </div>
              <button
                type="button"
                className={`mt-4 w-full h-8 text-xs font-bold rounded-lg transition-colors cursor-pointer ${selectedTemplate === 'sidebar' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
              >
                Selecionar
              </button>
            </div>

          </motion.div>

          <div className="mt-12 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Ver todos os templates <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <Resume3DShowcase />

      <section id="features" className="relative scroll-mt-20 py-20 md:py-24 bg-slate-50 border-y border-slate-200/60 overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] border-[40px] border-white/40 -translate-y-1/2 translate-x-1/3 rotate-12 pointer-events-none"
        />

        <div className="mx-auto max-w-6xl px-4 relative z-10">
          <motion.div
            initial={mounted && !reduce ? 'hidden' : false}
            whileInView={mounted && !reduce ? 'visible' : undefined}
            viewport={{ once: true, amount: 0 }}
            variants={fadeUp}
            className="mx-auto mb-16 max-w-2xl text-center"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Recursos Exclusivos</span>
            <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Tecnologia de ponta a favor da sua carreira
            </h2>
            <p className="mt-3 text-slate-500 text-sm max-w-xl mx-auto">
              Mais do que um gerador de currículos. Uma plataforma completa alimentada por IA para impulsionar sua jornada profissional.
            </p>
          </motion.div>

          <motion.div
            initial={mounted && !reduce ? 'hidden' : false}
            whileInView={mounted && !reduce ? 'visible' : undefined}
            viewport={{ once: true, amount: 0 }}
            variants={staggerContainer(0.06, 0.1)}
            className="grid gap-6 md:grid-cols-12"
          >
            <motion.div variants={fadeUp} className="md:col-span-4" {...hoverLift}>
              <FeatureCard
                icon={<FileText className="h-6 w-6" />}
                title="Análise de Currículo"
                description="A IA avalia seu currículo e aponta problemas gramaticais ou de estrutura que podem prejudicar sua aprovação no ATS."
                highlight={true}
                badge="DESTAQUE"
              />
            </motion.div>

            <motion.div variants={fadeUp} className="md:col-span-4" {...hoverLift}>
              <FeatureCard
                icon={<Crosshair className="h-6 w-6" />}
                title="Adaptação por Vaga"
                description="Adapte seu currículo para cada vaga de forma automática com sugestões de palavras-chave."
                showLine={true}
              />
            </motion.div>

            <motion.div variants={fadeUp} className="md:col-span-4" {...hoverLift}>
              <FeatureCard
                icon={<Linkedin className="h-6 w-6" />}
                title="Auditoria LinkedIn"
                description="Receba um relatório completo do seu perfil do LinkedIn e sugestões para se destacar para recrutadores."
                showLine={true}
              />
            </motion.div>

            <motion.div variants={fadeUp} className="md:col-span-6" {...hoverLift}>
              <FeatureCard
                icon={<Target className="h-6 w-6" />}
                title="Score ATS Objetivo"
                description="Pontuação clara que mostra como seu currículo será avaliado pelos sistemas automáticos."
                highlight={true}
                showLine={true}
                className="min-h-[340px]"
              >
                <div className="absolute right-[-5%] bottom-[-15%] w-[340px] h-[340px] rotate-[-10deg] rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md p-6 shadow-2xl transition-transform duration-500 group-hover:rotate-[-12deg] group-hover:scale-105 pointer-events-none hidden sm:block">
                  <div className="text-[11px] font-medium text-white/50 mb-4 tracking-wider">ATS Score</div>
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative w-24 h-24 rounded-full border-[6px] border-white/10 flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(59, 130, 246, 0.8)" strokeWidth="6" strokeDasharray="276" strokeDashoffset="22" className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                      </svg>
                      <span className="text-3xl font-extrabold text-white">92</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 w-full" />
                      </div>
                      <div className="h-2.5 w-4/5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 w-full" />
                      </div>
                      <div className="h-2.5 w-2/3 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-400 w-full" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1">ATS Score</div>
                    <div className="flex gap-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className={`h-8 w-1.5 rounded-full ${i > 9 ? 'bg-white/10' : 'bg-blue-500/50'}`} style={{ opacity: i > 9 ? 1 : 0.4 + (i * 0.05) }} />
                      ))}
                    </div>
                  </div>
                </div>
              </FeatureCard>
            </motion.div>

            <motion.div variants={fadeUp} className="md:col-span-3" {...hoverLift}>
              <FeatureCard
                icon={<Zap className="h-6 w-6" />}
                title="Desempenho em Tempo Real"
                description="Melhore seu currículo com feedback instantâneo enquanto você edita."
                showLine={true}
              />
            </motion.div>

            <motion.div variants={fadeUp} className="md:col-span-3" {...hoverLift}>
              <FeatureCard
                icon={<ShieldCheck className="h-6 w-6" />}
                title="Privacidade em Foco"
                description="Seus dados são protegidos com criptografia de ponta a ponta e não são compartilhados."
                showLine={true}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section id="pricing" className="relative scroll-mt-20 py-20 md:py-24 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:3rem_3rem] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)] opacity-30 pointer-events-none" />
        <div
          className="absolute left-1/4 top-1/4 w-12 h-12 bg-blue-100 rotate-45 pointer-events-none"
        />

        <div className="mx-auto max-w-6xl px-4 relative z-10">
          <motion.div
            initial={mounted && !reduce ? 'hidden' : false}
            whileInView={mounted && !reduce ? 'visible' : undefined}
            viewport={{ once: true, amount: 0 }}
            variants={fadeUp}
            className="mx-auto mb-16 max-w-2xl text-center"
          >
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">Investimento</span>
            <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Planos diretos, sem letras miúdas
            </h2>
            <p className="mt-3 text-slate-500 text-sm">
              Comece sem custos. Contrate planos pagos apenas quando precisar de mais recursos.
            </p>
          </motion.div>

          <motion.div
            initial={mounted && !reduce ? 'hidden' : false}
            whileInView={mounted && !reduce ? 'visible' : undefined}
            viewport={{ once: true, amount: 0 }}
            variants={staggerContainer(0.08, 0.1)}
            className="grid gap-6 max-w-5xl mx-auto md:grid-cols-3 items-stretch"
          >
            <Plan
              name="Free"
              price="R$ 0"
              features={['1 currículo ativo', 'Análise básica com IA (pontuação geral)', '3 templates básicos', "Menor destaque no score ATS"]}
              cta="Começar Grátis"
              href="/dashboard"
            />
            <Plan
              name="Pro"
              price="R$ 19,90"
              suffix="/mês"
              highlight
              features={['10 currículos ativos', 'Acesso completo a IA (análises e sugestões ilimitadas)', 'Templates Premium', 'Auditoria de perfil LinkedIn', 'Suporte prioritário via e-mail']}
              cta="Escolher Plano Pro"
              href="/pricing"
            />
            <Plan
              name="Max"
              price="R$ 39,90"
              suffix="/mês"
              features={['20 currículos ativos', 'IA ilimitada para revisões de texto', 'Auditoria de perfil LinkedIn Premium', 'Dicas semanais exclusivas de recrutadores']}
              cta="Escolher Plano Max"
              href="/pricing"
            />
          </motion.div>
        </div>
      </section>

      <section className="py-20 md:py-24 bg-white border-t border-slate-200/60">
        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={mounted && !reduce ? 'hidden' : false}
            whileInView={mounted && !reduce ? 'visible' : undefined}
            viewport={{ once: true, amount: 0 }}
            variants={scaleIn}
            className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-t from-blue-950 to-blue-600 p-8 md:p-12 text-white shadow-lg shadow-blue-500/10"
          >

            <div className="absolute top-0 right-0 w-96 h-full bg-white/5 -skew-x-12 translate-x-10 pointer-events-none" />

            <div className="grid gap-8 md:grid-cols-12 md:items-center relative">

              <div className="md:col-span-7 text-left">
                <h2 className="font-sans text-3xl font-extrabold tracking-tight md:text-4xl text-white">
                  Alavanque sua recolocação profissional agora
                </h2>
                <p className="mt-4 max-w-xl text-blue-100 text-sm leading-relaxed">
                  Crie seu primeiro currículo otimizado com nossa inteligência artificial em menos de 5 minutos. Rápido, profissional e gratuito.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <SignedOut>
                    <SignUpButton mode="modal" forceRedirectUrl="/dashboard">
                      <motion.button
                        {...hoverLift}
                        type="button"
                        className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-6 text-xs font-bold text-blue-600 shadow-sm transition-all hover:bg-slate-50 cursor-pointer"
                      >
                        Cadastrar Grátis <ArrowRight className="h-3.5 w-3.5" />
                      </motion.button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard">
                      <motion.button
                        {...hoverLift}
                        type="button"
                        className="inline-flex h-11 items-center gap-1.5 rounded-full bg-white px-6 text-xs font-bold text-blue-600 shadow-sm transition-all hover:bg-slate-50 cursor-pointer"
                      >
                        Ir para o Painel <ArrowRight className="h-3.5 w-3.5" />
                      </motion.button>
                    </Link>
                  </SignedIn>
                  <Link
                    href="#features"
                    className="inline-flex h-11 items-center px-4 text-xs font-bold text-blue-100 hover:text-white transition-colors"
                  >
                    Conhecer recursos
                  </Link>
                </div>
              </div>

              <div className="md:col-span-5 flex justify-center relative">
                <motion.div
                  initial={mounted && !reduce ? { opacity: 0, scale: 0.95 } : false}
                  animate={mounted && !reduce ? { opacity: 1, scale: 1 } : false}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="w-full relative"
                >
                  <div>
                    <Image
                      src="/dados_atrion.png"
                      alt="Gráficos e dados da plataforma ATRION"
                      width={400}
                      height={300}
                      className="w-full h-auto object-contain drop-shadow-2xl"
                    />
                  </div>
                </motion.div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

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
              <Link href="/#pricing" className="hover:text-blue-200 transition-colors">Planos</Link>
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

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '');
      const el = document.getElementById(targetId);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  highlight = false,
  badge,
  className = "",
  showLine = false,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight?: boolean;
  badge?: string;
  className?: string;
  showLine?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className={`group relative h-full rounded-2xl p-6 md:p-8 transition-all duration-300 hover:-translate-y-0.5 overflow-hidden flex flex-col justify-between ${highlight
      ? 'bg-gradient-to-br from-[#0c1231] to-[#162463] text-white shadow-lg shadow-blue-500/10'
      : 'border border-slate-200 bg-white text-slate-900 shadow-sm hover:border-slate-300 hover:shadow-md hover:shadow-blue-500/5'
      } ${className}`}>

      {highlight && !children && (
        <svg className="absolute bottom-0 right-0 w-full h-32 text-white/5 pointer-events-none" viewBox="0 0 100 50" fill="none" stroke="currentColor" strokeWidth="0.5" preserveAspectRatio="none">
          <path d="M0 45 C 30 35, 60 45, 100 35 M0 40 C 30 30, 60 40, 100 30 M0 35 C 30 25, 60 35, 100 25 M0 30 C 30 20, 60 30, 100 20 M0 25 C 30 15, 60 25, 100 15" />
        </svg>
      )}

      <div className="relative z-10 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${highlight
            ? 'bg-white/10 text-white border border-white/10 backdrop-blur-sm'
            : 'bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-500/10'
            }`}>
            {icon}
          </div>

          {badge && (
            <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full ${highlight ? 'bg-white/15 text-white backdrop-blur-sm' : 'bg-blue-50 text-blue-600'
              }`}>
              {badge}
            </span>
          )}
        </div>

        <h3 className={`text-xl font-bold tracking-tight ${highlight ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </h3>

        {showLine && (
          <div className={`h-[3px] w-8 rounded mt-4 mb-4 ${highlight ? 'bg-blue-500/50' : 'bg-blue-600'}`} />
        )}
        {!showLine && <div className="mt-4" />}

        <p className={`text-sm leading-relaxed ${highlight ? 'text-blue-100/80 max-w-[280px]' : 'text-slate-500'}`}>
          {description}
        </p>
      </div>

      {children}
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
    <motion.div variants={fadeUp} {...hoverLift} className="h-full">
      <div
        className={`relative flex flex-col h-full rounded-3xl border p-6 transition-all duration-300 ${highlight
          ? 'border-blue-600 bg-white text-slate-900 shadow-md shadow-blue-500/10 ring-1 ring-blue-600/10 scale-[1.01]'
          : 'border-slate-200/80 bg-white text-slate-900 shadow-sm hover:border-slate-300'
          }`}
      >
        {highlight && (
          <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            Mais popular
          </span>
        )}
        <div className={`mb-1 text-xs font-bold uppercase tracking-wider ${highlight ? 'text-blue-600' : 'text-slate-400'}`}>
          {name}
        </div>
        <div className="mb-5 flex items-baseline gap-1">
          <span className="text-3xl font-extrabold tracking-tight text-slate-900">{price}</span>
          {suffix && <span className="text-xs text-slate-500">{suffix}</span>}
        </div>
        <ul className="mb-6 flex-1 space-y-3 text-xs leading-relaxed">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${highlight ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className="text-slate-600">{f}</span>
            </li>
          ))}
        </ul>
        <Link href={href} className="mt-auto block w-full">
          <button
            type="button"
            className={`w-full h-10 rounded-xl text-xs font-bold transition-colors cursor-pointer ${highlight
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
          >
            {cta}
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
