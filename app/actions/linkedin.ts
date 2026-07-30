'use server';

export async function fetchLinkedInPublicData(url: string) {
  try {
    if (!url.includes('linkedin.com/in/')) {
      return { success: false, reason: 'invalid_url', message: 'Por favor, insira uma URL válida de perfil do LinkedIn.' };
    }

    // Usando Jina Reader (r.jina.ai) para contornar bloqueios básicos do LinkedIn
    // Ele renderiza a página em um headless browser e devolve Markdown limpo.
    const jinaUrl = `https://r.jina.ai/${url}`;
    
    const res = await fetch(jinaUrl, {
      headers: {
        'Accept': 'text/plain',
        'X-Return-Format': 'markdown',
      },
      // Evitar cache agressivo para tentar contornar bloqueios em novas requisições
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 402 || res.status === 429) {
        return { success: false, reason: 'rate_limit', message: 'Serviço de extração sobrecarregado. Por favor, cole o texto manualmente.' };
      }
      return { success: false, reason: 'blocked', message: 'O LinkedIn bloqueou o acesso automático ao seu perfil. Para uma auditoria, cole o texto abaixo.' };
    }

    const markdownText = await res.text();

    // Jina pode retornar a página de Login do LinkedIn se for bloqueado
    if (
      markdownText.includes('Sign in to LinkedIn') || 
      markdownText.includes('Join LinkedIn') || 
      markdownText.includes('authwall') ||
      markdownText.toLowerCase().includes('security check')
    ) {
      return { success: false, reason: 'blocked', message: 'O LinkedIn exigiu login de segurança para ver o perfil. Por favor, cole o texto manualmente.' };
    }

    const cleanText = markdownText.trim();

    if (cleanText.length < 100) {
        return { success: false, reason: 'too_short', message: 'Poucas informações públicas disponíveis. Cole o texto completo para uma análise precisa.' };
    }

    return { success: true, text: cleanText };
  } catch (error) {
    console.error('Error fetching LinkedIn:', error);
    return { success: false, reason: 'error', message: 'Falha na conexão ao extrair o perfil.' };
  }
}
