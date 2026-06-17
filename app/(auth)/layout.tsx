import Link from 'next/link';
import Image from 'next/image';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-secondary/20">
      <header className="container flex h-16 items-center">
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <Image src="/Logo-atrion.png" alt="ATRION Logo" width={100} height={24} className="h-6 w-auto" />
        </Link>
      </header>
      <main className="container flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
