import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'ATRION — Currículos profissionais com IA',
    template: '%s · ATRION',
  },
  description:
    'Plataforma de currículos profissionais com IA + auditoria de LinkedIn. Crie, adapte e otimize seu currículo em minutos.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'ATRION',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0f19' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#6366f1', // indigo-500 (mais moderno)
          colorBackground: '#ffffff',
          colorText: '#0f172a',
          borderRadius: '0.875rem',
          fontFamily: 'var(--font-inter), ui-sans-serif, system-ui, sans-serif',
        },
        elements: {
          card: 'shadow-2xl border border-border',
          formButtonPrimary:
            'bg-gradient-to-b from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-sm',
          footerActionLink: 'text-indigo-600 hover:text-indigo-700 font-medium',
        },
      }}
    >
      <html
        lang="pt-BR"
        className={`${inter.variable} ${spaceGrotesk.variable}`}
        suppressHydrationWarning
      >
        <body className="min-h-screen bg-background font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
