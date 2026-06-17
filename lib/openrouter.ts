import { OpenRouter } from "@openrouter/sdk";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: string | any[];
};

export type ChatRequest = {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
};

export type ChatResponse = {
  id: string;
  model: string;
  content: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
};

const DEFAULT_MODEL = 'openrouter/free';

function getApiKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error('OPENROUTER_API_KEY nao configurada no .env');
  }
  return key;
}

export async function openrouterChat(req: ChatRequest): Promise<ChatResponse> {
  const apiKey = getApiKey();
  const model = req.model || DEFAULT_MODEL;

  const openrouter = new OpenRouter({
    apiKey: apiKey
  });

  const response = await openrouter.chat.send({
    chatRequest: {
      model: model,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      messages: req.messages as any,
      temperature: req.temperature ?? 0.7,
      maxTokens: req.max_tokens ?? 2048,
      ...(req.response_format ? { responseFormat: req.response_format } : {}),
    }
  });

  const messageContent = response.choices?.[0]?.message?.content ?? '';
  // Convert content to string if it happens to be null or another type
  const textContent = typeof messageContent === 'string' ? messageContent : String(messageContent);

  return {
    id: response.id || '',
    model: response.model || model,
    content: textContent,
    usage: response.usage as ChatResponse['usage'],
  };
}
