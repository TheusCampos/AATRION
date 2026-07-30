'use client';

import Link from 'next/link';
import { Check, Lock } from 'lucide-react';

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
  requiresAuth?: boolean;
  isLoggedIn?: boolean;
}) {
  const resolvedHref = (() => {
    if (!href) return undefined;
    if (requiresAuth && !isLoggedIn) {
      return `/login?redirect_url=${encodeURIComponent(href)}`;
    }
    return href;
  })();

  return (
    <div
      className={`relative flex flex-col rounded-3xl border p-6 md:p-8 transition-all duration-300 ${
        highlight
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
      <p className="mb-4 text-xs text-slate-500">{description}</p>
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

      {resolvedHref ? (
        resolvedHref.startsWith('/api') || resolvedHref.startsWith('http') ? (
          <a href={resolvedHref} className="mt-auto block w-full">
            <button
              type="button"
              className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                highlight
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              {requiresAuth && !isLoggedIn && <Lock className="h-3.5 w-3.5" />}
              {cta}
            </button>
          </a>
        ) : (
          <Link href={resolvedHref} className="mt-auto block w-full">
            <button
              type="button"
              className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                highlight
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
              }`}
            >
              {requiresAuth && !isLoggedIn && <Lock className="h-3.5 w-3.5" />}
              {cta}
            </button>
          </Link>
        )
      ) : null}

      {requiresAuth && !isLoggedIn && (
        <p className="mt-2 text-center text-[10px] text-slate-400">
          Faça login para assinar
        </p>
      )}
    </div>
  );
}

