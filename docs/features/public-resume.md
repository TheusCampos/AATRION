# Link Público do Currículo

> Permite ao usuário Pro compartilhar o currículo via uma URL pública
> personalizada (slug), com analytics básico.

## Visão Geral

| Aspecto | Detalhe |
|---|---|
| **Feature gate** | Pro (Mensal e Anual) |
| **URL pública** | `cvforge.com.br/cv/[slug]` |
| **Tela de gestão** | `app/(app)/profile/page.tsx` → aba "Compartilhar" |
| **Página pública** | `app/cv/[slug]/page.tsx` |
| **Schema DB** | `Resume.slug` + `Resume.isPublic` + `Resume.viewCount` |

## Slug

- **Formato:** `[a-z0-9-]{3,40}` (kebab-case)
- **Unicidade:** global, validado via `unique` no Prisma
- **Reserva:** bloquear slugs reservados (`/admin`, `/api`, `/login`, `/pricing`, `me`, `cv`, etc.)
- **Auto-sugestão:** ao tornar público, gerar sugestões baseadas no nome (`joao-silva-desenvolvedor`)

## Página Pública

Renderização server-side (SSG com revalidação diária):

```tsx
// app/cv/[slug]/page.tsx
export const revalidate = 86400; // 1 dia

export default async function PublicResumePage({ params }) {
  const resume = await prisma.resume.findUnique({
    where: { slug: params.slug, isPublic: true },
    include: { user: { select: { name: true, image: true } } },
  });
  if (!resume) notFound();

  // Incrementar viewCount de forma assíncrona
  await incrementViewCount(resume.id);

  return <PublicResumeTemplate content={resume.content} />;
}
```

## Funcionalidades da Página Pública

| Feature | Plano |
|---|:---:|
| Render do currículo em template selecionado | ✅ |
| Download PDF do currículo | ✅ |
| Botão "Enviar mensagem ao candidato" (mailto) | ✅ |
| Analytics: visualizações, downloads, fontes | ✅ Pro |
| Custom domain (V2+) | ⏳ V3 |

## Privacidade

- **Nada de informação de contato pessoal** (email, telefone) na página pública
- Apenas: nome, foto, headline, currículo completo, botão "Entrar em contato" (mailto genérico do usuário)
- **Opt-out:** `isPublic = false` desabilita imediatamente (sem cache stale)
- **View count** é incrementado mas **IP/UA não são armazenados** (apenas referrer agregado)

## Analytics (Pro)

Dashboard em `/profile/analytics` mostra:

| Métrica | Visualização |
|---|---|
| Visualizações totais | Linha temporal 30d |
| Visualizações únicas (cookie) | Estimativa por dia |
| Downloads de PDF | Contador |
| Referrers | Lista: `linkedin.com`, `direct`, `whatsapp://`, etc. |
| Top países | Tabela |

## SEO

A página pública:
- Tem `<title>` próprio: `{Nome} — {Cargo}`
- Tem OG image gerada (preview do CV em miniatura)
- É indexável (com `noindex` opcional se usuário preferir)
- Tem `rel="canonical"` para evitar duplicação

## Edge Cases

1. **Slug já existe** → sugerir variações
2. **Currículo deletado** → `isPublic = false` automaticamente (cascade)
3. **User downgrade Free** → `isPublic = false` em todos os currículos + aviso
4. **Tentativa de scraping em massa** → rate limit por IP + Turnstile no download
5. **Conteúdo inadequado detectado** → fila de moderação + email ao dono
