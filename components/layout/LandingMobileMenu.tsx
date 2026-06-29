'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function LandingMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: '/', label: 'Início' },
    { href: '/#templates', label: 'Templates' },
    { href: '/#curriculo', label: 'Exemplo' },
    { href: '/#features', label: 'Recursos' },
    { href: '/#pricing', label: 'Planos' },
  ];

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setIsOpen(false);
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
    <div className="md:hidden flex items-center ml-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 px-0 rounded-full text-slate-600"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Alternar Menu"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-[70px] left-4 right-4 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <nav className="flex flex-col p-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleClick(e, link.href)}
                  className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
