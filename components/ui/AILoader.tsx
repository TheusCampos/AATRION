'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AILoaderProps {
  isOpen: boolean;
  title: string;
  steps: string[];
}

export function AILoader({ isOpen, title, steps }: AILoaderProps) {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Animação suave e realista do progresso de 0% a 99%
  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCurrentStepIndex(0);
      return;
    }

    const startTime = Date.now();
    const duration = 6500; // Tempo estimado para chegar a 95% (6.5 segundos)

    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min(95, Math.floor((elapsed / duration) * 95));

      setProgress((prev) => {
        if (calculatedProgress > prev) {
          return calculatedProgress;
        }
        // Se ultrapassar o tempo estimado, rasteja lentamente até 99%
        if (prev < 99) {
          return prev + 1;
        }
        return prev;
      });
    }, 100);

    // Avança as fases textuais com base no progresso aproximado
    const stepsTimer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepsTimer);
    };
  }, [isOpen, steps.length]);

  const activeStepText = steps[currentStepIndex] || 'Processando...';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
          {/* Card Exterior - Preto e Azul */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-sm rounded-3xl border border-slate-800 bg-black/95 p-8 text-white shadow-2xl overflow-hidden flex flex-col items-center"
          >
            {/* Header / Título */}
            <div className="w-full text-left mb-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                Assistente de IA
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">{title}</h3>
            </div>

            {/* Inner CV Card (Esqueleto do Currículo) */}
            <div className="relative w-full aspect-[4/5] rounded-2xl border border-slate-800 bg-slate-900/40 p-5 overflow-hidden flex flex-col justify-between">
              
              {/* Efeito Laser Scanner Azul */}
              <motion.div
                animate={{ y: [0, 200, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: 'easeInOut',
                }}
                className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_12px_2px_rgba(59,130,246,0.6)] z-10"
                style={{ top: 0 }}
              />

              {/* Skeletal Elements (Cinza, Branco e Azul) */}
              <div className="space-y-4">
                {/* Header Skeleton */}
                <div className="flex items-center gap-3">
                  {/* CV Square */}
                  <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono font-bold flex items-center justify-center text-xs tracking-wider">
                    CV
                  </div>
                  {/* Title / Subtitle Skeletons */}
                  <div className="flex-1 space-y-2">
                    <div className="h-2 w-28 bg-slate-700/80 rounded" />
                    <div className="h-1.5 w-16 bg-slate-700/50 rounded" />
                  </div>
                </div>

                {/* Divider */}
                <div className="h-[1px] w-full bg-slate-800/40 my-2" />

                {/* Body Text Skeletons */}
                <div className="space-y-3 pt-1">
                  <div className="h-1.5 w-full bg-slate-800/60 rounded" />
                  <div className="h-1.5 w-5/6 bg-slate-800/60 rounded" />
                  
                  {/* Blue/White Highlight Line (substituindo roxo) */}
                  <motion.div
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                    className="h-1.5 w-full bg-gradient-to-r from-blue-500/30 via-slate-700/30 to-blue-500/20 border-b border-blue-500/10 rounded"
                  />
                  
                  <div className="h-1.5 w-4/5 bg-slate-800/60 rounded" />
                  <div className="h-1.5 w-2/3 bg-slate-800/60 rounded" />
                </div>
              </div>

              {/* Status Footer Inside CV Card */}
              <div className="flex items-center justify-between mt-6 pt-3 border-t border-slate-800/40 z-20">
                {/* Indicator and Status text */}
                <div className="flex items-center text-[10px] font-mono tracking-wider text-slate-400">
                  <span className="relative flex h-2 w-2 mr-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  <span className="uppercase">{activeStepText}</span>
                </div>
                
                {/* Percentage */}
                <div className="text-[10px] font-mono font-bold text-blue-400">
                  {progress}%
                </div>
              </div>
            </div>

            {/* Subtle Blue Glow Reflection (Base Glow) */}
            <div className="absolute bottom-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-blue-500/60 to-transparent shadow-[0_0_20px_4px_rgba(59,130,246,0.4)]" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
