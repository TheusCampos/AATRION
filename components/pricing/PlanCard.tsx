'use client';

import Link from 'next/link';
import { Check, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function PlanCard({
  name,
  price,
  suffix,
  description,
  features,
  cta,
  href,
  highlight = false,
  requiresAuth = false,
  isLoggedIn = false,
}: {
  name: string;
  price: string;
  suffix?: string;
  description: string;
  features: string[];
  cta: string;
  href?: string;
  highlight?: boolean;
  /** Se true, o botão requer autenticação antes do checkout */
  requiresAuth?: boolean;
  /** Se o usuário está logado (passado pelo server component pai) */
  isLoggedIn?: boolean;
}) {
  // Calcula a URL de destino do botão
  // - Se não requer auth ou já está logado → usa href normalmente
  // - Se requer auth e não está logado → redireciona para login com redirect_url
  const resolvedHref = (() => {
    if (!href) return undefined;
    if (requiresAuth && !isLoggedIn) {
      // Preserva a rota de destino (ex: /api/stripe/checkout?plan=PRO)
      return `/login?redirect_url=${encodeURIComponent(href)}`;
    }
    return href;
  })();

  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-6 transition-all duration-300 hover:shadow-lg ${
        highlight
          ? 'border-transparent bg-slate-900 text-white shadow-xl shadow-indigo-500/10 scale-102 z-10'
          : 'border-border/60 bg-card/70 backdrop-blur-sm hover:border-indigo-500/30'
      }`}
    >
      {highlight && (
        <span className="absolute -top-3 right-6 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow">
          Mais popular
        </span>
      )}
      <h3 className="text-lg font-bold">{name}</h3>
      <p className={`mb-4 text-xs ${highlight ? 'text-slate-400' : 'text-muted-foreground'}`}>{description}</p>
      <div className="mb-6 flex items-baseline gap-1">
        <span className="text-3xl font-extrabold tracking-tight">{price}</span>
        {suffix && <span className={`text-xs ${highlight ? 'text-slate-500' : 'text-muted-foreground'}`}>{suffix}</span>}
      </div>
      <ul className="mb-6 flex-1 space-y-2.5 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5">
            <Check className={`mt-0.5 h-4 w-4 flex-shrink-0 ${highlight ? 'text-emerald-400' : 'text-indigo-500'}`} />
            <span className={highlight ? 'text-slate-300' : 'text-slate-700'}>{f}</span>
          </li>
        ))}
      </ul>
      
      {resolvedHref ? (
        resolvedHref.startsWith('/api') || resolvedHref.startsWith('http') ? (
          <a href={resolvedHref} className="block w-full">
            <Button variant={highlight ? 'primary' : 'secondary'} className="w-full gap-2">
              {requiresAuth && !isLoggedIn && <Lock className="h-3.5 w-3.5" />}
              {cta}
            </Button>
          </a>
        ) : (
          <Link href={resolvedHref} className="block w-full">
            <Button variant={highlight ? 'primary' : 'secondary'} className="w-full gap-2">
              {requiresAuth && !isLoggedIn && <Lock className="h-3.5 w-3.5" />}
              {cta}
            </Button>
          </Link>
        )
      ) : null}

      {requiresAuth && !isLoggedIn && (
        <p className={`mt-2 text-center text-[10px] ${highlight ? 'text-slate-500' : 'text-muted-foreground'}`}>
          Faça login para assinar
        </p>
      )}
    </div>
  );
}
