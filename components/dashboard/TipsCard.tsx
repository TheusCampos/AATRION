import { Lightbulb, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function TipsCard() {
  const tips = [
    'Adapte seu resumo para cada vaga específica.',
    'Destaque resultados com números e impactos.',
    'Mantenha suas experiências mais relevantes no topo.',
  ];

  return (
    <Card className="flex flex-col rounded-3xl border border-border/60 bg-indigo-50/30 p-6 backdrop-blur shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-indigo-500" />
        <h3 className="text-sm font-semibold text-slate-800">Dicas para melhorar seu currículo</h3>
      </div>
      
      <ul className="space-y-3 mb-4">
        {tips.map((tip, idx) => (
          <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
            <CheckCircle2 className="h-4 w-4 text-indigo-500 flex-shrink-0 mt-0.5" />
            <span>{tip}</span>
          </li>
        ))}
      </ul>
      
      <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 text-left mt-auto">
        Ver mais dicas &gt;
      </button>
    </Card>
  );
}
