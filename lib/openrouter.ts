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

const DEFAULT_MODEL = 'google/gemini-2.5-flash';

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

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'ATRION CVForge'
    },
    body: JSON.stringify({
      model: model,
      messages: req.messages,
      temperature: req.temperature ?? 0.7,
      max_tokens: req.max_tokens ?? 2048,
      ...(req.response_format ? { response_format: req.response_format } : {}),
    })
  });

  const data = await response.json();

  if (!response.ok || data.error) {
    const errorMsg = data.error?.message || response.statusText;
    throw new Error(`OpenRouter Error: ${errorMsg}`);
  }

  const messageContent = data.choices?.[0]?.message?.content ?? '';
  const textContent = typeof messageContent === 'string' ? messageContent : String(messageContent);

  return {
    id: data.id || '',
    model: data.model || model,
    content: textContent,
    usage: data.usage as ChatResponse['usage'],
  };
}
