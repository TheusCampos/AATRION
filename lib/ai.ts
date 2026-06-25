/**
 * Wrapper de IA usando OpenRouter.
 *
 * Utiliza o SDK @openrouter/sdk
 */

import { openrouterChat } from './openrouter';

export type AIProvider = 'openrouter';

export type AIRequest = {
  systemInstruction?: string;
  userText: string;
  responseJson?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
  model?: 'google/gemini-2.5-flash' | 'google/gemini-2.5-flash-lite' | 'openrouter/free';
};

export type AIResponse = {
  text: string;
  provider: 'openrouter';
  model: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
    totalTokens?: number;
    // Metadados adicionais de provedores (nao obrigatorios)
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

/**
 * Tenta extrair e parsear um JSON valido de uma resposta de LLM,
 * mesmo que o modelo tenha incluido texto em volta (```json, prosa, etc).
 */
export function safeParseJSON<T = unknown>(text: string): T | null {
  if (!text) return null;
  // Tentativa direta
  try {
    return JSON.parse(text) as T;
  } catch {
    // Tenta encontrar o primeiro bloco {...}
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        // continua
      }
    }
    // Tenta extrair de bloco markdown ```json
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) {
      try {
        return JSON.parse(fence[1].trim()) as T;
      } catch {
        // ignora
      }
    }
    return null;
  }
}

export async function runAI(req: AIRequest): Promise<AIResponse> {
  if (!hasOpenRouter()) {
    throw new AIError('OPENROUTER_API_KEY não está configurada.');
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
    return {
      text: r.content,
      provider: 'openrouter',
      model: r.model,
      usage: r.usage,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new AIError(`[openrouter] ${msg}`, 'openrouter');
  }
}
