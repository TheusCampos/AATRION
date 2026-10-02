# Auditoria de LinkedIn

O usuário cola o texto do perfil e pode complementar com URL, área e vaga alvo. Também pode extrair texto de PDF pelo endpoint próprio.

1. A API valida o texto, aplica rate limit e confere cota de auditoria.
2. O conteúdo passa por sanitização e verificação de prompt injection.
3. Gemini/OpenRouter produz um JSON estruturado; há tentativa de fallback quando o parse falha.
4. O resultado é salvo em `LinkedInAudit` e devolvido no mesmo request.
5. Auditorias anteriores podem ser consultadas ou excluídas pelo usuário autenticado.

Não há scraping automático de LinkedIn ou processamento assíncrono no código atual.