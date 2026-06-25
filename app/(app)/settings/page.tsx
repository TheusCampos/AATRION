'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  CalendarClock,
  CreditCard,
  User as UserIcon,
  FileDown,
  Sparkles,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Label } from '@/components/ui/Input';
import { fadeUp, staggerContainer } from '@/lib/animations';

type PlanCode = 'FREE' | 'PRO' | 'MAX';

type SettingsUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  jobTitle: string | null;
  location: string | null;
  linkedinUrl: string | null;
  allowPdfDownload: boolean;
};

type PlanInfo = {
  code: PlanCode;
  startedAt: string | null;
  renewsAt: string | null;
  daysUntilRenewal: number | null;
  cancelAtPeriodEnd: boolean;
};

type Limits = {
  maxResumes: number;
  aiAnalyzePerMonth: number;
  aiAdaptPerMonth: number;
  aiAuditPerMonth: number;
  allowPdfDownload: boolean;
};

type Usage = {
  period: string;
  analyzeUsed: number;
  adaptUsed: number;
  auditUsed: number;
};

type SettingsPayload = {
  user: SettingsUser;
  plan: PlanInfo;
  usage: Usage;
  limits: Limits;
};

const PLAN_LABEL: Record<PlanCode, string> = {
  FREE: 'Grátis',
  PRO: 'Pro',
  MAX: 'Max',
};

const PLAN_PRICE: Record<PlanCode, string> = {
  FREE: 'R$ 0',
  PRO: 'R$ 19,90/mês',
  MAX: 'R$ 39,90/mês',
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SettingsPayload | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // form local
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [location, setLocation] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [allowPdf, setAllowPdf] = useState(true);

  useEffect(() => {
    fetch('/api/user/settings')
      .then((r) => r.json())
      .then((d: SettingsPayload) => {
        setData(d);
        setName(d.user.name);
        setPhone(d.user.phone ?? '');
        setJobTitle(d.user.jobTitle ?? '');
        setLocation(d.user.location ?? '');
        setLinkedinUrl(d.user.linkedinUrl ?? '');
        setAllowPdf(d.user.allowPdfDownload);
      })
      .catch(() => setToast({ type: 'error', message: 'Falha ao carregar configurações.' }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    if (!data) return;
    setSaving(true);
    setToast(null);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone: phone || null,
          jobTitle: jobTitle || null,
          location: location || null,
          linkedinUrl: linkedinUrl || null,
          allowPdfDownload: allowPdf,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Falha ao salvar');
      setData({
        ...data,
        user: {
          ...data.user,
          name: json.user.name,
          phone: json.user.phone,
          jobTitle: json.user.jobTitle,
          location: json.user.location,
          linkedinUrl: json.user.linkedinUrl,
          allowPdfDownload: json.user.allowPdfDownload,
        },
      });
      setToast({ type: 'success', message: 'Configurações salvas com sucesso.' });
    } catch (e) {
      setToast({ type: 'error', message: e instanceof Error ? e.message : 'Erro ao salvar' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando configurações...
      </div>
    );
  }

  if (!data) {
    return <p className="text-rose-600">Não foi possível carregar suas configurações.</p>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.08, 0.05)}
      className="mx-auto max-w-7xl space-y-8"
    >
      <motion.header variants={fadeUp} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            Configurações
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie sua conta, plano e recursos do ATRION.
          </p>
        </div>
        <Button onClick={handleSave} isLoading={saving} disabled={saving}>
          <Save className="h-4 w-4" /> Salvar alterações
        </Button>
      </motion.header>

      {toast && (
        <div
          className={`flex items-center gap-2 rounded-md border p-3 text-sm ${toast.type === 'success'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
            : 'border-rose-200 bg-rose-50 text-rose-800'
            }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          {toast.message}
        </div>
      )}

      <PlanSection data={data} />

      <div className="grid gap-6 md:grid-cols-2">
        <motion.div variants={fadeUp}>
          <PersonalSection
            name={name}
            setName={setName}
            phone={phone}
            setPhone={setPhone}
            jobTitle={jobTitle}
            setJobTitle={setJobTitle}
            location={location}
            setLocation={setLocation}
            linkedinUrl={linkedinUrl}
            setLinkedinUrl={setLinkedinUrl}
          />
        </motion.div>
        <motion.div variants={fadeUp}>
          <PdfSection allowPdf={allowPdf} setAllowPdf={setAllowPdf} />
        </motion.div>
      </div>

      <motion.div variants={fadeUp}>
        <AiUsageSection data={data} />
      </motion.div>
    </motion.div>
  );
}

/* ============================================================ */
/*  Secao: Plano                                                */
/* ============================================================ */
function PlanSection({ data }: { data: SettingsPayload }) {
  const { plan } = data;
  const planLabel = PLAN_LABEL[plan.code];
  const planPrice = PLAN_PRICE[plan.code];
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Erro ao carregar o portal financeiro.');
      }
      window.location.href = resData.url;
    } catch (err) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : 'Falha ao conectar com o Stripe. Tente novamente.';
      setError(errMsg);
    } finally {
      setIsPortalLoading(false);
    }
  };

  return (
    <motion.div variants={fadeUp}>
      <Card className="overflow-hidden p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Seu plano
            </h2>
            <p className="text-sm text-muted-foreground">
              Plano atual, status e próxima cobrança.
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {planLabel} · {planPrice}
          </span>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <Stat
            label="Status"
            value={
              plan.code === 'FREE'
                ? 'Grátis vitalício'
                : plan.cancelAtPeriodEnd
                  ? 'Cancelada'
                  : 'Assinatura ativa'
            }
          />
          <Stat
            label="Início do plano"
            value={plan.startedAt ? new Date(plan.startedAt).toLocaleDateString('pt-BR') : '—'}
          />
          <RenewalStat daysUntil={plan.daysUntilRenewal} renewsAt={plan.renewsAt} cancelAtPeriodEnd={plan.cancelAtPeriodEnd} />
        </div>

        {plan.code !== 'FREE' ? (
          <div className="mt-5 flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-card/50 p-5 shadow-sm transition-all hover:shadow-md">
              <div>
                <p className="text-sm font-semibold text-foreground">Gerenciamento de Assinatura</p>
                {plan.cancelAtPeriodEnd ? (
                  <p className="text-xs text-amber-600 font-medium mt-1">
                    Sua assinatura foi cancelada, mas você ainda tem acesso até o dia {plan.renewsAt ? new Date(plan.renewsAt).toLocaleDateString('pt-BR') : '—'}.
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground mt-1">
                    Altere seu plano ou gerencie sua assinatura pelo portal seguro da Stripe.
                  </p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
                <a href="/pricing" className="w-full sm:w-auto">
                  <Button variant="secondary" size="sm" className="w-full sm:w-auto">
                    Contratar um plano diferente
                  </Button>
                </a>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={handleManageSubscription}
                  disabled={isPortalLoading}
                  className="w-full sm:w-auto"
                >
                  {isPortalLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Carregando...
                    </>
                  ) : (
                    'Gerenciar Assinatura'
                  )}
                </Button>
              </div>
            </div>
            {error && <p className="text-xs text-destructive mt-1">{error}</p>}
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 p-5 shadow-sm">
            <p className="text-sm text-foreground font-medium">
              Precisa de mais currículos ou mais análises com IA?
            </p>
            <a href="/pricing">
              <Button variant="primary" size="sm">
                Ver planos de upgrade
              </Button>
            </a>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function RenewalStat({
  daysUntil,
  renewsAt,
  cancelAtPeriodEnd,
}: {
  daysUntil: number | null;
  renewsAt: string | null;
  cancelAtPeriodEnd?: boolean;
}) {
  if (daysUntil === null) {
    return <Stat label="Próxima renovação" value="Sem renovação" />;
  }
  const dateStr = renewsAt ? new Date(renewsAt).toLocaleDateString('pt-BR') : '—';
  
  if (cancelAtPeriodEnd) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-500 flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5" /> Acesso até
        </p>
        <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{daysUntil} dias</p>
        <p className="text-xs text-amber-700/80 dark:text-amber-500/80">termina em {dateStr}</p>
      </div>
    );
  }

  const tone =
    daysUntil <= 3
      ? 'text-rose-600 dark:text-rose-400'
      : daysUntil <= 10
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-emerald-600 dark:text-emerald-400';
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <CalendarClock className="h-3.5 w-3.5" /> Dias até a renovação
      </p>
      <p className={`mt-1 text-2xl font-bold ${tone}`}>{daysUntil}</p>
      <p className="text-xs text-muted-foreground">em {dateStr}</p>
    </div>
  );
}

/* ============================================================ */
/*  Secao: Dados pessoais                                       */
/* ============================================================ */
function PersonalSection(props: {
  name: string;
  setName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  jobTitle: string;
  setJobTitle: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  linkedinUrl: string;
  setLinkedinUrl: (v: string) => void;
}) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <UserIcon className="h-4 w-4 text-primary" />
        Dados pessoais
      </h2>
      <p className="text-sm text-muted-foreground">
        Edite suas informações cadastrais usadas em novos currículos.
      </p>

      <div className="mt-4 space-y-3">
        <Field label="Nome completo">
          <Input value={props.name} onChange={(e) => props.setName(e.target.value)} />
        </Field>
        <Field label="Telefone">
          <Input
            value={props.phone}
            onChange={(e) => props.setPhone(e.target.value)}
            placeholder="(65) 99999-9999"
          />
        </Field>
        <Field label="Cargo pretendido">
          <Input
            value={props.jobTitle}
            onChange={(e) => props.setJobTitle(e.target.value)}
            placeholder="Ex: Analista Financeiro"
          />
        </Field>
        <Field label="Localização">
          <Input
            value={props.location}
            onChange={(e) => props.setLocation(e.target.value)}
            placeholder="Cidade/Estado ou remoto"
          />
        </Field>
        <Field label="LinkedIn (URL completa)">
          <Input
            value={props.linkedinUrl}
            onChange={(e) => props.setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/seu-perfil"
          />
        </Field>
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1 block text-xs">{label}</Label>
      {children}
    </div>
  );
}

/* ============================================================ */
/*  Secao: PDF                                                  */
/* ============================================================ */
function PdfSection({
  allowPdf,
  setAllowPdf,
}: {
  allowPdf: boolean;
  setAllowPdf: (v: boolean) => void;
}) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold flex items-center gap-2">
        <FileDown className="h-4 w-4 text-primary" />
        Exportação em PDF
      </h2>
      <p className="text-sm text-muted-foreground">
        Defina se você pode baixar seus currículos em PDF.
      </p>

      <label className="mt-5 flex items-center justify-between rounded-md border border-border p-3 cursor-pointer hover:bg-accent/40">
        <div>
          <p className="text-sm font-medium">Permitir download de PDF</p>
          <p className="text-xs text-muted-foreground">
            Se desativado, o botão de download não aparece no editor.
          </p>
        </div>
        <input
          type="checkbox"
          checked={allowPdf}
          onChange={(e) => setAllowPdf(e.target.checked)}
          className="h-4 w-4 accent-primary"
        />
      </label>
    </Card>
  );
}

/* ============================================================ */
/*  Secao: Uso de IA                                            */
/* ============================================================ */
function AiUsageSection({ data }: { data: SettingsPayload }) {
  const { usage, limits, plan } = data;
  const periodStr = formatPeriod(usage.period);

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Uso de recursos de IA
          </h2>
          <p className="text-sm text-muted-foreground">
            Consumo do seu plano {plan.code} no período {periodStr}. Os contadores zeram
            automaticamente todo mês.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        <UsageBar
          label="Análises com IA"
          used={usage.analyzeUsed}
          limit={limits.aiAnalyzePerMonth}
        />
        <UsageBar
          label="Adaptações para vagas"
          used={usage.adaptUsed}
          limit={limits.aiAdaptPerMonth}
        />
        <UsageBar
          label="Auditorias LinkedIn"
          used={usage.auditUsed}
          limit={limits.aiAuditPerMonth}
        />
      </div>
    </Card>
  );
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const unlimited = limit === -1;
  const pct = unlimited ? 5 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  const remaining = unlimited ? '∞' : Math.max(0, limit - used);
  const tone = unlimited
    ? 'bg-emerald-500'
    : pct >= 90
      ? 'bg-rose-500'
      : pct >= 70
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {used}
          {unlimited ? ' (ilimitado)' : ` / ${limit}`} · restantes: {remaining}
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full transition-all ${tone}`}
          style={{ width: unlimited ? '100%' : `${pct}%` }}
        />
      </div>
    </div>
  );
}

function formatPeriod(period: string): string {
  // "2026-06" -> "junho/2026"
  const [year, month] = period.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}
