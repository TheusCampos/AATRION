# Pasta `components/`

Componentes React reutilizáveis, organizados por domínio.

## Estrutura prevista

```
components/
├── ui/                       # Base shadcn/ui (Button, Input, Card, Dialog, ...)
├── editor/                   # Componentes do editor de currículo
│   ├── StepNav.tsx
│   ├── steps/
│   │   ├── PersonalStep.tsx
│   │   ├── ExperienceStep.tsx
│   │   ├── EducationStep.tsx
│   │   ├── SkillsStep.tsx
│   │   ├── ProjectsStep.tsx
│   │   ├── LanguagesStep.tsx
│   │   └── CertificationsStep.tsx
│   ├── ResumePreview.tsx
│   ├── ATSScorePanel.tsx
│   └── AIAssistPanel.tsx
├── ats/                      # Painel ATS Score (gauge, breakdown, issues)
├── linkedin/                 # Componentes da auditoria LinkedIn
├── resume-templates/         # Templates HTML para Puppeteer (Classic, Modern, ...)
├── applications/             # Kanban tracker
├── shared/                   # Header, Sidebar, Footer, etc.
└── marketing/                # Componentes da landing page
```

> Cada subpasta ganha um `index.ts` (barrel export) à medida que crescer.
