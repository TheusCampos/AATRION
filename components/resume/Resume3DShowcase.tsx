'use client';

import { useEffect, useRef } from 'react';
import VanillaTilt from 'vanilla-tilt';
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  User,
  Briefcase,
  GraduationCap,
  CheckCircle,
  FileSearch,
  Sparkles,
  Target
} from 'lucide-react';

export function Resume3DShowcase() {
  const tiltRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = tiltRef.current;
    if (node) {
      VanillaTilt.init(node, {
        max: 5,
        speed: 400,
        glare: true,
        "max-glare": 0.05, // Minimalist glare
        scale: 1.01,
      });
    }

    return () => {
      const tiltNode = node as HTMLDivElement & { vanillaTilt?: { destroy: () => void } };
      if (tiltNode && tiltNode.vanillaTilt) {
        tiltNode.vanillaTilt.destroy();
      }
    };
  }, []);

  return (
    <section className="relative w-full py-16 md:py-20 bg-white overflow-hidden flex items-center justify-center min-h-[700px] border-y border-slate-200/50">

      {/* Improvement Cards (Positioned around the center resume) */}

      {/* Top Left Card */}
      <div className="absolute top-16 left-4 lg:left-[8%] xl:left-[12%] max-w-[260px] bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-sm z-20 border border-slate-100 hidden lg:block transform -rotate-2 hover:rotate-0 transition-transform">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h4 className="font-bold text-slate-800 text-sm">Design Premium</h4>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Hierarquia visual inteligente que retém a atenção por muito mais tempo.
        </p>
        {/* SVG Arrow pointing to center */}
        <svg className="absolute -right-24 top-1/2 w-24 h-24 pointer-events-none text-slate-200" viewBox="0 0 100 100" fill="none">
          <path d="M 0 50 Q 50 50, 100 80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
          <path d="M 90 70 L 100 80 L 85 85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Bottom Left Card */}
      <div className="absolute bottom-16 left-4 lg:left-[8%] xl:left-[12%] max-w-[260px] bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-sm z-20 border border-slate-100 hidden lg:block transform rotate-1 hover:rotate-0 transition-transform">
        <div className="flex items-center gap-3 mb-2">
          <FileSearch className="w-5 h-5 text-emerald-500" />
          <h4 className="font-bold text-slate-800 text-sm">Aprovado por ATS</h4>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Estrutura limpa e sem elementos confusos, leitura perfeita por robôs.
        </p>
        {/* SVG Arrow pointing to center */}
        <svg className="absolute -right-24 bottom-1/2 w-24 h-24 pointer-events-none text-slate-200" viewBox="0 0 100 100" fill="none">
          <path d="M 0 50 Q 50 50, 100 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
          <path d="M 85 15 L 100 20 L 90 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Top Right Card */}
      <div className="absolute top-24 right-4 lg:right-[8%] xl:right-[12%] max-w-[260px] bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-sm z-20 border border-slate-100 hidden lg:block transform rotate-2 hover:rotate-0 transition-transform">
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-5 h-5 text-blue-500" />
          <h4 className="font-bold text-slate-800 text-sm">Objetividade</h4>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Destaque para o que realmente importa: conquistas e competências.
        </p>
        {/* SVG Arrow pointing to center */}
        <svg className="absolute -left-24 top-1/2 w-24 h-24 pointer-events-none text-slate-200" viewBox="0 0 100 100" fill="none">
          <path d="M 100 50 Q 50 50, 0 80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
          <path d="M 10 70 L 0 80 L 15 85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Bottom Right Card */}
      <div className="absolute bottom-24 right-4 lg:right-[8%] xl:right-[12%] max-w-[260px] bg-white/90 backdrop-blur-sm p-5 rounded-xl shadow-sm z-20 border border-slate-100 hidden lg:block transform -rotate-1 hover:rotate-0 transition-transform">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle className="w-5 h-5 text-purple-500" />
          <h4 className="font-bold text-slate-800 text-sm">Confiabilidade</h4>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Tipografia legível e contraste perfeito transmitindo segurança.
        </p>
        {/* SVG Arrow pointing to center */}
        <svg className="absolute -left-24 bottom-1/2 w-24 h-24 pointer-events-none text-slate-200" viewBox="0 0 100 100" fill="none">
          <path d="M 100 50 Q 50 50, 0 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3" />
          <path d="M 15 15 L 0 20 L 10 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Main 3D Resume Wrapper */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .hover-3d {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            transform: translateZ(20px);
        }
        .hover-3d:hover {
            transform: translateZ(40px) translateY(-2px);
            box-shadow: 0 15px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .timeline-dot {
            position: absolute;
            left: -25px;
            top: 5px;
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background-color: #4f46e5;
            border: 2px solid #e0e7ff;
            box-shadow: 0 0 0 3px white;
        }
        .card-3d-wrapper {
            transform-style: preserve-3d;
            perspective: 1000px;
        }
        .pop-out {
            transform: translateZ(30px);
            transition: transform 0.3s ease-out;
        }
        .pop-out-heavy {
            transform: translateZ(60px);
            transition: transform 0.3s ease-out;
        }
      `}} />

      {/* Reduced size to max-w-[700px] */}
      <div className="relative z-10 w-full max-w-[650px] mx-4 md:mx-auto">
        <div ref={tiltRef} className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100/60 overflow-hidden flex flex-col md:flex-row card-3d-wrapper cursor-default">

          {/* ================= COLUNA LATERAL (ESQUERDA) ================= */}
          <aside className="w-full md:w-1/3 bg-slate-900 text-white p-6 md:p-8 flex flex-col gap-6 pop-out">

            {/* Perfil */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left pop-out-heavy">
              <div className="w-20 h-20 rounded-full border-2 border-indigo-500 overflow-hidden mb-4 shadow-[0_5px_15px_rgba(99,102,241,0.3)] bg-slate-800 flex items-center justify-center transition-transform hover:scale-105">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="https://placehold.co/200x200/1e293b/ffffff?text=FOTO" alt="Sua Foto" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-xl font-bold tracking-tight mb-1">Ana Silva</h1>
              <h2 className="text-indigo-400 font-medium text-[10px] uppercase tracking-wider">Gerente de Projetos</h2>
            </div>

            {/* Contatos */}
            <div className="pop-out">
              <h3 className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-3 border-b border-slate-700 pb-1.5">Contato</h3>
              <ul className="flex flex-col gap-3 text-[11px] font-light">
                <li className="flex items-center gap-2">
                  <Mail className="text-indigo-400 w-3.5 h-3.5" />
                  <span className="hover:text-indigo-300 transition-colors truncate">ana.silva@exemplo.com</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="text-indigo-400 w-3.5 h-3.5" />
                  <span>(65) 99999-9999</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="text-indigo-400 w-3.5 h-3.5" />
                  <span>Cuiabá, MT - Brasil</span>
                </li>
                <li className="flex items-center gap-2">
                  <Linkedin className="text-indigo-400 w-3.5 h-3.5" />
                  <span className="hover:text-indigo-300 transition-colors truncate">linkedin.com/in/anasilva</span>
                </li>
              </ul>
            </div>

            {/* Hard Skills */}
            <div>
              <h3 className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-3 border-b border-slate-700 pb-1.5">Hard Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-slate-800 text-indigo-300 border border-slate-700 px-2 py-0.5 rounded-full text-[9px] font-medium">Metodologias Ágeis</span>
                <span className="bg-slate-800 text-indigo-300 border border-slate-700 px-2 py-0.5 rounded-full text-[9px] font-medium">Scrum / Kanban</span>
                <span className="bg-slate-800 text-indigo-300 border border-slate-700 px-2 py-0.5 rounded-full text-[9px] font-medium">Gestão de Risco</span>
              </div>
            </div>

            {/* Idiomas */}
            <div>
              <h3 className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-3 border-b border-slate-700 pb-1.5">Idiomas</h3>
              <ul className="flex flex-col gap-2 text-[11px]">
                <li className="flex justify-between items-center">
                  <span>Inglês</span>
                  <span className="text-indigo-400 font-medium">Fluente</span>
                </li>
                <li className="flex justify-between items-center">
                  <span>Espanhol</span>
                  <span className="text-slate-400">Intermediário</span>
                </li>
              </ul>
            </div>

          </aside>

          {/* ================= COLUNA PRINCIPAL (DIREITA) ================= */}
          <section className="w-full md:w-2/3 p-6 md:p-8 bg-white flex flex-col gap-6 pop-out">

            {/* Resumo Profissional */}
            <div className="pop-out">
              <div className="flex items-center gap-2 mb-2.5">
                <User className="w-4 h-4 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-800">Perfil Profissional</h3>
              </div>
              <p className="text-slate-600 leading-relaxed text-justify text-[11px]">
                Profissional dedicada e focada em resultados, com mais de 8 anos de experiência em Gestão de Projetos de TI. Especialista em metodologias ágeis com histórico comprovado de sucesso na entrega de produtos complexos. Apaixonada por inovação e melhoria contínua de processos, busco contribuir com estratégias eficientes e liderança colaborativa.
              </p>
            </div>

            {/* Experiência */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-4 h-4 text-indigo-500" />
                <h3 className="text-base font-bold text-slate-800">Experiência Profissional</h3>
              </div>

              {/* Linha do Tempo de Experiência */}
              <div className="border-l border-indigo-100 pl-4 ml-2 flex flex-col gap-5 relative">

                {/* Item 1 */}
                <div className="relative hover-3d bg-slate-50/50 p-3.5 rounded-lg border border-slate-100">
                  <div className="timeline-dot"></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                    <h4 className="text-sm font-bold text-slate-800">Gerente de Projetos Sênior</h4>
                    <span className="text-[9px] font-medium text-indigo-600 bg-indigo-50/50 px-2 py-0.5 rounded mt-1 sm:mt-0 w-max border border-indigo-100/50">Jan 2021 - Presente</span>
                  </div>
                  <p className="text-slate-500 font-medium mb-2 text-[10px]">TechCorp Innovations | São Paulo</p>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 text-[10px]">
                    <li>Liderei equipe de 15 pessoas no novo ERP, aumentando 25% a produtividade.</li>
                    <li>Gestão de orçamento de R$ 2M e otimização de recursos.</li>
                  </ul>
                </div>

                {/* Item 2 */}
                <div className="relative hover-3d bg-slate-50/50 p-3.5 rounded-lg border border-slate-100">
                  <div className="timeline-dot"></div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                    <h4 className="text-sm font-bold text-slate-800">Scrum Master</h4>
                    <span className="text-[9px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1 sm:mt-0 w-max">Fev 2018 - Dez 2020</span>
                  </div>
                  <p className="text-slate-500 font-medium mb-2 text-[10px]">Agile Solutions | Campinas</p>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 text-[10px]">
                    <li>Facilitei cerimônias Scrum e resolução de impedimentos críticos.</li>
                    <li>Redução de tempo de entrega em 15% após reestruturação.</li>
                  </ul>
                </div>

              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pop-out">
              {/* Educação */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-bold text-slate-800">Formação Acadêmica</h3>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="bg-white border border-slate-100 p-3 rounded-lg hover-3d">
                    <h4 className="font-bold text-slate-800 mb-0.5 text-[11px]">MBA Gestão de Projetos</h4>
                    <p className="text-indigo-600 font-medium text-[9px] mb-1">Fundação Getúlio Vargas</p>
                    <p className="text-slate-400 text-[9px]">Conclusão: 2022</p>
                  </div>
                </div>
              </div>

              {/* Certificações */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-indigo-500" />
                  <h3 className="text-sm font-bold text-slate-800">Certificações</h3>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="bg-white border border-slate-100 p-3 rounded-lg hover-3d">
                    <h4 className="font-bold text-slate-800 mb-0.5 text-[11px]">PMP - PMI</h4>
                    <p className="text-indigo-600 font-medium text-[9px] mb-1">Project Management Professional</p>
                    <p className="text-slate-400 text-[9px]">Emitido: 2023</p>
                  </div>
                </div>
              </div>
            </div>

          </section>
        </div>
      </div>
    </section>
  );
}
