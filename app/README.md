# Pasta `app/`

Diretório principal do **Next.js 14 App Router**.

## Estrutura prevista

```
app/
├── (marketing)/              # Páginas públicas (landing, pricing, blog, templates SEO)
│   ├── page.tsx              # Landing page
│   ├── pricing/page.tsx
│   ├── blog/[slug]/page.tsx
│   └── templates/[id]/page.tsx
├── (auth)/                   # Login, cadastro, MFA, verificação
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── verify-email/page.tsx
│   └── mfa/page.tsx
├── (app)/                    # Área autenticada (com sidebar)
│   ├── layout.tsx
│   ├── dashboard/page.tsx
│   ├── editor/[id]/page.tsx
│   ├── editor/[id]/versions/page.tsx
│   ├── ats/[id]/page.tsx
│   ├── linkedin/page.tsx
│   ├── linkedin/[auditId]/page.tsx
│   ├── applications/page.tsx
│   ├── templates/page.tsx
│   └── profile/page.tsx
├── api/                      # API Routes (REST)
│   ├── auth/[...all]/route.ts
│   ├── resumes/...
│   ├── ats/analyze/route.ts
│   ├── ai/...
│   ├── linkedin/...
│   ├── pdf/generate/route.ts
│   ├── upload/route.ts
│   ├── stripe/...
│   └── applications/route.ts
└── cv/[slug]/page.tsx        # Página pública do currículo (Pro)
```

> Criar conforme o desenvolvimento das funcionalidades avançar. Detalhes completos
> na [arquitetura](../docs/architecture/folder-structure.md).
