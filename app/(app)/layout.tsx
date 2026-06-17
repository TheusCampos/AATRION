import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LayoutDashboard, Linkedin, Briefcase, Settings as SettingsIcon } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import Image from 'next/image';
import { getCurrentUser } from '@/lib/auth';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  return (
    <div className="relative min-h-screen bg-background bg-page-gradient">
      <header className="sticky top-4 z-30 mx-auto w-full max-w-[1600px] px-4">
        <div className="flex h-14 items-center justify-between rounded-2xl border border-border/60 bg-card/80 px-4 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold">
              <Image src="/Logo-atrion.png" alt="ATRION Logo" width={100} height={24} className="h-6 w-auto" />
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              <NavLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />}>
                Currículos
              </NavLink>
              <NavLink href="/linkedin" icon={<Linkedin className="h-4 w-4" />}>
                LinkedIn
              </NavLink>
              <NavLink href="/jobs" icon={<Briefcase className="h-4 w-4" />}>
                Vagas
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/settings"
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <SettingsIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Configurações</span>
            </Link>
            <span className="hidden text-sm text-muted-foreground lg:inline">
              {user.name}
            </span>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonPopoverCard: 'shadow-2xl border border-border',
                  userButtonAvatarBox: 'h-9 w-9 ring-1 ring-border',
                },
              }}
              showName={false}
            />
          </div>
        </div>
      </header>

      <main className="container max-w-[1600px] py-6 md:py-8">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {icon}
      {children}
    </Link>
  );
}
