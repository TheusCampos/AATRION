/**
 * lib/sanitize.ts
 * SEC-06: Sanitizacao centralizada de inputs para prevenir:
 *   - Prompt Injection (manipulacao de comportamento de IA)
 *   - XSS (Cross-Site Scripting)
 *   - Jailbreak attempts
 *
 * Use em TODAS as rotas de IA antes de incluir dados do usuario nos prompts.
 */

// ============================================================
// 1. SANITIZACAO ANTI-PROMPT INJECTION
// ============================================================

/**
 * Padroes de Prompt Injection e jailbreak conhecidos.
 * Nota: NUNCA usar flag /g aqui, pois RegExp.test() mantem lastIndex entre chamadas.
 */
const PROMPT_INJECTION_PATTERNS: RegExp[] = [
  // Tentativas de ignorar instrucoes anteriores (EN)
  /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|context|rules?)/i,
  /forget\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|context)/i,
  /disregard\s+(all\s+)?(previous|prior|above)/i,
  /ignore\s+your\s+(instructions?|system\s+prompt|training)/i,

  // Tokens de controle de modelos LLM (delimitadores de turno)
  /<\|im_start\|>/i,
  /<\|im_end\|>/i,
  /<\|endoftext\|>/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<<SYS>>/i,
  /###\s*(System|Human|Assistant|AI|User)\s*:/i,

  // Injecao de roles/personas
  /you\s+are\s+now\s+(an?\s+)?(AI|assistant|model|bot|DAN|jailbreak|unrestricted)/i,
  /act\s+as\s+(if\s+you\s+are\s+)?(an?\s+)?(unrestricted|unfiltered|jailbreak)/i,
  /DAN\s+mode/i,
  /developer\s+mode/i,
  /jailbreak\s+mode/i,

  // Exfiltracao de system prompt
  /print\s+(your\s+)?(system\s+prompt|instructions?|rules?|configuration)/i,
  /reveal\s+(your\s+)?(hidden\s+)?(system\s+prompt|instructions?|rules?|configuration|prompt)/i,
  /show\s+me\s+(your\s+)?(system\s+prompt|internal\s+instructions?)/i,

  // Injecoes em PT-BR (avaliadas sobre texto com diacríticos normalizados)
  /(?:ignore|esquec(?:a|er)|desconsidere)\s+(?:tod[ao]s?\s+)?(?:[ao]s?\s+)?(?:instruco(?:es|ao)|regras?|contexto|comandos?|prompts?)/i,
  /(?:ignore|esquec(?:a|er)|desconsidere)\s+(?:tudo|qualquer\s+(?:regra|instrucao))/i,
  /voce\s+agora\s+e\s+(uma?\s+)?(?:IA|assistente|bot|modelo)\s+sem\s+(restrico(?:es|ao)|limites?|filtros?)/i,
  /finja\s+que\s+voce\s+e/i,
  /aja\s+como\s+se\s+voce\s+fosse/i,
];

/**
 * Detecta se um texto contem tentativas de Prompt Injection.
 * Normaliza caracteres e diacríticos (restando sem acentos) para evitar evasão.
 */
export function hasPromptInjection(text: string): boolean {
  if (!text || typeof text !== 'string') return false;
  // Normalizar removendo acentos para matching consistente (ex: Esqueça -> esqueca)
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(text) || pattern.test(normalized));
}

/**
 * Sanitiza texto do usuario para uso seguro em prompts de IA.
 * Nao remove conteudo legitimo — apenas marca limites e remove tokens perigosos.
 */
export function sanitizeForAI(text: string, maxLength = 10_000): string {
  if (!text || typeof text !== 'string') return '';

  let sanitized = text;

  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  // Remove tokens de controle de modelos LLM
  sanitized = sanitized
    .replace(/<\|im_start\|>/gi, '[IM_START_BLOCKED]')
    .replace(/<\|im_end\|>/gi, '[IM_END_BLOCKED]')
    .replace(/<\|endoftext\|>/gi, '[EOT_BLOCKED]')
    .replace(/\[INST\]/gi, '[INST_BLOCKED]')
    .replace(/\[\/INST\]/gi, '[/INST_BLOCKED]')
    .replace(/<<SYS>>/gi, '[SYS_BLOCKED]');

  // Remove null bytes
  sanitized = sanitized.replace(/\x00/g, '');

  return sanitized.trim();
}

/**
 * Sanitiza campo de texto curto (nome, cargo, empresa, etc.)
 */
export function sanitizeTextField(text: string, maxLength = 500): string {
  if (!text || typeof text !== 'string') return '';

  return text
    .replace(/<[^>]+>/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:/gi, '')
    .replace(/\x00/g, '')
    .slice(0, maxLength)
    .trim();
}

/**
 * Valida e sanitiza uma URL. Aceita apenas https:// e http://.
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return '';
    return trimmed;
  } catch {
    return '';
  }
}

/**
 * Remove HTML perigoso server-side (sem DOM/DOMPurify).
 */
export function sanitizeHtml(html: string, maxLength = 50_000): string {
  if (!html || typeof html !== 'string') return '';

  let text = html.slice(0, maxLength);

  text = text
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*>/gi, '');

  text = text.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  text = text.replace(/\s+on\w+\s*=\s*[^\s>]*/gi, '');
  text = text.replace(/javascript\s*:/gi, '');
  text = text.replace(/data\s*:/gi, '');
  text = text.replace(/<[^>]+>/g, ' ');

  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');

  return text.replace(/\s+/g, ' ').trim();
}
