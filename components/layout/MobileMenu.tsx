'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, LayoutDashboard, Linkedin, Briefcase, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Currículos', icon: LayoutDashboard },
    { href: '/linkedin', label: 'LinkedIn', icon: Linkedin },
    { href: '/jobs', label: 'Vagas', icon: Briefcase },
    { href: '/settings', label: 'Configurações', icon: SettingsIcon },
  ];

  return (
    <div className="md:hidden flex items-center">
      <Button
        variant="ghost"
        size="sm"
        className="h-9 w-9 px-0 rounded-full"
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
          <div className="absolute top-[60px] left-0 right-0 z-50 mx-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
            <nav className="flex flex-col p-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname?.startsWith(`${link.href}/`);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-indigo-50/80 text-indigo-700' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
