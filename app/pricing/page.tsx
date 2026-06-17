import Link from 'next/link';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const metadata = {
  title: 'Planos · ATRION',
  description: 'Conheça os planos do ATRION e escolha o melhor para você',
};

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      {/* Header */}
      <header className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="text-primary">ATRION</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm">Entrar</Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="sm">Começar grátis</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container flex flex-col items-center justify-center gap-6 py-16 text-center md:py-24">
        <h1 className="max-w-3xl text-balance text-4xl font-extrabold tracking-tight md:text-5xl">
          Planos simples e <span className="text-primary">transparentes</span>
        </h1>
        <p className="max-w-2xl text-balance text-lg text-muted-foreground">
          Comece grátis. Faça upgrade quando precisar de mais recursos.
        </p>
      </section>

      {/* Planos */}
      <section className="container pb-24">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
          <PlanCard
            name="Free"
            price="R$ 0"
            suffix="/para sempre"
            description="Para quem está começando"
            features={[
              'Até 3 currículos ativos',
              'Todos os 6 templates',
              '1 auditoria LinkedIn/mês',
              'Exportação em PDF',
              'Autosave inteligente',
            ]}
            cta="Começar grátis"
            href="/register"
          />
          <PlanCard
            name="Pro Mensal"
            price="R$ 29"
            suffix="/mês"
            description="Para quem busca resultados rápidos"
            features={[
              'Currículos ilimitados',
              'Adaptação por vaga com IA',
              '5 auditorias LinkedIn/mês',
              'Sugestões de habilidades',
              'Suporte por email',
            ]}
            cta="Assinar Pro Mensal"
            href="/register?plan=pro-monthly"
            highlight
          />
          <PlanCard
            name="Pro Anual"
            price="R$ 197"
            suffix="/ano"
            description="Para quem quer economizar (32% off)"
            features={[
              'Tudo do Pro Mensal',
              'LinkedIn Chat exclusivo',
              'Ideias de posts semanais',
              'Suporte prioritário',
              'Acesso antecipado a novidades',
            ]}
            cta="Assinar Pro Anual"
            href="/register?plan=pro-annual"
          />
        </div>
      </section>

      {/* CTA Final */}
      <section className="container pb-24">
        <Card className="mx-auto max-w-3xl p-8 text-center bg-gradient-to-br from-primary/5 to-blue-500/5">
          <h2 className="mb-2 text-2xl font-bold">Pronto para criar seu currículo perfeito?</h2>
          <p className="mb-6 text-muted-foreground">
            Junte-se a milhares de profissionais que já usam o ATRION.
          </p>
          <Link href="/register">
            <Button size="lg">
              Criar minha conta grátis
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </Card>
      </section>

      <footer className="container border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>ATRION · Construído com Next.js, TypeScript, Tailwind e shadcn/ui</p>
      </footer>
    </main>
  );
}

function PlanCard({
  name,
  price,
  suffix,
  description,
  features,
  cta,
  href,
  highlight = false,
}: {
  name: string;
  price: string;
  suffix?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-6 shadow-sm ${
        highlight
          ? 'border-primary bg-gradient-to-br from-primary/5 to-blue-500/5 ring-2 ring-primary'
          : 'border-border bg-card'
      }`}
    >
      {highlight && (
        <span className="mb-3 inline-flex w-fit rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
          Mais popular
        </span>
      )}
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="mb-4 text-sm text-muted-foreground">{description}</p>
      <div className="mb-6 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold">{price}</span>
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
      <ul className="mb-6 flex-1 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <Link href={href}>
        <Button variant={highlight ? 'primary' : 'secondary'} className="w-full">
          {cta}
        </Button>
      </Link>
    </div>
  );
}
