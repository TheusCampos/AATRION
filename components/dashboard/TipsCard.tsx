'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, CheckCircle2, X } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const ALL_TIPS = [
  'Adapte seu resumo para cada vaga específica.',
  'Destaque resultados com números e impactos.',
  'Mantenha suas experiências mais relevantes no topo.',
  'Use palavras-chave da descrição da vaga.',
  'Revise sempre a ortografia e gramática.',
  'Evite jargões excessivos se não forem essenciais.',
  'Adicione links para seu LinkedIn e portfólio.',
  'Seja conciso, evite parágrafos muito longos.',
  'Inclua cursos e certificações relevantes.',
  'Destaque suas habilidades comportamentais (soft skills).',
  'Quantifique suas conquistas sempre que possível.',
  'Mantenha o design do currículo limpo e legível.',
  'Atualize seu currículo regularmente.',
];

export function TipsCard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTips, setCurrentTips] = useState<string[]>([]);
  const [modalTips, setModalTips] = useState<string[]>([]);

  useEffect(() => {

    const dayIndex = Math.floor(new Date().getTime() / (1000 * 60 * 60 * 24));

    const rotationIndex = Math.floor(dayIndex / 3);


    const startIdx = (rotationIndex * 3) % ALL_TIPS.length;

    const mainTips = [];
    for (let i = 0; i < 3; i++) {
      mainTips.push(ALL_TIPS[(startIdx + i) % ALL_TIPS.length]);
    }


    const moreTips = [];
    for (let i = 3; i < 8; i++) {
      moreTips.push(ALL_TIPS[(startIdx + i) % ALL_TIPS.length]);
    }

    setCurrentTips(mainTips);
    setModalTips(moreTips);
  }, []);

  return (
    <>
      <Card className="flex flex-col rounded-3xl border border-border/60 bg-indigo-50/30 p-6 backdrop-blur shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-indigo-500" />
          <h3 className="text-sm font-semibold text-slate-800">Dicas para melhorar seu currículo</h3>
        </div>

        <ul className="space-y-3 mb-4 flex-1">
          {currentTips.length > 0 ? currentTips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
              <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
              <span>{tip}</span>
            </li>
          )) : (
            <div className="animate-pulse flex flex-col gap-3">
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-5/6"></div>
            </div>
          )}
        </ul>

        <button
          onClick={() => setIsModalOpen(true)}
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 text-left mt-auto"
        >
          Ver mais dicas &gt;
        </button>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md p-6 bg-white shadow-2xl relative rounded-3xl border-0 animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full p-1"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 mb-4 pr-8">
              <Lightbulb className="h-6 w-6 text-indigo-500" />
              <h3 className="text-lg font-semibold text-slate-800">Mais dicas para o seu currículo</h3>
            </div>
            <ul className="space-y-4 mb-6">
              {modalTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-slate-600">
                  <CheckCircle2 className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
            >
              Entendi
            </button>
          </Card>
        </div>
      )}
    </>
  );
}
