import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ai = new GoogleGenAI({});

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Olá! Diga uma frase curta sobre telemetria e IA para testar minha configuração do PostHog.',
    });

    return NextResponse.json({
      status: 'success',
      text: response.text,
      message: 'A chamada ao LLM foi concluída! Verifique seu dashboard de Observabilidade de IA no PostHog para ver o trace.',
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Erro na chamada do Gemini:', err);
    return NextResponse.json(
      {
        status: 'error',
        message: err.message,
        hint: 'Verifique se a variável GEMINI_API_KEY está configurada no seu .env',
      },
      { status: 500 }
    );
  }
}
