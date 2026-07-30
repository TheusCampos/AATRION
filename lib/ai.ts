import { openrouterChat } from './openrouter';
import { captureServerEvent } from './posthog-server';

export type AIProvider = 'openrouter';

export type AIRequest = {
  systemInstruction?: string;
  userText: string;
  responseJson?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
  model?: 'google/gemini-2.5-flash' | 'google/gemini-2.5-flash-lite' | 'openai/gpt-4o-mini' | 'openrouter/free';
};

export type AIResponse = {
  text: string;
  provider: 'openrouter';
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
    reasoningTokens?: number;
  };
};

export class AIError extends Error {
  provider?: 'openrouter';
  constructor(message: string, provider?: 'openrouter') {
    super(message);
    this.name = 'AIError';
    this.provider = provider;
  }
}

function hasOpenRouter(): boolean {
  return !!process.env.OPENROUTER_API_KEY;
}

export function safeParseJSON<T = unknown>(text: string): T | null {
  if (!text) return null;
  
  // Limpeza básica: remove caracteres de controle indesejados (mantendo tabs, espaços, newlines escapados ou literais fora das aspas, etc)
  // Substitui newlines não escapados DENTRO do JSON por um espaço ou escapa eles.
  // Como isso é arriscado com regex simples, vamos focar em fazer o parse e, se falhar, logar o erro.
  const cleanText = text;

  try {
    return JSON.parse(cleanText) as T;
  } catch (e: unknown) {
    const match = cleanText.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch (e2: unknown) {
        const msg = e2 instanceof Error ? e2.message : String(e2);
        console.error('[safeParseJSON] Erro no match regex 1:', msg);
      }
    }
    const fence = cleanText.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) {
      try {
        return JSON.parse(fence[1].trim()) as T;
      } catch (e3: unknown) {
        const msg = e3 instanceof Error ? e3.message : String(e3);
        console.error('[safeParseJSON] Erro no match regex 2 (fence):', msg);
      }
    }
    const originalMsg = e instanceof Error ? e.message : String(e);
    console.error('[safeParseJSON] Falha total ao parsear JSON. Erro original:', originalMsg);
    
    // Tentar higienizar quebras de linha literais dentro das aspas (problema comum de LLMs)
    try {
      const sanitized = cleanText.replace(/\\n/g, "\\n")
                                 .replace(/\\'/g, "\\'")
                                 .replace(/\\"/g, '\\"')
                                 .replace(/\\&/g, "\\&")
                                 .replace(/\\r/g, "\\r")
                                 .replace(/\\t/g, "\\t")
                                 .replace(/\\b/g, "\\b")
                                 .replace(/\\f/g, "\\f");
      // Substituir quebras de linha reais por espaço apenas se o JSON.parse falhou
      const noNewlines = sanitized.replace(/[\n\r]+/g, " ");
      return JSON.parse(noNewlines) as T;
    } catch (e4: unknown) {
      const msg = e4 instanceof Error ? e4.message : String(e4);
      console.error('[safeParseJSON] Falha na tentativa de higienização extrema:', msg);
      // Salva o json com erro num log para podermos ver
      console.error('[safeParseJSON] JSON COMPLETO COM ERRO:', cleanText);
    }
    
    return null;
  }
}

export async function runAI(req: AIRequest): Promise<AIResponse> {
  const startTime = performance.now();
  const selectedModel = req.model || 'google/gemini-2.5-flash';

  if (!hasOpenRouter()) {
    const err = new AIError('OPENROUTER_API_KEY não está configurada.');
    captureServerEvent(null, 'ai_request_failed', {
      provider: 'openrouter',
      model: selectedModel,
      error: err.message,
    });
    throw err;
  }

  const MAX_TEXT_LENGTH = 45000;
  if (req.userText.length > MAX_TEXT_LENGTH) {
    const err = new AIError(`Texto do usuário excede o limite de segurança (${MAX_TEXT_LENGTH} caracteres).`);
    captureServerEvent(null, 'ai_request_failed', {
      provider: 'openrouter',
      model: selectedModel,
      error: err.message,
    });
    throw err;
  }

  try {
    const r = await openrouterChat({
      model: req.model,
      messages: [
        ...(req.systemInstruction
          ? [{ role: 'system' as const, content: req.systemInstruction }]
          : []),
        { role: 'user' as const, content: req.userText },
      ],
      temperature: req.temperature,
      max_tokens: req.maxOutputTokens,
      response_format: req.responseJson ? { type: 'json_object' } : undefined,
    });

    const durationMs = Math.round(performance.now() - startTime);

    // Registrar metricas da IA no PostHog
    captureServerEvent(null, 'ai_request_completed', {
      provider: 'openrouter',
      model: r.model || selectedModel,
      duration_ms: durationMs,
      prompt_tokens: r.usage?.prompt_tokens,
      completion_tokens: r.usage?.completion_tokens,
      total_tokens: r.usage?.total_tokens,
      response_json: !!req.responseJson,
    });

    return {
      text: r.content,
      provider: 'openrouter',
      model: r.model,
      usage: r.usage,
    };
  } catch (err) {
    const durationMs = Math.round(performance.now() - startTime);
    const msg = err instanceof Error ? err.message : String(err);

    captureServerEvent(null, 'ai_request_failed', {
      provider: 'openrouter',
      model: selectedModel,
      duration_ms: durationMs,
      error: msg,
    });

    throw new AIError(`[openrouter] ${msg}`, 'openrouter');
  }
}

