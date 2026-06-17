import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <FileQuestion className="mb-6 h-16 w-16 text-muted-foreground" />
      <h1 className="mb-2 text-6xl font-extrabold text-foreground">404</h1>
      <h2 className="mb-4 text-2xl font-semibold text-foreground">Página não encontrada</h2>
      <p className="mb-8 max-w-md text-balance text-muted-foreground">
        A página que você procura não existe ou foi movida. Verifique o endereço e tente novamente.
      </p>
      <Link
        href="/"
        className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
      >
        Voltar ao início
      </Link>
    </main>
  );
}
